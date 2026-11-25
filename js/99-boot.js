'use strict';
/* ---------- boot ---------- */
S=load();if(!S)seed();migrateV7();initV8();syncRaw();initV9();initV10();initV13();initV14();applyHash();
render();
