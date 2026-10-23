/**
 * Geländepinsel 0.2.0: frei gemalte Flächen, ohne Foundry.
 *
 * Ein Strich ist { art, r, p }: Geländeart (oder "radierer"), Pinselradius in Feldern und die
 * Punkte als flache Liste [x0, y0, x1, y1, ...] in Feldeinheiten (Feld (2,3) reicht von 2 bis 3).
 * Die Fläche liegt auf einem feinen Raster mit FEIN Punkten je Feldseite. Ein Feld zählt, wenn
 * mindestens die Hälfte seiner Punkte bemalt ist (23.10.2026).
 */

import { ARTEN, schluessel } from "./felder.mjs";

export const FEIN = 8;
const FEIN_FLAECHE = FEIN * FEIN;
const punktSchluessel = (fx, fy) => fy * 1000000 + fx;
const punktAus = (k) => ({ fx: k % 1000000, fy: Math.floor(k / 1000000) });

/** Feine Punkte, die ein Strich mit Radius r (in Feldern) überdeckt. */
export function strichPunkte(strich) {
  const r = Math.max(0.05, Number(strich?.r) || 0.5);
  const p = Array.isArray(strich?.p) ? strich.p : [];
  const punkte = [];
  for (let i = 0; i + 1 < p.length; i += 2) punkte.push({ x: Number(p[i]), y: Number(p[i + 1]) });
  const ergebnis = new Set();
  if (punkte.length === 0) return ergebnis;
  const stuecke = punkte.length === 1 ? [[punkte[0], punkte[0]]] : punkte.slice(1).map((b, i) => [punkte[i], b]);
  for (const [a, b] of stuecke) {
    const minX = Math.floor((Math.min(a.x, b.x) - r) * FEIN);
    const maxX = Math.ceil((Math.max(a.x, b.x) + r) * FEIN);
    const minY = Math.floor((Math.min(a.y, b.y) - r) * FEIN);
    const maxY = Math.ceil((Math.max(a.y, b.y) + r) * FEIN);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const laenge2 = dx * dx + dy * dy;
    for (let fy = Math.max(0, minY); fy <= maxY; fy += 1) {
      for (let fx = Math.max(0, minX); fx <= maxX; fx += 1) {
        const x = (fx + 0.5) / FEIN;
        const y = (fy + 0.5) / FEIN;
        const t = laenge2 > 0 ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / laenge2)) : 0;
        const nx = a.x + dx * t - x;
        const ny = a.y + dy * t - y;
        if (nx * nx + ny * ny <= r * r) ergebnis.add(punktSchluessel(fx, fy));
      }
    }
  }
  return ergebnis;
}

/**
 * Alle Striche der Reihe nach: Malen setzt die Punkte für seine Art und nimmt sie den anderen
 * (ein Punkt hat eine Art), der Radierer nimmt sie allen. Ergebnis: { art: Set(feine Punkte) }.
 */
export function flaechenAusStrichen(striche = []) {
  const flaechen = {};
  for (const art of Object.keys(ARTEN)) flaechen[art] = new Set();
  for (const strich of striche) {
    const punkte = strichPunkte(strich);
    for (const [art, menge] of Object.entries(flaechen)) {
      if (art === strich.art) continue;
      for (const k of punkte) menge.delete(k);
    }
    if (flaechen[strich.art]) for (const k of punkte) flaechen[strich.art].add(k);
  }
  return flaechen;
}

/** Felder mit mindestens der Hälfte bemalt, als Schlüssel "spalte,zeile". */
export function zaehlendeFelder(punkte) {
  const zaehler = new Map();
  for (const k of punkte) {
    const { fx, fy } = punktAus(k);
    const feld = schluessel(Math.floor(fx / FEIN), Math.floor(fy / FEIN));
    zaehler.set(feld, (zaehler.get(feld) ?? 0) + 1);
  }
  const felder = new Set();
  for (const [feld, anzahl] of zaehler) if (anzahl * 2 >= FEIN_FLAECHE) felder.add(feld);
  return felder;
}

/** Anteil eines Feldes, den eine Punktmenge bedeckt (0 bis 1). */
export function bedeckung(punkte, spalte, zeile) {
  let anzahl = 0;
  for (let fy = zeile * FEIN; fy < (zeile + 1) * FEIN; fy += 1) {
    for (let fx = spalte * FEIN; fx < (spalte + 1) * FEIN; fx += 1) if (punkte.has(punktSchluessel(fx, fy))) anzahl += 1;
  }
  return anzahl / FEIN_FLAECHE;
}

/**
 * Weicher Rand: Randkanten der feinen Punkte zu geschlossenen Zügen verketten, gerade Läufe
 * zusammenfassen und mit Chaikin glätten. Ergebnis: Liste von Zügen [{x, y}] in Feldeinheiten.
 */
export function weicherRand(punkte, { glaettung = 3 } = {}) {
  const kanten = new Map();
  const add = (x1, y1, x2, y2) => {
    const von = `${x1},${y1}`;
    if (!kanten.has(von)) kanten.set(von, []);
    kanten.get(von).push({ x1, y1, x2, y2 });
  };
  for (const k of punkte) {
    const { fx, fy } = punktAus(k);
    // Im Uhrzeigersinn um den gefüllten Punkt; nur Kanten zu leeren Nachbarn.
    if (!punkte.has(punktSchluessel(fx, fy - 1))) add(fx, fy, fx + 1, fy);
    if (!punkte.has(punktSchluessel(fx + 1, fy))) add(fx + 1, fy, fx + 1, fy + 1);
    if (!punkte.has(punktSchluessel(fx, fy + 1))) add(fx + 1, fy + 1, fx, fy + 1);
    if (fx === 0 || !punkte.has(punktSchluessel(fx - 1, fy))) add(fx, fy + 1, fx, fy);
  }
  const zuege = [];
  for (const liste of kanten.values()) {
    while (liste.length) {
      let kante = liste.pop();
      const anfang = `${kante.x1},${kante.y1}`;
      const zug = [{ x: kante.x1, y: kante.y1 }, { x: kante.x2, y: kante.y2 }];
      let schritte = 0;
      while (`${kante.x2},${kante.y2}` !== anfang && schritte < 1000000) {
        schritte += 1;
        const weiter = kanten.get(`${kante.x2},${kante.y2}`);
        if (!weiter?.length) break;
        kante = weiter.pop();
        zug.push({ x: kante.x2, y: kante.y2 });
      }
      zuege.push(zug);
    }
  }
  return zuege.map((zug) => glaetten(geradeZusammenfassen(zug), glaettung)
    .map((punkt) => ({ x: punkt.x / FEIN, y: punkt.y / FEIN })));
}

function geradeZusammenfassen(zug) {
  if (zug.length < 3) return zug;
  const ergebnis = [zug[0]];
  for (let i = 1; i < zug.length - 1; i += 1) {
    const a = ergebnis.at(-1);
    const b = zug[i];
    const c = zug[i + 1];
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) !== 0) ergebnis.push(b);
  }
  ergebnis.push(zug.at(-1));
  return ergebnis;
}

function glaetten(zug, runden) {
  let punkte = zug;
  const geschlossen = zug.length > 2 && zug[0].x === zug.at(-1).x && zug[0].y === zug.at(-1).y;
  for (let runde = 0; runde < runden && punkte.length > 2; runde += 1) {
    const neu = [];
    const n = geschlossen ? punkte.length - 1 : punkte.length - 1;
    for (let i = 0; i < n; i += 1) {
      const a = punkte[i];
      const b = punkte[i + 1];
      neu.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      neu.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    if (geschlossen) neu.push({ ...neu[0] });
    punkte = neu;
  }
  return punkte;
}

/** Punkte eines Strichs vereinfachen (Douglas-Peucker), Toleranz in Feldern. */
export function vereinfachen(punkte, toleranz = 1 / FEIN) {
  if (punkte.length < 3) return punkte.slice();
  const abstand = (p, a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy);
    if (l === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / l;
  };
  let maxIndex = 0;
  let maxAbstand = 0;
  for (let i = 1; i < punkte.length - 1; i += 1) {
    const d = abstand(punkte[i], punkte[0], punkte.at(-1));
    if (d > maxAbstand) { maxAbstand = d; maxIndex = i; }
  }
  if (maxAbstand <= toleranz) return [punkte[0], punkte.at(-1)];
  return [...vereinfachen(punkte.slice(0, maxIndex + 1), toleranz).slice(0, -1), ...vereinfachen(punkte.slice(maxIndex), toleranz)];
}

/**
 * Betrifft eine Geländeart diesen Token bei dieser Bewegungsart? Wie PF2e 8.6.1
 * (TerrainDataPF2e): Teleport nie; Fliegen kein Aufschlag und keine Bodenwirkung; wer schwieriges
 * Gelände ignoriert (movement.terrain.difficult.ignored mit "all"/"all"), zahlt dort nichts; sehr
 * schwieriges zählt dann halb und nur bei greater.ignored gar nicht.
 * Ergebnis: 1 voll, 0.5 halb, 0 gar nicht.
 */
export function gelaendeWirkung(actor, art, aktion = "walk", aktionen = {}) {
  if (aktionen?.[aktion]?.teleport) return 0;
  if (aktion === "fly") return 0;
  if (art !== "schwierig" && art !== "sehr") return 1;
  const terrain = actor?.isOfType?.("creature") ? actor.system?.movement?.terrain : null;
  const alles = (liste) => (liste ?? []).some((e) => e?.environment === "all" && e?.feature === "all");
  const einfach = alles(terrain?.difficult?.ignored);
  if (art === "schwierig") return einfach ? 0 : 1;
  if (alles(terrain?.greater?.ignored)) return 0;
  return einfach ? 0.5 : 1;
}
