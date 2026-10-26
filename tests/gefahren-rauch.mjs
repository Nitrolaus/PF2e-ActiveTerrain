// Rauchtest der Gefahren-Karte (0.3.0) mit Foundry- und PF2e-Attrappen. Aufruf: node tests/gefahren-rauch.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const FELD = 100;
const hooks = new Map();
const chat = [];
const geklickt = [];
const meldungen = [];
const texte = JSON.parse(readFileSync(new URL("../lang/de.json", import.meta.url), "utf8"));
const flach = (o, p = "") => Object.entries(o).flatMap(([k, v]) => (typeof v === "object" ? flach(v, `${p}${k}.`) : [[`${p}${k}`, v]]));
const TEXTE = Object.fromEntries(flach(texte));
const einstellungen = new Map([["gelaendepinsel.magieAufdecken", false]]);

globalThis.Hooks = { on: (n, fn) => (hooks.get(n) ?? hooks.set(n, []).get(n)).push(fn), once() {}, callAll() {} };
const ausloesen = async (n, ...a) => { for (const fn of hooks.get(n) ?? []) await fn(...a); await new Promise((r) => setTimeout(r, 20)); };
globalThis.foundry = { utils: { escapeHTML: (s) => String(s) }, applications: { ux: { TextEditor: { implementation: { enrichHTML: async (s) => `<a class="inline-roll" data-base-formula="${s}">x</a>` } } }, api: { DialogV2: { wait: async () => null } } } };
globalThis.ChatMessage = { create: async (d) => { chat.push(d); return d; } };
globalThis.ui = { notifications: { warn: (t) => meldungen.push(t), info: (t) => meldungen.push(t) } };
globalThis.MouseEvent = class { constructor(typ) { this.type = typ; } };
globalThis.document = {
  body: { append() {} },
  createElement: () => {
    const el = { style: {}, dataset: {}, innerHTML: "", remove() {} };
    el.querySelector = () => ({ dispatchEvent: () => geklickt.push({ formel: /data-base-formula="@Damage\[(.*)\]"/u.exec(el.innerHTML)?.[1], item: el.dataset.itemUuid }) });
    return el;
  }
};

function dokument(daten) {
  const flags = {};
  const d = {
    ...daten, flags,
    getFlag: (m, k) => flags[k],
    setFlag: async (m, k, v) => { flags[k] = v; },
    update: async (u) => { for (const [k, v] of Object.entries(u)) { if (k.startsWith("flags.gelaendepinsel.")) flags[k.slice(21)] = v; else d[k] = v; } }
  };
  return d;
}
const gm = { id: "gm", isGM: true };
const spieler = { id: "sp", isGM: false };
const AKTION_TEXT = "<p><strong>Auslöser</strong> Eine Kreatur betritt das Feld</p><hr /><p><strong>Effekt</strong> Die Falle verursacht @Damage[(2d6+8)[void]] Schaden (@Check[fortitude|dc:26|basic] Rettungswurf).</p>";
const aktion = { id: "aktion00000000001", type: "action", name: "Blut entziehen", uuid: "Actor.g.Item.a", getRollData: () => ({}), system: { actionType: { value: "reaction" }, description: { value: AKTION_TEXT } } };
const gefahrActor = {
  type: "hazard", level: 6, isOfType: (...t) => t.includes("hazard"),
  items: Object.assign([aktion], { get: (id) => (id === aktion.id ? aktion : null) }),
  system: {
    traits: { value: ["magical", "trap"] },
    attributes: { stealth: { value: 16, dc: 26, details: "<p>(Experte) um die Falle zu bemerken</p>" } },
    details: { disable: "<p>@Check[thievery|dc:25] (Geübt) oder @Check[arcana|dc:25]; insgesamt zwei Erfolge</p>" }
  }
};
const heldin = { id: "heldinActor000001", name: "Brandy", isOfType: (...t) => t.includes("creature") || t.includes("character"),
  testUserPermission: (u) => u.id === "sp", perception: { rank: 2, roll: async (o) => { chat.push({ geheim: o }); return { degreeOfSuccess: 2 }; } },
  skills: { thievery: { rank: 1 }, arcana: { rank: 0 } }, system: { exploration: ["suche"] },
  items: { get: (id) => (id === "suche" ? { slug: "search" } : null) } };
const szene = { id: "szene", tokens: null };
const gefahr = dokument({ id: "gefahr0000000001", name: "Blutentzug", x: 300, y: 300, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
const brandy = dokument({ id: "brandy0000000001", name: "Brandy", x: 100, y: 300, width: 1, height: 1, hidden: false, actor: heldin, parent: szene });
heldin.getActiveTokens = () => [brandy];
szene.tokens = Object.assign([gefahr, brandy], { get(id) { return this.find((d) => d.id === id); }, has(id) { return this.some((d) => d.id === id); } });

globalThis.canvas = { scene: szene, grid: { size: FELD, distance: 5, getOffset: ({ x, y }) => ({ i: Math.floor(y / FELD), j: Math.floor(x / FELD) }), measurePath: ([a, b]) => {
  // Wie PF2e auf dem Quadratraster: jede zweite Diagonale zählt doppelt (5, 10, 5 ...).
  const dx = Math.round(Math.abs(a.x - b.x) / FELD);
  const dy = Math.round(Math.abs(a.y - b.y) / FELD);
  return { distance: 5 * (Math.max(dx, dy) + Math.floor(Math.min(dx, dy) / 2)) };
} }, tokens: { get: () => null, placeables: [] } };
globalThis.CONFIG = { Canvas: { polygonBackends: { sight: { testCollision: () => false } } } };
globalThis.game = {
  user: gm, users: Object.assign([gm, spieler], { activeGM: gm }), combat: null,
  scenes: [szene], actors: { get: () => heldin },
  i18n: { localize: (k) => TEXTE[k] ?? k, format: (k, d) => (TEXTE[k] ?? k).replace(/\{(\w+)\}/gu, (_m, n) => d[n]) },
  settings: { register() {}, get: (m, k) => einstellungen.get(`${m}.${k}`) }
};

const g = await import("../scripts/gefahren.mjs");
g.anmelden();

// Felder, versteckte Fallen, Betroffene
assert.deepEqual([...g.felderVon(gefahr)], ["3,3"]);
assert.deepEqual([...g.versteckteFallen(szene).keys()], ["falle:gefahr0000000001"]);
assert.equal(g.betroffene(gefahr).length, 0, "Brandy steht noch daneben");
// Bereich aus der Falle (0.3.1): ohne Angabe nur ihr Feld; mit @Template[emanation|distance:5] auch die Nachbarn.
assert.equal(g.bereichsFelder(gefahr).size, 1);
const vorherText = aktion.system.description.value;
aktion.system.description.value = vorherText.replace("Die Falle verursacht", "Jede Kreatur in einer @Template[emanation|distance:5] erleidet; die Falle verursacht");
assert.equal(g.bereichsFelder(gefahr).size, 9, "5 Fuß um ein Feld: 3 mal 3");
assert.equal(g.betroffene(gefahr).length, 0, "Brandy steht zwei Felder weg");
brandy.x = 200;
assert.equal(g.betroffene(gefahr).length, 1, "Brandy im Bereich");
brandy.x = 100;
aktion.system.description.value = vorherText;

// Über die versteckte Falle laufen: aufdecken, Karte mit Kennung an SL und Besitzerin
brandy.x = 300;
await g.ueberFalle(brandy, gefahr.id);
assert.equal(gefahr.hidden, false, "aufgedeckt");
const karte = chat.find((c) => String(c.content).includes("gelaendepinsel:falle:"));
assert.ok(karte, "Karte mit Kennung");
assert.ok(karte.content.includes("@Check[fortitude|dc:26|basic|options:gelaendepinsel:falle:gefahr0000000001:aktion00000000001:brandy0000000001]"));
assert.deepEqual(karte.whisper, ["gm", "sp"]);
assert.ok(chat.some((c) => String(c.content).includes("Gefahr entdeckt")), "Meldung an die SL");

// Rettungswurf misslungen: Schaden voll, über den @Damage-Befehl der Aktion
await ausloesen("createChatMessage", { flags: { pf2e: { context: { type: "saving-throw", outcome: "failure", options: ["gelaendepinsel:falle:gefahr0000000001:aktion00000000001:brandy0000000001"] } } }, speaker: {} });
assert.deepEqual(geklickt.at(-1), { formel: "(2d6+8)[void]", item: "Actor.g.Item.a" });
assert.ok(chat.at(-1).content.includes("Voller Schaden"));
// Erfolg beim einfachen Rettungswurf: halber Schaden; kritischer Erfolg: keiner
await ausloesen("createChatMessage", { flags: { pf2e: { context: { outcome: "success", options: ["gelaendepinsel:falle:gefahr0000000001:aktion00000000001:brandy0000000001"] } } }, speaker: {} });
assert.ok(chat.at(-1).content.includes("Halben Schaden"));
const vorher = geklickt.length;
await ausloesen("createChatMessage", { flags: { pf2e: { context: { outcome: "criticalSuccess", options: ["gelaendepinsel:falle:gefahr0000000001:aktion00000000001:brandy0000000001"] } } }, speaker: {} });
assert.equal(geklickt.length, vorher, "kritischer Erfolg würfelt keinen Schaden");

// Entschärfen: Karte, ungeübt in Arkane Künste zählt bei Geübt-Pflicht nicht (nur Diebeskunst hat sie), zwei Erfolge nötig
await g.entschaerfenAnbieten(gefahr);
assert.ok(chat.at(-1).content.includes("options:gelaendepinsel:entschaerfen:gefahr0000000001:0"));
await ausloesen("createChatMessage", { actor: heldin, flags: { pf2e: { context: { outcome: "success", options: ["gelaendepinsel:entschaerfen:gefahr0000000001:0"] } } }, speaker: {} });
assert.equal(gefahr.flags.erfolge, 1);
assert.ok(!gefahr.flags.entschaerft);
await ausloesen("createChatMessage", { actor: heldin, flags: { pf2e: { context: { outcome: "success", options: ["gelaendepinsel:entschaerfen:gefahr0000000001:1"] } } }, speaker: {} });
assert.equal(gefahr.flags.entschaerft, true, "zweiter Erfolg entschärft (Arkane Künste ohne Mindestgrad)");
assert.deepEqual([...g.versteckteFallen(szene).keys()], [], "entschärft löst nicht mehr aus");

// Suchen entlang des Wegs (0.3.3): Suchzone 15 Fuß um den Bereich der Falle, geheimer Wurf beim Losfahren
// je Falle einmal, aufgedeckt erst am Rand der Zone; Expertin genügt dem Mindestgrad. Den Halt prüft
// tests/rauchtest.mjs.
const zweite = dokument({ id: "gefahr0000000002", name: "Zweite", x: 500, y: 300, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
szene.tokens.push(zweite);
brandy.x = 400;
const zone = g.suchZonen(brandy).get("suche:gefahr0000000002");
assert.ok(zone.has("8,3") && zone.has("2,3") && !zone.has("9,3"), "drei Felder um ihr Feld");
assert.ok(zone.has("7,5") && !zone.has("8,5"), "Diagonalen wie PF2e: zwei schräg und eins gerade sind 15 Fuß");
heldin.perception.rank = 1;
assert.equal(g.suchZonen(brandy).has("suche:gefahr0000000002"), false, "Geübt reicht nicht für eine Expertenfalle");
heldin.perception.rank = 2;
game.combat = { started: true };
assert.equal(g.suchZonen(brandy).size, 0, "im Kampf keine Erkundung");
game.combat = null;
g.sucheVorbereiten(brandy, zweite.id);
g.sucheVorbereiten(brandy, zweite.id);
assert.equal(chat.filter((c) => c.geheim).length, 1, "beim Losfahren ein Wurf, auch zweimal gebeten");
assert.equal(chat.find((c) => c.geheim).geheim.messageMode, "gm");
await new Promise((r) => setTimeout(r, 0));
assert.equal(zweite.hidden, true, "aufgedeckt erst am Rand der Zone");
assert.equal(g.sucheErreicht(brandy, zweite.id), true, "Ergebnis steht schon fest: gefunden");
await new Promise((r) => setTimeout(r, 0));
assert.equal(zweite.hidden, false, "beim Suchen gefunden");
g.sucheVorbereiten(brandy, zweite.id);
assert.equal(chat.filter((c) => c.geheim).length, 1, "je Falle nur ein Wurf");
// Misslungen: danach keine Zone mehr für sie; ebenso nach einem Wurf aus 0.3.0 bis 0.3.2 (Flagge gesucht).
// Weit weg, damit die Prüfungen unten sie nicht sehen.
const fuenfte = dokument({ id: "gefahr0000000005", name: "Fünfte", x: 500, y: 3000, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
const sechste = dokument({ id: "gefahr0000000006", name: "Sechste", x: 500, y: 3300, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
sechste.flags.gesucht = [heldin.id];
szene.tokens.push(fuenfte, sechste);
const wurfVorher = heldin.perception.roll;
heldin.perception.roll = async (o) => { chat.push({ geheim: o }); return { degreeOfSuccess: 1 }; };
const offen = g.sucheErreicht(brandy, fuenfte.id);
assert.equal(typeof offen.then, "function", "noch kein Ergebnis: ein Versprechen");
assert.equal(await offen, false);
assert.equal(fuenfte.hidden, true);
assert.equal(fuenfte.flags.suche[heldin.id], 1, "Ergebnis steht an der Falle");
assert.equal(g.suchZonen(brandy).has("suche:gefahr0000000005"), false, "misslungen: keine Zone mehr");
assert.equal(g.suchZonen(brandy).has("suche:gefahr0000000006"), false, "alte Flagge gesucht zählt als Wurf");
heldin.perception.roll = wurfVorher;

// Gezieltes Suchen (Seek): Ergebnis unter dem SG findet nichts, darüber schon
const dritte = dokument({ id: "gefahr0000000003", name: "Dritte", x: 600, y: 300, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
szene.tokens.push(dritte);
await ausloesen("createChatMessage", { actor: heldin, rolls: [{ total: 20 }], flags: { pf2e: { context: { type: "perception-check", options: ["action:seek"] } } } });
assert.equal(dritte.hidden, true, "20 gegen SG 26");
await ausloesen("createChatMessage", { actor: heldin, rolls: [{ total: 27 }], flags: { pf2e: { context: { type: "perception-check", options: ["action:seek"] } } } });
assert.equal(dritte.hidden, false, "27 gegen SG 26");

// Magie entdecken: Grundform nur Hinweis; Grad 4 mit Quelle; aufdecken nur mit der Einstellung
const vierte = dokument({ id: "gefahr0000000004", name: "Vierte", x: 700, y: 300, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
szene.tokens.push(vierte);
brandy.x = 600;
await ausloesen("createChatMessage", { actor: heldin, item: { type: "spell", slug: "detect-magic", rank: 1 }, flags: { pf2e: {} } });
assert.match(chat.at(-1).content, /Magie in 9 m/u);
assert.doesNotMatch(chat.at(-1).content, /Quelle/u);
assert.equal(vierte.hidden, true, "ohne Einstellung bleibt sie versteckt");
einstellungen.set("gelaendepinsel.magieAufdecken", true);
await ausloesen("createChatMessage", { actor: heldin, item: { type: "spell", slug: "detect-magic" }, flags: { pf2e: { casting: { castRank: 4 } } } });
assert.ok(chat.some((c) => /Quelle der stärksten Magie/u.test(c.content)));
assert.equal(vierte.hidden, false, "mit Einstellung aufgedeckt");

// Knopf im Token-HUD nur für die SL und nur an Gefahren
const spalte = { kinder: [], querySelector: () => null, append(k) { this.kinder.push(k); } };
const wurzel = { querySelector: (s) => (s === ".col.right" ? spalte : null) };
const elementVorher = globalThis.document.createElement;
globalThis.document.createElement = () => ({ dataset: {}, addEventListener() {}, set innerHTML(_v) {} });
for (const fn of hooks.get("renderTokenHUD")) fn({}, wurzel, { _id: gefahr.id });
assert.equal(spalte.kinder.length, 1);
for (const fn of hooks.get("renderTokenHUD")) fn({}, wurzel, { _id: brandy.id });
assert.equal(spalte.kinder.length, 1, "kein Knopf an Figuren");

// Kampf beitreten (0.3.2): weg an einfachen Gefahren, auch im HUD eines Spielers; Figuren und komplexe
// Gefahren behalten ihn
function hudMitKampf(id) {
  const kampf = { entfernt: false, remove() { this.entfernt = true; } };
  const sp = { kinder: [], querySelector: () => null, append(k) { this.kinder.push(k); } };
  const w = { querySelector: (s) => (s === ".col.right" ? sp : s === '[data-action="combat"]' ? kampf : null) };
  for (const fn of hooks.get("renderTokenHUD")) fn({}, w, { _id: id });
  return { entfernt: kampf.entfernt, knoepfe: sp.kinder.length };
}
assert.deepEqual(hudMitKampf(gefahr.id), { entfernt: true, knoepfe: 1 }, "einfache Gefahr: kein Kampf beitreten");
assert.deepEqual(hudMitKampf(brandy.id), { entfernt: false, knoepfe: 0 }, "Figuren behalten ihn");
globalThis.game.user = spieler;
assert.deepEqual(hudMitKampf(gefahr.id), { entfernt: true, knoepfe: 0 }, "Spieler: weg, Totenkopf nur für die SL");
globalThis.game.user = gm;
gefahrActor.system.details.isComplex = true;
assert.deepEqual(hudMitKampf(gefahr.id), { entfernt: false, knoepfe: 1 }, "komplexe Gefahr behält ihn");
delete gefahrActor.system.details.isComplex;

// Auslöser und Wirkung getrennt (0.3.9): ohne Angabe löst nur das Feld aus; die Wirkung kommt aus der Flagge
// am Token, sonst am Akteur, sonst aus den Daten
const platte = dokument({ id: "gefahr0000000007", name: "Platte", x: 300, y: 2000, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
szene.tokens.push(platte);
platte.flags.wirkung = 5;
assert.equal(g.ausloeseFelder(platte).size, 1, "Auslöser: nur das Feld");
assert.equal(g.versteckteFallen(szene).get("falle:gefahr0000000007").size, 1);
assert.equal(g.bereichsFelder(platte).size, 9, "Wirkung 5 Fuß: 3 mal 3");
platte.flags.ausloeser = 5;
assert.equal(g.versteckteFallen(szene).get("falle:gefahr0000000007").size, 9, "eigener Auslöseradius");
delete platte.flags.ausloeser;
gefahrActor.getFlag = (_m, k) => (k === "ausloeser" ? 10 : undefined);
assert.equal(g.ausloeseFelder(platte).size, 21, "Wert am Akteur, wenn der Token keinen hat (10 Fuß wie PF2e)");
delete gefahrActor.getFlag;
// Suchzone um den Auslöser, nicht um die Wirkung
platte.flags.wirkung = 30;
const plattenZone = g.suchZonen(brandy).get("suche:gefahr0000000007");
assert.ok(plattenZone.has("6,20") && !plattenZone.has("7,20"), "15 Fuß um die Platte, nicht um die 30 Fuß Wirkung");

// Entschärfen nur daneben (0.3.9): zu weit weg zählt nicht, auch ein kritischer Fehlschlag löst nichts aus
platte.hidden = false;
await g.entschaerfenAnbieten(platte);
assert.match(chat.at(-1).content, /Es zählt nur, wer neben der Gefahr steht/u);
brandy.x = 100;
brandy.y = 2000;
await ausloesen("createChatMessage", { actor: heldin, flags: { pf2e: { context: { outcome: "success", options: ["gelaendepinsel:entschaerfen:gefahr0000000007:0"] } } }, speaker: {} });
assert.equal(platte.flags.erfolge, undefined, "zwei Felder weg: zählt nicht");
assert.match(chat.at(-1).content, /steht nicht neben der Gefahr/u);
const vorPatzer = chat.length;
await ausloesen("createChatMessage", { actor: heldin, flags: { pf2e: { context: { outcome: "criticalFailure", options: ["gelaendepinsel:entschaerfen:gefahr0000000007:0"] } } }, speaker: {} });
assert.ok(!chat.slice(vorPatzer).some((c) => String(c.content).includes("gelaendepinsel:falle:gefahr0000000007")), "von fern kein Auslösen");
brandy.x = 200;
await ausloesen("createChatMessage", { actor: heldin, flags: { pf2e: { context: { outcome: "success", options: ["gelaendepinsel:entschaerfen:gefahr0000000007:0"] } } }, speaker: {} });
assert.equal(platte.flags.erfolge, 1, "daneben, auch schräg: zählt");

// Aus der Ferne auslösen (0.3.9): zeigt sich, trifft alle im Wirkungsbereich, sonst niemanden
const fern = dokument({ id: "gefahr0000000008", name: "Fernfalle", x: 300, y: 2600, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
szene.tokens.push(fern);
fern.flags.wirkung = 10;
brandy.x = 400;
brandy.y = 2600;
let vorFern = chat.length;
await g.fernAusloesen(fern);
assert.equal(fern.hidden, false, "zeigt sich");
assert.ok(chat.slice(vorFern).some((c) => /wird aus der Ferne ausgelöst/u.test(String(c.content)) && !c.whisper), "für alle sichtbar");
assert.ok(chat.slice(vorFern).some((c) => String(c.content).includes("gelaendepinsel:falle:gefahr0000000008:aktion00000000001:brandy0000000001")), "Karte für Brandy im Bereich");
brandy.x = 1000;
vorFern = chat.length;
await g.fernAusloesen(fern);
assert.ok(chat.slice(vorFern).some((c) => /Niemand steht im Wirkungsbereich/u.test(String(c.content))), "niemand im Bereich");

// Einstellen im Totenkopf-Menü (0.3.9): beide Werte als Flagge am Token; das Menü zeigt sie und bietet Fern und Bereich an
const dialogVorher = foundry.applications.api.DialogV2.wait;
foundry.applications.api.DialogV2.wait = async (o) => o.buttons[0].callback({}, { form: { elements: { ausloeser: { value: "5" }, wirkung: { value: "20" } } } });
await g.bereichEinstellen(fern);
assert.deepEqual([fern.flags.ausloeser, fern.flags.wirkung], [5, 20]);
let menueDaten = null;
foundry.applications.api.DialogV2.wait = async (o) => { menueDaten = o; return null; };
fern.flags.entschaerft = false;
await g.menue(fern);
assert.match(menueDaten.content, /Auslöser 5 Fuß, Wirkung 20 Fuß/u);
assert.ok(["fern", "bereich"].every((a) => menueDaten.buttons.some((b) => b.action === a)));
foundry.applications.api.DialogV2.wait = dialogVorher;

// Eine Karte für alle Betroffenen (0.3.10, Atem des Blutes mit fünf Gefangenen): der Text einmal, je Figur eine
// Zeile mit ihrem Wurf; an die SL und alle, denen eine der Figuren gehört; ein Wurf bleibt der Figur zugeordnet
const gefangenActor = { name: "Gefangener", isOfType: (...t) => t.includes("creature"), testUserPermission: () => false };
const gefangene = [1, 2].map((n) => dokument({ id: `gefangener000000${n}`, name: "Gefangener", x: 300 + n * 100, y: 2600, width: 1, height: 1, hidden: false, actor: gefangenActor, parent: szene }));
szene.tokens.push(...gefangene);
brandy.x = 300;
fern.flags.wirkung = 10;
fern.flags.entschaerft = false;
fern.hidden = true;
vorFern = chat.length;
await g.ueberFalle(brandy, fern.id);
const karten = chat.slice(vorFern).filter((c) => String(c.content).includes("gelaendepinsel:falle:"));
assert.equal(karten.length, 1, "eine Karte statt drei");
const sammel = karten[0].content;
for (const id of ["brandy0000000001", "gefangener0000001", "gefangener0000002"]) {
  assert.ok(sammel.includes(`@Check[fortitude|dc:26|basic|options:gelaendepinsel:falle:gefahr0000000008:aktion00000000001:${id}]`), `Wurf für ${id}`);
}
assert.match(sammel, /Betrifft 3 Figuren/u);
assert.equal((sammel.match(/<li>/gu) ?? []).length, 3, "eine Zeile je Figur");
assert.equal((sammel.match(/Die Falle verursacht/gu) ?? []).length, 1, "der Text steht einmal da");
assert.ok(!/@Check\[fortitude\|dc:26\|basic\]/u.test(sammel), "im Text kein Wurf ohne Zuordnung");
assert.deepEqual(karten[0].whisper, ["gm", "sp"], "SL und Brandys Spielerin, ohne Doppel");
globalThis.document.createElement = elementVorher;
await ausloesen("createChatMessage", { flags: { pf2e: { context: { outcome: "failure", options: ["gelaendepinsel:falle:gefahr0000000008:aktion00000000001:gefangener0000002"] } } }, speaker: {} });
assert.ok(chat.some((c) => /Gefangener/u.test(String(c.content)) && /Voller Schaden/u.test(String(c.content))), "Folge für den Gefangenen, der gewürfelt hat");
assert.deepEqual(geklickt.at(-1), { formel: "(2d6+8)[void]", item: "Actor.g.Item.a" }, "sein Schaden gewürfelt");

// Wirkungslinie (0.3.10, gemeldet: "in einem Raum mit 4 Wänden und Türe sollte die nicht betroffen sein"): Wände, die
// Bewegung sperren, und geschlossene Türen halten Wirkung und Auslöser auf, offene Türen nicht. Die Falle steht
// auf Feld 3,40; rechts von ihr verläuft bei x = 400 eine Wand mit einer Tür auf Höhe des Felds.
const waende = [
  { c: [400, 3800, 400, 4000], tuer: false },
  { c: [400, 4000, 400, 4100], tuer: true, offen: false },
  { c: [400, 4100, 400, 4300], tuer: false }
];
const schneidet = (a, b, c, d) => {
  const r = (p, q, s) => (q.x - p.x) * (s.y - p.y) - (q.y - p.y) * (s.x - p.x);
  return r(a, b, c) * r(a, b, d) < 0 && r(c, d, a) * r(c, d, b) < 0;
};
const zimmer = dokument({ id: "gefahr0000000009", name: "Zimmerfalle", x: 300, y: 4000, width: 1, height: 1, hidden: true, actor: gefahrActor, parent: szene });
zimmer.object = {
  checkCollision(nach, { origin, type, mode }) {
    assert.equal(type, "move");
    assert.equal(mode, "any");
    return waende.some((w) => !(w.tuer && w.offen) && schneidet(origin, nach, { x: w.c[0], y: w.c[1] }, { x: w.c[2], y: w.c[3] }));
  }
};
szene.tokens.push(zimmer);
zimmer.flags.wirkung = 10;
zimmer.flags.ausloeser = 5;
brandy.x = 200;
brandy.y = 4000;
gefangene[0].x = 500;
gefangene[0].y = 4000;
assert.equal(g.ausloeseFelder(zimmer).size, 6, "Auslöser: 3 mal 3 ohne die drei Felder hinter der Wand");
assert.ok(!g.ausloeseFelder(zimmer).has("4,40"), "hinter der geschlossenen Tür löst nichts aus");
assert.equal(g.versteckteFallen(szene).get("falle:gefahr0000000009").size, 6, "die Fahrtprüfung bekommt dieselben Felder");
assert.deepEqual(g.betroffene(zimmer).map((d) => d.id), ["brandy0000000001"], "der Gefangene hinter der Wand bleibt verschont");
waende[1].offen = true;
assert.ok(g.ausloeseFelder(zimmer).has("4,40"), "durch die offene Tür löst es aus");
assert.ok(!g.ausloeseFelder(zimmer).has("4,39"), "daneben bleibt die Wand");
assert.deepEqual(g.betroffene(zimmer).map((d) => d.id).sort(), ["brandy0000000001", "gefangener0000001"], "durch die offene Tür getroffen");
waende[1].offen = false;
delete zimmer.object;
assert.equal(g.ausloeseFelder(zimmer).size, 9, "ohne Prüfmöglichkeit wie bisher");
brandy.x = 100;
brandy.y = 300;

console.log("gefahren-rauch: ok");
