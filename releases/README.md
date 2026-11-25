# Releases

Har section ke baad ek shareable single-file build. File seedha Chrome mein khulti hai; server nahi chahiye.
Banane ka tarika: `npm test` pass → `node tools/release.js v14.N slug` → us folder mein `RELEASE-NOTES.md`, `OWNER-TEST.md`, `screenshots/` → is table mein row.

| Version | Date | Section | Folder | Status |
|---|---|---|---|---|
| v14.1 | 25 Nov 2026 | 1 · Order slip (1.1–1.8) | [v14.1-order-slip](v14.1-order-slip/) | Owner test ke liye taiyaar |

Folder ke andar:

```
vX.Y-slug/
  mk-prototype-vX.Y.html   share karne waali file
  RELEASE-NOTES.md         kya badla, checklist id ke saath, test result, khule sawaal
  OWNER-TEST.md            owner ke test steps (Hinglish)
  screenshots/             phone (light) + desktop (dark)
```
