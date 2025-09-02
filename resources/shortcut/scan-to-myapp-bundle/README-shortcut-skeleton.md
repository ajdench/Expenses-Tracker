# Shortcut skeleton (signed-file instructions)

- `scan-to-myapp.skeleton.wflow` – a Shortcuts skeleton with comment markers.
- `PLACEHOLDER-drop-your-signed-file-here.txt` – put your signed `.shortcut` here after signing on macOS.

### Sign on macOS
```bash
shortcuts sign -i "shortcuts/scan-to-myapp.skeleton.wflow" -o "shortcuts/Scan to MyApp.shortcut"
open "shortcuts/Scan to MyApp.shortcut"   # optional: verify on Mac
```

Distribute via AirDrop/iCloud or host the signed file on GitHub and share:
```
shortcuts://import-shortcut?name=Scan%20to%20MyApp&url=YOUR_GITHUB_RAW_URL
```
