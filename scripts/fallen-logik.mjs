// Eigene Fallen (0.4.0): reine Logik ohne Foundry, geprüft in tests/fallen.test.mjs. Baut aus den Daten in
// fallen-daten.mjs einen PF2e-Gefahren-Akteur in der Sprache der Welt, so wie die Gefahren-Karte ihn liest:
// Auslöse-Reaktion mit @Check und je Erfolgsgrad einem Absatz mit @Damage, Entschärfen mit Übungsgrad in Klammern,
// Heimlichkeit mit Mindestgrad. Zustände als Verweise auf PF2es Zustände, zum Ziehen auf den Token.

const MODUL = "gelaendepinsel";

// Kennungen der Zustände im PF2e-Pack conditionitems (8.6.1, gelesen aus V:/systems/pf2e/packs/conditions).
export const ZUSTAENDE = Object.freeze({
  blinded: ["XgEqL1kFApUbl5Z2", "Blind", "Blinded"],
  clumsy: ["i3OJZU2nk64Df3xm", "Unbeholfen", "Clumsy"],
  dazzled: ["TkIyaNPgTZFBCCuh", "Geblendet", "Dazzled"],
  deafened: ["9PR9y0bi4JPKnHPR", "Taub", "Deafened"],
  drained: ["4D2KBtexWXa6oUMR", "Ausgelaugt", "Drained"],
  enfeebled: ["MIRkyAjyBeXivMa7", "Kraftlos", "Enfeebled"],
  fleeing: ["sDPxOjQ9kx2RZE8D", "Fliehend", "Fleeing"],
  frightened: ["TBSHQspnbcqxsmjL", "Verängstigt", "Frightened"],
  immobilized: ["eIcWbB5o3pP6OIMe", "Bewegungsunfähig", "Immobilized"],
  "off-guard": ["AJh5ex99aV6VTggg", "Auf dem Falschen Fuß", "Off-Guard"],
  paralyzed: ["6uEgoh53GbXuHpTF", "Gelähmt", "Paralyzed"],
  prone: ["j91X7x0XSomq8d60", "Liegend", "Prone"],
  restrained: ["VcDeM8A5oI6VqhbM", "Gebunden", "Restrained"],
  sickened: ["fesd1n5eVhpCSS18", "Kränkelnd", "Sickened"],
  slowed: ["xYTAsEpcJE1Ccni3", "Verlangsamt", "Slowed"],
  stunned: ["dfCMdR4wnpbYNTix", "Betäubt", "Stunned"],
  stupefied: ["e1XGnhKNSQIm5IXg", "Benommen", "Stupefied"]
});

const DAUER = Object.freeze({
  r1: ["für 1 Runde", "for 1 round"],
  m1: ["für 1 Minute", "for 1 minute"],
  h1: ["für 1 Stunde", "for 1 hour"],
  zug: ["bis zum Ende ihres nächsten Zugs", "until the end of its next turn"]
});

const SCHADEN = Object.freeze({
  piercing: ["Stich", "piercing"], slashing: ["Hieb", "slashing"], bludgeoning: ["Wucht", "bludgeoning"],
  fire: ["Feuer", "fire"], cold: ["Kälte", "cold"], acid: ["Säure", "acid"], electricity: ["Elektrizität", "electricity"],
  sonic: ["Schall", "sonic"], force: ["Kraft", "force"], poison: ["Gift", "poison"], mental: ["mental", "mental"],
  void: ["Leere", "void"], bleed: ["Blutung", "bleed"]
});

const WURF = Object.freeze({
  reflex: ["Reflex", "Reflex"], fortitude: ["Zähigkeit", "Fortitude"], will: ["Wille", "Will"],
  thievery: ["Diebeskunst", "Thievery"], arcana: ["Arkane Künste", "Arcana"], occultism: ["Okkultismus", "Occultism"],
  religion: ["Religion", "Religion"], nature: ["Naturkunde", "Nature"], survival: ["Überlebenskunst", "Survival"],
  crafting: ["Handwerk", "Crafting"], athletics: ["Athletik", "Athletics"]
});

const RANG = Object.freeze([["ungeübt", "untrained"], ["Geübt", "trained"], ["Experte", "expert"], ["Meister", "master"]]);

const TEXT = Object.freeze({
  ausloeser: ["Auslöser", "Trigger"],
  wirkung: ["Wirkung", "Effect"],
  grade: { ke: ["Kritischer Erfolg", "Critical Success"], e: ["Erfolg", "Success"], f: ["Fehlschlag", "Failure"], kf: ["Kritischer Fehlschlag", "Critical Failure"] },
  keine: ["Keine Wirkung.", "No effect."],
  und: [" und ", " and "],
  oder: [" oder ", " or "],
  alle: ["Jede Kreatur im Wirkungsbereich legt einen Rettungswurf ab: {wurf}.", "Each creature in the area attempts a saving throw: {wurf}."],
  einer: ["Die auslösende Kreatur legt einen Rettungswurf ab: {wurf}.", "The triggering creature attempts a saving throw: {wurf}."],
  stufe: ["Stufe {n}", "Stage {n}"],
  maxDauer: ["Maximale Dauer", "Maximum Duration"],
  gift: ["Gift", "poison"],
  zustaende: ["Zustände zum Ziehen", "Conditions to drag"],
  treffer: ["Treffer", "Hit"],
  krit: ["Kritischer Treffer", "Critical Hit"],
  angriff: ["Angriff", "Strike"],
  waffe: ["Falle", "Trap"]
});

export function sprache(lang) {
  return String(lang ?? "").toLowerCase().startsWith("de") ? "de" : "en";
}
const ix = (s) => (s === "de" ? 0 : 1);
const w = (eintrag, s) => eintrag[ix(s)];
const html = (text) => String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* "6d10+12" wird "(6d10+12)", damit die Schadensart für die ganze Formel gilt. */
function klammer(formel) {
  const f = String(formel).replace(/\s+/g, "");
  return /[+\-*]/.test(f) ? `(${f})` : f;
}

/* Mehrere Schadensteile als ein @Damage, wie PF2e ihn schreibt: (6d10+12)[piercing],2d6[persistent,bleed]. */
export function damageBefehl(teile) {
  const roh = teile.map((t) => `${klammer(t.d)}[${t.kat === "persistent" ? `persistent,${t.typ}` : t.typ}]`);
  return `@Damage[${roh.join(",")}]`;
}

export function zustandText(z, s) {
  const eintrag = ZUSTAENDE[z.z];
  if (!eintrag) throw new Error(`Zustand unbekannt: ${z.z}`);
  const name = `${eintrag[ix(s) + 1]}${z.wert ? ` ${z.wert}` : ""}`;
  const dauer = z.dauer ? ` ${w(DAUER[z.dauer], s)}` : "";
  return `@UUID[Compendium.pf2e.conditionitems.Item.${eintrag[0]}]{${name}}${dauer}`;
}

/*
 * Ein Erfolgsgrad als Satz: alle Schadensteile zusammen als ein @Damage an der Stelle des ersten, dazu Zustände
 * und freie Texte in ihrer Reihenfolge. Freie Texte, die mit "(" oder "und"/"and" beginnen, hängen ohne Komma an;
 * ein einzelnes Wort ("danach") verbindet sich mit dem Folgenden.
 */
export function gradText(eintraege, s, punkt = true) {
  if (!eintraege?.length) return w(TEXT.keine, s);
  const schaden = eintraege.filter((e) => e.d !== undefined);
  const teile = [];
  let schadenGesetzt = false;
  for (const e of eintraege) {
    if (e.d !== undefined) {
      if (!schadenGesetzt) teile.push({ text: damageBefehl(schaden), frei: false });
      schadenGesetzt = true;
    } else if (e.z) teile.push({ text: zustandText(e, s), frei: false });
    else teile.push({ text: e.t[s], frei: true });
  }
  let aus = "";
  teile.forEach((teil, i) => {
    if (i === 0) { aus = teil.text; return; }
    const vorher = teile[i - 1];
    const anhaengen = teil.frei && /^(\(|und |and |bis |until )/u.test(teil.text);
    const verbinden = vorher.frei && (!/\s/u.test(vorher.text.trim()) || /:$/u.test(vorher.text.trim()));
    const letztes = i === teile.length - 1;
    const trenner = anhaengen || verbinden ? " " : letztes ? w(TEXT.und, s) : ", ";
    aus += trenner + teil.text;
  });
  aus = aus.charAt(0).toUpperCase() + aus.slice(1);
  if (!punkt) return aus.replace(/\.$/u, "");
  return /[.!?]$/u.test(aus) ? aus : `${aus}.`;
}

function wurfBefehl(typ, dc) {
  return `@Check[${typ}|dc:${dc}]`;
}

function absatz(kopf, inhalt) {
  return `<p><strong>${kopf}</strong> ${inhalt}</p>`;
}

/* Die Auslöse-Reaktion als HTML. */
export function reaktionHtml(falle, s) {
  const l = falle[s];
  let h = absatz(w(TEXT.ausloeser, s), html(l.ausloeser)) + "<hr />";
  if (falle.wurf || falle.gift) {
    const wurf = falle.wurf ?? falle.gift;
    const satz = (falle.wirkung ? w(TEXT.alle, s) : w(TEXT.einer, s)).replace("{wurf}", wurfBefehl(wurf.typ, wurf.dc));
    h += absatz(w(TEXT.wirkung, s), `${html(l.wirkung)} ${satz}`) + "<hr />";
    const grade = falle.wurf ? falle.wurf.grade : {
      ke: [], e: [],
      f: [{ t: { de: `${w(TEXT.stufe, "de").replace("{n}", 1)}:`, en: `${w(TEXT.stufe, "en").replace("{n}", 1)}:` } }, ...falle.gift.stufen[0]],
      kf: [{ t: { de: `${w(TEXT.stufe, "de").replace("{n}", 2)}:`, en: `${w(TEXT.stufe, "en").replace("{n}", 2)}:` } }, ...falle.gift.stufen[1]]
    };
    for (const g of ["ke", "e", "f", "kf"]) h += absatz(w(TEXT.grade[g], s), gradText(grade[g], s));
    if (falle.gift) {
      h += "<hr />";
      const stufen = falle.gift.stufen.map((st, i) => `<strong>${w(TEXT.stufe, s).replace("{n}", i + 1)}</strong> ${gradText(st, s, false)}`);
      h += `<p><strong>${html(l.gift)}</strong> (${w(TEXT.gift, s)}); ${wurfBefehl(falle.gift.typ, falle.gift.dc)}; <strong>${w(TEXT.maxDauer, s)}</strong> ${falle.gift.max[s]}; ${stufen.join("; ")}.</p>`;
    }
    return h;
  }
  h += absatz(w(TEXT.wirkung, s), html(l.wirkung));
  if (l.krit) h += `<p>${html(l.krit)}</p>`;
  const zustaende = [...(falle.trefferZ ?? []), ...(falle.kritZ ?? [])];
  if (zustaende.length) {
    const eindeutig = [...new Map(zustaende.map((z) => [`${z.z}:${z.wert ?? ""}:${z.dauer ?? ""}`, z])).values()];
    h += `<p><em>${w(TEXT.zustaende, s)}:</em> ${eindeutig.map((z) => zustandText(z, s)).join(", ")}</p>`;
  }
  return h;
}

/* Entschärfen: "@Check[thievery|dc:23] (Experte) oder @Check[arcana|dc:22] (Geübt): ...". */
export function entschaerfenHtml(falle, s) {
  const wege = falle.entschaerfen.map(([typ, dc, rang]) => `${wurfBefehl(typ, dc)} (${w(RANG[rang], s)})`);
  return `<p>${wege.join(w(TEXT.oder, s))}: ${html(falle[s].entschaerfen)}</p>`;
}

/* Wie die Falle im Spiel heißt: die Auslöseart der Gefahren-Karte. */
export function ausloeseArt(falle) {
  return falle.art === "tuer" ? "tuer" : falle.art === "schloss" ? "knopf" : "betreten";
}

/* Der ganze Akteur (ohne Ordner und Bild), wie Actor.create ihn nimmt. */
export function akteurDaten(falle, s, stand) {
  const l = falle[s];
  const items = [{
    name: l.name, type: "action", img: "systems/pf2e/icons/actions/Reaction.webp",
    system: {
      actionType: { value: "reaction" }, actions: { value: null }, category: null,
      description: { value: reaktionHtml(falle, s) }, rules: [], slug: null,
      traits: { rarity: "common", value: falle.angriff ? ["attack"] : [] }
    },
    flags: { [MODUL]: { rolle: "ausloesen", hoechstens: falle.angriff ? falle.angriff.hoechstens ?? null : falle.hoechstens ?? null } }
  }];
  if (falle.angriff) {
    const rolls = {};
    falle.angriff.schaden.forEach((t, i) => {
      rolls[`gp${String(i).padStart(18, "0")}`] = { damage: t.d, damageType: t.typ, ...(t.kat ? { category: t.kat } : {}) };
    });
    items.push({
      name: `${l.name}: ${w(TEXT.angriff, s)}`, type: "melee", img: "systems/pf2e/icons/default-icons/melee.svg",
      system: {
        attack: { value: "" }, attackEffects: { custom: "", value: [] }, bonus: { value: falle.angriff.bonus },
        damageRolls: rolls, description: { value: "" }, range: null, rules: [], slug: null,
        traits: { rarity: "common", value: falle.angriff.magisch ? ["magical"] : [] }
      },
      flags: { [MODUL]: { rolle: "angriff" } }
    });
  }
  const mitWerten = Boolean(falle.werte);
  return {
    name: l.name, type: "hazard",
    system: {
      attributes: {
        ac: { value: falle.werte?.rk ?? 0 }, hardness: falle.werte?.haerte ?? 0, hasHealth: mitWerten,
        hp: { details: "", max: falle.werte?.tp ?? 0, temp: 0, tempmax: 0, value: falle.werte?.tp ?? 0 },
        immunities: mitWerten ? [{ type: "critical-hits" }, { type: "object-immunities" }, { type: "precision" }] : [],
        stealth: { details: `<p>(${w(RANG[falle.rang], s)})</p>`, value: falle.heimlichkeit - 10 },
        emitsSound: "encounter"
      },
      details: {
        description: `<p>${html(l.beschreibung)}</p>`, disable: entschaerfenHtml(falle, s), isComplex: false,
        level: { value: falle.stufe }, reset: `<p>${html(l.ruecksetzen)}</p>`, routine: ""
      },
      saves: {
        fortitude: { saveDetail: "", value: mitWerten ? 13 : 0 },
        reflex: { saveDetail: "", value: mitWerten ? 9 : 0 },
        will: { saveDetail: "", value: 0 }
      },
      traits: { rarity: "common", size: { value: "med" }, value: [...falle.merkmale] }
    },
    items,
    flags: {
      [MODUL]: {
        ausloeser: typeof falle.ausloeser === "number" ? falle.ausloeser : 0,
        wirkung: falle.wirkung ?? 0,
        falle: {
          id: falle.id, stand, sprache: s, art: falle.art, ausloesung: ausloeseArt(falle),
          beschwoerung: falle.beschwoerung ?? null,
          aussehen: falle.aussehen ? {
            name: falle.aussehen[s][0], text: falle.aussehen[s][1], toenung: falle.aussehen.toenung, dauer: falle.aussehen.dauer
          } : null
        }
      }
    }
  };
}

/* Klartext für das Menü: Befehle werden zu ihrer Beschriftung oder lesbaren Würfeln, Tags fallen weg. */
export function klartext(htmlText, s) {
  return String(htmlText ?? "")
    .replace(/@UUID\[[^\]]*\]\{([^}]*)\}/gu, "$1")
    .replace(/@Check\[([a-z-]+)\|dc:(\d+)[^\]]*\]/gu, (_m, typ, dc) => (s === "de" ? `${w(WURF[typ] ?? [typ, typ], s)} SG ${dc}` : `DC ${dc} ${w(WURF[typ] ?? [typ, typ], s)}`))
    .replace(/@Damage\[((?:[^[\]]|\[[^\]]*\])*)\]/gu, (_m, inhalt) => inhalt.split(/,(?![^[]*\])/u).map((teil) => {
      const m = /^\(?([^)[]+)\)?\[(?:persistent,)?([a-z]+)\]$/u.exec(teil.trim());
      if (!m) return teil;
      const anhaltend = teil.includes("persistent");
      const formel = s === "de" ? m[1].replace(/d/gu, "W") : m[1];
      const art = w(SCHADEN[m[2]] ?? [m[2], m[2]], s);
      return s === "de" ? `${formel} ${art}${anhaltend ? " anhaltend" : ""}` : `${formel} ${anhaltend ? "persistent " : ""}${art}`;
    }).join(", "))
    .replace(/<hr\s*\/?>/gu, " ")
    .replace(/<\/p>\s*<p>/gu, " ")
    .replace(/<[^>]+>/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}
