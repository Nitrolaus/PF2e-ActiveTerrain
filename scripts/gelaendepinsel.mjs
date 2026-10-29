/**
 * Geländepinsel - Foundry-Anbindung (Foundry V14, PF2e 8.6).
 *
 * Spielleitung: Gruppe "Geländepinsel" in der linken Leiste direkt unter Sequencer, Werkzeuge je
 * Geländeart und Radierer, Stempelgröße 1/2/3. Malen mit gedrückter Maus, die Spur ist lückenlos.
 * Gespeichert im Szenen-Flag; schwieriges und sehr schwieriges Gelände zusätzlich als Foundry-Region
 * mit Bewegungskosten, die PF2e nach Kernregeln: Spieler S. 423 rechnet.
 * Spieler: derselbe Platz in der Leiste ist ein Schalter, der die Umrandungen zeigt oder verbirgt.
 */

import { ARTEN, aussenkanten, ersetzt, pinselFelder, schluessel, spurFelder, zuRechtecken } from "./felder.mjs";
import { FEIN, flaechenAusStrichen, gelaendeWirkung, kleineStuecke, strichPunkte, vereinfachen, weicherRand, zaehlendeFelder } from "./flaeche.mjs";
import { STIEFEL, STRICH, ZEICHEN } from "./symbole.mjs";
import * as gefahren from "./gefahren.mjs";
import * as suchen from "./suchen.mjs";

const MODUL = "gelaendepinsel";
const VERSION = "0.3.11";
const KOSTEN_ARTEN = ["schwierig", "sehr"];
const PROBEN_ARTEN = ["gefahr", "schmal", "uneben"];
// Jede Art ein eigenes Symbol im Menü (23.10.2026: "da stehen 5 Pinsel gleich aussehend"), seit
// 0.2.3 dieselben Bilder wie am Token (Wunsch: "nimm diese Bilder"): assets/symbole/<art>.png,
// eingebunden über styles/gelaendepinsel.css.
export const SYMBOLE = Object.freeze({
  schwierig: "gelaendepinsel-symbol gelaendepinsel-symbol-schwierig",
  sehr: "gelaendepinsel-symbol gelaendepinsel-symbol-sehr",
  gefahr: "gelaendepinsel-symbol gelaendepinsel-symbol-gefahr",
  schmal: "gelaendepinsel-symbol gelaendepinsel-symbol-schmal",
  uneben: "gelaendepinsel-symbol gelaendepinsel-symbol-uneben"
});
// Reihenfolge der Abzeichen am Token, vom ersten an der gewählten Lage an (Einstellung abzeichenLage).
const ABZEICHEN_REIHE = ["sehr", "schwierig", "gefahr", "schmal", "uneben"];
const InteractionLayer = globalThis.foundry?.canvas?.layers?.InteractionLayer;

// Zweisprachig seit 23.10.2026: Alle sichtbaren Texte stehen als Schlüssel GELAENDEPINSEL.* in
// lang/de.json und lang/en.json. Foundry lädt sie erst nach init, deshalb halten Konstanten nur den
// Schlüssel, übersetzt wird beim Anzeigen. Mit daten setzt Foundry {platzhalter} ein.
const uebersetzen = (schl, daten) => (daten ? game.i18n.format(schl, daten) : game.i18n.localize(schl));

/* ------------------------------------------------------------------ Einstellungen */

// name, hint und choices sind Schlüssel; die übersetzt Foundry im Einstellungsmenü selbst.
function einstellungenAnmelden() {
  game.settings.register(MODUL, "anzeigen", {
    name: "GELAENDEPINSEL.Einstellung.Anzeigen.Name",
    hint: "GELAENDEPINSEL.Einstellung.Anzeigen.Hint",
    scope: "client",
    config: false,
    type: Boolean,
    // Vorgabe an (0.3.11, 29.10.2026 in der Sitzung: "Spieler sehen die gelben Striche der Geländearten
    // nicht, ebenso wenig die Grafiken, wenn diese darin stehen"). Bis 0.3.10 sahen Spieler Linien und
    // Abzeichen erst nach einem Klick auf den Berg in der Leiste; der Berg blendet weiter aus und ein.
    default: true,
    onChange: () => {
      anzeige.zeichnen();
      abzeichen.alleZeichnen();
      globalThis.ui?.controls?.render?.();
    }
  });
  game.settings.register(MODUL, "art", { scope: "client", config: false, type: String, default: "schwierig" });
  // Messung der Fahrten (0.2.15), seit 0.2.17 aus. Wieder an im Browser der Spielleitung mit
  // game.settings.set("gelaendepinsel", "messung", true).
  game.settings.register(MODUL, "messung", { scope: "client", config: false, type: Boolean, default: false });
  game.settings.register(MODUL, "groesse", { scope: "client", config: false, type: Number, default: 1 });
  // Werte der bemalten Flächen (0.2.7): SG 0 heißt stufengerecht nach Gruppenstufe.
  game.settings.register(MODUL, "sg", { scope: "client", config: false, type: Number, default: 0 });
  game.settings.register(MODUL, "schaden", { scope: "client", config: false, type: String, default: "2d6" });
  game.settings.register(MODUL, "schadensart", { scope: "client", config: false, type: String, default: "fire" });
  game.settings.register(MODUL, "rettungswurf", { scope: "client", config: false, type: String, default: "reflex" });
  // Deckkraft der Linien je Rechner (0.1.2, 23.10.2026: "es reicht, wenn man es kaum sieht",
  // "wir machen die Darstellung deckend einstellbar"). Vorgabe 40 Prozent.
  game.settings.register(MODUL, "deckkraft", {
    name: "GELAENDEPINSEL.Einstellung.Deckkraft.Name",
    hint: "GELAENDEPINSEL.Einstellung.Deckkraft.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 10, max: 100, step: 5 },
    default: 40,
    onChange: () => anzeige.zeichnen()
  });
  // Strichstärke der Linien je Rechner (23.10.2026), als Faktor auf die bisherige Breite, die mit der
  // Feldgröße wächst. Vorgabe 100 Prozent zeichnet genau wie vorher.
  game.settings.register(MODUL, "strichstaerke", {
    name: "GELAENDEPINSEL.Einstellung.Strichstaerke.Name",
    hint: "GELAENDEPINSEL.Einstellung.Strichstaerke.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 50, max: 300, step: 10 },
    default: 100,
    onChange: () => anzeige.zeichnen()
  });
  // 0.2.0 (23.10.2026): Darstellung je Rechner, weil einige Spieler alte Rechner haben.
  game.settings.register(MODUL, "darstellung", {
    name: "GELAENDEPINSEL.Einstellung.Darstellung.Name",
    hint: "GELAENDEPINSEL.Einstellung.Darstellung.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      weich: "GELAENDEPINSEL.Einstellung.Darstellung.Weich",
      einfach: "GELAENDEPINSEL.Einstellung.Darstellung.Einfach",
      aus: "GELAENDEPINSEL.Einstellung.Darstellung.Aus"
    },
    default: "weich",
    onChange: () => anzeige.zeichnen()
  });
  game.settings.register(MODUL, "zaehlendeFelder", {
    name: "GELAENDEPINSEL.Einstellung.ZaehlendeFelder.Name",
    hint: "GELAENDEPINSEL.Einstellung.ZaehlendeFelder.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => anzeige.zeichnen()
  });
  game.settings.register(MODUL, "abzeichenLage", {
    name: "GELAENDEPINSEL.Einstellung.AbzeichenLage.Name",
    hint: "GELAENDEPINSEL.Einstellung.AbzeichenLage.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: { ...ABZEICHEN_LAGEN },
    default: "rechtsOben",
    onChange: () => abzeichen.alleZeichnen()
  });
  game.settings.register(MODUL, "rasterModus", {
    name: "GELAENDEPINSEL.Einstellung.RasterModus.Name",
    hint: "GELAENDEPINSEL.Einstellung.RasterModus.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });
}

function einstellungSicher(name, vorgabe) {
  try {
    const wert = game.settings.get(MODUL, name);
    return wert ?? vorgabe;
  } catch (_error) {
    return vorgabe;
  }
}

const einstellung = (name) => game.settings.get(MODUL, name);

/* ------------------------------------------------------------------ Daten */

export function rasterFelderDerSzene(szene = globalThis.canvas?.scene) {
  const roh = szene?.getFlag?.(MODUL, "felder") ?? {};
  const ergebnis = {};
  for (const art of Object.keys(ARTEN)) ergebnis[art] = new Set(Array.isArray(roh[art]) ? roh[art] : []);
  return ergebnis;
}

export function stricheDerSzene(szene = globalThis.canvas?.scene) {
  const roh = szene?.getFlag?.(MODUL, "striche");
  return Array.isArray(roh) ? roh : [];
}

// Frei gemalte Flaechen und ihre zaehlenden Felder, je Strichliste einmal gerechnet.
const flaechenCache = new WeakMap();
export function flaechenDerSzene(szene = globalThis.canvas?.scene) {
  const liste = stricheDerSzene(szene);
  let eintrag = flaechenCache.get(liste);
  if (!eintrag) {
    const flaechen = flaechenAusStrichen(liste);
    const felder = {};
    for (const art of Object.keys(ARTEN)) felder[art] = zaehlendeFelder(flaechen[art]);
    eintrag = { flaechen, felder };
    flaechenCache.set(liste, eintrag);
  }
  return eintrag;
}

/** Zaehlende Felder je Art: am Raster gemalt plus frei gemalt ab der Haelfte (0.2.0). */
export function felderDerSzene(szene = globalThis.canvas?.scene) {
  const ergebnis = rasterFelderDerSzene(szene);
  const { felder } = flaechenDerSzene(szene);
  for (const art of Object.keys(ARTEN)) for (const feld of felder[art]) ergebnis[art].add(feld);
  return ergebnis;
}

async function felderSpeichern(felder, szene = canvas?.scene, art = null) {
  if (!game.user?.isGM || !szene) return;
  const daten = {};
  for (const name of Object.keys(ARTEN)) daten[name] = [...(felder[name] ?? [])].sort();
  await szene.setFlag(MODUL, "felder", daten);
  await szeneWerteMerken(art, szene);
  await regionenAbgleichen(felderDerSzene(szene), szene);
}

async function strichSpeichern(neu, szene = canvas?.scene) {
  if (!game.user?.isGM || !szene) return;
  if (PROBEN_ARTEN.includes(neu.art)) neu = { ...neu, w: aktuelleWerte() };
  await szene.setFlag(MODUL, "striche", [...stricheDerSzene(szene), neu]);
  await szeneWerteMerken(neu.art, szene);
  // Der Radierer nimmt auch am Raster gemaltes Gelaende, wo er ein Feld zur Haelfte trifft.
  if (neu.art === "radierer") {
    const raster = rasterFelderDerSzene(szene);
    const getroffen = zaehlendeFelder(strichPunkte(neu));
    let geaendert = false;
    for (const menge of Object.values(raster)) for (const feld of getroffen) if (menge.delete(feld)) geaendert = true;
    if (geaendert) {
      const daten = {};
      for (const art of Object.keys(ARTEN)) daten[art] = [...raster[art]].sort();
      await szene.setFlag(MODUL, "felder", daten);
    }
  }
  await regionenAbgleichen(felderDerSzene(szene), szene);
}

/* ------------------------------------------------------------------ Werte der Flächen (0.2.7) */

// 23.10.2026: "alle drei bauen, Schaden wende ich selbst an, aber Reflexwurf 15 ist zu niedrig".
// Vorgabe ist der stufengerechte SG nach Gruppenstufe (Spielleiterhandbuch, SG nach Stufe); im
// Fenster "Werte" lässt er sich je Fläche höher setzen. Jeder Strich merkt sich die Werte, mit
// denen er gemalt wurde; am Raster gilt der zuletzt benutzte Wert je Art in der Szene.
export const SG_NACH_STUFE = Object.freeze([14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36, 38, 39, 40, 42, 44, 46, 48, 50]);
// Je Wahl der Übersetzungsschlüssel der Anzeige.
export const SCHADENSARTEN = Object.freeze({
  fire: "GELAENDEPINSEL.Schadensarten.fire",
  acid: "GELAENDEPINSEL.Schadensarten.acid",
  cold: "GELAENDEPINSEL.Schadensarten.cold",
  electricity: "GELAENDEPINSEL.Schadensarten.electricity",
  bludgeoning: "GELAENDEPINSEL.Schadensarten.bludgeoning",
  piercing: "GELAENDEPINSEL.Schadensarten.piercing",
  slashing: "GELAENDEPINSEL.Schadensarten.slashing",
  poison: "GELAENDEPINSEL.Schadensarten.poison",
  force: "GELAENDEPINSEL.Schadensarten.force",
  sonic: "GELAENDEPINSEL.Schadensarten.sonic",
  spirit: "GELAENDEPINSEL.Schadensarten.spirit",
  void: "GELAENDEPINSEL.Schadensarten.void",
  vitality: "GELAENDEPINSEL.Schadensarten.vitality"
});
export const RETTUNGSWUERFE = Object.freeze({
  reflex: "GELAENDEPINSEL.Rettungswuerfe.reflex",
  fortitude: "GELAENDEPINSEL.Rettungswuerfe.fortitude",
  will: "GELAENDEPINSEL.Rettungswuerfe.will",
  keiner: "GELAENDEPINSEL.Rettungswuerfe.keiner"
});

export function gruppenStufe() {
  const party = globalThis.game?.actors?.party;
  let mitglieder = Array.from(party?.members ?? []);
  if (!mitglieder.length) mitglieder = Array.from(globalThis.game?.actors ?? []).filter((a) => a?.type === "character" && a.hasPlayerOwner);
  const stufen = mitglieder.map((a) => Number(a?.level ?? a?.system?.details?.level?.value)).filter(Number.isFinite);
  return stufen.length ? Math.round(stufen.reduce((summe, wert) => summe + wert, 0) / stufen.length) : 1;
}

export function stufenSg(stufe = gruppenStufe()) {
  return SG_NACH_STUFE[Math.max(0, Math.min(SG_NACH_STUFE.length - 1, Math.round(stufe)))];
}

export function aktuelleWerte() {
  const sg = Number(einstellungSicher("sg", 0));
  return {
    sg: sg > 0 ? sg : stufenSg(),
    schaden: String(einstellungSicher("schaden", "2d6")).trim() || "2d6",
    typ: String(einstellungSicher("schadensart", "fire")),
    rw: String(einstellungSicher("rettungswurf", "reflex"))
  };
}

async function szeneWerteMerken(art, szene) {
  if (!PROBEN_ARTEN.includes(art) || !szene?.setFlag) return;
  const alt = szene.getFlag?.(MODUL, "werte") ?? {};
  await szene.setFlag(MODUL, "werte", { ...alt, [art]: aktuelleWerte() });
}

/** Werte der Fläche an einem Feld: jüngster Strich dieser Art, der es trifft, sonst die Szene. */
export function werteAn(feld, art, szene = globalThis.canvas?.scene) {
  const [spalte, zeile] = String(feld).split(",").map(Number);
  const mitte = { x: spalte + 0.5, y: zeile + 0.5 };
  const striche = stricheDerSzene(szene);
  for (let i = striche.length - 1; i >= 0; i -= 1) {
    const strich = striche[i];
    if (strich?.art !== art || !strich.w) continue;
    const p = strich.p ?? [];
    for (let k = 0; k + 1 < p.length; k += 2) {
      const a = { x: p[k], y: p[k + 1] };
      const b = k + 3 < p.length ? { x: p[k + 2], y: p[k + 3] } : a;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const laenge2 = dx * dx + dy * dy;
      const t = laenge2 ? Math.max(0, Math.min(1, ((mitte.x - a.x) * dx + (mitte.y - a.y) * dy) / laenge2)) : 0;
      if (Math.hypot(mitte.x - a.x - dx * t, mitte.y - a.y - dy * t) <= (Number(strich.r) || 0.5) + 0.5) return { ...aktuelleWerte(), ...strich.w };
    }
  }
  const szenenWerte = szene?.getFlag?.(MODUL, "werte")?.[art];
  return { ...aktuelleWerte(), ...(szenenWerte ?? {}) };
}

export async function werteFenster() {
  const DialogV2 = foundry.applications?.api?.DialogV2;
  if (!DialogV2 || !game.user?.isGM) return null;
  const jetzt = aktuelleWerte();
  const sgEingestellt = Number(einstellungSicher("sg", 0));
  const auswahl = (liste, wert) => Object.entries(liste).map(([schl, text]) => `<option value="${schl}"${schl === wert ? " selected" : ""}>${uebersetzen(text)}</option>`).join("");
  const ergebnis = await DialogV2.prompt({
    window: { title: uebersetzen("GELAENDEPINSEL.Werte.Titel") },
    content: `<p>${uebersetzen("GELAENDEPINSEL.Werte.Gilt")}</p>
      <label>${uebersetzen("GELAENDEPINSEL.Werte.SG")} <input name="sg" type="number" min="0" max="60" value="${sgEingestellt > 0 ? sgEingestellt : ""}" placeholder="${stufenSg()}" style="width:5em"></label>
      <p class="hint">${uebersetzen("GELAENDEPINSEL.Werte.Leer", { stufe: gruppenStufe(), sg: stufenSg() })}</p>
      <label>${uebersetzen("GELAENDEPINSEL.Werte.Schaden")} <input name="schaden" type="text" value="${jetzt.schaden}" style="width:7em"></label>
      <label>${uebersetzen("GELAENDEPINSEL.Werte.Art")} <select name="typ">${auswahl(SCHADENSARTEN, jetzt.typ)}</select></label>
      <label>${uebersetzen("GELAENDEPINSEL.Werte.Rettungswurf")} <select name="rw">${auswahl(RETTUNGSWUERFE, jetzt.rw)}</select></label>`,
    ok: {
      label: uebersetzen("GELAENDEPINSEL.Werte.Uebernehmen"),
      callback: (_event, knopf) => ({
        sg: Number(knopf.form.elements.sg.value) || 0,
        schaden: knopf.form.elements.schaden.value,
        typ: knopf.form.elements.typ.value,
        rw: knopf.form.elements.rw.value
      })
    },
    rejectClose: false
  });
  if (!ergebnis) return null;
  await game.settings.set(MODUL, "sg", Math.max(0, Math.round(ergebnis.sg)));
  await game.settings.set(MODUL, "schaden", String(ergebnis.schaden ?? "").trim() || "2d6");
  await game.settings.set(MODUL, "schadensart", SCHADENSARTEN[ergebnis.typ] ? ergebnis.typ : "fire");
  await game.settings.set(MODUL, "rettungswurf", RETTUNGSWUERFE[ergebnis.rw] ? ergebnis.rw : "reflex");
  return aktuelleWerte();
}

/**
 * Für den reaction_monitor (0.2.7): Steht der Token auf einer schmalen Oberfläche oder auf
 * unebenem Boden, die ihn betreffen, liefert das die Art und den SG der Fläche, sonst null.
 */
export function haltAn(token) {
  if (!token?.actor?.isOfType?.("creature")) return null;
  const felder = felderDerSzene();
  const aktion = token.document?.movementAction ?? "walk";
  const aktionen = globalThis.CONFIG?.Token?.movement?.actions ?? {};
  for (const art of ["schmal", "uneben"]) {
    if (!artenUnterToken(token, felder).includes(art)) continue;
    if (gelaendeWirkung(token.actor, art, aktion, aktionen) <= 0) continue;
    const feld = felderUnterToken(token).find((schl) => felder[art].has(schl));
    if (!feld) continue;
    return { art, sg: werteAn(feld, art).sg };
  }
  return null;
}

function felderUnterToken(token) {
  const groesse = canvas.grid.size;
  const x = Number(token?.x);
  const y = Number(token?.y);
  const breite = Number(token?.w ?? Number(token?.document?.width) * groesse);
  const hoehe = Number(token?.h ?? Number(token?.document?.height) * groesse);
  if (![x, y, breite, hoehe].every(Number.isFinite)) return [];
  const erstes = canvas.grid.getOffset({ x: x + 1, y: y + 1 });
  const letztes = canvas.grid.getOffset({ x: x + breite - 1, y: y + hoehe - 1 });
  const liste = [];
  for (let zeile = erstes.i; zeile <= letztes.i; zeile += 1) {
    for (let spalte = erstes.j; spalte <= letztes.j; spalte += 1) liste.push(schluessel(spalte, zeile));
  }
  return liste;
}

/* ------------------------------------------------------------------ Regionen */

function schwierigkeiten(stufe) {
  const aktionen = Object.keys(globalThis.CONFIG?.Token?.movement?.actions ?? { walk: {} });
  const ergebnis = {};
  // Fliegen ignoriert schwieriges Gelände (Kernregeln: Spieler S. 423).
  for (const aktion of aktionen) ergebnis[aktion] = aktion === "fly" ? 1 : stufe;
  return ergebnis;
}

function formenFuer(felderMenge) {
  const groesse = canvas.grid.size;
  return zuRechtecken([...felderMenge]).map((r) => {
    const ecke = canvas.grid.getTopLeftPoint({ i: r.zeile, j: r.spalte });
    return {
      type: "rectangle",
      x: ecke.x,
      y: ecke.y,
      width: r.breite * groesse,
      height: r.hoehe * groesse,
      hole: false,
      anchorX: 0,
      anchorY: 0,
      rotation: 0,
      gridBased: false
    };
  });
}

// Schwieriges und sehr schwieriges Gelände überlappen als Region nie (0.2.11): Zählt ein Feld für beide,
// etwa am Raster sehr schwierig und frei gemalt schwierig, gilt nur das sehr schwierige - 10 Fuß mehr,
// nicht 15. So hängt es nicht davon ab, wie Foundry übereinanderliegende Regionen verrechnet.
function kostenFelder(felder) {
  const sehr = new Set(felder.sehr ?? []);
  return { schwierig: new Set([...(felder.schwierig ?? [])].filter((feld) => !sehr.has(feld))), sehr };
}

async function regionenAbgleichen(felder, szene) {
  const kosten = kostenFelder(felder);
  for (const art of KOSTEN_ARTEN) {
    const vorhanden = szene.regions?.find?.((region) => region.getFlag?.(MODUL, "art") === art) ?? null;
    const menge = kosten[art];
    if (menge.size === 0) {
      if (vorhanden) await vorhanden.delete({ [MODUL]: true });
      continue;
    }
    const shapes = formenFuer(menge);
    // Namen in der Sprache der Spielleitung, die die Region anlegt; gefunden wird sie über das Flag.
    const name = uebersetzen("GELAENDEPINSEL.Region", { art: uebersetzen(ARTEN[art].name) });
    if (vorhanden) {
      // Umbenannt in PF2e-ActiveTerrain (0.2.28, 24.10.2026): Regionen mit dem alten Namen ziehen beim
      // nächsten Abgleich mit; die Kennung "gelaendepinsel" und damit Flags und Einstellungen bleiben.
      const alt = /^(Geländepinsel|Terrain Brush):/.test(String(vorhanden.name ?? ""));
      await vorhanden.update(alt ? { shapes, name } : { shapes });
      continue;
    }
    const daten = {
      name,
      color: ARTEN[art].farbe,
      shapes,
      visibility: globalThis.CONST?.REGION_VISIBILITY?.LAYER ?? 0,
      behaviors: [{
        name: uebersetzen(ARTEN[art].name),
        type: "modifyMovementCost",
        system: { difficulties: schwierigkeiten(ARTEN[art].schwierigkeit) }
      }],
      flags: { [MODUL]: { art } }
    };
    const ebene = canvas.level?.id;
    if (ebene) daten.levels = [ebene];
    await szene.createEmbeddedDocuments("Region", [daten]);
  }
}

/* ------------------------------------------------------------------ Anzeige (Variante C) */

// PIXI v8 (Foundry 14) zeichnet mit stroke(), ältere Fassungen mit lineStyle().
function linie(grafik, a, b, { color, width, alpha }) {
  if (typeof grafik.stroke === "function") {
    grafik.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color, width, alpha });
    return;
  }
  grafik.lineStyle?.(width, color, alpha);
  grafik.moveTo(a.x, a.y);
  grafik.lineTo(b.x, b.y);
}

// Der laufende Strich als ein durchgehendes Band mit runden Enden und Biegungen (0.2.10, 24.10.2026:
// "so schaut das waehrend dem Zeichnen aus, wie Bretter verlegen"). Bis dahin war jedes Mausstueck ein
// eigenes Rechteck in Pinselbreite: In Biegungen faecherten sie auf wie Eisenbahnschwellen, und wo sie
// sich ueberlappten, wurde es heller. Gerechnet wurde schon immer rund.
function rundeSpur(grafik, pixel, { color, width, alpha }) {
  if (!pixel.length) return;
  if (pixel.length === 1) {
    const { x, y } = pixel[0];
    if (typeof grafik.circle === "function" && typeof grafik.fill === "function") {
      grafik.circle(x, y, width / 2).fill({ color, alpha });
      return;
    }
    grafik.beginFill?.(color, alpha);
    grafik.drawCircle?.(x, y, width / 2);
    grafik.endFill?.();
    return;
  }
  if (typeof grafik.stroke === "function") {
    grafik.moveTo(pixel[0].x, pixel[0].y);
    for (const punkt of pixel.slice(1)) grafik.lineTo(punkt.x, punkt.y);
    grafik.stroke({ color, width, alpha, cap: "round", join: "round" });
    return;
  }
  grafik.lineStyle?.({ width, color, alpha, cap: "round", join: "round" });
  grafik.moveTo(pixel[0].x, pixel[0].y);
  for (const punkt of pixel.slice(1)) grafik.lineTo(punkt.x, punkt.y);
}

function rundeFlaeche(grafik, x, y, breite, hoehe, radius, { color, alpha }) {
  if (typeof grafik.roundRect === "function" && typeof grafik.fill === "function") {
    grafik.roundRect(x, y, breite, hoehe, radius).fill({ color, alpha });
    return;
  }
  grafik.beginFill?.(color, alpha);
  grafik.drawRoundedRect?.(x, y, breite, hoehe, radius);
  grafik.endFill?.();
}

const farbwert = (art) => Number.parseInt(ARTEN[art].farbe.slice(1), 16);

// Deckkraft der Umrandung aus der Einstellung, 10 bis 100 Prozent.
function deckkraft() {
  let prozent = 40;
  try {
    prozent = Number(einstellung("deckkraft"));
  } catch (_error) {
    prozent = 40;
  }
  if (!Number.isFinite(prozent)) prozent = 40;
  return Math.min(1, Math.max(0.1, prozent / 100));
}

// Faktor auf die Strichstärke der Umrandung aus der Einstellung, 50 bis 300 Prozent.
function strichFaktor() {
  const prozent = Number(einstellungSicher("strichstaerke", 100));
  return Number.isFinite(prozent) ? Math.min(3, Math.max(0.5, prozent / 100)) : 1;
}

// Gestrichelte Linie entlang eines Zugs (Pixel), Strichlage laeuft ueber die Ecken weiter.
function gestrichelt(grafik, punkte, stil, strich, luecke) {
  let rest = strich;
  let zeichnen = true;
  for (let i = 1; i < punkte.length; i += 1) {
    const a = punkte[i - 1];
    const b = punkte[i];
    const laenge = Math.hypot(b.x - a.x, b.y - a.y);
    let s = 0;
    while (s < laenge) {
      const e = Math.min(laenge, s + rest);
      if (zeichnen) {
        linie(grafik,
          { x: a.x + (b.x - a.x) * (s / laenge), y: a.y + (b.y - a.y) * (s / laenge) },
          { x: a.x + (b.x - a.x) * (e / laenge), y: a.y + (b.y - a.y) * (e / laenge) },
          stil);
      }
      rest -= e - s;
      s = e;
      if (rest <= 1e-6) {
        zeichnen = !zeichnen;
        rest = zeichnen ? strich : luecke;
      }
    }
  }
}

// Weicher Rand je Art aus frei gemalten Punkten und Rasterfeldern, je Datenstand einmal gerechnet.
const randCache = new WeakMap();
function raenderDerSzene(szene) {
  const liste = stricheDerSzene(szene);
  const rasterRoh = szene?.getFlag?.(MODUL, "felder") ?? null;
  const vorher = randCache.get(liste);
  if (vorher && vorher.raster === rasterRoh) return vorher.raender;
  const { flaechen } = flaechenDerSzene(szene);
  const raender = raenderAus(flaechen, rasterFelderDerSzene(szene));
  randCache.set(liste, { raster: rasterRoh, raender });
  return raender;
}

// Frei gemalte Punkte einer Art samt ihren Rasterfeldern, so wie die Anzeige sie umrandet.
function punkteMitRaster(flaechen, raster, art) {
  const punkte = new Set(flaechen[art]);
  for (const feld of raster[art]) {
    const [spalte, zeile] = feld.split(",").map(Number);
    for (let fy = zeile * FEIN; fy < (zeile + 1) * FEIN; fy += 1) {
      for (let fx = spalte * FEIN; fx < (spalte + 1) * FEIN; fx += 1) punkte.add(fy * 1000000 + fx);
    }
  }
  return punkte;
}

function raenderAus(flaechen, raster) {
  const raender = {};
  for (const art of Object.keys(ARTEN)) {
    const punkte = punkteMitRaster(flaechen, raster, art);
    raender[art] = punkte.size ? weicherRand(punkte) : [];
  }
  return raender;
}

// Mindestgröße ein Feld je Art (0.2.14, 24.10.2026: "wir brauchen für jede Geländeart eine
// Mindestgröße, sonst bleiben Linienartefakte, wenn man welche löscht; ein Grid ist Minimum, alles
// darunter muss sich nach ein paar Sekunden selbst löschen"). Gezählt wird das Stück, wie die Anzeige
// es umrandet, samt angrenzender Rasterfelder; weggeräumt werden nur frei gemalte Punkte.
export const AUFRAEUMEN_MS = 3000;
let aufraeumenUhr = null;

function aufraeumenPlanen() {
  if (!istAktiveSpielleitung()) return;
  clearTimeout(aufraeumenUhr);
  aufraeumenUhr = setTimeout(() => {
    aufraeumenUhr = null;
    resteRaeumen(globalThis.canvas?.scene).catch((fehler) => console.warn(`[${MODUL}] Reste räumen`, fehler));
  }, AUFRAEUMEN_MS);
}

export async function resteRaeumen(szene) {
  if (!szene || !istAktiveSpielleitung()) return 0;
  // Mitten im Malen nicht: später noch einmal.
  if (strich.punkte || strich.felder) {
    aufraeumenPlanen();
    return 0;
  }
  const { flaechen } = flaechenDerSzene(szene);
  const raster = rasterFelderDerSzene(szene);
  const weg = [];
  for (const art of Object.keys(ARTEN)) {
    const k = kleineStuecke(punkteMitRaster(flaechen, raster, art)).filter((punkt) => flaechen[art].has(punkt));
    if (k.length) weg.push({ art: "weg", von: art, k });
  }
  if (!weg.length) return 0;
  await szene.setFlag(MODUL, "striche", [...stricheDerSzene(szene), ...weg]);
  await regionenAbgleichen(felderDerSzene(szene), szene);
  return weg.reduce((summe, eintrag) => summe + eintrag.k.length, 0);
}

// Radierer (0.2.1, 23.10.2026: "wenn man löscht, ist ein vorhandenes Gelände weiß, das ist nicht
// so"): Statt einer weißen Spur zeigt die Anzeige schon beim Ziehen, was nach dem Loslassen bleibt -
// wie strichSpeichern es rechnet: Der Radierer nimmt allen Arten seine Punkte und den Rasterfeldern,
// die er zur Hälfte trifft, das ganze Feld.
export function radiererVorschau(entwurf, szene = globalThis.canvas?.scene) {
  const weg = strichPunkte({ art: "radierer", r: entwurf.r, p: entwurf.punkte.flatMap((punkt) => [punkt.x, punkt.y]) });
  const { flaechen } = flaechenDerSzene(szene);
  const raster = rasterFelderDerSzene(szene);
  const getroffen = zaehlendeFelder(weg);
  const uebrig = {};
  const felder = {};
  for (const art of Object.keys(ARTEN)) {
    uebrig[art] = new Set();
    for (const k of flaechen[art]) if (!weg.has(k)) uebrig[art].add(k);
    for (const feld of getroffen) raster[art].delete(feld);
    felder[art] = new Set([...raster[art], ...zaehlendeFelder(uebrig[art])]);
  }
  return { felder, raender: raenderAus(uebrig, raster) };
}

function kreisLinie(grafik, x, y, radius, { color, width, alpha }) {
  if (typeof grafik.stroke === "function" && typeof grafik.circle === "function") {
    grafik.circle(x, y, radius).stroke({ color, width, alpha });
    return;
  }
  grafik.lineStyle?.(width, color, alpha);
  grafik.drawCircle?.(x, y, radius);
}

export const anzeige = {
  behaelter: null,
  grafik: null,
  entwurf: null,
  entwurfStrich: null,

  sichtbar() {
    return Boolean(game.user?.isGM || einstellung("anzeigen"));
  },

  zeichnen() {
    if (!canvas?.ready || !canvas.interface) return;
    if (!this.behaelter || this.behaelter.destroyed) {
      this.behaelter = new PIXI.Container();
      this.behaelter.eventMode = "none";
      this.grafik = new PIXI.Graphics();
      this.behaelter.addChild(this.grafik);
      canvas.interface.addChild(this.behaelter);
    }
    this.grafik.clear();
    const groesse = canvas.grid.size;
    const ursprung = canvas.grid.getTopLeftPoint({ i: 0, j: 0 });
    const inPixel = (punkt) => ({ x: ursprung.x + punkt.x * groesse, y: ursprung.y + punkt.y * groesse });
    // Laufender freier Strich: halb durchsichtig in voller Pinselbreite. Der Radierer zeigt nur eine
    // dünne Spur und den Pinselkreis; das Gelände darunter verschwindet gleich in der Vorschau.
    let radiert = null;
    if (this.entwurfStrich && game.user?.isGM) {
      const { art, r, punkte } = this.entwurfStrich;
      const pixel = punkte.map(inPixel);
      if (art === "radierer") {
        radiert = radiererVorschau(this.entwurfStrich);
        const stil = { color: 0x9aa4b2, width: Math.max(1.5, groesse * 0.0075), alpha: 0.9 };
        for (let i = 1; i < pixel.length; i += 1) linie(this.grafik, pixel[i - 1], pixel[i], stil);
        const ende = pixel.at(-1);
        kreisLinie(this.grafik, ende.x, ende.y, r * groesse, stil);
      } else {
        rundeSpur(this.grafik, pixel, { color: farbwert(art), width: 2 * r * groesse, alpha: 0.25 });
      }
    }
    if (!this.sichtbar()) return;
    const darstellung = einstellungSicher("darstellung", "weich");
    const felder = radiert?.felder ?? this.entwurf ?? felderDerSzene();
    // Spielleitung: zaehlende Felder blass hinterlegt (abschaltbar).
    if (game.user?.isGM && einstellungSicher("zaehlendeFelder", true)) {
      for (const [art, menge] of Object.entries(felder)) {
        for (const feld of menge) {
          const [spalte, zeile] = feld.split(",").map(Number);
          const ecke = canvas.grid.getTopLeftPoint({ i: zeile, j: spalte });
          rundeFlaeche(this.grafik, ecke.x, ecke.y, groesse, groesse, 0, { color: farbwert(art), alpha: 0.12 });
        }
      }
    }
    if (darstellung === "aus") return;
    // Seit 0.1.1 gestrichelt und duenn, Deckkraft seit 0.1.2 einstellbar, Strichstärke seit 23.10.2026.
    const breite = Math.max(1.5, groesse * 0.0075) * strichFaktor();
    const strich = groesse * 0.2;
    const luecke = groesse * 0.12;
    if (darstellung === "einfach" || this.entwurf) {
      for (const [art, menge] of Object.entries(felder)) {
        if (!menge.size) continue;
        const stil = { color: farbwert(art), width: breite, alpha: deckkraft() };
        for (const kante of aussenkanten([...menge])) {
          const a = canvas.grid.getTopLeftPoint({ i: kante.y1, j: kante.x1 });
          const b = canvas.grid.getTopLeftPoint({ i: kante.y2, j: kante.x2 });
          gestrichelt(this.grafik, [a, b], stil, strich, luecke);
        }
      }
      return;
    }
    const raender = radiert?.raender ?? raenderDerSzene(canvas.scene);
    for (const [art, zuege] of Object.entries(raender)) {
      const stil = { color: farbwert(art), width: breite, alpha: deckkraft() };
      for (const zug of zuege) gestrichelt(this.grafik, zug.map(inPixel), stil, strich, luecke);
    }
  }
};

/* ------------------------------------------------------------------ Abzeichen am Token */

/** Geländearten unter der Fläche eines Tokens, in der Reihenfolge der Abzeichen. */
export function artenUnterToken(token, felder = felderDerSzene()) {
  const groesse = canvas.grid.size;
  const x = Number(token?.x);
  const y = Number(token?.y);
  const breite = Number(token?.w ?? Number(token?.document?.width) * groesse);
  const hoehe = Number(token?.h ?? Number(token?.document?.height) * groesse);
  if (![x, y, breite, hoehe].every(Number.isFinite) || breite <= 0 || hoehe <= 0) return [];
  const erstes = canvas.grid.getOffset({ x: x + 1, y: y + 1 });
  const letztes = canvas.grid.getOffset({ x: x + breite - 1, y: y + hoehe - 1 });
  const gefunden = new Set();
  for (let zeile = erstes.i; zeile <= letztes.i; zeile += 1) {
    for (let spalte = erstes.j; spalte <= letztes.j; spalte += 1) {
      const schl = schluessel(spalte, zeile);
      for (const art of ABZEICHEN_REIHE) if (felder[art]?.has(schl)) gefunden.add(art);
    }
  }
  return ABZEICHEN_REIHE.filter((art) => gefunden.has(art));
}

function vieleck(grafik, punkte, { color, alpha }) {
  if (typeof grafik.poly === "function" && typeof grafik.fill === "function") {
    grafik.poly(punkte).fill({ color, alpha });
    return;
  }
  grafik.beginFill?.(color, alpha);
  grafik.drawPolygon?.(punkte);
  grafik.endFill?.();
}

// Zeichen im Abzeichen (0.2.2): der Stiefel und darunter der Boden der Art, aus symbole.mjs - dieselben
// Maße wie die Bilder im Menü, hier auf die Größe des Abzeichens umgerechnet.
function zeichenMalen(grafik, art, mx, my, g) {
  const zeichen = ZEICHEN[art];
  if (!zeichen) return;
  const color = Number.parseInt(zeichen.farbe.slice(1), 16);
  const x = (wert) => mx - g / 2 + (wert * g) / 100;
  const y = (wert) => my - g / 2 + (wert * g) / 100;
  const umrechnen = (liste) => liste.map((wert, index) => (index % 2 ? y(wert) : x(wert)));
  const stil = { color, width: Math.max(1, ((zeichen.breite ?? STRICH) * g) / 100), alpha: 1 };
  vieleck(grafik, umrechnen(STIEFEL), { color, alpha: 1 });
  for (const [x1, y1, x2, y2] of zeichen.linien ?? []) linie(grafik, { x: x(x1), y: y(y1) }, { x: x(x2), y: y(y2) }, stil);
  for (const punkte of zeichen.dreiecke ?? []) vieleck(grafik, umrechnen(punkte), { color, alpha: 1 });
  for (const punkte of zeichen.zuege ?? []) {
    for (let i = 2; i < punkte.length; i += 2) {
      linie(grafik, { x: x(punkte[i - 2]), y: y(punkte[i - 1]) }, { x: x(punkte[i]), y: y(punkte[i + 1]) }, stil);
    }
  }
}

// Rechts oben neben dem Token ein Abzeichen je Geländeart, auf der er gerade steht (23.10.2026:
// "ich sehe am Token nicht, ob gerade sehr schwieriges Gelände berechnet wird"). Spielleitung
// immer, Spieler wie die Umrandung nur mit eingeschalteter Anzeige, und nur an Tokens, die sie sehen.
// Bilder der Abzeichen (0.2.3, 23.10.2026: "nimm diese Bilder"): je Art 48 mal 48 Pixel, eigens für
// das Modul gemacht. Geladen bei canvasReady; bis dahin oder wenn ein Bild fehlt, zeichnet das
// Abzeichen den Stiefel aus symbole.mjs.
// Lage der Abzeichen am Token (0.2.11, 24.10.2026: "in den Optionen noch einstellbar, wo der
// grafische Stiefel am Token anzuordnen ist"), je Rechner. Seitlich stehen sie untereinander, über und
// unter dem Token nebeneinander. Vorgabe ist rechts oben, wie bisher.
export const ABZEICHEN_LAGEN = Object.freeze({
  rechtsOben: "GELAENDEPINSEL.Einstellung.AbzeichenLage.RechtsOben",
  rechtsUnten: "GELAENDEPINSEL.Einstellung.AbzeichenLage.RechtsUnten",
  linksOben: "GELAENDEPINSEL.Einstellung.AbzeichenLage.LinksOben",
  linksUnten: "GELAENDEPINSEL.Einstellung.AbzeichenLage.LinksUnten",
  oben: "GELAENDEPINSEL.Einstellung.AbzeichenLage.Oben",
  unten: "GELAENDEPINSEL.Einstellung.AbzeichenLage.Unten"
});

/** Linke obere Ecke des Abzeichens Nummer index (ab 0) mit Seitenlänge g. */
export function abzeichenPunkt(lage, token, index, g) {
  const x = Number(token.x);
  const y = Number(token.y);
  const breite = Number(token.w ?? canvas.grid.size);
  const hoehe = Number(token.h ?? canvas.grid.size);
  const schritt = index * g * 1.1;
  switch (lage) {
    case "rechtsUnten": return { x: x + breite + g * 0.1, y: y + hoehe - g - schritt };
    case "linksOben": return { x: x - g * 1.1, y: y + schritt };
    case "linksUnten": return { x: x - g * 1.1, y: y + hoehe - g - schritt };
    case "oben": return { x: x + schritt, y: y - g * 1.1 };
    case "unten": return { x: x + schritt, y: y + hoehe + g * 0.1 };
    default: return { x: x + breite + g * 0.1, y: y + schritt };
  }
}

export const BILDER = Object.freeze(Object.fromEntries(Object.keys(ZEICHEN).map((art) => [art, `modules/${MODUL}/assets/symbole/${art}.png`])));
const texturen = new Map();

export async function bilderLaden() {
  const laden = globalThis.foundry?.canvas?.loadTexture ?? globalThis.loadTexture;
  if (typeof laden !== "function") return;
  for (const [art, pfad] of Object.entries(BILDER)) {
    if (texturen.has(art)) continue;
    try {
      const textur = await laden(pfad);
      if (!textur) continue;
      // Pixelbilder: scharf vergrößern statt verwischen.
      if (textur.source) textur.source.scaleMode = "nearest";
      else if (textur.baseTexture && globalThis.PIXI?.SCALE_MODES) textur.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      texturen.set(art, textur);
    } catch (fehler) {
      console.warn(`[${MODUL}] Bild ${pfad} nicht geladen`, fehler);
    }
  }
  abzeichen.alleZeichnen();
}

export const abzeichen = {
  behaelter: null,
  je: new Map(),
  bilder: new Map(),
  felder: null,

  behaelterHolen() {
    if (!canvas?.ready || !canvas.interface) return null;
    if (!this.behaelter || this.behaelter.destroyed) {
      this.behaelter = new PIXI.Container();
      this.behaelter.eventMode = "none";
      canvas.interface.addChild(this.behaelter);
      this.je.clear();
      this.bilder.clear();
    }
    return this.behaelter;
  },

  entfernen(id) {
    this.bildEntfernen(id);
    const grafik = this.je.get(id);
    if (!grafik) return;
    this.je.delete(id);
    grafik.parent?.removeChild?.(grafik);
    grafik.destroy?.();
  },

  bildEntfernen(id) {
    const bild = this.bilder.get(id);
    if (!bild) return;
    this.bilder.delete(id);
    bild.parent?.removeChild?.(bild);
    bild.destroy?.({ children: true });
  },

  bildHolen(id, behaelter) {
    let bild = this.bilder.get(id);
    if (!bild || bild.destroyed) {
      bild = new PIXI.Container();
      behaelter.addChild(bild);
      this.bilder.set(id, bild);
    }
    for (const kind of [...(bild.children ?? [])]) {
      bild.removeChild(kind);
      kind.destroy?.();
    }
    return bild;
  },

  zeichnen(token) {
    const id = token?.id ?? token?.document?.id;
    if (!id) return;
    if (!this.felder) this.felder = felderDerSzene();
    // Nur an Kreaturen (0.2.7, gemeldet: Stiefel an Schatzkiste und Kartenmarke "C4 a"): keine Kisten,
    // keine Beute, keine Marken ohne Akteur.
    const kreatur = Boolean(token.actor?.isOfType?.("creature"));
    const arten = kreatur && anzeige.sichtbar() && token.visible !== false ? artenUnterToken(token, this.felder) : [];
    if (!arten.length) {
      this.entfernen(id);
      return;
    }
    const behaelter = this.behaelterHolen();
    if (!behaelter) return;
    let grafik = this.je.get(id);
    if (!grafik || grafik.destroyed) {
      grafik = new PIXI.Graphics();
      behaelter.addChild(grafik);
      this.je.set(id, grafik);
    }
    grafik.clear();
    const g = canvas.grid.size * 0.24;
    const lage = einstellungSicher("abzeichenLage", "rechtsOben");
    const mitBildern = typeof PIXI.Sprite === "function" && arten.every((art) => texturen.has(art));
    const bild = mitBildern ? this.bildHolen(id, behaelter) : null;
    if (!bild) this.bildEntfernen(id);
    arten.forEach((art, index) => {
      const { x: links, y } = abzeichenPunkt(lage, token, index, g);
      const wirkung = gelaendeWirkung(token.actor, art, token.document?.movementAction ?? "walk", globalThis.CONFIG?.Token?.movement?.actions ?? {});
      if (bild) {
        const sprite = new PIXI.Sprite(texturen.get(art));
        sprite.x = links;
        sprite.y = y;
        sprite.width = g;
        sprite.height = g;
        sprite.alpha = wirkung > 0 ? 1 : 0.35;
        bild.addChild(sprite);
        return;
      }
      rundeFlaeche(grafik, links, y, g, g, g * 0.2, { color: farbwert(art), alpha: wirkung > 0 ? 0.95 : 0.35 });
      zeichenMalen(grafik, art, links + g / 2, y + g / 2, g);
    });
  },

  alleZeichnen() {
    this.felder = felderDerSzene();
    for (const token of globalThis.canvas?.tokens?.placeables ?? []) this.zeichnen(token);
  }
};

/* ------------------------------------------------------------------ Pinsel-Ebene */

function feldUnterMaus() {
  const punkt = canvas.mousePosition;
  if (!punkt) return null;
  const offset = canvas.grid.getOffset({ x: punkt.x, y: punkt.y });
  return { spalte: offset.j, zeile: offset.i };
}

// Mausposition in Feldeinheiten fuer das freie Malen.
function mausInFeldern() {
  const punkt = canvas.mousePosition;
  if (!punkt) return null;
  const ursprung = canvas.grid.getTopLeftPoint({ i: 0, j: 0 });
  return { x: (punkt.x - ursprung.x) / canvas.grid.size, y: (punkt.y - ursprung.y) / canvas.grid.size };
}

const rasterModus = () => Boolean(einstellungSicher("rasterModus", false));
// art: womit dieser Strich malt; der Rechtsklick radiert, ohne die gewählte Art zu ändern (0.2.4).
const strich = { felder: null, letztes: null, punkte: null, art: null };

function stempeln(feld) {
  const art = strich.art ?? einstellung("art");
  const groesse = Math.max(1, Math.round(Number(einstellung("groesse")) || 1));
  for (const schl of pinselFelder(feld.spalte, feld.zeile, groesse)) {
    if (art === "radierer") {
      for (const menge of Object.values(strich.felder)) menge.delete(schl);
    } else if (ARTEN[art]) {
      // Ein Feld hat je Gruppe eine Geländeart (0.2.11): neu Gemaltes ersetzt die seiner Gruppe,
      // gefährliches Gelände etwa bleibt über schwierigem liegen.
      for (const [andere, menge] of Object.entries(strich.felder)) if (andere !== art && ersetzt(art, andere)) menge.delete(schl);
      strich.felder[art].add(schl);
    }
  }
}

function strichBeginnen(art = einstellung("art")) {
  strich.art = art;
  if (!rasterModus()) {
    // Frei malen (0.2.0): runder Pinsel, die Punkte sammeln sich bis zum Loslassen.
    const punkt = mausInFeldern();
    if (!punkt) return false;
    strich.punkte = [punkt];
    anzeige.entwurfStrich = { art, r: (Number(einstellung("groesse")) || 1) / 2, punkte: strich.punkte };
    anzeige.zeichnen();
    return true;
  }
  const feld = feldUnterMaus();
  if (!feld) return false;
  strich.felder = rasterFelderDerSzene();
  strich.letztes = feld;
  stempeln(feld);
  anzeige.entwurf = strich.felder;
  anzeige.zeichnen();
  return true;
}

function strichFortsetzen() {
  if (strich.punkte) {
    const punkt = mausInFeldern();
    const letzter = strich.punkte.at(-1);
    if (!punkt || Math.hypot(punkt.x - letzter.x, punkt.y - letzter.y) < 0.1) return;
    strich.punkte.push(punkt);
    anzeige.zeichnen();
    return;
  }
  if (!strich.felder) return;
  const feld = feldUnterMaus();
  if (!feld || (feld.spalte === strich.letztes.spalte && feld.zeile === strich.letztes.zeile)) return;
  // Durchgehende Spur: auch bei schneller Maus kein Feld auslassen.
  for (const zwischen of spurFelder(strich.letztes, feld)) stempeln(zwischen);
  strich.letztes = feld;
  anzeige.zeichnen();
}

async function strichBeenden() {
  if (strich.punkte) {
    const punkte = strich.punkte;
    const art = strich.art ?? einstellung("art");
    const r = (Number(einstellung("groesse")) || 1) / 2;
    strich.punkte = null;
    strich.art = null;
    try {
      if (ARTEN[art] || art === "radierer") {
        const p = vereinfachen(punkte, 1 / (2 * FEIN)).flatMap((punkt) => [Math.round(punkt.x * 1000) / 1000, Math.round(punkt.y * 1000) / 1000]);
        await strichSpeichern({ art, r, p });
      }
    } catch (fehler) {
      console.error(`[${MODUL}] Speichern`, fehler);
      globalThis.ui?.notifications?.error?.(uebersetzen("GELAENDEPINSEL.Fehler.Speichern"));
    } finally {
      anzeige.entwurfStrich = null;
      anzeige.zeichnen();
    }
    return;
  }
  if (!strich.felder) return;
  const felder = strich.felder;
  const art = strich.art ?? einstellung("art");
  strich.felder = null;
  strich.letztes = null;
  strich.art = null;
  try {
    await felderSpeichern(felder, canvas?.scene, art);
  } catch (fehler) {
    console.error(`[${MODUL}] Speichern`, fehler);
    globalThis.ui?.notifications?.error?.(uebersetzen("GELAENDEPINSEL.Fehler.Speichern"));
  } finally {
    anzeige.entwurf = null;
    anzeige.zeichnen();
  }
}

export function ebeneKlasse() {
  if (typeof InteractionLayer !== "function") return null;
  return class GelaendepinselLayer extends InteractionLayer {
    static get layerOptions() {
      return foundry.utils.mergeObject(super.layerOptions, { name: MODUL, zIndex: 180 });
    }

    _canDragLeftStart(user) {
      return Boolean(user?.isGM);
    }

    _onClickLeft() {
      if (!game.user?.isGM) return;
      if (strichBeginnen()) void strichBeenden();
    }

    // Rechtsklick radiert an der Stelle, in der eingestellten Pinselgröße (0.2.4, 23.10.2026:
    // "mache beim Zeichenwerkzeug zusätzlich Rechtsklick als Löschen"). Rechts ziehen bleibt
    // Foundrys Verschieben der Karte.
    _onClickRight() {
      if (!game.user?.isGM) return;
      if (strichBeginnen("radierer")) void strichBeenden();
    }

    _onDragLeftStart() {
      if (!game.user?.isGM) return;
      strichBeginnen();
    }

    _onDragLeftMove() {
      if (!game.user?.isGM) return;
      strichFortsetzen();
    }

    _onDragLeftDrop() {
      if (!game.user?.isGM) return;
      void strichBeenden();
    }

    _onDragLeftCancel() {
      if (!game.user?.isGM) return;
      void strichBeenden();
    }
  };
}

/* ------------------------------------------------------------------ Leiste */

// Kurzerklärung beim Überfahren der Knöpfe (0.2.6, 23.10.2026: "beim Hover eine Kurzerklärung
// ausgeben"). Die ausführlichen Regeln stehen im Regelglossar des reaction_monitor unter Kampf,
// Gelände (Kernregeln: Spieler, S. 423 und S. 233). Hier nur die Schlüssel, die Texte in lang/.
export const KURZ = Object.freeze({
  schwierig: "GELAENDEPINSEL.Kurz.schwierig",
  sehr: "GELAENDEPINSEL.Kurz.sehr",
  gefahr: "GELAENDEPINSEL.Kurz.gefahr",
  schmal: "GELAENDEPINSEL.Kurz.schmal",
  uneben: "GELAENDEPINSEL.Kurz.uneben",
  radierer: "GELAENDEPINSEL.Kurz.radierer"
});

const werkzeugTitel = (name, kurz) => uebersetzen("GELAENDEPINSEL.Leiste.Werkzeug", { name: uebersetzen(name), kurz: uebersetzen(kurz) });

function groesseName(g) {
  return g === 0.5 ? "groesse05" : `groesse${g}`;
}

// Pinselgröße wie ein Wahlschalter (0.2.5, 23.10.2026: "ich kann gleichzeitig alle drei Größen
// einschalten, es soll aber immer nur einer gehen, ein Grid ist Standard"). Foundry kennt dafür nur
// Einzelschalter; beim Klick schaltet das Modul die übrigen Größen aus, ein Klick auf die aktive
// lässt sie an. Vorgabe bleibt ein Feld.
export function groesseWaehlen(g) {
  const tools = globalThis.ui?.controls?.controls?.[MODUL]?.tools ?? {};
  for (const [name, tool] of Object.entries(tools)) {
    if (name.startsWith("groesse") && tool) tool.active = name === groesseName(g);
  }
  return game.settings.set(MODUL, "groesse", g).then(() => globalThis.ui?.controls?.render?.());
}

function gruppeSpielleitung() {
  const tools = {};
  let nummer = 0;
  for (const [art, info] of Object.entries(ARTEN)) {
    tools[art] = {
      name: art,
      order: nummer += 1,
      title: werkzeugTitel(info.name, KURZ[art]),
      icon: SYMBOLE[art] ?? "fa-solid fa-paintbrush",
      onChange: () => game.settings.set(MODUL, "art", art)
    };
  }
  tools.radierer = {
    name: "radierer",
    order: nummer += 1,
    title: werkzeugTitel("GELAENDEPINSEL.Leiste.Radierer", KURZ.radierer),
    icon: "fa-solid fa-eraser",
    onChange: () => game.settings.set(MODUL, "art", "radierer")
  };
  tools.werte = {
    name: "werte",
    order: nummer += 1,
    title: uebersetzen("GELAENDEPINSEL.Leiste.Werte"),
    icon: "fa-solid fa-sliders",
    button: true,
    onChange: () => void werteFenster()
  };
  for (const g of [0.5, 1, 2, 3]) {
    const name = groesseName(g);
    tools[name] = {
      name,
      order: nummer += 1,
      title: g === 0.5 ? uebersetzen("GELAENDEPINSEL.Leiste.PinselHalb")
        : g === 1 ? uebersetzen("GELAENDEPINSEL.Leiste.PinselEin") : uebersetzen("GELAENDEPINSEL.Leiste.PinselFelder", { anzahl: g }),
      icon: g === 0.5 ? "fa-solid fa-circle-dot" : g === 1 ? "fa-solid fa-square" : g === 2 ? "fa-solid fa-table-cells-large" : "fa-solid fa-table-cells",
      toggle: true,
      active: Number(einstellung("groesse")) === g,
      onChange: () => groesseWaehlen(g)
    };
  }
  const art = einstellung("art");
  return {
    name: MODUL,
    title: uebersetzen("GELAENDEPINSEL.Titel"),
    icon: "fa-solid fa-mountain-sun",
    layer: MODUL,
    visible: true,
    activeTool: ARTEN[art] || art === "radierer" ? art : "schwierig",
    // Wie bei Sequencer: Die Gruppe holt ihre Ebene selbst nach vorn.
    onChange: (_event, aktiv) => {
      if (aktiv) canvas?.[MODUL]?.activate?.();
    },
    tools
  };
}

// Für Spieler ist der Platz in der Leiste ein Schalter: Klick zeigt oder verbirgt das Gelände und
// springt zurück zu den Token-Werkzeugen, sonst stünde eine leere Werkzeugreihe da und man könnte
// keine Tokens ziehen. Muster aus pf2e-de-patch-ju (zurueckZu).
function gruppeSpieler() {
  const an = Boolean(einstellung("anzeigen"));
  return {
    name: MODUL,
    title: uebersetzen(an ? "GELAENDEPINSEL.Leiste.Ausblenden" : "GELAENDEPINSEL.Leiste.Anzeigen"),
    icon: an ? "fa-solid fa-mountain-sun" : "fa-solid fa-mountain",
    visible: true,
    tools: {},
    activeTool: null,
    onChange: (_event, aktiv) => {
      if (!aktiv) return;
      void game.settings.set(MODUL, "anzeigen", !an).finally(() => zurueckZuTokens());
    }
  };
}

function zurueckZuTokens() {
  queueMicrotask(() => {
    if (globalThis.ui?.controls?.control?.name !== MODUL) return;
    Promise.resolve(globalThis.ui.controls.activate({ control: "tokens" })).catch(() => {});
  });
}

/**
 * Direkt unter Sequencer einsortieren. Sequencer 4.3 gibt seiner Gruppe keine Reihenfolge; dann
 * bekommt die eigene dieselbe (keine) und steht im Objekt direkt dahinter. Hat Sequencer eine, liegt
 * die eigene einen halben Schritt danach. Ohne Sequencer ans Ende.
 */
export function gruppeEinsortieren(controls, gruppe) {
  if (!controls || typeof controls !== "object" || Array.isArray(controls)) return;
  delete controls[MODUL];
  const sequencer = controls.sequencer;
  if (!sequencer) {
    const ordnungen = Object.values(controls).map((eintrag) => Number(eintrag?.order)).filter(Number.isFinite);
    controls[MODUL] = { ...gruppe, order: (ordnungen.length ? Math.max(...ordnungen) : 0) + 1 };
    return;
  }
  const eigene = { ...gruppe };
  if (Number.isFinite(Number(sequencer.order))) eigene.order = Number(sequencer.order) + 0.5;
  const schluesselListe = Object.keys(controls);
  const danach = schluesselListe.slice(schluesselListe.indexOf("sequencer") + 1);
  const verschoben = danach.map((name) => [name, controls[name]]);
  for (const name of danach) delete controls[name];
  controls[MODUL] = eigene;
  for (const [name, eintrag] of verschoben) controls[name] = eintrag;
}

function gruppeEinfuegen(controls) {
  gruppeEinsortieren(controls, game.user?.isGM ? gruppeSpielleitung() : gruppeSpieler());
}

/* ------------------------------------------------------------------ Betreten */

function istAktiveSpielleitung() {
  if (!game.user?.isGM) return false;
  const aktive = game.users?.activeGM;
  return aktive ? aktive.id === game.user.id : true;
}

const groesseIn = (wert) => Math.max(1, Math.round(Number(wert) || 1));

// Wohin ein Zug geht (0.2.16): Foundry 14 führt beim Fahren auch die Lage im Dokument mit (gemessen
// 24.10.2026: dokument.x folgt Bild für Bild der gezeichneten Lage, beim Speichern steht dort noch der
// Anfang). Das Ziel steht im letzten Wegpunkt des Zugs, sonst in den Änderungen.
function zugZiel(dokument, optionen, aenderung = {}) {
  const letzter = optionen?._movement?.[dokument.id]?.passed?.waypoints?.at?.(-1);
  const wert = (achse) => [letzter?.[achse], aenderung?.[achse], dokument[achse]].map(Number).find(Number.isFinite);
  return { x: wert("x"), y: wert("y") };
}

// Die Felder, die ein Token mit linker oberer Ecke (x, y) mindestens zur Hälfte bedeckt (0.2.16,
// 24.10.2026: "erst wenn er mindestens 50 % in einem Feld steht, soll das auslösen").
// Dazu die Felder, die er überhaupt berührt (alle), für das Verlassen (0.2.26).
function bedeckung(x, y, breite, hoehe) {
  const g = canvas.grid.size;
  const rechts = x + breite * g;
  const unten = y + hoehe * g;
  const erstes = canvas.grid.getOffset({ x: x + 1, y: y + 1 });
  const letztes = canvas.grid.getOffset({ x: rechts - 1, y: unten - 1 });
  const alle = [];
  const halb = [];
  for (let i = erstes.i; i <= letztes.i; i += 1) {
    for (let j = erstes.j; j <= letztes.j; j += 1) {
      const ecke = canvas.grid.getTopLeftPoint({ i, j });
      const b = Math.min(rechts, ecke.x + g) - Math.max(x, ecke.x);
      const h = Math.min(unten, ecke.y + g) - Math.max(y, ecke.y);
      if (!(b > 0 && h > 0) || b * h < 1e-6) continue;
      alle.push(schluessel(j, i));
      if (2 * b * h >= g * g - 1e-6) halb.push(schluessel(j, i));
    }
  }
  return { alle, halb };
}

// Betreten mit Hysterese (0.2.26, 24.10.2026: "die Figur hat in dem Feld ein weiteres Mal gestoppt").
// Haltmessung 17:09: Start auf 40,70, Halt auf 41,70, beides dieselbe gefährliche Fläche. Schräg über die
// Ecke deckt der Token zwischen zwei Feldern keines zur Hälfte; das galt bis 0.2.25 als Verlassen. Jetzt:
// hinein ab der Hälfte eines Feldes, hinaus erst, wenn er die Fläche gar nicht mehr berührt.
function betretenSchritt(menge, schritt, drin) {
  if (!drin) {
    const feld = schritt.halb.find((schl) => menge.has(schl)) ?? null;
    return { drin: Boolean(feld), feld };
  }
  return { drin: schritt.alle.some((schl) => menge.has(schl)), feld: null };
}

// Lagen von a nach b in Schritten von höchstens einem Achtelfeld, a ausgenommen, b eingeschlossen.
function zwischenLagen(a, b) {
  const von = { x: Number(a.x), y: Number(a.y) };
  const nach = { x: Number(b.x), y: Number(b.y) };
  const schritte = Math.max(1, Math.ceil(Math.hypot(nach.x - von.x, nach.y - von.y) / (canvas.grid.size / 8)));
  const lagen = [];
  for (let k = 1; k <= schritte; k += 1) lagen.push({ x: von.x + ((nach.x - von.x) * k) / schritte, y: von.y + ((nach.y - von.y) * k) / schritte });
  return lagen;
}

/**
 * Die Felder, die ein Token auf seinem Weg nacheinander mindestens zur Hälfte bedeckt, je Achtelfeld
 * eine Liste, die Startlage zuerst. Grundlage sind Foundrys Wegpunkte des Zugs
 * (options._movement[id].passed.waypoints, Foundry 13 und 14), sonst Anfang und Ziel. Große Tokens
 * zählen mit ihrer ganzen Fläche. Per Teleport nur die Startlage: Er betritt nichts dazwischen.
 */
function wegFlaechen(dokument, alt, optionen = {}, ziel = zugZiel(dokument, optionen)) {
  const breite = groesseIn(dokument.width);
  const hoehe = groesseIn(dokument.height);
  const wegpunkte = optionen?._movement?.[dokument.id]?.passed?.waypoints;
  const aktionen = globalThis.CONFIG?.Token?.movement?.actions ?? {};
  const lagen = [alt, ...(Array.isArray(wegpunkte) && wegpunkte.length ? wegpunkte : [ziel])]
    .filter((punkt) => Number.isFinite(Number(punkt?.x)) && Number.isFinite(Number(punkt?.y)));
  if (!lagen.length) return [];
  const flaeche = (lage) => bedeckung(Number(lage.x), Number(lage.y), breite, hoehe);
  const weg = [flaeche(lagen[0])];
  if (Array.isArray(wegpunkte) && wegpunkte.length > 0 && wegpunkte.every((punkt) => aktionen[punkt?.action]?.teleport)) return weg;
  for (let index = 1; index < lagen.length; index += 1) {
    for (const lage of zwischenLagen(lagen[index - 1], lagen[index])) weg.push(flaeche(lage));
  }
  return weg;
}

/**
 * Je Art das Feld, mit dem der Token eine Fläche dieser Art von außen betritt (0.2.12, 24.10.2026:
 * "sonst müsste ich jeden Schritt neu würfeln, das ist viel zu viel; ich will bei Bewegung durch so
 * ein Gebiet nur eine Probe, jede weitere fordert die Spielleitung anders an, keinesfalls
 * automatisch"). Wer schon darin steht und sich darin bewegt, betritt nichts, auch über mehrere Züge
 * und Runden. Wer die Fläche verlässt und wieder hineingeht, betritt sie neu.
 */
export function betreteneArten(dokument, alt, optionen = {}, felder = felderDerSzene(dokument?.parent), arten = PROBEN_ARTEN, ziel = zugZiel(dokument, optionen)) {
  const weg = wegFlaechen(dokument, alt, optionen, ziel);
  const getroffen = new Map();
  for (const art of arten) {
    const menge = felder[art];
    if (!menge?.size || !weg.length) continue;
    let drin = weg[0].alle.some((feld) => menge.has(feld));
    for (const schritt of weg.slice(1)) {
      const neu = betretenSchritt(menge, schritt, drin);
      if (neu.feld) {
        getroffen.set(art, neu.feld);
        break;
      }
      drin = neu.drin;
    }
  }
  return getroffen;
}

// Wann die Karte kommt (0.2.13, 24.10.2026: "kommt die Karte, wenn die Reise beginnt oder wenn der
// Token sichtbar das gefährliche Gelände erreicht? Ich glaube, sie kommt zu Beginn des Zuges"): Foundry
// speichert einen Zug beim Loslassen, gefahren wird danach; bis 0.2.12 kam die Karte deshalb beim
// Losfahren. Jetzt merkt sich die aktive Spielleitung den Zug als Fahrt und prüft am gezeichneten Token,
// Bild für Bild (refreshToken): Die Karte kommt, wenn er zur Hälfte auf der Fläche steht. Wird er vorher
// angehalten, kommt keine. Was zwischen zwei Bildern durchgerutscht ist, kommt spätestens am Ziel.
// Gemessen wird am echten Token (0.2.14, gemeldet: "es kommt nun gar keine Karte mehr"): Beim Ziehen zeichnet
// Foundry eine Vorschau mit derselben ID; 0.2.13 hielt deren Lage am Ziel für die des Tokens.
const fahrten = new Map();
// Je Token, der gerade sichtbar fährt, sein Ziel. Ein neuer Zug davor ist ein Anhalten oder Umlenken.
const unterwegs = new Map();

const gleicheLage = (a, b) => Boolean(a && b) && Math.abs(Number(a.x) - Number(b.x)) <= 1 && Math.abs(Number(a.y) - Number(b.y)) <= 1;

function istVorschau(token, id) {
  if (token?.isPreview || token?._original) return true;
  const echt = globalThis.canvas?.tokens?.get?.(id);
  return Boolean(echt && echt !== token);
}

function gezeichneteLage(dokument) {
  const token = globalThis.canvas?.tokens?.get?.(dokument.id) ?? dokument.object ?? null;
  const lage = { x: Number(token?.x), y: Number(token?.y) };
  return token && Number.isFinite(lage.x) && Number.isFinite(lage.y) ? lage : null;
}

// Messung (0.2.15, 24.10.2026: "die Meldung kommt wieder gleich zu Beginn der Reise"): Wo Foundry 14
// den Token während einer Fahrt führt, ist nicht belegt; 0.2.13 und 0.2.14 haben es angenommen. Je Zug
// durch eine Fläche hält die aktive Spielleitung fest, was beim Speichern und in jedem Bild zu sehen
// war und wann die Karte kam, und legt es unter modules/gelaendepinsel/storage/diagnostics ab, fünf
// Dateien im Wechsel. Die Bilder kurz vor dem Speichern zeigen, ob Foundry schon vorher gezeichnet hat.
// Seit 0.2.17 aus (24.10.2026: "Messung abschalten"), die Einstellung "messung" schaltet sie wieder an.
const messungAn = () => Boolean(einstellungSicher("messung", false));
const DIAGNOSE_DATEIEN = 5;
const DIAGNOSE_BILDER = 400;
const DIAGNOSE_MS = 30000;
const vorBildern = new Map();
const diagnosen = new Map();
let diagnoseNummer = 0;

function tokenBild(token) {
  const zahl = (wert) => (Number.isFinite(Number(wert)) ? Math.round(Number(wert) * 10) / 10 : null);
  return {
    x: zahl(token?.x),
    y: zahl(token?.y),
    vorschau: Boolean(token?.isPreview || token?._original),
    dokX: zahl(token?.document?.x),
    dokY: zahl(token?.document?.y),
    meshX: zahl(token?.mesh?.x),
    meshY: zahl(token?.mesh?.y),
    animationen: token?.animationContexts?.size ?? null
  };
}

function diagnoseBild(id, token) {
  if (!messungAn() || !istAktiveSpielleitung()) return;
  const jetzt = globalThis.performance?.now?.() ?? Date.now();
  const laufend = diagnosen.get(id);
  if (laufend) {
    if (laufend.bilder.length < DIAGNOSE_BILDER) laufend.bilder.push({ t: Math.round(jetzt - laufend.t0), ...tokenBild(token) });
    return;
  }
  const liste = vorBildern.get(id) ?? [];
  liste.push({ zeit: jetzt, ...tokenBild(token) });
  if (liste.length > 5) liste.shift();
  vorBildern.set(id, liste);
}

function diagnoseBeginnen(dokument, kopf) {
  if (!messungAn()) return;
  const id = dokument.id;
  if (diagnosen.has(id)) diagnoseBeenden(id, "neuer-zug");
  const t0 = globalThis.performance?.now?.() ?? Date.now();
  const echt = globalThis.canvas?.tokens?.get?.(id) ?? dokument.object ?? null;
  const vorher = (vorBildern.get(id) ?? []).map(({ zeit, ...rest }) => ({ t: Math.round(zeit - t0), ...rest }));
  const eintrag = { t0, kopf: { token: dokument.name ?? id, ...kopf, beimSpeichern: tokenBild(echt), vorher }, bilder: [], karten: [], uhr: null };
  diagnosen.set(id, eintrag);
  eintrag.uhr = setTimeout(() => diagnoseBeenden(id, "zeit"), DIAGNOSE_MS);
  eintrag.uhr?.unref?.();
}

function diagnoseKarte(id, art, feld, grund) {
  const eintrag = diagnosen.get(id);
  if (!eintrag) return;
  const jetzt = globalThis.performance?.now?.() ?? Date.now();
  eintrag.karten.push({ t: Math.round(jetzt - eintrag.t0), art, feld, grund, bildNr: eintrag.bilder.length });
}

function diagnoseBeenden(id, grund) {
  const eintrag = diagnosen.get(id);
  if (!eintrag) return;
  diagnosen.delete(id);
  clearTimeout(eintrag.uhr);
  const { kopf, bilder, karten } = eintrag;
  console.info(`[${MODUL}] Messung ${kopf.token}: ${karten.length} Karte(n), ${bilder.length} Bilder, Ende ${grund}`);
  void diagnoseSchreiben({ ende: grund, kopf, karten, bilder });
}

async function diagnoseSchreiben(inhalt) {
  const Auswahl = globalThis.foundry?.applications?.apps?.FilePicker ?? globalThis.FilePicker;
  if (!game.user?.isGM || typeof Auswahl?.uploadPersistent !== "function" || typeof File !== "function") return;
  diagnoseNummer += 1;
  const name = `gelaendepinsel-diagnose-${String(((diagnoseNummer - 1) % DIAGNOSE_DATEIEN) + 1).padStart(2, "0")}.json`;
  const text = JSON.stringify({ modul: MODUL, version: VERSION, foundry: game.version ?? null, geschrieben: new Date().toISOString(), ...inhalt }, null, 1);
  try {
    await Auswahl.uploadPersistent(MODUL, "diagnostics", new File([text], name, { type: "application/json" }), {}, { notify: false });
  } catch (fehler) {
    console.warn(`[${MODUL}] Messung nicht gespeichert`, fehler);
  }
}

function fahrtBeginnen(dokument, alt, optionen, ziel = zugZiel(dokument, optionen)) {
  const id = dokument.id;
  const gezeichnet = gezeichneteLage(dokument);
  const laufend = unterwegs.has(id);
  // Eine laufende Fahrt endet hier: Was sie bis zur gezeichneten Lage erreicht hat, zählt noch.
  if (gezeichnet) fahrtPruefen(id, gezeichnet);
  fahrten.delete(id);
  unterwegs.delete(id);
  // Losgefahren wird, wo der Token gezeichnet ist. Steht er dort schon am Ziel, war es während einer
  // Fahrt ein Anhalten, sonst ein Sprung ohne Fahrt: Dann gilt die alte Lage, und die Karte kommt gleich.
  let start = gezeichnet && !gleicheLage(gezeichnet, ziel) ? gezeichnet : null;
  if (!start && laufend) return;
  const sofort = !start || optionen?.animate === false;
  start ??= alt;
  if (!start || gleicheLage(start, ziel)) return;
  // Absuchen (0.3.5): Der Weg eines suchenden Helden kostet Spielzeit, 45 m pro Minute.
  suchen.wegKostet(dokument, start, optionen, ziel);
  if (!sofort) unterwegs.set(id, ziel);
  // Versteckte Fallen zählen wie Flächen (0.3.0, Gefahren-Karte): Wer ihr Feld erreicht, hält dort, die
  // Falle wird aufgedeckt und löst aus. Nur Kreaturen, keine Gefahr löst eine andere aus.
  const fallen = dokument.actor?.isOfType?.("creature") ? gefahren.versteckteFallen(dokument.parent) : new Map();
  // Erkundung "Suchen" entlang des Wegs (0.3.3): Die Suchzonen um versteckte Fallen zählen wie Flächen,
  // vor den Fallen, damit ein Fund im selben Schritt vorgeht.
  const zonen = gefahren.suchZonen(dokument);
  const felder = { ...felderDerSzene(dokument.parent), ...Object.fromEntries(zonen), ...Object.fromEntries(fallen) };
  const wegpunkte = optionen?._movement?.[id]?.passed?.waypoints;
  const aktion = (Array.isArray(wegpunkte) ? wegpunkte.at(-1)?.action : null) ?? dokument.movementAction ?? "walk";
  const aktionen = globalThis.CONFIG?.Token?.movement?.actions ?? {};
  // Je Art das Feld, mit dem die Fläche betreten wird; es liefert SG und Schaden (0.2.7).
  const erwartet = new Map();
  for (const [art, feld] of betreteneArten(dokument, start, optionen, felder, [...PROBEN_ARTEN, ...zonen.keys(), ...fallen.keys()], ziel)) {
    // Fliegend oder per Teleport kein Balancieren und keine Gefahr am Boden (wie PF2e); eine Falle wie
    // gefährliches Gelände. Suchen geht auch fliegend, nur nicht per Teleport.
    const wirkung = art.startsWith("suche:") ? (aktionen[aktion]?.teleport ? 0 : 1)
      : gelaendeWirkung(dokument.actor, art.startsWith("falle:") ? "gefahr" : art, aktion, aktionen);
    if (wirkung > 0) erwartet.set(art, feld);
  }
  const breite = groesseIn(dokument.width);
  const hoehe = groesseIn(dokument.height);
  const anfang = bedeckung(Number(start.x), Number(start.y), breite, hoehe).alle;
  // Steht der Held schon in einer Suchzone, gilt sein Wurf gleich am Anfang.
  const schonDrin = [...zonen].filter(([art, menge]) => !erwartet.has(art) && anfang.some((feld) => menge.has(feld)));
  for (const art of erwartet.keys()) if (art.startsWith("suche:")) gefahren.sucheVorbereiten(dokument, art.slice(6));
  if (!erwartet.size) {
    for (const [art] of schonDrin) void gefahren.sucheErreicht(dokument, art.slice(6));
    return;
  }
  const bewegung = optionen?._movement?.[id] ?? null;
  diagnoseBeginnen(dokument, {
    alt, ziel, gezeichnet, start, laufend, sofort,
    erwartet: Object.fromEntries(erwartet),
    animate: optionen?.animate ?? null,
    animation: optionen?.animation ?? bewegung?.animation ?? null,
    methode: bewegung?.method ?? null,
    wegpunkte: Array.isArray(wegpunkte) ? wegpunkte.length : null,
    modulzug: Boolean(optionen?.aiBewegungsanzeigeModuleMove)
  });
  const drin = new Map([...erwartet.keys()].map((art) => [art, anfang.some((feld) => felder[art].has(feld))]));
  const fahrt = { dokument, ziel, letzte: { x: Number(start.x), y: Number(start.y) }, breite, hoehe, felder, erwartet, drin, suche: new Map(), haltFalle: null };
  fahrten.set(id, fahrt);
  for (const [art, menge] of schonDrin) {
    const feld = anfang.find((schl) => menge.has(schl));
    if (sucheAmRand(id, fahrt, art.slice(6), feld, sofort ? null : start) && !sofort) {
      fahrten.delete(id);
      ueberallAnhalten(dokument, haltLage(feld, start, breite, hoehe), feld);
      return;
    }
  }
  // Ohne Fahrt gesetzt: Es kommt kein Bild dazwischen, die Karte gleich.
  if (sofort) fahrtPruefen(id, ziel, "sofort");
}

// Erkundung "Suchen" am Rand der Suchzone (0.3.3): Findet der Held die Falle, hält er hier, vor ihr, und sie
// löst nicht aus. Läuft der Wurf noch, entscheidet er nachträglich; bis dahin wartet die Falle auf ihn. Ohne
// Lage (Zug ohne Fahrt, Ziel erreicht) hält er nicht, die Falle bleibt trotzdem still.
function sucheAmRand(id, fahrt, gefahrId, feld, lage) {
  const gefunden = gefahren.sucheErreicht(fahrt.dokument, gefahrId);
  if (gefunden === true) {
    fahrt.erwartet.delete(`falle:${gefahrId}`);
    return true;
  }
  if (typeof gefunden?.then !== "function") return false;
  fahrt.suche.set(gefahrId, gefunden);
  void gefunden.then((ja) => {
    fahrt.suche.delete(gefahrId);
    if (!ja) return;
    fahrt.erwartet.delete(`falle:${gefahrId}`);
    // Weiter halten, solange die Fahrt läuft oder sie an eben dieser Falle hielt.
    if (!lage || (fahrten.get(id) !== fahrt && fahrt.haltFalle !== gefahrId)) return;
    fahrten.delete(id);
    ueberallAnhalten(fahrt.dokument, haltLage(feld, lage, fahrt.breite, fahrt.hoehe), feld);
  });
  return false;
}

// Erreicht der Held die Falle, während sein Suchwurf noch läuft, löst sie erst aus, wenn er misslingt.
function falleNachSuche(fahrt, art, feld) {
  const gefahrId = art.slice(6);
  fahrt.haltFalle = gefahrId;
  void fahrt.suche.get(gefahrId).then((ja) => {
    if (!ja) karteAusloesen(fahrt.dokument, art, feld);
  });
}

// Halt an der Fläche (0.2.21, 24.10.2026: "wenn ein Token durch eine Reise in ein Gebiet kommt, das
// eine Probe verlangt, muss die Reise an dem Platz, wo es rechnerisch ausgelöst wird, gestoppt werden").
// Mit dem Hook "gelaendepinselAnhalten" bricht die AI-Bewegungsanzeige auf jedem Client ihre eigene
// Fahrt ab, sonst setzte sie die Figur nach dem Halt noch ans Routenende; die Bitte geht deshalb an
// alle Clients. stopMovement ruft der Pinsel seit 0.2.23 nicht mehr: Foundry setzt damit an eine
// selbst gerechnete Stelle und überschrieb so das Setzen auf das Feld (Aufzeichnung 24.10.2026
// 12:31:43, die Figur vier Felder weiter bei (8701,13719); vermutet, nicht gemessen).
function tokenAnhalten(tokenId, szeneId) {
  if (szeneId && globalThis.canvas?.scene?.id && szeneId !== globalThis.canvas.scene.id) return;
  globalThis.Hooks?.callAll?.("gelaendepinselAnhalten", { tokenId, sceneId: szeneId ?? null });
}

// Wo der Token hält (0.2.22): ganz auf dem Feld, das die Karte ausgelöst hat, so nah wie möglich an der
// Lage beim Auslösen (bei großen Tokens die nächste Rasterlage, die dieses Feld bedeckt).
function haltLage(feld, lage, breite, hoehe) {
  const [spalte, zeile] = String(feld).split(",").map(Number);
  let beste = null;
  for (let dz = 0; dz < hoehe; dz += 1) {
    for (let ds = 0; ds < breite; ds += 1) {
      const ecke = canvas.grid.getTopLeftPoint({ i: zeile - dz, j: spalte - ds });
      const weite = Math.hypot(ecke.x - lage.x, ecke.y - lage.y);
      if (!beste || weite < beste.weite) beste = { x: ecke.x, y: ecke.y, weite };
    }
  }
  return beste ? { x: beste.x, y: beste.y } : null;
}

// Foundry 14 hält einen gespeicherten Zug mit stopMovement nicht an (0.2.22, gemessen 24.10.2026: die Figur
// stand nach dem Halt an seinem alten Ziel). Das Dokument steht beim Loslassen schon am Ziel; die aktive
// Spielleitung setzt den Token deshalb ohne Fahrt auf das Feld der Karte. Die Kennung
// aiBewegungsanzeigeModuleMove lässt die Änderung durch die Sperre der AI-Bewegungsanzeige, die fremde
// Positionsänderungen während ihrer Fahrten abfängt, und beendet kein Folgen.
function ueberallAnhalten(dokument, lage = null, feld = null) {
  const szeneId = dokument.parent?.id ?? null;
  tokenAnhalten(dokument.id, szeneId);
  game.socket?.emit?.(`module.${MODUL}`, { typ: "anhalten", token: dokument.id, szene: szeneId });
  if (!lage || (typeof dokument.update !== "function" && typeof dokument.move !== "function")) return;
  haltMessungBeginnen(dokument, lage, feld);
  haltWachen.set(dokument.id, { lage, bis: Date.now() + HALT_WACHE_MS, nachgesetzt: false });
  haltSetzen(dokument, lage, "halt");
}

// Ohne Fahrt und ohne Wandprüfung setzen (0.2.24, 24.10.2026: "beide haben gestoppt, sind aber in eine
// Wand gefahren; sie sollten im Feld 'gefahren' stehen bleiben"). Haltmessung 13:28: (8200,14000)
// erbeten, (8124,14301) angekommen; ein update wertet Foundry 14 als Zug vom gespeicherten Ziel aus und
// bremst an Wänden. move mit ignoreWalls und Dauer 0 wie bei der AI-Bewegungsanzeige, sonst update.
// Laufende Fahrt sichtbar beenden (0.2.25, 24.10.2026: "der Token ist die Linie zu Ende gefahren und
// dann ins richtige Hindernis geportet"). Haltmessung 16:08: Das Setzen stand nach 64 ms im Dokument, das
// Bild fuhr die alte Fahrt bis zum Ende weiter; ein move mit Dauer 0 reiht sich hinter sie. Mit
// animate:false brach das update in 0.2.23 sofort ab. Dazu beendet jeder Client beim Eintreffen des
// Setzens die noch laufende Animation dieses Tokens.
function haltAnimationBeenden(dokument) {
  const token = globalThis.canvas?.tokens?.get?.(dokument.id) ?? dokument.object ?? null;
  if (!token || !(token.animationContexts?.size > 0)) return;
  try {
    token.stopAnimation?.({ reset: true });
  } catch (fehler) {
    console.warn(`[${MODUL}] Animation beenden`, fehler);
  }
}

function haltSetzen(dokument, lage, art) {
  const kennung = { aiBewegungsanzeigeModuleMove: true, [MODUL]: { halt: true } };
  const perUpdate = () => dokument.update({ x: lage.x, y: lage.y }, { animate: false, ...kennung });
  const setzen = typeof dokument.move === "function"
    ? Promise.resolve(dokument.move([{ x: lage.x, y: lage.y, elevation: Number(dokument.elevation ?? 0) }], {
      method: "api",
      showRuler: false,
      autoRotate: false,
      animate: false,
      animation: { duration: 0 },
      constrainOptions: { ignoreWalls: true, ignoreCost: true },
      ...kennung
    })).then((bewegt) => (bewegt === false ? perUpdate() : bewegt))
    : Promise.resolve(perUpdate());
  setzen
    .then(() => haltMessungEreignis(dokument.id, { art: `${art}-gesetzt`, x: Number(dokument.x), y: Number(dokument.y) }))
    .catch((fehler) => {
      haltMessungEreignis(dokument.id, { art: `${art}-fehler`, meldung: String(fehler?.message ?? fehler) });
      console.warn(`[${MODUL}] Halt setzen`, fehler);
    });
}

// Netz hinter dem Setzen (0.2.23): Kommt kurz danach noch eine fremde Lageänderung, die weder vom Ziehen
// mit Maus oder Tastatur noch von der AI-Bewegungsanzeige stammt (etwa eine verspätete Haltestelle von
// Foundry; die kam am 24.10.2026 nach 70 ms), setzt die aktive Spielleitung den Token einmal erneut auf
// das Feld.
const HALT_WACHE_MS = 800;
const haltWachen = new Map();

// Haltmessung (0.2.23): Beim Halt hält die aktive Spielleitung 2,5 s lang fest, was mit dem Token
// geschieht (Setzen, jede Lageänderung mit ihren Optionen, die gezeichnete Lage), und legt es nach
// storage/diagnostics/gelaendepinsel-halt-0N.json, drei im Wechsel. Seit 0.2.27 aus (24.10.2026:
// "Haltmessung abschalten", der Halt stimmt), die Einstellung "messung" schaltet sie wieder an.
const HALT_MESSUNG_MS = 2500;
const haltMessungen = new Map();
let haltMessungNummer = 0;

function haltMessungBeginnen(dokument, lage, feld) {
  if (!messungAn()) return;
  const t0 = globalThis.performance?.now?.() ?? Date.now();
  const echt = globalThis.canvas?.tokens?.get?.(dokument.id) ?? dokument.object ?? null;
  haltMessungen.set(dokument.id, { t0, token: dokument.name ?? dokument.id, lage, feld, beimHalt: { x: Number(echt?.x), y: Number(echt?.y), dokX: Number(dokument.x), dokY: Number(dokument.y) }, ereignisse: [], letztesBild: -1000 });
  setTimeout(() => haltMessungBeenden(dokument.id), HALT_MESSUNG_MS)?.unref?.();
}

function haltMessungEreignis(id, ereignis) {
  const messung = haltMessungen.get(id);
  if (!messung || messung.ereignisse.length >= 300) return;
  const t = Math.round((globalThis.performance?.now?.() ?? Date.now()) - messung.t0);
  if (ereignis.art === "bild") {
    if (t - messung.letztesBild < 100) return;
    messung.letztesBild = t;
  }
  messung.ereignisse.push({ t, ...ereignis });
}

async function haltMessungBeenden(id) {
  const messung = haltMessungen.get(id);
  if (!messung) return;
  haltMessungen.delete(id);
  const Auswahl = globalThis.foundry?.applications?.apps?.FilePicker ?? globalThis.FilePicker;
  if (!game.user?.isGM || typeof Auswahl?.uploadPersistent !== "function" || typeof File !== "function") return;
  haltMessungNummer += 1;
  const name = `gelaendepinsel-halt-${String(((haltMessungNummer - 1) % 3) + 1).padStart(2, "0")}.json`;
  const inhalt = { token: messung.token, lage: messung.lage, feld: messung.feld, beimHalt: messung.beimHalt, ereignisse: messung.ereignisse };
  const text = JSON.stringify({ modul: MODUL, version: VERSION, foundry: game.version ?? null, geschrieben: new Date().toISOString(), ...inhalt }, null, 1);
  try {
    await Auswahl.uploadPersistent(MODUL, "diagnostics", new File([text], name, { type: "application/json" }), {}, { notify: false });
  } catch (fehler) {
    console.warn(`[${MODUL}] Haltmessung nicht gespeichert`, fehler);
  }
}

function fahrtPruefen(id, lage, grund = "bild") {
  const fahrt = fahrten.get(id);
  if (!fahrt || !lage) return;
  for (const zwischen of zwischenLagen(fahrt.letzte, lage)) {
    const schritt = bedeckung(zwischen.x, zwischen.y, fahrt.breite, fahrt.hoehe);
    let erreicht = null;
    for (const art of [...fahrt.erwartet.keys()]) {
      // Ein Fund beim Suchen nimmt die Falle aus der Fahrt (0.3.3).
      if (!fahrt.erwartet.has(art)) continue;
      const neu = betretenSchritt(fahrt.felder[art], schritt, fahrt.drin.get(art));
      fahrt.drin.set(art, neu.drin);
      if (!neu.feld) continue;
      fahrt.erwartet.delete(art);
      diagnoseKarte(id, art, neu.feld, grund);
      if (art.startsWith("suche:")) {
        if (sucheAmRand(id, fahrt, art.slice(6), neu.feld, zwischen)) erreicht ??= neu.feld;
        continue;
      }
      if (art.startsWith("falle:") && fahrt.suche.has(art.slice(6))) falleNachSuche(fahrt, art, neu.feld);
      else karteAusloesen(fahrt.dokument, art, neu.feld);
      erreicht ??= neu.feld;
    }
    // Während der sichtbaren Fahrt hält der Token, wo die Karte ausgelöst wird. Nicht bei Zügen ohne
    // Fahrt und nicht am Ziel: Dort steht er schon.
    if (erreicht && grund === "bild" && !gleicheLage(lage, fahrt.ziel)) {
      fahrten.delete(id);
      ueberallAnhalten(fahrt.dokument, haltLage(erreicht, zwischen, fahrt.breite, fahrt.hoehe), erreicht);
      return;
    }
  }
  fahrt.letzte = { x: Number(lage.x), y: Number(lage.y) };
  if (gleicheLage(lage, fahrt.ziel)) {
    for (const [art, feld] of [...fahrt.erwartet]) {
      if (!fahrt.erwartet.has(art)) continue;
      fahrt.erwartet.delete(art);
      diagnoseKarte(id, art, feld, `${grund}-ziel`);
      if (art.startsWith("suche:")) sucheAmRand(id, fahrt, art.slice(6), feld, null);
      else if (art.startsWith("falle:") && fahrt.suche.has(art.slice(6))) falleNachSuche(fahrt, art, feld);
      else karteAusloesen(fahrt.dokument, art, feld);
    }
    fahrt.erwartet.clear();
  }
  if (!fahrt.erwartet.size) fahrten.delete(id);
}

function karteAusloesen(dokument, art, feld) {
  if (String(art).startsWith("falle:")) {
    gefahren.ueberFalle(dokument, String(art).slice(6)).catch((fehler) => console.error(`[${MODUL}] Falle`, fehler));
    return;
  }
  karteSchicken(dokument, art, feld).catch((fehler) => console.error(`[${MODUL}] Karte`, fehler));
}

async function karteSchicken(dokument, art, feld) {
  const jemand = uebersetzen("GELAENDEPINSEL.Karte.Jemand");
  const name = foundry.utils.escapeHTML?.(dokument.name ?? jemand) ?? dokument.name ?? jemand;
  const fett = `<strong>${name}</strong>`;
  // Karte an die Spielleitung und an die, denen die Figur gehört: Sie würfeln über den Knopf selbst.
  // Der Text kommt in der Sprache der aktiven Spielleitung, die Knöpfe übersetzt PF2e je Betrachter.
  const empfaenger = game.users.filter((n) => n.isGM || dokument.actor?.testUserPermission?.(n, "OWNER")).map((n) => n.id);
  let inhalt;
  if (art === "gefahr") {
    const { sg, schaden, typ, rw } = werteAn(feld, art, dokument.parent);
    const wurf = RETTUNGSWUERFE[rw] && rw !== "keiner" ? `<p>@Check[${rw}|dc:${sg}|basic]</p>` : "";
    inhalt = `<p>${uebersetzen("GELAENDEPINSEL.Karte.Gefahr", { name: fett })}</p>${wurf}<p>@Damage[${schaden}[${typ}]]</p>`;
  } else {
    const { sg } = werteAn(feld, art, dokument.parent);
    const text = uebersetzen(art === "schmal" ? "GELAENDEPINSEL.Karte.Schmal" : "GELAENDEPINSEL.Karte.Uneben", { name: fett });
    inhalt = `<p>${text}</p><p>@Check[acrobatics|dc:${sg}]</p>`;
  }
  await ChatMessage.create({ speaker: { alias: uebersetzen("GELAENDEPINSEL.Titel") }, content: inhalt, whisper: empfaenger });
}

/* ------------------------------------------------------------------ Start */

const alteLagen = new Map();

if (typeof InteractionLayer !== "function") {
  console.error(`[${MODUL}] ${VERSION} braucht Foundry V14 (InteractionLayer).`);
} else {
  gefahren.anmelden();
  suchen.anmelden();
  Hooks.once("init", () => {
    einstellungenAnmelden();
    gefahren.einstellungenAnmelden();
    // Schnittstelle für den reaction_monitor (0.2.7): Halt auf schmalem oder unebenem Gelände.
    const eintrag = game.modules?.get?.(MODUL);
    if (eintrag) eintrag.api = { haltAn, werteAn, aktuelleWerte, stufenSg };
    CONFIG.Canvas.layers[MODUL] = { layerClass: ebeneKlasse(), group: "interface" };
  });
  // Erst in setup: Sequencer meldet seine Gruppe in init an, sie muss beim Einsortieren schon da sein.
  Hooks.once("setup", () => Hooks.on("getSceneControlButtons", gruppeEinfuegen));
  Hooks.on("canvasReady", () => {
    anzeige.behaelter = null;
    anzeige.zeichnen();
    abzeichen.behaelter = null;
    abzeichen.je.clear();
    abzeichen.bilder.clear();
    abzeichen.alleZeichnen();
    void bilderLaden();
  });
  // Geländeregionen gehören dem Modul (0.2.10, 24.10.2026: "wenn man bei Foundry in die Regionen
  // geht, sehe ich viele gelbe Flächen; öfters löscht man hier Zauberschablonen und damit auch meine
  // Bereiche"): In der Regionen-Ebene unsichtbar und nicht anklickbar, Löschen nur durch das Modul
  // selbst (Radierer), und beim Laden der Szene legt die Spielleitung fehlende Regionen neu an.
  // In der Regionen-Ebene gar nichts vom Modul (0.2.18, 24.10.2026: "im Regionen-Modus ist das immer
  // noch durch unser Modul gelb, es kommt eine Fehlermeldung, die ich nicht will; hier soll von unserem
  // Modul gar nichts zu sehen sein"). 0.2.10 setzte nur renderable; das setzt Foundry beim Ausblenden
  // außerhalb des Bildausschnitts jedes Bild neu (aus dem Code geschlossen, nicht gemessen). Jetzt aus:
  // die Region, ihre Teile und Zeichenobjekte anderswo, die zu ihr gehören, und ihr Eintrag in der Liste.
  const eigeneRegion = (region) => Boolean(region?.document?.getFlag?.(MODUL, "art") ?? region?.getFlag?.(MODUL, "art"));
  const ausblenden = (objekt) => {
    if (!objekt) return;
    objekt.visible = false;
    objekt.renderable = false;
    objekt.eventMode = "none";
  };
  // Befund der Regionenmessung (0.2.19, Foundry 14.369, 24.10.2026): Die Region selbst war schon
  // unsichtbar. Die gelbe Schraffur zeichnet Foundry als eigenes RegionMesh in einem Behälter der
  // Regionen-Ebene (stage/.../RegionLayerPF2e/ia#0/RegionMesh, region = die Geländeregion), eine Stufe
  // tiefer, als 0.2.18 gesucht hat; Foundry hielt die Region zudem weiter für sichtbar (isVisible).
  // Jetzt: isVisible für die eigene Region aus, und in der ganzen Regionen-Ebene alles, was zu ihr gehört.
  const zugehoerig = (region) => {
    const gefunden = [];
    const schlange = [globalThis.canvas?.regions, globalThis.canvas?.primary].filter(Boolean);
    let besucht = 0;
    while (schlange.length && besucht < 20000) {
      const objekt = schlange.shift();
      besucht += 1;
      if (objekt !== region && (objekt?.region === region || objekt?.object === region)) gefunden.push(objekt);
      if (objekt !== region) for (const kind of objekt?.children ?? []) schlange.push(kind);
    }
    return gefunden;
  };
  const verbergen = (region) => {
    if (!eigeneRegion(region)) return;
    if (!Object.prototype.hasOwnProperty.call(region, "isVisible")) {
      try {
        Object.defineProperty(region, "isVisible", { configurable: true, get: () => false });
      } catch (_fehler) {
        // Lässt Foundry das nicht zu, bleibt das Ausblenden unten.
      }
    }
    ausblenden(region);
    for (const teil of region.children ?? []) ausblenden(teil);
    for (const objekt of zugehoerig(region)) ausblenden(objekt);
  };
  Hooks.on("drawRegion", verbergen);
  Hooks.on("refreshRegion", verbergen);
  Hooks.on("renderRegionLegend", (_anwendung, html) => {
    const wurzel = typeof html?.querySelectorAll === "function" ? html : html?.[0];
    const eigene = new Set(Array.from(globalThis.canvas?.scene?.regions ?? []).filter((region) => region.getFlag?.(MODUL, "art")).map((region) => region.id));
    if (!eigene.size || typeof wurzel?.querySelectorAll !== "function") return;
    for (const eintrag of wurzel.querySelectorAll("[data-region-id], [data-document-id], [data-id]")) {
      const id = eintrag.dataset?.regionId ?? eintrag.dataset?.documentId ?? eintrag.dataset?.id;
      if (eigene.has(id)) eintrag.remove();
    }
  });
  // Löschen nur durch das Modul selbst, ohne Meldung (seit 0.2.18).
  Hooks.on("preDeleteRegion", (dokument, optionen) => !eigeneRegion(dokument) || Boolean(optionen?.[MODUL]));
  // Geht eine Geländeregion trotzdem verloren (etwa mit "Alle löschen" in der Regionen-Ebene), legt die
  // aktive Spielleitung sie sofort neu an (0.2.11, gemeldet: "wenn ich in Regionen alles lösche, darf das uns
  // nicht stören"). Radierer und rechte Maustaste löschen über das Modul und sind davon nicht betroffen.
  Hooks.on("deleteRegion", (dokument, optionen) => {
    const szene = dokument?.parent;
    const aktiveSl = game.users?.activeGM ?? null;
    if (!eigeneRegion(dokument) || optionen?.[MODUL] || !szene || !game.user?.isGM || (aktiveSl && aktiveSl.id !== game.user.id)) return;
    void regionenAbgleichen(felderDerSzene(szene), szene).catch((fehler) => console.warn(`${MODUL} | Regionen`, fehler));
  });
  Hooks.on("canvasReady", () => {
    const szene = canvas?.scene;
    const aktiveSl = game.users?.activeGM ?? null;
    if (!szene || !game.user?.isGM || (aktiveSl && aktiveSl.id !== game.user.id)) return;
    const felder = kostenFelder(felderDerSzene(szene));
    const fehlt = KOSTEN_ARTEN.some((art) => (felder[art]?.size ?? 0) > 0
      && !szene.regions?.find?.((region) => region.getFlag?.(MODUL, "art") === art));
    if (fehlt) void regionenAbgleichen(felder, szene).catch((fehler) => console.warn(`${MODUL} | Regionen`, fehler));
  });
  Hooks.on("updateScene", (szene, aenderung) => {
    if (szene.id !== canvas?.scene?.id || !foundry.utils.hasProperty(aenderung, `flags.${MODUL}`)) return;
    anzeige.zeichnen();
    abzeichen.alleZeichnen();
    aufraeumenPlanen();
  });
  Hooks.on("canvasReady", () => aufraeumenPlanen());
  // Folgt dem Token auch während der Fahrt: refreshToken kommt bei jeder sichtbaren Änderung. Dort
  // prüft die aktive Spielleitung auch, ob der Token eine Fläche erreicht hat (0.2.13).
  Hooks.on("refreshToken", (token) => {
    abzeichen.zeichnen(token);
    const id = token?.id ?? token?.document?.id;
    if (id) diagnoseBild(id, token);
    if (id && haltMessungen.has(id) && !istVorschau(token, id)) haltMessungEreignis(id, { art: "bild", x: Number(token?.x), y: Number(token?.y) });
    const lage = { x: Number(token?.x), y: Number(token?.y) };
    if (!id || istVorschau(token, id) || !Number.isFinite(lage.x) || !Number.isFinite(lage.y)) return;
    const ziel = unterwegs.get(id);
    fahrtPruefen(id, lage);
    if (gleicheLage(lage, ziel)) {
      unterwegs.delete(id);
      // Messung kurz nach der Ankunft abschließen, damit die letzten Bilder dabei sind.
      if (diagnosen.has(id)) setTimeout(() => diagnoseBeenden(id, "ziel"), 300)?.unref?.();
    }
  });
  Hooks.on("deleteToken", (dokument) => {
    abzeichen.entfernen(dokument.id);
    fahrten.delete(dokument.id);
    unterwegs.delete(dokument.id);
  });
  // Die alte Lage merkt sich jeder Client selbst: preUpdateToken läuft nur beim Ziehenden, die
  // Prüfung aber bei der aktiven Spielleitung, auch wenn ein Spieler zieht.
  Hooks.on("canvasReady", () => {
    alteLagen.clear();
    fahrten.clear();
    unterwegs.clear();
    for (const dokument of canvas?.scene?.tokens ?? []) alteLagen.set(dokument.id, { x: dokument.x, y: dokument.y });
  });
  Hooks.on("createToken", (dokument) => alteLagen.set(dokument.id, { x: dokument.x, y: dokument.y }));
  Hooks.on("updateToken", (dokument, aenderung, optionen) => {
    if (!("x" in aenderung || "y" in aenderung)) return;
    if (optionen?.[MODUL]?.halt) haltAnimationBeenden(dokument);
    const alt = alteLagen.get(dokument.id);
    const ziel = zugZiel(dokument, optionen, aenderung);
    alteLagen.set(dokument.id, ziel);
    const methode = optionen?._movement?.[dokument.id]?.method ?? null;
    haltMessungEreignis(dokument.id, { art: "aenderung", x: ziel.x, y: ziel.y, halt: Boolean(optionen?.[MODUL]?.halt), methode, optionen: Object.keys(optionen ?? {}).slice(0, 20) });
    const wache = haltWachen.get(dokument.id);
    // Das eigene Setzen erkennt der Pinsel an seiner Kennung oder, falls Foundry sie unterwegs verliert,
    // an der Stelle, auf die er gesetzt hat (0.2.24).
    const eigenesSetzen = Boolean(optionen?.[MODUL]?.halt) || Boolean(wache && gleicheLage(ziel, wache.lage));
    if (wache && !eigenesSetzen) {
      const gezogen = methode === "dragging" || methode === "keyboard" || Boolean(optionen?.aiBewegungsanzeigeModuleMove);
      const nachsetzen = Date.now() <= wache.bis && !wache.nachgesetzt && !gezogen
        && !gleicheLage(ziel, wache.lage) && istAktiveSpielleitung();
      if (Date.now() > wache.bis || gezogen) haltWachen.delete(dokument.id);
      if (nachsetzen) {
        wache.nachgesetzt = true;
        haltSetzen(dokument, wache.lage, "nach");
        return;
      }
    }
    // Das Setzen beim Halt (0.2.22) ist kein neuer Zug.
    if (eigenesSetzen) {
      fahrten.delete(dokument.id);
      unterwegs.delete(dokument.id);
      return;
    }
    if (!alt || dokument.parent?.id !== canvas?.scene?.id || !istAktiveSpielleitung()) return;
    fahrtBeginnen(dokument, alt, optionen, ziel);
  });
  Hooks.once("ready", () => {
    console.info(`[${MODUL}] Version ${VERSION} bereit.`);
    game.socket?.on?.(`module.${MODUL}`, (nachricht) => {
      if (nachricht?.typ === "anhalten" && nachricht.token) tokenAnhalten(nachricht.token, nachricht.szene ?? null);
    });
  });
}
