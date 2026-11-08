// Eigene Fallen (0.4.0, 06.11.2026). Allgemein nach Ort, ohne Bezug zu einem Abenteuer ("sonst taugt das Modul
// nicht mehr; es soll für solche Orte passen: Türen, Schlösser, Gelände, Räume"). Nicht im Kompendium, sondern
// über das Fallen-Menü der Leiste gesetzt. Maßstab (Wunsch: "ich möchte, dass Helden, die eine Falle auslösen, umfallen";
// "Fallen in PF2e sollen brutal sein, die Spieler können sie ja aufdecken"): ein Fehlschlag wirft einen
// Zauberkundigen der Stufe 5 (rund 45 TP) um, ein kritischer Fehlschlag jeden. Heimlichkeit und Entschärfen nach
// den PF2e-Gefahren der Stufen 3 bis 7 (SG 22 bis 26). Herbeigerufene Gegner Stufe 8 (Wunsch: "Gegner Stufe 8").
//
// Bausteine: D Schaden (Formel, Art, "persistent"), Z Zustand (Slug, Wert, Dauer), T freier Text je Sprache.
// Grade: ke kritischer Erfolg, e Erfolg, f Fehlschlag, kf kritischer Fehlschlag. Der Schaden steht in jedem Grad
// ausgeschrieben (halb und doppelt als halbe und doppelte Würfel), damit Zusatzschaden des Grads mitgewürfelt wird.

// Seit 0.5.0 liegen die Bausteine in fallen-bausteine.mjs und jede weitere Stufe in einer eigenen Datei
// (Stufe 6: fallen-stufe-6.mjs, 06.11.2026: "jetzt Fallen für Stufe 6 bauen"; Stufe 7: fallen-stufe-7.mjs,
// 07.11.2026: "jetzt Fallen für Stufe 7 bauen"; Stufe 8: fallen-stufe-8.mjs, 07.11.2026: "jetzt Fallen für
// Stufe 8 bauen"; Stufe 9: fallen-stufe-9.mjs, 07.11.2026: "jetzt Fallen für Stufe 9 bauen";
// Stufe 10: fallen-stufe-10.mjs, 07.11.2026: "Stufe 10, etwas kürzere Zustände, dafür aber mehrere").
// Seit 0.10.0 die Stufen 1 bis 4 in fallen-stufe-1.mjs bis fallen-stufe-4.mjs, mit eigenem, mildem Maßstab
// (07.11.2026: "gerecht für die normalen PF2e-Spieler, die nicht so starke Gruppen haben und eventuell nicht so gut
// heilen können"); er steht im Kopf von fallen-stufe-1.mjs.
import { AUS, D, T, Z } from "./fallen-bausteine.mjs";
import { STUFE_1 } from "./fallen-stufe-1.mjs";
import { STUFE_2 } from "./fallen-stufe-2.mjs";
import { STUFE_3 } from "./fallen-stufe-3.mjs";
import { STUFE_4 } from "./fallen-stufe-4.mjs";
import { STUFE_6 } from "./fallen-stufe-6.mjs";
import { STUFE_7 } from "./fallen-stufe-7.mjs";
import { STUFE_8 } from "./fallen-stufe-8.mjs";
import { STUFE_9 } from "./fallen-stufe-9.mjs";
import { STUFE_10 } from "./fallen-stufe-10.mjs";

export { D, T, Z };

export const DATEN_STAND = "0.10.0-1";

const tuerAus = AUS.tuer;
const schlossAus = AUS.schloss;
const betretenAus = AUS.betreten;
const feldAus = AUS.feld;

const STUFE_5 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer-bolzenwerfer", art: "tuer", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 0, wirkung: 0, werte: { rk: 22, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 22, 1]],
    angriff: { bonus: 17, schaden: [D("6d10+12", "piercing"), D("2d6", "bleed", "persistent")], hoechstens: 1 },
    de: {
      name: "Bolzenwerfer im Türrahmen", ausloeser: tuerAus.de,
      beschreibung: "Ein gespannter Armbrustmechanismus steckt im Rahmen, ein Faden läuft zum Türblatt.",
      wirkung: "Die Falle schießt einen Bolzen auf die öffnende Kreatur: Fernkampf-Angriff +17, 6W10+12 Stich und 2W6 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden, und das Ziel ist Kraftlos 1, bis die Blutung endet.",
      entschaerfen: "den Faden durchtrennen, ohne ihn zu lösen", ruecksetzen: "Von Hand neu spannen (1 Minute)."
    },
    en: {
      name: "Door-Frame Bolt Thrower", ausloeser: tuerAus.en,
      beschreibung: "A cocked crossbow mechanism hides in the frame, a thread runs to the door leaf.",
      wirkung: "The trap fires a bolt at the creature opening the door: ranged Strike +17, 6d10+12 piercing and 2d6 persistent bleed.",
      krit: "Critical hit: double damage, and the target is enfeebled 1 until the bleeding ends.",
      entschaerfen: "cut the thread without releasing it", ruecksetzen: "Rearm by hand (1 minute)."
    },
    kritZ: [Z("enfeebled", 1)]
  },
  {
    id: "tuer-sturzgitter", art: "tuer", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 22, haerte: 13, tp: 52 },
    entschaerfen: [["thievery", 23, 2], ["crafting", 22, 1]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("3d8+7", "bludgeoning")], f: [D("7d8+14", "bludgeoning"), Z("prone")],
        kf: [D("14d8+28", "bludgeoning"), Z("immobilized"), T("eingeklemmt bis Entkommen SG 23, 2W8 Wucht zu Beginn jedes ihrer Züge", "pinned until it Escapes (DC 23), 2d8 bludgeoning at the start of each of its turns")]
      }
    },
    de: {
      name: "Sturzgitter", ausloeser: tuerAus.de,
      beschreibung: "Über dem Türsturz hängt ein schweres Eisengitter in einer verborgenen Nut.",
      wirkung: "Das Gitter fällt in den Türrahmen und versperrt den Durchgang (Athletik SG 25 zum Anheben).",
      entschaerfen: "Sperrhaken in die Nut setzen", ruecksetzen: "Kurbel hinter der Wand."
    },
    en: {
      name: "Falling Portcullis", ausloeser: tuerAus.en,
      beschreibung: "A heavy iron grate hangs above the lintel in a hidden groove.",
      wirkung: "The grate slams into the door frame and blocks the passage (Athletics DC 25 to lift).",
      entschaerfen: "wedge locking pins into the groove", ruecksetzen: "A crank behind the wall."
    }
  },
  {
    id: "tuer-flammenklinke", art: "tuer", stufe: 5, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["thievery", 23, 2], ["arcana", 22, 1]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("5d6", "fire")], f: [D("10d6", "fire"), D("2d6", "fire", "persistent")],
        kf: [D("20d6", "fire"), D("3d6", "fire", "persistent"), Z("dazzled", null, "m1")]
      }
    },
    de: {
      name: "Flammensiegel an der Klinke", ausloeser: tuerAus.de,
      beschreibung: "Eine kaum sichtbare Glyphe ist in das Metall der Klinke geätzt.",
      wirkung: "Das Siegel explodiert in einer Feuerwolke.",
      entschaerfen: "die Glyphe abkratzen oder bannen", ruecksetzen: "Keines, das Siegel ist verbraucht."
    },
    en: {
      name: "Flame Seal on the Handle", ausloeser: tuerAus.en,
      beschreibung: "A barely visible glyph is etched into the metal of the handle.",
      wirkung: "The seal explodes in a burst of flame.",
      entschaerfen: "scratch off or dispel the glyph", ruecksetzen: "None, the seal is spent."
    }
  },
  {
    id: "tuer-saeurekessel", art: "tuer", stufe: 5, merkmale: ["mechanical", "acid", "trap"],
    heimlichkeit: 22, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 20, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 22, 1], ["athletics", 22, 0]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("4d6", "acid")], f: [D("8d6", "acid"), D("3d6", "acid", "persistent")],
        kf: [D("16d6", "acid"), D("4d6", "acid", "persistent"), Z("blinded", null, "r1"), T("danach Geblendet für 1 Minute", "then dazzled for 1 minute"), T("und Säurenarben", "and acid scars")]
      }
    },
    aussehen: { de: ["Säurenarben", "Fleckige Narben im Gesicht."], en: ["Acid Scars", "Blotchy scars across the face."], toenung: "#c9b38a", dauer: null },
    de: {
      name: "Säurekessel über der Tür", ausloeser: tuerAus.de,
      beschreibung: "Ein Kessel steht verborgen auf einem Brett über der Tür, ein Seil hängt am Türblatt.",
      wirkung: "Der Kessel kippt und ergießt Säure über alle darunter.",
      entschaerfen: "den Kessel sichern", ruecksetzen: "Kessel neu füllen."
    },
    en: {
      name: "Acid Cauldron above the Door", ausloeser: tuerAus.en,
      beschreibung: "A cauldron stands hidden on a shelf above the door, a rope hangs from the door leaf.",
      wirkung: "The cauldron tips and pours acid over everyone below.",
      entschaerfen: "secure the cauldron", ruecksetzen: "Refill the cauldron."
    }
  },
  {
    id: "tuer-schreckensglyphe", art: "tuer", stufe: 5, merkmale: ["magical", "mental", "fear", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 22, 1], ["thievery", 24, 2]],
    wurf: {
      typ: "will", dc: 23, grade: {
        ke: [], e: [D("4d8", "mental"), Z("frightened", 1)], f: [D("8d8", "mental"), Z("frightened", 2)],
        kf: [D("16d8", "mental"), Z("frightened", 3), Z("fleeing", null, "r1"), T("und weißes Haar", "and white hair")]
      }
    },
    aussehen: { de: ["Weißes Haar", "Das Haar ist vor Schreck schlohweiß geworden."], en: ["White Hair", "The hair has turned snow-white from terror."], toenung: null, dauer: null },
    de: {
      name: "Schreckensglyphe", ausloeser: tuerAus.de,
      beschreibung: "Eine unsichtbare Glyphe auf der Innenseite des Türblatts.",
      wirkung: "Die Glyphe flutet den Geist aller in der Nähe mit Grauen.",
      entschaerfen: "die Glyphe lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Glyph of Dread", ausloeser: tuerAus.en,
      beschreibung: "An invisible glyph on the inside of the door leaf.",
      wirkung: "The glyph floods the minds of everyone nearby with terror.",
      entschaerfen: "unravel the glyph", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer-kraftlanzen", art: "tuer", stufe: 5, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["arcana", 23, 2], ["thievery", 25, 2]],
    angriff: { bonus: 17, schaden: [D("8d6+2d10", "force")], hoechstens: 3, magisch: true },
    de: {
      name: "Kraftlanzen-Glyphe", ausloeser: tuerAus.de,
      beschreibung: "Drei winzige Runen bilden ein Dreieck auf dem Türblatt.",
      wirkung: "Drei Lanzen aus Kraft schießen hervor: je ein Zauberangriff +17 gegen bis zu drei Kreaturen im Wirkungsbereich, die öffnende Kreatur zuerst, 8W6+2W10 Kraft. Treffer: 10 Fuß zurückgestoßen und Liegend.",
      krit: "Kritischer Treffer: doppelter Schaden, 20 Fuß zurückgeschleudert, Liegend und Betäubt 1.",
      entschaerfen: "die Runen bannen oder auseinanderkratzen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Glyph of Force Lances", ausloeser: tuerAus.en,
      beschreibung: "Three tiny runes form a triangle on the door leaf.",
      wirkung: "Three lances of force shoot out: one spell attack +17 each against up to three creatures in the area, the creature opening the door first, 8d6+2d10 force. Hit: pushed back 10 feet and knocked prone.",
      krit: "Critical hit: double damage, hurled back 20 feet, prone and stunned 1.",
      entschaerfen: "dispel the runes or scratch them apart", ruecksetzen: "Recharges after 1 hour."
    },
    trefferZ: [Z("prone")], kritZ: [Z("prone"), Z("stunned", 1)]
  },
  {
    id: "tuer-donnerrune", art: "tuer", stufe: 5, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 23, 2], ["thievery", 24, 2]],
    wurf: {
      typ: "fortitude", dc: 23, grade: {
        ke: [], e: [D("5d6+1d10", "sonic")], f: [D("9d6+2d10", "sonic"), Z("deafened", null, "m1"), Z("prone")],
        kf: [D("18d6+4d10", "sonic"), Z("deafened", null, "h1"), Z("stunned", 2), Z("prone")]
      }
    },
    de: {
      name: "Donnerrune", ausloeser: tuerAus.de,
      beschreibung: "Eine Rune aus feinen Wellenlinien, eingebrannt in die Schwelle.",
      wirkung: "Ein Donnerschlag entlädt sich. Der Knall ist 500 Fuß weit zu hören.",
      entschaerfen: "die Rune bannen oder aus der Schwelle schneiden", ruecksetzen: "Keines, die Rune ist verbraucht."
    },
    en: {
      name: "Thunder Rune", ausloeser: tuerAus.en,
      beschreibung: "A rune of fine wavy lines, burned into the threshold.",
      wirkung: "A thunderclap discharges. The bang can be heard 500 feet away.",
      entschaerfen: "dispel the rune or cut it out of the threshold", ruecksetzen: "None, the rune is spent."
    }
  },
  {
    id: "tuer-frostbann", art: "tuer", stufe: 5, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 22, 1], ["thievery", 24, 2]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("5d6+1d10", "cold")], f: [D("9d6+2d10", "cold"), Z("slowed", 1, "m1")],
        kf: [D("18d6+4d10", "cold"), Z("immobilized"), T("festgefroren bis Entkommen SG 23", "frozen to the ground until it Escapes (DC 23)"), Z("slowed", 2, "m1"), T("und der Frostfluch", "and the frost curse")]
      }
    },
    aussehen: { de: ["Frostfluch", "Bläuliche Haut, Raureif in Haar und Brauen."], en: ["Frost Curse", "Bluish skin, hoarfrost in hair and brows."], toenung: "#9cc8ff", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Frostbann", ausloeser: tuerAus.de,
      beschreibung: "Ein Hauch Raureif auf Rahmen und Schwelle, kaum vom Staub zu unterscheiden.",
      wirkung: "Eisige Kälte schlägt aus Rahmen und Schwelle.",
      entschaerfen: "den Bann brechen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Frost Ward", ausloeser: tuerAus.en,
      beschreibung: "A breath of hoarfrost on frame and threshold, hard to tell from dust.",
      wirkung: "Icy cold lashes out of frame and threshold.",
      entschaerfen: "break the ward", ruecksetzen: "Recharges after 1 hour."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss-giftnadel", art: "schloss", stufe: 5, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 22, haerte: 6, tp: 20 },
    entschaerfen: [["thievery", 23, 2]],
    gift: {
      typ: "fortitude", dc: 23, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("4d6", "poison"), Z("enfeebled", 1, "r1")],
        [D("6d6", "poison"), Z("enfeebled", 2, "r1"), Z("slowed", 1, "r1")],
        [D("8d6", "poison"), Z("enfeebled", 2, "r1"), Z("paralyzed", null, "r1")]
      ]
    },
    de: {
      name: "Giftnadel im Schloss", ausloeser: schlossAus.de,
      beschreibung: "Im Schlüsselloch sitzt eine feine Nadel, getränkt mit einem lähmenden Gift.",
      wirkung: "Die Nadel sticht zu. Lähmgift.", gift: "Lähmgift",
      entschaerfen: "die Nadel ausbauen, ohne sich zu stechen", ruecksetzen: "Nadel neu vergiften."
    },
    en: {
      name: "Poison Needle in the Lock", ausloeser: schlossAus.en,
      beschreibung: "A fine needle sits in the keyhole, soaked in a paralytic poison.",
      wirkung: "The needle pricks. Paralytic poison.", gift: "Paralytic poison",
      entschaerfen: "remove the needle without pricking yourself", ruecksetzen: "Poison the needle again."
    }
  },
  {
    id: "schloss-sprengsiegel", art: "schloss", stufe: 5, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 22, 1], ["thievery", 24, 2]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("5d6", "force")], f: [D("10d6", "force"), Z("prone")],
        kf: [D("20d6", "force"), Z("prone"), Z("deafened", null, "m1"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Sprengsiegel", ausloeser: schlossAus.de,
      beschreibung: "Ein Wachssiegel mit eingeprägter Rune verschließt Deckel oder Schloss.",
      wirkung: "Das Siegel bricht und entlädt eine Welle aus Kraft.",
      entschaerfen: "die Rune im Siegel lösen", ruecksetzen: "Keines."
    },
    en: {
      name: "Blast Seal", ausloeser: schlossAus.en,
      beschreibung: "A wax seal stamped with a rune closes lid or lock.",
      wirkung: "The seal breaks and releases a wave of force.",
      entschaerfen: "unravel the rune in the seal", ruecksetzen: "None."
    }
  },
  {
    id: "schloss-klingendeckel", art: "schloss", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 22, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 22, 1]],
    angriff: { bonus: 17, schaden: [D("7d8+14", "slashing"), D("2d8", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Klingendeckel", ausloeser: schlossAus.de,
      beschreibung: "Im Deckel der Truhe liegt ein Kranz gespannter Klingen.",
      wirkung: "Die Klingen schnappen zu: Nahkampf-Angriff +17 gegen die öffnende Kreatur, 7W8+14 Hieb und 2W8 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden, und das Ziel ist Kraftlos 2, bis die Blutung endet.",
      entschaerfen: "den Deckel nur einen Spalt öffnen und die Feder blockieren", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Bladed Lid", ausloeser: schlossAus.en,
      beschreibung: "A ring of cocked blades lies inside the chest's lid.",
      wirkung: "The blades snap shut: melee Strike +17 against the creature opening it, 7d8+14 slashing and 2d8 persistent bleed.",
      krit: "Critical hit: double damage, and the target is enfeebled 2 until the bleeding ends.",
      entschaerfen: "open the lid only a crack and jam the spring", ruecksetzen: "Rearm by hand."
    },
    kritZ: [Z("enfeebled", 2)]
  },
  {
    id: "schloss-gasphiole", art: "schloss", stufe: 5, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: "knopf", wirkung: 10, werte: { rk: 20, haerte: 4, tp: 12 },
    entschaerfen: [["thievery", 23, 2], ["crafting", 22, 1]],
    gift: {
      typ: "fortitude", dc: 23, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("4d6", "poison"), Z("sickened", 1)],
        [D("6d6", "poison"), Z("sickened", 2), Z("slowed", 1)],
        [D("8d6", "poison"), Z("sickened", 3), Z("slowed", 1), Z("drained", 1)]
      ]
    },
    de: {
      name: "Gasphiole im Deckel", ausloeser: schlossAus.de,
      beschreibung: "Eine Glasphiole ist so eingebaut, dass sie beim Öffnen zerbricht.",
      wirkung: "Die Phiole zerbricht, eine Gaswolke füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Würggas.", gift: "Würggas",
      entschaerfen: "die Phiole aus der Halterung lösen", ruecksetzen: "Neue Phiole."
    },
    en: {
      name: "Gas Vial in the Lid", ausloeser: schlossAus.en,
      beschreibung: "A glass vial is fitted so that it breaks when the lid opens.",
      wirkung: "The vial shatters, a cloud of gas fills the area for 1 minute. A creature starting its turn inside rolls again. Choking gas.", gift: "Choking gas",
      entschaerfen: "free the vial from its holder", ruecksetzen: "A new vial."
    }
  },
  {
    id: "schloss-lebensraub", art: "schloss", stufe: 5, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["religion", 23, 2], ["occultism", 23, 2]],
    wurf: {
      typ: "fortitude", dc: 23, grade: {
        ke: [], e: [D("5d8", "void")], f: [D("10d8", "void"), Z("drained", 1)],
        kf: [D("20d8", "void"), Z("drained", 2), T("und der Fluch des Lebensraubs: Solange er hält, heilt Ausgelaugt nicht von selbst", "and the curse of life theft: while it lasts, drained does not recover on its own")]
      }
    },
    aussehen: { de: ["Fluch des Lebensraubs", "Graue, eingefallene Haut, trübe Augen. Ausgelaugt heilt nicht von selbst."], en: ["Curse of Life Theft", "Grey, sunken skin, clouded eyes. Drained does not recover on its own."], toenung: "#8a8f8a", dauer: null },
    de: {
      name: "Siegel des Lebensraubs", ausloeser: "Eine Kreatur berührt das Schloss, um es zu öffnen.",
      beschreibung: "Feine schwarze Linien umranden das Schlüsselloch.",
      wirkung: "Das Siegel saugt der Kreatur das Leben aus.",
      entschaerfen: "das Siegel lösen", ruecksetzen: "Lädt sich bei Sonnenuntergang neu."
    },
    en: {
      name: "Seal of Life Theft", ausloeser: "A creature touches the lock to open it.",
      beschreibung: "Fine black lines encircle the keyhole.",
      wirkung: "The seal drains the life out of the creature.",
      entschaerfen: "unravel the seal", ruecksetzen: "Recharges at sunset."
    }
  },
  {
    id: "schloss-beschwoerungssiegel", art: "schloss", stufe: 5, merkmale: ["magical", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 23, 2], ["thievery", 25, 2]],
    beschwoerung: { stufe: 8, runden: 10, ort: "neben" },
    de: {
      name: "Beschwörungssiegel", ausloeser: schlossAus.de,
      beschreibung: "Ein Kreis aus Zeichen um das Schlüsselloch, in der Mitte ein leeres Auge.",
      wirkung: "Das Siegel ruft einen Gegner herbei: Eine Kreatur bis Stufe 8 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Ruf unterbrechen, bevor das Siegel bricht", ruecksetzen: "Keines."
    },
    en: {
      name: "Summoning Seal", ausloeser: schlossAus.en,
      beschreibung: "A circle of signs around the keyhole, an empty eye at its centre.",
      wirkung: "The seal calls forth a foe: a creature of up to level 8 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "interrupt the call before the seal breaks", ruecksetzen: "None."
    }
  },
  {
    id: "schloss-kreischend", art: "schloss", stufe: 5, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: "knopf", wirkung: 5, werte: null,
    entschaerfen: [["arcana", 22, 1], ["thievery", 24, 2]],
    wurf: {
      typ: "fortitude", dc: 23, grade: {
        ke: [], e: [D("5d6+1d10", "sonic")], f: [D("9d6+2d10", "sonic"), Z("deafened"), Z("stunned", 1)],
        kf: [D("18d6+4d10", "sonic"), Z("deafened", null, "h1"), Z("stunned", 2), Z("stupefied", 2, "m1")]
      }
    },
    de: {
      name: "Kreischendes Schloss", ausloeser: schlossAus.de,
      beschreibung: "Ein Mund aus Messing, als Zierde um das Schlüsselloch gearbeitet.",
      wirkung: "Ein Schrei fährt aus dem Mund. Das Kreischen hält 1 Minute an und ist 500 Fuß weit zu hören.",
      entschaerfen: "den Mund verstopfen und die Rune darunter brechen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Shrieking Lock", ausloeser: schlossAus.en,
      beschreibung: "A brass mouth, worked as an ornament around the keyhole.",
      wirkung: "A scream bursts from the mouth. The shrieking lasts 1 minute and can be heard 500 feet away.",
      entschaerfen: "stuff the mouth and break the rune beneath it", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss-entladung", art: "schloss", stufe: 5, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: "knopf", wirkung: 15, werte: null,
    entschaerfen: [["arcana", 23, 2], ["thievery", 25, 2]],
    angriff: { bonus: 17, schaden: [D("10d6+2d10", "force")], hoechstens: 2, magisch: true },
    de: {
      name: "Entladungsrune", ausloeser: schlossAus.de,
      beschreibung: "Eine Rune auf der Innenseite des Schlossblechs, nur durch das Schlüsselloch zu sehen.",
      wirkung: "Zauberangriff +17 gegen die Kreatur am Schloss, 10W6+2W10 Kraft. Treffer: Kraftlos 2 für 1 Minute. Danach springt die Entladung auf eine weitere Kreatur im Wirkungsbereich über: gleicher Angriff, halber Schaden.",
      krit: "Kritischer Treffer: doppelter Schaden, Kraftlos 2 für 1 Minute, 15 Fuß zurückgeschleudert und Liegend.",
      entschaerfen: "die Rune durch das Schlüsselloch bannen", ruecksetzen: "Lädt sich bei Sonnenaufgang neu."
    },
    en: {
      name: "Discharge Rune", ausloeser: schlossAus.en,
      beschreibung: "A rune on the inside of the lock plate, visible only through the keyhole.",
      wirkung: "Spell attack +17 against the creature at the lock, 10d6+2d10 force. Hit: enfeebled 2 for 1 minute. Then the discharge jumps to another creature in the area: same attack, half damage.",
      krit: "Critical hit: double damage, enfeebled 2 for 1 minute, hurled back 15 feet and prone.",
      entschaerfen: "dispel the rune through the keyhole", ruecksetzen: "Recharges at sunrise."
    },
    trefferZ: [Z("enfeebled", 2, "m1")], kritZ: [Z("enfeebled", 2, "m1"), Z("prone")]
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende-pfahlgrube", art: "gelaende", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 22, 1], ["thievery", 22, 1]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [T("greift die Kante und stürzt nicht", "grabs the edge and does not fall")],
        e: [T("greift die Kante und stürzt nicht", "grabs the edge and does not fall")],
        f: [T("stürzt 20 Fuß tief", "falls 20 feet"), D("10", "bludgeoning"), D("6d8+12", "piercing"), D("2d6", "bleed", "persistent"), Z("prone")],
        kf: [T("stürzt und wird aufgespießt", "falls and is impaled"), D("10", "bludgeoning"), D("12d8+24", "piercing"), D("2d6", "bleed", "persistent"), Z("immobilized"), T("bis Entkommen SG 23", "until it Escapes (DC 23)")]
      }
    },
    de: {
      name: "Pfahlgrube", ausloeser: betretenAus.de,
      beschreibung: "Eine mit Zweigen und Erde bedeckte Grube, 20 Fuß tief, am Boden zugespitzte Pfähle.",
      wirkung: "Die Abdeckung bricht ein. Herausklettern Athletik SG 22.",
      entschaerfen: "die Abdeckung sichtbar machen und überbrücken", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Spiked Pit", ausloeser: betretenAus.en,
      beschreibung: "A pit covered with branches and soil, 20 feet deep, sharpened stakes at the bottom.",
      wirkung: "The cover gives way. Climbing out takes Athletics DC 22.",
      entschaerfen: "expose the cover and bridge it", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende-schlinge", art: "gelaende", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 18, haerte: 2, tp: 8 },
    entschaerfen: [["survival", 22, 1], ["thievery", 22, 1]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [Z("off-guard", null, "r1")],
        f: [T("kopfüber 15 Fuß hochgerissen", "yanked 15 feet up, head first"), D("8d6", "bludgeoning"), Z("restrained"), T("(Entkommen SG 23)", "(Escape DC 23)"), Z("off-guard")],
        kf: [T("hochgerissen und gegen Stamm oder Fels geschleudert", "yanked up and slammed into trunk or rock"), D("16d6", "bludgeoning"), Z("restrained"), T("(Entkommen SG 23)", "(Escape DC 23)"), Z("stunned", 2)]
      }
    },
    de: {
      name: "Schlinge am Baum", ausloeser: feldAus.de,
      beschreibung: "Eine Seilschlinge unter dem Laub, an einem gespannten Ast befestigt.",
      wirkung: "Die Schlinge zieht sich zu.",
      entschaerfen: "die Schlinge lösen", ruecksetzen: "Neu spannen."
    },
    en: {
      name: "Tree Snare", ausloeser: feldAus.en,
      beschreibung: "A rope noose under the leaves, tied to a bent branch.",
      wirkung: "The noose snaps tight.",
      entschaerfen: "loosen the noose", ruecksetzen: "Set it again."
    }
  },
  {
    id: "gelaende-steinschlag", art: "gelaende", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["thievery", 22, 1], ["athletics", 23, 0]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("4d8+2", "bludgeoning")], f: [D("9d8", "bludgeoning"), Z("prone")],
        kf: [D("18d8", "bludgeoning"), T("verschüttet", "buried"), Z("immobilized"), T("bis Athletik SG 23, 2W8 Wucht zu Beginn jedes ihrer Züge", "until Athletics DC 23, 2d8 bludgeoning at the start of each of its turns")]
      }
    },
    de: {
      name: "Steinschlag am Hang", ausloeser: betretenAus.de,
      beschreibung: "Ein Stolperdraht hält eine Ladung Geröll am Hang über dem Pfad.",
      wirkung: "Das Geröll stürzt herab. Der Wirkungsbereich wird danach schwieriges Gelände.",
      entschaerfen: "den Draht entlasten und das Geröll abstützen", ruecksetzen: "Keines."
    },
    en: {
      name: "Rockslide on the Slope", ausloeser: betretenAus.en,
      beschreibung: "A tripwire holds a load of scree on the slope above the path.",
      wirkung: "The scree comes crashing down. The area becomes difficult terrain afterwards.",
      entschaerfen: "take the load off the wire and brace the scree", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende-fangeisen", art: "gelaende", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 22, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 22, 1]],
    angriff: { bonus: 17, schaden: [D("6d8+12", "piercing"), D("2d6", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Fangeisen", ausloeser: feldAus.de,
      beschreibung: "Ein schweres, gezahntes Eisen, unter Erde und Moos verborgen.",
      wirkung: "Das Eisen schnappt zu: Nahkampf-Angriff +17, 6W8+12 Stich und 2W6 anhaltende Blutung. Treffer: Bewegungsunfähig (Entkommen SG 23 oder Athletik SG 23 zum Aufstemmen), solange das Eisen hält.",
      krit: "Kritischer Treffer: doppelter Schaden, dazu Verlangsamt 1, solange das Eisen hält.",
      entschaerfen: "die Feder sperren", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Toothed Trap", ausloeser: feldAus.en,
      beschreibung: "A heavy, toothed iron trap hidden under soil and moss.",
      wirkung: "The jaws snap shut: melee Strike +17, 6d8+12 piercing and 2d6 persistent bleed. Hit: immobilized (Escape DC 23 or Athletics DC 23 to pry open) while the trap holds.",
      krit: "Critical hit: double damage, and slowed 1 while the trap holds.",
      entschaerfen: "lock the spring", ruecksetzen: "Rearm by hand."
    },
    trefferZ: [Z("immobilized")], kritZ: [Z("immobilized"), Z("slowed", 1)]
  },
  {
    id: "gelaende-sprengladung", art: "gelaende", stufe: 5, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["thievery", 23, 2], ["crafting", 22, 1]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("4d6", "fire"), D("2d6", "piercing")], f: [D("7d6", "fire"), D("4d6", "piercing"), Z("prone"), Z("deafened", null, "m1")],
        kf: [D("14d6", "fire"), D("8d6", "piercing"), Z("prone"), Z("deafened", null, "h1"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Vergrabene Sprengladung", ausloeser: feldAus.de,
      beschreibung: "Ein Tontopf mit Schwarzpulver und Eisensplittern, eine Druckzunge knapp unter dem Boden.",
      wirkung: "Die Ladung explodiert.",
      entschaerfen: "die Druckzunge blockieren und die Ladung ausgraben", ruecksetzen: "Keines."
    },
    en: {
      name: "Buried Blast Charge", ausloeser: feldAus.en,
      beschreibung: "A clay pot of black powder and iron shards, a pressure tongue just below the ground.",
      wirkung: "The charge explodes.",
      entschaerfen: "block the pressure tongue and dig the charge out", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende-gewitterstein", art: "gelaende", stufe: 5, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 5, wirkung: 20, werte: null, hoechstens: 3,
    entschaerfen: [["arcana", 22, 1], ["nature", 22, 1]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("4d6+1d10", "electricity")], f: [D("8d6+2d10", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("16d6+4d10", "electricity"), D("2d6", "electricity", "persistent"), Z("stunned", 2), T("und das Blitzmal", "and the lightning mark")]
      }
    },
    aussehen: { de: ["Blitzmal", "Verästelte Blitzfiguren auf der Haut, das Haar steht ab."], en: ["Lightning Mark", "Branching lightning figures on the skin, hair standing on end."], toenung: "#d8d0ff", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Gewitterstein", ausloeser: betretenAus.de,
      beschreibung: "Ein flacher Stein mit eingeritzten Zackenlinien, halb im Gras versunken.",
      wirkung: "Blitze springen auf bis zu drei Kreaturen im Wirkungsbereich.",
      entschaerfen: "den Stein erden", ruecksetzen: "Lädt sich bei Gewitter oder nach 1 Tag neu."
    },
    en: {
      name: "Storm Stone", ausloeser: betretenAus.en,
      beschreibung: "A flat stone carved with zigzag lines, half sunk into the grass.",
      wirkung: "Lightning leaps to up to three creatures in the area.",
      entschaerfen: "ground the stone", ruecksetzen: "Recharges in a thunderstorm or after 1 day."
    }
  },
  {
    id: "gelaende-ruf-der-tiefe", art: "gelaende", stufe: 5, merkmale: ["magical", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["nature", 23, 2], ["arcana", 23, 2]],
    beschwoerung: { stufe: 8, runden: 10, ort: "falle" },
    de: {
      name: "Ruf der Tiefe", ausloeser: betretenAus.de,
      beschreibung: "Ein Ring aus kleinen Steinen, kaum von Geröll zu unterscheiden.",
      wirkung: "Der Boden bricht auf, und eine Kreatur bis Stufe 8 steigt in der Mitte des Rings heraus. Sie würfelt sofort Initiative, greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Der Auslösebereich wird schwieriges Gelände. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "einen Stein des Rings herausnehmen, ohne den Ruf zu wecken", ruecksetzen: "Keines."
    },
    en: {
      name: "Call of the Deep", ausloeser: betretenAus.en,
      beschreibung: "A ring of small stones, hard to tell from scree.",
      wirkung: "The ground bursts open and a creature of up to level 8 climbs out at the centre of the ring. It rolls initiative at once, attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The trigger area becomes difficult terrain. The GM picks the creature when placing the trap.",
      entschaerfen: "remove one stone of the ring without waking the call", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende-wuergranken", art: "gelaende", stufe: 5, merkmale: ["magical", "plant", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: 0, wirkung: 15, werte: { rk: 20, haerte: 5, tp: 30 },
    entschaerfen: [["nature", 22, 1], ["survival", 23, 2]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("3d8", "bludgeoning"), Z("off-guard", null, "r1")],
        f: [D("6d8+10", "bludgeoning"), Z("restrained"), T("(Entkommen SG 23)", "(Escape DC 23)")],
        kf: [D("12d8+10", "bludgeoning"), Z("restrained"), T("(Entkommen SG 23), dazu 4W8 Wucht zu Beginn jedes ihrer Züge, solange sie gebunden ist", "(Escape DC 23), and 4d8 bludgeoning at the start of each of its turns while restrained")]
      }
    },
    de: {
      name: "Würgranken", ausloeser: feldAus.de,
      beschreibung: "Unter dem Boden schlafende Ranken, von einem Zauber geweckt.",
      wirkung: "Ranken schießen aus dem Boden. Der Wirkungsbereich bleibt 1 Minute schwieriges Gelände.",
      entschaerfen: "die Ranken beruhigen oder die Wurzel kappen", ruecksetzen: "Wächst in 1 Tag nach."
    },
    en: {
      name: "Strangling Vines", ausloeser: feldAus.en,
      beschreibung: "Vines sleeping under the ground, woken by a spell.",
      wirkung: "Vines burst from the ground. The area stays difficult terrain for 1 minute.",
      entschaerfen: "calm the vines or sever the root", ruecksetzen: "Grows back in 1 day."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum-wandspeere", art: "raum", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 22, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 22, 1]],
    angriff: { bonus: 17, schaden: [D("5d10+10", "piercing"), D("1d8", "bleed", "persistent")], hoechstens: null, nah: true },
    de: {
      name: "Wandspeere", ausloeser: "Eine Kreatur betritt die Druckplatte.",
      beschreibung: "Eine Druckplatte im Boden, in den Wänden des Gangs verborgene Speeröffnungen.",
      wirkung: "Speere schießen aus den Wänden: je ein Nahkampf-Angriff +17 gegen jede Kreatur im Wirkungsbereich, 5W10+10 Stich und 1W8 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden, und das Ziel hängt am Speer fest, Bewegungsunfähig, bis es sich losreißt (Athletik SG 23).",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Setzt sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Wall Spears", ausloeser: "A creature steps on the pressure plate.",
      beschreibung: "A pressure plate in the floor, spear slots hidden in the walls of the corridor.",
      wirkung: "Spears shoot from the walls: one melee Strike +17 against each creature in the area, 5d10+10 piercing and 1d8 persistent bleed.",
      krit: "Critical hit: double damage, and the target is pinned on the spear, immobilized until it tears free (Athletics DC 23).",
      entschaerfen: "wedge the plate", ruecksetzen: "Resets itself after 1 minute."
    },
    kritZ: [Z("immobilized")]
  },
  {
    id: "raum-pendelklinge", art: "raum", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 23, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 22, haerte: 12, tp: 50 },
    entschaerfen: [["thievery", 22, 1], ["athletics", 24, 0]],
    angriff: { bonus: 17, schaden: [D("7d8+15", "slashing")], hoechstens: null, nah: true },
    de: {
      name: "Pendelklinge", ausloeser: "Eine Kreatur betritt das Auslösefeld.",
      beschreibung: "Ein Schlitz in der Decke, darüber eine schwere Klinge an einem Pendel.",
      wirkung: "Die Klinge schwingt herab: Nahkampf-Angriff +17 gegen jede Kreatur in der Bahn, 7W8+15 Hieb.",
      krit: "Kritischer Treffer: doppelter Schaden, 2W8 anhaltende Blutung und Liegend.",
      entschaerfen: "das Pendel blockieren oder die Klinge festhalten", ruecksetzen: "Schwingt zurück, nach 1 Runde wieder bereit."
    },
    en: {
      name: "Pendulum Blade", ausloeser: "A creature enters the trigger square.",
      beschreibung: "A slot in the ceiling, above it a heavy blade on a pendulum.",
      wirkung: "The blade swings down: melee Strike +17 against each creature in its path, 7d8+15 slashing.",
      krit: "Critical hit: double damage, 2d8 persistent bleed and prone.",
      entschaerfen: "block the pendulum or hold the blade", ruecksetzen: "Swings back, ready again after 1 round."
    },
    kritZ: [Z("prone")]
  },
  {
    id: "raum-kippboden", art: "raum", stufe: 5, merkmale: ["mechanical", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 5, wirkung: 10, werte: { rk: 22, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 23, 2]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [T("greift die Kante", "grabs the edge")], e: [T("greift die Kante", "grabs the edge")],
        f: [T("stürzt 60 Fuß tief in den Schacht, Geröll rutscht nach", "falls 60 feet down the shaft, scree slides after"), D("30+2d10", "bludgeoning"), Z("prone")],
        kf: [T("stürzt kopfüber in den Schacht und wird vom Geröll begraben", "plunges head first down the shaft and is buried by scree"), D("30+6d10", "bludgeoning"), Z("prone"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Kippender Boden", ausloeser: betretenAus.de,
      beschreibung: "Ein Bodenstück auf einer Achse, darunter ein 60 Fuß tiefer Schacht.",
      wirkung: "Der Boden kippt. Herausklettern Athletik SG 23.",
      entschaerfen: "die Achse verkeilen", ruecksetzen: "Kippt von selbst zurück."
    },
    en: {
      name: "Tipping Floor", ausloeser: betretenAus.en,
      beschreibung: "A section of floor on an axle, a 60-foot shaft below.",
      wirkung: "The floor tips. Climbing out takes Athletics DC 23.",
      entschaerfen: "wedge the axle", ruecksetzen: "Tips back on its own."
    }
  },
  {
    id: "raum-flammensaeule", art: "raum", stufe: 5, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 22, 1], ["thievery", 24, 2]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("5d6", "fire")], f: [D("10d6", "fire"), D("2d6", "fire", "persistent")],
        kf: [D("20d6", "fire"), D("3d6", "fire", "persistent"), Z("dazzled", null, "m1"), T("und das Brandmal", "and the burn mark")]
      }
    },
    aussehen: { de: ["Brandmal", "Verrußte, gerötete Haut, versengtes Haar."], en: ["Burn Mark", "Sooty, reddened skin, singed hair."], toenung: "#d08060", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Flammensäulen-Rune", ausloeser: betretenAus.de,
      beschreibung: "Eine Rune im Bodenmosaik in der Mitte des Raums.",
      wirkung: "Feuersäulen schießen aus dem Boden.",
      entschaerfen: "die Rune bannen oder aus dem Mosaik brechen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Rune of Fire Pillars", ausloeser: betretenAus.en,
      beschreibung: "A rune in the floor mosaic at the centre of the room.",
      wirkung: "Pillars of fire burst from the floor.",
      entschaerfen: "dispel the rune or break it out of the mosaic", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum-giftnebel", art: "raum", stufe: 5, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 24, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 20, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 23, 2], ["crafting", 22, 1]],
    gift: {
      typ: "fortitude", dc: 23, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("4d6", "poison"), Z("clumsy", 1)],
        [D("6d6", "poison"), Z("clumsy", 2)],
        [D("8d6", "poison"), Z("clumsy", 3), Z("slowed", 1)]
      ]
    },
    de: {
      name: "Giftnebel-Düsen", ausloeser: betretenAus.de,
      beschreibung: "Feine Düsen in den Fugen der Wände, eine lose Bodenplatte als Auslöser.",
      wirkung: "Nebel füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Nervengift.", gift: "Nervengift",
      entschaerfen: "die Düsen verstopfen", ruecksetzen: "Behälter neu füllen."
    },
    en: {
      name: "Poison Mist Nozzles", ausloeser: betretenAus.en,
      beschreibung: "Fine nozzles in the joints of the walls, a loose floor slab as the trigger.",
      wirkung: "Mist fills the area for 1 minute. A creature starting its turn inside rolls again. Nerve poison.", gift: "Nerve poison",
      entschaerfen: "plug the nozzles", ruecksetzen: "Refill the tank."
    }
  },
  {
    id: "raum-kraftkaefig", art: "raum", stufe: 5, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 24, 2], ["thievery", 25, 2]],
    wurf: {
      typ: "reflex", dc: 23, grade: {
        ke: [], e: [D("5d6+1d10", "force")], f: [D("9d6+2d10", "force"), Z("prone")],
        kf: [D("18d6+4d10", "force"), Z("prone"), Z("stunned", 2)]
      }
    },
    de: {
      name: "Kraftkäfig", ausloeser: betretenAus.de,
      beschreibung: "Eine Rune im Türsturz, eine zweite unter einer Bodenplatte in der Raummitte.",
      wirkung: "Wände aus Kraft verschließen alle Ausgänge des Raums für 1 Minute, und der Käfig entlädt sich nach innen. Jede Kraftwand hat Härte 10 und 40 TP.",
      entschaerfen: "eine der beiden Runen bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Force Cage", ausloeser: betretenAus.en,
      beschreibung: "A rune in the lintel, a second one beneath a floor slab at the centre of the room.",
      wirkung: "Walls of force seal every exit of the room for 1 minute, and the cage discharges inwards. Each wall of force has Hardness 10 and 40 HP.",
      entschaerfen: "dispel one of the two runes", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum-laehmrune", art: "raum", stufe: 5, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 23, 2], ["arcana", 24, 2]],
    wurf: {
      typ: "will", dc: 23, grade: {
        ke: [], e: [D("4d8", "mental"), Z("slowed", 1, "r1")], f: [D("8d8", "mental"), Z("slowed", 1, "m1")],
        kf: [D("16d8", "mental"), Z("paralyzed", null, "r1"), T("danach", "then"), Z("slowed", 2, "m1")]
      }
    },
    de: {
      name: "Lähmrune", ausloeser: "Eine Kreatur betritt die Platte unter der Rune.",
      beschreibung: "Eine Rune in der Decke, die aufleuchtet, sobald jemand die Platte darunter betritt.",
      wirkung: "Die Rune lähmt den Geist aller im Raum.",
      entschaerfen: "die Rune lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Rune of Paralysis", ausloeser: "A creature steps on the slab beneath the rune.",
      beschreibung: "A rune in the ceiling that lights up as soon as someone steps on the slab below.",
      wirkung: "The rune seizes the minds of everyone in the room.",
      entschaerfen: "unravel the rune", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum-erwachender-waechter", art: "raum", stufe: 5, merkmale: ["magical", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 24, 2], ["religion", 24, 2]],
    beschwoerung: { stufe: 8, runden: null, ort: "falle" },
    de: {
      name: "Erwachender Wächter", ausloeser: betretenAus.de,
      beschreibung: "Eine Statue, Rüstung oder ein Wandrelief, darin eine schlafende Bindung.",
      wirkung: "Der Wächter erwacht: Eine Kreatur bis Stufe 8 erscheint an der Stelle der Statue und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Bindung lösen, solange der Wächter schläft", ruecksetzen: "Keines."
    },
    en: {
      name: "Awakening Guardian", ausloeser: betretenAus.en,
      beschreibung: "A statue, suit of armour or wall relief holding a sleeping binding.",
      wirkung: "The guardian awakens: a creature of up to level 8 appears where the statue stood and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "release the binding while the guardian sleeps", ruecksetzen: "None."
    }
  }
];

export const FALLEN = [...STUFE_1, ...STUFE_2, ...STUFE_3, ...STUFE_4, ...STUFE_5, ...STUFE_6, ...STUFE_7, ...STUFE_8, ...STUFE_9, ...STUFE_10];
