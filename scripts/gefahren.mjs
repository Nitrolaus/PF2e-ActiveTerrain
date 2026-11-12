// Gefahren-Karte (0.3.0, 25.10.2026: "bau das"). Plan und Entscheidungen: GEFAHREN-PLAN.md.
//
// Die Spielleitung platziert Fallen als Gefahren-Token (Akteur vom Typ hazard), meist versteckt. Dieses Teil
// bringt: einen Knopf im Token-HUD (nur SL) mit Auslösen, Aufdecken und Entschärfen; eine Karte mit dem
// verlangten Rettungswurf je Figur im Wirkungsbereich (seit 0.3.10 eine Karte für alle); den Schaden nach dem Wurf; Entschärfen wie "Mechanismus
// ausschalten"; Finden nur über Wahrnehmung (Erkundung "Suchen" automatisch in der Nähe, Aktion "Suchen" im
// Umkreis); "Magie entdecken" nach seinem Wortlaut. Würfeln tut PF2e selbst; das Modul liest die Ergebnisse
// aus den Wurfnachrichten (flags.pf2e.context).
import {
  GRADE, KENNUNG, RETTUNGSWUERFE, ausloeseAktion, befehle, bereichFuss, entschaerfenSchritt, entschaerfenWuerfe, kennungEntschaerfen,
  kennungFalle, kennungLesen, mindestRang, noetigeErfolge, schadenFuer, textMitOption, textOhneWuerfe, wuerfeFuer
} from "./gefahren-logik.mjs";
import { suchtGerade } from "./suchen.mjs";

const MODUL = "gelaendepinsel";
// Suchzone um den Auslöser: 30 Fuß (0.3.19, 05.11.2026: "mach doppelt so großen Radius, aber nur was gesehen
// wird, das ist wichtig: hinter Türen und um Ecken kann man nichts sehen oder wahrnehmen"), vorher 15 Fuß. Gesehen
// heißt wie seit 0.3.12: eine freie Sichtlinie von der Falle zum Feld (mitWirkungslinie mit "sight").
const SUCHEN_FUSS = 30;
const SUCHEN_AKTION_FUSS = 30;
const MAGIE_FUSS = 30;

const t = (schluessel, daten) => (daten ? game.i18n.format(`GELAENDEPINSEL.Gefahr.${schluessel}`, daten) : game.i18n.localize(`GELAENDEPINSEL.Gefahr.${schluessel}`));
const html = (text) => foundry.utils.escapeHTML?.(String(text ?? "")) ?? String(text ?? "");

export function istGefahr(dokument) {
  return dokument?.actor?.type === "hazard";
}

function istAktiveSpielleitung() {
  const aktive = game.users?.activeGM ?? null;
  return Boolean(game.user?.isGM) && (!aktive || aktive.id === game.user.id);
}

function entschaerft(dokument) {
  return Boolean(dokument?.getFlag?.(MODUL, "entschaerft"));
}

/*
 * Erweiterungen (0.4.0, eigene Fallen): fallen.mjs hängt sich hier ein, ohne dass dieses Teil es kennt.
 * knoepfe(gefahr) liefert weitere Knöpfe fürs Totenkopf-Menü, handeln(gefahr, wahl) führt sie aus (true, wenn
 * erledigt), nachAusloesen(gefahr, item, ziele) läuft nach jeder Auslösung, nachWurf(gefahr, ziel, grad) nach
 * jedem Rettungswurf gegen die Falle.
 */
const erweiterungen = [];
export function erweitern(erweiterung) {
  erweiterungen.push(erweiterung);
}

/* Die Daten einer eigenen Falle am Akteur (0.4.0), sonst null. */
export function falleVon(dokument) {
  return dokument?.actor?.getFlag?.(MODUL, "falle") ?? null;
}

/* Wer auslöst, steht vorn: Er wird zuerst getroffen, auch wenn die Falle nur wenige Ziele hat. */
export function mitAusloeser(ziele, dokument) {
  if (!dokument) return ziele;
  return [dokument, ...ziele.filter((z) => z.id !== dokument.id)];
}

/* ---------------------------------------------------------------- Felder und Nähe */

/* Rasterfelder eines Tokens als "spalte,zeile", wie der Pinsel sie führt. */
export function felderVon(dokument) {
  const raster = globalThis.canvas?.grid;
  if (!raster?.getOffset) return new Set();
  const { i, j } = raster.getOffset({ x: Number(dokument.x) + 1, y: Number(dokument.y) + 1 });
  const aus = new Set();
  for (let dz = 0; dz < Math.max(1, Math.round(Number(dokument.height) || 1)); dz += 1) {
    for (let ds = 0; ds < Math.max(1, Math.round(Number(dokument.width) || 1)); ds += 1) aus.add(`${j + ds},${i + dz}`);
  }
  return aus;
}

/*
 * Auslöser und Wirkung getrennt (0.3.9, 26.10.2026: "eine Falle oder Gefahr braucht einen Radius, wo diese,
 * sofern nicht erkannt und ausgelöst, ihre Wirkung entfacht, wenn jemand auslöst"; gewählt: getrennt).
 * Ausgelöst wird auf den Feldern der Falle (Platte, Draht), mit eigenem Auslöseradius auch darum herum; die
 * Wirkung trifft alle im Wirkungsradius. Beide in Fuß als Flagge am Token (Totenkopf-Menü) oder am Akteur
 * (ein Fallenmodul kann sie mitbringen). Ohne Angabe gilt für die Wirkung der Bereich aus den Daten (0.3.1,
 * 25.10.2026: "das sollte in der Falle stehen, wenn nicht, steht ein Feld"), für den Auslöser nur das Feld.
 */
export function fussWert(gefahr, schluessel) {
  for (const quelle of [gefahr, gefahr?.actor]) {
    const wert = quelle?.getFlag?.(MODUL, schluessel);
    if (wert !== undefined && wert !== null && wert !== "" && Number.isFinite(Number(wert))) return Math.max(0, Number(wert));
  }
  return null;
}

function wirkungFuss(gefahr) {
  return fussWert(gefahr, "wirkung") ?? bereichFuss(ausloeseAktion(Array.from(gefahr.actor?.items ?? []))?.system?.description?.value,
    gefahr.actor?.system?.details?.description);
}

/* Wo die Falle auslöst: ihre Felder, mit Auslöseradius auch darum herum, soweit die Wirkungslinie reicht. */
export function ausloeseFelder(gefahr) {
  return mitWirkungslinie(gefahr, umkreis(felderVon(gefahr), fussWert(gefahr, "ausloeser") ?? 0));
}

/* Wo die Falle wirkt: ihre Felder und alle im Wirkungsradius, soweit die Wirkungslinie reicht. */
export function bereichsFelder(gefahr) {
  return mitWirkungslinie(gefahr, umkreis(felderVon(gefahr), wirkungFuss(gefahr)));
}

/*
 * Wirkungslinie (0.3.10, 26.10.2026: "wenn die anderen Helden zwar in einem Radius sind, aber in einem Raum mit
 * 4 Wänden und Türe, sollte die nicht betroffen sein", danach "ja beides bauen" für Wirkung und Auslöser). Wie
 * PF2e (line of effect): Ein Feld im Radius zählt nur, wenn von der Mitte eines Fallenfelds eine freie Linie zu
 * seiner Mitte führt. Es sperren die Wände, die in Foundry Bewegung sperren: Mauern, Glas, geschlossene Türen;
 * offene Türen und Wände nur für die Sicht nicht. Anlass: In einem Test standen vier von fünf
 * Getroffenen hinter einer Wand (Szenenkopie vom 26.10.2026). Geprüft wird wie in der AI-Bewegungsanzeige über
 * Token#checkCollision der Falle, sonst über Foundrys Kollisionsprüfung; fehlt beides, zählt die Linie als frei.
 */
let linieFehltGemeldet = false;

// Zwei Linien je 1 Pixel neben der Mitte, beide müssen frei sein: Eine Linie genau durch die Ecke, an der zwei
// Wandstücke aneinanderstoßen (schräg über die Wand), ginge sonst je nach Rechnung durch. Art "move" für Auslöser
// und Wirkung, "sight" für die Suchzone (0.3.12).
export function linieFrei(gefahr, von, nach, art = "move") {
  const laenge = Math.hypot(nach.x - von.x, nach.y - von.y) || 1;
  const quer = { x: -(nach.y - von.y) / laenge, y: (nach.x - von.x) / laenge };
  return [-1, 1].every((s) => strahlFrei(gefahr,
    { x: von.x + s * quer.x, y: von.y + s * quer.y }, { x: nach.x + s * quer.x, y: nach.y + s * quer.y }, art));
}

function strahlFrei(gefahr, von, nach, art = "move") {
  try {
    const objekt = gefahr?.object;
    if (typeof objekt?.checkCollision === "function") return !objekt.checkCollision(nach, { origin: von, type: art, mode: "any" });
    const hinter = globalThis.CONFIG?.Canvas?.polygonBackends?.[art];
    if (typeof hinter?.testCollision === "function") return !hinter.testCollision(von, nach, { type: art, mode: "any" });
  } catch (fehler) {
    if (!linieFehltGemeldet) console.warn(`[${MODUL}] Wirkungslinie nicht prüfbar`, fehler);
    linieFehltGemeldet = true;
  }
  return true;
}

function feldMitte(feld) {
  const [s, z] = feld.split(",").map(Number);
  const raster = globalThis.canvas?.grid;
  if (typeof raster?.getCenterPoint === "function") return raster.getCenterPoint({ i: z, j: s });
  const g = Number(raster?.size) || 100;
  return { x: (s + 0.5) * g, y: (z + 0.5) * g };
}

function mitWirkungslinie(gefahr, felder, art = "move") {
  const eigene = felderVon(gefahr);
  const quellen = [...eigene].map(feldMitte);
  const aus = new Set();
  for (const feld of felder) {
    if (eigene.has(feld)) aus.add(feld);
    else {
      const ziel = feldMitte(feld);
      if (quellen.some((quelle) => linieFrei(gefahr, quelle, ziel, art))) aus.add(feld);
    }
  }
  return aus;
}

/* Neben der Gefahr (0.3.9, gemeldet: "zum Entschärfen muss man aber neben dem Gefahren-Token stehen"): ein Feld der
   Figur liegt auf oder an einem Feld der Gefahr, auch schräg. */
export function nebenGefahr(dokument, gefahr) {
  const eigene = [...felderVon(dokument)].map((f) => f.split(",").map(Number));
  return [...felderVon(gefahr)].some((f) => {
    const [s, z] = f.split(",").map(Number);
    return eigene.some(([a, b]) => Math.max(Math.abs(a - s), Math.abs(b - z)) <= 1);
  });
}

/* Die Felder und alle bis `fuss` um sie, gemessen wie PF2e über das Raster. Innere Felder tragen nichts bei. */
function umkreis(felder, fuss) {
  const raster = globalThis.canvas?.grid;
  if (!fuss || !raster) return new Set(felder);
  const g = Number(raster.size) || 100;
  const schritte = Math.ceil(fuss / (Number(raster.distance) || 5));
  const aus = new Set(felder);
  const innen = (s, z) => [[-1, 0], [1, 0], [0, -1], [0, 1]].every(([ds, dz]) => felder.has(`${s + ds},${z + dz}`));
  for (const feld of felder) {
    const [s, z] = feld.split(",").map(Number);
    if (innen(s, z)) continue;
    for (let dz = -schritte; dz <= schritte; dz += 1) {
      for (let ds = -schritte; ds <= schritte; ds += 1) {
        const schluessel = `${s + ds},${z + dz}`;
        if (aus.has(schluessel)) continue;
        const a = { x: (s + 0.5) * g, y: (z + 0.5) * g };
        const b = { x: (s + ds + 0.5) * g, y: (z + dz + 0.5) * g };
        const weite = raster.measurePath ? Number(raster.measurePath([a, b]).distance) : Math.max(Math.abs(ds), Math.abs(dz)) * 5;
        if (weite <= fuss) aus.add(schluessel);
      }
    }
  }
  return aus;
}

function mitte(dokument) {
  const g = Number(globalThis.canvas?.grid?.size) || 100;
  return { x: Number(dokument.x) + (Number(dokument.width) || 1) * g / 2, y: Number(dokument.y) + (Number(dokument.height) || 1) * g / 2 };
}

function abstandFuss(a, b) {
  const raster = globalThis.canvas?.grid;
  const p = mitte(a);
  const q = mitte(b);
  if (raster?.measurePath) return Number(raster.measurePath([p, q]).distance) || 0;
  return Math.hypot(p.x - q.x, p.y - q.y) / (Number(raster?.size) || 100) * (Number(raster?.distance) || 5);
}

function sichtFrei(a, b) {
  const hinter = globalThis.CONFIG?.Canvas?.polygonBackends?.sight;
  if (typeof hinter?.testCollision !== "function") return true;
  try {
    return !hinter.testCollision(mitte(a), mitte(b), { type: "sight", mode: "any" });
  } catch (_fehler) {
    return true;
  }
}

/* Wer im Wirkungsbereich der Falle steht: Kreaturen, deren Felder ihn berühren (ohne Angabe nur ihr Feld). */
export function betroffene(gefahr) {
  const felder = bereichsFelder(gefahr);
  return Array.from(gefahr.parent?.tokens ?? []).filter((dokument) => dokument.id !== gefahr.id
    && dokument.actor?.isOfType?.("creature") && [...felderVon(dokument)].some((f) => felder.has(f)));
}

/* Versteckte, nicht entschärfte Fallen der Szene mit ihren Auslösefeldern, für die Fahrtprüfung des Pinsels. */
export function versteckteFallen(szene) {
  const aus = new Map();
  for (const dokument of szene?.tokens ?? []) {
    // Tür- und Schlossfallen (0.4.0) lösen nicht beim Betreten aus, sondern beim Öffnen der Tür oder am Knopf.
    const ausloesung = falleVon(dokument)?.ausloesung;
    if (ausloesung && ausloesung !== "betreten") continue;
    if (istGefahr(dokument) && dokument.hidden && !entschaerft(dokument)) aus.set(`falle:${dokument.id}`, ausloeseFelder(dokument));
  }
  return aus;
}

/* ---------------------------------------------------------------- Karten */

function empfaengerFuer(dokument) {
  return game.users.filter((n) => n.isGM || dokument?.actor?.testUserPermission?.(n, "OWNER")).map((n) => n.id);
}

function nurSpielleitung() {
  return game.users.filter((n) => n.isGM).map((n) => n.id);
}

async function meldung(inhalt, { gefahr = null, oeffentlich = false } = {}) {
  await ChatMessage.create({
    speaker: { alias: gefahr?.name ?? game.i18n.localize("GELAENDEPINSEL.Titel") },
    content: inhalt,
    ...(oeffentlich ? {} : { whisper: nurSpielleitung() })
  });
}

export async function aufdecken(gefahr, grund = "") {
  if (!gefahr?.hidden) return false;
  await gefahr.update({ hidden: false });
  await meldung(`<p>${t("Entdeckt", { name: `<strong>${html(gefahr.name)}</strong>` })}${grund ? ` ${html(grund)}` : ""}</p>`, { gefahr });
  return true;
}

/* Eine Aktion oder einen Angriff der Gefahr auslösen, gegen jede betroffene Figur. */
export async function ausloesen(gefahr, item, ziele = betroffene(gefahr)) {
  if (!item) return;
  // Der Angriff einer eigenen Falle im Menü (0.11.0) geht denselben Weg wie ihr Auslösen: ohne Angriffswurf,
  // mit der Zielgrenze der Falle. Angriffe fremder Gefahren würfeln weiter wie bisher.
  if (item.getFlag?.(MODUL, "rolle") === "angriff") item = ausloeseAktion(Array.from(gefahr.actor?.items ?? [])) ?? item;
  if (["melee", "ranged"].includes(item.type)) return angreifen(gefahr, item, ziele);
  // Eigene Fallen (0.4.0): höchstens so viele Ziele, wer auslöst zuerst; Angriffsfallen greifen gleich an.
  const hoechstens = Number(item.getFlag?.(MODUL, "hoechstens"));
  if (hoechstens > 0) ziele = ziele.slice(0, hoechstens);
  const angriff = item.getFlag?.(MODUL, "rolle") === "ausloesen"
    ? Array.from(gefahr.actor?.items ?? []).find((it) => it.getFlag?.(MODUL, "rolle") === "angriff") : null;
  if (angriff) {
    await meldung(`<p><strong>${html(gefahr.name)}: ${html(item.name)}</strong></p>${ziele.length ? "" : `<p><em>${t("Niemand")}</em></p>`}${String(item.system?.description?.value ?? "")}`, { gefahr, oeffentlich: true });
    if (ziele.length) await treffen(gefahr, angriff, ziele);
    await nachAusloesenMelden(gefahr, item, ziele);
    return;
  }
  await karteAusloesen(gefahr, item, ziele);
  await nachAusloesenMelden(gefahr, item, ziele);
}

async function nachAusloesenMelden(gefahr, item, ziele) {
  for (const e of erweiterungen) {
    try {
      await e.nachAusloesen?.(gefahr, item, ziele);
    } catch (fehler) {
      console.error(`[${MODUL}] Falle`, fehler);
    }
  }
}

async function karteAusloesen(gefahr, item, ziele) {
  const text = String(item.system?.description?.value ?? "");
  const kopf = `<p><strong>${html(gefahr.name)}: ${html(item.name)}</strong></p>`;
  if (!ziele.length) {
    await meldung(`${kopf}<p><em>${t("Niemand")}</em></p>${text}`, { gefahr });
    return;
  }
  if (ziele.length === 1) {
    const [ziel] = ziele;
    await ChatMessage.create({
      speaker: { alias: gefahr.name },
      content: `${kopf}<p>${t("Betrifft", { name: `<strong>${html(ziel.name)}</strong>` })}</p>${textMitOption(text, kennungFalle(gefahr.id, item.id, ziel.id))}`,
      whisper: empfaengerFuer(ziel)
    });
    return;
  }
  // Eine Karte für alle (0.3.10, 26.10.2026: "die Chat-Karte ist 6 mal in den Chat gekommen, fixe das"): Bei
  // einer Falle standen sechs Figuren im Wirkungsbereich, jede bekam eine eigene Karte. Jetzt
  // steht der Text einmal da und darüber je Figur eine Zeile mit ihrem Wurf; die Folgen kommen wie bisher je Wurf.
  const zeilen = ziele.map((ziel) => {
    const wuerfe = wuerfeFuer(text, kennungFalle(gefahr.id, item.id, ziel.id));
    return `<li><strong>${html(ziel.name)}</strong>${wuerfe.length ? `: ${wuerfe.join(" ")}` : ""}</li>`;
  });
  await ChatMessage.create({
    speaker: { alias: gefahr.name },
    content: `${kopf}<p>${t("BetrifftMehrere", { anzahl: ziele.length })}</p><ul>${zeilen.join("")}</ul>${textOhneWuerfe(text, wurfName)}`,
    whisper: [...new Set(ziele.flatMap((ziel) => empfaengerFuer(ziel)))]
  });
}

/* Name eines Wurfs ohne Beschriftung, wie PF2e ihn nennt (Rettungswurf oder Fertigkeit), sonst sein Kürzel. */
function wurfName(befehl) {
  const pf2e = globalThis.CONFIG?.PF2E ?? {};
  const schluessel = pf2e.saves?.[befehl.typ] ?? pf2e.skills?.[befehl.typ]?.label ?? null;
  return schluessel ? game.i18n.localize(schluessel) : befehl.typ;
}

/* Angriff der Gefahr gegen jedes Ziel, mit PF2es eigenem Angriff; bei Treffer würfelt er den Schaden. */
async function angreifen(gefahr, item, ziele) {
  const angriff = (gefahr.actor?.system?.actions ?? []).find((a) => a?.item?.id === item.id);
  if (!angriff) {
    ui.notifications.warn(t("KeinAngriff", { name: item.name }));
    return;
  }
  const vorher = Array.from(game.user.targets ?? []).map((ziel) => ziel.id);
  try {
    for (const ziel of ziele) {
      const objekt = globalThis.canvas?.tokens?.get?.(ziel.id);
      objekt?.setTarget?.(true, { releaseOthers: true, groupSelection: false });
      const wurf = await (angriff.variants?.[0]?.roll ?? angriff.roll)?.call(angriff.variants?.[0] ?? angriff, { skipDialog: true });
      const grad = Number(wurf?.degreeOfSuccess);
      if (grad === 3) await angriff.critical?.({ skipDialog: true });
      else if (grad === 2) await angriff.damage?.({ skipDialog: true });
      // Seit 0.5.0 erfahren die Erweiterungen auch vom Treffer (lange Zustände, äußere Veränderung beim kritischen Treffer).
      if (grad >= 2) for (const e of erweiterungen) await e.nachWurf?.(gefahr, ziel, grad === 3 ? "criticalHit" : "hit");
    }
  } finally {
    for (const objekt of globalThis.canvas?.tokens?.placeables ?? []) {
      objekt.setTarget?.(vorher.includes(objekt.id), { releaseOthers: false, groupSelection: true });
    }
  }
}

/*
 * Eigene Angriffsfallen ohne Angriffswurf (0.11.0, 12.11.2026: "ein Angriffswurf finde ich bei Fallen auch
 * blöd, es soll gleich reinhauen, wenn die SC die Falle nicht entschärfen oder auslösen"; "das soll in der Falle
 * klickbar sein, auch der Schaden"). Gewählt: Treffer, kritisch per Knopf; Schaden per Klick auf der Karte.
 * Jede Figur wird normal getroffen: PF2es Schadenswurf der Gefahr (Karte mit den Knöpfen zum Anwenden) und die
 * Treffer-Folgen. Danach eine Karte nur für die Spielleitung mit je Figur einem Knopf "Kritisch".
 */
function angriffVon(gefahr, item) {
  return (gefahr.actor?.system?.actions ?? []).find((a) => a?.item?.id === item.id) ?? null;
}

async function mitZiel(ziel, aufgabe) {
  const vorher = Array.from(game.user.targets ?? []).map((z) => z.id);
  try {
    globalThis.canvas?.tokens?.get?.(ziel.id)?.setTarget?.(true, { releaseOthers: true, groupSelection: false });
    return await aufgabe();
  } finally {
    for (const objekt of globalThis.canvas?.tokens?.placeables ?? []) {
      objekt.setTarget?.(vorher.includes(objekt.id), { releaseOthers: false, groupSelection: true });
    }
  }
}

async function treffen(gefahr, item, ziele) {
  const angriff = angriffVon(gefahr, item);
  if (!angriff) {
    ui.notifications.warn(t("KeinAngriff", { name: item.name }));
    return;
  }
  for (const ziel of ziele) {
    await mitZiel(ziel, () => angriff.damage?.({ skipDialog: true }));
    for (const e of erweiterungen) await e.nachWurf?.(gefahr, ziel, "hit");
  }
  const knoepfe = ziele.map((ziel) => `<button type="button" data-gp-krit="${html(`${gefahr.id}|${item.id}|${ziel.id}`)}">`
    + `<i class="fa-solid fa-burst"></i> ${html(t("Kritisch", { name: ziel.name }))}</button>`);
  await meldung(`<p>${t("Getroffen", { namen: ziele.map((z) => `<strong>${html(z.name)}</strong>`).join(", ") })}</p>${knoepfe.join("")}`, { gefahr });
}

/* Knopf "Kritisch" (0.11.0): kritischer Schaden und die kritischen Folgen, einmal je Figur und Karte. */
async function kritischGeben(nachricht, kennung) {
  const [gefahrId, itemId, zielId] = String(kennung).split("|");
  const erledigt = nachricht.getFlag?.(MODUL, "kritisch") ?? [];
  if (erledigt.includes(zielId)) return;
  const szene = game.scenes.find((s) => s.tokens.has(gefahrId));
  const gefahr = szene?.tokens.get(gefahrId);
  const ziel = szene?.tokens.get(zielId);
  const item = gefahr?.actor?.items?.get?.(itemId);
  const angriff = gefahr && item ? angriffVon(gefahr, item) : null;
  if (!gefahr || !ziel || !angriff) {
    ui.notifications.warn(t("KritischWeg"));
    return;
  }
  await nachricht.setFlag(MODUL, "kritisch", [...erledigt, zielId]);
  await mitZiel(ziel, () => angriff.critical?.({ skipDialog: true }));
  for (const e of erweiterungen) await e.nachWurf?.(gefahr, ziel, "criticalHit");
}

function kritKnoepfeEinsetzen(nachricht, element) {
  const knoepfe = element?.querySelectorAll?.("button[data-gp-krit]") ?? [];
  if (!knoepfe.length) return;
  const erledigt = nachricht.getFlag?.(MODUL, "kritisch") ?? [];
  for (const knopf of knoepfe) {
    const zielId = String(knopf.dataset.gpKrit).split("|")[2];
    if (!game.user?.isGM || erledigt.includes(zielId)) {
      knopf.disabled = true;
      continue;
    }
    knopf.addEventListener("click", (ereignis) => {
      ereignis.preventDefault();
      knopf.disabled = true;
      void kritischGeben(nachricht, knopf.dataset.gpKrit).catch((fehler) => console.error(`[${MODUL}] Kritisch`, fehler));
    });
  }
}

/*
 * Einen Schadenswurf mit PF2es eigenem Code auslösen: Der @Damage-Befehl wird angereichert und angeklickt.
 * PF2e hört auf Klicks im ganzen Dokument (InlineRollLinks.activatePF2eListeners) und würfelt über
 * augmentInlineDamageRoll; data-item-uuid macht die Gefahr zum Sprecher und liefert ihre Rolldaten.
 */
async function schadenWuerfeln(formel, item) {
  const Editor = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
  const angereichert = await Editor.enrichHTML(`@Damage[${formel}]`, { rollData: item?.getRollData?.() ?? {} });
  const huelle = document.createElement("div");
  huelle.style.display = "none";
  if (item?.uuid) huelle.dataset.itemUuid = item.uuid;
  huelle.innerHTML = angereichert;
  document.body.append(huelle);
  try {
    const link = huelle.querySelector("[data-base-formula], a.inline-roll");
    link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    await new Promise((fertig) => setTimeout(fertig, 300));
  } finally {
    huelle.remove();
  }
}

async function nachRettungswurf(kennung, grad, nachricht) {
  const szene = game.scenes.find((s) => s.tokens.has(kennung.gefahr));
  const gefahr = szene?.tokens.get(kennung.gefahr);
  const item = gefahr?.actor?.items?.get?.(kennung.item);
  const ziel = szene?.tokens.get(kennung.ziel);
  if (!gefahr || !item) return;
  const text = String(item.system?.description?.value ?? "");
  const wurf = befehle(text, "Check").find((b) => RETTUNGSWUERFE.includes(b.typ.toLowerCase()));
  const schaden = schadenFuer(text, grad, Boolean(wurf?.basic));
  const name = `<strong>${html(ziel?.name ?? nachricht.speaker?.alias ?? "")}</strong>`;
  const gradText = t(`Grad.${grad}`);
  if (!schaden) {
    await meldung(`<p>${t("KeinSchaden", { name, grad: gradText })}</p>`, { gefahr });
    return;
  }
  const anwenden = schaden.faktor === 2 ? t("Schaden.doppelt") : schaden.faktor === 0.5 ? t("Schaden.halb") : t("Schaden.voll");
  await meldung(`<p>${t("SchadenFuer", { name, grad: gradText })} ${anwenden}</p>`, { gefahr });
  for (const formel of schaden.formeln) await schadenWuerfeln(formel, item);
}

async function nachWurfMelden(kennung, grad) {
  const szene = game.scenes.find((s) => s.tokens.has(kennung.gefahr));
  const gefahr = szene?.tokens.get(kennung.gefahr);
  const ziel = szene?.tokens.get(kennung.ziel);
  if (!gefahr || !ziel) return;
  for (const e of erweiterungen) await e.nachWurf?.(gefahr, ziel, grad);
}

/*
 * Rettungswurf auf der Karte für gefährliches Gelände (0.3.18, 29.10.2026: "ja, bau das wie bei den Fallen"):
 * Erfolgsgrad und Schaden wie beim einfachen Rettungswurf einer Falle, der Schaden wird gewürfelt.
 */
export async function nachGelaendeWurf(grad, name, formel) {
  const schaden = schadenFuer(`@Damage[${formel}]`, grad, true);
  const fett = `<strong>${html(name)}</strong>`;
  const gradText = t(`Grad.${grad}`);
  if (!schaden) {
    await meldung(`<p>${t("KeinSchaden", { name: fett, grad: gradText })}</p>`);
    return;
  }
  const anwenden = schaden.faktor === 2 ? t("Schaden.doppelt") : schaden.faktor === 0.5 ? t("Schaden.halb") : t("Schaden.voll");
  await meldung(`<p>${t("SchadenFuer", { name: fett, grad: gradText })} ${anwenden}</p>`);
  for (const f of schaden.formeln) await schadenWuerfeln(f, null);
}

/* ---------------------------------------------------------------- Entschärfen */

export async function entschaerfenAnbieten(gefahr) {
  const text = String(gefahr.actor?.system?.details?.disable ?? "");
  const wuerfe = entschaerfenWuerfe(text);
  if (!wuerfe.length) {
    ui.notifications.info(t("KeinEntschaerfen"));
    return;
  }
  let neu = "";
  let pos = 0;
  wuerfe.forEach((w, index) => {
    neu += text.slice(pos, w.start) + textMitOption(w.roh, kennungEntschaerfen(gefahr.id, index));
    pos = w.ende;
  });
  neu += text.slice(pos);
  const stand = Number(gefahr.getFlag(MODUL, "erfolge") ?? 0);
  await ChatMessage.create({
    speaker: { alias: gefahr.name },
    content: `<p><strong>${html(gefahr.name)}: ${t("Entschaerfen")}</strong></p>${neu}<p><em>${t("ErfolgeStand", { stand, noetig: noetigeErfolge(text) })} ${t("NurDaneben")}</em></p>`
  });
}

function rangIn(actor, typ) {
  const slug = String(typ ?? "").toLowerCase();
  if (slug === "perception") return Number(actor?.perception?.rank ?? 0);
  const fertigkeit = actor?.skills?.[slug];
  return fertigkeit ? Number(fertigkeit.rank ?? 0) : null;
}

async function nachEntschaerfen(kennung, grad, nachricht) {
  const szene = game.scenes.find((s) => s.tokens.has(kennung.gefahr));
  const gefahr = szene?.tokens.get(kennung.gefahr);
  if (!gefahr || entschaerft(gefahr)) return;
  const text = String(gefahr.actor?.system?.details?.disable ?? "");
  const wurf = entschaerfenWuerfe(text)[kennung.index];
  const actor = nachricht.actor ?? game.actors.get(nachricht.speaker?.actor ?? "");
  const name = `<strong>${html(actor?.name ?? nachricht.speaker?.alias ?? "")}</strong>`;
  // Nur wer neben der Gefahr steht (0.3.9, 26.10.2026: "zum Entschärfen muss man aber neben dem
  // Gefahren-Token stehen"); sonst zählt der Wurf nicht, auch ein kritischer Fehlschlag löst nichts aus.
  const von = actor?.getActiveTokens?.(true, true)?.find((tk) => tk.parent?.id === szene.id) ?? null;
  if (!von || !nebenGefahr(von, gefahr)) {
    await meldung(`<p>${t("ZuWeit", { name })}</p>`, { gefahr, oeffentlich: true });
    return;
  }
  // Mindest-Übungsgrad aus dem Entschärfen-Eintrag; bei Kenntnissen ohne Rang im Bogen zählt der Wurf.
  const rang = rangIn(actor, wurf?.typ);
  if (wurf?.rang > 0 && rang !== null && rang < wurf.rang) {
    await meldung(`<p>${t("ZaehltNicht", { name })}</p>`, { gefahr });
    return;
  }
  const schritt = entschaerfenSchritt(grad);
  if (schritt.ausloesen) {
    await meldung(`<p>${t("LoestAus", { name })}</p>`, { gefahr });
    // Die Wirkung trifft alle im Wirkungsbereich (0.3.9), dazu immer den, der daran gearbeitet hat.
    await ausloesen(gefahr, ausloeseAktion(Array.from(gefahr.actor?.items ?? [])), mitAusloeser(betroffene(gefahr), von));
    return;
  }
  if (!schritt.erfolge) return;
  const noetig = noetigeErfolge(text);
  const stand = Number(gefahr.getFlag(MODUL, "erfolge") ?? 0) + schritt.erfolge;
  if (stand >= noetig) {
    await gefahr.update({ [`flags.${MODUL}.erfolge`]: stand, [`flags.${MODUL}.entschaerft`]: true });
    await meldung(`<p>${t("Entschaerft", { name: `<strong>${html(gefahr.name)}</strong>` })}</p>`, { gefahr, oeffentlich: true });
  } else {
    await gefahr.setFlag(MODUL, "erfolge", stand);
    await meldung(`<p>${t("ErfolgeStand", { stand, noetig })}</p>`, { gefahr, oeffentlich: true });
  }
}

/* ---------------------------------------------------------------- Finden */

function heimlichkeit(gefahr) {
  const st = gefahr.actor?.system?.attributes?.stealth ?? {};
  const dc = Number(st.dc ?? (Number(st.value) + 10));
  return { dc: Number.isFinite(dc) ? dc : null, rang: mindestRang(st.details) };
}

/* Gezieltes "Suchen" (Seek): jede versteckte Falle im Umkreis in Sichtlinie gegen das Ergebnis des Wurfs. */
async function nachSuchen(nachricht) {
  const actor = nachricht.actor;
  const szene = globalThis.canvas?.scene;
  const von = actor?.getActiveTokens?.(true, true)?.find((tk) => tk.parent?.id === szene?.id);
  const ergebnis = Number(nachricht.rolls?.[0]?.total);
  if (!von || !Number.isFinite(ergebnis)) return;
  for (const gefahr of szene.tokens) {
    if (!istGefahr(gefahr) || !gefahr.hidden || entschaerft(gefahr)) continue;
    if (abstandFuss(von, gefahr) > SUCHEN_AKTION_FUSS || !sichtFrei(von, gefahr)) continue;
    const { dc, rang } = heimlichkeit(gefahr);
    if (dc === null || Number(actor.perception?.rank ?? 0) < rang || ergebnis < dc) continue;
    await aufdecken(gefahr, t("DurchSuchen", { name: actor.name }));
  }
}

/*
 * Suchen entlang des Wegs (0.3.3, 25.10.2026: "ja bau das"). Bis 0.3.2 maß die Suche vom Anfang eines
 * Zugs aus; im updateToken-Hook steht dort noch der Startpunkt (gemessen 24.10.2026). Jetzt hat jede
 * versteckte Falle eine Suchzone, alle Felder bis 15 Fuß (seit 0.3.19 30) um ihren Bereich, und der Pinsel prüft sie Feld für
 * Feld wie eine Fläche. Gewürfelt wird geheim beim Losfahren, damit das Ergebnis am Rand der Zone schon
 * feststeht. Gelingt der Wurf, hält der Held am Rand der Zone, vor der Falle, und sie wird aufgedeckt.
 *
 * Immer wieder (0.3.19, 05.11.2026: "ich hätte gern, dass die Wahrnehmung immer, wenn ein Token gezogen wird,
 * gewürfelt wird"; gewählt: nur wer sucht, nur nahe einer Falle, bei Fund der Wurf mit Ergebnis für alle, und
 * "würfeln je 3 Felder"). Bis 0.3.18 einmal je Held und Falle, gemerkt an der Falle (Flagge suche); ein Fehlschlag
 * galt für immer. Wann gewürfelt wird, legt der Pinsel fest (am Rand der Zone und alle 3 Felder in ihr, siehe
 * suchSchritte). Der Wurf macht keine eigene Nachricht und damit keine Würfelanimation; die SL bekommt eine Zeile,
 * die Spieler nicht sehen, und findet der Held die Falle, sehen alle seinen Wurf ohne den SG.
 */
const letzteWuerfe = new Map();

/* Ein neuer Wurf; der letzte je Held und Falle bleibt für sucheErreicht ohne eigenen Eintrag gemerkt. */
function neuerWurf(gefahr, dokument) {
  const eintrag = { wert: null, zahlen: null, versprechen: null };
  eintrag.versprechen = suchWurf(gefahr, dokument, eintrag)
    .catch((fehler) => {
      console.error(`[${MODUL}] Suchen`, fehler);
      return 0;
    })
    .then((wert) => {
      eintrag.wert = wert;
      return wert;
    });
  letzteWuerfe.set(`${gefahr.id}:${dokument.actor.id}`, eintrag);
  return eintrag;
}

/* Die Suchzonen für diese Figur als "suche:<id>" mit ihren Feldern; leer, wenn sie nicht sucht. */
export function suchZonen(dokument) {
  const aus = new Map();
  if (!istAktiveSpielleitung() || game.combat?.started || !suchtGerade(dokument?.actor)) return aus;
  for (const gefahr of dokument.parent?.tokens ?? []) {
    if (!istGefahr(gefahr) || !gefahr.hidden || entschaerft(gefahr)) continue;
    const { dc, rang } = heimlichkeit(gefahr);
    if (dc === null || Number(dokument.actor.perception?.rank ?? 0) < rang) continue;
    // Um den Auslöser (0.3.9): Gefunden heißt, der Held tritt nicht darauf; im Wirkungsradius darf er stehen.
    // Nur mit freier Sicht zur Falle (0.3.12, 29.10.2026: "eine verschlossene Türe kann ein automatisches
    // Finden, wie ich es jetzt z.B. habe, nicht erlauben"; die Erscheinung der Blutkönigin stand versteckt hinter
    // einer verschlossenen Tür, die Helden 2 bis 5 Felder davor). Wände, geschlossene und verschlossene Türen
    // halten die Suchzone auf, offene Türen nicht; geprüft nach Sicht, denn Finden ist Wahrnehmung.
    aus.set(`suche:${gefahr.id}`, mitWirkungslinie(gefahr, umkreis(ausloeseFelder(gefahr), SUCHEN_FUSS), "sight"));
  }
  return aus;
}

/* PF2es Wahrnehmungswurf ohne Nachricht (createMessage: false). */
async function suchWurf(gefahr, dokument, eintrag) {
  const { dc } = heimlichkeit(gefahr);
  const ergebnis = await dokument.actor.perception.roll({
    dc: { value: dc }, createMessage: false, skipDialog: true,
    extraRollOptions: ["action:search", `${KENNUNG}:suche:${gefahr.id}`]
  });
  const grad = Number(ergebnis?.degreeOfSuccess);
  const wert = Number.isFinite(grad) ? grad : 0;
  eintrag.zahlen = {
    name: `<strong>${html(dokument.actor?.name ?? dokument.name)}</strong>`,
    ergebnis: ergebnis?.total ?? "?",
    w20: ergebnis?.dice?.[0]?.total ?? "?"
  };
  eintrag.zeile = t("SuchWurf", { ...eintrag.zahlen, sg: dc, grad: t(`Grad.${GRADE[wert]}`), gefahr: html(gefahr.name) });
  return wert;
}

/*
 * Die Zeile für die SL, sobald der Held den Würfelpunkt erreicht: Gewürfelt wird schon beim Losfahren, damit das
 * Ergebnis dort feststeht; Punkte, die er nicht erreicht (etwa weil ihn Gelände vorher anhält), bleiben ohne Zeile.
 */
function zeileMelden(eintrag) {
  if (!eintrag?.zeile || eintrag.gemeldet) return;
  eintrag.gemeldet = true;
  void meldung(`<p>${eintrag.zeile}</p>`).catch((fehler) => console.error(`[${MODUL}] Suchen`, fehler));
}

/* Gefunden: die Falle aufdecken und den Wurf für alle zeigen. Bis das Aufdecken gespeichert ist, zählt sie als
   gefunden, damit ein zweiter Würfelpunkt desselben Wegs sie nicht noch einmal findet. */
const gefundeneFallen = new Set();

function sucheFund(gefahr, dokument, eintrag) {
  gefundeneFallen.add(gefahr.id);
  void aufdecken(gefahr, t("DurchSuchen", { name: dokument.actor?.name ?? dokument.name }))
    .finally(() => gefundeneFallen.delete(gefahr.id))
    .then((aufgedeckt) => aufgedeckt && eintrag?.zahlen && ChatMessage.create({
      speaker: { alias: dokument.actor?.name ?? dokument.name },
      content: `<p>${t("SuchFund", eintrag.zahlen)}</p>`
    }))
    .catch((fehler) => console.error(`[${MODUL}] Suchen`, fehler));
  return true;
}

/* Beim Losfahren: ein Wurf für einen Würfelpunkt auf dem Weg; liefert seinen Eintrag. */
export function sucheVorbereiten(dokument, gefahrId) {
  const gefahr = dokument.parent?.tokens?.get?.(gefahrId);
  return gefahr && dokument.actor ? neuerWurf(gefahr, dokument) : null;
}

/*
 * Am Würfelpunkt: true, wenn der Held die Falle findet (sie wird aufgedeckt), false, wenn nicht, und ein
 * Versprechen darauf, solange der Wurf noch läuft. Ohne Eintrag gilt der letzte Wurf, sonst ein neuer.
 */
export function sucheErreicht(dokument, gefahrId, eintragVorher = null) {
  const gefahr = dokument.parent?.tokens?.get?.(gefahrId);
  const offen = () => Boolean(gefahr?.hidden) && !gefundeneFallen.has(gefahr.id);
  if (!offen() || entschaerft(gefahr) || !istAktiveSpielleitung() || !dokument.actor) return false;
  const eintrag = eintragVorher ?? letzteWuerfe.get(`${gefahr.id}:${dokument.actor.id}`) ?? neuerWurf(gefahr, dokument);
  if (eintrag.wert !== null) {
    zeileMelden(eintrag);
    return eintrag.wert >= 2 && sucheFund(gefahr, dokument, eintrag);
  }
  return eintrag.versprechen.then((wert) => {
    if (!offen()) return false;
    zeileMelden(eintrag);
    return wert >= 2 && sucheFund(gefahr, dokument, eintrag);
  });
}

/* ---------------------------------------------------------------- Magie entdecken */

/*
 * Nach dem Wortlaut (PF2e spells-srd, Detect Magic, Ausstrahlung 30 Fuß): Grundform nur, ob Magie da ist;
 * ab Grad 3 die Stufe der stärksten; ab Grad 4 dazu deren Quelle, eingegrenzt auf ein Feld von 5 Fuß, ohne
 * genaue Lage. Die Meldung geht an die Spielleitung. Mit der Einstellung "magieAufdecken" deckt der Zauber
 * versteckte magische Fallen im Bereich auf (25.10.2026, Vorgabe aus).
 *
 * Wirkungslinie (0.4.1, 06.11.2026: "auch wenn der Zauber etwas aufdeckt, dies aber hinter der Tür ist, kann ein
 * Spieler nicht sehen, was hinter einer Tür ist"). Der Zauber ist eine Ausstrahlung; ein Bereich wirkt nach PF2e nur
 * dort, wohin vom Ursprung eine Wirkungslinie führt. Gemeldet wird also nur Magie mit freier Linie vom Zaubernden zur
 * Falle (Wände, die Bewegung sperren: Mauern, Glas, geschlossene Türen). Aufgedeckt wird darüber hinaus nur, was der
 * Zaubernde auch sieht (freie Sichtlinie), wie bei der Suchzone seit 0.3.12.
 */
async function nachMagieEntdecken(nachricht) {
  const actor = nachricht.actor;
  const szene = globalThis.canvas?.scene;
  const von = actor?.getActiveTokens?.(true, true)?.find((tk) => tk.parent?.id === szene?.id);
  if (!von) return;
  const grad = Number(nachricht.flags?.pf2e?.casting?.castRank ?? nachricht.item?.rank ?? 1);
  const magisch = Array.from(szene.tokens).filter((gefahr) => istGefahr(gefahr) && !entschaerft(gefahr)
    && (gefahr.actor?.system?.traits?.value ?? []).includes("magical") && abstandFuss(von, gefahr) <= MAGIE_FUSS
    && linieFrei(gefahr, mitte(von), mitte(gefahr), "move"));
  if (!magisch.length) {
    await meldung(`<p>${t("Magie.Keine", { name: html(actor.name) })}</p>`);
    return;
  }
  const staerkste = [...magisch].sort((a, b) => Number(b.actor?.level ?? 0) - Number(a.actor?.level ?? 0))[0];
  let text = t("Magie.Da", { name: html(actor.name), anzahl: magisch.length });
  if (grad >= 3) text += ` ${t("Magie.Stufe", { stufe: Number(staerkste.actor?.level ?? 0) })}`;
  if (grad >= 4) text += ` ${t("Magie.Quelle", { gefahr: html(staerkste.name) })}`;
  await meldung(`<p>${text}</p>`);
  if (game.settings.get(MODUL, "magieAufdecken")) {
    for (const gefahr of magisch) {
      if (linieFrei(gefahr, mitte(von), mitte(gefahr), "sight")) await aufdecken(gefahr, t("DurchMagie", { name: actor.name }));
    }
  }
}

/* ---------------------------------------------------------------- Über eine versteckte Falle laufen */

/* Vom Pinsel aufgerufen, wenn eine Figur das Feld einer versteckten Falle erreicht (Halt macht er selbst). */
export async function ueberFalle(dokument, gefahrId) {
  const gefahr = dokument.parent?.tokens?.get?.(gefahrId);
  if (!gefahr || !gefahr.hidden || entschaerft(gefahr) || !istAktiveSpielleitung()) return;
  await aufdecken(gefahr, t("DurchBetreten", { name: dokument.name }));
  await ausloesen(gefahr, ausloeseAktion(Array.from(gefahr.actor?.items ?? [])), mitAusloeser(betroffene(gefahr), dokument));
}

/*
 * Aus der Ferne auslösen (0.3.9, 26.10.2026: "oder bewusst von der Ferne auslösen"): etwa ein Stein auf die
 * Platte. Die Falle zeigt sich, die Auslöse-Aktion trifft alle im Wirkungsbereich, auch niemanden.
 */
export async function fernAusloesen(gefahr) {
  if (gefahr.hidden) await gefahr.update({ hidden: false });
  await meldung(`<p>${t("FernAusgeloest", { name: `<strong>${html(gefahr.name)}</strong>` })}</p>`, { gefahr, oeffentlich: true });
  await ausloesen(gefahr, ausloeseAktion(Array.from(gefahr.actor?.items ?? [])), betroffene(gefahr));
}

/* Auslöser und Wirkung je Falle einstellen (0.3.9), in Fuß, als Flagge am Token. */
export async function bereichEinstellen(gefahr) {
  const ausloeser = fussWert(gefahr, "ausloeser") ?? 0;
  const wirkung = wirkungFuss(gefahr) ?? 0;
  const feld = (name, beschriftung, wert) => `<div class="form-group"><label>${beschriftung}</label>`
    + `<input type="number" name="${name}" min="0" step="5" value="${Number(wert)}"></div>`;
  const werte = await foundry.applications.api.DialogV2.wait({
    window: { title: `${gefahr.name}: ${t("BereichEinstellen")}` },
    content: feld("ausloeser", t("Bereich.Ausloeser"), ausloeser) + feld("wirkung", t("Bereich.Wirkung"), wirkung),
    buttons: [{
      action: "speichern", label: t("Bereich.Speichern"), default: true,
      callback: (_ereignis, knopf) => ({
        ausloeser: Number(knopf.form.elements.ausloeser.value),
        wirkung: Number(knopf.form.elements.wirkung.value)
      })
    }],
    rejectClose: false
  });
  if (!werte || !Number.isFinite(werte.ausloeser) || !Number.isFinite(werte.wirkung)) return;
  await gefahr.update({
    [`flags.${MODUL}.ausloeser`]: Math.max(0, werte.ausloeser),
    [`flags.${MODUL}.wirkung`]: Math.max(0, werte.wirkung)
  });
}

/* ---------------------------------------------------------------- Knopf und Auswahl */

export async function menue(gefahr) {
  const items = Array.from(gefahr.actor?.items ?? []).filter((it) => ["action", "melee", "ranged"].includes(it.type));
  const knoepfe = items.map((it) => ({ action: `item:${it.id}`, label: t("Ausloesen", { name: it.name }) }));
  if (!entschaerft(gefahr) && ausloeseAktion(Array.from(gefahr.actor?.items ?? []))) knoepfe.push({ action: "fern", label: t("FernAusloesen") });
  if (gefahr.hidden) knoepfe.push({ action: "aufdecken", label: t("Aufdecken") });
  if (!gefahr.hidden && !entschaerft(gefahr) && entschaerfenWuerfe(gefahr.actor?.system?.details?.disable).length) {
    knoepfe.push({ action: "entschaerfen", label: t("EntschaerfenAnbieten") });
  }
  knoepfe.push({ action: "bereich", label: t("BereichEinstellen") });
  for (const e of erweiterungen) knoepfe.unshift(...(e.knoepfe?.(gefahr) ?? []));
  const zahl = betroffene(gefahr).length;
  const Dialog = foundry.applications.api.DialogV2;
  const wahl = await Dialog.wait({
    window: { title: `${gefahr.name}${entschaerft(gefahr) ? ` (${t("IstEntschaerft")})` : ""}` },
    content: `<p>${t("AufDemFeld", { anzahl: zahl })}</p><p>${t("Bereich.Stand", { ausloeser: fussWert(gefahr, "ausloeser") ?? 0, wirkung: wirkungFuss(gefahr) ?? 0 })}</p>`,
    buttons: knoepfe,
    rejectClose: false
  });
  if (!wahl) return;
  for (const e of erweiterungen) if (await e.handeln?.(gefahr, wahl)) return;
  if (wahl === "fern") return fernAusloesen(gefahr);
  if (wahl === "bereich") return bereichEinstellen(gefahr);
  if (wahl === "aufdecken") return aufdecken(gefahr);
  if (wahl === "entschaerfen") return entschaerfenAnbieten(gefahr);
  if (String(wahl).startsWith("item:")) return ausloesen(gefahr, gefahr.actor.items.get(String(wahl).slice(5)));
}

function knopfEinsetzen(_anwendung, wurzel, daten) {
  const element = typeof wurzel?.querySelector === "function" ? wurzel : wurzel?.[0];
  const dokument = globalThis.canvas?.scene?.tokens?.get?.(daten?._id ?? "");
  if (!element || !dokument) return;
  if (!istGefahr(dokument)) {
    fallenDarunterEinsetzen(element, dokument);
    return;
  }
  // Einfache Gefahren brauchen "Kampf beitreten" nicht (0.3.2, 25.10.2026), für alle, die das HUD
  // sehen. Komplexe würfeln nach den Regeln Initiative und behalten den Knopf.
  if (!dokument.actor?.system?.details?.isComplex) element.querySelector('[data-action="combat"]')?.remove();
  if (!game.user?.isGM) return;
  const spalte = element.querySelector(".col.right") ?? element.querySelector(".col.left");
  if (!spalte || spalte.querySelector(`[data-action="${MODUL}-gefahr"]`)) return;
  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.className = "control-icon";
  knopf.dataset.action = `${MODUL}-gefahr`;
  knopf.dataset.tooltip = t("Knopf");
  knopf.innerHTML = `<i class="fa-solid fa-skull-crossbones"></i>`;
  knopf.addEventListener("click", (ereignis) => {
    ereignis.preventDefault();
    ereignis.stopPropagation();
    void menue(dokument).catch((fehler) => console.error(`[${MODUL}] Gefahr`, fehler));
  });
  spalte.append(knopf);
}

/*
 * Totenkopf auch am Token darüber (0.11.0, 12.11.2026: Eine Schlossfalle lag unter der Schatzkiste und war
 * kaum zu erreichen; gewählt: "ja, auch am Token darüber"). Steht ein anderer Token auf einem Feld einer Gefahr,
 * zeigt sein HUD der Spielleitung je Gefahr einen Totenkopf mit deren Menü.
 */
export function fallenDarunter(dokument) {
  const eigene = felderVon(dokument);
  return Array.from(dokument?.parent?.tokens ?? []).filter((gefahr) => gefahr.id !== dokument.id && istGefahr(gefahr)
    && [...felderVon(gefahr)].some((f) => eigene.has(f)));
}

function fallenDarunterEinsetzen(element, dokument) {
  if (!game.user?.isGM) return;
  const spalte = element.querySelector(".col.right") ?? element.querySelector(".col.left");
  if (!spalte || spalte.querySelector(`[data-action="${MODUL}-gefahr-darunter"]`)) return;
  for (const gefahr of fallenDarunter(dokument)) {
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "control-icon";
    knopf.dataset.action = `${MODUL}-gefahr-darunter`;
    knopf.dataset.tooltip = t("KnopfDarunter", { name: gefahr.name });
    knopf.innerHTML = `<i class="fa-solid fa-skull-crossbones"></i>`;
    knopf.addEventListener("click", (ereignis) => {
      ereignis.preventDefault();
      ereignis.stopPropagation();
      void menue(gefahr).catch((fehler) => console.error(`[${MODUL}] Gefahr`, fehler));
    });
    spalte.append(knopf);
  }
}

/* ---------------------------------------------------------------- Anmelden */

export function einstellungenAnmelden() {
  game.settings.register(MODUL, "magieAufdecken", {
    name: "GELAENDEPINSEL.Gefahr.Einstellung.Magie.Name",
    hint: "GELAENDEPINSEL.Gefahr.Einstellung.Magie.Hinweis",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}

export function anmelden() {
  Hooks.on("renderTokenHUD", knopfEinsetzen);
  Hooks.on("renderChatMessageHTML", (nachricht, element) => kritKnoepfeEinsetzen(nachricht, element));
  Hooks.on("createChatMessage", (nachricht) => {
    if (!istAktiveSpielleitung()) return;
    const kontext = nachricht.flags?.pf2e?.context ?? null;
    const kennung = kennungLesen(kontext?.options);
    const weiter = (versprechen) => void versprechen.catch((fehler) => console.error(`[${MODUL}] Gefahr`, fehler));
    if (kennung?.art === "falle" && kontext?.outcome) {
      // Die äußere Veränderung (0.4.0) kommt auch, wenn der Schadenswurf scheitert.
      const schaden = nachRettungswurf(kennung, kontext.outcome, nachricht).catch((fehler) => console.error(`[${MODUL}] Gefahr`, fehler));
      return weiter(schaden.then(() => nachWurfMelden(kennung, kontext.outcome)));
    }
    if (kennung?.art === "entschaerfen" && kontext?.outcome) return weiter(nachEntschaerfen(kennung, kontext.outcome, nachricht));
    if (kontext?.type === "perception-check" && (kontext.options ?? []).includes("action:seek")) return weiter(nachSuchen(nachricht));
    if (!kontext && nachricht.item?.type === "spell" && nachricht.item?.slug === "detect-magic") return weiter(nachMagieEntdecken(nachricht));
  });
}
