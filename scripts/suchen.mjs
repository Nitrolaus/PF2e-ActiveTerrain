// Suchen am Token (0.3.4, 25.10.2026: "wie man es einschaltet ist blöd, wir machen da einen weiteren Button
// am Token, der wenn aktiv ... über dem Token Augen, die links rechts schauen oder blinzeln").
//
// Ein Knopf im Token-HUD schaltet die PF2e-Erkundung "Suchen" des Charakters um, so wie der Bogen es tut
// (system.exploration). Fehlt die Aktion am Charakter, holt der Knopf sie aus dem PF2e-Kompendium. Suchen
// dauert 10 Minuten Spielzeit (Hausregel, gemeldet: "wir nehmen 10 min als Hausregel"), und die Spielzeit läuft
// dabei (Wunsch: "Spielzeit, die aber auch laufen muss, also gestartet, wenn jemand Suchen beginnt"): Die aktive
// Spielleitung stellt die Weltzeit alle 6 Sekunden um 6 Sekunden weiter, solange jemand sucht, das Spiel
// nicht pausiert ist und kein Kampf läuft. Über dem Token blicken Zeichentrick-Augen nach links und rechts
// und blinzeln, für alle sichtbar; im Kampf ruhen Uhr und Augen.
import { augenStand, restMinuten, wegSekunden } from "./suchen-logik.mjs";

const MODUL = "gelaendepinsel";
export const DAUER = 600;
const TAKT = 6;
const KOMPENDIUM = "pf2e.actionspf2e";
// Die Aktion Suchen (Search) im PF2e-Kompendium; sonst über ihr Kennwort search.
const SUCHEN_ID = "TiNDYUGlMmxzxBYU";

const text = (schluessel, daten) => (daten ? game.i18n.format(schluessel, daten) : game.i18n.localize(schluessel));

function istAktiveSpielleitung() {
  const aktive = game.users?.activeGM ?? null;
  return Boolean(game.user?.isGM) && (!aktive || aktive.id === game.user.id);
}

const imKampf = () => Boolean(game.combat?.started);
const jetzt = () => Number(game.time?.worldTime ?? 0);

/* Erkundung "Suchen": wer sie im Erkunden gewählt hat (nur Charaktere). */
export function suchtGerade(actor) {
  if (!actor?.isOfType?.("character")) return false;
  return (actor.system?.exploration ?? []).some((id) => actor.items.get(id)?.slug === "search");
}

function suchenItem(actor) {
  return Array.from(actor.items ?? []).find((it) => it.type === "action" && it.slug === "search") ?? null;
}

async function suchenAnlegen(actor) {
  const pack = game.packs?.get?.(KOMPENDIUM);
  if (!pack) return null;
  let quelle = await pack.getDocument(SUCHEN_ID);
  if (!quelle) {
    const index = await pack.getIndex({ fields: ["system.slug"] });
    const eintrag = Array.from(index ?? []).find((e) => e.system?.slug === "search");
    quelle = eintrag ? await pack.getDocument(eintrag._id) : null;
  }
  if (!quelle) return null;
  const daten = typeof game.items?.fromCompendium === "function" ? game.items.fromCompendium(quelle) : quelle.toObject();
  const [neu] = await actor.createEmbeddedDocuments("Item", [daten]);
  return neu ?? null;
}

/* Wie der Knopf im Bogen: Suchen in die Liste der Erkundung oder heraus. */
export async function umschalten(actor) {
  const liste = (actor.system?.exploration ?? []).filter((id) => actor.items.has(id));
  const vorhanden = suchenItem(actor);
  if (vorhanden && liste.includes(vorhanden.id)) {
    await actor.update({ "system.exploration": liste.filter((id) => id !== vorhanden.id) });
    return false;
  }
  const item = vorhanden ?? await suchenAnlegen(actor);
  if (!item) {
    ui.notifications?.warn?.(text("GELAENDEPINSEL.Suchen.Fehlt"));
    return false;
  }
  await actor.update({ "system.exploration": [...liste, item.id] });
  return true;
}

/* ---------------------------------------------------------------- Zeit */

/* Aktive SL: Beginn merken (Flagge sucheBis), nach Ablauf ausschalten, nach dem Ausschalten aufräumen. */
async function zeitPruefen(actor) {
  if (!actor?.isOfType?.("character")) return;
  const bis = actor.getFlag(MODUL, "sucheBis");
  const an = suchtGerade(actor);
  if (an && typeof bis !== "number") await actor.setFlag(MODUL, "sucheBis", jetzt() + DAUER);
  else if (an && bis <= jetzt()) {
    const item = suchenItem(actor);
    await actor.update({ "system.exploration": (actor.system.exploration ?? []).filter((id) => id !== item?.id) });
  } else if (!an && bis !== undefined && bis !== null) await actor.unsetFlag(MODUL, "sucheBis");
}

function alleZeitPruefen() {
  if (!istAktiveSpielleitung()) return;
  for (const actor of game.actors ?? []) void zeitPruefen(actor).catch((fehler) => console.error(`[${MODUL}] Suchen`, fehler));
}

/* Ein Schlag der Uhr: Weltzeit um 6 Sekunden weiter, solange jemand sucht. */
export function uhrSchlag() {
  if (!istAktiveSpielleitung() || game.paused || imKampf()) return false;
  const laeuft = Array.from(game.actors ?? []).some((actor) => suchtGerade(actor) && Number(actor.getFlag(MODUL, "sucheBis")) > jetzt());
  if (laeuft) void game.time.advance(TAKT);
  return laeuft;
}

/*
 * Der Weg kostet Zeit (0.3.5, 25.10.2026: "ja bau das", zum Text von Absuchen): Jeder Zug eines suchenden
 * Helden stellt die Weltzeit um die Zeit für seinen Weg bei 45 m pro Minute weiter, gemessen wie PF2e über
 * das Raster vom Start über Foundrys Wegpunkte. Gehen mehrere zugleich (Gruppe), vergeht die Zeit einmal,
 * nach dem längsten Weg. Nicht bei Pause, im Kampf oder per Teleport. Vom Pinsel beim Beginn jeder Fahrt
 * gerufen; hält er unterwegs an, zählt trotzdem der ganze geplante Weg.
 */
const SAMMELN_MS = 500;
let wegOffen = 0;
let wegUhr = null;

function wegFuss(start, punkte) {
  const lagen = [start, ...punkte].map((p) => ({ x: Number(p?.x), y: Number(p?.y) }))
    .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (lagen.length < 2) return 0;
  const raster = globalThis.canvas?.grid;
  if (typeof raster?.measurePath === "function") return Number(raster.measurePath(lagen).distance) || 0;
  const g = Number(raster?.size) || 100;
  let fuss = 0;
  for (let i = 1; i < lagen.length; i += 1) {
    fuss += Math.max(Math.abs(lagen[i].x - lagen[i - 1].x), Math.abs(lagen[i].y - lagen[i - 1].y)) / g * (Number(raster?.distance) || 5);
  }
  return fuss;
}

export function wegKostet(dokument, start, optionen, ziel) {
  if (!istAktiveSpielleitung() || game.paused || imKampf() || !suchtGerade(dokument?.actor)) return 0;
  const wegpunkte = optionen?._movement?.[dokument.id]?.passed?.waypoints;
  const aktionen = globalThis.CONFIG?.Token?.movement?.actions ?? {};
  const mitWegpunkten = Array.isArray(wegpunkte) && wegpunkte.length > 0;
  if (mitWegpunkten && wegpunkte.every((punkt) => aktionen[punkt?.action]?.teleport)) return 0;
  const sekunden = wegSekunden(wegFuss(start, mitWegpunkten ? wegpunkte : [ziel]));
  if (!sekunden) return 0;
  wegOffen = Math.max(wegOffen, sekunden);
  if (!wegUhr) {
    wegUhr = setTimeout(() => {
      const offen = wegOffen;
      wegOffen = 0;
      wegUhr = null;
      void game.time?.advance?.(offen);
    }, SAMMELN_MS);
    wegUhr?.unref?.();
  }
  return sekunden;
}

/* ---------------------------------------------------------------- Knopf */

function knopfEinsetzen(anwendung, wurzel, daten) {
  const element = typeof wurzel?.querySelector === "function" ? wurzel : wurzel?.[0];
  const actor = globalThis.canvas?.scene?.tokens?.get?.(daten?._id ?? "")?.actor;
  if (!element || !actor?.isOfType?.("character") || !actor.isOwner) return;
  const spalte = element.querySelector(".col.right") ?? element.querySelector(".col.left");
  if (!spalte || spalte.querySelector(`[data-action="${MODUL}-suchen"]`)) return;
  const an = suchtGerade(actor);
  const bis = actor.getFlag(MODUL, "sucheBis");
  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.className = an ? "control-icon active" : "control-icon";
  knopf.dataset.action = `${MODUL}-suchen`;
  knopf.dataset.tooltip = an
    ? text("GELAENDEPINSEL.Suchen.Ausschalten", { minuten: typeof bis === "number" ? restMinuten(bis, jetzt()) : DAUER / 60 })
    : text("GELAENDEPINSEL.Suchen.Einschalten", { minuten: DAUER / 60 });
  // Lupe statt Auge (0.3.8, 25.10.2026: "es ist das gleiche wie Token unsichtbar machen").
  knopf.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i>`;
  knopf.addEventListener("click", (ereignis) => {
    ereignis.preventDefault();
    ereignis.stopPropagation();
    void umschalten(actor).then(() => anwendung?.render?.()).catch((fehler) => console.error(`[${MODUL}] Suchen`, fehler));
  });
  spalte.append(knopf);
}

/* ---------------------------------------------------------------- Augen */

// Die lebendigen Augen (0.3.7, 25.10.2026: "nehme doch die lebendigen, die du gebaut hast"): je ein
// Mandelauge, 28 breit, oben bis 13 und unten bis 10 gebogen, die beiden berühren sich; braune Iris 6 mit
// Pupille 2,8 und Glanzpunkt, vom Auge beschnitten; kräftige Lidlinie oben; Blick 3,5 zur Seite. Maße im
// Entwurf, dort war der Token 68 breit; hier auf die Feldgröße umgerechnet.
const MASS = Object.freeze({
  token: 68, abstand: 14, halb: 14, oben: 13, unten: 10, iris: 6, irisY: -0.5, pupille: 2.8, glanz: 1.2,
  glanzX: 1.8, glanzY: -1.9, weg: 3.5, rand: 1.6, lid: 2.6, neben: 11
});
// Ein Fünftel davon (0.3.6, 25.10.2026: "die Augen um 80 % kleiner", danach "die Größe passt"), samt Abstand
// und Blick; Rand und Lid bleiben mindestens 1 Pixel breit.
const GROESSE = 0.2;
const WEISS = 0xffffff;
const DUNKEL = 0x2c2c2a;
const IRIS = 0x854f0b;
const augen = new Map();
let tickerAn = false;

const neueApi = (grafik) => typeof grafik.fill === "function";

// Mandelauge um die Mitte (x, 0): von links über den oberen Bogen nach rechts, über den unteren zurück.
function mandel(grafik, x, f) {
  grafik.moveTo(x - MASS.halb * f, 0);
  grafik.quadraticCurveTo(x, -MASS.oben * f, x + MASS.halb * f, 0);
  grafik.quadraticCurveTo(x, MASS.unten * f, x - MASS.halb * f, 0);
  grafik.closePath();
}

function flaeche(grafik, zeichnen, farbe, rand = null) {
  if (neueApi(grafik)) {
    zeichnen();
    grafik.fill({ color: farbe });
    if (rand) grafik.stroke({ color: DUNKEL, width: rand });
    return;
  }
  grafik.lineStyle?.(rand ?? 0, DUNKEL, rand ? 1 : 0);
  grafik.beginFill?.(farbe, 1);
  zeichnen();
  grafik.endFill?.();
}

function kreis(grafik, x, y, r, farbe) {
  if (neueApi(grafik)) {
    grafik.circle(x, y, r).fill({ color: farbe });
    return;
  }
  grafik.beginFill?.(farbe, 1);
  grafik.drawCircle?.(x, y, r);
  grafik.endFill?.();
}

function augenBauen(f) {
  const behaelter = new PIXI.Container();
  behaelter.eventMode = "none";
  const weiss = new PIXI.Graphics();
  const maske = new PIXI.Graphics();
  const pupillen = new PIXI.Graphics();
  const lid = new PIXI.Graphics();
  const rand = Math.max(1, MASS.rand * f);
  const lidBreite = Math.max(1, MASS.lid * f);
  for (const seite of [-1, 1]) {
    const x = seite * MASS.abstand * f;
    flaeche(weiss, () => mandel(weiss, x, f), WEISS, rand);
    flaeche(maske, () => mandel(maske, x, f), WEISS);
    kreis(pupillen, x, MASS.irisY * f, MASS.iris * f, IRIS);
    kreis(pupillen, x, MASS.irisY * f, MASS.pupille * f, DUNKEL);
    kreis(pupillen, x + MASS.glanzX * f, (MASS.irisY + MASS.glanzY) * f, MASS.glanz * f, WEISS);
    // Lidlinie: nur der obere Bogen.
    if (neueApi(lid)) {
      lid.moveTo(x - MASS.halb * f, 0).quadraticCurveTo(x, -MASS.oben * f, x + MASS.halb * f, 0);
      lid.stroke({ color: DUNKEL, width: lidBreite, cap: "round" });
    } else {
      lid.lineStyle?.(lidBreite, DUNKEL, 1);
      lid.moveTo(x - MASS.halb * f, 0);
      lid.quadraticCurveTo(x, -MASS.oben * f, x + MASS.halb * f, 0);
    }
  }
  // Die Iris bleibt im Auge: Die Maske hängt im Behälter, damit sie mitwandert und mitblinzelt.
  pupillen.mask = maske;
  for (const teil of [weiss, maske, pupillen, lid]) behaelter.addChild(teil);
  return { behaelter, pupillen, f };
}

function augenEntfernen(id) {
  const eintrag = augen.get(id);
  if (!eintrag) return;
  augen.delete(id);
  eintrag.behaelter.parent?.removeChild?.(eintrag.behaelter);
  if (!eintrag.behaelter.destroyed) eintrag.behaelter.destroy?.({ children: true });
}

/*
 * Augen rechts neben dem Token, mittig in der Höhe (0.3.7, 25.10.2026: "jetzt sind die Augen tatsächlich bei
 * der Figur an der Stirn"; gewählt: rechts), solange sein Charakter sucht und kein Kampf läuft.
 */
export function augenPruefen(token) {
  const id = token?.id ?? token?.document?.id;
  if (!id) return;
  if (!suchtGerade(token.actor) || imKampf() || typeof token.addChild !== "function") {
    augenEntfernen(id);
    return;
  }
  let eintrag = augen.get(id);
  // Foundry baut den Token beim Neuzeichnen neu auf und wirft dabei seine Kinder weg.
  if (!eintrag || eintrag.behaelter.destroyed || eintrag.behaelter.parent !== token) {
    augenEntfernen(id);
    eintrag = augenBauen((Number(globalThis.canvas?.grid?.size ?? 100) / MASS.token) * GROESSE);
    token.addChild(eintrag.behaelter);
    augen.set(id, eintrag);
  }
  const breite = Number(token.w ?? globalThis.canvas?.grid?.size ?? 100);
  const hoehe = Number(token.h ?? globalThis.canvas?.grid?.size ?? 100);
  eintrag.behaelter.position.set(breite + (MASS.abstand + MASS.halb + MASS.neben) * eintrag.f, hoehe / 2);
}

function alleAugenPruefen() {
  for (const token of globalThis.canvas?.tokens?.placeables ?? []) augenPruefen(token);
}

/* Ein Bild der Augen: alle im selben Takt, 4 Sekunden je Umlauf. */
export function augenBewegen(zeitMs = globalThis.performance?.now?.() ?? Date.now()) {
  const { blick, lid } = augenStand(zeitMs / 4000);
  for (const [id, eintrag] of augen) {
    if (eintrag.behaelter.destroyed) {
      augen.delete(id);
      continue;
    }
    eintrag.pupillen.x = blick * MASS.weg * eintrag.f;
    eintrag.behaelter.scale.y = lid;
  }
}

/* ---------------------------------------------------------------- Anmelden */

export function anmelden() {
  Hooks.on("renderTokenHUD", knopfEinsetzen);
  Hooks.on("refreshToken", (token) => augenPruefen(token));
  Hooks.on("updateActor", (actor) => {
    for (const token of actor.getActiveTokens?.() ?? []) augenPruefen(token);
    if (istAktiveSpielleitung()) void zeitPruefen(actor).catch((fehler) => console.error(`[${MODUL}] Suchen`, fehler));
  });
  for (const name of ["combatStart", "updateCombat", "deleteCombat"]) Hooks.on(name, () => alleAugenPruefen());
  Hooks.on("updateWorldTime", () => alleZeitPruefen());
  Hooks.on("canvasReady", () => {
    for (const id of [...augen.keys()]) augenEntfernen(id);
    alleAugenPruefen();
    if (!tickerAn && globalThis.canvas?.app?.ticker) {
      canvas.app.ticker.add(() => augenBewegen());
      tickerAn = true;
    }
  });
  Hooks.once("ready", () => {
    alleZeitPruefen();
    setInterval(uhrSchlag, TAKT * 1000)?.unref?.();
  });
}
