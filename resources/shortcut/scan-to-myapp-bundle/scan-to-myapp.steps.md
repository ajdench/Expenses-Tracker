# Build Sheet – “Scan to MyApp” (exact actions & order)

Open **Shortcuts** → **+** → name it **Scan to MyApp** → **Add Action** and add the following in order:

A) INPUT
1. **Get Text from Input**
2. **Get Dictionary from Input**
3. **Get Dictionary Value** → Key: `vendor` → variable **Vendor**
4. **Get Dictionary Value** → Key: `date` → variable **Date**
5. **Get Dictionary Value** → Key: `time` → variable **Time**
6. **Get Dictionary Value** → Key: `currency` → variable **Currency**
7. **Get Dictionary Value** → Key: `value` → variable **Value**

B) FILENAME
8. **Text** → insert variables to form: `Vendor`-`Date`-`Time`-`Currency`-`Value`.pdf
   - Long-press the **Text** result → **Set Variable** → name it **Filename**.
   - (Your PWA should already send normalized values: vendor slug, YYYYMMDD, HHmm, ISO currency, 2dp value.)

C) SCAN & SAVE
9. **Scan Documents** (type: PDF)
10. **Set Name** → Name: **Filename**
11. **Create Folder** → Location: **On My iPhone**, Path: `MyApp/Scans` (adds it if missing)
12. **Save File** → Service: **On My iPhone**, Subpath: `MyApp/Scans`, **Ask Where to Save**: Off

D) RETURN
• If your PWA launched with an `x-success` URL, Shortcuts returns to it automatically after step 12.

## PWA launch URL (example)
```
shortcuts://x-callback-url/run-shortcut?name=Scan%20to%20MyApp&input=text&text=%7B%22vendor%22%3A%22cotswold-company%22%2C%22date%22%3A%2220250826%22%2C%22time%22%3A%222130%22%2C%22currency%22%3A%22GBP%22%2C%22value%22%3A%22129.99%22%7D&x-success=https%3A%2F%2Fyourpwa.example%2Fimport.html%3Fok%3D1
```
