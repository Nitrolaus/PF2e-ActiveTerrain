// Rauchtest des Geländepinsels mit Foundry-Attrappen. Aufruf: node tests/rauchtest.mjs
// Prüft Laden, Leiste unter Sequencer, Malen mit durchgehender Spur, Regionen, Anzeige und Betreten.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FELD = 100;
const hooks = new Map();
const einmal = new Map();
const protokoll = { regionen: [], chat: [], dialoge: 0, wuerfe: [], aktiviert: [], fehler: [] };

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
  assert.deepEqual(Object.keys(controls.gelaendepinsel.tools), ["schwierig", "sehr", "gefahr", "schmal", "uneben", "radierer", "werte", "groesse05", "groesse1", "groesse2", "groesse3"]);
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
  assert.equal(gruppe.title, "Gelände anzeigen");
  ui.controls.control = { name: "gelaendepinsel" };
  gruppe.onChange({}, true);
  await ruhe();
  assert.equal(einstellungen.get("anzeigen").wert, true);
  assert.deepEqual(protokoll.aktiviert.at(-1), { control: "tokens" });
  const wieder = { tokens: { order: 1 }, sequencer: { name: "sequencer" } };
  leiste(wieder);
  assert.equal(wieder.gelaendepinsel.title, "Gelände ausblenden");
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

// Sehr schwierig über ein Feld: ersetzt dort das schwierige
await game.settings.set("gelaendepinsel", "art", "sehr");
maus(4, 3);
ebene._onClickLeft({});
await ruhe();
assert.deepEqual(flags.gelaendepinsel.felder.schwierig, ["2,3", "3,3", "5,3", "6,3"]);
assert.deepEqual(flags.gelaendepinsel.felder.sehr, ["4,3"]);
assert.equal(szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "schwierig").daten.shapes.length, 2);
assert.deepEqual(szene.regions.find((r) => r.daten.flags.gelaendepinsel.art === "sehr").daten.behaviors[0].system.difficulties.walk, 3);

// Radierer mit Stempel 3: entfernt alles um (5,3); sehr schwieriges leer -> Region weg
await game.settings.set("gelaendepinsel", "art", "radierer");
await game.settings.set("gelaendepinsel", "groesse", 3);
maus(4, 3);
ebene._onClickLeft({});
await ruhe();
assert.deepEqual(flags.gelaendepinsel.felder.schwierig, ["2,3", "6,3"]);
assert.deepEqual(flags.gelaendepinsel.felder.sehr, []);
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
await ruhe();
// Seit 0.2.7 statt Nachfrage eine Karte mit Rettungswurf und Schadenswurf zum Anklicken.
assert.equal(protokoll.dialoge, 0, "Keine Nachfrage mehr");
const gefahrKarte = protokoll.chat.at(-1);
assert.match(gefahrKarte.content, /Silvor<\/strong> geht durch gefährliches Gelände/);
assert.match(gefahrKarte.content, /@Check\[reflex\|dc:\d+\|basic\]/, "Einfacher Reflexwurf");
assert.match(gefahrKarte.content, /@Damage\[2d6\[fire\]\]/, "Schaden zum Würfeln, angewendet von der Spielleitung");
assert.deepEqual(gefahrKarte.whisper, ["gm"]);
const chatNachGefahr = protokoll.chat.length;

// Mit Foundrys Wegpunkten um das Feld herum: keine Nachfrage
silvor.x = 300;
hookAusloesen("updateToken", silvor, { x: 300 }, { _movement: { silvor: { passed: { waypoints: [
  { x: 600, y: 600, action: "walk" }, { x: 400, y: 600, action: "walk" }, { x: 300, y: 500, action: "walk" }
] } } } });
await ruhe();
assert.equal(protokoll.chat.length, chatNachGefahr, "Weg führt nicht durch das gefährliche Feld");

// Teleport betritt nichts
silvor.x = 700;
hookAusloesen("updateToken", silvor, { x: 700 }, { _movement: { silvor: { passed: { waypoints: [{ x: 700, y: 500, action: "displace" }] } } } });
await ruhe();
assert.equal(protokoll.chat.length, chatNachGefahr, "Teleport ohne Karte");

// Schmale Oberfläche: Hinweis nur an die Spielleitung
// Von (7,5) schräg nach (5,7): über (6,6) auf die schmale Oberfläche.
silvor.x = 500;
silvor.y = 700;
hookAusloesen("updateToken", silvor, { x: 500, y: 700 }, {});
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
await ruhe();
assert.equal(protokoll.chat.length, chatVorGm2);
game.user = spielleitung;

// Große Tokens zählen mit ihrer ganzen Fläche
{
  const troll = { id: "troll", x: 300, y: 300, width: 2, height: 2, parent: szene };
  const felder = modul.betreteneFelder(troll, { x: 100, y: 300 }, {});
  assert.deepEqual([...felder].sort(), ["3,3", "3,4", "4,3", "4,4"], "Neu betreten: die Felder ohne die Startfläche");
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

// Sprachdateien: jeder Schlüssel im Code steht in de.json und en.json, beide haben dieselben
// Schlüssel und Platzhalter, keiner ist unbenutzt, und Englisch kommt auch an.
{
  const code = ["gelaendepinsel.mjs", "felder.mjs", "flaeche.mjs", "symbole.mjs"]
    .map((datei) => readFileSync(new URL(`../scripts/${datei}`, import.meta.url), "utf8")).join("\n");
  const benutzt = new Set([...code.matchAll(/["'`](GELAENDEPINSEL\.[A-Za-z0-9_.]+)["'`]/g)].map((treffer) => treffer[1]));
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
  assert.equal(controls.gelaendepinsel.title, "Terrain Brush");
  assert.equal(controls.gelaendepinsel.tools.schwierig.title, "Difficult Terrain: +5 feet per square, can't Step into it");
  assert.equal(controls.gelaendepinsel.tools.groesse2.title, "Brush 2 squares");
  assert.deepEqual([...fehlendeSchluessel], []);
  sprache = "de";
}

assert.deepEqual(protokoll.fehler, []);
console.log("rauchtest: ok");
