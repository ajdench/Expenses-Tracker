// Lightweight image edge adjust editor with OpenCV.js (optional) and Interact.js (optional)
// Exposes: window.openReceiptEdgeEditor(blob, options) => Promise<Blob>

(function(){
  const DEFAULTS = {
    autoDetect: true,           // try OpenCV quadrilateral detection
    dragEngine: 'pointer',      // 'pointer' | 'interact'
    warpEngine: 'opencv',       // 'opencv' | 'canvas' (canvas = axis-aligned fallback)
    maxLongSide: 2000           // cap output size
  };

  function createEl(tag, attrs={}, children=[]) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'class') el.className = v; else if (k === 'style') Object.assign(el.style, v); else el.setAttribute(k, v);
    });
    children.forEach(c => el.appendChild(c));
    return el;
  }

  async function decodeImageToBitmap(blob) {
    if (window.createImageBitmap) return await createImageBitmap(blob);
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  function fitRect(w, h, maxLongSide) {
    const long = Math.max(w,h);
    const scale = long > maxLongSide ? maxLongSide/long : 1;
    return { w: Math.round(w*scale), h: Math.round(h*scale), scale };
  }

  function drawLoupe(ctx, imgCanvas, x, y, scale=2, r=36) {
    const sx = Math.max(0, Math.min(imgCanvas.width-1, x));
    const sy = Math.max(0, Math.min(imgCanvas.height-1, y));
    ctx.save();
    ctx.beginPath();
    ctx.arc(x+ r + 10, y - r - 10, r, 0, Math.PI*2);
    ctx.clip();
    ctx.drawImage(imgCanvas, sx - r/scale, sy - r/scale, (2*r)/scale, (2*r)/scale, x+10, y - 2*r - 10, 2*r, 2*r);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x+ r + 10, y - r - 10, r, 0, Math.PI*2);
    ctx.strokeStyle = '#198754';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  async function detectQuadOpenCV(imgCanvas) {
    if (!window.cv || !cv.Mat) return null;
    const src = cv.imread(imgCanvas);
    try {
      const gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      const blur = new cv.Mat();
      cv.GaussianBlur(gray, blur, new cv.Size(5,5), 0);
      const edges = new cv.Mat();
      cv.Canny(blur, edges, 50, 150);
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
      let best = null; let bestArea = 0;
      const approx = new cv.Mat();
      for (let i=0; i<contours.size(); i++) {
        const c = contours.get(i);
        const peri = cv.arcLength(c, true);
        cv.approxPolyDP(c, approx, 0.02*peri, true);
        if (approx.rows === 4) {
          const area = cv.contourArea(approx);
          if (area > bestArea) {
            bestArea = area;
            best = [];
            for (let j=0; j<4; j++) best.push({ x: approx.intPtr(j,0)[0], y: approx.intPtr(j,0)[1] });
          }
        }
        c.delete();
      }
      approx.delete(); contours.delete(); hierarchy.delete(); edges.delete(); blur.delete(); gray.delete();
      if (!best) return null;
      // order points TL, TR, BR, BL
      best.sort((a,b)=> a.y===b.y ? a.x-b.x : a.y-b.y);
      const [p0,p1,p2,p3] = best;
      // top two: p0,p1 (sort x), bottom two: p2,p3 (sort x)
      const top = [p0,p1].sort((a,b)=>a.x-b.x);
      const bot = [p2,p3].sort((a,b)=>a.x-b.x);
      return [top[0], top[1], bot[1], bot[0]]; // TL, TR, BR, BL
    } finally {
      src.delete();
    }
  }

  function drawOverlay(ctx, pts) {
    ctx.save();
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i=1;i<4;i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
    pts.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI*2);
      ctx.fillStyle = '#198754';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    ctx.restore();
  }

  async function warpOpenCV(srcCanvas, pts, maxLongSide) {
    const w = srcCanvas.width, h = srcCanvas.height;
    const widthA = Math.hypot(pts[2].x-pts[3].x, pts[2].y-pts[3].y);
    const widthB = Math.hypot(pts[1].x-pts[0].x, pts[1].y-pts[0].y);
    const maxW = Math.max(widthA, widthB);
    const heightA = Math.hypot(pts[1].x-pts[2].x, pts[1].y-pts[2].y);
    const heightB = Math.hypot(pts[0].x-pts[3].x, pts[0].y-pts[3].y);
    const maxH = Math.max(heightA, heightB);
    let outW = Math.round(maxW), outH = Math.round(maxH);
    const fit = fitRect(outW, outH, maxLongSide);
    outW = fit.w; outH = fit.h;
    const src = cv.imread(srcCanvas);
    const dst = new cv.Mat();
    const dsize = new cv.Size(outW, outH);
    const srcTri = cv.matFromArray(4,1,cv.CV_32FC2, [pts[0].x,pts[0].y, pts[1].x,pts[1].y, pts[2].x,pts[2].y, pts[3].x,pts[3].y]);
    const dstTri = cv.matFromArray(4,1,cv.CV_32FC2, [0,0, outW,0, outW,outH, 0,outH]);
    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(src, dst, M, dsize, cv.INTER_CUBIC, cv.BORDER_REPLICATE, new cv.Scalar());
    const out = createEl('canvas'); out.width = outW; out.height = outH;
    cv.imshow(out, dst);
    src.delete(); dst.delete(); srcTri.delete(); dstTri.delete(); M.delete();
    return out;
  }

  function warpCanvasAxisAligned(srcCanvas, pts, maxLongSide) {
    const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
    const x0 = Math.max(0, Math.min(...xs)), x1 = Math.min(srcCanvas.width, Math.max(...xs));
    const y0 = Math.max(0, Math.min(...ys)), y1 = Math.min(srcCanvas.height, Math.max(...ys));
    const w = Math.max(1, Math.round(x1-x0)), h = Math.max(1, Math.round(y1-y0));
    const fit = fitRect(w,h,maxLongSide);
    const out = createEl('canvas'); out.width=fit.w; out.height=fit.h;
    const ctx = out.getContext('2d');
    ctx.drawImage(srcCanvas, x0,y0,w,h, 0,0,fit.w,fit.h);
    return out;
  }

  async function openReceiptEdgeEditor(blob, options={}) {
    const cfg = { ...DEFAULTS, ...(options||{}) };
    // Build modal overlay
    const wrap = createEl('div', { class: 'edge-editor-wrap' });
    const toolbar = createEl('div', { class: 'edge-editor-toolbar' });
    const btnCancel = createEl('button', { class: 'btn btn-secondary' }); btnCancel.textContent = 'Cancel';
    const btnReset = createEl('button', { class: 'btn btn-secondary' }); btnReset.textContent = 'Reset';
    const btnApply = createEl('button', { class: 'btn btn-custom-green' }); btnApply.textContent = 'Apply';
    toolbar.append(btnCancel, btnReset, btnApply);
    const stage = createEl('div', { class: 'edge-editor-stage' });
    const base = createEl('canvas', { class: 'edge-editor-canvas' });
    const overlay = createEl('canvas', { class: 'edge-editor-overlay' });
    const btnRotate = createEl('button', { class: 'btn btn-secondary' }); btnRotate.textContent = 'Rotate 90°';
    toolbar.insertBefore(btnRotate, btnApply);
    stage.append(base, overlay);
    wrap.append(toolbar, stage);
    document.body.appendChild(wrap);

    const img = await decodeImageToBitmap(blob);
    const fit = fitRect(img.width, img.height, Math.max(cfg.maxLongSide, 1200));
    base.width = fit.w; base.height = fit.h; overlay.width = fit.w; overlay.height = fit.h;
    const bctx = base.getContext('2d'); bctx.drawImage(img, 0,0, base.width, base.height);
    const octx = overlay.getContext('2d');

    // View transform (pan/zoom)
    let zoom = 1;
    let panX = 0, panY = 0;
    function applyViewTransform() {
      const t = `translate(${panX}px, ${panY}px) scale(${zoom})`;
      base.style.transform = t;
      overlay.style.transform = t;
      overlay.style.transformOrigin = '0 0';
      base.style.transformOrigin = '0 0';
    }
    applyViewTransform();

    // detection (optional)
    let pts = [
      { x: base.width*0.1, y: base.height*0.1 },
      { x: base.width*0.9, y: base.height*0.1 },
      { x: base.width*0.9, y: base.height*0.9 },
      { x: base.width*0.1, y: base.height*0.9 }
    ];
    if (cfg.autoDetect) {
      try {
        if (cfg.warpEngine === 'opencv') await (window._libLoaders?.loadOpenCV?.());
        const det = await detectQuadOpenCV(base);
        if (det && det.length === 4) pts = det;
      } catch (e) { console.warn('OpenCV detect failed', e); }
    }

    function render() {
      octx.clearRect(0,0,overlay.width, overlay.height);
      drawOverlay(octx, pts);
    }
    render();

    // Drag handles
    let dragging = -1;
    function toCanvasCoords(clientX, clientY) {
      const r = overlay.getBoundingClientRect();
      // boundingClientRect already includes CSS transforms; do not subtract panX/panY
      const x = (clientX - r.left) / zoom;
      const y = (clientY - r.top) / zoom;
      return { x, y };
    }
    function hitTest(x,y) {
      for (let i=0;i<4;i++) {
        const dx = x-pts[i].x, dy = y-pts[i].y;
        if (dx*dx+dy*dy <= 12*12) return i;
      }
      return -1;
    }
    let panning = false;
    function onDown(e){ const {x,y} = toCanvasCoords(e.clientX, e.clientY); dragging = hitTest(x,y); if (dragging<0) { panning = true; lastPan = { cx: e.clientX, cy: e.clientY }; } if (dragging>=0) e.preventDefault(); }
    function onMove(e){
      if (dragging>=0) {
        const {x,y} = toCanvasCoords(e.clientX, e.clientY);
        pts[dragging].x = Math.max(0, Math.min(overlay.width, x));
        pts[dragging].y = Math.max(0, Math.min(overlay.height, y));
        render(); drawLoupe(octx, base, pts[dragging].x, pts[dragging].y);
      } else if (panning && !pinching) {
        panX += (e.clientX - lastPan.cx);
        panY += (e.clientY - lastPan.cy);
        lastPan = { cx: e.clientX, cy: e.clientY };
        applyViewTransform();
      }
    }
    function onUp(){ dragging=-1; panning=false; render(); }

    if (cfg.dragEngine === 'interact') {
      try { await (window._libLoaders?.loadInteract?.()); } catch {}
    }
    // Pointer events fallback (keeps bundle small)
    overlay.addEventListener('pointerdown', onDown);
    overlay.addEventListener('pointermove', onMove);
    overlay.addEventListener('pointerup', onUp);
    overlay.addEventListener('pointercancel', onUp);

    // Pinch zoom (two pointers) and wheel zoom
    let pinching = false; let lastDist = 0; let lastMid = null; let lastPan = { cx:0, cy:0 };
    const active = new Map();
    overlay.addEventListener('pointerdown', (e)=>{ overlay.setPointerCapture(e.pointerId); active.set(e.pointerId, {x:e.clientX,y:e.clientY}); if (active.size===2) { pinching=true; const ptsArr=[...active.values()]; lastDist = Math.hypot(ptsArr[0].x-ptsArr[1].x, ptsArr[0].y-ptsArr[1].y); lastMid = { x:(ptsArr[0].x+ptsArr[1].x)/2, y:(ptsArr[0].y+ptsArr[1].y)/2 }; }});
    overlay.addEventListener('pointermove', (e)=>{ if (!active.has(e.pointerId)) return; active.set(e.pointerId, {x:e.clientX,y:e.clientY}); if (pinching) { const ptsArr=[...active.values()]; const dist = Math.hypot(ptsArr[0].x-ptsArr[1].x, ptsArr[0].y-ptsArr[1].y); const mid = { x:(ptsArr[0].x+ptsArr[1].x)/2, y:(ptsArr[0].y+ptsArr[1].y)/2 }; const factor = dist/lastDist || 1; const prevZoom = zoom; zoom = Math.max(0.5, Math.min(4, zoom * factor)); // keep midpoint stable
        // adjust pan so that canvas point under midpoint stays under midpoint after zoom
        const r = overlay.getBoundingClientRect(); const mx = mid.x - r.left; const my = mid.y - r.top;
        panX = mx - (mx - panX) * (zoom/prevZoom);
        panY = my - (my - panY) * (zoom/prevZoom);
        lastDist = dist; lastMid = mid; applyViewTransform(); }
    });
    overlay.addEventListener('pointerup', (e)=>{ active.delete(e.pointerId); if (active.size<2) pinching=false; });
    overlay.addEventListener('pointercancel', (e)=>{ active.delete(e.pointerId); if (active.size<2) pinching=false; });
    overlay.addEventListener('wheel', (e)=>{ e.preventDefault(); const delta = -Math.sign(e.deltaY) * 0.1; const prevZoom = zoom; const newZoom = Math.max(0.5, Math.min(4, zoom + delta)); const r = overlay.getBoundingClientRect(); const mx = e.clientX - r.left; const my = e.clientY - r.top; panX = mx - (mx - panX) * (newZoom/prevZoom); panY = my - (my - panY) * (newZoom/prevZoom); zoom = newZoom; applyViewTransform(); }, { passive: false });

    // Escape key to cancel
    const onKey = (e) => { if (e.key === 'Escape') { btnCancel.click(); } };
    document.addEventListener('keydown', onKey);

    // Rotate 90° clockwise
    btnRotate.onclick = () => {
      // rotate base image and overlay points around canvas origin
      const src = createEl('canvas'); src.width = base.width; src.height = base.height; src.getContext('2d').drawImage(base,0,0);
      const newW = base.height, newH = base.width;
      base.width = newW; base.height = newH; overlay.width = newW; overlay.height = newH;
      // draw rotated
      const ctx = base.getContext('2d'); ctx.save(); ctx.translate(newW,0); ctx.rotate(Math.PI/2); ctx.drawImage(src,0,0); ctx.restore();
      // rotate points: (x,y) -> (h - y, x)
      const oldW = src.width, oldH = src.height; pts = pts.map(p=>({ x: oldH - p.y, y: p.x }));
      // reset view transform to fit
      zoom = 1; panX = 0; panY = 0; applyViewTransform(); render();
    };

    const done = (res, resolve) => { overlay.removeEventListener('pointerdown', onDown); overlay.removeEventListener('pointermove', onMove); overlay.removeEventListener('pointerup', onUp); overlay.removeEventListener('pointercancel', onUp); document.removeEventListener('keydown', onKey); document.body.removeChild(wrap); resolve(res); };

    return new Promise((resolve, reject) => {
      btnCancel.onclick = () => done(null, resolve);
      btnReset.onclick = async () => {
        try { if (cfg.warpEngine === 'opencv') await (window._libLoaders?.loadOpenCV?.()); const det = await detectQuadOpenCV(base); if (det) { pts = det; render(); } } catch {}
      };
      btnApply.onclick = async () => {
        try {
          let out;
          if (cfg.warpEngine === 'opencv') {
            await (window._libLoaders?.loadOpenCV?.());
            out = await warpOpenCV(base, pts, cfg.maxLongSide);
          } else {
            out = warpCanvasAxisAligned(base, pts, cfg.maxLongSide);
          }
          out.toBlob(b => done(b, resolve), 'image/jpeg', 0.9);
        } catch (e) { console.error('warp failed', e); alert('Failed to process image'); }
      };
    });
  }

  window.openReceiptEdgeEditor = openReceiptEdgeEditor;
})();
