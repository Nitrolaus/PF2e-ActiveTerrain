// Eigene Fallen Stufe 3 (0.10.0, 07.11.2026: "gerecht für die normalen PF2e-Spieler, die nicht so starke Gruppen haben
// und eventuell nicht so gut heilen können"). Maßstab wie Stufe 1 (siehe fallen-stufe-1.mjs), zwei Stufen höher:
// Rettungswurf SG 20, Angriff +12, Heimlichkeit 17 bis 20, Entschärfen 17 bis 20, Mindestgrad höchstens Geübt.
// Ein Fehlschlag wirft eine zerbrechliche Figur der Stufe 3 (24 TP) mit vollen TP nicht um, ein kritischer Fehlschlag
// tötet nie sofort (höchster Wurf unter 48). Keine langen Zustände, Zustände höchstens 1 Minute; Verwirrt nur für
// 1 Runde beim kritischen Fehlschlag. Herbeigerufene Gegner bis Stufe 4. Die äußere Veränderung verblasst nach 1 Tag.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante und stürzt nicht", "grabs the edge and does not fall");
const tag = { value: 1, unit: "days" };

export const STUFE_3 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer3-kantenklinge", art: "tuer", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 20, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 19, 1]],
    angriff: { bonus: 12, schaden: [D("2d8+6", "slashing"), D("1d4", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Klinge in der Türkante", ausloeser: AUS.tuer.de,
      beschreibung: "In der Kante des Türblatts verläuft ein feiner Schlitz, darin eine gefederte Klinge.",
      wirkung: "Die Klinge fährt seitlich heraus: Nahkampf-Treffer (ohne Angriffswurf) gegen die öffnende Kreatur, 2W8+6 Hieb und 1W4 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "die Klinge mit einem Keil im Schlitz festsetzen", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Blade in the Door Edge", ausloeser: AUS.tuer.en,
      beschreibung: "A fine slit runs along the edge of the door leaf, a sprung blade inside it.",
      wirkung: "The blade shoots out sideways: melee hit (no attack roll) against the creature opening the door, 2d8+6 slashing and 1d4 persistent bleed.",
      krit: "Critical hit: double damage.",
      entschaerfen: "fix the blade in the slit with a wedge", ruecksetzen: "Rearm by hand."
    }
  },
  {
    id: "tuer3-steinblock", art: "tuer", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 19, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 18, 1], ["athletics", 20, 0]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "bludgeoning")], f: [D("2d8+6", "bludgeoning"), Z("prone")],
        kf: [D("4d8+12", "bludgeoning"), Z("immobilized"), T("eingeklemmt bis Entkommen SG 20", "pinned until it Escapes (DC 20)")]
      }
    },
    de: {
      name: "Fallender Steinblock", ausloeser: AUS.tuer.de,
      beschreibung: "Der Türsturz besteht aus einem losen Block, der nur auf zwei Holzkeilen ruht.",
      wirkung: "Die Keile rutschen weg, und der Block fällt in den Türrahmen.",
      entschaerfen: "die Keile mit Nägeln sichern", ruecksetzen: "Block mit Hebeln wieder aufsetzen (1 Stunde)."
    },
    en: {
      name: "Falling Stone Block", ausloeser: AUS.tuer.en,
      beschreibung: "The lintel is a loose block resting only on two wooden wedges.",
      wirkung: "The wedges slip away and the block drops into the door frame.",
      entschaerfen: "secure the wedges with nails", ruecksetzen: "Lever the block back into place (1 hour)."
    }
  },
  {
    id: "tuer3-dampfventil", art: "tuer", stufe: 3, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 19, haerte: 8, tp: 30 },
    entschaerfen: [["thievery", 18, 1], ["crafting", 18, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "fire")], f: [D("3d6+5", "fire")],
        kf: [D("6d6+10", "fire"), Z("dazzled", null, "r1")]
      }
    },
    de: {
      name: "Dampfventil an der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Neben der Tür verläuft ein Kupferrohr in der Wand, die Steine darum sind warm und feucht.",
      wirkung: "Ein Ventil springt auf, und kochender Dampf schießt in den Türrahmen.",
      entschaerfen: "das Ventil zudrehen und festbinden", ruecksetzen: "Kessel dahinter neu anheizen."
    },
    en: {
      name: "Steam Valve at the Door", ausloeser: AUS.tuer.en,
      beschreibung: "A copper pipe runs in the wall beside the door, the stones around it warm and damp.",
      wirkung: "A valve springs open and scalding steam shoots into the doorway.",
      entschaerfen: "close the valve and tie it shut", ruecksetzen: "Stoke the boiler behind it again."
    }
  },
  {
    id: "tuer3-vipernzahn", art: "tuer", stufe: 3, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 18, haerte: 5, tp: 16 },
    entschaerfen: [["thievery", 19, 1]],
    gift: {
      typ: "fortitude", dc: 20, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("1d10", "poison"), Z("enfeebled", 1)],
        [D("2d8", "poison"), Z("enfeebled", 1), Z("sickened", 1)],
        [D("2d8+4", "poison"), Z("enfeebled", 2), Z("sickened", 1)]
      ]
    },
    de: {
      name: "Vipernzahn im Türgriff", ausloeser: AUS.tuer.de,
      beschreibung: "Im Griff steckt ein echter Schlangenzahn, die Spitze zeigt zur Handfläche.",
      wirkung: "Der Zahn bohrt sich in die Hand der öffnenden Kreatur. Vipernspeichel.", gift: "Vipernspeichel",
      entschaerfen: "den Zahn mit einer Zange herausbrechen", ruecksetzen: "Zahn neu vergiften."
    },
    en: {
      name: "Viper Fang in the Handle", ausloeser: AUS.tuer.en,
      beschreibung: "A real snake fang is set into the handle, its tip pointing at the palm.",
      wirkung: "The fang bores into the hand of the creature opening the door. Viper spittle.", gift: "Viper spittle",
      entschaerfen: "break the fang out with pliers", ruecksetzen: "Poison the fang again."
    }
  },
  {
    id: "tuer3-flammenbogen", art: "tuer", stufe: 3, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "fire")], f: [D("2d8+6", "fire")],
        kf: [D("4d8+12", "fire"), D("1d6", "fire", "persistent"), T("und versengtes Haar", "and singed hair")]
      }
    },
    aussehen: { de: ["Versengtes Haar", "Das Haar ist an den Spitzen verkohlt und riecht nach Rauch. Verblasst nach 1 Tag."], en: ["Singed Hair", "The hair is charred at the tips and smells of smoke. Fades after 1 day."], toenung: "#c89070", dauer: tag },
    de: {
      name: "Flammenbogen", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Tür ist ein Bogen aus roten Ziegeln gemauert, jeder trägt ein winziges Zeichen.",
      wirkung: "Die Ziegel glühen auf, und ein Bogen aus Flammen schlägt über alle vor der Tür.",
      entschaerfen: "das Zeichen im Schlussstein bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Arch of Flame", ausloeser: AUS.tuer.en,
      beschreibung: "An arch of red bricks is set above the door, each bearing a tiny sign.",
      wirkung: "The bricks glow and an arch of flame lashes over everyone in front of the door.",
      entschaerfen: "dispel the sign in the keystone", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer3-wirrtuer", art: "tuer", stufe: 3, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 19, 1], ["arcana", 20, 1]],
    wurf: {
      typ: "will", dc: 20, grade: {
        ke: [], e: [Z("stupefied", 1, "r1")], f: [D("2d8+6", "mental"), Z("stupefied", 1, "m1")],
        kf: [D("4d8+12", "mental"), Z("confused", null, "r1"), Z("stupefied", 2, "m1")]
      }
    },
    de: {
      name: "Tür der Verwirrung", ausloeser: AUS.tuer.de,
      beschreibung: "Die Maserung des Türblatts bildet Wirbel, die sich beim Hinsehen zu bewegen scheinen.",
      wirkung: "Die Wirbel ziehen den Blick an und verdrehen die Gedanken aller vor der Tür.",
      entschaerfen: "die Tür mit geschlossenen Augen ertasten und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Door of Bewilderment", ausloeser: AUS.tuer.en,
      beschreibung: "The grain of the door leaf forms whorls that seem to move when looked at.",
      wirkung: "The whorls draw the gaze and twist the thoughts of everyone in front of the door.",
      entschaerfen: "feel out the door with closed eyes and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer3-frosthauch", art: "tuer", stufe: 3, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 5, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "fortitude", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "cold")], f: [D("4d4+6", "cold"), Z("slowed", 1, "r1")],
        kf: [D("8d4+12", "cold"), Z("slowed", 1, "r1"), Z("clumsy", 1, "m1")]
      }
    },
    de: {
      name: "Frosthauch-Glyphe", ausloeser: AUS.tuer.de,
      beschreibung: "Eine blasse Glyphe auf der Schwelle, um sie herum ist der Stein feucht und kalt.",
      wirkung: "Ein eisiger Hauch steigt aus der Schwelle und lässt die Glieder aller im Türrahmen erstarren.",
      entschaerfen: "die Glyphe mit warmem Wasser lösen oder bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Glyph of Frost Breath", ausloeser: AUS.tuer.en,
      beschreibung: "A pale glyph on the threshold, the stone around it damp and cold.",
      wirkung: "An icy breath rises from the threshold and stiffens the limbs of everyone in the doorway.",
      entschaerfen: "loosen the glyph with warm water or dispel it", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer3-wachbann", art: "tuer", stufe: 3, merkmale: ["magical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 20, 1]],
    beschwoerung: { stufe: 4, runden: 10, ort: "neben" },
    de: {
      name: "Wächterbann an der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Band aus eingeritzten Zeichen läuft um den ganzen Türrahmen.",
      wirkung: "Der Bann ruft einen Wächter herbei: Eine Kreatur bis Stufe 4 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Band an einer Stelle durchschneiden", ruecksetzen: "Keines."
    },
    en: {
      name: "Door Warden Binding", ausloeser: AUS.tuer.en,
      beschreibung: "A band of carved signs runs around the whole door frame.",
      wirkung: "The binding calls a warden: a creature of up to level 4 appears in a free square next to the door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "cut the band at one point", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss3-giftbalg", art: "schloss", stufe: 3, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: "knopf", wirkung: 5, werte: { rk: 18, haerte: 4, tp: 14 },
    entschaerfen: [["thievery", 19, 1], ["crafting", 18, 1]],
    gift: {
      typ: "fortitude", dc: 20, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("1d10", "poison"), Z("sickened", 1)],
        [D("2d8", "poison"), Z("sickened", 1), Z("clumsy", 1)],
        [D("2d8+4", "poison"), Z("sickened", 2), Z("clumsy", 1)]
      ]
    },
    de: {
      name: "Giftbalg im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Hinter dem Schlossblech sitzt ein kleiner Lederbalg, das Schlüsselloch ist innen gelblich.",
      wirkung: "Der Balg presst eine Wolke Giftstaub aus dem Schlüsselloch. Gelbstaub.", gift: "Gelbstaub",
      entschaerfen: "das Schlüsselloch mit Wachs verschließen und den Balg ausbauen", ruecksetzen: "Balg neu füllen."
    },
    en: {
      name: "Poison Bellows in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A small leather bellows sits behind the lock plate, the keyhole yellowish inside.",
      wirkung: "The bellows puffs a cloud of poison dust out of the keyhole. Yellow dust.", gift: "Yellow dust",
      entschaerfen: "seal the keyhole with wax and remove the bellows", ruecksetzen: "Refill the bellows."
    }
  },
  {
    id: "schloss3-bohrdorn", art: "schloss", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 20, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 19, 1]],
    angriff: { bonus: 12, schaden: [D("1d12+8", "piercing")], hoechstens: 1, nah: true },
    de: {
      name: "Bohrdorn im Deckel", ausloeser: AUS.schloss.de,
      beschreibung: "Im Deckel sitzt ein gewundener Dorn, der beim Öffnen nach unten schnellt.",
      wirkung: "Der Dorn stößt herab: Nahkampf-Treffer (ohne Angriffswurf) gegen die öffnende Kreatur, 1W12+8 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "den Deckel nur einen Spalt heben und die Feder blockieren", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Drill Spike in the Lid", ausloeser: AUS.schloss.en,
      beschreibung: "A twisted spike sits in the lid and snaps downward when it opens.",
      wirkung: "The spike stabs down: melee hit (no attack roll) against the creature opening it, 1d12+8 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "lift the lid only a crack and block the spring", ruecksetzen: "Rearm by hand."
    }
  },
  {
    id: "schloss3-fingerzwinge", art: "schloss", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 19, haerte: 8, tp: 30 },
    entschaerfen: [["thievery", 18, 1], ["athletics", 20, 0]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [Z("off-guard", null, "r1")],
        f: [D("2d8+6", "bludgeoning"), Z("immobilized"), T("(Entkommen SG 20), die Hand steckt in der Zwinge", "(Escape DC 20), the hand is caught in the clamp")],
        kf: [D("4d8+12", "bludgeoning"), Z("immobilized"), T("(Entkommen SG 20)", "(Escape DC 20)"), Z("clumsy", 1, "m1")]
      }
    },
    de: {
      name: "Fingerzwinge", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schlüsselloch ist ungewöhnlich weit, dahinter liegen zwei eiserne Backen.",
      wirkung: "Die Backen schnappen um Finger und Hand der Kreatur am Schloss.",
      entschaerfen: "einen Holzspan zwischen die Backen schieben", ruecksetzen: "Von Hand aufziehen."
    },
    en: {
      name: "Finger Clamp", ausloeser: AUS.schloss.en,
      beschreibung: "The keyhole is unusually wide, two iron jaws lie behind it.",
      wirkung: "The jaws snap shut around fingers and hand of the creature at the lock.",
      entschaerfen: "slide a wooden chip between the jaws", ruecksetzen: "Wind it open by hand."
    }
  },
  {
    id: "schloss3-gewitterkaestchen", art: "schloss", stufe: 3, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: "knopf", wirkung: 5, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "electricity")], f: [D("2d8+6", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("4d8+12", "electricity"), Z("stunned", 1), T("und silberne Adern", "and silver veins")]
      }
    },
    aussehen: { de: ["Silberne Adern", "Feine silbrige Linien ziehen sich wie Blitze über die Haut. Verblasst nach 1 Tag."], en: ["Silver Veins", "Fine silvery lines run across the skin like lightning. Fades after 1 day."], toenung: "#c8c8e8", dauer: tag },
    de: {
      name: "Gewitterkästchen", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Kästchen mit Beschlägen aus Kupfer, das bei Berührung leise summt.",
      wirkung: "Ein Blitz bricht aus den Beschlägen und springt auf alle in der Nähe.",
      entschaerfen: "die Beschläge mit einem Lederstreifen umwickeln und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Storm Casket", ausloeser: AUS.schloss.en,
      beschreibung: "A casket with copper fittings that hums softly when touched.",
      wirkung: "Lightning bursts from the fittings and leaps to everyone nearby.",
      entschaerfen: "wrap the fittings in a leather strip and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss3-schattensiegel", art: "schloss", stufe: 3, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["religion", 19, 1], ["occultism", 20, 1]],
    wurf: {
      typ: "fortitude", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "void")], f: [D("2d8+6", "void"), Z("enfeebled", 1, "r1")],
        kf: [D("4d8+12", "void"), Z("enfeebled", 1, "m1"), Z("frightened", 1)]
      }
    },
    de: {
      name: "Siegel aus schwarzem Wachs", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel aus schwarzem Wachs, das kein Licht zurückwirft.",
      wirkung: "Aus dem Siegel kriecht ein Schatten den Arm hinauf und zehrt an der Kraft der Kreatur.",
      entschaerfen: "das Siegel mit Licht und einem Gebet lösen", ruecksetzen: "Lädt sich bei Sonnenuntergang neu."
    },
    en: {
      name: "Black Wax Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A seal of black wax that reflects no light.",
      wirkung: "A shadow creeps from the seal up the arm and gnaws at the creature's strength.",
      entschaerfen: "loosen the seal with light and a prayer", ruecksetzen: "Recharges at sunset."
    }
  },
  {
    id: "schloss3-aetzglyphe", art: "schloss", stufe: 3, merkmale: ["magical", "acid", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 19, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "acid")], f: [D("3d6+5", "acid")],
        kf: [D("6d6+10", "acid"), D("1d6", "acid", "persistent")]
      }
    },
    de: {
      name: "Ätzglyphe", ausloeser: AUS.schloss.de,
      beschreibung: "Eine grünliche Glyphe auf dem Schlossblech, das Metall darum ist leicht angefressen.",
      wirkung: "Die Glyphe zerfließt zu Säure und spritzt über die Hände der Kreatur am Schloss.",
      entschaerfen: "die Glyphe mit Kalk neutralisieren und bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Etching Glyph", ausloeser: AUS.schloss.en,
      beschreibung: "A greenish glyph on the lock plate, the metal around it slightly eaten away.",
      wirkung: "The glyph dissolves into acid and splashes over the hands of the creature at the lock.",
      entschaerfen: "neutralise the glyph with lime and dispel it", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss3-heulschloss", art: "schloss", stufe: 3, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "fortitude", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "sonic")], f: [D("2d8+6", "sonic"), Z("deafened", null, "m1")],
        kf: [D("4d8+12", "sonic"), Z("deafened", null, "m1"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Heulendes Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Schloss in Form eines Wolfskopfs, das Schlüsselloch sitzt im Maul.",
      wirkung: "Der Wolfskopf stößt ein Heulen aus, das Knochen erzittern lässt. Es ist 500 Fuß weit zu hören.",
      entschaerfen: "das Maul mit Stoff stopfen und die Rune im Hals lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Howling Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A lock shaped like a wolf's head, the keyhole sits in its jaws.",
      wirkung: "The wolf's head lets out a howl that makes bones tremble. It can be heard 500 feet away.",
      entschaerfen: "stuff the jaws with cloth and unravel the rune in the throat", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss3-kettensiegel", art: "schloss", stufe: 3, merkmale: ["magical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 20, 1], ["occultism", 20, 1]],
    beschwoerung: { stufe: 4, runden: 10, ort: "neben" },
    de: {
      name: "Kettensiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Eine dünne Kette liegt um die Truhe, ihr Schloss trägt ein Siegel mit einem Hundekopf.",
      wirkung: "Die Kette springt auf und ruft, was an sie gebunden war: Eine Kreatur bis Stufe 4 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Siegel von der Kette lösen, ohne sie zu öffnen", ruecksetzen: "Keines."
    },
    en: {
      name: "Chain Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A thin chain lies around the chest, its padlock bearing a seal with a hound's head.",
      wirkung: "The chain springs open and calls what was bound to it: a creature of up to level 4 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "loosen the seal from the chain without opening it", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende3-speergrube", art: "gelaende", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 18, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 10 Fuß tief zwischen stumpfe Speere", "falls 10 feet among blunt spears"), D("5", "bludgeoning"), D("1d8+6", "piercing"), Z("prone")],
        kf: [T("stürzt und wird von einem Speer gestreift", "falls and is grazed by a spear"), D("5", "bludgeoning"), D("4d8+10", "piercing"), Z("prone")]
      }
    },
    de: {
      name: "Speergrube", ausloeser: AUS.betreten.de,
      beschreibung: "Eine abgedeckte Grube, 10 Fuß tief, am Boden alte, schräg gestellte Speere.",
      wirkung: "Die Abdeckung bricht ein. Herausklettern Athletik SG 18.",
      entschaerfen: "die Abdeckung freilegen und überbrücken", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Spear Pit", ausloeser: AUS.betreten.en,
      beschreibung: "A covered pit, 10 feet deep, old spears set at an angle at the bottom.",
      wirkung: "The cover gives way. Climbing out takes Athletics DC 18.",
      entschaerfen: "uncover and bridge it", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende3-geroellrutsch", art: "gelaende", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["thievery", 18, 1], ["athletics", 19, 0]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "bludgeoning")], f: [D("2d8+6", "bludgeoning"), Z("prone")],
        kf: [D("4d8+12", "bludgeoning"), T("halb verschüttet", "half buried"), Z("immobilized"), T("bis Athletik SG 20", "until Athletics DC 20")]
      }
    },
    de: {
      name: "Geröllrutsch", ausloeser: AUS.betreten.de,
      beschreibung: "Über dem Pfad liegt loses Geröll hinter einem morschen Brett, ein Seil hält es.",
      wirkung: "Das Brett bricht, und das Geröll rutscht über den Pfad. Der Wirkungsbereich wird danach schwieriges Gelände.",
      entschaerfen: "das Brett mit Steinen abstützen und das Seil entlasten", ruecksetzen: "Keines."
    },
    en: {
      name: "Scree Slide", ausloeser: AUS.betreten.en,
      beschreibung: "Loose scree lies above the path behind a rotten board, held by a rope.",
      wirkung: "The board breaks and the scree slides across the path. The area becomes difficult terrain afterwards.",
      entschaerfen: "brace the board with stones and take the load off the rope", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende3-baerenfalle", art: "gelaende", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 20, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 18, 1], ["survival", 19, 1]],
    angriff: { bonus: 12, schaden: [D("2d8+6", "piercing")], hoechstens: 1, nah: true },
    de: {
      name: "Bärenfalle im Laub", ausloeser: AUS.feld.de,
      beschreibung: "Ein gezahntes Eisen liegt unter dem Laub, die Kette ist an einen Baum geschlagen.",
      wirkung: "Das Eisen schnappt zu: Nahkampf-Treffer (ohne Angriffswurf), 2W8+6 Stich. Treffer: Bewegungsunfähig (Entkommen SG 20 oder Athletik SG 20 zum Aufstemmen), solange das Eisen hält.",
      krit: "Kritischer Treffer: doppelter Schaden, dazu Auf dem Falschen Fuß, solange das Eisen hält.",
      entschaerfen: "die Feder mit einem Stock sperren", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Bear Trap in the Leaves", ausloeser: AUS.feld.en,
      beschreibung: "A toothed iron lies beneath the leaves, its chain nailed to a tree.",
      wirkung: "The jaws snap shut: melee hit (no attack roll), 2d8+6 piercing. Hit: immobilized (Escape DC 20 or Athletics DC 20 to pry open) while the trap holds.",
      krit: "Critical hit: double damage, and off-guard while the trap holds.",
      entschaerfen: "lock the spring with a stick", ruecksetzen: "Rearm by hand."
    },
    trefferZ: [Z("immobilized")], kritZ: [Z("immobilized"), Z("off-guard")]
  },
  {
    id: "gelaende3-hornissennest", art: "gelaende", stufe: 3, merkmale: ["environmental", "poison", "trap"],
    heimlichkeit: 17, rang: 0, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["nature", 17, 1], ["survival", 18, 1]],
    gift: {
      typ: "fortitude", dc: 20, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("1d10", "poison"), Z("sickened", 1)],
        [D("2d8", "poison"), Z("sickened", 1), Z("clumsy", 1)],
        [D("2d8+4", "poison"), Z("sickened", 2), Z("clumsy", 1)]
      ]
    },
    de: {
      name: "Hornissennest", ausloeser: AUS.betreten.de,
      beschreibung: "Ein graues Nest hängt tief im Geäst über dem Pfad, ein Summen liegt in der Luft.",
      wirkung: "Ein Ast streift das Nest, und ein Schwarm fällt über alle im Wirkungsbereich her. Hornissengift.", gift: "Hornissengift",
      entschaerfen: "das Nest mit Rauch betäuben und umgehen", ruecksetzen: "Der Schwarm beruhigt sich nach 10 Minuten."
    },
    en: {
      name: "Hornet Nest", ausloeser: AUS.betreten.en,
      beschreibung: "A grey nest hangs low in the branches above the path, a buzzing in the air.",
      wirkung: "A branch brushes the nest and a swarm falls upon everyone in the area. Hornet venom.", gift: "Hornet venom",
      entschaerfen: "stun the nest with smoke and skirt it", ruecksetzen: "The swarm calms down after 10 minutes."
    }
  },
  {
    id: "gelaende3-schlammloch", art: "gelaende", stufe: 3, merkmale: ["environmental", "trap"],
    heimlichkeit: 17, rang: 0, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 17, 1], ["nature", 18, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("immobilized"), T("(Entkommen SG 20), bis zur Hüfte im Schlamm", "(Escape DC 20), waist-deep in mud")],
        kf: [Z("restrained"), T("(Entkommen SG 20), bis zur Brust im Schlamm", "(Escape DC 20), chest-deep in mud"), Z("off-guard")]
      }
    },
    de: {
      name: "Zähes Schlammloch", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Stelle mit trockener Kruste und ein paar Grashalmen, darunter tiefer Schlamm.",
      wirkung: "Die Kruste bricht, und der Schlamm saugt die Beine fest. Andere können mit Seil oder Ast helfen (Athletik SG 18 als Hilfe).",
      entschaerfen: "die Stelle mit einem Stab prüfen und Äste darüberlegen", ruecksetzen: "Die Kruste schließt sich in 1 Tag."
    },
    en: {
      name: "Sucking Mud Hole", ausloeser: AUS.betreten.en,
      beschreibung: "A patch of dry crust and a few blades of grass, deep mud below.",
      wirkung: "The crust breaks and the mud sucks the legs fast. Others can help with a rope or branch (Athletics DC 18 to Aid).",
      entschaerfen: "test the spot with a pole and lay branches across", ruecksetzen: "The crust closes again in 1 day."
    }
  },
  {
    id: "gelaende3-moorlicht", art: "gelaende", stufe: 3, merkmale: ["magical", "mental", "light", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 19, 1], ["nature", 20, 1]],
    wurf: {
      typ: "will", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "mental")], f: [D("2d8+6", "mental"), Z("fascinated", null, "r1")],
        kf: [D("4d8+12", "mental"), Z("confused", null, "r1"), Z("fascinated", null, "r1")]
      }
    },
    de: {
      name: "Moorlicht", ausloeser: AUS.betreten.de,
      beschreibung: "Über dem Moor schweben fahle Lichter, eines bleibt immer in der Nähe des Pfads.",
      wirkung: "Das Licht flammt auf und zieht die Gedanken aller in der Nähe in einen Strudel.",
      entschaerfen: "das Licht mit einem Gegenzauber oder einem alten Moorspruch löschen", ruecksetzen: "Lädt sich bei Einbruch der Nacht neu."
    },
    en: {
      name: "Bog Light", ausloeser: AUS.betreten.en,
      beschreibung: "Pale lights float above the bog, one of them always staying close to the path.",
      wirkung: "The light flares and pulls the thoughts of everyone nearby into a whirl.",
      entschaerfen: "put out the light with a counterspell or an old bog charm", ruecksetzen: "Recharges at nightfall."
    }
  },
  {
    id: "gelaende3-sporenring", art: "gelaende", stufe: 3, merkmale: ["magical", "fungus", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["nature", 19, 1], ["survival", 20, 1]],
    wurf: {
      typ: "fortitude", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "poison")], f: [D("2d8+6", "poison"), Z("sickened", 1)],
        kf: [D("4d8+12", "poison"), Z("sickened", 2), T("und Moosflecken", "and moss patches")]
      }
    },
    aussehen: { de: ["Moosflecken", "Grünliche, weiche Flecken wie Moos auf Wangen und Händen. Verblasst nach 1 Tag."], en: ["Moss Patches", "Greenish, soft patches like moss on cheeks and hands. Fade after 1 day."], toenung: "#9cb88a", dauer: tag },
    de: {
      name: "Sporenring", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Kreis aus fahlen Pilzen im Gras, in der Mitte ist der Boden kahl.",
      wirkung: "Die Pilze platzen und stoßen eine dichte Sporenwolke aus.",
      entschaerfen: "die Pilze mit Wasser tränken und den Ring an einer Stelle aufbrechen", ruecksetzen: "Wächst in 1 Woche nach."
    },
    en: {
      name: "Spore Ring", ausloeser: AUS.betreten.en,
      beschreibung: "A circle of pallid mushrooms in the grass, the ground bare at its centre.",
      wirkung: "The mushrooms burst and release a dense cloud of spores.",
      entschaerfen: "soak the mushrooms with water and break the ring at one point", ruecksetzen: "Grows back in 1 week."
    }
  },
  {
    id: "gelaende3-totemruf", art: "gelaende", stufe: 3, merkmale: ["magical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["nature", 20, 1], ["religion", 20, 1]],
    beschwoerung: { stufe: 4, runden: 10, ort: "falle" },
    de: {
      name: "Totemruf", ausloeser: AUS.betreten.de,
      beschreibung: "Ein geschnitzter Pfahl mit Tierköpfen steht am Wegrand, Federn hängen daran.",
      wirkung: "Der Pfahl ruft seinen Hüter: Eine Kreatur bis Stufe 4 erscheint neben dem Totem und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "dem Totem eine Gabe darbringen und den Ruf besänftigen", ruecksetzen: "Keines."
    },
    en: {
      name: "Totem Call", ausloeser: AUS.betreten.en,
      beschreibung: "A carved pole with animal heads stands by the wayside, feathers hanging from it.",
      wirkung: "The pole calls its keeper: a creature of up to level 4 appears next to the totem and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "make an offering to the totem and soothe the call", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum3-wandklingen", art: "raum", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 20, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 19, 1]],
    angriff: { bonus: 12, schaden: [D("2d8+6", "slashing")], hoechstens: 2, nah: true },
    de: {
      name: "Klingen aus der Wandleiste", ausloeser: AUS.platte.de,
      beschreibung: "Eine Holzleiste läuft in Hüfthöhe um den Raum, dahinter liegen Schlitze im Stein.",
      wirkung: "Klingen schnellen aus der Leiste: je ein Nahkampf-Treffer (ohne Angriffswurf) gegen bis zu zwei Kreaturen im Wirkungsbereich, die auslösende zuerst, 2W8+6 Hieb.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "die Druckplatte verkeilen", ruecksetzen: "Setzt sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Blades from the Wall Moulding", ausloeser: AUS.platte.en,
      beschreibung: "A wooden moulding runs around the room at hip height, slits in the stone behind it.",
      wirkung: "Blades snap out of the moulding: one melee hit (no attack roll) each against up to two creatures in the area, the triggering one first, 2d8+6 slashing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "wedge the pressure plate", ruecksetzen: "Resets itself after 1 minute."
    }
  },
  {
    id: "raum3-senkdecke", art: "raum", stufe: 3, merkmale: ["mechanical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 5, wirkung: 10, werte: { rk: 20, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 18, 1], ["athletics", 20, 0]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "bludgeoning")], f: [D("2d8+6", "bludgeoning"), Z("prone")],
        kf: [D("4d8+12", "bludgeoning"), Z("immobilized"), T("eingeklemmt bis Athletik SG 20", "pinned until Athletics DC 20")]
      }
    },
    de: {
      name: "Senkende Decke", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Teil der Decke hängt eine Handbreit tiefer als der Rest, an den Wänden laufen Schienen.",
      wirkung: "Die Decke sackt bis auf Kniehöhe herab und hebt sich nach 1 Runde wieder.",
      entschaerfen: "die Schienen mit Eisenstangen blockieren", ruecksetzen: "Hebt sich von selbst."
    },
    en: {
      name: "Lowering Ceiling", ausloeser: AUS.betreten.en,
      beschreibung: "Part of the ceiling hangs a hand's breadth lower than the rest, rails run along the walls.",
      wirkung: "The ceiling drops to knee height and rises again after 1 round.",
      entschaerfen: "block the rails with iron bars", ruecksetzen: "Rises on its own."
    }
  },
  {
    id: "raum3-gelbnebel", art: "raum", stufe: 3, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 5, wirkung: 15, werte: { rk: 18, haerte: 5, tp: 20 },
    entschaerfen: [["thievery", 19, 1], ["crafting", 18, 1]],
    gift: {
      typ: "fortitude", dc: 20, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("1d10", "poison"), Z("sickened", 1)],
        [D("2d8", "poison"), Z("sickened", 1), Z("enfeebled", 1)],
        [D("2d8+4", "poison"), Z("sickened", 2), Z("enfeebled", 1)]
      ]
    },
    de: {
      name: "Gelbe Nebelkammer", ausloeser: AUS.betreten.de,
      beschreibung: "In den Ecken des Raums stehen Tonkrüge, verschlossen mit gelben Wachspfropfen.",
      wirkung: "Die Pfropfen springen heraus, und gelber Nebel füllt den Wirkungsbereich. Gelbnebel.", gift: "Gelbnebel",
      entschaerfen: "die Pfropfen mit Draht sichern", ruecksetzen: "Krüge neu füllen."
    },
    en: {
      name: "Yellow Fog Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "Clay jugs stand in the corners of the room, stoppered with yellow wax plugs.",
      wirkung: "The plugs pop out and yellow fog fills the area. Yellow fog.", gift: "Yellow fog",
      entschaerfen: "secure the plugs with wire", ruecksetzen: "Refill the jugs."
    }
  },
  {
    id: "raum3-kupferkuppel", art: "raum", stufe: 3, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "electricity")], f: [D("3d6+5", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("6d6+10", "electricity"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Kupferkuppel", ausloeser: AUS.betreten.de,
      beschreibung: "Die Decke ist eine grün angelaufene Kupferkuppel, in der Mitte hängt eine Kugel.",
      wirkung: "Die Kugel knistert, und Blitze regnen aus der Kuppel auf alle im Raum.",
      entschaerfen: "die Kugel mit einem Seil erden und den Zauber lösen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Copper Dome", ausloeser: AUS.betreten.en,
      beschreibung: "The ceiling is a green-tarnished copper dome, a sphere hanging at its centre.",
      wirkung: "The sphere crackles and lightning rains from the dome on everyone in the room.",
      entschaerfen: "ground the sphere with a rope and unravel the spell", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum3-traenenkammer", art: "raum", stufe: 3, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 19, 1], ["religion", 20, 1]],
    wurf: {
      typ: "will", dc: 20, grade: {
        ke: [], e: [Z("frightened", 1)], f: [D("2d8+6", "mental"), Z("frightened", 1), Z("stupefied", 1, "m1")],
        kf: [D("4d8+12", "mental"), Z("frightened", 2), Z("stupefied", 1, "m1"), T("und Tränenspuren", "and tear tracks")]
      }
    },
    aussehen: { de: ["Tränenspuren", "Dunkle Spuren wie von Tränen laufen über die Wangen. Verblasst nach 1 Tag."], en: ["Tear Tracks", "Dark tracks as of tears run down the cheeks. Fades after 1 day."], toenung: null, dauer: tag },
    de: {
      name: "Kammer der Tränen", ausloeser: AUS.betreten.de,
      beschreibung: "An den Wänden stehen Namen in langen Reihen, darunter kleine Schalen mit Wasser.",
      wirkung: "Eine Welle von Trauer erfasst alle im Raum, als hätten sie die Namen selbst verloren.",
      entschaerfen: "die Schalen leeren und die Toten mit einem Gebet ehren", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Chamber of Tears", ausloeser: AUS.betreten.en,
      beschreibung: "Names stand in long rows on the walls, small bowls of water beneath them.",
      wirkung: "A wave of grief seizes everyone in the room, as if they had lost the names themselves.",
      entschaerfen: "empty the bowls and honour the dead with a prayer", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum3-flammenkreis", art: "raum", stufe: 3, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "reflex", dc: 20, grade: {
        ke: [], e: [D("1d8+4", "fire")], f: [D("2d8+6", "fire")],
        kf: [D("4d8+12", "fire"), D("1d6", "fire", "persistent")]
      }
    },
    de: {
      name: "Flammenkreis im Boden", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Kreis aus eingelegtem Messing im Boden, die Fugen darin sind schwarz.",
      wirkung: "Der Kreis lodert auf, und eine Flammenwand schließt alle darin ein.",
      entschaerfen: "den Kreis mit einem Meißel unterbrechen oder bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Ring of Flame in the Floor", ausloeser: AUS.betreten.en,
      beschreibung: "A ring of inlaid brass in the floor, the joints within it black.",
      wirkung: "The ring blazes up and a wall of flame closes in everyone inside.",
      entschaerfen: "break the ring with a chisel or dispel it", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum3-schwere-kammer", art: "raum", stufe: 3, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 19, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "fortitude", dc: 20, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [D("4d4+6", "bludgeoning"), Z("prone"), Z("slowed", 1, "r1")],
        kf: [D("8d4+12", "bludgeoning"), Z("prone"), Z("slowed", 1, "r1"), Z("enfeebled", 1, "m1")]
      }
    },
    de: {
      name: "Schwere Kammer", ausloeser: AUS.betreten.de,
      beschreibung: "Der Boden des Raums ist leicht eingesunken, Staub liegt in kreisrunden Mustern.",
      wirkung: "Die Schwere im Raum verdreifacht sich für einen Augenblick und drückt alle zu Boden.",
      entschaerfen: "die Rune unter dem Mittelstein bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Heavy Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "The floor of the room is slightly sunken, dust lies in circular patterns.",
      wirkung: "The weight in the room triples for a moment and presses everyone to the ground.",
      entschaerfen: "dispel the rune beneath the centre stone", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum3-sarkophag", art: "raum", stufe: 3, merkmale: ["magical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 20, 1], ["arcana", 20, 1]],
    beschwoerung: { stufe: 4, runden: null, ort: "falle" },
    de: {
      name: "Sarg des Kriegers", ausloeser: AUS.betreten.de,
      beschreibung: "Ein steinerner Sarkophag, der Deckel trägt das Bild eines Kriegers mit gekreuzten Armen.",
      wirkung: "Der Deckel gleitet zur Seite: Eine Kreatur bis Stufe 4 steigt aus dem Sarkophag und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Deckel mit einem Segen versiegeln", ruecksetzen: "Keines."
    },
    en: {
      name: "Warrior's Coffin", ausloeser: AUS.betreten.en,
      beschreibung: "A stone sarcophagus, its lid bearing the image of a warrior with crossed arms.",
      wirkung: "The lid slides aside: a creature of up to level 4 climbs out of the sarcophagus and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "seal the lid with a blessing", ruecksetzen: "None."
    }
  }
];
