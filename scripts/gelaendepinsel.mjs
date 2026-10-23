/**
 * Geländepinsel - Foundry-Anbindung (Foundry V14, PF2e 8.6).
 *
 * Spielleitung: Gruppe "Geländepinsel" in der linken Leiste direkt unter Sequencer, Werkzeuge je
 * Geländeart und Radierer, Stempelgröße 1/2/3. Malen mit gedrückter Maus, die Spur ist lückenlos.
 * Gespeichert im Szenen-Flag; schwieriges und sehr schwieriges Gelände zusätzlich als Foundry-Region
 * mit Bewegungskosten, die PF2e nach Kernregeln: Spieler S. 423 rechnet.
 * Spieler: derselbe Platz in der Leiste ist ein Schalter, der die Umrandungen zeigt oder verbirgt.
 */

import { ARTEN, aussenkanten, pinselFelder, schluessel, spurFelder, zuRechtecken } from "./felder.mjs";
import { FEIN, flaechenAusStrichen, gelaendeWirkung, strichPunkte, vereinfachen, weicherRand, zaehlendeFelder } from "./flaeche.mjs";
import { STIEFEL, STRICH, ZEICHEN } from "./symbole.mjs";

const MODUL = "gelaendepinsel";
const VERSION = "0.2.7";
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
// Reihenfolge der Abzeichen am Token, von rechts oben nach links.
const ABZEICHEN_REIHE = ["sehr", "schwierig", "gefahr", "schmal", "uneben"];
const InteractionLayer = globalThis.foundry?.canvas?.layers?.InteractionLayer;

/* ------------------------------------------------------------------ Einstellungen */

function einstellungenAnmelden() {
  game.settings.register(MODUL, "anzeigen", {
    name: "Geländepinsel: Gelände anzeigen",
    hint: "Zeigt die Umrandungen des gemalten Geländes. Auf die Bewegung wirkt es immer.",
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
    onChange: () => {
      anzeige.zeichnen();
      abzeichen.alleZeichnen();
      globalThis.ui?.controls?.render?.();
    }
  });
  game.settings.register(MODUL, "art", { scope: "client", config: false, type: String, default: "schwierig" });
  game.settings.register(MODUL, "groesse", { scope: "client", config: false, type: Number, default: 1 });
  // Werte der bemalten Flächen (0.2.7): SG 0 heißt stufengerecht nach Gruppenstufe.
  game.settings.register(MODUL, "sg", { scope: "client", config: false, type: Number, default: 0 });
  game.settings.register(MODUL, "schaden", { scope: "client", config: false, type: String, default: "2d6" });
  game.settings.register(MODUL, "schadensart", { scope: "client", config: false, type: String, default: "fire" });
  game.settings.register(MODUL, "rettungswurf", { scope: "client", config: false, type: String, default: "reflex" });
  // Deckkraft der Linien je Rechner (0.1.2, 23.10.2026: "es reicht, wenn man es kaum sieht",
  // "wir machen die Darstellung deckend einstellbar"). Vorgabe 40 Prozent.
  game.settings.register(MODUL, "deckkraft", {
    name: "Erweitert: Deckkraft der Geländelinien",
    hint: "Wie stark die gestrichelten Umrandungen zu sehen sind. 100 ist voll deckend, 10 kaum sichtbar.",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 10, max: 100, step: 5 },
    default: 40,
    onChange: () => anzeige.zeichnen()
  });
  // 0.2.0 (23.10.2026): Darstellung je Rechner, weil einige Spieler alte Rechner haben.
  game.settings.register(MODUL, "darstellung", {
    name: "Geländepinsel: Darstellung",
    hint: "Weich zeigt den frei gemalten Rand, einfach den Rand am Raster (schont alte Rechner), aus zeigt keine Linien. Gerechnet wird immer.",
    scope: "client",
    config: true,
    type: String,
    choices: { weich: "Weich (Standard)", einfach: "Einfach am Raster", aus: "Aus" },
    default: "weich",
    onChange: () => anzeige.zeichnen()
  });
  game.settings.register(MODUL, "zaehlendeFelder", {
    name: "Erweitert: Zählende Felder blass hinterlegen (nur Spielleitung)",
    hint: "Zeigt, welche Felder zur Hälfte bemalt sind und damit Bewegung kosten.",
    scope: "client",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => anzeige.zeichnen()
  });
  game.settings.register(MODUL, "rasterModus", {
    name: "Erweitert: Am Raster malen statt frei",
    hint: "Malt ganze Felder wie bis 0.1.2, etwa für Räume mit geraden Wänden.",
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
export const SCHADENSARTEN = Object.freeze({ fire: "Feuer", acid: "Säure", cold: "Kälte", electricity: "Elektrizität", bludgeoning: "Wucht", piercing: "Stich", slashing: "Hieb", poison: "Gift", force: "Kraft", sonic: "Schall", spirit: "Geist", void: "Leere", vitality: "Vitalität" });
export const RETTUNGSWUERFE = Object.freeze({ reflex: "Reflex, einfach", fortitude: "Zähigkeit, einfach", will: "Willen, einfach", keiner: "kein Rettungswurf" });

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
  const auswahl = (liste, wert) => Object.entries(liste).map(([schl, text]) => `<option value="${schl}"${schl === wert ? " selected" : ""}>${text}</option>`).join("");
  const ergebnis = await DialogV2.prompt({
    window: { title: "Geländepinsel: Werte der Fläche" },
    content: `<p>Gilt für alles, was du ab jetzt schmal, uneben oder gefährlich malst.</p>
      <label>SG <input name="sg" type="number" min="0" max="60" value="${sgEingestellt > 0 ? sgEingestellt : ""}" placeholder="${stufenSg()}" style="width:5em"></label>
      <p class="hint">Leer: stufengerecht nach Gruppenstufe ${gruppenStufe()}, also SG ${stufenSg()}.</p>
      <label>Schaden <input name="schaden" type="text" value="${jetzt.schaden}" style="width:7em"></label>
      <label>Art <select name="typ">${auswahl(SCHADENSARTEN, jetzt.typ)}</select></label>
      <label>Rettungswurf <select name="rw">${auswahl(RETTUNGSWUERFE, jetzt.rw)}</select></label>`,
    ok: {
      label: "Übernehmen",
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

async function regionenAbgleichen(felder, szene) {
  for (const art of KOSTEN_ARTEN) {
    const vorhanden = szene.regions?.find?.((region) => region.getFlag?.(MODUL, "art") === art) ?? null;
    const menge = felder[art] ?? new Set();
    if (menge.size === 0) {
      if (vorhanden) await vorhanden.delete();
      continue;
    }
    const shapes = formenFuer(menge);
    if (vorhanden) {
      await vorhanden.update({ shapes });
      continue;
    }
    const daten = {
      name: `Geländepinsel: ${ARTEN[art].name}`,
      color: ARTEN[art].farbe,
      shapes,
      visibility: globalThis.CONST?.REGION_VISIBILITY?.LAYER ?? 0,
      behaviors: [{
        name: ARTEN[art].name,
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

function raenderAus(flaechen, raster) {
  const raender = {};
  for (const art of Object.keys(ARTEN)) {
    const punkte = new Set(flaechen[art]);
    for (const feld of raster[art]) {
      const [spalte, zeile] = feld.split(",").map(Number);
      for (let fy = zeile * FEIN; fy < (zeile + 1) * FEIN; fy += 1) {
        for (let fx = spalte * FEIN; fx < (spalte + 1) * FEIN; fx += 1) punkte.add(fy * 1000000 + fx);
      }
    }
    raender[art] = punkte.size ? weicherRand(punkte) : [];
  }
  return raender;
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
        if (pixel.length === 1) pixel.push({ x: pixel[0].x + 0.5, y: pixel[0].y });
        for (let i = 1; i < pixel.length; i += 1) linie(this.grafik, pixel[i - 1], pixel[i], { color: farbwert(art), width: 2 * r * groesse, alpha: 0.25 });
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
    // Seit 0.1.1 gestrichelt und duenn, Deckkraft seit 0.1.2 einstellbar.
    const breite = Math.max(1.5, groesse * 0.0075);
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
    const links = Number(token.x) + Number(token.w ?? canvas.grid.size) + g * 0.1;
    const oben = Number(token.y);
    const mitBildern = typeof PIXI.Sprite === "function" && arten.every((art) => texturen.has(art));
    const bild = mitBildern ? this.bildHolen(id, behaelter) : null;
    if (!bild) this.bildEntfernen(id);
    arten.forEach((art, index) => {
      const y = oben + index * g * 1.1;
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
      // Ein Feld hat genau eine Geländeart; neu Gemaltes ersetzt die alte.
      for (const [andere, menge] of Object.entries(strich.felder)) if (andere !== art) menge.delete(schl);
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
      globalThis.ui?.notifications?.error?.("Geländepinsel: Das Gelände konnte nicht gespeichert werden.");
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
    globalThis.ui?.notifications?.error?.("Geländepinsel: Das Gelände konnte nicht gespeichert werden.");
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
// Gelände (Kernregeln: Spieler, S. 423 und S. 233).
export const KURZ = Object.freeze({
  schwierig: "jedes Feld kostet 5 Fuß mehr, kein Schritt hinein",
  sehr: "jedes Feld kostet 10 Fuß mehr, kein Schritt hinein",
  gefahr: "wer hindurchgeht, nimmt Schaden; Art und Menge legt das Gelände fest",
  schmal: "Balancieren, Auf dem Falschen Fuß; bei Treffer oder misslungenem Rettungswurf Reflexwurf, sonst Absturz",
  uneben: "Balancieren, Auf dem Falschen Fuß; bei Treffer oder misslungenem Rettungswurf Reflexwurf, sonst Liegend",
  radierer: "nimmt Gelände weg; ein Rechtsklick radiert auch mit jedem anderen Pinsel"
});

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
      title: `${info.name}: ${KURZ[art]}`,
      icon: SYMBOLE[art] ?? "fa-solid fa-paintbrush",
      onChange: () => game.settings.set(MODUL, "art", art)
    };
  }
  tools.radierer = {
    name: "radierer",
    order: nummer += 1,
    title: `Radierer: ${KURZ.radierer}`,
    icon: "fa-solid fa-eraser",
    onChange: () => game.settings.set(MODUL, "art", "radierer")
  };
  tools.werte = {
    name: "werte",
    order: nummer += 1,
    title: "Werte der Fläche: SG, Schaden und Rettungswurf für schmal, uneben und gefährlich",
    icon: "fa-solid fa-sliders",
    button: true,
    onChange: () => void werteFenster()
  };
  for (const g of [0.5, 1, 2, 3]) {
    const name = groesseName(g);
    tools[name] = {
      name,
      order: nummer += 1,
      title: g === 0.5 ? "Pinsel ½ Feld" : `Pinsel ${g} ${g === 1 ? "Feld" : "Felder"}`,
      icon: g === 0.5 ? "fa-solid fa-circle-dot" : g === 1 ? "fa-solid fa-square" : g === 2 ? "fa-solid fa-table-cells-large" : "fa-solid fa-table-cells",
      toggle: true,
      active: Number(einstellung("groesse")) === g,
      onChange: () => groesseWaehlen(g)
    };
  }
  const art = einstellung("art");
  return {
    name: MODUL,
    title: "Geländepinsel",
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
    title: an ? "Gelände ausblenden" : "Gelände anzeigen",
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

function eckFeld(punkt) {
  const o = canvas.grid.getOffset({ x: punkt.x + 1, y: punkt.y + 1 });
  return { spalte: o.j, zeile: o.i };
}

/**
 * Felder, die ein Token bei diesem Zug neu betritt. Grundlage sind Foundrys Wegpunkte des Zugs
 * (options._movement[id].passed.waypoints, Foundry 13 und 14), sonst Anfang und Ende. Große Tokens
 * zählen mit ihrer ganzen Fläche. Ein Teleport betritt nichts.
 */
export function betreteneFelder(dokument, alt, optionen = {}) {
  const breite = Math.max(1, Math.round(Number(dokument.width) || 1));
  const hoehe = Math.max(1, Math.round(Number(dokument.height) || 1));
  const wegpunkte = optionen?._movement?.[dokument.id]?.passed?.waypoints;
  const aktionen = globalThis.CONFIG?.Token?.movement?.actions ?? {};
  if (Array.isArray(wegpunkte) && wegpunkte.length > 0 && wegpunkte.every((punkt) => aktionen[punkt?.action]?.teleport)) {
    return new Set();
  }
  const lagen = [alt, ...(Array.isArray(wegpunkte) && wegpunkte.length ? wegpunkte : [{ x: dokument.x, y: dokument.y }])]
    .filter((punkt) => Number.isFinite(Number(punkt?.x)) && Number.isFinite(Number(punkt?.y)));
  const flaeche = (ecke) => {
    const felder = [];
    for (let dz = 0; dz < hoehe; dz += 1) for (let ds = 0; ds < breite; ds += 1) felder.push(schluessel(ecke.spalte + ds, ecke.zeile + dz));
    return felder;
  };
  const start = new Set(flaeche(eckFeld(lagen[0])));
  const betreten = new Set();
  for (let index = 1; index < lagen.length; index += 1) {
    for (const ecke of spurFelder(eckFeld(lagen[index - 1]), eckFeld(lagen[index]))) {
      for (const feld of flaeche(ecke)) if (!start.has(feld)) betreten.add(feld);
    }
  }
  return betreten;
}

async function betretenPruefen(dokument, alt, optionen) {
  const felder = felderDerSzene(dokument.parent);
  const wegpunkte = optionen?._movement?.[dokument.id]?.passed?.waypoints;
  const aktion = (Array.isArray(wegpunkte) ? wegpunkte.at(-1)?.action : null) ?? dokument.movementAction ?? "walk";
  const aktionen = globalThis.CONFIG?.Token?.movement?.actions ?? {};
  // Je Art das erste betretene Feld; dessen Fläche liefert SG und Schaden (0.2.7).
  const getroffen = new Map();
  for (const feld of betreteneFelder(dokument, alt, optionen)) {
    for (const art of PROBEN_ARTEN) {
      // Fliegend oder per Teleport kein Balancieren und keine Gefahr am Boden (wie PF2e).
      if (!getroffen.has(art) && felder[art].has(feld) && gelaendeWirkung(dokument.actor, art, aktion, aktionen) > 0) getroffen.set(art, feld);
    }
  }
  if (!getroffen.size) return;
  const name = foundry.utils.escapeHTML?.(dokument.name ?? "Jemand") ?? dokument.name ?? "Jemand";
  // Karte an die Spielleitung und an die, denen die Figur gehört: Sie würfeln über den Knopf selbst.
  const empfaenger = game.users.filter((n) => n.isGM || dokument.actor?.testUserPermission?.(n, "OWNER")).map((n) => n.id);
  const karte = (inhalt) => ChatMessage.create({ speaker: { alias: "Geländepinsel" }, content: inhalt, whisper: empfaenger });
  for (const art of ["schmal", "uneben"]) {
    if (!getroffen.has(art)) continue;
    const { sg } = werteAn(getroffen.get(art), art, dokument.parent);
    const was = art === "schmal" ? "eine schmale Oberfläche" : "unebenen Boden";
    await karte(`<p><strong>${name}</strong> betritt ${was}: Balancieren (Akrobatik). Auf dem Falschen Fuß, solange die Figur darauf steht.</p><p>@Check[acrobatics|dc:${sg}]</p>`);
  }
  if (getroffen.has("gefahr")) {
    const { sg, schaden, typ, rw } = werteAn(getroffen.get("gefahr"), "gefahr", dokument.parent);
    const wurf = RETTUNGSWUERFE[rw] && rw !== "keiner" ? `<p>@Check[${rw}|dc:${sg}|basic]</p>` : "";
    await karte(`<p><strong>${name}</strong> geht durch gefährliches Gelände.</p>${wurf}<p>@Damage[${schaden}[${typ}]]</p>`);
  }
}

/* ------------------------------------------------------------------ Start */

const alteLagen = new Map();

if (typeof InteractionLayer !== "function") {
  console.error(`[${MODUL}] ${VERSION} braucht Foundry V14 (InteractionLayer).`);
} else {
  Hooks.once("init", () => {
    einstellungenAnmelden();
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
  Hooks.on("updateScene", (szene, aenderung) => {
    if (szene.id !== canvas?.scene?.id || !foundry.utils.hasProperty(aenderung, `flags.${MODUL}`)) return;
    anzeige.zeichnen();
    abzeichen.alleZeichnen();
  });
  // Folgt dem Token auch während der Fahrt: refreshToken kommt bei jeder sichtbaren Änderung.
  Hooks.on("refreshToken", (token) => abzeichen.zeichnen(token));
  Hooks.on("deleteToken", (dokument) => abzeichen.entfernen(dokument.id));
  // Die alte Lage merkt sich jeder Client selbst: preUpdateToken läuft nur beim Ziehenden, die
  // Prüfung aber bei der aktiven Spielleitung, auch wenn ein Spieler zieht.
  Hooks.on("canvasReady", () => {
    alteLagen.clear();
    for (const dokument of canvas?.scene?.tokens ?? []) alteLagen.set(dokument.id, { x: dokument.x, y: dokument.y });
  });
  Hooks.on("createToken", (dokument) => alteLagen.set(dokument.id, { x: dokument.x, y: dokument.y }));
  Hooks.on("updateToken", (dokument, aenderung, optionen) => {
    if (!("x" in aenderung || "y" in aenderung)) return;
    const alt = alteLagen.get(dokument.id);
    alteLagen.set(dokument.id, { x: dokument.x, y: dokument.y });
    if (!alt || dokument.parent?.id !== canvas?.scene?.id || !istAktiveSpielleitung()) return;
    betretenPruefen(dokument, alt, optionen).catch((fehler) => console.error(`[${MODUL}] Betreten prüfen`, fehler));
  });
  Hooks.once("ready", () => console.info(`[${MODUL}] Version ${VERSION} bereit.`));
}
