/**
 * Geländepinsel: Rechenkern ohne Foundry.
 *
 * Ein Feld ist ein Rasterfeld mit Spalte und Zeile, als Schlüssel "spalte,zeile".
 * - pinselFelder: welche Felder ein Stempel der Größe 1, 2 oder 3 um ein Feld abdeckt
 * - spurFelder: alle Felder zwischen zwei Mauspositionen (durchgehende Spur, auch bei schneller Maus)
 * - zuRechtecken: Feldmenge zu möglichst wenigen Rechtecken (für Foundry-Regionen)
 * - aussenkanten: die Randlinien einer Feldmenge (für die Anzeige, Variante C)
 */

// name ist der Übersetzungsschlüssel (lang/de.json, lang/en.json); übersetzt wird erst beim Anzeigen.
export const ARTEN = Object.freeze({
  schwierig: Object.freeze({ schwierigkeit: 2, farbe: "#ffd34d", name: "GELAENDEPINSEL.Arten.schwierig" }),
  sehr: Object.freeze({ schwierigkeit: 3, farbe: "#ff8c3a", name: "GELAENDEPINSEL.Arten.sehr" }),
  gefahr: Object.freeze({ schwierigkeit: 1, farbe: "#ff4a4a", name: "GELAENDEPINSEL.Arten.gefahr" }),
  schmal: Object.freeze({ schwierigkeit: 1, farbe: "#5cc8ff", name: "GELAENDEPINSEL.Arten.schmal" }),
  uneben: Object.freeze({ schwierigkeit: 1, farbe: "#c08cff", name: "GELAENDEPINSEL.Arten.uneben" })
});

export const schluessel = (spalte, zeile) => `${spalte},${zeile}`;

export function zerlege(feld) {
  const [spalte, zeile] = String(feld).split(",").map(Number);
  return { spalte, zeile };
}

/** Felder eines Stempels: Größe 1 = das Feld selbst, 2 = 2x2 nach rechts unten, 3 = 3x3 um die Mitte. */
export function pinselFelder(spalte, zeile, groesse = 1) {
  const g = Math.max(1, Math.min(3, Math.trunc(groesse) || 1));
  const start = g === 3 ? -1 : 0;
  const felder = [];
  for (let dz = start; dz < start + g; dz += 1) {
    for (let ds = start; ds < start + g; ds += 1) felder.push(schluessel(spalte + ds, zeile + dz));
  }
  return felder;
}

/** Alle Rasterfelder auf der Linie von Feld a nach Feld b, beide eingeschlossen (Bresenham). */
export function spurFelder(a, b) {
  let x0 = a.spalte;
  let y0 = a.zeile;
  const x1 = b.spalte;
  const y1 = b.zeile;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let fehler = dx + dy;
  const felder = [];
  for (let schritte = 0; schritte <= 100000; schritte += 1) {
    felder.push({ spalte: x0, zeile: y0 });
    if (x0 === x1 && y0 === y1) break;
    const doppelt = 2 * fehler;
    if (doppelt >= dy) { fehler += dy; x0 += sx; }
    if (doppelt <= dx) { fehler += dx; y0 += sy; }
  }
  return felder;
}

/**
 * Feldmenge zu Rechtecken in Rasterfeldern: erst waagrechte Läufe je Zeile, dann gleiche Läufe
 * in direkt folgenden Zeilen zusammenfassen. Ergebnis: [{ spalte, zeile, breite, hoehe }].
 */
export function zuRechtecken(felder) {
  const zeilen = new Map();
  for (const feld of felder) {
    const { spalte, zeile } = zerlege(feld);
    if (!Number.isFinite(spalte) || !Number.isFinite(zeile)) continue;
    if (!zeilen.has(zeile)) zeilen.set(zeile, new Set());
    zeilen.get(zeile).add(spalte);
  }
  const laeufe = [];
  for (const zeile of [...zeilen.keys()].sort((a, b) => a - b)) {
    const spalten = [...zeilen.get(zeile)].sort((a, b) => a - b);
    let beginn = null;
    let vorige = null;
    for (const s of spalten) {
      if (beginn === null) { beginn = s; vorige = s; continue; }
      if (s === vorige + 1) { vorige = s; continue; }
      laeufe.push({ spalte: beginn, zeile, breite: vorige - beginn + 1 });
      beginn = s;
      vorige = s;
    }
    if (beginn !== null) laeufe.push({ spalte: beginn, zeile, breite: vorige - beginn + 1 });
  }
  const offen = new Map();
  const fertig = [];
  for (const lauf of laeufe) {
    const kennung = `${lauf.spalte}:${lauf.breite}`;
    const vorher = offen.get(kennung);
    if (vorher && vorher.zeile + vorher.hoehe === lauf.zeile) {
      vorher.hoehe += 1;
    } else {
      if (vorher) fertig.push(vorher);
      offen.set(kennung, { spalte: lauf.spalte, zeile: lauf.zeile, breite: lauf.breite, hoehe: 1 });
    }
  }
  return [...fertig, ...offen.values()].sort((a, b) => a.zeile - b.zeile || a.spalte - b.spalte);
}

/** Randlinien einer Feldmenge in Feldkoordinaten: [{ x1, y1, x2, y2 }], nur Kanten zu Nicht-Feldern. */
export function aussenkanten(felder) {
  const menge = new Set(felder);
  const kanten = [];
  for (const feld of menge) {
    const { spalte: s, zeile: z } = zerlege(feld);
    if (!menge.has(schluessel(s, z - 1))) kanten.push({ x1: s, y1: z, x2: s + 1, y2: z });
    if (!menge.has(schluessel(s, z + 1))) kanten.push({ x1: s, y1: z + 1, x2: s + 1, y2: z + 1 });
    if (!menge.has(schluessel(s - 1, z))) kanten.push({ x1: s, y1: z, x2: s, y2: z + 1 });
    if (!menge.has(schluessel(s + 1, z))) kanten.push({ x1: s + 1, y1: z, x2: s + 1, y2: z + 1 });
  }
  return kanten;
}

/** Aufschlag nach PF2e (Kernregeln: Spieler S. 423) für das Betreten eines Feldes, in Fuß. */
export function aufschlagFuss(art, rasterweite = 5) {
  const stufe = ARTEN[art]?.schwierigkeit ?? 1;
  return (stufe - 1) * rasterweite;
}
