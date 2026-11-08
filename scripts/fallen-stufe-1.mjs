// Eigene Fallen Stufe 1 (0.10.0, 07.11.2026: "mach jetzt noch die Fallen 1 bis 4 gerecht für die normalen PF2e-Spieler,
// die nicht so starke Gruppen haben und eventuell nicht so gut heilen können"). Anderer Maßstab als ab Stufe 5:
// Werte nach GM Core (Gefahren bauen), jeweils die mildere Spalte. Rettungswurf SG 17 (hoch, nicht extrem), Angriff +9
// (Wert komplexer Gefahren), Heimlichkeit 14 bis 17, Entschärfen 15 bis 17, Mindestgrad höchstens Geübt.
// Gerecht heißt hier: Ein Fehlschlag wirft eine zerbrechliche Figur der Stufe 1 (Elf, Magier, 12 TP) mit vollen TP nicht
// um, ein kritischer Fehlschlag tötet nie sofort (höchster Wurf unter 24, dem Doppelten der TP). Keine langen Zustände,
// nichts, was nur Heilung oder Rast wieder abnimmt (kein Ausgelaugt, Todgeweiht, Gelähmt, Bewusstlos, Versteinert),
// Zustände höchstens 1 Minute. Herbeigerufene Gegner bis Stufe 2. Die äußere Veränderung verblasst nach 1 Tag.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante und stürzt nicht", "grabs the edge and does not fall");
const tag = { value: 1, unit: "days" };

export const STUFE_1 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer1-federarmbrust", art: "tuer", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 16, haerte: 5, tp: 20 },
    entschaerfen: [["thievery", 16, 1]],
    angriff: { bonus: 9, schaden: [D("1d8+3", "piercing")], hoechstens: 1 },
    de: {
      name: "Federarmbrust in der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Hinter einem Astloch im Türblatt sitzt eine kleine Federarmbrust, ein Faden läuft zur Angel.",
      wirkung: "Ein Bolzen schnellt durch das Astloch auf die öffnende Kreatur: Fernkampf-Angriff +9, 1W8+3 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "den Faden lösen, bevor die Tür weiter aufgeht", ruecksetzen: "Von Hand neu spannen (1 Minute)."
    },
    en: {
      name: "Spring Crossbow in the Door", ausloeser: AUS.tuer.en,
      beschreibung: "Behind a knothole in the door leaf sits a small spring crossbow, a thread runs to the hinge.",
      wirkung: "A bolt snaps through the knothole at the creature opening the door: ranged Strike +9, 1d8+3 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "loosen the thread before the door opens further", ruecksetzen: "Rearm by hand (1 minute)."
    }
  },
  {
    id: "tuer1-balken", art: "tuer", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 15, rang: 0, ausloeser: 0, wirkung: 5, werte: { rk: 15, haerte: 5, tp: 24 },
    entschaerfen: [["thievery", 15, 1], ["athletics", 17, 0]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "bludgeoning")], f: [D("2d4+3", "bludgeoning"), Z("prone")],
        kf: [D("4d4+6", "bludgeoning"), Z("prone"), Z("off-guard", null, "r1")]
      }
    },
    de: {
      name: "Herabfallender Balken", ausloeser: AUS.tuer.de,
      beschreibung: "Über dem Türsturz liegt ein loser Balken, mit einem Keil an der Tür verbunden.",
      wirkung: "Der Balken kippt herab und trifft alle unter dem Türsturz.",
      entschaerfen: "den Keil herausziehen oder den Balken festhalten", ruecksetzen: "Balken wieder auflegen."
    },
    en: {
      name: "Falling Beam", ausloeser: AUS.tuer.en,
      beschreibung: "A loose beam lies above the lintel, tied to the door by a wedge.",
      wirkung: "The beam tips down and strikes everyone under the lintel.",
      entschaerfen: "pull out the wedge or hold the beam", ruecksetzen: "Put the beam back in place."
    }
  },
  {
    id: "tuer1-pfeffertopf", art: "tuer", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 14, rang: 0, ausloeser: 0, wirkung: 5, werte: { rk: 14, haerte: 2, tp: 8 },
    entschaerfen: [["thievery", 15, 1], ["crafting", 15, 1]],
    wurf: {
      typ: "fortitude", dc: 17, grade: {
        ke: [], e: [Z("dazzled", null, "r1")], f: [Z("sickened", 1), Z("dazzled", null, "r1")],
        kf: [Z("sickened", 2), Z("blinded", null, "r1"), T("danach", "then"), Z("dazzled", null, "m1")]
      }
    },
    de: {
      name: "Pfeffertopf über der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Tontopf voll Pfeffer und Asche steht auf dem Türrahmen, angelehnt an das Türblatt.",
      wirkung: "Der Topf fällt und zerplatzt in einer beißenden Staubwolke.",
      entschaerfen: "den Topf vom Rahmen heben", ruecksetzen: "Neuen Topf füllen."
    },
    en: {
      name: "Pepper Pot above the Door", ausloeser: AUS.tuer.en,
      beschreibung: "A clay pot full of pepper and ash stands on the door frame, leaning against the door leaf.",
      wirkung: "The pot falls and bursts in a stinging cloud of dust.",
      entschaerfen: "lift the pot off the frame", ruecksetzen: "Fill a new pot."
    }
  },
  {
    id: "tuer1-giftsplitter", art: "tuer", stufe: 1, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 14, haerte: 3, tp: 10 },
    entschaerfen: [["thievery", 16, 1]],
    gift: {
      typ: "fortitude", dc: 17, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d6", "poison"), Z("sickened", 1)],
        [D("1d8+1", "poison"), Z("sickened", 1), Z("enfeebled", 1)],
        [D("2d4+2", "poison"), Z("sickened", 2), Z("enfeebled", 1)]
      ]
    },
    de: {
      name: "Vergifteter Türsplitter", ausloeser: AUS.tuer.de,
      beschreibung: "Am Griff steht ein Holzsplitter ab, dunkel verfärbt von einem Pflanzensaft.",
      wirkung: "Der Splitter fährt in die Hand der öffnenden Kreatur. Brechwurz.", gift: "Brechwurz",
      entschaerfen: "den Splitter mit Handschuh abbrechen", ruecksetzen: "Neuen Splitter einsetzen."
    },
    en: {
      name: "Poisoned Door Splinter", ausloeser: AUS.tuer.en,
      beschreibung: "A wooden splinter sticks out of the handle, stained dark by a plant sap.",
      wirkung: "The splinter drives into the hand of the creature opening the door. Retchwort.", gift: "Retchwort",
      entschaerfen: "break off the splinter with a glove", ruecksetzen: "Fit a new splinter."
    }
  },
  {
    id: "tuer1-funkenrune", art: "tuer", stufe: 1, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 5, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "fire")], f: [D("2d4+3", "fire")],
        kf: [D("4d4+6", "fire"), D("1d4", "fire", "persistent"), T("und das Rußgesicht", "and the sooty face")]
      }
    },
    aussehen: { de: ["Rußgesicht", "Schwarzer Ruß im Gesicht, angesengte Brauen. Verblasst nach 1 Tag."], en: ["Sooty Face", "Black soot on the face, singed brows. Fades after 1 day."], toenung: "#8c8070", dauer: tag },
    de: {
      name: "Funkenrune an der Klinke", ausloeser: AUS.tuer.de,
      beschreibung: "Eine kleine Rune ist in die Klinke geritzt, die Kerben sind schwarz verrußt.",
      wirkung: "Die Rune sprüht einen Funkenregen über alle vor der Tür.",
      entschaerfen: "die Rune bannen oder mit einem Messer zerkratzen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Spark Rune on the Handle", ausloeser: AUS.tuer.en,
      beschreibung: "A small rune is scratched into the handle, its notches black with soot.",
      wirkung: "The rune sprays a shower of sparks over everyone in front of the door.",
      entschaerfen: "dispel the rune or scratch it apart with a knife", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer1-spukfratze", art: "tuer", stufe: 1, merkmale: ["magical", "mental", "fear", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 16, 1], ["religion", 17, 1]],
    wurf: {
      typ: "will", dc: 17, grade: {
        ke: [], e: [Z("frightened", 1)], f: [Z("frightened", 2)],
        kf: [Z("frightened", 2), Z("fleeing", null, "r1")]
      }
    },
    de: {
      name: "Spukfratze an der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Eine geschnitzte Fratze ziert das Türblatt, die Augen sind mit Silber ausgelegt.",
      wirkung: "Die Fratze verzieht sich und kreischt, ein Bild aus Angst fährt in die Köpfe aller in der Nähe.",
      entschaerfen: "die Silberaugen herauslösen oder den Spuk austreiben", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Grimacing Door Face", ausloeser: AUS.tuer.en,
      beschreibung: "A carved grimace adorns the door leaf, its eyes inlaid with silver.",
      wirkung: "The face twists and shrieks, an image of fear drives into the minds of everyone nearby.",
      entschaerfen: "pry out the silver eyes or drive out the haunting", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer1-frostriegel", art: "tuer", stufe: 1, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "fortitude", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "cold")], f: [D("1d8+3", "cold"), Z("clumsy", 1, "r1")],
        kf: [D("2d8+6", "cold"), Z("clumsy", 1, "m1"), T("und Raureif im Haar", "and frost in the hair")]
      }
    },
    aussehen: { de: ["Raureif im Haar", "Weißer Reif in Haar und Wimpern, die Haut leicht bläulich. Verblasst nach 1 Tag."], en: ["Frost in the Hair", "White frost in hair and lashes, the skin faintly bluish. Fades after 1 day."], toenung: "#b8d4f0", dauer: tag },
    de: {
      name: "Frostriegel", ausloeser: AUS.tuer.de,
      beschreibung: "Der Eisenriegel ist auffallend kalt, feiner Reif sitzt in den Fugen.",
      wirkung: "Eisige Kälte schießt aus dem Riegel in die Hand der öffnenden Kreatur.",
      entschaerfen: "den Zauber im Riegel brechen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Frost Bolt Latch", ausloeser: AUS.tuer.en,
      beschreibung: "The iron bolt is strikingly cold, fine frost sits in the joints.",
      wirkung: "Icy cold shoots from the bolt into the hand of the creature opening the door.",
      entschaerfen: "break the spell in the bolt", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer1-wachruf", art: "tuer", stufe: 1, merkmale: ["magical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 17, 1]],
    beschwoerung: { stufe: 2, runden: 10, ort: "neben" },
    de: {
      name: "Wachruf an der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Kreidekreis auf der Schwelle, halb verwischt, darin ein kleines Zeichen.",
      wirkung: "Der Kreis ruft einen Wächter herbei: Eine Kreatur bis Stufe 2 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Kreidekreis an einer Stelle unterbrechen", ruecksetzen: "Keines."
    },
    en: {
      name: "Door Warden's Call", ausloeser: AUS.tuer.en,
      beschreibung: "A chalk circle on the threshold, half smudged, a small sign at its centre.",
      wirkung: "The circle calls a warden: a creature of up to level 2 appears in a free square next to the door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "break the chalk circle at one point", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss1-nesselnadel", art: "schloss", stufe: 1, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 16, haerte: 4, tp: 12 },
    entschaerfen: [["thievery", 16, 1]],
    gift: {
      typ: "fortitude", dc: 17, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d6", "poison"), Z("clumsy", 1)],
        [D("1d8+1", "poison"), Z("clumsy", 1), Z("off-guard")],
        [D("2d4+2", "poison"), Z("clumsy", 2), Z("off-guard")]
      ]
    },
    de: {
      name: "Nesselnadel im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Eine kurze Nadel sitzt im Schlüsselloch, an der Spitze ein grünlicher Belag.",
      wirkung: "Die Nadel sticht in den Finger. Nesselgift.", gift: "Nesselgift",
      entschaerfen: "die Nadel mit einer Zange herausziehen", ruecksetzen: "Nadel neu bestreichen."
    },
    en: {
      name: "Nettle Needle in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A short needle sits in the keyhole, a greenish coating on its tip.",
      wirkung: "The needle pricks the finger. Nettle venom.", gift: "Nettle venom",
      entschaerfen: "pull out the needle with pliers", ruecksetzen: "Coat the needle again."
    }
  },
  {
    id: "schloss1-schnappmesser", art: "schloss", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 15, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 16, haerte: 5, tp: 20 },
    entschaerfen: [["thievery", 15, 1]],
    angriff: { bonus: 9, schaden: [D("1d8+3", "slashing")], hoechstens: 1, nah: true },
    de: {
      name: "Schnappmesser im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Unter dem Schlossblech liegt eine gefederte Klinge, die beim Drehen herausschnellt.",
      wirkung: "Die Klinge schnappt heraus: Nahkampf-Angriff +9 gegen die Kreatur am Schloss, 1W8+3 Hieb.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "die Feder mit einem Draht festsetzen", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Snap Knife in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A sprung blade lies under the lock plate and snaps out when the lock is turned.",
      wirkung: "The blade snaps out: melee Strike +9 against the creature at the lock, 1d8+3 slashing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "pin the spring with a wire", ruecksetzen: "Rearm by hand."
    }
  },
  {
    id: "schloss1-tintenspritze", art: "schloss", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 14, rang: 0, ausloeser: "knopf", wirkung: 0, werte: { rk: 14, haerte: 2, tp: 8 },
    entschaerfen: [["thievery", 15, 1], ["crafting", 16, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [Z("dazzled", null, "r1")], f: [Z("blinded", null, "r1"), T("danach", "then"), Z("dazzled", null, "m1")],
        kf: [Z("blinded", null, "r1"), T("danach", "then"), Z("dazzled", null, "m1"), Z("off-guard", null, "r1")]
      }
    },
    de: {
      name: "Tintenspritze", ausloeser: AUS.schloss.de,
      beschreibung: "Eine Schweinsblase voll Tinte liegt hinter dem Schlüsselloch, ein Röhrchen zeigt nach außen.",
      wirkung: "Ein Strahl schwarzer Tinte spritzt der Kreatur am Schloss ins Gesicht.",
      entschaerfen: "das Röhrchen verstopfen", ruecksetzen: "Blase neu füllen."
    },
    en: {
      name: "Ink Squirt", ausloeser: AUS.schloss.en,
      beschreibung: "A pig's bladder full of ink lies behind the keyhole, a small tube pointing outwards.",
      wirkung: "A jet of black ink squirts into the face of the creature at the lock.",
      entschaerfen: "plug the tube", ruecksetzen: "Refill the bladder."
    }
  },
  {
    id: "schloss1-blitzschloss", art: "schloss", stufe: 1, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "electricity")], f: [D("2d4+3", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("4d4+6", "electricity"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Knisterndes Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Das Messingschloss knistert leise, wenn man ihm nahe kommt, die Haare an der Hand stellen sich auf.",
      wirkung: "Ein Blitz springt aus dem Schloss in die Kreatur, die es berührt.",
      entschaerfen: "den Zauber bannen oder das Schloss mit Holz erden", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Crackling Lock", ausloeser: AUS.schloss.en,
      beschreibung: "The brass lock crackles softly when approached, the hairs on the hand stand up.",
      wirkung: "A spark leaps from the lock into the creature touching it.",
      entschaerfen: "dispel the spell or ground the lock with wood", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss1-kichersiegel", art: "schloss", stufe: 1, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["occultism", 16, 1], ["arcana", 17, 1]],
    wurf: {
      typ: "will", dc: 17, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("slowed", 1, "r1"), Z("off-guard", null, "r1")],
        kf: [Z("slowed", 1, "r1"), Z("prone"), Z("off-guard", null, "m1")]
      }
    },
    de: {
      name: "Kichersiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Wachssiegel mit einem lachenden Gesicht verschließt den Deckel.",
      wirkung: "Das Siegel bricht, und die Kreatur am Schloss muss hemmungslos lachen.",
      entschaerfen: "das Siegel mit einem Gegenzauber lösen", ruecksetzen: "Keines, das Siegel ist verbraucht."
    },
    en: {
      name: "Giggling Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A wax seal with a laughing face closes the lid.",
      wirkung: "The seal breaks and the creature at the lock bursts into helpless laughter.",
      entschaerfen: "loosen the seal with a counterspell", ruecksetzen: "None, the seal is spent."
    }
  },
  {
    id: "schloss1-stossrune", art: "schloss", stufe: 1, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "force")], f: [D("1d8+3", "force"), T("5 Fuß zurückgestoßen", "pushed back 5 feet")],
        kf: [D("2d8+6", "force"), T("10 Fuß zurückgeschleudert", "hurled back 10 feet"), Z("prone")]
      }
    },
    de: {
      name: "Stoßrune am Deckel", ausloeser: AUS.schloss.de,
      beschreibung: "Eine faustgroße Rune auf dem Deckel, geformt wie eine offene Hand.",
      wirkung: "Die Rune stößt die Kreatur am Schloss mit einer Welle aus Kraft zurück.",
      entschaerfen: "die Rune bannen oder übermalen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Shove Rune on the Lid", ausloeser: AUS.schloss.en,
      beschreibung: "A fist-sized rune on the lid, shaped like an open hand.",
      wirkung: "The rune shoves the creature at the lock back with a wave of force.",
      entschaerfen: "dispel or paint over the rune", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "schloss1-klebeglyphe", art: "schloss", stufe: 1, merkmale: ["magical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 16, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("immobilized"), T("(Entkommen SG 17), die Hand klebt am Schloss", "(Escape DC 17), the hand sticks to the lock")],
        kf: [Z("immobilized"), T("(Entkommen SG 17), beide Hände kleben am Schloss", "(Escape DC 17), both hands stick to the lock"), Z("clumsy", 1, "m1")]
      }
    },
    de: {
      name: "Klebeglyphe", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schloss glänzt, als wäre es frisch lackiert, eine Glyphe schimmert darunter.",
      wirkung: "Die Oberfläche wird zäh wie Harz und hält fest, was sie berührt. Alarm: Ein heller Ton klingt durch den Raum.",
      entschaerfen: "die Glyphe lösen, ohne das Schloss zu berühren", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Sticky Glyph", ausloeser: AUS.schloss.en,
      beschreibung: "The lock gleams as if freshly varnished, a glyph shimmers beneath.",
      wirkung: "The surface turns thick as resin and holds whatever touches it. Alarm: a bright tone rings through the room.",
      entschaerfen: "unravel the glyph without touching the lock", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss1-waechtersiegel", art: "schloss", stufe: 1, merkmale: ["magical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 17, 1], ["occultism", 17, 1]],
    beschwoerung: { stufe: 2, runden: 10, ort: "neben" },
    de: {
      name: "Kleines Wächtersiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Ring kleiner Zeichen um das Schlüsselloch, eines davon zeigt ein Tier.",
      wirkung: "Das Siegel ruft einen Wächter herbei: Eine Kreatur bis Stufe 2 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Tierzeichen aus dem Ring kratzen", ruecksetzen: "Keines."
    },
    en: {
      name: "Lesser Warden Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A ring of small signs around the keyhole, one of them showing an animal.",
      wirkung: "The seal calls a warden: a creature of up to level 2 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "scratch the animal sign out of the ring", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende1-fallgrube", art: "gelaende", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 15, rang: 0, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 15, 1], ["thievery", 16, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 10 Fuß tief", "falls 10 feet"), D("5", "bludgeoning"), D("1d6", "piercing"), Z("prone")],
        kf: [T("stürzt unglücklich auf spitze Steine", "lands badly on sharp stones"), D("5", "bludgeoning"), D("3d6", "piercing"), Z("prone")]
      }
    },
    de: {
      name: "Abgedeckte Fallgrube", ausloeser: AUS.betreten.de,
      beschreibung: "Eine flache Grube unter Zweigen und Laub, 10 Fuß tief, am Boden spitze Steine.",
      wirkung: "Die Abdeckung bricht ein. Herausklettern Athletik SG 15.",
      entschaerfen: "die Abdeckung freilegen und ein Brett darüberlegen", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Covered Pit", ausloeser: AUS.betreten.en,
      beschreibung: "A shallow pit under branches and leaves, 10 feet deep, sharp stones at the bottom.",
      wirkung: "The cover gives way. Climbing out takes Athletics DC 15.",
      entschaerfen: "uncover it and lay a plank across", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende1-glockendraht", art: "gelaende", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 14, rang: 0, ausloeser: 0, wirkung: 0, werte: { rk: 14, haerte: 0, tp: 4 },
    entschaerfen: [["thievery", 15, 1], ["survival", 15, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("prone"), T("und die Glocken schlagen an", "and the bells ring")],
        kf: [D("1d6", "bludgeoning"), Z("prone"), Z("off-guard", null, "r1"), T("und die Glocken schlagen an", "and the bells ring")]
      }
    },
    de: {
      name: "Stolperdraht mit Glocken", ausloeser: AUS.feld.de,
      beschreibung: "Ein dünner Draht knapp über dem Boden, an einem Baum hängen verborgene Glöckchen.",
      wirkung: "Der Draht reißt die Kreatur von den Füßen, die Glocken sind 300 Fuß weit zu hören.",
      entschaerfen: "den Draht vorsichtig abnehmen", ruecksetzen: "Neu spannen."
    },
    en: {
      name: "Belled Tripwire", ausloeser: AUS.feld.en,
      beschreibung: "A thin wire just above the ground, hidden bells hang in a tree.",
      wirkung: "The wire trips the creature, the bells can be heard 300 feet away.",
      entschaerfen: "carefully take down the wire", ruecksetzen: "String it again."
    }
  },
  {
    id: "gelaende1-laufschlinge", art: "gelaende", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 14, haerte: 1, tp: 6 },
    entschaerfen: [["survival", 15, 1], ["thievery", 16, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("immobilized"), T("(Entkommen SG 17), die Schlinge hält den Fuß", "(Escape DC 17), the noose holds the foot")],
        kf: [T("kopfüber hochgerissen", "yanked up head first"), D("1d8+3", "bludgeoning"), Z("restrained"), T("(Entkommen SG 17)", "(Escape DC 17)")]
      }
    },
    de: {
      name: "Laufschlinge im Gras", ausloeser: AUS.feld.de,
      beschreibung: "Eine Seilschlinge im hohen Gras, das Ende an einem gebogenen Jungbaum.",
      wirkung: "Die Schlinge zieht sich um den Fuß zusammen.",
      entschaerfen: "die Schlinge aufziehen", ruecksetzen: "Neu legen."
    },
    en: {
      name: "Running Noose in the Grass", ausloeser: AUS.feld.en,
      beschreibung: "A rope noose in the tall grass, its end tied to a bent sapling.",
      wirkung: "The noose tightens around the foot.",
      entschaerfen: "pull the noose open", ruecksetzen: "Lay it again."
    }
  },
  {
    id: "gelaende1-dornenkugel", art: "gelaende", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 16, haerte: 4, tp: 16 },
    entschaerfen: [["thievery", 16, 1], ["survival", 17, 1]],
    angriff: { bonus: 9, schaden: [D("1d8+3", "piercing")], hoechstens: 1, nah: true },
    de: {
      name: "Dornenkugel am Seil", ausloeser: AUS.feld.de,
      beschreibung: "Eine mit Dornen gespickte Holzkugel hängt hoch im Geäst, ein Stolperseil hält sie.",
      wirkung: "Die Kugel schwingt herab: Nahkampf-Angriff +9 gegen die auslösende Kreatur, 1W8+3 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden und Liegend.",
      entschaerfen: "das Stolperseil durchtrennen, während jemand die Kugel hält", ruecksetzen: "Kugel wieder hochziehen."
    },
    en: {
      name: "Spiked Ball on a Rope", ausloeser: AUS.feld.en,
      beschreibung: "A wooden ball studded with thorns hangs high in the branches, held by a trip rope.",
      wirkung: "The ball swings down: melee Strike +9 against the triggering creature, 1d8+3 piercing.",
      krit: "Critical hit: double damage and prone.",
      entschaerfen: "cut the trip rope while someone holds the ball", ruecksetzen: "Hoist the ball up again."
    },
    kritZ: [Z("prone")]
  },
  {
    id: "gelaende1-sumpfgas", art: "gelaende", stufe: 1, merkmale: ["environmental", "poison", "inhaled", "trap"],
    heimlichkeit: 15, rang: 0, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["survival", 15, 1], ["nature", 16, 1]],
    gift: {
      typ: "fortitude", dc: 17, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d6", "poison"), Z("sickened", 1)],
        [D("1d8+1", "poison"), Z("sickened", 1), Z("clumsy", 1)],
        [D("2d4+2", "poison"), Z("sickened", 2), Z("clumsy", 1)]
      ]
    },
    de: {
      name: "Sumpfgasblase", ausloeser: AUS.betreten.de,
      beschreibung: "Der Boden ist weich und riecht faulig, hier und da steigen Blasen auf.",
      wirkung: "Unter dem Fuß platzt eine große Gasblase. Sumpfgas.", gift: "Sumpfgas",
      entschaerfen: "die Stelle umgehen und mit einem Stab anstechen, bis das Gas verfliegt", ruecksetzen: "Füllt sich in 1 Tag neu."
    },
    en: {
      name: "Marsh Gas Bubble", ausloeser: AUS.betreten.en,
      beschreibung: "The ground is soft and smells foul, bubbles rise here and there.",
      wirkung: "A large bubble of gas bursts beneath the foot. Marsh gas.", gift: "Marsh gas",
      entschaerfen: "skirt the spot and prick it with a pole until the gas drifts off", ruecksetzen: "Fills again in 1 day."
    }
  },
  {
    id: "gelaende1-irrlichtstein", art: "gelaende", stufe: 1, merkmale: ["magical", "mental", "light", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 16, 1], ["nature", 17, 1]],
    wurf: {
      typ: "will", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "mental")], f: [D("2d4+3", "mental"), Z("fascinated", null, "r1")],
        kf: [D("4d4+6", "mental"), Z("fascinated", null, "r1"), Z("stupefied", 1, "m1")]
      }
    },
    de: {
      name: "Irrlichtstein", ausloeser: AUS.betreten.de,
      beschreibung: "Ein bemooster Stein, in dessen Ritzen nachts ein bläuliches Licht flackert.",
      wirkung: "Ein Licht tanzt auf und brennt sich in die Gedanken aller in der Nähe.",
      entschaerfen: "das Licht mit einem Tuch ersticken und den Zauber lösen", ruecksetzen: "Lädt sich bei Einbruch der Nacht neu."
    },
    en: {
      name: "Wisp Stone", ausloeser: AUS.betreten.en,
      beschreibung: "A mossy stone, a bluish light flickers in its cracks at night.",
      wirkung: "A light dances up and burns itself into the thoughts of everyone nearby.",
      entschaerfen: "smother the light with a cloth and unravel the spell", ruecksetzen: "Recharges at nightfall."
    }
  },
  {
    id: "gelaende1-dornenranken", art: "gelaende", stufe: 1, merkmale: ["magical", "plant", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 14, haerte: 2, tp: 12 },
    entschaerfen: [["nature", 16, 1], ["survival", 17, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "piercing")], f: [D("1d6+4", "piercing"), Z("immobilized"), T("(Entkommen SG 17)", "(Escape DC 17)")],
        kf: [D("2d6+8", "piercing"), Z("restrained"), T("(Entkommen SG 17)", "(Escape DC 17)")]
      }
    },
    de: {
      name: "Dornenranken am Pfad", ausloeser: AUS.feld.de,
      beschreibung: "Dornige Ranken säumen den Pfad, eine davon liegt quer über dem Weg.",
      wirkung: "Die Ranken schlingen sich um Beine und Arme. Der Wirkungsbereich bleibt 1 Minute schwieriges Gelände.",
      entschaerfen: "die Ranken beruhigen oder die Hauptranke kappen", ruecksetzen: "Wächst in 1 Tag nach."
    },
    en: {
      name: "Thorn Tendrils on the Path", ausloeser: AUS.feld.en,
      beschreibung: "Thorny tendrils line the path, one of them lies across the way.",
      wirkung: "The tendrils wrap around legs and arms. The area stays difficult terrain for 1 minute.",
      entschaerfen: "calm the tendrils or sever the main vine", ruecksetzen: "Grows back in 1 day."
    }
  },
  {
    id: "gelaende1-rufstein", art: "gelaende", stufe: 1, merkmale: ["magical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["nature", 17, 1], ["arcana", 17, 1]],
    beschwoerung: { stufe: 2, runden: 10, ort: "falle" },
    de: {
      name: "Rufstein am Wegrand", ausloeser: AUS.betreten.de,
      beschreibung: "Ein aufrechter Stein mit einer eingeritzten Tierspur, halb im Gebüsch.",
      wirkung: "Der Stein ruft: Eine Kreatur bis Stufe 2 bricht neben dem Stein aus dem Gebüsch und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Tierspur aus dem Stein schlagen", ruecksetzen: "Keines."
    },
    en: {
      name: "Wayside Calling Stone", ausloeser: AUS.betreten.en,
      beschreibung: "An upright stone carved with an animal track, half hidden in the bushes.",
      wirkung: "The stone calls: a creature of up to level 2 breaks out of the bushes next to the stone and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "chip the animal track out of the stone", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum1-pfeilschlitze", art: "raum", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 16, haerte: 5, tp: 20 },
    entschaerfen: [["thievery", 16, 1]],
    angriff: { bonus: 9, schaden: [D("1d8+3", "piercing")], hoechstens: 2 },
    de: {
      name: "Pfeilschlitze in der Wand", ausloeser: AUS.platte.de,
      beschreibung: "Schmale Schlitze in den Wandfugen, eine Bodenplatte sitzt etwas höher als die anderen.",
      wirkung: "Zwei Pfeile schießen aus den Schlitzen: je ein Fernkampf-Angriff +9 gegen bis zu zwei Kreaturen im Wirkungsbereich, die auslösende zuerst, 1W8+3 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Pfeile nachladen."
    },
    en: {
      name: "Arrow Slits in the Wall", ausloeser: AUS.platte.en,
      beschreibung: "Narrow slits in the wall joints, one floor slab sits a little higher than the rest.",
      wirkung: "Two arrows shoot from the slits: one ranged Strike +9 each against up to two creatures in the area, the triggering one first, 1d8+3 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "wedge the slab", ruecksetzen: "Reload the arrows."
    }
  },
  {
    id: "raum1-oelboden", art: "raum", stufe: 1, merkmale: ["mechanical", "trap"],
    heimlichkeit: 15, rang: 0, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["thievery", 15, 1], ["crafting", 16, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("prone"), T("und rutscht 10 Fuß weit", "and slides 10 feet")],
        kf: [D("1d8+3", "bludgeoning"), Z("prone"), T("und rutscht gegen die Wand", "and slides into the wall")]
      }
    },
    de: {
      name: "Geölter Boden", ausloeser: AUS.betreten.de,
      beschreibung: "Die Steinplatten glänzen matt, in den Fugen steht ein Film aus Öl.",
      wirkung: "Eine Platte kippt leicht, und Öl fließt über den ganzen Wirkungsbereich. Er bleibt schwieriges Gelände, bis jemand Sand streut.",
      entschaerfen: "die Kippplatte festsetzen", ruecksetzen: "Ölbehälter neu füllen."
    },
    en: {
      name: "Oiled Floor", ausloeser: AUS.betreten.en,
      beschreibung: "The flagstones shine dully, a film of oil stands in the joints.",
      wirkung: "A slab tips slightly and oil runs across the whole area. It stays difficult terrain until someone strews sand.",
      entschaerfen: "fix the tipping slab in place", ruecksetzen: "Refill the oil tank."
    }
  },
  {
    id: "raum1-brechdampf", art: "raum", stufe: 1, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 5, wirkung: 10, werte: { rk: 14, haerte: 3, tp: 12 },
    entschaerfen: [["thievery", 16, 1], ["crafting", 16, 1]],
    gift: {
      typ: "fortitude", dc: 17, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d6", "poison"), Z("sickened", 1)],
        [D("1d8+1", "poison"), Z("sickened", 2)],
        [D("2d4+2", "poison"), Z("sickened", 2), Z("off-guard")]
      ]
    },
    de: {
      name: "Brechdampf aus der Fuge", ausloeser: AUS.betreten.de,
      beschreibung: "Aus einer Wandfuge riecht es säuerlich, darunter liegt eine lose Bodenplatte.",
      wirkung: "Ein gelblicher Dampf zischt aus der Fuge und füllt den Wirkungsbereich. Brechdampf.", gift: "Brechdampf",
      entschaerfen: "die Fuge mit Lehm oder Stoff verstopfen", ruecksetzen: "Behälter neu füllen."
    },
    en: {
      name: "Retching Vapour from the Joint", ausloeser: AUS.betreten.en,
      beschreibung: "A sour smell comes from a joint in the wall, a loose floor slab lies beneath it.",
      wirkung: "A yellowish vapour hisses from the joint and fills the area. Retching vapour.", gift: "Retching vapour",
      entschaerfen: "plug the joint with clay or cloth", ruecksetzen: "Refill the tank."
    }
  },
  {
    id: "raum1-kerzenrune", art: "raum", stufe: 1, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "reflex", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "fire")], f: [D("2d4+3", "fire")],
        kf: [D("4d4+6", "fire"), D("1d4", "fire", "persistent")]
      }
    },
    de: {
      name: "Kerzenleuchter-Rune", ausloeser: AUS.betreten.de,
      beschreibung: "Ein schwerer Kerzenleuchter steht in der Raummitte, in seinen Fuß ist eine Rune geschnitten.",
      wirkung: "Alle Kerzen flammen auf einmal auf und schleudern Flammen in den Wirkungsbereich.",
      entschaerfen: "die Rune bannen oder die Dochte kappen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Candelabrum Rune", ausloeser: AUS.betreten.en,
      beschreibung: "A heavy candelabrum stands in the middle of the room, a rune cut into its foot.",
      wirkung: "All the candles flare up at once and fling flames into the area.",
      entschaerfen: "dispel the rune or trim the wicks", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum1-kalte-hand", art: "raum", stufe: 1, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["religion", 16, 1], ["occultism", 17, 1]],
    wurf: {
      typ: "fortitude", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "void")], f: [D("1d8+3", "void"), Z("enfeebled", 1, "r1")],
        kf: [D("2d8+6", "void"), Z("enfeebled", 1, "m1"), Z("frightened", 1)]
      }
    },
    de: {
      name: "Kalte Hand aus der Wand", ausloeser: AUS.feld.de,
      beschreibung: "Ein Handabdruck in der Wand, der Putz darum ist grau und rissig.",
      wirkung: "Eine geisterhafte Hand greift aus der Wand nach der Kreatur und saugt ihr Wärme aus.",
      entschaerfen: "den Abdruck segnen oder mit Salz bestreuen und den Zauber lösen", ruecksetzen: "Lädt sich bei Sonnenuntergang neu."
    },
    en: {
      name: "Cold Hand from the Wall", ausloeser: AUS.feld.en,
      beschreibung: "A handprint in the wall, the plaster around it grey and cracked.",
      wirkung: "A ghostly hand reaches out of the wall for the creature and draws the warmth from it.",
      entschaerfen: "bless the print or strew it with salt and unravel the spell", ruecksetzen: "Recharges at sunset."
    }
  },
  {
    id: "raum1-droehnrune", art: "raum", stufe: 1, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "fortitude", dc: 17, grade: {
        ke: [], e: [D("1d4+2", "sonic")], f: [D("2d4+3", "sonic"), Z("deafened", null, "m1")],
        kf: [D("4d4+6", "sonic"), Z("deafened", null, "m1"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Dröhnende Deckenrune", ausloeser: AUS.betreten.de,
      beschreibung: "In der Decke prangt eine Rune aus Wellenlinien, Staub rieselt aus den Fugen.",
      wirkung: "Ein Dröhnen wie ein Glockenschlag füllt den Raum. Es ist 300 Fuß weit zu hören.",
      entschaerfen: "die Rune bannen oder mit Stoff dämpfen und lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Booming Ceiling Rune", ausloeser: AUS.betreten.en,
      beschreibung: "A rune of wavy lines stands out on the ceiling, dust trickles from the joints.",
      wirkung: "A boom like a bell stroke fills the room. It can be heard 300 feet away.",
      entschaerfen: "dispel the rune or muffle it with cloth and unravel it", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum1-wirrmosaik", art: "raum", stufe: 1, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 16, 1], ["arcana", 17, 1]],
    wurf: {
      typ: "will", dc: 17, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("stupefied", 1, "m1"), Z("off-guard", null, "r1")],
        kf: [Z("stupefied", 2, "m1"), Z("fleeing", null, "r1")]
      }
    },
    de: {
      name: "Wirrmosaik", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Bodenmosaik aus Spiralen, die sich zu drehen scheinen, wenn man lange hinsieht.",
      wirkung: "Die Spiralen beginnen zu kreisen und verwirren die Sinne aller im Raum.",
      entschaerfen: "ein Stück aus dem Mosaik brechen, ohne hinzusehen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Bewildering Mosaic", ausloeser: AUS.betreten.en,
      beschreibung: "A floor mosaic of spirals that seem to turn when looked at for long.",
      wirkung: "The spirals start to circle and bewilder the senses of everyone in the room.",
      entschaerfen: "break a piece out of the mosaic without looking", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum1-schlummernde-ruestung", art: "raum", stufe: 1, merkmale: ["magical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 17, 1], ["religion", 17, 1]],
    beschwoerung: { stufe: 2, runden: null, ort: "falle" },
    de: {
      name: "Schlummernde Rüstung", ausloeser: AUS.betreten.de,
      beschreibung: "Eine alte Rüstung auf einem Ständer, im Helm glimmt ein schwacher Funke.",
      wirkung: "Die Rüstung erwacht: Eine Kreatur bis Stufe 2 erscheint an ihrer Stelle und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Funken im Helm löschen, solange die Rüstung schläft", ruecksetzen: "Keines."
    },
    en: {
      name: "Slumbering Armour", ausloeser: AUS.betreten.en,
      beschreibung: "An old suit of armour on a stand, a faint spark glimmers in the helmet.",
      wirkung: "The armour awakens: a creature of up to level 2 appears in its place and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "put out the spark in the helmet while the armour sleeps", ruecksetzen: "None."
    }
  }
];
