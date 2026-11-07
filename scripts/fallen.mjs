// Eigene Fallen (0.4.0, 06.11.2026: "wir packen die nicht in die Kompendien, sondern bauen uns einen Button
// unter den Modul-Button, der das Geländepinsel-Menü aufmacht"; "Grafiken kann dann jeder ohnehin zuweisen").
//
// Der Knopf "Fallen" oben in der Leiste öffnet eine Auswahl nach Stufe und Ort. Eine Falle wird per Ziehen und
// Ablegen auf die Karte gesetzt, versteckt (0.4.2, 06.11.2026: "die Fallen gern nicht mit Setzen aufs Spielfeld,
// weil da sonst, sobald man mit der Maus arbeitet, Gelände gemalt wird, sondern per Drag and Drop, und es malt oder
// löscht da gerade kein Gelände"). Das Menü bleibt offen, mehrere Fallen hintereinander gehen. Ihr Akteur entsteht beim ersten Setzen in einem eigenen Ordner der
// Welt und wird danach wiederverwendet; ein Bild, das die SL ihm gibt, bleibt erhalten. Ausgelöst wird wie bei jeder
// Gefahr über die Gefahren-Karte (gefahren.mjs), dazu:
// - Türfallen beim Öffnen der Tür, an der sie gesetzt wurden;
// - Schlossfallen am Knopf "Öffnen / Schloss knacken" im Totenkopf-Menü der Falle (gewählt: "Knopf am
//   Fallen-Token"), gegen die Kreatur neben dem Schloss;
// - herbeirufende Fallen setzen die Kreatur, die die SL beim Setzen gewählt hat, und lassen sie Initiative würfeln
//   (Wunsch: "beschwört damit einen übermächtigen Gegner", "Gegner Stufe 8");
// - äußere Veränderung (Wunsch: "teilweise können wir auch Charaktere äußerlich verändern") beim kritischen
//   Fehlschlag als PF2e-Effekt; die Tönung des Tokens kommt aus PF2es Regel TokenImage und geht mit dem Effekt.
//   Seit 0.5.0 auch beim kritischen Treffer einer Angriffsfalle;
// - lange Zustände (0.5.0, 06.11.2026: "arbeite mehr mit Zuständen, die länger andauern, blind für 28 Stunden
//   oder versteinert"): 24 Stunden oder 1 Woche, als PF2e-Effekt, der den Zustand trägt und mit der Spielzeit abläuft.
import { DATEN_STAND, FALLEN } from "./fallen-daten.mjs";
import { akteurDaten, klartext, langeZustaende, sprache, zustandEffekt } from "./fallen-logik.mjs";
import { ausloeseAktion } from "./gefahren-logik.mjs";
import * as gefahren from "./gefahren.mjs";

const MODUL = "gelaendepinsel";
const BILD = "systems/pf2e/icons/default-icons/hazard.svg";
const ARTEN = ["tuer", "schloss", "gelaende", "raum"];
// Höchste Stufe des herbeigerufenen Gegners steht an der Falle (Stufe 5: 8, Stufe 6: 9, Stufe 7: 10, Stufe 8: 11); 8 nur als
// Rückfall.
const STUFE_GEGNER = 8;
const gegnerGrenze = (falle) => Number(falle?.beschwoerung?.stufe) || STUFE_GEGNER;

const t = (schluessel, daten) => (daten ? game.i18n.format(`GELAENDEPINSEL.Fallen.${schluessel}`, daten) : game.i18n.localize(`GELAENDEPINSEL.Fallen.${schluessel}`));
const html = (text) => foundry.utils.escapeHTML?.(String(text ?? "")) ?? String(text ?? "");

function istAktiveSpielleitung() {
  const aktive = game.users?.activeGM ?? null;
  return Boolean(game.user?.isGM) && (!aktive || aktive.id === game.user.id);
}

function nurSpielleitung() {
  return game.users.filter((n) => n.isGM).map((n) => n.id);
}

async function meldung(inhalt, { oeffentlich = false, alias = null } = {}) {
  await ChatMessage.create({
    speaker: { alias: alias ?? game.i18n.localize("GELAENDEPINSEL.Titel") },
    content: inhalt,
    ...(oeffentlich ? {} : { whisper: nurSpielleitung() })
  });
}

const lang = () => sprache(game.i18n?.lang);

/* ---------------------------------------------------------------- Akteure */

async function ordnerHolen() {
  const vorhanden = game.folders.find((f) => f.type === "Actor" && f.getFlag(MODUL, "fallen"));
  if (vorhanden) return vorhanden;
  return Folder.implementation.create({ name: t("Ordner"), type: "Actor", flags: { [MODUL]: { fallen: true } } });
}

/* Der Akteur einer Falle: beim ersten Mal angelegt, bei neuem Datenstand oder anderer Sprache neu befüllt. */
export async function akteurHolen(falle) {
  const s = lang();
  const daten = akteurDaten(falle, s, DATEN_STAND);
  const vorhanden = game.actors.find((a) => a.getFlag(MODUL, "falle")?.id === falle.id);
  if (vorhanden) {
    const alt = vorhanden.getFlag(MODUL, "falle");
    if (alt?.stand !== DATEN_STAND || alt?.sprache !== s) {
      await vorhanden.deleteEmbeddedDocuments("Item", vorhanden.items.map((it) => it.id));
      await vorhanden.update({ name: daten.name, system: daten.system, flags: daten.flags, "prototypeToken.name": daten.name });
      await vorhanden.createEmbeddedDocuments("Item", daten.items);
    }
    return vorhanden;
  }
  const ordner = await ordnerHolen();
  return Actor.implementation.create({
    ...daten,
    img: BILD,
    folder: ordner.id,
    prototypeToken: {
      name: daten.name, actorLink: false, texture: { src: BILD },
      disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE, displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
    }
  });
}

/* ---------------------------------------------------------------- Menü */

export const ZIEH_ART = "GelaendepinselFalle";
let offenesMenue = null;

function eintragHtml(falle, s) {
  const daten = akteurDaten(falle, s, DATEN_STAND);
  const magisch = falle.merkmale.includes("magical");
  const marken = [
    magisch ? `<span class="gp-marke gp-magisch">${t("Magisch")}</span>` : "",
    falle.beschwoerung ? `<span class="gp-marke gp-magisch">${t("RuftGegner", { stufe: falle.beschwoerung.stufe })}</span>` : "",
    falle.aussehen ? `<span class="gp-marke">${t("Veraendert")}</span>` : ""
  ].join("");
  const zeile = t("Zeile", { sg: falle.heimlichkeit, ausloesung: t(`Ausloesung.${daten.flags[MODUL].falle.ausloesung}`), wirkung: falle.wirkung ?? 0 });
  return `<li class="gp-falle" draggable="true" data-falle="${falle.id}"><div class="gp-griff"><i class="fa-solid fa-grip-vertical"></i> <strong>${html(daten.name)}</strong> ${marken}</div>`
    + `<div class="gp-zeile">${html(zeile)}</div>`
    + `<details><summary>${t("Mehr")}</summary><p>${html(falle[s].beschreibung)}</p><p>${html(klartext(daten.items[0].system.description.value, s))}</p>`
    + `<p>${html(klartext(daten.system.details.disable, s))}</p></details></li>`;
}

export async function menueOeffnen() {
  if (!game.user?.isGM) return;
  if (!globalThis.canvas?.scene) {
    ui.notifications.warn(t("KeineSzene"));
    return;
  }
  const s = lang();
  const stufen = [...new Set(FALLEN.map((f) => f.stufe))].sort((a, b) => a - b);
  let inhalt = `<div class="gp-fallen"><p>${t("Hinweis")}</p><div class="form-group"><label>${t("Stufe")}</label>`
    + `<select name="stufe">${stufen.map((st) => `<option value="${st}">${st}</option>`).join("")}</select></div>`;
  for (const st of stufen) {
    inhalt += `<div class="gp-stufe" data-stufe="${st}">`;
    for (const art of ARTEN) {
      const liste = FALLEN.filter((f) => f.stufe === st && f.art === art);
      if (!liste.length) continue;
      inhalt += `<h3>${t(`Art.${art}`)} (${liste.length})</h3><ul>${liste.map((f) => eintragHtml(f, s)).join("")}</ul>`;
    }
    inhalt += `</div>`;
  }
  inhalt += `</div>`;
  if (offenesMenue?.rendered) {
    offenesMenue.bringToFront?.();
    return;
  }
  const Dialog = foundry.applications.api.DialogV2;
  const dialog = new Dialog({
    window: { title: t("Titel"), resizable: true },
    position: { width: 560, height: 680 },
    content: inhalt,
    buttons: [{ action: "schliessen", label: t("Schliessen"), default: true }]
  });
  offenesMenue = dialog;
  await dialog.render({ force: true });
  menueVerdrahten(dialog.element);
}

/* Stufenwahl und Ziehen; getrennt, damit der Rauchtest es ohne Foundry-Fenster prüfen kann. */
export function menueVerdrahten(wurzel) {
  if (!wurzel?.querySelector) return;
  const wahl = wurzel.querySelector('select[name="stufe"]');
  const zeigen = () => wurzel.querySelectorAll(".gp-stufe").forEach((el) => { el.hidden = el.dataset.stufe !== wahl.value; });
  wahl?.addEventListener("change", zeigen);
  if (wahl) zeigen();
  for (const eintrag of wurzel.querySelectorAll(".gp-falle[data-falle]")) {
    eintrag.addEventListener("dragstart", (ereignis) => {
      ereignis.dataTransfer?.setData("text/plain", JSON.stringify({ type: ZIEH_ART, id: eintrag.dataset.falle }));
    });
  }
}

/* ---------------------------------------------------------------- Setzen */

function abstandZuStrecke(p, [x1, y1, x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  const u = Math.max(0, Math.min(1, ((p.x - x1) * dx + (p.y - y1) * dy) / l2));
  return Math.hypot(p.x - (x1 + u * dx), p.y - (y1 + u * dy));
}

/* Die nächste Tür bis anderthalb Felder um den Punkt. */
export function naechsteTuer(szene, punkt, groesse) {
  let beste = null;
  let weite = Infinity;
  for (const wand of szene?.walls ?? []) {
    if (!wand.door) continue;
    const d = abstandZuStrecke(punkt, wand.c);
    if (d < weite) { weite = d; beste = wand; }
  }
  return weite <= groesse * 1.5 ? beste : null;
}

/* Abgelegt auf der Karte (dropCanvasData): die Falle an dieser Stelle versteckt setzen. */
export async function fallenAbwurf(daten) {
  const szene = canvas.scene;
  const falle = FALLEN.find((f) => f.id === daten?.id);
  if (!falle || !szene) return false;
  const punkt = { x: Number(daten.x) || 0, y: Number(daten.y) || 0 };
  const groesse = Number(canvas.grid?.size) || 100;
  let tuer = null;
  if (falle.art === "tuer") {
    tuer = naechsteTuer(szene, punkt, groesse);
    if (!tuer) {
      ui.notifications.warn(t("KeineTuer"));
      return false;
    }
  }
  let kreatur = null;
  if (falle.beschwoerung) {
    kreatur = await kreaturWaehlenDialog(null, gegnerGrenze(falle));
    if (kreatur === undefined) return false;
  }
  const ecke = canvas.grid.getTopLeftPoint?.(punkt) ?? { x: Math.floor(punkt.x / groesse) * groesse, y: Math.floor(punkt.y / groesse) * groesse };
  const akteur = await akteurHolen(falle);
  const token = await akteur.getTokenDocument({ x: ecke.x, y: ecke.y, hidden: true });
  const tokenDaten = token.toObject();
  foundry.utils.setProperty(tokenDaten, `flags.${MODUL}.tuer`, tuer?.id ?? null);
  foundry.utils.setProperty(tokenDaten, `flags.${MODUL}.kreatur`, kreatur ?? null);
  await szene.createEmbeddedDocuments("Token", [tokenDaten]);
  ui.notifications.info(t("Gesetzt", { name: akteur.name }));
  return true;
}

/* ---------------------------------------------------------------- Kreatur wählen */

/* Fragt nach einer Kreatur (aus der Welt oder einem Kompendium hineinziehen). undefined = abgebrochen. */
async function kreaturWaehlenDialog(vorher, grenze = STUFE_GEGNER) {
  const Editor = foundry.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
  let uuid = vorher ?? null;
  const name = async (u) => {
    const a = u ? await fromUuid(u) : null;
    return a ? `${a.name} (${t("StufeN", { stufe: a.level ?? a.system?.details?.level?.value ?? "?" })})` : t("KreaturOhne");
  };
  const anfang = await name(uuid);
  const ergebnis = await foundry.applications.api.DialogV2.wait({
    window: { title: t("KreaturTitel") },
    content: `<p>${t("KreaturHinweis", { stufe: grenze })}</p><div class="gp-ablage">${html(anfang)}</div>`,
    buttons: [
      { action: "ok", label: t("KreaturUebernehmen"), default: true, callback: () => ({ uuid }) },
      { action: "ohne", label: t("KreaturSpaeter"), callback: () => ({ uuid: null }) }
    ],
    render: (_ereignis, dialog) => {
      const wurzel = dialog.element ?? dialog;
      const ablage = wurzel.querySelector?.(".gp-ablage");
      if (!ablage) return;
      ablage.addEventListener("dragover", (e) => e.preventDefault());
      ablage.addEventListener("drop", async (e) => {
        e.preventDefault();
        const daten = Editor.getDragEventData(e);
        if (daten?.type !== "Actor" || !daten.uuid) return;
        const a = await fromUuid(daten.uuid);
        if (!a) return;
        const stufe = Number(a.level ?? a.system?.details?.level?.value);
        if (stufe > grenze) ui.notifications.warn(t("KreaturZuHoch", { name: a.name, stufe, grenze }));
        uuid = daten.uuid;
        ablage.textContent = await name(uuid);
      });
    },
    rejectClose: false
  });
  return ergebnis ? ergebnis.uuid : undefined;
}

/* ---------------------------------------------------------------- Auslösen */

const entschaerft = (gefahr) => Boolean(gefahr?.getFlag?.(MODUL, "entschaerft"));

function mitte(dokument) {
  const g = Number(canvas?.grid?.size) || 100;
  return { x: Number(dokument.x) + (Number(dokument.width) || 1) * g / 2, y: Number(dokument.y) + (Number(dokument.height) || 1) * g / 2 };
}

/* Wer die Tür geöffnet hat: die nächste Kreatur bis zwei Felder an der Tür, Figuren des öffnenden Spielers zuerst. */
export function oeffnerFinden(szene, wand, nutzerId, groesse) {
  const nutzer = game.users?.get?.(nutzerId);
  const nahe = Array.from(szene.tokens ?? [])
    .filter((tk) => tk.actor?.isOfType?.("creature"))
    .map((tk) => ({ tk, d: abstandZuStrecke(mitte(tk), wand.c) }))
    .filter((e) => e.d <= groesse * 2)
    .sort((a, b) => a.d - b.d);
  const eigene = nutzer && !nutzer.isGM ? nahe.find((e) => e.tk.actor?.testUserPermission?.(nutzer, "OWNER")) : null;
  return (eigene ?? nahe[0])?.tk ?? null;
}

async function tuerAusloesen(gefahr, wand, nutzerId) {
  const von = oeffnerFinden(gefahr.parent, wand, nutzerId, Number(canvas?.grid?.size) || 100);
  await gefahren.aufdecken(gefahr, von ? t("DurchTuer", { name: von.name }) : "");
  const item = ausloeseAktion(Array.from(gefahr.actor?.items ?? []));
  await gefahren.ausloesen(gefahr, item, gefahren.mitAusloeser(gefahren.betroffene(gefahr), von));
}

async function schlossOeffnen(gefahr) {
  const neben = Array.from(gefahr.parent?.tokens ?? []).filter((tk) => tk.id !== gefahr.id
    && tk.actor?.isOfType?.("creature") && gefahren.nebenGefahr(tk, gefahr));
  if (!neben.length) {
    ui.notifications.warn(t("NiemandAmSchloss"));
    return;
  }
  let von = neben[0];
  if (neben.length > 1) {
    const id = await foundry.applications.api.DialogV2.wait({
      window: { title: t("WerOeffnet") },
      content: `<p>${t("WerOeffnet")}</p>`,
      buttons: neben.map((tk) => ({ action: tk.id, label: tk.name })),
      rejectClose: false
    });
    von = neben.find((tk) => tk.id === id);
    if (!von) return;
  }
  if (gefahr.hidden) await gefahren.aufdecken(gefahr, t("DurchSchloss", { name: von.name }));
  const item = ausloeseAktion(Array.from(gefahr.actor?.items ?? []));
  await gefahren.ausloesen(gefahr, item, gefahren.mitAusloeser(gefahren.betroffene(gefahr), von));
}

/* ---------------------------------------------------------------- Herbeirufen */

function feldBelegt(szene, x, y, groesse) {
  return Array.from(szene.tokens ?? []).some((tk) => {
    const b = (Number(tk.width) || 1) * groesse;
    const h = (Number(tk.height) || 1) * groesse;
    return x + 1 > tk.x && x + 1 < tk.x + b && y + 1 > tk.y && y + 1 < tk.y + h && !gefahren.istGefahr(tk);
  });
}

/* Ein freies Feld neben der Falle, ohne Wand dazwischen; sonst ihr eigenes Feld. */
function freiesFeld(gefahr, ort) {
  const g = Number(canvas?.grid?.size) || 100;
  if (ort === "falle") return { x: gefahr.x, y: gefahr.y };
  const von = mitte(gefahr);
  for (const ring of [1, 2]) {
    for (let dz = -ring; dz <= ring; dz += 1) {
      for (let ds = -ring; ds <= ring; ds += 1) {
        if (Math.max(Math.abs(ds), Math.abs(dz)) !== ring) continue;
        const x = gefahr.x + ds * g;
        const y = gefahr.y + dz * g;
        if (feldBelegt(gefahr.parent, x, y, g)) continue;
        if (!gefahren.linieFrei(gefahr, von, { x: x + g / 2, y: y + g / 2 })) continue;
        return { x, y };
      }
    }
  }
  return { x: gefahr.x, y: gefahr.y };
}

async function kreaturAkteur(uuid) {
  const quelle = await fromUuid(uuid);
  if (!quelle) return null;
  if (!quelle.pack) return quelle;
  const geholt = game.actors.find((a) => a._stats?.compendiumSource === uuid || a.getFlag?.("core", "sourceId") === uuid);
  if (geholt) return geholt;
  const ordner = await ordnerHolen();
  return game.actors.importFromCompendium(game.packs.get(quelle.pack), quelle.id, { folder: ordner.id });
}

async function herbeirufen(gefahr, falle, ziele) {
  const uuid = gefahr.getFlag(MODUL, "kreatur");
  if (!uuid) {
    await meldung(`<p>${t("KeineKreatur", { falle: `<strong>${html(gefahr.name)}</strong>` })}</p>`);
    return;
  }
  const akteur = await kreaturAkteur(uuid);
  if (!akteur) {
    await meldung(`<p>${t("KreaturFehlt", { falle: `<strong>${html(gefahr.name)}</strong>` })}</p>`);
    return;
  }
  const szene = gefahr.parent;
  const feld = freiesFeld(gefahr, falle.beschwoerung.ort);
  const token = await akteur.getTokenDocument({ x: feld.x, y: feld.y, hidden: false });
  const daten = token.toObject();
  daten.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
  foundry.utils.setProperty(daten, `flags.${MODUL}.herbeigerufen`, gefahr.id);
  const [neu] = await szene.createEmbeddedDocuments("Token", [daten]);
  let kampf = game.combats.find((c) => c.scene?.id === szene.id && c.active) ?? game.combats.find((c) => c.scene?.id === szene.id);
  if (!kampf) kampf = await Combat.implementation.create({ scene: szene.id, active: true });
  const drin = new Set(kampf.combatants.map((c) => c.tokenId));
  const neue = [neu, ...ziele].filter((tk) => tk && !drin.has(tk.id))
    .map((tk) => ({ tokenId: tk.id, sceneId: szene.id, actorId: tk.actorId, hidden: false }));
  if (neue.length) await kampf.createEmbeddedDocuments("Combatant", neue);
  const kaempfer = kampf.combatants.find((c) => c.tokenId === neu.id);
  if (kaempfer) await kampf.rollInitiative([kaempfer.id]);
  if (falle.beschwoerung.runden) {
    await neu.setFlag(MODUL, "verschwindet", { kampf: kampf.id, runde: Math.max(1, Number(kampf.round) || 0) + falle.beschwoerung.runden });
  }
  await meldung(`<p>${t("Herbeigerufen", { kreatur: `<strong>${html(neu.name)}</strong>`, falle: html(gefahr.name), ziel: html(ziele[0]?.name ?? "-") })}</p>`, { oeffentlich: true, alias: gefahr.name });
}

/* Nach 1 Minute (10 Runden) verschwindet die herbeigerufene Kreatur wieder. */
async function rundeVorbei(kampf) {
  const szene = kampf.scene;
  if (!szene) return;
  for (const tk of Array.from(szene.tokens)) {
    const v = tk.getFlag(MODUL, "verschwindet");
    if (!v || v.kampf !== kampf.id || Number(kampf.round) < v.runde) continue;
    const kaempfer = kampf.combatants.filter((c) => c.tokenId === tk.id).map((c) => c.id);
    if (kaempfer.length) await kampf.deleteEmbeddedDocuments("Combatant", kaempfer);
    await meldung(`<p>${t("Verschwindet", { name: `<strong>${html(tk.name)}</strong>` })}</p>`, { oeffentlich: true });
    await tk.delete();
  }
}

/* ---------------------------------------------------------------- Äußere Veränderung */

export function aussehenEffekt(aussehen, falleId, bild, stufe = 5) {
  const dauer = aussehen.dauer
    ? { value: aussehen.dauer.value, unit: aussehen.dauer.unit, expiry: "turn-start", sustained: false }
    : { value: -1, unit: "unlimited", expiry: null, sustained: false };
  return {
    type: "effect", name: aussehen.name, img: "systems/pf2e/icons/default-icons/effect.svg",
    system: {
      description: { value: `<p>${html(aussehen.text)}</p>` }, duration: dauer, level: { value: stufe }, tokenIcon: { show: true },
      rules: aussehen.toenung && bild ? [{ key: "TokenImage", value: bild, tint: aussehen.toenung }] : []
    },
    flags: { [MODUL]: { aussehen: falleId } }
  };
}

async function aussehenAnwenden(gefahr, falle, ziel) {
  const akteur = ziel.actor;
  if (!akteur || !falle.aussehen) return;
  if (akteur.items.some((it) => it.getFlag?.(MODUL, "aussehen") === falle.id)) return;
  await akteur.createEmbeddedDocuments("Item", [aussehenEffekt(falle.aussehen, falle.id, ziel.texture?.src ?? null, falle.stufe ?? 5)]);
  await meldung(`<p>${t("Aussehen", { name: `<strong>${html(ziel.name)}</strong>`, fluch: html(falle.aussehen.name) })}</p>`, { alias: gefahr.name });
}

/* ---------------------------------------------------------------- Lange Zustände */

/*
 * Setzt die langen Zustände der Falle für dieses Ergebnis als PF2e-Effekte. Hat die Figur denselben Zustand von
 * derselben Falle schon, wird er nicht doppelt gesetzt, sondern seine Laufzeit beginnt neu.
 */
async function langzeitAnwenden(gefahr, falleFlagge, ziel, ergebnis) {
  const akteur = ziel.actor;
  const falle = FALLEN.find((f) => f.id === falleFlagge?.id);
  if (!akteur || !falle) return;
  const liste = langeZustaende(falle, ergebnis);
  if (!liste.length) return;
  const s = sprache(falleFlagge.sprache ?? game.i18n?.lang);
  const neu = [];
  const erneuern = [];
  for (const z of liste) {
    const daten = zustandEffekt(z, falle, s);
    const alt = akteur.items.find((it) => {
      const lz = it.getFlag?.(MODUL, "langzeit");
      return lz?.falle === falle.id && lz?.zustand === z.z;
    });
    if (alt) erneuern.push({ _id: alt.id, name: daten.name, "system.duration": daten.system.duration, "system.rules": daten.system.rules, "system.start": { value: game.time?.worldTime ?? 0 } });
    else neu.push(daten);
  }
  if (neu.length) await akteur.createEmbeddedDocuments("Item", neu);
  if (erneuern.length) await akteur.updateEmbeddedDocuments("Item", erneuern);
  const namen = [...neu, ...erneuern].map((e) => html(e.name)).join(", ");
  await meldung(`<p>${t("Langzeit", { name: `<strong>${html(ziel.name)}</strong>`, liste: namen })}</p>`, { alias: gefahr.name });
}

/* ---------------------------------------------------------------- Anmelden */

export function anmelden() {
  gefahren.erweitern({
    knoepfe(gefahr) {
      const falle = gefahren.falleVon(gefahr);
      if (!falle) return [];
      const knoepfe = [];
      if (falle.ausloesung === "knopf" && !entschaerft(gefahr)) knoepfe.push({ action: "gp-schloss", label: t("SchlossOeffnen") });
      if (falle.beschwoerung) knoepfe.push({ action: "gp-kreatur", label: t("KreaturWaehlen") });
      return knoepfe;
    },
    async handeln(gefahr, wahl) {
      if (wahl === "gp-schloss") { await schlossOeffnen(gefahr); return true; }
      if (wahl === "gp-kreatur") {
        const uuid = await kreaturWaehlenDialog(gefahr.getFlag(MODUL, "kreatur"), gegnerGrenze(gefahren.falleVon(gefahr)));
        if (uuid !== undefined) await gefahr.setFlag(MODUL, "kreatur", uuid);
        return true;
      }
      return false;
    },
    async nachAusloesen(gefahr, _item, ziele) {
      const falle = gefahren.falleVon(gefahr);
      if (falle?.beschwoerung) await herbeirufen(gefahr, falle, ziele);
    },
    async nachWurf(gefahr, ziel, grad) {
      const falle = gefahren.falleVon(gefahr);
      if (!falle) return;
      await langzeitAnwenden(gefahr, falle, ziel, grad);
      if ((grad === "criticalFailure" || grad === "criticalHit") && falle.aussehen) await aussehenAnwenden(gefahr, falle, ziel);
    }
  });
  // Ablegen auf der Karte, egal welche Ebene aktiv ist; false hält Foundrys eigene Behandlung an.
  Hooks.on("dropCanvasData", (_canvas, daten) => {
    if (daten?.type !== ZIEH_ART) return;
    if (game.user?.isGM) void fallenAbwurf(daten).catch((fehler) => console.error(`[${MODUL}] Falle setzen`, fehler));
    return false;
  });
  Hooks.on("updateWall", (wand, aenderung, _optionen, nutzerId) => {
    if (!istAktiveSpielleitung() || aenderung?.ds !== CONST.WALL_DOOR_STATES.OPEN) return;
    for (const gefahr of Array.from(wand.parent?.tokens ?? [])) {
      if (gefahr.getFlag(MODUL, "tuer") !== wand.id || !gefahr.hidden || entschaerft(gefahr)) continue;
      void tuerAusloesen(gefahr, wand, nutzerId).catch((fehler) => console.error(`[${MODUL}] Türfalle`, fehler));
    }
  });
  Hooks.on("updateCombat", (kampf, aenderung) => {
    if (!istAktiveSpielleitung() || !("round" in (aenderung ?? {}))) return;
    void rundeVorbei(kampf).catch((fehler) => console.error(`[${MODUL}] Herbeirufen`, fehler));
  });
}
