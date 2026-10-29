// Gefahren-Karte (0.3.0): reine Logik ohne Foundry, geprüft in tests/gefahren.test.mjs.
//
// Liest aus den Texten einer PF2e-Gefahr, was die Karte braucht: die Würfe (@Check) und Schäden (@Damage),
// den Absatz eines Erfolgsgrads, den Mindest-Übungsgrad zum Finden und Entschärfen und die Zahl der nötigen
// Erfolge. Die Texte kommen deutsch (lang-de, Übersetzungswerkstatt) oder englisch; beide Schreibweisen
// gelten.

/* Befehle mit geschachtelten eckigen Klammern ("@Damage[(2d6+3)[fire]]") samt Lage im Text. */
export function befehle(text, art = null) {
  const s = String(text ?? "");
  const aus = [];
  const muster = /@(Check|Damage)\[/gu;
  let m;
  while ((m = muster.exec(s))) {
    let tiefe = 0;
    let ende = -1;
    for (let i = m.index + m[0].length - 1; i < s.length; i += 1) {
      if (s[i] === "[") tiefe += 1;
      else if (s[i] === "]" && --tiefe === 0) { ende = i; break; }
    }
    if (ende < 0) break;
    const inhalt = s.slice(m.index + m[0].length, ende);
    muster.lastIndex = ende + 1;
    if (art && m[1] !== art) continue;
    aus.push({ art: m[1], inhalt, start: m.index, ende: ende + 1, roh: s.slice(m.index, ende + 1), ...teile(m[1], inhalt) });
  }
  return aus;
}

/* Angaben auf oberster Ebene, getrennt an "|" außerhalb von Klammern. */
function oberste(text, zeichen) {
  const aus = [];
  let tiefe = 0;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    if ("[(".includes(text[i])) tiefe += 1;
    else if ("])".includes(text[i])) tiefe -= 1;
    else if (text[i] === zeichen && tiefe === 0) { aus.push(text.slice(start, i)); start = i + 1; }
  }
  aus.push(text.slice(start));
  return aus.map((t) => t.trim());
}

function teile(art, inhalt) {
  const liste = oberste(inhalt, "|");
  if (art === "Damage") return { formel: liste[0] ?? "" };
  const typ = (liste[0] ?? "").replace(/^type:/u, "").trim();
  const dc = Number((liste.find((t) => /^dc:/iu.test(t)) ?? "").slice(3));
  return { typ, dc: Number.isFinite(dc) && dc > 0 ? dc : null, basic: liste.some((t) => /^basic$/iu.test(t)) };
}

export const RETTUNGSWUERFE = Object.freeze(["fortitude", "reflex", "will"]);

/* Hängt eine Rolloption an einen @Check an ("options:" ergänzen oder anlegen). */
export function mitOption(roh, option) {
  const m = /^@Check\[([\s\S]*)\]$/u.exec(String(roh));
  if (!m) return roh;
  const liste = oberste(m[1], "|");
  const i = liste.findIndex((t) => /^options:/iu.test(t));
  if (i >= 0) liste[i] = `${liste[i]},${option}`;
  else liste.push(`options:${option}`);
  return `@Check[${liste.join("|")}]`;
}

/* Alle @Check eines Texts mit der Option versehen. */
export function textMitOption(text, option) {
  const s = String(text ?? "");
  let aus = "";
  let pos = 0;
  for (const b of befehle(s, "Check")) {
    aus += s.slice(pos, b.start) + mitOption(b.roh, option);
    pos = b.ende;
  }
  return aus + s.slice(pos);
}

/* Die Beschriftung eines Befehls ("@Check[...]{Zähigkeitswurf}"): Text und Ende, sonst null. */
function beschriftung(s, b) {
  if (s[b.ende] !== "{") return null;
  const zu = s.indexOf("}", b.ende);
  return zu < 0 ? null : { text: s.slice(b.ende + 1, zu), ende: zu + 1 };
}

/*
 * Eine Karte für alle Betroffenen (0.3.10): Die Würfe eines Texts für eine Figur, jeder mit ihrer Option und
 * seiner Beschriftung, und der Text selbst ohne Würfe, wo jeder @Check nur noch seine Beschriftung zeigt (ohne
 * Beschriftung den Namen, den benennen liefert).
 */
export function wuerfeFuer(text, option) {
  const s = String(text ?? "");
  return befehle(s, "Check").map((b) => {
    const zusatz = beschriftung(s, b);
    return mitOption(b.roh, option) + (zusatz ? `{${zusatz.text}}` : "");
  });
}

export function textOhneWuerfe(text, benennen = (b) => b.typ) {
  const s = String(text ?? "");
  let aus = "";
  let pos = 0;
  for (const b of befehle(s, "Check")) {
    const zusatz = beschriftung(s, b);
    aus += s.slice(pos, b.start) + (zusatz ? zusatz.text : benennen(b));
    pos = zusatz ? zusatz.ende : b.ende;
  }
  return aus + s.slice(pos);
}

/* Erfolgsgrade, wie PF2e sie in flags.pf2e.context.outcome nennt. */
export const GRADE = Object.freeze(["criticalFailure", "failure", "success", "criticalSuccess"]);
const KOEPFE = Object.freeze({
  criticalSuccess: ["Kritischer Erfolg", "Critical Success"],
  success: ["Erfolg", "Success"],
  failure: ["Fehlschlag", "Failure"],
  criticalFailure: ["Kritischer Fehlschlag", "Critical Failure"]
});

/* Der Absatz eines Erfolgsgrads ("<strong>Fehlschlag</strong> ..."), sonst null. */
export function absatzFuer(text, grad) {
  const s = String(text ?? "");
  for (const kopf of KOEPFE[grad] ?? []) {
    const m = new RegExp(`<strong>\\s*${kopf}\\s*:?\\s*</strong>([\\s\\S]*?)(?=<strong>\\s*(?:Kritischer Erfolg|Erfolg|Fehlschlag|Kritischer Fehlschlag|Critical Success|Success|Failure|Critical Failure)\\s*:?\\s*</strong>|<hr|$)`, "u").exec(s);
    if (m) return m[1];
  }
  return null;
}

/* Text ohne die Absätze der Erfolgsgrade: dort steht der Schaden, der für den einfachen Rettungswurf gilt. */
function ohneGradAbsaetze(text) {
  const s = String(text ?? "");
  const m = /<strong>\s*(?:Kritischer Erfolg|Erfolg|Fehlschlag|Kritischer Fehlschlag|Critical Success|Success|Failure|Critical Failure)\s*:?\s*<\/strong>/u.exec(s);
  return m ? s.slice(0, m.index) : s;
}

/*
 * Schaden für einen Erfolgsgrad. Steht im Absatz des Grads ein @Damage, gilt der (voll). Sonst beim
 * einfachen Rettungswurf der Schaden vor den Absätzen: kritischer Erfolg keiner, Erfolg halb, Fehlschlag
 * voll, kritischer Fehlschlag doppelt (PF2e, einfacher Rettungswurf). Sonst kein Schaden.
 * Rückgabe { formeln: [...], faktor } oder null.
 */
export function schadenFuer(text, grad, basic) {
  const absatz = absatzFuer(text, grad);
  if (absatz !== null) {
    const im = befehle(absatz, "Damage");
    if (im.length) return { formeln: im.map((b) => b.formel), faktor: 1 };
    if (!basic) return null;
  }
  if (!basic) return null;
  const faktor = { criticalSuccess: 0, success: 0.5, failure: 1, criticalFailure: 2 }[grad];
  if (!faktor) return null;
  const vorne = befehle(ohneGradAbsaetze(text), "Damage");
  return vorne.length ? { formeln: vorne.map((b) => b.formel), faktor } : null;
}

/* Übungsgrade: 0 ungeübt bis 4 legendär. */
const RAENGE = Object.freeze({
  untrained: 0, trained: 1, expert: 2, master: 3, legendary: 4,
  "ungeübt": 0, "geübt": 1, trainiert: 1, experte: 2, meister: 3, legende: 4, "legendär": 4
});
const RANG_MUSTER = /\((untrained|trained|expert|master|legendary|ungeübt|geübt|trainiert|experte|meister|legende|legendär)\)/iu;

/* Mindest-Übungsgrad zum Finden aus dem Heimlichkeitseintrag ("(Experte) um ..."), sonst 0. */
export function mindestRang(text) {
  const m = RANG_MUSTER.exec(String(text ?? "").replace(/<[^>]+>/gu, " "));
  return m ? RAENGE[m[1].toLowerCase()] : 0;
}

/*
 * Die Würfe zum Entschärfen: jeder @Check im Text mit dem Übungsgrad, der direkt dahinter in Klammern
 * steht ("@Check[thievery|dc:30] (Meister)"); gilt eine Klammer für mehrere Würfe davor ("@Check[arcana]
 * oder @Check[occultism] (Geübt)"), bekommen alle ohne eigene Klammer bis dorthin denselben Grad.
 */
export function entschaerfenWuerfe(text) {
  const s = String(text ?? "");
  const liste = befehle(s, "Check");
  const aus = liste.map((b) => ({ ...b, rang: 0 }));
  for (let i = 0; i < aus.length; i += 1) {
    const bis = i + 1 < aus.length ? aus[i + 1].start : s.length;
    const nach = s.slice(aus[i].ende, Math.min(bis, aus[i].ende + 40)).replace(/<[^>]+>/gu, " ");
    const m = /^\s*(?:\{[^}]*\})?\s*\(([^)]+)\)/u.exec(nach);
    const r = m ? RAENGE[m[1].trim().toLowerCase()] : undefined;
    if (r === undefined) continue;
    aus[i].rang = r;
    for (let j = i - 1; j >= 0 && aus[j].rang === 0 && !aus[j].eigen; j -= 1) {
      const zwischen = s.slice(aus[j].ende, aus[j + 1].start).replace(/<[^>]+>/gu, " ");
      if (!/^\s*(?:\{[^}]*\})?\s*(?:,|oder|or)\s*$/iu.test(zwischen)) break;
      aus[j].rang = r;
    }
    aus[i].eigen = true;
  }
  return aus.map(({ eigen: _e, ...b }) => b);
}

const ZAHLEN = Object.freeze({ zwei: 2, drei: 3, vier: 4, "fünf": 5, sechs: 6, two: 2, three: 3, four: 4, five: 5, six: 6 });

/* Nötige Erfolge ("insgesamt drei Erfolge", "three total successes", "2 Erfolge"), sonst einer. */
export function noetigeErfolge(text) {
  const s = String(text ?? "").replace(/<[^>]+>/gu, " ").toLowerCase();
  const m = /(\d+|zwei|drei|vier|fünf|sechs|two|three|four|five|six)\s+(?:(?:total|gesamt)\s+)?(?:gesamterfolge|erfolge|successes)/u.exec(s);
  if (!m) return 1;
  const n = /^\d+$/u.test(m[1]) ? Number(m[1]) : ZAHLEN[m[1]];
  return n > 0 ? n : 1;
}

/* Wie "Mechanismus ausschalten": kritischer Erfolg zwei Erfolge, Erfolg einer, kritischer Fehlschlag löst aus. */
export function entschaerfenSchritt(grad) {
  if (grad === "criticalSuccess") return { erfolge: 2, ausloesen: false };
  if (grad === "success") return { erfolge: 1, ausloesen: false };
  if (grad === "criticalFailure") return { erfolge: 0, ausloesen: true };
  return { erfolge: 0, ausloesen: false };
}

/*
 * Die Aktion, die beim Betreten auslöst: zuerst eine Reaktion oder freie Aktion mit Auslöser, sonst eine
 * Aktion mit Auslöser, sonst die erste Aktion. Angriffe (melee, ranged) lösen nicht von selbst aus.
 */
export function ausloeseAktion(items) {
  const aktionen = (items ?? []).filter((it) => it?.type === "action");
  const mitAusloeser = (it) => /<strong>\s*(?:Auslöser|Trigger)\s*<\/strong>/u.test(String(it?.system?.description?.value ?? ""));
  return aktionen.find((it) => ["reaction", "free"].includes(it?.system?.actionType?.value) && mitAusloeser(it))
    ?? aktionen.find(mitAusloeser)
    ?? aktionen[0]
    ?? null;
}

/* Kennungen in den Rolloptionen der Würfe, die die Karte erzeugt. */
export const KENNUNG = "gelaendepinsel";
export function kennungFalle(gefahrId, itemId, zielId) { return `${KENNUNG}:falle:${gefahrId}:${itemId}:${zielId}`; }
export function kennungEntschaerfen(gefahrId, index) { return `${KENNUNG}:entschaerfen:${gefahrId}:${index}`; }
/* Rettungswurf auf der Karte für gefährliches Gelände (0.3.18); das Komma im Feld trennt sonst die Optionen. */
export function kennungGelaende(zielId, feld) { return `${KENNUNG}:gelaende:${zielId}:${String(feld).replace(",", "_")}`; }

/* Liest eine Kennung aus den Rolloptionen einer Wurfnachricht. */
export function kennungLesen(optionen) {
  for (const o of optionen ?? []) {
    const t = String(o).split(":");
    if (t[0] !== KENNUNG) continue;
    if (t[1] === "falle" && t.length === 5) return { art: "falle", gefahr: t[2], item: t[3], ziel: t[4] };
    if (t[1] === "entschaerfen" && t.length === 4) return { art: "entschaerfen", gefahr: t[2], index: Number(t[3]) };
    if (t[1] === "gelaende" && t.length === 4) return { art: "gelaende", ziel: t[2], feld: t[3].replace("_", ",") };
  }
  return null;
}

/*
 * Bereich einer Falle in Fuß (0.3.1, 25.10.2026: "das sollte in der Falle stehen, wenn nicht, steht ein
 * Feld"): aus einer Schablone (@Template[emanation|distance:10], auch type:burst) oder aus "innerhalb von
 * 10 Fuß" / "within 10 feet". Der größte genannte Wert gilt; ohne Angabe 0 = nur die Felder des Tokens.
 */
export function bereichFuss(...texte) {
  let fuss = 0;
  for (const text of texte) {
    const s = String(text ?? "");
    for (const m of s.matchAll(/@Template\[([^\]]*)\]/gu)) {
      const d = /(?:^|\|)distance:(\d+)/u.exec(m[1]);
      if (d) fuss = Math.max(fuss, Number(d[1]));
    }
    const klar = s.replace(/<[^>]+>/gu, " ");
    for (const m of klar.matchAll(/(?:innerhalb von|im Umkreis von|within)\s+(\d+)\s*(?:Fuß|feet|foot|ft)/giu)) fuss = Math.max(fuss, Number(m[1]));
    if (fuss) return fuss;
  }
  return fuss;
}
