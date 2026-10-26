// Rauchtest Suchen am Token (0.3.4) mit Foundry- und PF2e-Attrappen. Aufruf: node tests/suchen-rauch.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hooks = new Map();
const einmal = new Map();
const ruhe = () => new Promise((fertig) => setTimeout(fertig, 10));
globalThis.Hooks = {
  on: (n, fn) => (hooks.get(n) ?? hooks.set(n, []).get(n)).push(fn),
  once: (n, fn) => (einmal.get(n) ?? einmal.set(n, []).get(n)).push(fn),
  callAll() {}
};
async function ausloesen(name, ...werte) {
  const liste = [...(einmal.get(name) ?? []), ...(hooks.get(name) ?? [])];
  einmal.delete(name);
  for (const fn of liste) fn(...werte);
  await ruhe();
}

const flach = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? flach(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
const TEXTE = Object.fromEntries(flach(JSON.parse(readFileSync(new URL("../lang/de.json", import.meta.url), "utf8"))));

class Behaelter {
  constructor() {
    this.children = [];
    this.scale = { y: 1 };
    this.position = { x: 0, y: 0, set(x, y) { this.x = x; this.y = y; } };
    this.destroyed = false;
    this.x = 0;
  }
  addChild(kind) { kind.parent = this; this.children.push(kind); return kind; }
  removeChild(kind) { this.children = this.children.filter((k) => k !== kind); kind.parent = null; }
  destroy() { this.destroyed = true; }
}
class Grafik extends Behaelter {
  constructor() { super(); this.formen = []; this.mask = null; }
  moveTo(x, y) { this.formen.push({ start: { x, y }, boegen: [] }); return this; }
  quadraticCurveTo(cx, cy, x, y) { this.formen.at(-1).boegen.push({ cx, cy, x, y }); return this; }
  closePath() { this.formen.at(-1).zu = true; return this; }
  circle(x, y, r) { this.formen.push({ kreis: { x, y, r } }); return this; }
  fill(stil) { this.formen.at(-1).farbe = stil.color; return this; }
  stroke(stil) { Object.assign(this.formen.at(-1), { rand: stil.width, ende: stil.cap }); return this; }
}
globalThis.PIXI = { Container: Behaelter, Graphics: Grafik };
const warnungen = [];
globalThis.ui = { notifications: { warn: (t) => warnungen.push(t) } };
globalThis.document = {
  createElement: () => ({ dataset: {}, className: "", innerHTML: "", hoerer: null, addEventListener(_art, fn) { this.hoerer = fn; } })
};

// Eine Sammlung wie Foundrys Collection: get, has, und beim Durchgehen die Werte.
class Sammlung extends Map {
  *[Symbol.iterator]() { yield* this.values(); }
}
const angelegt = [];
function charakter(id, { besitzer = true, art = "character" } = {}) {
  const flags = {};
  const a = {
    id, name: id, isOwner: besitzer, items: new Sammlung(), system: { exploration: [] },
    isOfType: (...t) => t.includes(art) || (art === "character" && t.includes("creature")),
    getFlag: (_m, k) => flags[k],
    setFlag: async (_m, k, v) => { flags[k] = v; await ausloesen("updateActor", a, { flags: {} }); },
    unsetFlag: async (_m, k) => { delete flags[k]; await ausloesen("updateActor", a, { flags: {} }); },
    update: async (daten) => {
      a.system.exploration = daten["system.exploration"];
      await ausloesen("updateActor", a, { system: { exploration: a.system.exploration } });
    },
    createEmbeddedDocuments: async (_typ, liste) => {
      angelegt.push(...liste);
      return liste.map((daten, i) => {
        const neu = { id: `${id}-neu${i}`, type: daten.type, slug: daten.system.slug, name: daten.name };
        a.items.set(neu.id, neu);
        return neu;
      });
    },
    getActiveTokens: () => tokens.filter((tk) => tk.actor === a)
  };
  return a;
}
function tokenFuer(actor) {
  return Object.assign(new Behaelter(), { id: `tk-${actor.id}`, actor, w: 100 });
}

const duncan = charakter("duncan");
const fremd = charakter("fremd", { besitzer: false });
const wolf = charakter("wolf", { art: "npc" });
const tokens = [tokenFuer(duncan), tokenFuer(fremd), tokenFuer(wolf)];
const [duncanToken] = tokens;
const ticker = [];
globalThis.canvas = {
  scene: { tokens: { get: (id) => tokens.find((tk) => tk.id === id) } },
  grid: { size: 100, distance: 5, measurePath: (lagen) => {
    // Wie PF2e auf dem Quadratraster: jede zweite Diagonale zählt doppelt (5, 10, 5 ...).
    let fuss = 0;
    for (let i = 1; i < lagen.length; i += 1) {
      const dx = Math.round(Math.abs(lagen[i].x - lagen[i - 1].x) / 100);
      const dy = Math.round(Math.abs(lagen[i].y - lagen[i - 1].y) / 100);
      fuss += 5 * (Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2));
    }
    return { distance: fuss };
  } },
  tokens: { placeables: tokens },
  app: { ticker: { add: (fn) => ticker.push(fn) } }
};
let kompendiumDa = true;
const pack = {
  getDocument: async (id) => (kompendiumDa && id === "TiNDYUGlMmxzxBYU" ? { toObject: () => ({ name: "Absuchen", type: "action", system: { slug: "search" } }) } : null),
  getIndex: async () => []
};
const gm = { id: "gm", isGM: true };
const spieler = { id: "sp", isGM: false };
const vorgestellt = [];
globalThis.game = {
  user: gm, users: Object.assign([gm, spieler], { activeGM: gm }), combat: null, paused: false,
  actors: [duncan, fremd, wolf],
  packs: new Map([["pf2e.actionspf2e", pack]]),
  items: { fromCompendium: (doc) => ({ ...doc.toObject(), _stats: { compendiumSource: "Compendium.pf2e.actionspf2e.Item.TiNDYUGlMmxzxBYU" } }) },
  time: {
    worldTime: 1000,
    advance: async (s) => { game.time.worldTime += s; vorgestellt.push(s); await ausloesen("updateWorldTime", game.time.worldTime, s); }
  },
  i18n: { localize: (k) => TEXTE[k] ?? k, format: (k, d) => (TEXTE[k] ?? k).replace(/\{(\w+)\}/gu, (_m, n) => d[n]) }
};

const s = await import("../scripts/suchen.mjs");
s.anmelden();
await ausloesen("canvasReady");
await ausloesen("ready");
assert.equal(ticker.length, 1, "Augen im Takt des Canvas");

function hud(token) {
  const spalte = { kinder: [], querySelector(sel) { return this.kinder.find((k) => sel.includes(k.dataset.action)) ?? null; }, append(k) { this.kinder.push(k); } };
  const wurzel = { querySelector: (sel) => (sel === ".col.right" ? spalte : null) };
  const app = { gezeichnet: 0, render() { this.gezeichnet += 1; } };
  for (const fn of hooks.get("renderTokenHUD")) fn(app, wurzel, { _id: token.id });
  return { knoepfe: spalte.kinder, app };
}
// Der Knopf wartet nicht auf das Umschalten; die verschachtelten Aktualisierungen brauchen ein paar Runden.
const klick = async (knopf) => {
  await knopf.hoerer({ preventDefault() {}, stopPropagation() {} });
  await new Promise((fertig) => setTimeout(fertig, 120));
};

// Knopf: an eigenen Charakteren, nicht an NPC und nicht an fremden
let ansicht = hud(duncanToken);
assert.equal(ansicht.knoepfe.length, 1);
const [knopf] = ansicht.knoepfe;
assert.equal(knopf.innerHTML, `<i class="fa-solid fa-magnifying-glass"></i>`, "Lupe, nicht Foundrys Auge für Sichtbarkeit");
assert.equal(knopf.className, "control-icon");
assert.equal(knopf.dataset.tooltip, "Suchen (Erkundung) einschalten, 10 Minuten Spielzeit");
assert.equal(hud(tokens[1]).knoepfe.length, 0, "fremder Charakter");
assert.equal(hud(tokens[2]).knoepfe.length, 0, "NPC");

// Einschalten ohne die Aktion am Bogen: aus dem Kompendium angelegt, in die Erkundung, Uhr läuft ab jetzt
await klick(knopf);
assert.equal(angelegt.length, 1, "Absuchen aus dem Kompendium");
assert.equal(angelegt[0]._stats.compendiumSource, "Compendium.pf2e.actionspf2e.Item.TiNDYUGlMmxzxBYU");
assert.deepEqual(duncan.system.exploration, ["duncan-neu0"]);
assert.equal(s.suchtGerade(duncan), true);
assert.equal(duncan.getFlag("gelaendepinsel", "sucheBis"), 1600, "10 Minuten Spielzeit ab dem Beginn");
assert.equal(ansicht.app.gezeichnet, 1, "HUD neu gezeichnet");
ansicht = hud(duncanToken);
assert.equal(ansicht.knoepfe[0].className, "control-icon active");
assert.equal(ansicht.knoepfe[0].dataset.tooltip, "Suchen ausschalten, noch 10 Minuten");

// Die lebendigen Augen rechts neben dem Token, mittig (0.3.7), ein Fünftel des Entwurfs; im Takt: links
// schauen, blinzeln
assert.equal(duncanToken.children.length, 1, "Augen da");
const augen = duncanToken.children[0];
const f = (100 / 68) * 0.2;
const zwei = (x) => Math.round(x * 100) / 100;
assert.deepEqual([zwei(augen.position.x), augen.position.y], [zwei(100 + 39 * f), 50], "rechts neben dem Token, mittig");
const [weiss, maske, pupillen, lid] = augen.children;
assert.equal(weiss.formen.length, 2, "zwei Mandelaugen");
assert.equal(weiss.formen[0].zu, true);
assert.equal(weiss.formen[0].farbe, 0xffffff);
assert.equal(weiss.formen[0].rand, 1, "Rand mindestens 1 Pixel");
assert.ok(Math.abs(weiss.formen[0].start.x + 28 * f) < 1e-9, "ein Fünftel des Entwurfs");
assert.equal(pupillen.mask, maske, "Iris bleibt im Auge");
assert.deepEqual(pupillen.formen.map((k) => k.farbe), [0x854f0b, 0x2c2c2a, 0xffffff, 0x854f0b, 0x2c2c2a, 0xffffff], "Iris, Pupille, Glanz");
assert.equal(lid.formen.length, 2);
assert.equal(lid.formen[0].zu, undefined, "Lidlinie nur oben");
assert.equal(lid.formen[0].ende, "round");
s.augenBewegen(1200);
assert.ok(Math.abs(pupillen.x + 3.5 * f) < 1e-9, "schaut nach links");
assert.equal(augen.scale.y, 1);
s.augenBewegen(3600);
assert.ok(Math.abs(augen.scale.y - 0.08) < 1e-9, "blinzelt");
assert.equal(tokens[1].children.length + tokens[2].children.length, 0, "andere ohne Augen");

// Uhr: alle 6 Sekunden 6 Sekunden Spielzeit, nicht bei Pause, nicht im Kampf (dort ruhen auch die Augen)
assert.equal(s.uhrSchlag(), true);
await ruhe();
assert.equal(game.time.worldTime, 1006);
game.paused = true;
assert.equal(s.uhrSchlag(), false, "Pause");
game.paused = false;
game.combat = { started: true };
await ausloesen("combatStart");
assert.equal(s.uhrSchlag(), false, "Kampf");
assert.equal(duncanToken.children.length, 0, "im Kampf keine Augen");
game.combat = null;
await ausloesen("deleteCombat");
assert.equal(duncanToken.children.length, 1, "nach dem Kampf wieder da");
game.user = spieler;
assert.equal(s.uhrSchlag(), false, "nur die aktive Spielleitung stellt die Zeit");
assert.equal(hud(duncanToken).knoepfe.length, 1, "Spieler sieht den Knopf an seiner Figur");
game.user = gm;

// Nach 10 Minuten Spielzeit endet Suchen von selbst
game.time.worldTime = 1597;
assert.equal(s.uhrSchlag(), true);
await ruhe();
await ruhe();
assert.equal(game.time.worldTime, 1603);
assert.deepEqual(duncan.system.exploration, [], "abgelaufen");
assert.equal(duncan.getFlag("gelaendepinsel", "sucheBis"), undefined);
assert.equal(duncanToken.children.length, 0, "Augen weg");
assert.equal(s.uhrSchlag(), false, "niemand sucht, die Uhr steht");

// Wieder ein und aus: die Aktion ist da, nichts Neues angelegt
await klick(hud(duncanToken).knoepfe[0]);
assert.deepEqual(duncan.system.exploration, ["duncan-neu0"]);
assert.equal(angelegt.length, 1);
assert.equal(duncan.getFlag("gelaendepinsel", "sucheBis"), 1603 + 600);
await klick(hud(duncanToken).knoepfe[0]);
assert.deepEqual(duncan.system.exploration, []);
assert.equal(duncan.getFlag("gelaendepinsel", "sucheBis"), undefined, "ausgeschaltet: Uhr aufgeräumt");

// Im Bogen eingeschaltet zählt genauso
await duncan.update({ "system.exploration": ["duncan-neu0"] });
await ruhe();
assert.equal(duncan.getFlag("gelaendepinsel", "sucheBis"), 2203, "auch über den Bogen: 10 Minuten");

// Der Weg kostet Zeit (0.3.5): 45 m pro Minute, also 2 Sekunden je Feld, gemessen über die Wegpunkte
const warten = () => new Promise((fertig) => setTimeout(fertig, 650));
const zug = (wegpunkte) => ({ _movement: { [duncanToken.id]: { passed: { waypoints: wegpunkte } } } });
vorgestellt.length = 0;
const vorher = game.time.worldTime;
assert.equal(s.wegKostet(duncanToken, { x: 0, y: 0 }, zug([{ x: 500, y: 0, action: "walk" }, { x: 500, y: 500, action: "walk" }]), { x: 500, y: 500 }), 20, "10 Felder um die Ecke, je 2 Sekunden");
await warten();
assert.deepEqual(vorgestellt, [20]);
assert.equal(game.time.worldTime, vorher + 20);
// Gruppe: zwei suchen und gehen zugleich, die Zeit vergeht einmal, nach dem längsten Weg
const zweiter = charakter("zweiter");
zweiter.items.set("z-suchen", { id: "z-suchen", type: "action", slug: "search" });
zweiter.system.exploration = ["z-suchen"];
s.wegKostet(duncanToken, { x: 0, y: 0 }, {}, { x: 300, y: 0 });
s.wegKostet(tokenFuer(zweiter), { x: 0, y: 0 }, {}, { x: 700, y: 0 });
await warten();
assert.deepEqual(vorgestellt, [20, 14], "einmal 14 Sekunden für 7 Felder, nicht 6 plus 14");
// Kein Preis: wer nicht sucht, bei Pause, im Kampf, per Teleport, auf der Seite eines Spielers
assert.equal(s.wegKostet(tokens[1], { x: 0, y: 0 }, {}, { x: 500, y: 0 }), 0, "sucht nicht");
game.paused = true;
assert.equal(s.wegKostet(duncanToken, { x: 0, y: 0 }, {}, { x: 500, y: 0 }), 0, "Pause");
game.paused = false;
game.combat = { started: true };
assert.equal(s.wegKostet(duncanToken, { x: 0, y: 0 }, {}, { x: 500, y: 0 }), 0, "Kampf");
game.combat = null;
globalThis.CONFIG = { Token: { movement: { actions: { blink: { teleport: true } } } } };
assert.equal(s.wegKostet(duncanToken, { x: 0, y: 0 }, zug([{ x: 900, y: 0, action: "blink" }]), { x: 900, y: 0 }), 0, "Teleport");
game.user = spieler;
assert.equal(s.wegKostet(duncanToken, { x: 0, y: 0 }, {}, { x: 500, y: 0 }), 0, "nur die aktive Spielleitung");
game.user = gm;
await warten();
assert.deepEqual(vorgestellt, [20, 14], "nichts weiter vorgestellt");

// Fehlt die Aktion im Kompendium: Hinweis, nichts geändert
kompendiumDa = false;
const neuling = charakter("neuling");
const neulingToken = tokenFuer(neuling);
tokens.push(neulingToken);
await klick(hud(neulingToken).knoepfe[0]);
assert.deepEqual(neuling.system.exploration, []);
assert.deepEqual(warnungen, ["Die Aktion Suchen fehlt im PF2e-Kompendium."]);

console.log("suchen-rauch: ok");
