// Gefahren-Karte (0.3.0, 25.10.2026: "bau das"). Plan und Entscheidungen: GEFAHREN-PLAN.md.
//
// Die Spielleitung platziert Fallen als Gefahren-Token (Akteur vom Typ hazard), meist versteckt. Dieses Teil
// bringt: einen Knopf im Token-HUD (nur SL) mit Auslösen, Aufdecken und Entschärfen; eine Karte mit dem
// verlangten Rettungswurf je Figur im Wirkungsbereich (seit 0.3.10 eine Karte für alle); den Schaden nach dem Wurf; Entschärfen wie "Mechanismus
// ausschalten"; Finden nur über Wahrnehmung (Erkundung "Suchen" automatisch in der Nähe, Aktion "Suchen" im
// Umkreis); "Magie entdecken" nach seinem Wortlaut. Würfeln tut PF2e selbst; das Modul liest die Ergebnisse
// aus den Wurfnachrichten (flags.pf2e.context).
import {
  KENNUNG, RETTUNGSWUERFE, ausloeseAktion, befehle, bereichFuss, entschaerfenSchritt, entschaerfenWuerfe, kennungEntschaerfen,
  kennungFalle, kennungLesen, mindestRang, noetigeErfolge, schadenFuer, textMitOption, textOhneWuerfe, wuerfeFuer
} from "./gefahren-logik.mjs";
import { suchtGerade } from "./suchen.mjs";

const MODUL = "gelaendepinsel";
const SUCHEN_FUSS = 15;
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
// Wandstücke aneinanderstoßen (schräg über die Wand), ginge sonst je nach Rechnung durch.
function linieFrei(gefahr, von, nach) {
  const laenge = Math.hypot(nach.x - von.x, nach.y - von.y) || 1;
  const quer = { x: -(nach.y - von.y) / laenge, y: (nach.x - von.x) / laenge };
  return [-1, 1].every((s) => strahlFrei(gefahr,
    { x: von.x + s * quer.x, y: von.y + s * quer.y }, { x: nach.x + s * quer.x, y: nach.y + s * quer.y }));
}

function strahlFrei(gefahr, von, nach) {
  try {
    const objekt = gefahr?.object;
    if (typeof objekt?.checkCollision === "function") return !objekt.checkCollision(nach, { origin: von, type: "move", mode: "any" });
    const hinter = globalThis.CONFIG?.Canvas?.polygonBackends?.move;
    if (typeof hinter?.testCollision === "function") return !hinter.testCollision(von, nach, { type: "move", mode: "any" });
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

function mitWirkungslinie(gefahr, felder) {
  const eigene = felderVon(gefahr);
  const quellen = [...eigene].map(feldMitte);
  const aus = new Set();
  for (const feld of felder) {
    if (eigene.has(feld)) aus.add(feld);
    else {
      const ziel = feldMitte(feld);
      if (quellen.some((quelle) => linieFrei(gefahr, quelle, ziel))) aus.add(feld);
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
  if (["melee", "ranged"].includes(item.type)) return angreifen(gefahr, item, ziele);
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
    }
  } finally {
    for (const objekt of globalThis.canvas?.tokens?.placeables ?? []) {
      objekt.setTarget?.(vorher.includes(objekt.id), { releaseOthers: false, groupSelection: true });
    }
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
    const ziele = betroffene(gefahr);
    if (!ziele.some((z) => z.id === von.id)) ziele.unshift(von);
    await ausloesen(gefahr, ausloeseAktion(Array.from(gefahr.actor?.items ?? [])), ziele);
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
 * versteckte Falle eine Suchzone, alle Felder bis 15 Fuß um ihren Bereich, und der Pinsel prüft sie Feld für
 * Feld wie eine Fläche. Gewürfelt wird geheim beim Losfahren, damit das Ergebnis am Rand der Zone schon
 * feststeht; je Held und Falle einmal, das Ergebnis steht an der Falle (Flagge suche). Gelingt der Wurf,
 * hält der Held am Rand der Zone, vor der Falle, und sie wird aufgedeckt.
 */
const suchWuerfe = new Map();

function suchErgebnis(gefahr, actor) {
  const grad = gefahr.getFlag?.(MODUL, "suche")?.[actor?.id];
  if (typeof grad === "number") return grad;
  // 0.3.0 bis 0.3.2 merkten nur, wer gewürfelt hatte; ein Fund hätte die Falle aufgedeckt.
  return (gefahr.getFlag?.(MODUL, "gesucht") ?? []).includes(actor?.id) ? 0 : null;
}

/* Die Suchzonen für diese Figur als "suche:<id>" mit ihren Feldern; leer, wenn sie nicht sucht. */
export function suchZonen(dokument) {
  const aus = new Map();
  if (!istAktiveSpielleitung() || game.combat?.started || !suchtGerade(dokument?.actor)) return aus;
  for (const gefahr of dokument.parent?.tokens ?? []) {
    if (!istGefahr(gefahr) || !gefahr.hidden || entschaerft(gefahr)) continue;
    const { dc, rang } = heimlichkeit(gefahr);
    if (dc === null || Number(dokument.actor.perception?.rank ?? 0) < rang) continue;
    const grad = suchErgebnis(gefahr, dokument.actor);
    if (grad !== null && grad < 2) continue;
    // Um den Auslöser (0.3.9): Gefunden heißt, der Held tritt nicht darauf; im Wirkungsradius darf er stehen.
    aus.set(`suche:${gefahr.id}`, umkreis(ausloeseFelder(gefahr), SUCHEN_FUSS));
  }
  return aus;
}

function suchWurf(gefahr, dokument) {
  const schluessel = `${gefahr.id}:${dokument.actor.id}`;
  if (!suchWuerfe.has(schluessel)) {
    const wurf = (async () => {
      const ergebnis = await dokument.actor.perception.roll({
        dc: { value: heimlichkeit(gefahr).dc }, messageMode: "gm", skipDialog: true,
        extraRollOptions: ["action:search", `${KENNUNG}:suche:${gefahr.id}`]
      });
      const grad = Number(ergebnis?.degreeOfSuccess);
      const wert = Number.isFinite(grad) ? grad : 0;
      await gefahr.setFlag(MODUL, "suche", { ...(gefahr.getFlag(MODUL, "suche") ?? {}), [dokument.actor.id]: wert });
      return wert;
    })().catch((fehler) => {
      console.error(`[${MODUL}] Suchen`, fehler);
      return 0;
    });
    suchWuerfe.set(schluessel, wurf);
    void wurf.finally(() => suchWuerfe.delete(schluessel));
  }
  return suchWuerfe.get(schluessel);
}

/* Beim Losfahren: würfeln, wenn der Weg in die Suchzone führt und noch kein Ergebnis da ist. */
export function sucheVorbereiten(dokument, gefahrId) {
  const gefahr = dokument.parent?.tokens?.get?.(gefahrId);
  if (gefahr && suchErgebnis(gefahr, dokument.actor) === null) void suchWurf(gefahr, dokument);
}

/*
 * Am Rand der Suchzone: true, wenn der Held die Falle findet (sie wird aufgedeckt), false, wenn nicht, und
 * ein Versprechen darauf, solange der Wurf noch läuft.
 */
export function sucheErreicht(dokument, gefahrId) {
  const gefahr = dokument.parent?.tokens?.get?.(gefahrId);
  if (!gefahr?.hidden || entschaerft(gefahr) || !istAktiveSpielleitung()) return false;
  const finden = () => {
    void aufdecken(gefahr, t("DurchSuchen", { name: dokument.actor?.name ?? dokument.name }))
      .catch((fehler) => console.error(`[${MODUL}] Suchen`, fehler));
    return true;
  };
  const grad = suchErgebnis(gefahr, dokument.actor);
  if (grad !== null) return grad >= 2 && finden();
  return suchWurf(gefahr, dokument).then((wert) => wert >= 2 && Boolean(gefahr.hidden) && finden());
}

/* ---------------------------------------------------------------- Magie entdecken */

/*
 * Nach dem Wortlaut (PF2e spells-srd, Detect Magic, Ausstrahlung 30 Fuß): Grundform nur, ob Magie da ist;
 * ab Grad 3 die Stufe der stärksten; ab Grad 4 dazu deren Quelle, eingegrenzt auf ein Feld von 5 Fuß, ohne
 * genaue Lage. Die Meldung geht an die Spielleitung. Mit der Einstellung "magieAufdecken" deckt der Zauber
 * versteckte magische Fallen im Bereich auf (25.10.2026, Vorgabe aus).
 */
async function nachMagieEntdecken(nachricht) {
  const actor = nachricht.actor;
  const szene = globalThis.canvas?.scene;
  const von = actor?.getActiveTokens?.(true, true)?.find((tk) => tk.parent?.id === szene?.id);
  if (!von) return;
  const grad = Number(nachricht.flags?.pf2e?.casting?.castRank ?? nachricht.item?.rank ?? 1);
  const magisch = Array.from(szene.tokens).filter((gefahr) => istGefahr(gefahr) && !entschaerft(gefahr)
    && (gefahr.actor?.system?.traits?.value ?? []).includes("magical") && abstandFuss(von, gefahr) <= MAGIE_FUSS);
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
    for (const gefahr of magisch) await aufdecken(gefahr, t("DurchMagie", { name: actor.name }));
  }
}

/* ---------------------------------------------------------------- Über eine versteckte Falle laufen */

/* Vom Pinsel aufgerufen, wenn eine Figur das Feld einer versteckten Falle erreicht (Halt macht er selbst). */
export async function ueberFalle(dokument, gefahrId) {
  const gefahr = dokument.parent?.tokens?.get?.(gefahrId);
  if (!gefahr || !gefahr.hidden || entschaerft(gefahr) || !istAktiveSpielleitung()) return;
  await aufdecken(gefahr, t("DurchBetreten", { name: dokument.name }));
  const ziele = betroffene(gefahr);
  if (!ziele.some((z) => z.id === dokument.id)) ziele.unshift(dokument);
  await ausloesen(gefahr, ausloeseAktion(Array.from(gefahr.actor?.items ?? [])), ziele);
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
  const zahl = betroffene(gefahr).length;
  const Dialog = foundry.applications.api.DialogV2;
  const wahl = await Dialog.wait({
    window: { title: `${gefahr.name}${entschaerft(gefahr) ? ` (${t("IstEntschaerft")})` : ""}` },
    content: `<p>${t("AufDemFeld", { anzahl: zahl })}</p><p>${t("Bereich.Stand", { ausloeser: fussWert(gefahr, "ausloeser") ?? 0, wirkung: wirkungFuss(gefahr) ?? 0 })}</p>`,
    buttons: knoepfe,
    rejectClose: false
  });
  if (!wahl) return;
  if (wahl === "fern") return fernAusloesen(gefahr);
  if (wahl === "bereich") return bereichEinstellen(gefahr);
  if (wahl === "aufdecken") return aufdecken(gefahr);
  if (wahl === "entschaerfen") return entschaerfenAnbieten(gefahr);
  if (String(wahl).startsWith("item:")) return ausloesen(gefahr, gefahr.actor.items.get(String(wahl).slice(5)));
}

function knopfEinsetzen(_anwendung, wurzel, daten) {
  const element = typeof wurzel?.querySelector === "function" ? wurzel : wurzel?.[0];
  const dokument = globalThis.canvas?.scene?.tokens?.get?.(daten?._id ?? "");
  if (!element || !istGefahr(dokument)) return;
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
  Hooks.on("createChatMessage", (nachricht) => {
    if (!istAktiveSpielleitung()) return;
    const kontext = nachricht.flags?.pf2e?.context ?? null;
    const kennung = kennungLesen(kontext?.options);
    const weiter = (versprechen) => void versprechen.catch((fehler) => console.error(`[${MODUL}] Gefahr`, fehler));
    if (kennung?.art === "falle" && kontext?.outcome) return weiter(nachRettungswurf(kennung, kontext.outcome, nachricht));
    if (kennung?.art === "entschaerfen" && kontext?.outcome) return weiter(nachEntschaerfen(kennung, kontext.outcome, nachricht));
    if (kontext?.type === "perception-check" && (kontext.options ?? []).includes("action:seek")) return weiter(nachSuchen(nachricht));
    if (!kontext && nachricht.item?.type === "spell" && nachricht.item?.slug === "detect-magic") return weiter(nachMagieEntdecken(nachricht));
  });
}
