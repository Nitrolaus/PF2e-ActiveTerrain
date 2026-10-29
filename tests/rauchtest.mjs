// Rauchtest des Geländepinsels mit Foundry-Attrappen. Aufruf: node tests/rauchtest.mjs
// Prüft Laden, Leiste unter Sequencer, Malen mit durchgehender Spur, Regionen, Anzeige und Betreten.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FELD = 100;
const hooks = new Map();
const einmal = new Map();
const protokoll = { regionen: [], chat: [], dialoge: 0, wuerfe: [], aktiviert: [], fehler: [] };

// Das Bild des Tokens am Ziel seines Zugs (refreshToken), wie Foundry es nach der Fahrt zeichnet.
const angekommen = (token) => hookAusloesen("refreshToken", { id: token.id, x: token.x, y: token.y });
function hookAusloesen(name, ...args) {
  for (const fn of einmal.get(name) ?? []) fn(...args);
  einmal.delete(name);
  for (const fn of hooks.get(name) ?? []) fn(...args);
}

class Ebene {
  static get layerOptions() { return { baseClass: Ebene, zIndex: 0 }; }
}
class Grafik {
  constructor() { this.striche = []; this.flaechen = []; this.punkt = null; this.destroyed = false; }
  clear() { this.striche = []; this.flaechen = []; return this; }
  moveTo(x, y) { this.punkt = { x, y }; return this; }
  lineTo(x, y) { this.ziel = { x, y }; return this; }
  stroke(stil) { this.striche.push({ von: this.punkt, nach: this.ziel, ...stil }); return this; }
  roundRect(x, y, breite, hoehe) { this.rechteck = { x, y, breite, hoehe }; return this; }
  poly(punkte) { this.rechteck = { punkte }; return this; }
  fill(stil) { this.flaechen.push({ ...this.rechteck, ...stil }); return this; }
  destroy() { this.destroyed = true; }
}
class Behaelter {
  constructor() { this.children = []; this.destroyed = false; }
  addChild(kind) { this.children.push(kind); kind.parent = this; return kind; }
  removeChild(kind) { this.children.splice(this.children.indexOf(kind), 1); }
  destroy() { this.destroyed = true; }
}
class Bild {
  constructor(textur) { this.textur = textur; this.destroyed = false; }
  destroy() { this.destroyed = true; }
}

const einstellungen = new Map();
const flags = {};
const szene = {
  id: "szene",
  tokens: [],
  regions: [],
  getFlag: (modul, schl) => flags[modul]?.[schl],
  setFlag: async (modul, schl, wert) => { flags[modul] ??= {}; flags[modul][schl] = structuredClone(wert); }
};
szene.regions.find = Array.prototype.find;
szene.createEmbeddedDocuments = async (typ, daten) => {
  for (const eintrag of daten) {
    const region = {
      typ,
      daten: structuredClone(eintrag),
      getFlag: (modul, schl) => eintrag.flags?.[modul]?.[schl],
      get name() { return region.daten.name; },
      update: async (aenderung) => { region.daten = { ...region.daten, ...structuredClone(aenderung) }; protokoll.regionen.push(["update", eintrag.flags.gelaendepinsel.art]); },
      delete: async () => { szene.regions.splice(szene.regions.indexOf(region), 1); protokoll.regionen.push(["delete", eintrag.flags.gelaendepinsel.art]); }
    };
    szene.regions.push(region);
    protokoll.regionen.push(["create", eintrag.flags.gelaendepinsel.art]);
  }
};

class DamageRoll {
  constructor(formel) { this.formel = formel; }
  async evaluate() { return this; }
  async toMessage(daten) { protokoll.wuerfe.push({ formel: this.formel, ...daten }); }
}

globalThis.foundry = {
  canvas: { layers: { InteractionLayer: Ebene } },
  utils: {
    mergeObject: (a, b) => ({ ...a, ...b }),
    escapeHTML: (text) => String(text),
    hasProperty: (objekt, pfad) => pfad.split(".").reduce((o, k) => (o && k in o ? o[k] : undefined), objekt) !== undefined
  },
  applications: { api: { DialogV2: { prompt: async () => { protokoll.dialoge += 1; return { formel: "2d6", art: "fire" }; } } } }
};
globalThis.Hooks = {
  callAll: (name, ...args) => hookAusloesen(name, ...args),
  on: (name, fn) => { if (!hooks.has(name)) hooks.set(name, []); hooks.get(name).push(fn); },
  once: (name, fn) => { if (!einmal.has(name)) einmal.set(name, []); einmal.get(name).push(fn); }
};
// Sprachdateien (zweisprachig seit 23.10.2026): Die Attrappe übersetzt wie Foundry aus lang/<sprache>.json,
// Vorgabe Deutsch, damit die deutschen Erwartungen unten gelten. Fehlende Schlüssel werden gesammelt.
const flach = (baum, vorne = "") => Object.entries(baum).flatMap(([k, v]) => (v && typeof v === "object" ? flach(v, `${vorne}${k}.`) : [[`${vorne}${k}`, v]]));
const texte = Object.fromEntries(["de", "en"].map((lang) => [lang, Object.fromEntries(flach(JSON.parse(readFileSync(new URL(`../lang/${lang}.json`, import.meta.url), "utf8"))))]));
const fehlendeSchluessel = new Set();
let sprache = "de";
const i18n = {
  localize: (schl) => {
    if (typeof texte[sprache][schl] === "string") return texte[sprache][schl];
    fehlendeSchluessel.add(schl);
    return schl;
  },
  format: (schl, daten = {}) => i18n.localize(schl).replace(/{[^}]+}/g, (k) => String(daten[k.slice(1, -1)]))
};
const spielleitung = { id: "gm", isGM: true };
globalThis.game = {
  i18n,
  user: spielleitung,
  users: Object.assign([spielleitung, { id: "stefan", isGM: false }], { activeGM: spielleitung }),
  settings: {
    register: (modul, name, daten) => einstellungen.set(name, { ...daten, wert: daten.default }),
    get: (_modul, name) => einstellungen.get(name).wert,
    set: async (_modul, name, wert) => { const e = einstellungen.get(name); e.wert = wert; e.onChange?.(wert); return wert; }
  }
};
globalThis.CONFIG = {
  Canvas: { layers: {} },
  Token: { movement: { actions: { walk: {}, fly: {}, swim: {}, climb: {}, burrow: {}, displace: { teleport: true } } } },
  Dice: { rolls: [DamageRoll] }
};
globalThis.CONST = { REGION_VISIBILITY: { LAYER: 0, GAMEMASTER: 1, ALWAYS: 2 } };
globalThis.PIXI = { Container: Behaelter, Graphics: Grafik };
globalThis.ChatMessage = { create: async (daten) => protokoll.chat.push(daten) };
globalThis.ui = {
  controls: { control: { name: "tokens" }, render: () => {}, activate: (daten) => { protokoll.aktiviert.push(daten); } },
  notifications: { error: (text) => protokoll.fehler.push(text) }
};
globalThis.canvas = {
  ready: true,
  scene: szene,
  level: { id: "ebene1" },
  interface: new Behaelter(),
  mousePosition: null,
  grid: {
    size: FELD,
    getOffset: ({ x, y }) => ({ i: Math.floor(y / FELD), j: Math.floor(x / FELD) }),
    getTopLeftPoint: ({ i, j }) => ({ x: j * FELD, y: i * FELD })
  }
};
const ruhe = async () => { for (let i = 0; i < 6; i += 1) await new Promise((r) => setTimeout(r, 0)); };
// Aufräumen nach drei Sekunden (0.2.14): Die Attrappe sammelt diese Uhren, statt zu warten; der Test
// unten löst eine davon selbst aus.
const echteUhr = globalThis.setTimeout;
const aufraeumUhren = [];
globalThis.setTimeout = (fn, ms, ...rest) => (ms === 3000 ? aufraeumUhren.push(fn) : echteUhr(fn, ms, ...rest));
const maus = (spalte, zeile) => { canvas.mousePosition = { x: spalte * FELD + 50, y: zeile * FELD + 50 }; };

const modul = await import("../scripts/gelaendepinsel.mjs");

// Laden und Anmelden
hookAusloesen("init");
assert.equal(CONFIG.Canvas.layers.gelaendepinsel.group, "interface");
assert.equal(typeof CONFIG.Canvas.layers.gelaendepinsel.layerClass, "function");
assert.ok(einstellungen.has("anzeigen") && einstellungen.has("art") && einstellungen.has("groesse"));
assert.equal(hooks.has("getSceneControlButtons"), false, "Leiste erst in setup, nach Sequencer");
hookAusloesen("setup");
const leiste = hooks.get("getSceneControlButtons")[0];

// Leiste: direkt unter Sequencer
{
  const controls = { tokens: { order: 1 }, walls: { order: 5 }, sequencer: { name: "sequencer" }, fxmaster: { order: 100 } };
  leiste(controls);
  assert.deepEqual(Object.keys(controls), ["tokens", "walls", "sequencer", "gelaendepinsel", "fxmaster"]);
  assert.equal("order" in controls.gelaendepinsel, false, "Sequencer ohne Reihenfolge: die eigene auch ohne");
  assert.equal(controls.gelaendepinsel.layer, "gelaendepinsel");
  assert.deepEqual(Object.keys(controls.gelaendepinsel.tools), ["schwierig", "sehr", "gefahr", "schmal", "uneben", "radierer", "aufdecken", "werte", "groesse05", "groesse1", "groesse2", "groesse3", "verborgen"]);
  // Verborgen malen (0.3.14): Aufdeck-Pinsel mit Auge, Schalter mit durchgestrichenem Auge neben den Größen
  assert.equal(controls.gelaendepinsel.tools.aufdecken.icon, "fa-solid fa-eye");
  assert.equal(controls.gelaendepinsel.tools.verborgen.icon, "fa-solid fa-eye-slash");
  assert.equal(controls.gelaendepinsel.tools.verborgen.toggle, true);
  assert.equal(controls.gelaendepinsel.tools.verborgen.active, false, "Vorgabe: sichtbar malen");
  const symbole = ["schwierig", "sehr", "gefahr", "schmal", "uneben"].map((art) => controls.gelaendepinsel.tools[art].icon);
  assert.equal(new Set(symbole).size, 5, "Fünf verschiedene Symbole im Menü");
  assert.equal(symbole.includes("fa-solid fa-paintbrush"), false, "Kein gleicher Pinsel mehr");
  // Seit 0.2.3 die eigenen Bilder im Menü, dieselben wie am Token (Wunsch: "nimm diese Bilder").
  const css = readFileSync(new URL("../styles/gelaendepinsel.css", import.meta.url), "utf8");
  for (const art of ["schwierig", "sehr", "gefahr", "schmal", "uneben"]) {
    assert.equal(controls.gelaendepinsel.tools[art].icon, `gelaendepinsel-symbol gelaendepinsel-symbol-${art}`);
    assert.ok(css.includes(`button.gelaendepinsel-symbol-${art}, :not(button).gelaendepinsel-symbol-${art}::before { background-image: url("../assets/symbole/${art}.png")`), `CSS für ${art}`);
    const png = readFileSync(new URL(`../assets/symbole/${art}.png`, import.meta.url));
    assert.equal(png.toString("latin1", 1, 4), "PNG", `Bild für ${art} ist ein PNG`);
    assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [48, 48], `Bild für ${art} hat 48 mal 48 Pixel`);
    assert.equal(modul.BILDER[art], `modules/gelaendepinsel/assets/symbole/${art}.png`);
  }
  // Kurzerklärung beim Überfahren (0.2.6).
  assert.equal(controls.gelaendepinsel.tools.schwierig.title, "Schwieriges Gelände: jedes Feld kostet 5 Fuß mehr, kein Schritt hinein");
  assert.match(controls.gelaendepinsel.tools.sehr.title, /^Sehr Schwieriges Gelände: jedes Feld kostet 10 Fuß mehr/);
  assert.match(controls.gelaendepinsel.tools.gefahr.title, /Schaden/);
  assert.match(controls.gelaendepinsel.tools.schmal.title, /Balancieren.*Absturz/);
  assert.match(controls.gelaendepinsel.tools.uneben.title, /Balancieren.*Liegend/);
  assert.match(controls.gelaendepinsel.tools.radierer.title, /^Radierer: .*Rechtsklick/);
  for (const tool of Object.values(controls.gelaendepinsel.tools)) assert.doesNotMatch(tool.title, /[–—…„“”]/, "Nur gerade Striche und Anführungszeichen");
  // Pinselgröße wie ein Wahlschalter (0.2.5): immer genau eine an, Vorgabe ein Feld.
  {
    const groessen = ["groesse05", "groesse1", "groesse2", "groesse3"];
    const werkzeuge = controls.gelaendepinsel.tools;
    assert.deepEqual(groessen.filter((name) => werkzeuge[name].active), ["groesse1"], "Vorgabe: ein Feld");
    const vorherUi = globalThis.ui;
    let gezeichnet = 0;
    globalThis.ui = { ...vorherUi, controls: { controls: { gelaendepinsel: controls.gelaendepinsel }, render: () => { gezeichnet += 1; } } };
    for (const name of groessen) werkzeuge[name].active = true;
    await werkzeuge.groesse2.onChange({}, true);
    assert.deepEqual(groessen.filter((name) => werkzeuge[name].active), ["groesse2"], "Nur zwei Felder an");
    assert.equal(game.settings.get("gelaendepinsel", "groesse"), 2);
    assert.equal(gezeichnet, 1, "Menü neu gezeichnet");
    werkzeuge.groesse2.active = false;
    await werkzeuge.groesse2.onChange({}, false);
    assert.deepEqual(groessen.filter((name) => werkzeuge[name].active), ["groesse2"], "Klick auf die aktive Größe lässt sie an");
    await werkzeuge.groesse1.onChange({}, true);
    assert.deepEqual(groessen.filter((name) => werkzeuge[name].active), ["groesse1"]);
    globalThis.ui = vorherUi;
  }
  assert.equal(controls.gelaendepinsel.activeTool, "schwierig");
  const mitOrdnung = { tokens: { order: 1 }, sequencer: { name: "sequencer", order: 9 }, fxmaster: { order: 100 } };
  leiste(mitOrdnung);
  assert.equal(mitOrdnung.gelaendepinsel.order, 9.5);
  const ohneSequencer = { tokens: { order: 1 }, fxmaster: { order: 100 } };
  leiste(ohneSequencer);
  assert.equal(ohneSequencer.gelaendepinsel.order, 101, "Ohne Sequencer ans Ende");
}

// Leiste für Spieler: ein Schalter, der zurück zu den Tokens springt
{
  game.user = { id: "stefan", isGM: false };
  const controls = { tokens: { order: 1 }, sequencer: { name: "sequencer" } };
  leiste(controls);
  const gruppe = controls.gelaendepinsel;
  assert.equal(gruppe.layer, undefined, "Spieler bekommen keine Pinsel-Ebene");
  assert.deepEqual(gruppe.tools, {});
  // Vorgabe an (0.3.11): Spieler sehen Linien und Abzeichen ohne Klick, der Berg blendet aus
  assert.equal(einstellungen.get("anzeigen").default, true);
  assert.equal(gruppe.title, "Gelände ausblenden");
  ui.controls.control = { name: "gelaendepinsel" };
  gruppe.onChange({}, true);
  await ruhe();
  assert.equal(einstellungen.get("anzeigen").wert, false);
  assert.deepEqual(protokoll.aktiviert.at(-1), { control: "tokens" });
  const wieder = { tokens: { order: 1 }, sequencer: { name: "sequencer" } };
  leiste(wieder);
  assert.equal(wieder.gelaendepinsel.title, "Gelände anzeigen", "nach dem Klick aus, der Berg bietet Anzeigen an");
  await game.settings.set("gelaendepinsel", "anzeigen", true);
  game.user = spielleitung;
  ui.controls.control = { name: "tokens" };
}

// Malen am Raster (Erweitert, wie bis 0.1.2): Spur von (2,3) nach (6,3), schwieriges Gelände, Stempel 1
await game.settings.set("gelaendepinsel", "rasterModus", true);
const Klasse = CONFIG.Canvas.layers.gelaendepinsel.layerClass;
const ebene = new Klasse();
assert.equal(ebene._canDragLeftStart({ isGM: false }), false);
maus(2, 3);
ebene._onDragLeftStart({});
maus(6, 3);
ebene._onDragLeftMove({});
ebene._onDragLeftDrop({});
await ruhe();
assert.deepEqual(flags.gelaendepinsel.felder.schwierig, ["2,3", "3,3", "4,3", "5,3", "6,3"], "Durchgehende Spur ohne Lücke");
assert.deepEqual(protokoll.regionen, [["create", "schwierig"]]);
const region = szene.regions[0].daten;
assert.deepEqual(region.shapes.map(({ x, y, width, height }) => ({ x, y, width, height })), [{ x: 200, y: 300, width: 500, height: 100 }]);
assert.equal(region.behaviors[0].type, "modifyMovementCost");
assert.deepEqual(region.behaviors[0].system.difficulties, { walk: 2, fly: 1, swim: 2, climb: 2, burrow: 2, displace: 2 });
assert.deepEqual(region.levels, ["ebene1"]);
assert.equal(region.visibility, 0);
assert.equal(region.name, "PF2e-ActiveTerrain: Schwieriges Gelände", "Neue Regionen mit dem neuen Namen (0.2.28)");
// Alte Regionen ziehen beim nächsten Abgleich mit; Namen von Hand bleiben.
szene.regions[0].daten.name = "Geländepinsel: Schwieriges Gelände";

// Sehr schwierig über ein Feld: ersetzt dort das schwierige
await game.settings.set("gelaendepinsel", "art", "sehr");
maus(4, 3);
ebene._onClickLeft({});
await ruhe();
assert.deepEqual(flags.gelaendepinsel.felder.schwierig, ["2,3", "3,3", "5,3", "6,3"]);
assert.deepEqual(flags.gelaendepinsel.felder.sehr, ["4,3"]);
assert.equal(szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "schwierig").daten.shapes.length, 2);
assert.deepEqual(szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "sehr").daten.behaviors[0].system.difficulties.walk, 3);
assert.equal(szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "schwierig").daten.name, "PF2e-ActiveTerrain: Schwieriges Gelände", "Alter Name umgezogen");
szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "sehr").daten.name = "Moor";

// Gefährlich über ein Feld (0.2.11): liegt über dem sehr schwierigen, das bleibt.
await game.settings.set("gelaendepinsel", "art", "gefahr");
maus(4, 3);
ebene._onClickLeft({});
await ruhe();
assert.deepEqual(flags.gelaendepinsel.felder.sehr, ["4,3"], "Sehr schwierig bleibt unter dem gefährlichen");
assert.deepEqual(flags.gelaendepinsel.felder.gefahr, ["4,3"]);
assert.deepEqual(flags.gelaendepinsel.felder.schwierig, ["2,3", "3,3", "5,3", "6,3"]);
assert.equal(szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "sehr").daten.name, "Moor", "Eigener Name bleibt");

// Radierer mit Stempel 3: entfernt alles um (5,3); sehr schwieriges leer -> Region weg
await game.settings.set("gelaendepinsel", "art", "radierer");
await game.settings.set("gelaendepinsel", "groesse", 3);
maus(4, 3);
ebene._onClickLeft({});
await ruhe();
assert.deepEqual(flags.gelaendepinsel.felder.schwierig, ["2,3", "6,3"]);
assert.deepEqual(flags.gelaendepinsel.felder.sehr, []);
assert.deepEqual(flags.gelaendepinsel.felder.gefahr, [], "Der Radierer nimmt auch das gefährliche");
assert.ok(protokoll.regionen.some(([was, art]) => was === "delete" && art === "sehr"));

// Anzeige seit 0.1.1: für alle gestrichelt, ein Zehntel so dick wie in 0.1.0 (hier die einfache Darstellung)
await game.settings.set("gelaendepinsel", "darstellung", "einfach");
modul.anzeige.behaelter = null;
modul.anzeige.zeichnen();
const striche = modul.anzeige.grafik.striche;
assert.equal(striche.length, 32, "Zwei einzelne Felder: je vier Ränder zu je vier Strichen");
assert.ok(striche.every((s) => s.width === 1.5), "Linie 1,5 Pixel statt 7,4 bei Feldgröße 100");
// Deckkraft einstellbar (0.1.2): Vorgabe 40 Prozent, im Einstellungsmenue als Regler.
assert.ok(striche.every((s) => s.alpha === 0.4), "Vorgabe 40 Prozent");
assert.equal(einstellungen.get("deckkraft").config, true, "Im Einstellungsmenue");
assert.deepEqual(einstellungen.get("deckkraft").range, { min: 10, max: 100, step: 5 });
assert.match(einstellungen.get("deckkraft").name, /^GELAENDEPINSEL\./, "Name als Schlüssel, Foundry übersetzt ihn");
assert.match(game.i18n.localize(einstellungen.get("deckkraft").name), /^Erweitert:/);
await game.settings.set("gelaendepinsel", "deckkraft", 100);
assert.ok(modul.anzeige.grafik.striche.every((s) => s.alpha === 1), "100 Prozent: voll deckend, sofort neu gezeichnet");
await game.settings.set("gelaendepinsel", "deckkraft", 40);
// Strichstärke einstellbar (23.10.2026): Faktor auf die bisherige Breite max(1,5 Pixel, 0,75 Prozent
// der Feldgröße). Vorgabe 100 Prozent zeichnet genau wie vorher.
{
  const staerke = einstellungen.get("strichstaerke");
  assert.equal(staerke.config, true, "Im Einstellungsmenue");
  assert.equal(staerke.scope, "client");
  assert.deepEqual(staerke.range, { min: 50, max: 300, step: 10 });
  assert.equal(staerke.default, 100, "Vorgabe 100 Prozent");
  assert.equal(game.i18n.localize(staerke.name), "Erweitert: Strichstärke der Geländelinien");
  const breiten = () => [...new Set(modul.anzeige.grafik.striche.map((s) => s.width))];
  assert.equal(modul.anzeige.grafik.striche.length, 32);
  assert.deepEqual(breiten(), [1.5], "Vorgabe: die bisherige Breite");
  await game.settings.set("gelaendepinsel", "strichstaerke", 200);
  assert.equal(modul.anzeige.grafik.striche.length, 32, "Sofort neu gezeichnet, dieselben Striche");
  assert.deepEqual(breiten(), [3], "200 Prozent: doppelt so breit");
  await game.settings.set("gelaendepinsel", "strichstaerke", 50);
  assert.deepEqual(breiten(), [0.75], "50 Prozent: halb so breit");
  // Große Felder: Die bisherige Breite wächst mit der Feldgröße, der Faktor wirkt darauf.
  canvas.grid.size = 400;
  await game.settings.set("gelaendepinsel", "strichstaerke", 100);
  assert.deepEqual(breiten(), [3], "Feldgröße 400, Vorgabe: wie bisher 0,75 Prozent der Feldgröße");
  await game.settings.set("gelaendepinsel", "strichstaerke", 300);
  assert.deepEqual(breiten(), [9]);
  canvas.grid.size = FELD;
  await game.settings.set("gelaendepinsel", "strichstaerke", 100);
  assert.deepEqual(breiten(), [1.5]);
}
game.user = { id: "stefan", isGM: false };
await game.settings.set("gelaendepinsel", "anzeigen", false);
modul.anzeige.zeichnen();
assert.equal(modul.anzeige.grafik.striche.length, 0, "Spieler ohne Schalter sehen nichts");
await game.settings.set("gelaendepinsel", "anzeigen", true);
assert.equal(modul.anzeige.grafik.striche.length, 32, "Spieler mit Schalter sehen dasselbe");
// 29.10.2026: "die Spieler sollen aber auch nur die gestrichelte Linie sehen, nicht eine gelbe Kachel"
assert.equal(modul.anzeige.grafik.flaechen.length, 0, "Spieler sehen nur die gestrichelte Linie, keine Kacheln");
// Sicht der Spieler (0.3.13, 29.10.2026: "das schwierige Gelände sieht man auch durch die Türe"): nur Striche,
// deren Mitte der Spieler sieht oder schon erkundet hat; ohne Token-Sicht der Szene wie bisher
{
  let n = 0;
  canvas.visibility = { tokenVision: true, testVisibility: () => false };
  canvas.fog = { isPointExplored: () => false };
  modul.anzeige.zeichnen();
  assert.equal(modul.anzeige.grafik.striche.length, 0, "hinter Tür und Wand, nie gesehen: keine Striche");
  canvas.fog.isPointExplored = () => true;
  modul.anzeige.zeichnen();
  assert.equal(modul.anzeige.grafik.striche.length, 32, "erkundet: wie die Karte");
  canvas.fog.isPointExplored = () => false;
  canvas.visibility.testVisibility = (punkt, { tolerance }) => { assert.equal(tolerance, 2); n += 1; return n % 2 === 1; };
  modul.anzeige.zeichnen();
  assert.equal(modul.anzeige.grafik.striche.length, 16, "nur die sichtbaren Striche");
  canvas.visibility.testVisibility = () => false;
  szene.tokenVision = false;
  modul.anzeige.zeichnen();
  assert.equal(modul.anzeige.grafik.striche.length, 32, "Szene ohne Token-Sicht: alles");
  delete szene.tokenVision;
  // Neu gezeichnet wird, wenn Foundry die Sicht neu rechnet, höchstens alle 150 ms
  modul.anzeige.zeichnen();
  assert.equal(modul.anzeige.grafik.striche.length, 0);
  canvas.visibility.testVisibility = () => true;
  for (const fn of hooks.get("sightRefresh") ?? []) fn();
  for (const fn of hooks.get("updateWall") ?? []) fn();
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(modul.anzeige.grafik.striche.length, 32, "nach dem Neuberechnen der Sicht neu gezeichnet");
  game.user = spielleitung;
  canvas.visibility.testVisibility = () => false;
  modul.anzeige.zeichnen();
  assert.ok(modul.anzeige.grafik.striche.length >= 32, "die SL sieht alles");
  game.user = { id: "stefan", isGM: false };
  delete canvas.visibility;
  delete canvas.fog;
}
await game.settings.set("gelaendepinsel", "strichstaerke", 200);
assert.ok(modul.anzeige.grafik.striche.every((s) => s.width === 3), "Strichstärke gilt auch für Spieler");
await game.settings.set("gelaendepinsel", "strichstaerke", 100);
await game.settings.set("gelaendepinsel", "anzeigen", false);
game.user = spielleitung;
// Zaehlende Felder blass hinterlegt (nur SL): zwei Felder, zwei Flaechen.
modul.anzeige.zeichnen();
assert.equal(modul.anzeige.grafik.flaechen.length, 2, "SL sieht die zaehlenden Felder blass");
await game.settings.set("gelaendepinsel", "zaehlendeFelder", false);
assert.equal(modul.anzeige.grafik.flaechen.length, 0, "Abschaltbar");
await game.settings.set("gelaendepinsel", "zaehlendeFelder", true);
await game.settings.set("gelaendepinsel", "darstellung", "weich");

// Abzeichen rechts oben neben dem Token, je Geländeart, auf der er steht
{
  const flaeche = (spalte, zeile, art) => { flags.gelaendepinsel.felder[art] = [...new Set([...(flags.gelaendepinsel.felder[art] ?? []), `${spalte},${zeile}`])]; };
  flaeche(10, 10, "sehr");
  flaeche(11, 10, "schwierig");
  const lebewesen = { isOfType: (art) => art === "creature", system: { movement: { terrain: { difficult: { ignored: [] }, greater: { ignored: [] } } } } };
  const duncan = { id: "duncan", x: 1000, y: 1000, w: 100, h: 100, visible: true, actor: lebewesen };
  const riese = { id: "riese", x: 1000, y: 1000, w: 200, h: 200, visible: true, actor: lebewesen };
  const versteckt = { id: "versteckt", x: 1000, y: 1000, w: 100, h: 100, visible: false, actor: lebewesen };
  // 23.10.2026: Stiefel an Schatzkiste und Kartenmarke "C4 a". Abzeichen nur an Kreaturen (0.2.7).
  const kiste = { id: "kiste", x: 1000, y: 1000, w: 100, h: 100, visible: true, actor: { isOfType: () => false, system: {} } };
  const marke = { id: "marke", x: 1000, y: 1000, w: 100, h: 100, visible: true, actor: null };
  canvas.tokens = { placeables: [duncan, riese, versteckt, kiste, marke] };
  modul.abzeichen.alleZeichnen();
  assert.deepEqual(modul.artenUnterToken(riese, modul.felderDerSzene()), ["sehr", "schwierig"], "Großer Token: beide Arten, sehr schwierig zuerst");
  const grafikDuncan = modul.abzeichen.je.get("duncan");
  assert.ok(grafikDuncan, "Duncan auf sehr schwierigem Gelände bekommt ein Abzeichen");
  assert.equal(grafikDuncan.flaechen.length, 2, "Grund und Stiefel");
  assert.equal(grafikDuncan.flaechen[0].color, 0xff8c3a, "In der Farbe von sehr schwierigem Gelände");
  assert.ok(grafikDuncan.flaechen[0].x >= 1100 && grafikDuncan.flaechen[0].y === 1000, "Rechts oben neben dem Token");
  // Seit 0.2.2 (Wunsch: "A überall"): Stiefel und fünf Strahlen an der Sohle, weiß auf Orange.
  assert.equal(grafikDuncan.flaechen[1].punkte?.length, 16, "Der Stiefel als Vieleck mit acht Ecken");
  assert.equal(grafikDuncan.flaechen[1].color, 0xffffff);
  assert.equal(grafikDuncan.striche.length, 5, "Fünf Strahlen für sehr schwierig");
  assert.ok(grafikDuncan.flaechen[1].punkte.every((wert, index) => index % 2
    ? wert >= 1000 && wert <= 1024 : wert >= 1102 && wert <= 1126), "Der Stiefel bleibt im Abzeichen");
  assert.equal(modul.abzeichen.je.get("riese").flaechen.length, 4);
  // Lage einstellbar (0.2.11): Grund des ersten und des zweiten Abzeichens am großen Token.
  const erwartet = {
    rechtsOben: [[1202.4, 1000], [1202.4, 1026.4]],
    rechtsUnten: [[1202.4, 1176], [1202.4, 1149.6]],
    linksOben: [[973.6, 1000], [973.6, 1026.4]],
    linksUnten: [[973.6, 1176], [973.6, 1149.6]],
    oben: [[1000, 973.6], [1026.4, 973.6]],
    unten: [[1000, 1202.4], [1026.4, 1202.4]]
  };
  assert.deepEqual(Object.keys(erwartet), Object.keys(modul.ABZEICHEN_LAGEN), "Sechs Lagen zur Wahl");
  assert.equal(einstellungen.get("abzeichenLage").default, "rechtsOben", "Vorgabe wie bisher");
  for (const [lage, punkte] of Object.entries(erwartet)) {
    await game.settings.set("gelaendepinsel", "abzeichenLage", lage);
    const grund = modul.abzeichen.je.get("riese").flaechen.filter((_f, i) => i % 2 === 0);
    assert.deepEqual(grund.map((f) => [Math.round(f.x * 10) / 10, Math.round(f.y * 10) / 10]), punkte, `Lage ${lage}`);
  }
  await game.settings.set("gelaendepinsel", "abzeichenLage", "rechtsOben");
  assert.equal(modul.abzeichen.je.has("versteckt"), false, "Unsichtbare Tokens bekommen keins");
  assert.equal(modul.abzeichen.je.has("kiste"), false, "Schatzkiste (Beute) bekommt keins");
  assert.equal(modul.abzeichen.je.has("marke"), false, "Kartenmarke ohne Akteur bekommt keins");
  // Fährt weg: Abzeichen verschwindet, beim Zurückfahren kommt es wieder.
  duncan.x = 1500;
  hookAusloesen("refreshToken", duncan);
  assert.equal(modul.abzeichen.je.has("duncan"), false);
  assert.equal(grafikDuncan.destroyed, true);
  duncan.x = 1100;
  hookAusloesen("refreshToken", duncan);
  assert.equal(modul.abzeichen.je.get("duncan").flaechen[0].color, 0xffd34d, "Jetzt schwierig");
  assert.equal(modul.abzeichen.je.get("duncan").flaechen[1].color, 0x3d2e00, "Auf Gelb ein dunkler Stiefel");
  assert.equal(modul.abzeichen.je.get("duncan").striche.length, 3, "Drei Strahlen für schwierig");
  // Spieler sehen es nur mit eingeschalteter Anzeige.
  game.user = { id: "stefan", isGM: false };
  hookAusloesen("refreshToken", duncan);
  assert.equal(modul.abzeichen.je.has("duncan"), false);
  await game.settings.set("gelaendepinsel", "anzeigen", true);
  assert.equal(modul.abzeichen.je.has("duncan"), true, "Schalter an: Abzeichen da");
  await game.settings.set("gelaendepinsel", "anzeigen", false);
  assert.equal(modul.abzeichen.je.has("duncan"), false, "Schalter aus: wieder weg");
  game.user = spielleitung;
  hookAusloesen("deleteToken", { id: "riese" });
  assert.equal(modul.abzeichen.je.has("riese"), false);
  canvas.tokens = { placeables: [] };
}

// Betreten: gefährliches Gelände bei (5,5), schmale Oberfläche bei (5,7)
await game.settings.set("gelaendepinsel", "art", "gefahr");
await game.settings.set("gelaendepinsel", "groesse", 1);
maus(5, 5);
ebene._onClickLeft({});
await game.settings.set("gelaendepinsel", "art", "schmal");
maus(5, 7);
ebene._onClickLeft({});
await ruhe();
const silvor = { id: "silvor", name: "Silvor", x: 300, y: 500, width: 1, height: 1, parent: szene };
szene.tokens.push({ ...silvor });
hookAusloesen("canvasReady");
silvor.x = 700;
hookAusloesen("updateToken", silvor, { x: 700 }, {});
angekommen(silvor);
await ruhe();
// Seit 0.2.7 statt Nachfrage eine Karte mit Rettungswurf und Schadenswurf zum Anklicken.
assert.equal(protokoll.dialoge, 0, "Keine Nachfrage mehr");
const gefahrKarte = protokoll.chat.at(-1);
assert.match(gefahrKarte.content, /Silvor<\/strong> geht durch gefährliches Gelände/);
assert.match(gefahrKarte.content, /@Check\[reflex\|dc:\d+\|basic\|options:gelaendepinsel:gelaende:silvor:5_5\]/, "Einfacher Reflexwurf mit Kennung");
assert.match(gefahrKarte.content, /@Damage\[2d6\[fire\]\]/, "Schaden zum Würfeln, angewendet von der Spielleitung");
assert.deepEqual(gefahrKarte.whisper, ["gm"]);

// Rettungswurf ausgewertet wie bei den Fallen (0.3.18, 29.10.2026: "ja, bau das wie bei den Fallen")
{
  const geklickt = [];
  foundry.applications.ux = { TextEditor: { implementation: { enrichHTML: async (text) => text } } };
  globalThis.MouseEvent = class { constructor(typ) { this.type = typ; } };
  globalThis.document = { body: { append() {} }, createElement: () => {
    const el = { style: {}, dataset: {}, innerHTML: "", remove() {} };
    el.querySelector = () => ({ dispatchEvent: () => geklickt.push(/^@Damage\[(.*)\]$/u.exec(el.innerHTML)?.[1]) });
    return el;
  } };
  szene.tokens.has = (id) => szene.tokens.some((d) => d.id === id);
  szene.tokens.get = (id) => szene.tokens.find((d) => d.id === id);
  game.scenes = [szene];
  const wurf = (outcome, options = ["gelaendepinsel:gelaende:silvor:5_5"]) => {
    hookAusloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome, options } } } });
    return new Promise((fertig) => echteUhr(fertig, 400));
  };
  const vorher = protokoll.chat.length;
  await wurf("criticalFailure");
  assert.match(protokoll.chat.at(-1).content, /Silvor<\/strong>: Kritischer Fehlschlag\. Doppelten Schaden anwenden\./u);
  assert.deepEqual(protokoll.chat.at(-1).whisper, ["gm"], "Meldung nur an die Spielleitung");
  assert.deepEqual(geklickt, ["2d6[fire]"], "Schaden gewürfelt");
  await wurf("success");
  assert.match(protokoll.chat.at(-1).content, /Erfolg\. Halben Schaden anwenden\./u);
  await wurf("failure");
  assert.match(protokoll.chat.at(-1).content, /Fehlschlag\. Voller Schaden\./u);
  await wurf("criticalSuccess");
  assert.match(protokoll.chat.at(-1).content, /Kritischer Erfolg, kein Schaden/u);
  assert.equal(geklickt.length, 3, "kritischer Erfolg würfelt keinen Schaden");
  // Ohne Kennung, ohne Erfolgsgrad oder nicht bei der aktiven Spielleitung: nichts
  const stand = protokoll.chat.length;
  await wurf("failure", ["gelaendepinsel:falle:x:y:z"]);
  await wurf(undefined);
  game.user = { id: "gm2", isGM: true };
  await wurf("failure");
  game.user = spielleitung;
  assert.equal(protokoll.chat.length, stand, "fremde Würfe bleiben unberührt");
  assert.equal(protokoll.chat.length, vorher + 4);
  delete foundry.applications.ux;
  delete globalThis.MouseEvent;
  delete globalThis.document;
  delete szene.tokens.has;
  delete szene.tokens.get;
  delete game.scenes;
}
const chatNachGefahr = protokoll.chat.length;

// Mit Foundrys Wegpunkten um das Feld herum: keine Nachfrage
silvor.x = 300;
hookAusloesen("updateToken", silvor, { x: 300 }, { _movement: { silvor: { passed: { waypoints: [
  { x: 600, y: 600, action: "walk" }, { x: 400, y: 600, action: "walk" }, { x: 300, y: 500, action: "walk" }
] } } } });
angekommen(silvor);
await ruhe();
assert.equal(protokoll.chat.length, chatNachGefahr, "Weg führt nicht durch das gefährliche Feld");

// Teleport betritt nichts
silvor.x = 700;
hookAusloesen("updateToken", silvor, { x: 700 }, { _movement: { silvor: { passed: { waypoints: [{ x: 700, y: 500, action: "displace" }] } } } });
angekommen(silvor);
await ruhe();
assert.equal(protokoll.chat.length, chatNachGefahr, "Teleport ohne Karte");

// Schmale Oberfläche: Hinweis nur an die Spielleitung
// Von (7,5) schräg nach (5,7): über (6,6) auf die schmale Oberfläche.
silvor.x = 500;
silvor.y = 700;
hookAusloesen("updateToken", silvor, { x: 500, y: 700 }, {});
angekommen(silvor);
await ruhe();
assert.equal(protokoll.chat.length, chatNachGefahr + 1);
assert.deepEqual(protokoll.chat.at(-1).whisper, ["gm"]);
assert.match(protokoll.chat.at(-1).content, /schmale Oberfläche: Balancieren/);
assert.match(protokoll.chat.at(-1).content, /@Check\[acrobatics\|dc:\d+\]/, "Knopf für Akrobatik");

// Nur die aktive Spielleitung prüft
game.user = { id: "gm2", isGM: true };
silvor.y = 500;
silvor.x = 300;
const chatVorGm2 = protokoll.chat.length;
hookAusloesen("updateToken", silvor, { x: 300, y: 500 }, {});
angekommen(silvor);
await ruhe();
assert.equal(protokoll.chat.length, chatVorGm2);
game.user = spielleitung;

// Große Tokens zählen mit ihrer ganzen Fläche
{
  const troll = { id: "troll", x: 300, y: 300, width: 2, height: 2, parent: szene };
  const steg = { schmal: new Set(["3,4", "4,4", "5,4"]) };
  assert.deepEqual([...modul.betreteneArten(troll, { x: 100, y: 300 }, {}, steg, ["schmal"])], [["schmal", "3,4"]],
    "Betritt mit der rechten Kante, schon beim ersten Schritt");
  troll.x = 400;
  assert.equal(modul.betreteneArten(troll, { x: 300, y: 300 }, {}, steg, ["schmal"]).size, 0, "Schon darin: betritt nichts");
  // Hysterese (0.2.26, gemeldet: "Silvor hat in dem Feld ein weiteres Mal gestoppt"): Schräg über die Ecke von
  // einem Feld der Fläche ins nächste deckt er zwischendurch keines zur Hälfte; das ist kein Verlassen.
  const block = { gefahr: new Set(["4,30", "5,30", "4,31", "5,31"]) };
  const schraeg = { id: "schraeg", x: 500, y: 3100, width: 1, height: 1, parent: szene };
  assert.equal(modul.betreteneArten(schraeg, { x: 400, y: 3000 }, {}, block, ["gefahr"]).size, 0, "Schräg innerhalb der Fläche: kein neues Betreten");
  // Wer sie ganz verlässt und wiederkommt, betritt sie neu.
  schraeg.x = 400;
  schraeg.y = 3000;
  const hinausHinein = { _movement: { schraeg: { passed: { waypoints: [{ x: 700, y: 3000, action: "walk" }, { x: 400, y: 3000, action: "walk" }] } } } };
  assert.equal(modul.betreteneArten(schraeg, { x: 400, y: 3000 }, hinausHinein, block, ["gefahr"]).get("gefahr"), "5,30", "Ganz hinaus und zurück: neu");
}

// Fliegend: Abzeichen blass, keine Nachfrage bei Gefahr
{
  const fliegt = { id: "fliegt", x: 500, y: 500, w: 100, h: 100, visible: true, document: { movementAction: "fly" }, actor: { isOfType: () => true, system: { movement: { terrain: { difficult: { ignored: [] }, greater: { ignored: [] } } } } } };
  canvas.tokens = { placeables: [fliegt] };
  modul.abzeichen.alleZeichnen();
  assert.equal(modul.abzeichen.je.get("fliegt").flaechen[0].alpha, 0.35, "Gelaende betrifft ihn nicht: blass");
  canvas.tokens = { placeables: [] };
  const vorher = protokoll.chat.length;
  const flieger = { id: "flieger", name: "Flieger", x: 300, y: 500, width: 1, height: 1, parent: szene, movementAction: "fly", actor: fliegt.actor };
  szene.tokens.push({ ...flieger });
  hookAusloesen("canvasReady");
  flieger.x = 700;
  hookAusloesen("updateToken", flieger, { x: 700 }, { _movement: { flieger: { passed: { waypoints: [{ x: 700, y: 500, action: "fly" }] } } } });
  angekommen(flieger);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher, "Ueber gefaehrliches Gelaende geflogen: keine Karte");
}

// Frei malen (0.2.0): runder Pinsel quer durch Zeile 8, Breite 1 Feld
await game.settings.set("gelaendepinsel", "rasterModus", false);
await game.settings.set("gelaendepinsel", "art", "schwierig");
await game.settings.set("gelaendepinsel", "groesse", 1);
canvas.mousePosition = { x: 250, y: 850 };
ebene._onDragLeftStart({});
for (const x of [400, 550, 700, 850]) {
  canvas.mousePosition = { x, y: 850 };
  ebene._onDragLeftMove({});
}
assert.ok(modul.anzeige.entwurfStrich, "Waehrend des Malens eine Vorschau");
// Seit 0.2.10 ein durchgehendes rundes Band statt eines Rechtecks je Mausstueck ("wie Bretter verlegen").
{
  const band = modul.anzeige.grafik.striche.filter((strich) => strich.alpha === 0.25);
  assert.equal(band.length, 1, "Ein Band, nicht ein Stueck je Mausbewegung");
  assert.equal(band[0].cap, "round", "Runde Enden");
  assert.equal(band[0].join, "round", "Runde Biegungen");
  assert.deepEqual([band[0].von.x, band[0].nach.x], [250, 850], "Vom ersten bis zum letzten Mauspunkt");
}
ebene._onDragLeftDrop({});
await ruhe();
assert.equal(flags.gelaendepinsel.striche.length, 1);
const freierStrich = flags.gelaendepinsel.striche[0];
assert.equal(freierStrich.art, "schwierig");
assert.equal(freierStrich.r, 0.5);
assert.equal(freierStrich.p.length, 4, "Gerade Spur auf zwei Punkte vereinfacht");
const frei = modul.felderDerSzene();
for (let s = 3; s <= 7; s += 1) assert.ok(frei.schwierig.has(`${s},8`), `Feld ${s},8 zaehlt`);
assert.equal(frei.schwierig.has("5,7"), false);
const regionSchwierig = szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "schwierig");
assert.ok(regionSchwierig.daten.shapes.some((f) => f.y === 800), "Region deckt Zeile 8");
modul.anzeige.zeichnen();
assert.ok(modul.anzeige.grafik.striche.length > 0, "Weicher Rand gezeichnet");
assert.ok(modul.anzeige.grafik.striche.every((s) => s.width === 1.5));
await game.settings.set("gelaendepinsel", "strichstaerke", 200);
assert.ok(modul.anzeige.grafik.striche.length > 0 && modul.anzeige.grafik.striche.every((s) => s.width === 3), "Strichstärke auch beim weichen Rand");
await game.settings.set("gelaendepinsel", "strichstaerke", 100);
await game.settings.set("gelaendepinsel", "darstellung", "aus");
assert.equal(modul.anzeige.grafik.striche.length, 0, "Darstellung aus");
await game.settings.set("gelaendepinsel", "darstellung", "weich");

// Freier Radierer nimmt auch am Raster gemaltes Gelaende, wo er ein Feld zur Haelfte trifft
{
  const vorher = modul.rasterFelderDerSzene();
  assert.ok(vorher.schwierig.has("2,3"), "Rasterfeld 2,3 vorhanden");
  await game.settings.set("gelaendepinsel", "art", "radierer");
  canvas.mousePosition = { x: 250, y: 350 };
  ebene._onClickLeft({});
  await ruhe();
  assert.equal(modul.rasterFelderDerSzene().schwierig.has("2,3"), false, "Rasterfeld radiert");
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Radierer-Vorschau (0.2.1, 23.10.2026: "wenn man löscht, ist ein vorhandenes Gelände weiß"):
// keine weiße Spur, das Gelände verschwindet schon beim Ziehen, so wie es nach dem Loslassen bleibt.
{
  await game.settings.set("gelaendepinsel", "art", "radierer");
  await game.settings.set("gelaendepinsel", "groesse", 1);
  modul.anzeige.zeichnen();
  const vorherFlaechen = modul.anzeige.grafik.flaechen.length;
  assert.ok(modul.felderDerSzene().schwierig.has("5,8"), "Feld 5,8 ist bemalt");
  canvas.mousePosition = { x: 540, y: 850 };
  ebene._onDragLeftStart({});
  canvas.mousePosition = { x: 560, y: 850 };
  ebene._onDragLeftMove({});
  assert.equal(modul.anzeige.entwurfStrich?.art, "radierer", "Der Radierer zieht");
  assert.ok(modul.anzeige.grafik.striche.every((s) => s.color !== 0xffffff), "Keine weiße Spur");
  assert.ok(modul.anzeige.grafik.striche.every((s) => s.width < 10), "Nur eine dünne Spur, keine Fläche in Pinselbreite");
  assert.ok(modul.anzeige.grafik.flaechen.length < vorherFlaechen, "Das radierte Feld verschwindet schon in der Vorschau");
  const vorschau = modul.radiererVorschau(modul.anzeige.entwurfStrich);
  assert.equal(vorschau.felder.schwierig.has("5,8"), false, "Vorschau ohne Feld 5,8");
  assert.ok(vorschau.felder.schwierig.has("3,8") && vorschau.felder.schwierig.has("7,8"), "Daneben bleibt alles");
  ebene._onDragLeftDrop({});
  await ruhe();
  const danach = modul.felderDerSzene();
  assert.equal(danach.schwierig.has("5,8"), false, "Nach dem Loslassen wie in der Vorschau");
  assert.ok(danach.schwierig.has("3,8") && danach.schwierig.has("7,8"));
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Rechtsklick radiert (0.2.4), die gewählte Art bleibt.
{
  await game.settings.set("gelaendepinsel", "art", "schwierig");
  await game.settings.set("gelaendepinsel", "groesse", 1);
  const vorher = modul.felderDerSzene();
  assert.ok(vorher.schwierig.has("3,8"), "Feld 3,8 ist bemalt");
  canvas.mousePosition = { x: 350, y: 850 };
  ebene._onClickRight({});
  await ruhe();
  assert.equal(modul.felderDerSzene().schwierig.has("3,8"), false, "Rechtsklick hat Feld 3,8 radiert");
  assert.ok(modul.felderDerSzene().schwierig.has("7,8"), "Weiter weg bleibt alles");
  assert.equal(game.settings.get("gelaendepinsel", "art"), "schwierig", "Der Pinsel bleibt auf schwierig");
  canvas.mousePosition = { x: 950, y: 950 };
  ebene._onClickLeft({});
  await ruhe();
  assert.ok(modul.felderDerSzene().schwierig.has("9,9"), "Linksklick malt danach wieder schwierig");
}

// Die eigenen Bilder am Token (0.2.3): Sind sie geladen, steht das Bild statt des gezeichneten Stiefels da.
{
  const geladen = [];
  globalThis.foundry.canvas = { loadTexture: async (pfad) => { geladen.push(pfad); return { pfad, source: {} }; } };
  globalThis.PIXI.Sprite = Bild;
  canvas.tokens = { placeables: [] };
  await modul.bilderLaden();
  assert.equal(geladen.length, 5, "Fünf Bilder geladen");
  const bildToken = { id: "bildtoken", x: 300, y: 300, w: 100, h: 100, visible: true, actor: { isOfType: () => true, system: { movement: { terrain: { difficult: { ignored: [] }, greater: { ignored: [] } } } } } };
  const felderJetzt = modul.felderDerSzene();
  const feld = [...felderJetzt.schwierig][0];
  const [spalte, zeile] = feld.split(",").map(Number);
  bildToken.x = spalte * 100;
  bildToken.y = zeile * 100;
  modul.abzeichen.felder = null;
  modul.abzeichen.zeichnen(bildToken);
  const bild = modul.abzeichen.bilder.get("bildtoken");
  assert.ok(bild, "Ein Bildbehälter am Token");
  assert.equal(bild.children.length, 1);
  const sprite = bild.children[0];
  assert.equal(sprite.textur.pfad, "modules/gelaendepinsel/assets/symbole/schwierig.png", "Das Bild für schwieriges Gelände");
  assert.deepEqual([sprite.width, sprite.height, sprite.alpha], [24, 24, 1], "24 Prozent der Feldgröße, voll sichtbar");
  assert.equal(modul.abzeichen.je.get("bildtoken").flaechen.length, 0, "Kein gezeichneter Stiefel daneben");
  assert.equal(geladen[0].endsWith(".png") && sprite.textur.source.scaleMode, "nearest", "Pixelbild scharf");
  modul.abzeichen.entfernen("bildtoken");
  assert.equal(bild.destroyed, true);
  delete globalThis.PIXI.Sprite;
}

// Werte der Flächen (0.2.7): SG nach Gruppenstufe, je Strich gemerkt, Fenster, Halt für den reaction_monitor.
{
  assert.equal(modul.stufenSg(4), 19, "Stufe 4: SG 19");
  assert.equal(modul.stufenSg(1), 15);
  assert.equal(modul.stufenSg(0), 14);
  game.actors = Object.assign([], { party: { members: [{ level: 4 }, { level: 4 }, { level: 5 }] } });
  assert.equal(modul.gruppenStufe(), 4);
  assert.equal(modul.aktuelleWerte().sg, 19, "Vorgabe stufengerecht, nicht 15");
  // Fenster: SG 24, 3d6 Säure, Zähigkeit
  foundry.applications.api.DialogV2.prompt = async ({ ok }) => ok.callback({}, { form: { elements: { sg: { value: "24" }, schaden: { value: "3d6" }, typ: { value: "acid" }, rw: { value: "fortitude" } } } });
  const werte = await modul.werteFenster();
  assert.deepEqual(werte, { sg: 24, schaden: "3d6", typ: "acid", rw: "fortitude" });
  // Ein frei gemalter Steg mit diesen Werten in Zeile 12
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "art", "schmal");
  canvas.mousePosition = { x: 250, y: 1250 };
  ebene._onDragLeftStart({});
  canvas.mousePosition = { x: 650, y: 1250 };
  ebene._onDragLeftMove({});
  ebene._onDragLeftDrop({});
  await ruhe();
  const steg = flags.gelaendepinsel.striche.at(-1);
  assert.deepEqual(steg.w, { sg: 24, schaden: "3d6", typ: "acid", rw: "fortitude" }, "Der Strich merkt sich seine Werte");
  assert.equal(modul.werteAn("4,12", "schmal").sg, 24, "Am Steg gilt SG 24");
  assert.equal(flags.gelaendepinsel.werte.schmal.sg, 24, "Die Szene merkt sich den letzten Wert je Art");
  // Halt: eine Kreatur auf dem Steg; fliegend oder als Kiste nicht.
  const lebewesen = { isOfType: (art) => art === "creature", system: { movement: { terrain: { difficult: { ignored: [] }, greater: { ignored: [] } } } } };
  assert.deepEqual(modul.haltAn({ x: 400, y: 1200, w: 100, h: 100, actor: lebewesen, document: { movementAction: "walk" } }), { art: "schmal", sg: 24 });
  assert.equal(modul.haltAn({ x: 400, y: 1200, w: 100, h: 100, actor: lebewesen, document: { movementAction: "fly" } }), null, "Fliegend: kein Halt nötig");
  assert.equal(modul.haltAn({ x: 400, y: 1200, w: 100, h: 100, actor: { isOfType: () => false }, document: {} }), null, "Kiste");
  assert.equal(modul.haltAn({ x: 400, y: 2000, w: 100, h: 100, actor: lebewesen, document: {} }), null, "Daneben");
  await game.settings.set("gelaendepinsel", "sg", 0);
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Eine Karte je Betreten, nicht je Schritt (0.2.12): Wer sich in der Fläche weiterbewegt, bekommt
// keine neue, auch nicht über mehrere Züge. Erst wer sie verlässt und wieder betritt.
{
  await game.settings.set("gelaendepinsel", "rasterModus", true);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  await game.settings.set("gelaendepinsel", "art", "uneben");
  maus(2, 18);
  ebene._onDragLeftStart({});
  maus(8, 18);
  ebene._onDragLeftMove({});
  ebene._onDragLeftDrop({});
  await ruhe();
  assert.deepEqual(flags.gelaendepinsel.felder.uneben, ["2,18", "3,18", "4,18", "5,18", "6,18", "7,18", "8,18"]);
  const geroell = { id: "geroell", name: "Brandy", x: 100, y: 1800, width: 1, height: 1, parent: szene };
  szene.tokens.push({ ...geroell });
  hookAusloesen("canvasReady");
  const zug = async (x, y) => {
    const vorher = protokoll.chat.length;
    geroell.x = x;
    geroell.y = y;
    hookAusloesen("updateToken", geroell, { x, y }, {});
    angekommen(geroell);
    await ruhe();
    return protokoll.chat.length - vorher;
  };
  // Bekanntes Gelände ist eine Hausregel (0.3.17): Schalter in den Einstellungen, von Haus aus aus.
  assert.equal(game.settings.get("gelaendepinsel", "bekanntesGelaende"), false, "von Haus aus aus");
  await game.settings.set("gelaendepinsel", "bekanntesGelaende", true);
  assert.equal(await zug(200, 1800), 1, "Hinein: eine Karte");
  assert.match(protokoll.chat.at(-1).content, /Brandy<\/strong> betritt unebenen Boden: Balancieren/);
  assert.equal(await zug(300, 1800), 0, "Ein Feld weiter: keine");
  assert.equal(await zug(600, 1800), 0, "Drei Felder weiter: keine");
  assert.equal(await zug(600, 1900), 0, "Hinaus: keine");
  assert.equal(await zug(700, 1800), 1, "Wieder hinein: eine neue Karte");
  assert.equal(await zug(1000, 1800), 0, "Hinaus über das Ende");
  assert.equal(await zug(100, 1800), 1, "In einem Zug quer hindurch: eine Karte, nicht sieben");
  // Eine zweite Fläche derselben Art bei (11,18): im selben Zug hinaus und dort hinein gibt eine neue Karte.
  maus(11, 18);
  ebene._onClickLeft({});
  await ruhe();
  // Bekanntes Gelände (0.3.16): Über 2,18 hat Brandy schon gewürfelt; dort wieder hinein gibt keine Karte.
  assert.equal(await zug(500, 1800), 0, "Über ein bekanntes Feld hinein: keine Karte");
  assert.deepEqual(flags.gelaendepinsel.bekannt.uneben.map((e) => e.f), ["2,18", "7,18", "8,18"], "gemerkt je Feld");
  assert.equal(modul.istBekannt({ id: "geroell", parent: szene }, "gefahr", "2,18"), false, "gefährliches Gelände bleibt unbekannt");
  maus(2, 18);
  ebene._onClickLeft({});
  await ruhe();
  assert.deepEqual(flags.gelaendepinsel.bekannt.uneben.map((e) => e.f), ["7,18", "8,18"], "neu gemalt: wieder unbekannt");
  assert.equal(await zug(100, 1800), 0, "Hinaus");
  assert.equal(await zug(200, 1800), 1, "über das neu gemalte Feld: wieder eine Karte");
  // Schalter aus: nach den Regeln würfelt er auch über ein bekanntes Feld
  assert.equal(await zug(100, 1800), 0, "Hinaus");
  await game.settings.set("gelaendepinsel", "bekanntesGelaende", false);
  assert.equal(await zug(200, 1800), 1, "Schalter aus: wieder eine Karte");
  assert.equal(await zug(1100, 1800), 1, "Aus der ersten Fläche in die zweite, im selben Zug");
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Die Karte kommt, wenn der Token die Fläche sichtbar erreicht, nicht beim Losfahren (0.2.13). Gemessen
// am echten Token (object), nicht an Foundrys Vorschau beim Ziehen, die dieselbe ID trägt (0.2.14).
{
  await game.settings.set("gelaendepinsel", "rasterModus", true);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  await game.settings.set("gelaendepinsel", "art", "gefahr");
  maus(4, 22);
  ebene._onClickLeft({});
  await ruhe();
  const laeufer = { id: "laeufer", name: "Isadora", x: 100, y: 2200, width: 1, height: 1, parent: szene, async update(_daten, optionen) { if (optionen?.gelaendepinsel?.halt) this.angehalten = (this.angehalten ?? 0) + 1; } };
  laeufer.object = { id: "laeufer", x: 100, y: 2200 };
  szene.tokens.push({ id: "laeufer", x: 100, y: 2200 });
  hookAusloesen("canvasReady");
  const bild = async (x, y = 2200) => {
    laeufer.object.x = x;
    laeufer.object.y = y;
    hookAusloesen("refreshToken", laeufer.object);
    await ruhe();
  };
  const vorschau = async (x) => {
    hookAusloesen("refreshToken", { id: "laeufer", x, y: 2200, isPreview: true });
    await ruhe();
  };
  let vorher = protokoll.chat.length;
  // Ziehen: Die Vorschau steht beim Loslassen am Ziel, der Token noch am Start.
  await vorschau(400);
  await vorschau(600);
  laeufer.x = 600;
  hookAusloesen("updateToken", laeufer, { x: 600 }, {});
  await ruhe();
  assert.equal(protokoll.chat.length, vorher, "Beim Losfahren noch keine Karte");
  await vorschau(600);
  await bild(200);
  await bild(340);
  assert.equal(protokoll.chat.length, vorher, "Kurz vor der Fläche: keine, auch nicht durch die Vorschau");
  await bild(360);
  assert.equal(protokoll.chat.length, vorher + 1, "Zur Hälfte auf der Fläche: die Karte");
  assert.equal(laeufer.angehalten, 1, "Und hält dort (0.2.21)");
  assert.match(protokoll.chat.at(-1).content, /Isadora<\/strong> geht durch gefährliches Gelände/);
  await bild(500);
  await bild(600);
  assert.equal(protokoll.chat.length, vorher + 1, "Am Ziel keine zweite");

  // Vor der Fläche angehalten: keine Karte, auch nicht durch den Zug, der das Anhalten speichert. Der
  // neue Zug kommt als Ziehen mit der Maus, das Netz hinter dem Halt (0.2.23) lässt ihn durch.
  vorher = protokoll.chat.length;
  laeufer.x = 100;
  hookAusloesen("updateToken", laeufer, { x: 100 }, { _movement: { laeufer: { method: "dragging" } } });
  await bild(560);
  await bild(520);
  laeufer.x = 520;
  hookAusloesen("updateToken", laeufer, { x: 520 }, {});
  await bild(520);
  assert.equal(protokoll.chat.length, vorher, "Vor der Fläche angehalten: keine Karte");

  // Sprung ohne Fahrt, schon am Ziel gezeichnet: die Karte gleich.
  vorher = protokoll.chat.length;
  laeufer.object.x = 100;
  laeufer.x = 100;
  hookAusloesen("updateToken", laeufer, { x: 100 }, {});
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Sprung ohne Fahrt: die Karte gleich");
  assert.equal(laeufer.angehalten, 1, "Sprung ohne Fahrt: kein Halt");

  // Umweg über Wegpunkte, gezeichnet nur am Ziel: Was zwischen zwei Bildern liegt, kommt am Ziel.
  const umweg = { id: "umweg", name: "Lucne", x: 200, y: 2500, width: 1, height: 1, parent: szene, async update(_daten, optionen) { if (optionen?.gelaendepinsel?.halt) this.angehalten = (this.angehalten ?? 0) + 1; } };
  umweg.object = { id: "umweg", x: 200, y: 2500 };
  szene.tokens.push({ id: "umweg", x: 200, y: 2500 });
  hookAusloesen("canvasReady");
  vorher = protokoll.chat.length;
  umweg.x = 600;
  hookAusloesen("updateToken", umweg, { x: 600 }, { _movement: { umweg: { passed: { waypoints: [
    { x: 400, y: 2200, action: "walk" }, { x: 600, y: 2500, action: "walk" }
  ] } } } });
  await ruhe();
  assert.equal(protokoll.chat.length, vorher, "Noch unterwegs");
  umweg.object.x = 600;
  hookAusloesen("refreshToken", umweg.object);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Am Ziel: die Karte vom Umweg");
  assert.equal(umweg.angehalten ?? 0, 0, "Am Ziel kein Halt");

  // Ohne Fahrt gesetzt (animate: false): kein Bild dazwischen, die Karte gleich.
  vorher = protokoll.chat.length;
  umweg.x = 200;
  hookAusloesen("updateToken", umweg, { x: 200 }, { animate: false, _movement: { umweg: { passed: { waypoints: [
    { x: 400, y: 2200, action: "walk" }, { x: 200, y: 2500, action: "walk" }
  ] } } } });
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Ohne Fahrt: die Karte sofort");
  assert.equal(umweg.angehalten ?? 0, 0, "Ohne Fahrt kein Halt");
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Wie in Foundry 14 gemessen (0.2.16): Beim Speichern steht im Dokument noch der Anfang, das Ziel steht
// im letzten Wegpunkt und in den Änderungen; während der Fahrt folgen Dokument und Bild gemeinsam. Die
// Karte kommt, wenn der Token das Feld mindestens zur Hälfte bedeckt.
{
  const f14 = { id: "f14", name: "Dero", x: 100, y: 2200, width: 1, height: 1, parent: szene };
  f14.object = { id: "f14", x: 100, y: 2200, document: f14 };
  szene.tokens.push({ id: "f14", x: 100, y: 2200 });
  hookAusloesen("canvasReady");
  const bild = (x) => {
    f14.x = x;
    f14.object.x = x;
    hookAusloesen("refreshToken", f14.object);
  };
  const vorher = protokoll.chat.length;
  hookAusloesen("updateToken", f14, { x: 600 }, { _movement: { f14: { passed: { waypoints: [{ x: 600, y: 2200, action: "walk" }] } } } });
  await ruhe();
  assert.equal(protokoll.chat.length, vorher, "Beim Speichern keine Karte, obwohl das Dokument noch am Anfang steht");
  bild(340);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher, "Zu 40 Prozent auf dem Feld: noch keine");
  // Halt an der Fläche (0.2.21): Mit der Karte hält der Token an, hier und über alle Clients.
  const gestoppt = [];
  const gemeldet = [];
  const gesendet = [];
  f14.stopMovement = () => gestoppt.push(f14.x);
  const gesetzt = [];
  f14.move = async (wege, optionen) => { gesetzt.push({ ...wege[0], ...optionen }); return true; };
  hooks.set("gelaendepinselAnhalten", [(daten) => gemeldet.push(daten)]);
  game.socket = { emit: (kanal, daten) => gesendet.push({ kanal, daten }), on: (kanal, fn) => { game.socket.hoerer = [kanal, fn]; } };
  bild(350);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Genau zur Hälfte: die Karte");
  assert.deepEqual(gestoppt, [], "Kein stopMovement mehr (0.2.23): Foundry setzte damit an eine eigene Stelle");
  // Foundry 14 hält mit stopMovement nicht an (0.2.22): Die Spielleitung setzt ihn ohne Fahrt ganz auf
  // das Feld der Karte, mit der Kennung, die die AI-Bewegungsanzeige durchlässt.
  // Seit 0.2.24 ohne Fahrt und ohne Wandprüfung, sonst bremst Foundry an Wänden.
  assert.deepEqual(gesetzt, [{
    x: 400, y: 2200, elevation: 0, method: "api", showRuler: false, autoRotate: false, animate: false, animation: { duration: 0 },
    constrainOptions: { ignoreWalls: true, ignoreCost: true }, aiBewegungsanzeigeModuleMove: true, gelaendepinsel: { halt: true }
  }]);
  assert.deepEqual(gemeldet, [{ tokenId: "f14", sceneId: "szene" }], "Die Bewegungsanzeige erfährt es");
  assert.deepEqual(gesendet, [{ kanal: "module.gelaendepinsel", daten: { typ: "anhalten", token: "f14", szene: "szene" } }], "Alle Clients erfahren es");
  for (const x of [450, 600]) bild(x);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Bis zum Ziel keine zweite");
  assert.equal(gesetzt.length, 1, "Nur einmal gesetzt");
  // Das Setzen kommt als Änderung zurück: kein neuer Zug, keine Karte, und der nächste Zug fährt dort los.
  // Netz (0.2.23): Eine verspätete fremde Lageänderung setzt ihn einmal erneut auf das Feld; Ziehen nicht.
  const hochgeladen = [];
  foundry.applications.apps = { FilePicker: { uploadPersistent: async (...werte) => hochgeladen.push(werte) } };
  hookAusloesen("updateToken", f14, { x: 520 }, {});
  assert.equal(gesetzt.length, 2, "Fremde Änderung kurz danach: erneut gesetzt");
  assert.deepEqual([gesetzt[1].x, gesetzt[1].y], [400, 2200]);
  hookAusloesen("updateToken", f14, { x: 540 }, {});
  assert.equal(gesetzt.length, 2, "Nur einmal nachgesetzt");
  // Kommt das Setzen mit Kennung an, beendet jeder Client die noch laufende Animation (0.2.25).
  const beendet = [];
  f14.object.animationContexts = new Map([["fahrt", {}]]);
  f14.object.stopAnimation = (optionen) => beendet.push(optionen);
  hookAusloesen("updateToken", f14, { x: 400 }, { gelaendepinsel: { halt: true } });
  assert.deepEqual(beendet, [{ reset: true }], "Die alte Fahrt endet sofort, sichtbar");
  f14.object.animationContexts = new Map();
  hookAusloesen("updateToken", f14, { x: 400 }, { gelaendepinsel: { halt: true } });
  assert.equal(beendet.length, 1, "Ohne laufende Animation nichts zu beenden");
  delete f14.object.animationContexts;
  delete f14.object.stopAnimation;
  // Das Setzen kommt zurück, hier ohne die Kennung (falls Foundry sie bei move nicht weiterreicht): an der
  // Stelle erkannt (0.2.24).
  hookAusloesen("updateToken", f14, { x: 400 }, {});
  // Foundry zeichnet ihn danach an der gesetzten Stelle.
  f14.x = 400;
  f14.object.x = 400;
  hookAusloesen("refreshToken", f14.object);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Das Setzen ist kein Zug, keine zweite Karte");
  f14.x = 600;
  f14.object.x = 600;
  // Ein anderer Client bekommt die Bitte und hält den Token an, den er findet.
  hookAusloesen("ready");
  const [kanal, hoerer] = game.socket.hoerer;
  assert.equal(kanal, "module.gelaendepinsel");
  canvas.tokens.get = (id) => (id === "f14" ? { document: f14 } : undefined);
  hoerer({ typ: "anhalten", token: "f14", szene: "szene" });
  assert.equal(gemeldet.length, 2, "Beim Empfänger erfährt es die Bewegungsanzeige");
  assert.deepEqual(gestoppt, [], "Auch dort kein stopMovement");
  hoerer({ typ: "anhalten", token: "f14", szene: "andere" });
  assert.equal(gemeldet.length, 2, "Andere Szene: nichts");
  delete canvas.tokens.get;
  hooks.delete("gelaendepinselAnhalten");
  delete game.socket;
  delete f14.stopMovement;
  delete f14.move;
  // Haltmessung (0.2.23): seit 0.2.27 aus, seit 0.3.16 vorübergehend wieder an (Wunsch: "bau die Messung"), in der
  // öffentlichen Fassung aus. Nach 2,5 s liegt eine Haltdatei vor, wenn die Messung an ist, sonst keine.
  await new Promise((fertig) => echteUhr(fertig, 2700));
  await ruhe();
  const haltDateien = hochgeladen.filter((werte) => werte[2].name.startsWith("gelaendepinsel-halt-")).length;
  if (einstellungen.get("messung").default) assert.ok(haltDateien >= 1, "Haltmessung schreibt, solange die Messung an ist");
  else assert.equal(haltDateien, 0, "Keine Haltmessung, solange die Messung aus ist");
  delete foundry.applications.apps;
  // Der nächste Zug fährt vom Ziel los, nicht von der Lage beim letzten Speichern.
  hookAusloesen("updateToken", f14, { x: 900 }, { _movement: { f14: { passed: { waypoints: [{ x: 900, y: 2200, action: "walk" }] } } } });
  bild(900);
  await ruhe();
  assert.equal(protokoll.chat.length, vorher + 1, "Vom Ziel weiter, weg von der Fläche: keine Karte");
}

// Messung (0.2.15): Ein Zug durch eine Fläche schreibt eine Datei in den Modulspeicher, mit der Lage
// beim Speichern, den Bildern davor und danach und dem Zeitpunkt der Karte.
{
  // Messungen der Züge weiter oben enden vorher, ohne Ablage.
  await new Promise((fertig) => echteUhr(fertig, 400));
  const hochgeladen = [];
  foundry.applications.apps = { FilePicker: { uploadPersistent: async (...werte) => hochgeladen.push(werte) } };
  const manifest = JSON.parse(readFileSync(new URL("../module.json", import.meta.url), "utf8"));
  assert.equal(manifest.persistentStorage, true, "Modulspeicher angemeldet");
  // Seit 0.2.17 aus: Ein Zug durch die Fläche schreibt nichts.
  // Seit 0.3.16 ist die Messung von Haus aus an; hier ausdrücklich aus.
  await game.settings.set("gelaendepinsel", "messung", false);
  const stumm = { id: "stumm", name: "Brandy", x: 100, y: 2200, width: 1, height: 1, parent: szene };
  stumm.object = { id: "stumm", x: 100, y: 2200, document: stumm };
  szene.tokens.push({ id: "stumm", x: 100, y: 2200 });
  hookAusloesen("canvasReady");
  hookAusloesen("updateToken", stumm, { x: 600 }, { _movement: { stumm: { passed: { waypoints: [{ x: 600, y: 2200, action: "walk" }] } } } });
  for (const x of [360, 600]) {
    stumm.x = x;
    stumm.object.x = x;
    hookAusloesen("refreshToken", stumm.object);
  }
  await new Promise((fertig) => echteUhr(fertig, 400));
  await ruhe();
  assert.equal(hochgeladen.length, 0, "Messung aus: keine Datei");
  await game.settings.set("gelaendepinsel", "messung", true);
  const messer = { id: "messer", name: "Silvor", x: 100, y: 2200, width: 1, height: 1, parent: szene };
  messer.object = { id: "messer", x: 100, y: 2200, document: messer };
  szene.tokens.push({ id: "messer", x: 100, y: 2200 });
  hookAusloesen("canvasReady");
  hookAusloesen("refreshToken", messer.object);
  messer.x = 600;
  hookAusloesen("updateToken", messer, { x: 600 }, {});
  for (const x of [200, 360, 600]) {
    messer.object.x = x;
    hookAusloesen("refreshToken", messer.object);
  }
  await new Promise((fertig) => echteUhr(fertig, 400));
  await ruhe();
  assert.equal(hochgeladen.length, 1, "Eine Messung geschrieben");
  const [modulId, ordner, datei, , optionen] = hochgeladen[0];
  assert.deepEqual([modulId, ordner, optionen.notify], ["gelaendepinsel", "diagnostics", false]);
  // Seit 0.3.16 misst es von Anfang an; der Zähler steht deshalb schon weiter, die Dateien laufen reihum 01 bis 05.
  assert.match(datei.name, /^gelaendepinsel-diagnose-0[1-5]\.json$/u);
  const messung = JSON.parse(await datei.text());
  assert.equal(messung.version, manifest.version, "Fassung aus dem Manifest");
  assert.equal(messung.ende, "ziel");
  assert.deepEqual(messung.kopf.beimSpeichern.x, 100, "Lage des echten Tokens beim Speichern");
  assert.equal(messung.kopf.vorher.length, 1, "Das Bild vor dem Speichern");
  assert.deepEqual(messung.bilder.map((bild) => bild.x), [200, 360, 600]);
  assert.deepEqual(messung.karten.map(({ art, grund, bildNr }) => [art, grund, bildNr]), [["gefahr", "bild", 2]], "Karte beim zweiten Bild");
  delete foundry.applications.apps;
  await game.settings.set("gelaendepinsel", "messung", false);
}

// Reste unter einem Feld räumen sich nach drei Sekunden selbst weg (0.2.14). Ein Stück zählt mit den
// Rasterfeldern, an die es grenzt.
{
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  await game.settings.set("gelaendepinsel", "art", "schmal");
  canvas.mousePosition = { x: 250, y: 2850 };
  ebene._onDragLeftStart({});
  canvas.mousePosition = { x: 550, y: 2850 };
  ebene._onDragLeftMove({});
  ebene._onDragLeftDrop({});
  await ruhe();
  const tupfen = async (x, y) => {
    canvas.mousePosition = { x, y };
    ebene._onDragLeftStart({});
    ebene._onDragLeftDrop({});
    await ruhe();
  };
  await game.settings.set("gelaendepinsel", "groesse", 0.5);
  await tupfen(905, 2850);
  await game.settings.set("gelaendepinsel", "rasterModus", true);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  maus(12, 28);
  ebene._onClickLeft({});
  await ruhe();
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "groesse", 0.5);
  await tupfen(1305, 2850);
  const punkteIn = (menge, spalte, zeile) => [...menge].filter((k) => Math.floor((k % 1000000) / 8) === spalte && Math.floor(Math.floor(k / 1000000) / 8) === zeile).length;
  let schmal = modul.flaechenDerSzene(szene).flaechen.schmal;
  assert.ok(punkteIn(schmal, 9, 28) > 0, "Der Tupfer ist erst einmal da");
  aufraeumUhren.length = 0;
  hookAusloesen("updateScene", szene, { flags: { gelaendepinsel: {} } });
  assert.equal(aufraeumUhren.length, 1, "Aufräumen nach drei Sekunden geplant");
  assert.equal(modul.AUFRAEUMEN_MS, 3000);
  aufraeumUhren.pop()();
  await ruhe();
  schmal = modul.flaechenDerSzene(szene).flaechen.schmal;
  assert.equal(punkteIn(schmal, 9, 28), 0, "Der Tupfer allein ist weg");
  assert.ok(punkteIn(schmal, 3, 28) > 0 && punkteIn(schmal, 5, 28) > 0, "Der Strich über drei Felder bleibt");
  assert.ok(punkteIn(schmal, 13, 28) > 0, "Der Tupfer am Rasterfeld bleibt, beide sind ein Stück");
  assert.equal(flags.gelaendepinsel.striche.at(-1).art, "weg");
  assert.equal(flags.gelaendepinsel.striche.at(-1).von, "schmal");
  assert.equal(await modul.resteRaeumen(szene), 0, "Ein zweiter Lauf findet nichts mehr");
  await game.settings.set("gelaendepinsel", "groesse", 1);
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Übereinander (0.2.11): Gefährliches Gelände auf schwierigem nimmt das schwierige nicht weg, beides
// wirkt. Sehr schwierig über schwierig zählt nur einmal: 10 Fuß mehr, nicht 15.
{
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  const ziehen = async (art, von, bis, y) => {
    await game.settings.set("gelaendepinsel", "art", art);
    canvas.mousePosition = { x: von, y };
    ebene._onDragLeftStart({});
    canvas.mousePosition = { x: bis, y };
    ebene._onDragLeftMove({});
    ebene._onDragLeftDrop({});
    await ruhe();
  };
  await ziehen("schwierig", 250, 850, 1550);
  await ziehen("gefahr", 450, 550, 1550);
  let felder = modul.felderDerSzene();
  assert.ok(felder.schwierig.has("4,15") && felder.gefahr.has("4,15"), "Gefährlich auf schwierigem: beides");
  await ziehen("sehr", 650, 750, 1550);
  felder = modul.felderDerSzene();
  assert.ok(felder.sehr.has("6,15") && !felder.schwierig.has("6,15"), "Sehr schwierig ersetzt das schwierige");
  assert.ok(felder.gefahr.has("4,15") && felder.schwierig.has("4,15"), "Das gefährliche und das schwierige daneben bleiben");
  // Am Raster sehr schwierig, wo frei gemalt schwierig zählt: Die Regionen überlappen trotzdem nicht.
  await game.settings.set("gelaendepinsel", "rasterModus", true);
  await game.settings.set("gelaendepinsel", "art", "sehr");
  maus(3, 15);
  ebene._onClickLeft({});
  await ruhe();
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  felder = modul.felderDerSzene();
  assert.ok(felder.schwierig.has("3,15") && felder.sehr.has("3,15"), "Frei schwierig, am Raster sehr schwierig");
  const formen = (art) => szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === art).daten.shapes;
  const deckt = (liste, spalte, zeile) => liste.some((f) => f.x <= spalte * 100 && spalte * 100 < f.x + f.width && f.y <= zeile * 100 && zeile * 100 < f.y + f.height);
  assert.equal(deckt(formen("schwierig"), 3, 15), false, "Wo beides zählt, keine schwierige Region darunter");
  assert.equal(deckt(formen("schwierig"), 6, 15), false, "Frei übermalt: auch dort nicht");
  assert.ok(deckt(formen("sehr"), 3, 15) && deckt(formen("sehr"), 6, 15), "Sehr schwierig an beiden Stellen");
  assert.ok(deckt(formen("schwierig"), 2, 15) && deckt(formen("schwierig"), 4, 15), "Schwierig daneben und unter dem gefährlichen");
  await game.settings.set("gelaendepinsel", "art", "schwierig");
}

// Regionen-Ebene (0.2.18): Von den Geländeregionen ist nichts zu sehen, weder die Fläche noch ihre Teile
// noch Zeichenobjekte anderswo, die zu ihr gehören, noch der Eintrag in der Regionenliste. Löschen ohne
// das Modul wird still abgelehnt, ohne Meldung; fremde Regionen bleiben, wie sie sind.
{
  const eigeneDaten = szene.regions.find((region) => region.daten.flags.gelaendepinsel.art);
  const eigeneId = "eigen1";
  eigeneDaten.id = eigeneId;
  const fremd = { id: "fremd1", getFlag: () => undefined };
  const teil = { visible: true, renderable: true };
  const platz = { document: eigeneDaten, visible: true, renderable: true, eventMode: "static", children: [teil] };
  const anderswo = { region: platz, visible: true, renderable: true };
  const fremdPlatz = { document: fremd, visible: true, renderable: true, children: [] };
  // Wie in Foundry 14 gemessen (0.2.19): Die Schraffur liegt als RegionMesh in einem Behälter der
  // Regionen-Ebene, nicht in der Region.
  const schraffur = { region: platz, visible: true, renderable: true, children: [] };
  const fremdeSchraffur = { region: fremdPlatz, visible: true, renderable: true, children: [] };
  canvas.regions = { children: [{ children: [schraffur, fremdeSchraffur] }, { children: [platz, fremdPlatz] }] };
  canvas.primary = { children: [anderswo] };
  hookAusloesen("drawRegion", platz);
  hookAusloesen("drawRegion", fremdPlatz);
  assert.equal(schraffur.visible, false, "Die Schraffur im Behälter der Regionen-Ebene");
  assert.equal(fremdeSchraffur.visible, true, "Fremde Schraffur bleibt");
  assert.equal(platz.isVisible, false, "Foundry hält die Region für unsichtbar");
  assert.equal(fremdPlatz.isVisible, undefined, "Fremde Region unberührt");
  assert.deepEqual([platz.visible, platz.renderable, platz.eventMode], [false, false, "none"], "Die Region selbst");
  assert.equal(teil.visible, false, "Ihre Teile");
  assert.equal(anderswo.visible, false, "Was anderswo zu ihr gehört");
  assert.equal(fremdPlatz.visible, true, "Fremde Regionen bleiben sichtbar");
  // Foundry stellt beim nächsten Bild wieder an: refreshRegion blendet erneut aus.
  platz.visible = true;
  platz.renderable = true;
  hookAusloesen("refreshRegion", platz);
  assert.equal(platz.visible, false, "Nach jeder Auffrischung wieder aus");
  // Die Regionenliste
  const zeilen = [eigeneId, "fremd1"].map((id) => ({ dataset: { regionId: id }, weg: false, remove() { this.weg = true; } }));
  hookAusloesen("renderRegionLegend", {}, { querySelectorAll: () => zeilen });
  assert.deepEqual(zeilen.map((zeile) => zeile.weg), [true, false], "Nur der eigene Eintrag verschwindet");
  // Löschen
  const meldungen = [];
  const alteMeldung = globalThis.ui?.notifications?.warn;
  globalThis.ui ??= {};
  globalThis.ui.notifications ??= {};
  globalThis.ui.notifications.warn = (text) => meldungen.push(text);
  const antworten = (hooks.get("preDeleteRegion") ?? []).map((fn) => fn(eigeneDaten, {}));
  assert.ok(antworten.length > 0 && antworten.every((antwort) => antwort === false), "Löschen ohne das Modul abgelehnt");
  assert.ok((hooks.get("preDeleteRegion") ?? []).every((fn) => fn(eigeneDaten, { gelaendepinsel: true }) === true), "Das Modul selbst darf löschen");
  assert.ok((hooks.get("preDeleteRegion") ?? []).every((fn) => fn(fremd, {}) === true), "Fremde Regionen löschen wie immer");
  assert.deepEqual(meldungen, [], "Keine Meldung");
  globalThis.ui.notifications.warn = alteMeldung;

  delete canvas.regions;
  delete canvas.primary;
}

// Sprachdateien: jeder Schlüssel im Code steht in de.json und en.json, beide haben dieselben
// Schlüssel und Platzhalter, keiner ist unbenutzt, und Englisch kommt auch an.
{
  const code = ["gelaendepinsel.mjs", "felder.mjs", "flaeche.mjs", "symbole.mjs", "gefahren.mjs", "suchen.mjs"]
    .map((datei) => readFileSync(new URL(`../scripts/${datei}`, import.meta.url), "utf8")).join("\n");
  const benutzt = new Set([...code.matchAll(/["'`](GELAENDEPINSEL\.[A-Za-z0-9_.]+)["'`]/g)].map((treffer) => treffer[1]));
  // Die Gefahren-Karte (0.3.0) ruft ihre Texte kurz über t("Knopf") auf, die Erfolgsgrade über t(`Grad.${grad}`).
  for (const treffer of code.matchAll(/\bt\("([A-Za-z0-9_.]+)"/g)) benutzt.add(`GELAENDEPINSEL.Gefahr.${treffer[1]}`);
  if (code.includes("t(`Grad.${grad}`)")) for (const grad of ["criticalSuccess", "success", "failure", "criticalFailure"]) benutzt.add(`GELAENDEPINSEL.Gefahr.Grad.${grad}`);
  const { de, en } = texte;
  assert.deepEqual(Object.keys(en).sort(), Object.keys(de).sort(), "de.json und en.json haben dieselben Schlüssel");
  for (const schl of benutzt) {
    assert.equal(typeof de[schl], "string", `${schl} fehlt in de.json`);
    assert.equal(typeof en[schl], "string", `${schl} fehlt in en.json`);
  }
  assert.deepEqual(Object.keys(de).filter((schl) => !benutzt.has(schl)), [], "Kein Schlüssel ohne Verwendung");
  const platzhalter = (text) => [...text.matchAll(/{[^}]+}/g)].map((t) => t[0]).sort();
  for (const schl of Object.keys(de)) {
    assert.ok(de[schl].trim() && en[schl].trim(), `${schl} ist leer`);
    assert.deepEqual(platzhalter(en[schl]), platzhalter(de[schl]), `${schl}: gleiche Platzhalter`);
    for (const text of [de[schl], en[schl]]) assert.doesNotMatch(text, /[–—−…„“”‚‘’]/, `${schl}: nur gerade Striche und Anführungszeichen`);
  }
  assert.deepEqual([...fehlendeSchluessel], [], "Zur Laufzeit kein Schlüssel ohne Übersetzung");
  const manifest = JSON.parse(readFileSync(new URL("../module.json", import.meta.url), "utf8"));
  assert.deepEqual(manifest.languages, [{ lang: "de", name: "Deutsch", path: "lang/de.json" }, { lang: "en", name: "English", path: "lang/en.json" }]);
  sprache = "en";
  const controls = { tokens: { order: 1 }, sequencer: { name: "sequencer" } };
  leiste(controls);
  assert.equal(controls.gelaendepinsel.title, "PF2e-ActiveTerrain", "Sichtbarer Name seit 0.2.28");
  assert.equal(controls.gelaendepinsel.tools.schwierig.title, "Difficult Terrain: +5 feet per square, can't Step into it");
  assert.equal(controls.gelaendepinsel.tools.groesse2.title, "Brush 2 squares");
  assert.deepEqual([...fehlendeSchluessel], []);
  sprache = "de";
}

// Gefahren-Karte (0.3.0): Eine Figur fährt über eine versteckte Falle. Sie wird aufgedeckt, und die Karte der
// Auslöse-Aktion kommt mit der Kennung im Rettungswurf; eine Figur ohne Kreaturen-Akteur löst nichts aus.
{
  const aktion = { id: "aktionfalle00001", type: "action", name: "Speer", system: { actionType: { value: "reaction" },
    description: { value: "<p><strong>Auslöser</strong> Eine Kreatur betritt das Feld</p><p>@Damage[2d6[piercing]] (@Check[reflex|dc:20|basic])</p>" } } };
  const falle = { id: "falle00000000001", name: "Speerfalle", x: 900, y: 1200, width: 1, height: 1, hidden: true, parent: szene,
    actor: { type: "hazard", items: [aktion], isOfType: (...t) => t.includes("hazard") }, flags: {},
    getFlag(_m, k) { return this.flags[k]; }, async update(u) { Object.assign(this, u); } };
  const laeufer = { id: "laeufer000000001", name: "Uriel", x: 600, y: 1200, width: 1, height: 1, parent: szene,
    actor: { isOfType: (...t) => t.includes("creature"), testUserPermission: () => false } };
  szene.tokens.push(falle, { ...laeufer });
  szene.tokens.get ??= function (id) { return this.find((d) => d.id === id); };
  hookAusloesen("canvasReady");
  const vorher = protokoll.chat.length;
  laeufer.x = 1200;
  hookAusloesen("updateToken", laeufer, { x: 1200 }, {});
  angekommen(laeufer);
  await ruhe();
  await new Promise((fertig) => setTimeout(fertig, 50));
  assert.equal(falle.hidden, false, "Versteckte Falle beim Betreten aufgedeckt");
  const neu = protokoll.chat.slice(vorher);
  assert.ok(neu.some((c) => /@Check\[reflex\|dc:20\|basic\|options:gelaendepinsel:falle:falle00000000001:aktionfalle00001:laeufer000000001\]/u.test(c.content)),
    "Karte der Auslöse-Aktion mit Kennung");
  assert.ok(!neu.some((c) => /geht durch gefährliches Gelände/u.test(c.content)), "keine Geländekarte dafür");
}

// Suchen entlang des Wegs (0.3.3, 25.10.2026: "ja bau das"): Eine Heldin, die sucht, fährt auf eine
// versteckte Falle zu (Feld 9, Suchzone ab Feld 6). Gewürfelt wird beim Losfahren. Steht das Ergebnis am
// Rand der Zone fest, hält sie dort und die Falle löst nicht aus. Läuft der Wurf noch, wenn sie die Falle
// erreicht, hält sie auf der Falle, und der Wurf entscheidet: gefunden, zurück an den Rand; sonst die Karte.
{
  function aufbau(nummer, zeile, wurf) {
    const aktion = { id: `aktionsuche0000${nummer}`, type: "action", name: "Nadel", system: { actionType: { value: "reaction" },
      description: { value: "<p><strong>Auslöser</strong> Eine Kreatur betritt das Feld</p><p>@Damage[1d6[piercing]] (@Check[reflex|dc:18|basic])</p>" } } };
    const falle = { id: `fallesuche00000${nummer}`, name: "Nadelfalle", x: 900, y: zeile * FELD, width: 1, height: 1, hidden: true, parent: szene,
      actor: { type: "hazard", items: [aktion], isOfType: (...t) => t.includes("hazard"), system: { attributes: { stealth: { value: 10, dc: 20, details: "" } } } },
      flags: {}, getFlag(_m, k) { return this.flags[k]; }, async setFlag(_m, k, v) { this.flags[k] = v; }, async update(u) { Object.assign(this, u); } };
    const wuerfe = [];
    const heldin = { id: `heldinsuche0000${nummer}`, name: "Isadora", x: 100, y: zeile * FELD, width: 1, height: 1, parent: szene,
      actor: { id: `isadorasuche000${nummer}`, name: "Isadora", isOfType: (...t) => t.includes("creature") || t.includes("character"),
        testUserPermission: () => false, system: { exploration: ["suchen"] }, items: { get: (id) => (id === "suchen" ? { slug: "search" } : null) },
        perception: { rank: 1, roll: (o) => { wuerfe.push(o); return wurf; } } } };
    heldin.object = { id: heldin.id, x: heldin.x, y: heldin.y, document: heldin };
    const gesetzt = [];
    heldin.move = async (wege) => { gesetzt.push(wege[0].x); return true; };
    szene.tokens.push(falle, heldin);
    hookAusloesen("canvasReady");
    const bild = (x) => { heldin.x = x; heldin.object.x = x; hookAusloesen("refreshToken", heldin.object); };
    const losfahren = () => hookAusloesen("updateToken", heldin, { x: 1300 }, { _movement: { [heldin.id]: { passed: { waypoints: [{ x: 1300, y: heldin.y, action: "walk" }] } } } });
    const karte = () => protokoll.chat.some((c) => String(c.content).includes(`options:gelaendepinsel:falle:${falle.id}`));
    return { falle, heldin, wuerfe, gesetzt, bild, losfahren, karte };
  }

  // Ergebnis steht fest: Halt am Rand der Zone, Feld 6, drei Felder vor der Falle.
  const fest = aufbau(1, 40, Promise.resolve({ degreeOfSuccess: 2 }));
  // Absuchen (0.3.5): Der geplante Weg, 12 Felder, kostet bei 45 m pro Minute 24 Sekunden Spielzeit.
  const zeit = [];
  game.time = { worldTime: 0, advance: async (sekunden) => { zeit.push(sekunden); } };
  fest.losfahren();
  await ruhe();
  await new Promise((fertig) => setTimeout(fertig, 650));
  assert.deepEqual(zeit, [24], "Weg kostet Spielzeit");
  assert.equal(fest.wuerfe.length, 1, "Beim Losfahren geheim gewürfelt");
  assert.equal(fest.wuerfe[0].messageMode, "gm");
  assert.equal(fest.falle.hidden, true, "Noch nicht am Rand: versteckt");
  fest.bild(400);
  await ruhe();
  assert.deepEqual(fest.gesetzt, [], "Vor der Zone kein Halt");
  fest.bild(550);
  await ruhe();
  assert.deepEqual(fest.gesetzt, [600], "Halt am Rand der Suchzone");
  assert.equal(fest.falle.hidden, false, "Beim Suchen gefunden");
  for (const x of [700, 900, 1300]) fest.bild(x);
  await ruhe();
  assert.equal(fest.karte(), false, "Gefunden: Die Falle löst nicht aus");
  assert.deepEqual(fest.gesetzt, [600], "Nur einmal gesetzt");

  // Wurf läuft noch, als sie die Falle erreicht; dann gelingt er: zurück an den Rand, keine Karte.
  let gelingen;
  const spaet = aufbau(2, 43, new Promise((fertig) => { gelingen = fertig; }));
  spaet.losfahren();
  await ruhe();
  for (const x of [400, 550]) spaet.bild(x);
  await ruhe();
  assert.deepEqual(spaet.gesetzt, [], "Am Rand ohne Ergebnis kein Halt");
  spaet.bild(850);
  await ruhe();
  assert.deepEqual(spaet.gesetzt, [900], "Halt auf der Falle wie bisher");
  assert.equal(spaet.karte(), false, "Die Falle wartet auf den Wurf");
  gelingen({ degreeOfSuccess: 3 });
  await ruhe();
  assert.deepEqual(spaet.gesetzt, [900, 600], "Gefunden: zurück an den Rand der Zone");
  assert.equal(spaet.falle.hidden, false);
  assert.equal(spaet.karte(), false, "Keine Karte");

  // Wurf läuft noch und misslingt: Die Falle löst aus, sie bleibt auf ihr stehen.
  let misslingen;
  const pech = aufbau(3, 46, new Promise((fertig) => { misslingen = fertig; }));
  pech.losfahren();
  await ruhe();
  for (const x of [400, 550, 850]) pech.bild(x);
  await ruhe();
  assert.equal(pech.karte(), false);
  misslingen({ degreeOfSuccess: 1 });
  await ruhe();
  await new Promise((fertig) => setTimeout(fertig, 50));
  assert.equal(pech.karte(), true, "Nicht gefunden: die Karte der Falle");
  assert.deepEqual(pech.gesetzt, [900]);
  assert.equal(pech.falle.flags.suche[pech.heldin.actor.id], 1, "Ergebnis an der Falle");

  // Schon in der Zone losgefahren (etwa erst jetzt "Suchen" gewählt): Der Wurf gilt am Anfang, Halt dort.
  const drin = aufbau(4, 49, Promise.resolve({ degreeOfSuccess: 2 }));
  drin.heldin.x = 600;
  drin.heldin.object.x = 600;
  hookAusloesen("canvasReady");
  drin.losfahren();
  await ruhe();
  assert.equal(drin.wuerfe.length, 1);
  assert.deepEqual(drin.gesetzt, [600], "Halt am Anfang");
  assert.equal(drin.falle.hidden, false);
  for (const x of [700, 900]) drin.bild(x);
  await ruhe();
  assert.equal(drin.karte(), false, "Keine Karte");
}

// Verborgen malen (0.3.14, 29.10.2026: "im Terrain-Menü die Möglichkeit, die Felder auch für Spieler unsichtbar
// zu zeichnen"; gewählt: Schalter in der Leiste, für Spieler nichts sichtbar bei voller Wirkung, für die SL
// gepunktet, Pinsel zum Aufdecken)
{
  const sicherung = JSON.parse(JSON.stringify(flags.gelaendepinsel));
  flags.gelaendepinsel.striche = [];
  flags.gelaendepinsel.felder = {};
  flags.gelaendepinsel.verborgen = {};
  game.user = spielleitung;
  await game.settings.set("gelaendepinsel", "anzeigen", true);
  await game.settings.set("gelaendepinsel", "darstellung", "weich");
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  const leisteJetzt = () => { const c = { tokens: { order: 1 } }; leiste(c); return c.gelaendepinsel.tools; };
  const ziehen = async (art, y, xs) => {
    await game.settings.set("gelaendepinsel", "art", art);
    canvas.mousePosition = { x: xs[0], y };
    ebene._onDragLeftStart({});
    for (const x of xs.slice(1)) { canvas.mousePosition = { x, y }; ebene._onDragLeftMove({}); }
    ebene._onDragLeftDrop({});
    await ruhe();
  };
  const laenge = (s) => Math.hypot(s.nach.x - s.von.x, s.nach.y - s.von.y);

  // Schalter an: der Strich ist verborgen, wirkt aber
  leisteJetzt().verborgen.onChange({}, true);
  await ruhe();
  assert.equal(leisteJetzt().verborgen.active, true, "Schalter an");
  await ziehen("schwierig", 2050, [250, 550, 850]);
  assert.equal(flags.gelaendepinsel.striche.at(-1).v, 1, "Strich verborgen gemerkt");
  assert.ok(modul.felderDerSzene().schwierig.has("5,20"), "wirkt");
  assert.equal(modul.sichtbareFelderDerSzene().schwierig.has("5,20"), false, "für Spieler nicht da");
  // SL: gepunktet statt gestrichelt
  modul.anzeige.zeichnen();
  assert.ok(modul.anzeige.grafik.striche.length > 0, "SL sieht es");
  assert.ok(modul.anzeige.grafik.striche.every((s) => laenge(s) <= 2.01), "nur Punkte, keine Striche");
  // Spieler: keine Linie, kein Abzeichen
  game.user = { id: "stefan", isGM: false };
  modul.anzeige.zeichnen();
  assert.equal(modul.anzeige.grafik.striche.length, 0, "Spieler sieht keine Linie");
  modul.abzeichen.alleZeichnen();
  assert.equal(modul.abzeichen.felder.schwierig.has("5,20"), false, "Spieler bekommt kein Abzeichen");
  game.user = spielleitung;
  modul.abzeichen.alleZeichnen();
  assert.ok(modul.abzeichen.felder.schwierig.has("5,20"), "die SL schon");

  // Aufdecken: was der Pinsel überstreicht, sehen Spieler danach; am Gelände ändert sich nichts
  await ziehen("aufdecken", 2050, [250, 450]);
  assert.equal(flags.gelaendepinsel.striche.at(-1).art, "aufdecken");
  assert.equal(flags.gelaendepinsel.striche.at(-1).v, undefined, "Aufdecken ist selbst nie verborgen");
  const nachAufdecken = modul.sichtbareFelderDerSzene().schwierig;
  assert.ok(nachAufdecken.has("3,20") && !nachAufdecken.has("7,20"), "nur wo er streicht");
  assert.ok(modul.felderDerSzene().schwierig.has("7,20"), "das Gelände bleibt");
  modul.anzeige.zeichnen();
  const slStriche = modul.anzeige.grafik.striche;
  assert.ok(slStriche.some((s) => laenge(s) > 10) && slStriche.some((s) => laenge(s) <= 2.01), "SL: aufgedeckt gestrichelt, Rest gepunktet");

  // Schalter aus: sichtbar darübermalen macht sichtbar
  leisteJetzt().verborgen.onChange({}, false);
  await ruhe();
  await ziehen("schwierig", 2050, [550, 850]);
  assert.equal(flags.gelaendepinsel.striche.at(-1).v, undefined, "Schalter aus: sichtbar");
  assert.ok(modul.sichtbareFelderDerSzene().schwierig.has("7,20"), "sichtbar darübergemalt");

  // Am Raster: verborgen gemalte Felder in der Flagge "verborgen", Aufdecken nimmt sie heraus
  await game.settings.set("gelaendepinsel", "rasterModus", true);
  leisteJetzt().verborgen.onChange({}, true);
  await ruhe();
  await game.settings.set("gelaendepinsel", "art", "uneben");
  maus(2, 22);
  ebene._onDragLeftStart({});
  maus(4, 22);
  ebene._onDragLeftMove({});
  ebene._onDragLeftDrop({});
  await ruhe();
  assert.deepEqual(flags.gelaendepinsel.verborgen.uneben, ["2,22", "3,22", "4,22"], "verborgen gemerkt");
  assert.ok(modul.felderDerSzene().uneben.has("3,22"), "wirkt");
  assert.equal(modul.sichtbareFelderDerSzene().uneben.has("3,22"), false, "für Spieler nicht da");
  await game.settings.set("gelaendepinsel", "art", "aufdecken");
  maus(3, 22);
  ebene._onDragLeftStart({});
  ebene._onDragLeftDrop({});
  await ruhe();
  assert.deepEqual(flags.gelaendepinsel.verborgen.uneben, ["2,22", "4,22"], "Aufdecken am Raster");
  assert.ok(modul.sichtbareFelderDerSzene().uneben.has("3,22") && modul.felderDerSzene().uneben.has("3,22"));
  await game.settings.set("gelaendepinsel", "art", "radierer");
  maus(2, 22);
  ebene._onDragLeftStart({});
  ebene._onDragLeftDrop({});
  await ruhe();
  assert.deepEqual(flags.gelaendepinsel.verborgen.uneben, ["4,22"], "Radierer nimmt auch das Verborgene");

  leisteJetzt().verborgen.onChange({}, false);
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "art", "schwierig");
  Object.assign(flags.gelaendepinsel, sicherung);
  delete flags.gelaendepinsel.verborgen;
  await ruhe();
}

// Werte-Pinsel (0.3.15, 29.10.2026: "bei gefährlichem Gelände würfelt der Schaden immer mit Feuer und 20, egal
// was ich einstelle"; gewählt: den Werte-Pinsel): Klick auf eine Fläche setzt Werte für genau diese Fläche
{
  const sicherung = JSON.parse(JSON.stringify(flags.gelaendepinsel));
  flags.gelaendepinsel.striche = [];
  flags.gelaendepinsel.felder = {};
  delete flags.gelaendepinsel.feldWerte;
  game.user = spielleitung;
  await game.settings.set("gelaendepinsel", "rasterModus", false);
  await game.settings.set("gelaendepinsel", "groesse", 1);
  await game.settings.set("gelaendepinsel", "sg", 0);
  await game.settings.set("gelaendepinsel", "schaden", "2d6");
  await game.settings.set("gelaendepinsel", "schadensart", "fire");
  await game.settings.set("gelaendepinsel", "rettungswurf", "reflex");
  const ziehen = async (art, y, xs) => {
    await game.settings.set("gelaendepinsel", "art", art);
    canvas.mousePosition = { x: xs[0], y };
    ebene._onDragLeftStart({});
    for (const x of xs.slice(1)) { canvas.mousePosition = { x, y }; ebene._onDragLeftMove({}); }
    ebene._onDragLeftDrop({});
    await ruhe();
  };
  // Zwei getrennte Flächen gefährlichen Geländes mit den Vorgaben, wie in der Szene vom 29.10.2026
  await ziehen("gefahr", 3050, [250, 750]);
  await ziehen("gefahr", 3350, [250, 750]);
  const stufe = modul.stufenSg();
  assert.deepEqual(modul.werteAn("4,30", "gefahr"), { sg: stufe, schaden: "2d6", typ: "fire", rw: "reflex" }, "Vorgaben wie in der Szene");
  // Der Werte-Knopf ist wählbar und malt nicht
  const c = { tokens: { order: 1 } };
  leiste(c);
  assert.equal(c.gelaendepinsel.tools.werte.button, undefined, "kein Druckknopf mehr");
  await c.gelaendepinsel.tools.werte.onChange();
  assert.equal(game.settings.get("gelaendepinsel", "art"), "werte");
  const strichZahl = flags.gelaendepinsel.striche.length;
  canvas.mousePosition = { x: 250, y: 2650 };
  ebene._onDragLeftStart({});
  ebene._onDragLeftDrop({});
  await ruhe();
  assert.equal(flags.gelaendepinsel.striche.length, strichZahl, "Ziehen mit dem Werte-Knopf malt nichts");
  // Klick auf die obere Fläche: Fenster mit ihren Werten, Übernehmen gilt nur für sie
  const promptVorher = foundry.applications.api.DialogV2.prompt;
  let fenster = null;
  foundry.applications.api.DialogV2.prompt = async (o) => { fenster = o; return o.ok.callback({}, { form: { elements: { sg: { value: "26" }, schaden: { value: "4d6" }, typ: { value: "acid" }, rw: { value: "fortitude" } } } }); };
  maus(4, 30);
  ebene._onClickLeft({});
  await ruhe();
  assert.match(fenster.window.title, /Werte dieser Fläche/u, "Fenster für die Fläche");
  assert.match(fenster.content, /value="2d6"/u, "zeigt ihre Werte");
  assert.deepEqual(modul.werteAn("4,30", "gefahr"), { sg: 26, schaden: "4d6", typ: "acid", rw: "fortitude" }, "die obere Fläche hat neue Werte");
  assert.deepEqual(modul.werteAn("6,30", "gefahr"), { sg: 26, schaden: "4d6", typ: "acid", rw: "fortitude" }, "die ganze Fläche");
  assert.equal(modul.werteAn("4,33", "gefahr").typ, "fire", "die untere Fläche bleibt");
  assert.equal(game.settings.get("gelaendepinsel", "schadensart"), "fire", "die Werte für Neugemaltes bleiben");
  // SG leer heißt stufengerecht
  foundry.applications.api.DialogV2.prompt = async (o) => o.ok.callback({}, { form: { elements: { sg: { value: "" }, schaden: { value: "1d6" }, typ: { value: "cold" }, rw: { value: "will" } } } });
  maus(4, 33);
  ebene._onClickLeft({});
  await ruhe();
  assert.deepEqual(modul.werteAn("4,33", "gefahr"), { sg: stufe, schaden: "1d6", typ: "cold", rw: "will" }, "SG leer: stufengerecht");
  // Klick daneben: wie bisher die Werte für Neugemaltes
  foundry.applications.api.DialogV2.prompt = async (o) => { fenster = o; return o.ok.callback({}, { form: { elements: { sg: { value: "22" }, schaden: { value: "3d8" }, typ: { value: "electricity" }, rw: { value: "reflex" } } } }); };
  maus(4, 27);
  ebene._onClickLeft({});
  await ruhe();
  assert.doesNotMatch(fenster.window.title, /dieser Fläche/u, "daneben: Werte für Neugemaltes");
  assert.equal(game.settings.get("gelaendepinsel", "schadensart"), "electricity");
  // Ein neuer Strich über einen Teil der oberen Fläche: dort gilt er, der Rest behält die Werte der Fläche
  await ziehen("gefahr", 3050, [250, 350]);
  assert.equal(modul.werteAn("2,30", "gefahr").typ, "electricity", "die jüngste Entscheidung gilt");
  assert.equal(modul.werteAn("6,30", "gefahr").typ, "acid", "der Rest der Fläche bleibt");
  // Zwei Arten auf einem Feld: das Fenster fragt, welche Fläche gemeint ist
  await ziehen("uneben", 3350, [250, 450]);
  const waitVorher = foundry.applications.api.DialogV2.wait;
  let frage = null;
  foundry.applications.api.DialogV2.wait = async (o) => { frage = o; return "uneben"; };
  foundry.applications.api.DialogV2.prompt = async (o) => { fenster = o; return o.ok.callback({}, { form: { elements: { sg: { value: "21" }, schaden: { value: "2d6" }, typ: { value: "fire" }, rw: { value: "reflex" } } } }); };
  await game.settings.set("gelaendepinsel", "art", "werte");
  maus(3, 33);
  ebene._onClickLeft({});
  await ruhe();
  assert.deepEqual(frage.buttons.map((b) => b.action), ["gefahr", "uneben"], "gefährlich und uneben zur Wahl");
  assert.equal(modul.werteAn("3,33", "uneben").sg, 21, "uneben bekommt seinen SG");
  assert.equal(modul.werteAn("3,33", "gefahr").typ, "cold", "das gefährliche Gelände bleibt");
  foundry.applications.api.DialogV2.prompt = promptVorher;
  foundry.applications.api.DialogV2.wait = waitVorher;
  await game.settings.set("gelaendepinsel", "art", "schwierig");
  await game.settings.set("gelaendepinsel", "schaden", "2d6");
  await game.settings.set("gelaendepinsel", "schadensart", "fire");
  Object.assign(flags.gelaendepinsel, sicherung);
  delete flags.gelaendepinsel.feldWerte;
  await ruhe();
}

assert.deepEqual(protokoll.fehler, []);
console.log("rauchtest: ok");
