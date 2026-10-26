// Suchen am Token (0.3.4), Teile ohne Foundry: Takt der Augen und Restzeit.

/* Weicher Übergang von 0 nach 1 zwischen a und b (wie ease-in-out). */
function glatt(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/*
 * Stand der Augen in ihrem 4-Sekunden-Takt, Anteil p von 0 bis 1 (25.10.2026 wählte Variante C: Blick
 * links und rechts, dazu Blinzeln). blick -1 ganz links, 0 Mitte, 1 ganz rechts; lid 1 offen bis 0.08 zu.
 */
export function augenStand(p) {
  const t = ((Number(p) % 1) + 1) % 1;
  let blick = 0;
  if (t >= 0.12 && t < 0.22) blick = -glatt(0.12, 0.22, t);
  else if (t >= 0.22 && t < 0.42) blick = -1;
  else if (t >= 0.42 && t < 0.52) blick = -1 + 2 * glatt(0.42, 0.52, t);
  else if (t >= 0.52 && t < 0.72) blick = 1;
  else if (t >= 0.72 && t < 0.82) blick = 1 - glatt(0.72, 0.82, t);
  let lid = 1;
  if (t >= 0.86 && t < 0.9) lid = 1 - 0.92 * glatt(0.86, 0.9, t);
  else if (t >= 0.9 && t < 0.94) lid = 0.08 + 0.92 * glatt(0.9, 0.94, t);
  return { blick, lid };
}

/*
 * Weg beim Absuchen (0.3.5, 25.10.2026: "ja bau das"). PF2e: höchstens halbe Geschwindigkeit; wer sicher
 * sein will, dass er alles abgesucht hat, bevor er einen Bereich betritt, höchstens 45 m (150 Fuß) pro
 * Minute. Das ist die Stufe, zu der der Halt vor der Falle passt: 2 Sekunden je 1,5-m-Feld.
 */
export const FUSS_PRO_MINUTE = 150;

export function wegSekunden(fuss) {
  const weg = Number(fuss);
  return Number.isFinite(weg) && weg > 0 ? Math.round((weg * 60) / FUSS_PRO_MINUTE) : 0;
}

/* Ganze Minuten Spielzeit bis zum Ende (aufgerundet), nie unter 0. */
export function restMinuten(bis, jetzt) {
  const rest = Number(bis) - Number(jetzt);
  return Number.isFinite(rest) ? Math.max(0, Math.ceil(rest / 60)) : 0;
}
