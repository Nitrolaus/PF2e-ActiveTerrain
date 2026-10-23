/**
 * Geländepinsel 0.2.2: ein Zeichen je Geländeart, am Token und im Menü gleich (23.10.2026:
 * "A überall und in meinem Menü auch so"). Seit 0.2.3 nur noch Rückfall, solange die eigenen Bilder unter
 * assets/symbole noch nicht geladen sind; die Menübilder kommen nicht mehr von hier.
 * Immer derselbe Stiefel, darunter zeigt der Boden die Art: Strahlen an der Sohle (schwierig: Gehen
 * geht, kostet aber), mehr Strahlen (sehr schwierig), Stacheln (gefährlich), ein Balken (schmal),
 * Zickzack (uneben). Selbst gezeichnet, Maße in einem Feld von 100 mal 100.
 */

export const STIEFEL = Object.freeze([34, 12, 56, 12, 56, 48, 74, 55, 84, 64, 84, 72, 32, 72, 32, 48]);

// Auf hellem Gelb und hellem Blau ist das Zeichen dunkel, sonst weiß - sonst geht es unter.
export const ZEICHEN = Object.freeze({
  schwierig: Object.freeze({
    farbe: "#3d2e00",
    linien: [[38, 80, 31, 91], [58, 81, 58, 94], [78, 80, 85, 91]]
  }),
  sehr: Object.freeze({
    farbe: "#ffffff",
    linien: [[30, 80, 22, 90], [44, 82, 41, 94], [58, 82, 58, 95], [72, 82, 75, 94], [86, 80, 92, 88]]
  }),
  gefahr: Object.freeze({
    farbe: "#ffffff",
    dreiecke: [[34, 90, 40, 78, 46, 90], [52, 90, 58, 78, 64, 90], [70, 90, 76, 78, 82, 90]]
  }),
  schmal: Object.freeze({
    farbe: "#0c3550",
    linien: [[14, 84, 86, 84]],
    breite: 8
  }),
  uneben: Object.freeze({
    farbe: "#ffffff",
    zuege: [[14, 90, 26, 80, 38, 90, 50, 80, 62, 90, 74, 80, 86, 90]]
  })
});

export const STRICH = 7;

/** Das Zeichen als SVG, mit farbigem Grund wie am Token. Für die Bilder im Menü. */
export function symbolSvg(art, hintergrund) {
  const zeichen = ZEICHEN[art];
  if (!zeichen) return "";
  const farbe = zeichen.farbe;
  const breite = zeichen.breite ?? STRICH;
  const teile = [
    `<rect x="0" y="0" width="100" height="100" rx="20" fill="${hintergrund}"/>`,
    `<polygon points="${STIEFEL.join(" ")}" fill="${farbe}" stroke="${farbe}" stroke-width="4" stroke-linejoin="round"/>`
  ];
  for (const [x1, y1, x2, y2] of zeichen.linien ?? []) {
    teile.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${farbe}" stroke-width="${breite}" stroke-linecap="round"/>`);
  }
  for (const punkte of zeichen.dreiecke ?? []) {
    teile.push(`<polygon points="${punkte.join(" ")}" fill="${farbe}" stroke="${farbe}" stroke-width="4" stroke-linejoin="round"/>`);
  }
  for (const punkte of zeichen.zuege ?? []) {
    teile.push(`<polyline points="${punkte.join(" ")}" fill="none" stroke="${farbe}" stroke-width="${breite}" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${teile.join("")}</svg>\n`;
}
