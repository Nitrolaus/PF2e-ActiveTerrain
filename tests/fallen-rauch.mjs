// Rauchtest der eigenen Fallen (0.4.0) mit Foundry- und PF2e-Attrappen. Aufruf: node tests/fallen-rauch.mjs
// Prüft: Menü und Setzen an der Tür, Akteur im eigenen Ordner, Tür- und Schlossfallen nicht beim Betreten,
// Tür öffnen löst gegen den Öffnenden aus, Angriffsfalle greift gleich an, Schloss-Knopf, Herbeirufen mit
// Initiative und Verschwinden, äußere Veränderung beim kritischen Fehlschlag.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FELD = 100;
const hooks = new Map();
const chat = [];
const meldungen = [];
const angriffe = [];
const effekte = [];
const flach = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? flach(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
const TEXTE = Object.fromEntries(flach(JSON.parse(readFileSync(new URL("../lang/de.json", import.meta.url), "utf8"))));
// Der Schadenswurf der Gefahren-Karte wartet 300 ms auf PF2e; erst danach kommt die äußere Veränderung.
const warten = () => new Promise((r) => setTimeout(r, 350));
const ausloesen = async (n, ...a) => { for (const fn of hooks.get(n) ?? []) await fn(...a); await warten(); };

let dialogAntworten = [];
globalThis.Hooks = { on: (n, fn) => (hooks.get(n) ?? hooks.set(n, []).get(n)).push(fn), once() {}, callAll() {} };
globalThis.CONST = { WALL_DOOR_STATES: { CLOSED: 0, OPEN: 1, LOCKED: 2 }, TOKEN_DISPOSITIONS: { HOSTILE: -1 }, TOKEN_DISPLAY_MODES: { OWNER_HOVER: 30 } };
globalThis.foundry = {
  utils: {
    escapeHTML: (s) => String(s),
    setProperty: (o, pfad, wert) => { const teile = pfad.split("."); let z = o; for (const t of teile.slice(0, -1)) z = z[t] ??= {}; z[teile.at(-1)] = wert; }
  },
  applications: {
    ux: { TextEditor: { implementation: { enrichHTML: async (s) => s, getDragEventData: () => null } } },
    api: { DialogV2: { wait: async () => dialogAntworten.shift() ?? null } }
  }
};
globalThis.ChatMessage = { create: async (d) => { chat.push(d); return d; } };
globalThis.ui = { notifications: { warn: (t) => meldungen.push(t), info: (t) => meldungen.push(t) } };
globalThis.CONFIG = { Canvas: { polygonBackends: {} } };
const geklickt = [];
globalThis.MouseEvent = class { constructor(typ) { this.type = typ; } };
globalThis.document = {
  body: { append() {} },
  createElement: () => {
    const el = { style: {}, dataset: {}, innerHTML: "", remove() {} };
    el.querySelector = () => ({ dispatchEvent: () => geklickt.push(/@Damage\[(.*)\]/u.exec(el.innerHTML)?.[1]) });
    return el;
  }
};

function dokument(daten) {
  const flags = { ...(daten.flags?.gelaendepinsel ?? {}) };
  const d = {
    ...daten, flags,
    getFlag: (m, k) => flags[k],
    setFlag: async (m, k, v) => { flags[k] = v; },
    update: async (u) => { for (const [k, v] of Object.entries(u)) { if (k.startsWith("flags.gelaendepinsel.")) flags[k.slice(21)] = v; else d[k] = v; } },
    delete: async () => { const i = szene.tokens.indexOf(d); if (i >= 0) szene.tokens.splice(i, 1); }
  };
  return d;
}

const { FALLEN } = await import("../scripts/fallen-daten.mjs");
const { akteurDaten } = await import("../scripts/fallen-logik.mjs");

/* Ein Gefahren-Akteur aus den Falldaten, wie Foundry ihn hätte. */
const akteure = [];
function akteurAus(daten, id) {
  const items = daten.items.map((it, i) => ({ ...it, id: `${id}i${i}`.padEnd(16, "0"), uuid: `Actor.${id}.Item.${i}`, getRollData: () => ({}), getFlag: (m, k) => it.flags?.[m]?.[k] }));
  const a = {
    ...daten, id, level: 5, isOfType: (...t) => t.includes("hazard"),
    getFlag: (m, k) => daten.flags?.[m]?.[k],
    items: Object.assign(items, { get: (x) => items.find((it) => it.id === x) }),
    system: { ...daten.system, actions: [] },
    getTokenDocument: async (zusatz) => ({ toObject: () => ({ name: daten.name, actorId: id, flags: {}, ...zusatz }) })
  };
  const angriff = items.find((it) => it.flags?.gelaendepinsel?.rolle === "angriff");
  if (angriff) {
    a.system.actions.push({
      item: angriff,
      variants: [{ roll: async () => { angriffe.push(aktuellesZiel); return { degreeOfSuccess: 2 }; } }],
      damage: async () => angriffe.push("schaden"), critical: async () => angriffe.push("kritisch")
    });
  }
  akteure.push(a);
  return a;
}

const gm = { id: "gm", isGM: true };
const spieler = { id: "sp", isGM: false };
const szene = { id: "szene", tokens: null, walls: [] };
const tokenListe = Object.assign([], { get(id) { return this.find((d) => d.id === id); }, has(id) { return this.some((d) => d.id === id); } });
szene.tokens = tokenListe;
szene.createEmbeddedDocuments = async (_art, liste) => liste.map((daten, i) => {
  const neu = dokument({ ...daten, id: `neu${tokenListe.length}${i}`.padEnd(16, "0"), parent: szene, width: 1, height: 1, actor: akteure.find((a) => a.id === daten.actorId) ?? null, texture: { src: "x.webp" } });
  tokenListe.push(neu);
  return neu;
});

const brandyActor = {
  id: "brandyActor00001", name: "Brandy", isOfType: (...t) => t.includes("creature"), testUserPermission: (u) => u.id === "sp",
  items: [], createEmbeddedDocuments: async (_art, liste) => { effekte.push(...liste); brandyActor.items.push(...liste.map((e) => ({ ...e, getFlag: (m, k) => e.flags?.[m]?.[k] }))); }
};
const brandy = dokument({ id: "brandy0000000001", name: "Brandy", x: 400, y: 300, width: 1, height: 1, hidden: false, actor: brandyActor, parent: szene, texture: { src: "tokens/brandy.webp" } });
const fremdActor = { id: "fremd", name: "Wache", isOfType: (...t) => t.includes("creature"), testUserPermission: () => false };
const wache = dokument({ id: "wache00000000001", name: "Wache", x: 400, y: 400, width: 1, height: 1, hidden: false, actor: fremdActor, parent: szene });
tokenListe.push(brandy, wache);
// Tür senkrecht zwischen Feld 4,3 und 5,3 (x = 500).
const tuer = { id: "tuer000000000001", door: 1, c: [500, 300, 500, 400], parent: szene };
szene.walls.push(tuer);

let aktuellesZiel = null;
const ordner = [];
globalThis.Folder = { implementation: { create: async (d) => { const f = { ...d, id: "ordner0000000001", getFlag: (m, k) => d.flags?.[m]?.[k] }; ordner.push(f); return f; } } };
globalThis.Actor = { implementation: { create: async (d) => akteurAus(d, `akt${akteure.length}`.padEnd(16, "0")) } };
const kaempfe = [];
globalThis.Combat = { implementation: { create: async (d) => {
  const k = { id: "kampf00000000001", scene: szene, active: true, round: 1, combatants: [], inits: [],
    createEmbeddedDocuments: async (_a, liste) => { k.combatants.push(...liste.map((c, i) => ({ ...c, id: `k${k.combatants.length + i}` }))); },
    deleteEmbeddedDocuments: async (_a, ids) => { k.combatants = k.combatants.filter((c) => !ids.includes(c.id)); },
    rollInitiative: async (ids) => { k.inits.push(...ids); } };
  kaempfe.push(k);
  return k;
} } };
const waechter = { id: "waechter00000001", name: "Steinwächter", level: 8, pack: null,
  getTokenDocument: async (zusatz) => ({ toObject: () => ({ name: "Steinwächter", actorId: "waechter00000001", flags: {}, ...zusatz }) }) };
globalThis.fromUuid = async (u) => (u === "Actor.waechter00000001" ? waechter : null);

globalThis.canvas = {
  scene: szene, mousePosition: { x: 450, y: 350 },
  grid: { size: FELD, distance: 5, getOffset: ({ x, y }) => ({ i: Math.floor(y / FELD), j: Math.floor(x / FELD) }), getTopLeftPoint: ({ x, y }) => ({ x: Math.floor(x / FELD) * FELD, y: Math.floor(y / FELD) * FELD }),
    measurePath: ([a, b]) => ({ distance: 5 * Math.max(Math.round(Math.abs(a.x - b.x) / FELD), Math.round(Math.abs(a.y - b.y) / FELD)) }) },
  tokens: { get: (id) => ({ setTarget: () => { aktuellesZiel = id; } }), placeables: [] }
};
globalThis.game = {
  user: gm, users: Object.assign([gm, spieler], { activeGM: gm, get: (id) => [gm, spieler].find((u) => u.id === id) }), combat: null,
  scenes: [szene], actors: Object.assign(akteure, { get: (id) => akteure.find((a) => a.id === id) }),
  folders: ordner, combats: kaempfe, packs: { get: () => null },
  i18n: { lang: "de", localize: (k) => TEXTE[k] ?? k, format: (k, d) => (TEXTE[k] ?? k).replace(/\{(\w+)\}/gu, (_m, n) => d[n]) },
  settings: { register() {}, get: () => false }
};

const gefahren = await import("../scripts/gefahren.mjs");
const fallen = await import("../scripts/fallen.mjs");
gefahren.anmelden();
fallen.anmelden();

// Menü (0.4.2, gemeldet: "per Drag and Drop, und es malt oder löscht da gerade kein Gelände"): Das Fenster bleibt offen,
// ein Eintrag gibt beim Ziehen seine Kennung mit, das Ablegen auf der Karte setzt die Falle versteckt an der Tür.
const fenster = [];
const DialogAttrappe = class {
  constructor(o) { this.o = o; this.rendered = false; fenster.push(this); }
  async render() { this.rendered = true; }
  bringToFront() { this.vorn = true; }
};
DialogAttrappe.wait = foundry.applications.api.DialogV2.wait;
foundry.applications.api.DialogV2 = DialogAttrappe;
await fallen.menueOeffnen();
assert.equal(fenster.length, 1, "ein Fenster");
assert.ok(fenster[0].o.content.includes('draggable="true" data-falle="tuer-bolzenwerfer"'), "Einträge zum Ziehen");
assert.deepEqual(fenster[0].o.buttons.map((b) => b.action), ["schliessen"], "nur Schließen, kein Setzen-Knopf");
await fallen.menueOeffnen();
assert.equal(fenster.length, 1, "zweiter Klick holt das offene Fenster nach vorn");
assert.ok(fenster[0].vorn);
const griffe = {};
const eintrag = { dataset: { falle: "tuer-bolzenwerfer" }, addEventListener: (n, fn) => { griffe[n] = fn; } };
const stufenwahl = { value: "5", addEventListener() {} };
fallen.menueVerdrahten({ querySelector: () => stufenwahl, querySelectorAll: (sel) => (sel.includes("gp-falle") ? [eintrag] : []) });
let gezogen = null;
griffe.dragstart({ dataTransfer: { setData: (art, wert) => { gezogen = [art, JSON.parse(wert)]; } } });
assert.deepEqual(gezogen, ["text/plain", { type: fallen.ZIEH_ART, id: "tuer-bolzenwerfer" }]);
// Ablegen: Der Hook hält Foundrys eigene Behandlung an (false), fremde Daten lässt er durch.
const abwurf = (daten) => (hooks.get("dropCanvasData") ?? []).map((fn) => fn(canvas, daten));
assert.deepEqual(abwurf({ type: "Actor", uuid: "Actor.x" }), [undefined], "fremdes Ablegen unberührt");
assert.deepEqual(abwurf({ ...gezogen[1], x: 450, y: 350 }), [false]);
await warten();
const bolzen = tokenListe.at(-1);
assert.equal(bolzen.name, "Bolzenwerfer im Türrahmen");
assert.equal(bolzen.hidden, true, "versteckt gesetzt");
assert.deepEqual([bolzen.x, bolzen.y], [400, 300]);
assert.equal(bolzen.getFlag("gelaendepinsel", "tuer"), tuer.id);
assert.equal(ordner.length, 1, "eigener Ordner");
assert.equal(bolzen.actor.folder, ordner[0].id);
// Fern jeder Tür: nicht gesetzt, Hinweis. Dieselbe Falle noch einmal: derselbe Akteur.
const vorherTokens = tokenListe.length;
abwurf({ ...gezogen[1], x: 2000, y: 2000 });
await warten();
assert.equal(tokenListe.length, vorherTokens, "ohne Tür nicht gesetzt");
assert.ok(meldungen.at(-1).includes("Keine Tür"));
assert.equal(akteure.length, 1);
// Herbeirufende Falle: Beim Ablegen fragt das Modul nach der Kreatur; abgebrochen wird nichts gesetzt.
dialogAntworten = [null];
abwurf({ type: fallen.ZIEH_ART, id: "gelaende-ruf-der-tiefe", x: 1450, y: 1450 });
await warten();
assert.equal(tokenListe.length, vorherTokens, "Kreaturwahl abgebrochen: nichts gesetzt");
dialogAntworten = [{ uuid: "Actor.waechter00000001" }];
abwurf({ type: fallen.ZIEH_ART, id: "gelaende-ruf-der-tiefe", x: 1450, y: 1450 });
await warten();
const ruf = tokenListe.at(-1);
assert.equal(ruf.getFlag("gelaendepinsel", "kreatur"), "Actor.waechter00000001", "Kreatur am Token");
assert.deepEqual([ruf.x, ruf.y], [1400, 1400]);
tokenListe.splice(tokenListe.indexOf(ruf), 1);

// Tür- und Schlossfallen lösen nicht beim Betreten aus; eine Geländefalle schon.
const gelaende = dokument({ id: "gelaende00000001", name: "Pfahlgrube", x: 800, y: 800, width: 1, height: 1, hidden: true, parent: szene,
  actor: akteurAus(akteurDaten(FALLEN.find((f) => f.id === "gelaende-pfahlgrube"), "de", "t"), "akt_grube0000000") });
tokenListe.push(gelaende);
assert.deepEqual([...gefahren.versteckteFallen(szene).keys()], ["falle:gelaende00000001"]);

// Tür öffnen: Die Falle zeigt sich und greift die öffnende Figur an (Brandy gehört dem Spieler, Wache nicht).
const schlossVorher = chat.length;
await ausloesen("updateWall", tuer, { ds: 0 }, {}, "sp");
assert.equal(bolzen.hidden, true, "Schließen löst nichts aus");
await ausloesen("updateWall", tuer, { ds: 1 }, {}, "sp");
assert.equal(bolzen.hidden, false, "aufgedeckt");
assert.deepEqual(angriffe, ["brandy0000000001", "schaden"], "ein Angriff gegen Brandy, Treffer würfelt Schaden");
assert.ok(chat.slice(schlossVorher).some((c) => String(c.content).includes("Brandy hat die Tür geöffnet")));
// Wieder offen: aufgedeckte Falle löst nicht noch einmal aus.
await ausloesen("updateWall", tuer, { ds: 1 }, {}, "sp");
assert.equal(angriffe.length, 2);
// Wieder versteckt, Wache steht jetzt näher an der Tür: Der Spieler öffnet, also trifft es seine Brandy.
bolzen.hidden = true;
wache.x = 400; wache.y = 300;
brandy.x = 300; brandy.y = 300;
await ausloesen("updateWall", tuer, { ds: 1 }, {}, "sp");
assert.equal(angriffe.at(-2), "brandy0000000001", "Figur des öffnenden Spielers zuerst");
// Öffnet die SL, trifft es die nächste Figur.
bolzen.hidden = true;
await ausloesen("updateWall", tuer, { ds: 1 }, {}, "gm");
assert.equal(angriffe.at(-2), "wache00000000001", "SL öffnet: die nächste Figur");
wache.x = 400; wache.y = 400;
brandy.x = 400; brandy.y = 300;

// Schlossfalle mit Herbeirufen: Knopf im Menü, Kreatur gewählt, Initiative, Verschwinden nach 10 Runden.
const siegelActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "schloss-beschwoerungssiegel"), "de", "t"), "akt_siegel000000");
const siegel = dokument({ id: "siegel0000000001", name: "Beschwörungssiegel", x: 500, y: 300, width: 1, height: 1, hidden: true, parent: szene, actor: siegelActor });
tokenListe.push(siegel);
assert.ok(!gefahren.versteckteFallen(szene).has("falle:siegel0000000001"), "Schloss nicht beim Betreten");
const knoepfe = [];
const altWait = foundry.applications.api.DialogV2.wait;
// Erst das Totenkopf-Menü, dann "Wer öffnet?" (Brandy und Wache stehen beide daneben).
const wahlen = ["gp-schloss", "brandy0000000001"];
foundry.applications.api.DialogV2.wait = async (d) => { knoepfe.push(...(d.buttons ?? []).map((b) => b.action)); return wahlen.shift(); };
await siegel.setFlag("gelaendepinsel", "kreatur", "Actor.waechter00000001");
await gefahren.menue(siegel);
foundry.applications.api.DialogV2.wait = altWait;
assert.ok(knoepfe.includes("gp-schloss") && knoepfe.includes("gp-kreatur"), "Schloss-Knopf und Kreatur wählen");
assert.equal(siegel.hidden, false, "Siegel aufgedeckt");
const gerufen = tokenListe.find((tk) => tk.name === "Steinwächter");
assert.ok(gerufen, "Kreatur gesetzt");
assert.equal(gerufen.disposition, -1, "feindlich");
assert.equal(kaempfe.length, 1, "Kampf angelegt");
const kampf = kaempfe[0];
assert.ok(kampf.combatants.some((c) => c.tokenId === gerufen.id) && kampf.combatants.some((c) => c.tokenId === brandy.id), "Kreatur und Brandy im Kampf");
assert.equal(kampf.inits.length, 1, "nur die Kreatur würfelt Initiative");
assert.deepEqual(gerufen.getFlag("gelaendepinsel", "verschwindet"), { kampf: kampf.id, runde: 11 });
assert.ok(chat.some((c) => String(c.content).includes("ruft") && String(c.content).includes("Brandy")), "Meldung: greift Brandy an");
kampf.round = 10;
await ausloesen("updateCombat", kampf, { round: 10 });
assert.ok(tokenListe.includes(gerufen), "Runde 10: noch da");
kampf.round = 11;
await ausloesen("updateCombat", kampf, { round: 11 });
assert.ok(!tokenListe.includes(gerufen), "Runde 11: verschwunden");
assert.ok(!kampf.combatants.some((c) => c.tokenId === gerufen.id));

// Schlossfalle ohne jemanden daneben: nur Hinweis.
brandy.x = 1500;
wache.x = 1500;
siegel.hidden = true;
foundry.applications.api.DialogV2.wait = async () => "gp-schloss";
await gefahren.menue(siegel);
foundry.applications.api.DialogV2.wait = altWait;
assert.equal(siegel.hidden, true, "ohne Figur daneben nichts");
assert.ok(meldungen.at(-1).includes("Niemand steht neben dem Schloss"));
brandy.x = 400;
wache.x = 400;

// Äußere Veränderung: kritischer Fehlschlag gegen die Flammensäulen-Rune gibt Brandy das Brandmal mit Tönung, einmal.
const runeActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "raum-flammensaeule"), "de", "t"), "akt_rune00000000");
const rune = dokument({ id: "rune000000000001", name: "Flammensäulen-Rune", x: 400, y: 300, width: 1, height: 1, hidden: false, parent: szene, actor: runeActor });
tokenListe.push(rune);
const kennung = `gelaendepinsel:falle:${rune.id}:${runeActor.items[0].id}:${brandy.id}`;
await ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome: "failure", options: [kennung] } } }, speaker: {} });
assert.equal(effekte.length, 0, "Fehlschlag verändert nicht");
assert.equal(geklickt.at(-1), "10d6[fire],2d6[persistent,fire]", "Fehlschlag: voller Schaden samt anhaltendem Feuer in einem Wurf");
await ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome: "criticalFailure", options: [kennung] } } }, speaker: {} });
assert.equal(effekte.length, 1);
assert.equal(effekte[0].name, "Brandmal");
assert.deepEqual(effekte[0].system.rules, [{ key: "TokenImage", value: "tokens/brandy.webp", tint: "#d08060" }]);
assert.deepEqual([effekte[0].system.duration.value, effekte[0].system.duration.unit], [7, "days"]);
await ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome: "criticalFailure", options: [kennung] } } }, speaker: {} });
assert.equal(effekte.length, 1, "nicht doppelt");

// Lange Zustände (0.5.0, gemeldet: "blind für 28 Stunden oder versteinert"): Die Sonnenglyphe der Stufe 6 setzt beim
// Fehlschlag Geblendet für 24 Stunden, beim kritischen Fehlschlag Blind für 24 Stunden samt Sonnenbrand; ein zweiter
// kritischer Fehlschlag setzt nichts doppelt, sondern lässt die Laufzeit neu beginnen.
const erneuert = [];
brandyActor.updateEmbeddedDocuments = async (_art, liste) => { erneuert.push(...liste); };
effekte.length = 0;
brandyActor.items.length = 0;
const sonneActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "tuer6-sonnenglyphe"), "de", "t"), "akt_sonne0000000");
const sonne = dokument({ id: "sonne00000000001", name: "Sonnenglyphe", x: 400, y: 300, width: 1, height: 1, hidden: false, parent: szene, actor: sonneActor });
tokenListe.push(sonne);
const sonnenKennung = `gelaendepinsel:falle:${sonne.id}:${sonneActor.items[0].id}:${brandy.id}`;
const sonnenWurf = (outcome) => ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome, options: [sonnenKennung] } } }, speaker: {} });
await sonnenWurf("success");
assert.equal(effekte.length, 0, "Erfolg: nichts Langes");
await sonnenWurf("failure");
assert.deepEqual(effekte.map((e) => e.name), ["Geblendet (Sonnenglyphe)"]);
assert.deepEqual([effekte[0].system.duration.value, effekte[0].system.duration.unit], [24, "hours"]);
assert.equal(effekte[0].system.rules[0].uuid, "Compendium.pf2e.conditionitems.Item.TkIyaNPgTZFBCCuh");
assert.ok(String(chat.at(-1)?.content).includes("leidet lange an: Geblendet (Sonnenglyphe)"), "Meldung an die SL");
await sonnenWurf("criticalFailure");
assert.deepEqual(effekte.map((e) => e.name), ["Geblendet (Sonnenglyphe)", "Blind (Sonnenglyphe)", "Sonnenbrand"]);
assert.equal(effekte[1].system.rules[0].uuid, "Compendium.pf2e.conditionitems.Item.XgEqL1kFApUbl5Z2");
assert.equal(effekte[2].system.level.value, 6, "Aussehen mit der Stufe der Falle");
await sonnenWurf("criticalFailure");
assert.equal(effekte.length, 3, "nicht doppelt");
assert.deepEqual(erneuert.map((e) => e.name), ["Blind (Sonnenglyphe)"], "Laufzeit beginnt neu");

// Angriffsfalle der Stufe 6: Der Treffer des Sägeblatts setzt Unbeholfen 1 für 24 Stunden.
effekte.length = 0;
brandyActor.items.length = 0;
const saegeActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "schloss6-saegeblatt"), "de", "t"), "akt_saege0000000");
const saege = dokument({ id: "saege00000000001", name: "Sägeblatt", x: 400, y: 300, width: 1, height: 1, hidden: false, parent: szene, actor: saegeActor });
tokenListe.push(saege);
await gefahren.ausloesen(saege, saegeActor.items[0], gefahren.mitAusloeser([brandy], brandy));
assert.deepEqual(effekte.map((e) => e.name), ["Unbeholfen 1 (Sägeblatt im Schloss)"]);
assert.deepEqual(effekte[0].system.rules[0].alterations, [{ mode: "override", property: "badge-value", value: 1 }]);

// Stufe 7 (0.6.0): Das Siegel der verlorenen Jahre lässt beim kritischen Fehlschlag um Jahrzehnte altern, Kraftlos 2
// und Unbeholfen 2 für 1 Woche, dazu 30 Tage ergrautes Haar; Ausgelaugt bleibt PF2es eigener Zustand ohne Laufzeit.
effekte.length = 0;
brandyActor.items.length = 0;
const zeitActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "schloss7-zeitsiegel"), "de", "t"), "akt_zeit00000000");
const zeit = dokument({ id: "zeit000000000001", name: "Zeitsiegel", x: 400, y: 300, width: 1, height: 1, hidden: false, parent: szene, actor: zeitActor });
tokenListe.push(zeit);
await ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome: "criticalFailure", options: [`gelaendepinsel:falle:${zeit.id}:${zeitActor.items[0].id}:${brandy.id}`] } } }, speaker: {} });
assert.deepEqual(effekte.map((e) => e.name), ["Kraftlos 2 (Siegel der verlorenen Jahre)", "Unbeholfen 2 (Siegel der verlorenen Jahre)", "Ergrautes Haar"]);
assert.deepEqual([effekte[0].system.duration.value, effekte[0].system.duration.unit], [7, "days"]);
assert.deepEqual([effekte[2].system.duration.value, effekte[2].system.duration.unit], [30, "days"]);
assert.ok(effekte.every((e) => e.system.level.value === 7), "Stufe der Falle");

// Stufe 8 (0.7.0): Die Tür der Totenstarre lähmt beim kritischen Fehlschlag für 24 Stunden, Unbeholfen 2 für 1 Woche,
// dazu 7 Tage Leichenblässe.
effekte.length = 0;
brandyActor.items.length = 0;
const starrActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "tuer8-totenstarre"), "de", "t"), "akt_starr0000000");
const starr = dokument({ id: "starr00000000001", name: "Totenstarre", x: 400, y: 300, width: 1, height: 1, hidden: false, parent: szene, actor: starrActor });
tokenListe.push(starr);
await ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome: "criticalFailure", options: [`gelaendepinsel:falle:${starr.id}:${starrActor.items[0].id}:${brandy.id}`] } } }, speaker: {} });
assert.deepEqual(effekte.map((e) => e.name), ["Gelähmt (Tür der Totenstarre)", "Unbeholfen 2 (Tür der Totenstarre)", "Leichenblässe"]);
assert.deepEqual([effekte[0].system.duration.value, effekte[0].system.duration.unit], [24, "hours"]);
assert.equal(effekte[0].system.rules[0].uuid, "Compendium.pf2e.conditionitems.Item.6uEgoh53GbXuHpTF");
assert.deepEqual([effekte[1].system.duration.value, effekte[1].system.duration.unit], [7, "days"]);
assert.ok(effekte.every((e) => e.system.level.value === 8), "Stufe der Falle");

// Höchstens drei Ziele (Gewitterstein): die Karte nennt drei, wer auslöst zuerst.
const steinActor = akteurAus(akteurDaten(FALLEN.find((f) => f.id === "gelaende-gewitterstein"), "de", "t"), "akt_stein0000000");
const stein = dokument({ id: "stein00000000001", name: "Gewitterstein", x: 400, y: 300, width: 1, height: 1, hidden: false, parent: szene, actor: steinActor });
tokenListe.push(stein);
const viele = [wache, brandy, wache, brandy].map((tk, i) => ({ ...tk, id: `${tk.id.slice(0, 12)}${i}000` }));
const vor = chat.length;
await gefahren.ausloesen(stein, steinActor.items[0], gefahren.mitAusloeser(viele, brandy));
const karte = chat.slice(vor).find((c) => String(c.content).includes("<ul>"));
assert.ok(karte, "eine Karte für mehrere");
assert.equal((karte.content.match(/<li>/gu) ?? []).length, 3, "drei Ziele");
assert.ok(karte.content.indexOf("Brandy") < karte.content.indexOf("Wache"), "Brandy zuerst");

console.log("fallen-rauch: ok");
