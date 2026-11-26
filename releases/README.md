# Releases

Har section ke baad ek shareable single-file build. Owner ka link hamesha **latest** version dikhata hai: https://claude.ai/artifact/3b81iMAGmvTXbEhwSSz414 File seedha Chrome mein khulti hai; server nahi chahiye.
Banane ka tarika: `npm test` pass → `node tools/release.js v14.N slug` → us folder mein `RELEASE-NOTES.md`, `OWNER-TEST.md`, `screenshots/` → is table mein row.

| Version | Date | Section | Folder · link | Status |
|---|---|---|---|---|
| v14.3 | 26 Nov 2026 | 2 · Karigar ko pirai (2.1–2.4): spec master, challan, frame / guchha | [v14.3-pirai](v14.3-pirai/) · [link](https://claude.ai/artifact/3b81iMAGmvTXbEhwSSz414) | Owner test ke liye taiyaar |
| v14.2 | 26 Nov 2026 | Q11 · Pehle dispatch, phir bill (abhi / baad mein, PDF, WhatsApp) | [v14.2-dispatch-bill](v14.2-dispatch-bill/) | v14.3 mein shaamil |
| v14.1 | 25 Nov 2026 | 1 · Order slip (1.1–1.8) | [v14.1-order-slip](v14.1-order-slip/) | v14.2 mein shaamil |

Folder ke andar:

```
vX.Y-slug/
  mk-prototype-vX.Y.html   share karne waali file
  RELEASE-NOTES.md         kya badla, checklist id ke saath, test result, khule sawaal
  OWNER-TEST.md            owner ke test steps (Hinglish)
  screenshots/             phone (light) + desktop (dark)
```
