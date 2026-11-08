// Eigene Fallen Stufe 4 (0.10.0, 07.11.2026: "gerecht für die normalen PF2e-Spieler, die nicht so starke Gruppen haben
// und eventuell nicht so gut heilen können"). Maßstab wie Stufe 1 (siehe fallen-stufe-1.mjs), drei Stufen höher:
// Rettungswurf SG 21, Angriff +14, Heimlichkeit 18 bis 22, Entschärfen 18 bis 22, Mindestgrad höchstens Geübt.
// Ein Fehlschlag wirft eine zerbrechliche Figur der Stufe 4 (30 TP) mit vollen TP nicht um, ein kritischer Fehlschlag
// tötet nie sofort (höchster Wurf unter 60). Keine langen Zustände, Zustände höchstens 1 Minute; Verwirrt nur für
// 1 Runde beim kritischen Fehlschlag. Herbeigerufene Gegner bis Stufe 5. Die äußere Veränderung verblasst nach 1 Tag.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante und stürzt nicht", "grabs the edge and does not fall");
const tag = { value: 1, unit: "days" };

export const STUFE_4 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer4-hellebarde", art: "tuer", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 22, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 20, 1]],
    angriff: { bonus: 14, schaden: [D("2d10+8", "slashing")], hoechstens: 1, nah: true },
    de: {
      name: "Hellebarde hinter der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Hinter der Tür steht eine Hellebarde in einer Halterung, ein Seil läuft von ihr zur Klinke.",
      wirkung: "Die Hellebarde schwingt durch die Türöffnung: Nahkampf-Angriff +14 gegen die öffnende Kreatur, 2W10+8 Hieb.",
      krit: "Kritischer Treffer: doppelter Schaden und Liegend.",
      entschaerfen: "die Tür nur einen Spalt öffnen und das Seil durchschneiden", ruecksetzen: "Hellebarde neu einhängen."
    },
    en: {
      name: "Halberd behind the Door", ausloeser: AUS.tuer.en,
      beschreibung: "A halberd stands in a bracket behind the door, a rope runs from it to the handle.",
      wirkung: "The halberd swings through the doorway: melee Strike +14 against the creature opening the door, 2d10+8 slashing.",
      krit: "Critical hit: double damage and prone.",
      entschaerfen: "open the door only a crack and cut the rope", ruecksetzen: "Hang the halberd back in place."
    },
    kritZ: [Z("prone")]
  },
  {
    id: "tuer4-kippschwelle", art: "tuer", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 21, haerte: 10, tp: 44 },
    entschaerfen: [["thievery", 19, 1], ["crafting", 20, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [kante], e: [kante],
        f: [T("rutscht 10 Fuß in einen Schacht", "slides 10 feet into a shaft"), D("5", "bludgeoning"), D("2d8+4", "bludgeoning"), Z("prone")],
        kf: [T("stürzt 20 Fuß tief", "falls 20 feet"), D("10", "bludgeoning"), D("4d8+8", "bludgeoning"), Z("prone")]
      }
    },
    de: {
      name: "Kippende Schwelle", ausloeser: AUS.tuer.de,
      beschreibung: "Die Schwelle vor der Tür ist eine breite Steinplatte auf einer Achse, darunter ein schräger Schacht.",
      wirkung: "Beim Öffnen kippt die Platte nach innen. Herausklettern Athletik SG 19.",
      entschaerfen: "die Achse mit Keilen blockieren", ruecksetzen: "Kippt von selbst zurück."
    },
    en: {
      name: "Tipping Threshold", ausloeser: AUS.tuer.en,
      beschreibung: "The threshold before the door is a broad stone slab on an axle, a sloping shaft beneath it.",
      wirkung: "As the door opens, the slab tips inwards. Climbing out takes Athletics DC 19.",
      entschaerfen: "block the axle with wedges", ruecksetzen: "Tips back on its own."
    }
  },
  {
    id: "tuer4-pechnase", art: "tuer", stufe: 4, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 20, haerte: 8, tp: 36 },
    entschaerfen: [["thievery", 20, 1], ["crafting", 20, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "fire")], f: [D("3d8+5", "fire")],
        kf: [D("6d8+10", "fire"), D("1d6", "fire", "persistent"), T("und Pechflecken", "and pitch stains")]
      }
    },
    aussehen: { de: ["Pechflecken", "Schwarze, zähe Flecken auf Haut und Haar, die nach Harz riechen. Verblasst nach 1 Tag."], en: ["Pitch Stains", "Black, sticky stains on skin and hair that smell of resin. Fade after 1 day."], toenung: "#6a5a4a", dauer: tag },
    de: {
      name: "Pechnase über der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Tür ragt ein steinerner Erker vor, darunter ist der Boden schwarz verkrustet.",
      wirkung: "Eine Klappe im Erker öffnet sich, und heißes Pech ergießt sich über alle vor der Tür.",
      entschaerfen: "die Klappe von unten mit einer Stange festkeilen", ruecksetzen: "Kessel neu füllen und anheizen."
    },
    en: {
      name: "Pitch Spout above the Door", ausloeser: AUS.tuer.en,
      beschreibung: "A stone oriel juts out above the door, the ground beneath it crusted black.",
      wirkung: "A hatch in the oriel opens and hot pitch pours over everyone in front of the door.",
      entschaerfen: "wedge the hatch shut from below with a pole", ruecksetzen: "Refill and heat the cauldron."
    }
  },
  {
    id: "tuer4-nadelkranz", art: "tuer", stufe: 4, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 19, haerte: 6, tp: 20 },
    entschaerfen: [["thievery", 20, 1]],
    gift: {
      typ: "fortitude", dc: 21, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("2d6", "poison"), Z("sickened", 1)],
        [D("2d10", "poison"), Z("sickened", 1), Z("enfeebled", 1)],
        [D("3d8+3", "poison"), Z("sickened", 2), Z("enfeebled", 1)]
      ]
    },
    de: {
      name: "Nadelkranz am Türknauf", ausloeser: AUS.tuer.de,
      beschreibung: "Der Türknauf ist mit einem Ring feiner Löcher verziert, in jedem steckt eine Nadel.",
      wirkung: "Beim Drehen fahren die Nadeln in die Hand der öffnenden Kreatur. Schierlingssaft.", gift: "Schierlingssaft",
      entschaerfen: "den Knauf mit einem Lappen umwickeln und die Nadeln abbrechen", ruecksetzen: "Nadeln neu vergiften."
    },
    en: {
      name: "Needle Ring on the Doorknob", ausloeser: AUS.tuer.en,
      beschreibung: "The doorknob is decorated with a ring of fine holes, a needle in each.",
      wirkung: "As it turns, the needles drive into the hand of the creature opening the door. Hemlock sap.", gift: "Hemlock sap",
      entschaerfen: "wrap the knob in a rag and break off the needles", ruecksetzen: "Poison the needles again."
    }
  },
  {
    id: "tuer4-blitzbeschlag", art: "tuer", stufe: 4, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 21, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "electricity")], f: [D("2d10+8", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("4d10+16", "electricity"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Blitzbeschlagene Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Die Tür ist mit Eisenbändern beschlagen, in die Zackenlinien graviert sind.",
      wirkung: "Ein Blitz fährt aus den Bändern und springt auf alle vor der Tür.",
      entschaerfen: "die Bänder mit einer Kette erden und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Lightning-Bound Door", ausloeser: AUS.tuer.en,
      beschreibung: "The door is bound with iron bands engraved with zigzag lines.",
      wirkung: "Lightning bursts from the bands and leaps to everyone in front of the door.",
      entschaerfen: "ground the bands with a chain and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer4-fratzen", art: "tuer", stufe: 4, merkmale: ["magical", "mental", "fear", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 20, 1], ["religion", 21, 1]],
    wurf: {
      typ: "will", dc: 21, grade: {
        ke: [], e: [Z("frightened", 1)], f: [D("2d10+8", "mental"), Z("frightened", 2)],
        kf: [D("4d10+16", "mental"), Z("frightened", 2), Z("fleeing", null, "r1"), T("und weiße Schläfen", "and white temples")]
      }
    },
    aussehen: { de: ["Weiße Schläfen", "Das Haar an den Schläfen ist schlohweiß geworden. Verblasst nach 1 Tag."], en: ["White Temples", "The hair at the temples has turned snow-white. Fades after 1 day."], toenung: null, dauer: tag },
    de: {
      name: "Kreischende Fratzen", ausloeser: AUS.tuer.de,
      beschreibung: "Rund um den Türrahmen sind Fratzen in den Stein gehauen, alle mit offenem Mund.",
      wirkung: "Die Fratzen kreischen auf einmal los, und ein Grauen fährt in die Köpfe aller in der Nähe.",
      entschaerfen: "die Münder mit Wachs verschließen und den Spuk lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Shrieking Masks", ausloeser: AUS.tuer.en,
      beschreibung: "Grimacing masks are carved into the stone around the door frame, all with open mouths.",
      wirkung: "The masks shriek all at once and dread drives into the minds of everyone nearby.",
      entschaerfen: "seal the mouths with wax and unravel the haunting", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer4-aetzklinke", art: "tuer", stufe: 4, merkmale: ["magical", "acid", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 20, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "acid")], f: [D("4d6+5", "acid")],
        kf: [D("8d6+10", "acid"), D("1d6", "acid", "persistent")]
      }
    },
    de: {
      name: "Ätzende Türklinke", ausloeser: AUS.tuer.de,
      beschreibung: "Die Klinke ist grünlich angelaufen, an der Unterseite hängt ein Tropfen.",
      wirkung: "Die Klinke zerläuft unter der Hand zu Säure und spritzt über Arm und Brust.",
      entschaerfen: "die Klinke mit Kalk bestreuen und den Zauber bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Corroding Door Handle", ausloeser: AUS.tuer.en,
      beschreibung: "The handle is tarnished green, a drop hangs from its underside.",
      wirkung: "The handle melts into acid under the hand and splashes over arm and chest.",
      entschaerfen: "strew the handle with lime and dispel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer4-hueterpforte", art: "tuer", stufe: 4, merkmale: ["magical", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 21, 1], ["thievery", 21, 1]],
    beschwoerung: { stufe: 5, runden: 10, ort: "neben" },
    de: {
      name: "Pforte des Hüters", ausloeser: AUS.tuer.de,
      beschreibung: "In das Türblatt ist eine kleinere Tür geschnitzt, geschlossen mit einem gemalten Riegel.",
      wirkung: "Die geschnitzte Tür geht auf und lässt ihren Hüter heraus: Eine Kreatur bis Stufe 5 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den gemalten Riegel nachziehen und mit einem Zeichen versiegeln", ruecksetzen: "Keines."
    },
    en: {
      name: "Keeper's Portal", ausloeser: AUS.tuer.en,
      beschreibung: "A smaller door is carved into the door leaf, closed by a painted bolt.",
      wirkung: "The carved door opens and lets out its keeper: a creature of up to level 5 appears in a free square next to the door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "trace over the painted bolt and seal it with a sign", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss4-spornrad", art: "schloss", stufe: 4, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 20, haerte: 6, tp: 20 },
    entschaerfen: [["thievery", 20, 1]],
    gift: {
      typ: "fortitude", dc: 21, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("2d6", "poison"), Z("clumsy", 1)],
        [D("2d10", "poison"), Z("clumsy", 1), Z("off-guard")],
        [D("3d8+3", "poison"), Z("clumsy", 2), Z("off-guard")]
      ]
    },
    de: {
      name: "Spornrad im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Im Schlüsselloch sitzt ein winziges gezahntes Rad, dunkel von einer klebrigen Schicht.",
      wirkung: "Das Rad dreht sich und ritzt Finger oder Dietrich und die Hand dahinter. Krampfgift.", gift: "Krampfgift",
      entschaerfen: "das Rad mit einem Stift blockieren", ruecksetzen: "Rad neu bestreichen."
    },
    en: {
      name: "Spur Wheel in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A tiny toothed wheel sits in the keyhole, dark with a sticky coating.",
      wirkung: "The wheel turns and scratches finger or pick and the hand behind it. Cramp poison.", gift: "Cramp poison",
      entschaerfen: "block the wheel with a pin", ruecksetzen: "Coat the wheel again."
    }
  },
  {
    id: "schloss4-scherenfalle", art: "schloss", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 22, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 20, 1]],
    angriff: { bonus: 14, schaden: [D("3d6+9", "slashing")], hoechstens: 1, nah: true },
    de: {
      name: "Scherenfalle", ausloeser: AUS.schloss.de,
      beschreibung: "Zwei geschliffene Bleche liegen in der Fuge zwischen Deckel und Truhe.",
      wirkung: "Die Bleche schließen sich wie eine Schere: Nahkampf-Angriff +14 gegen die öffnende Kreatur, 3W6+9 Hieb.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "einen Eisenkeil zwischen die Bleche treiben", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Shear Trap", ausloeser: AUS.schloss.en,
      beschreibung: "Two ground metal plates lie in the joint between lid and chest.",
      wirkung: "The plates close like shears: melee Strike +14 against the creature opening it, 3d6+9 slashing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "drive an iron wedge between the plates", ruecksetzen: "Rearm by hand."
    }
  },
  {
    id: "schloss4-stahlfeder", art: "schloss", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 21, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 19, 1], ["crafting", 20, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "bludgeoning")],
        f: [D("2d10+8", "bludgeoning"), T("10 Fuß zurückgeschleudert", "hurled back 10 feet"), Z("prone")],
        kf: [D("4d10+16", "bludgeoning"), T("15 Fuß zurückgeschleudert", "hurled back 15 feet"), Z("prone"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Stahlfeder-Deckel", ausloeser: AUS.schloss.de,
      beschreibung: "Der Deckel der Truhe ist schwer und sitzt auf einer gewaltigen gespannten Feder.",
      wirkung: "Der Deckel springt mit voller Wucht auf und schleudert die Kreatur am Schloss zurück.",
      entschaerfen: "den Deckel mit Riemen niederbinden, bevor das Schloss aufgeht", ruecksetzen: "Feder mit einer Kurbel neu spannen."
    },
    en: {
      name: "Steel Spring Lid", ausloeser: AUS.schloss.en,
      beschreibung: "The chest's lid is heavy and sits on a huge cocked spring.",
      wirkung: "The lid flies open with full force and hurls the creature at the lock backwards.",
      entschaerfen: "strap the lid down before the lock opens", ruecksetzen: "Wind the spring with a crank."
    }
  },
  {
    id: "schloss4-glutkern", art: "schloss", stufe: 4, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: "knopf", wirkung: 5, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 21, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "fire")], f: [D("2d10+8", "fire")],
        kf: [D("4d10+16", "fire"), D("1d6", "fire", "persistent")]
      }
    },
    de: {
      name: "Glutkern-Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Durch das Schlüsselloch sieht man ein schwaches rotes Glimmen.",
      wirkung: "Der Glutkern im Schloss bricht auf und speit Flammen über alle in der Nähe.",
      entschaerfen: "den Kern mit Wasser löschen und die Rune bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Ember Core Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A faint red glow can be seen through the keyhole.",
      wirkung: "The ember core in the lock bursts and spews flames over everyone nearby.",
      entschaerfen: "quench the core with water and dispel the rune", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss4-eisblumen", art: "schloss", stufe: 4, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 21, 1]],
    wurf: {
      typ: "fortitude", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "cold")], f: [D("3d8+5", "cold"), Z("slowed", 1, "r1")],
        kf: [D("6d8+10", "cold"), Z("slowed", 1, "r1"), Z("clumsy", 1, "m1"), T("und Eisblumen auf der Haut", "and frost flowers on the skin")]
      }
    },
    aussehen: { de: ["Eisblumen", "Feine Eisblumen ziehen sich über Hände und Gesicht und tauen nicht. Verblasst nach 1 Tag."], en: ["Frost Flowers", "Fine frost flowers spread over hands and face and do not thaw. Fades after 1 day."], toenung: "#c0dcf0", dauer: tag },
    de: {
      name: "Eisblumen-Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Auf dem Schloss blühen Eisblumen, auch wenn es im Raum warm ist.",
      wirkung: "Die Kälte springt vom Schloss in den Körper der Kreatur und lässt das Blut stocken.",
      entschaerfen: "das Schloss mit einer Flamme erwärmen und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Frost Flower Lock", ausloeser: AUS.schloss.en,
      beschreibung: "Frost flowers bloom on the lock even though the room is warm.",
      wirkung: "The cold leaps from the lock into the creature's body and makes the blood run sluggish.",
      entschaerfen: "warm the lock with a flame and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss4-irrwege", art: "schloss", stufe: 4, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["occultism", 20, 1], ["arcana", 21, 1]],
    wurf: {
      typ: "will", dc: 21, grade: {
        ke: [], e: [Z("stupefied", 1, "r1")], f: [D("2d10+8", "mental"), Z("stupefied", 1, "m1")],
        kf: [D("4d10+16", "mental"), Z("confused", null, "r1"), Z("stupefied", 2, "m1")]
      }
    },
    de: {
      name: "Siegel der Irrwege", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel mit einem eingeprägten Labyrinth, die Linien scheinen sich zu verschieben.",
      wirkung: "Das Labyrinth springt in die Gedanken der Kreatur am Schloss und verwirrt sie.",
      entschaerfen: "den Ausgang des Labyrinths mit einem Stift nachziehen", ruecksetzen: "Keines, das Siegel ist verbraucht."
    },
    en: {
      name: "Seal of Wandering Thoughts", ausloeser: AUS.schloss.en,
      beschreibung: "A seal stamped with a labyrinth, its lines seem to shift.",
      wirkung: "The labyrinth leaps into the thoughts of the creature at the lock and bewilders it.",
      entschaerfen: "trace the way out of the labyrinth with a stylus", ruecksetzen: "None, the seal is spent."
    }
  },
  {
    id: "schloss4-wucht", art: "schloss", stufe: 4, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: "knopf", wirkung: 5, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 21, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "force")], f: [D("4d6+5", "force"), Z("prone")],
        kf: [D("8d6+10", "force"), Z("prone"), Z("deafened", null, "m1")]
      }
    },
    de: {
      name: "Siegel der Wucht", ausloeser: AUS.schloss.de,
      beschreibung: "Ein schweres Bleisiegel mit dem Abdruck einer Faust.",
      wirkung: "Das Siegel bricht und entlädt einen Schlag aus Kraft auf alle in der Nähe.",
      entschaerfen: "das Siegel bannen oder vorsichtig aus der Fuge lösen", ruecksetzen: "Keines."
    },
    en: {
      name: "Seal of Impact", ausloeser: AUS.schloss.en,
      beschreibung: "A heavy lead seal bearing the print of a fist.",
      wirkung: "The seal breaks and unleashes a blow of force on everyone nearby.",
      entschaerfen: "dispel the seal or carefully loosen it from the joint", ruecksetzen: "None."
    }
  },
  {
    id: "schloss4-waechterkreis", art: "schloss", stufe: 4, merkmale: ["magical", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 21, 1], ["occultism", 21, 1]],
    beschwoerung: { stufe: 5, runden: 10, ort: "neben" },
    de: {
      name: "Wächterkreis am Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Um das Schloss ist ein Kreis aus Silberdraht eingelegt, darin vier kleine Runen.",
      wirkung: "Der Kreis ruft seinen Wächter: Eine Kreatur bis Stufe 5 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Silberdraht an einer Stelle herausheben", ruecksetzen: "Keines."
    },
    en: {
      name: "Lock Guardian Circle", ausloeser: AUS.schloss.en,
      beschreibung: "A circle of silver wire is inlaid around the lock, four small runes inside it.",
      wirkung: "The circle calls its guardian: a creature of up to level 5 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "lift out the silver wire at one point", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende4-wolfsgrube", art: "gelaende", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 19, 1], ["thievery", 19, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 15 Fuß tief", "falls 15 feet"), D("7", "bludgeoning"), D("2d6+5", "piercing"), Z("prone")],
        kf: [T("stürzt auf die Pfähle", "falls onto the stakes"), D("7", "bludgeoning"), D("6d6+10", "piercing"), Z("prone")]
      }
    },
    de: {
      name: "Trichtergrube", ausloeser: AUS.betreten.de,
      beschreibung: "Eine trichterförmige Grube unter Reisig, 15 Fuß tief, am Grund stumpfe Pfähle.",
      wirkung: "Das Reisig bricht ein. Herausklettern Athletik SG 19.",
      entschaerfen: "das Reisig abtragen und Bretter darüberlegen", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Funnel Pit", ausloeser: AUS.betreten.en,
      beschreibung: "A funnel-shaped pit under brushwood, 15 feet deep, blunt stakes at the bottom.",
      wirkung: "The brushwood gives way. Climbing out takes Athletics DC 19.",
      entschaerfen: "clear the brushwood and lay planks across", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende4-fallender-baum", art: "gelaende", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["survival", 19, 1], ["athletics", 20, 0]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "bludgeoning")], f: [D("2d10+8", "bludgeoning"), Z("prone")],
        kf: [D("4d10+16", "bludgeoning"), Z("immobilized"), T("unter dem Stamm bis Athletik SG 21", "under the trunk until Athletics DC 21")]
      }
    },
    de: {
      name: "Fallender Baum", ausloeser: AUS.feld.de,
      beschreibung: "Ein Baum am Weg ist fast durchgesägt, ein Seil hält ihn und läuft quer über den Pfad.",
      wirkung: "Das Seil reißt, und der Baum stürzt über den Pfad. Sein Stamm wird schwieriges Gelände.",
      entschaerfen: "den Baum mit einem zweiten Seil sichern und das erste lösen", ruecksetzen: "Keines."
    },
    en: {
      name: "Felled Tree", ausloeser: AUS.feld.en,
      beschreibung: "A tree by the way is almost sawn through, a rope holds it and runs across the path.",
      wirkung: "The rope snaps and the tree crashes across the path. Its trunk becomes difficult terrain.",
      entschaerfen: "secure the tree with a second rope and release the first", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende4-pfeilhagel", art: "gelaende", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 15, werte: { rk: 21, haerte: 8, tp: 36 },
    entschaerfen: [["thievery", 20, 1], ["survival", 20, 1]],
    angriff: { bonus: 14, schaden: [D("2d10+8", "piercing")], hoechstens: 3 },
    de: {
      name: "Pfeilhagel aus dem Hinterhalt", ausloeser: AUS.betreten.de,
      beschreibung: "Im Unterholz stehen drei gespannte Bögen, ein Faden läuft quer über den Pfad.",
      wirkung: "Drei Pfeile schwirren aus dem Unterholz: je ein Fernkampf-Angriff +14 gegen bis zu drei Kreaturen im Wirkungsbereich, die auslösende zuerst, 2W10+8 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "den Faden lösen oder die Bögen entspannen", ruecksetzen: "Bögen neu spannen und Pfeile auflegen."
    },
    en: {
      name: "Ambush Arrow Volley", ausloeser: AUS.betreten.en,
      beschreibung: "Three drawn bows stand in the undergrowth, a thread runs across the path.",
      wirkung: "Three arrows whirr out of the undergrowth: one ranged Strike +14 each against up to three creatures in the area, the triggering one first, 2d10+8 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "loosen the thread or unstring the bows", ruecksetzen: "Draw the bows and nock arrows again."
    }
  },
  {
    id: "gelaende4-faulige-quelle", art: "gelaende", stufe: 4, merkmale: ["environmental", "poison", "inhaled", "trap"],
    heimlichkeit: 18, rang: 0, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["nature", 18, 1], ["survival", 19, 1]],
    gift: {
      typ: "fortitude", dc: 21, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("2d6", "poison"), Z("sickened", 1)],
        [D("2d10", "poison"), Z("sickened", 2)],
        [D("3d8+3", "poison"), Z("sickened", 2), Z("enfeebled", 1)]
      ]
    },
    de: {
      name: "Faulige Quelle", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Quelle zwischen Steinen, das Wasser ist trüb, kein Tier trinkt daraus.",
      wirkung: "Unter dem Fuß bricht der Grund ein, und ein Schwall fauliger Dämpfe steigt auf. Quellfäule.", gift: "Quellfäule",
      entschaerfen: "die Quelle mit Steinen und Lehm abdecken", ruecksetzen: "Die Dämpfe sammeln sich in 1 Tag neu."
    },
    en: {
      name: "Fouled Spring", ausloeser: AUS.betreten.en,
      beschreibung: "A spring between stones, its water murky, no animal drinks from it.",
      wirkung: "The ground gives way underfoot and a gush of foul vapours rises. Spring rot.", gift: "Spring rot",
      entschaerfen: "cover the spring with stones and clay", ruecksetzen: "The vapours gather again in 1 day."
    }
  },
  {
    id: "gelaende4-treibsand", art: "gelaende", stufe: 4, merkmale: ["environmental", "trap"],
    heimlichkeit: 18, rang: 0, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["survival", 18, 1], ["nature", 19, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("immobilized"), T("(Entkommen SG 21), sinkt bis zu den Knien ein", "(Escape DC 21), sinks in up to the knees")],
        kf: [Z("restrained"), T("(Entkommen SG 21), sinkt bis zur Brust ein; andere können mit Seil oder Ast helfen", "(Escape DC 21), sinks in up to the chest; others can help with a rope or branch"), Z("off-guard")]
      }
    },
    de: {
      name: "Treibsand", ausloeser: AUS.betreten.de,
      beschreibung: "Eine glatte Sandfläche zwischen Felsen, hier und da kräuselt sich die Oberfläche.",
      wirkung: "Der Sand gibt nach und zieht die Beine nach unten.",
      entschaerfen: "die Stelle mit einem Stab abstecken und umgehen", ruecksetzen: "Bleibt."
    },
    en: {
      name: "Quicksand", ausloeser: AUS.betreten.en,
      beschreibung: "A smooth stretch of sand between rocks, here and there the surface ripples.",
      wirkung: "The sand gives way and drags the legs down.",
      entschaerfen: "mark the spot with a pole and skirt it", ruecksetzen: "Remains."
    }
  },
  {
    id: "gelaende4-blitzfelsen", art: "gelaende", stufe: 4, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 5, wirkung: 15, werte: null, hoechstens: 3,
    entschaerfen: [["arcana", 20, 1], ["nature", 21, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "electricity")], f: [D("3d8+5", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("6d8+10", "electricity"), Z("stunned", 1), T("und Blitzfiguren auf der Haut", "and lightning figures on the skin")]
      }
    },
    aussehen: { de: ["Blitzfiguren", "Verästelte rote Linien wie Blitze auf Hals und Armen. Verblasst nach 1 Tag."], en: ["Lightning Figures", "Branching red lines like lightning on neck and arms. Fades after 1 day."], toenung: "#e0c8d8", dauer: tag },
    de: {
      name: "Blitzfelsen", ausloeser: AUS.betreten.de,
      beschreibung: "Ein schwarzer Felsen am Pfad, der Stein ist von Rissen wie von Blitzen durchzogen.",
      wirkung: "Blitze springen aus dem Felsen auf bis zu drei Kreaturen im Wirkungsbereich.",
      entschaerfen: "den Felsen mit einem Eisenstab erden und den Zauber lösen", ruecksetzen: "Lädt sich bei Gewitter oder nach 1 Tag neu."
    },
    en: {
      name: "Lightning Crag", ausloeser: AUS.betreten.en,
      beschreibung: "A black crag beside the path, the stone shot through with cracks like lightning.",
      wirkung: "Lightning leaps from the crag to up to three creatures in the area.",
      entschaerfen: "ground the crag with an iron rod and unravel the spell", ruecksetzen: "Recharges in a thunderstorm or after 1 day."
    }
  },
  {
    id: "gelaende4-dornenhecke", art: "gelaende", stufe: 4, merkmale: ["magical", "plant", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 20, haerte: 5, tp: 36 },
    entschaerfen: [["nature", 20, 1], ["survival", 21, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "piercing")], f: [D("2d10+8", "piercing"), Z("immobilized"), T("(Entkommen SG 21)", "(Escape DC 21)")],
        kf: [D("4d10+16", "piercing"), Z("restrained"), T("(Entkommen SG 21)", "(Escape DC 21)")]
      }
    },
    de: {
      name: "Lebende Dornenhecke", ausloeser: AUS.feld.de,
      beschreibung: "Eine dichte Dornenhecke säumt den Weg, ihre Zweige bewegen sich auch ohne Wind.",
      wirkung: "Die Hecke greift mit Dornenzweigen nach allen in der Nähe. Der Wirkungsbereich bleibt 1 Minute schwieriges Gelände.",
      entschaerfen: "die Hecke beruhigen oder ihre Hauptwurzel kappen", ruecksetzen: "Wächst in 1 Tag nach."
    },
    en: {
      name: "Living Thorn Hedge", ausloeser: AUS.feld.en,
      beschreibung: "A dense thorn hedge lines the way, its branches move even without wind.",
      wirkung: "The hedge reaches for everyone nearby with thorny branches. The area stays difficult terrain for 1 minute.",
      entschaerfen: "calm the hedge or sever its main root", ruecksetzen: "Grows back in 1 day."
    }
  },
  {
    id: "gelaende4-hornruf", art: "gelaende", stufe: 4, merkmale: ["magical", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["nature", 21, 1], ["arcana", 21, 1]],
    beschwoerung: { stufe: 5, runden: 10, ort: "falle" },
    de: {
      name: "Hornruf im Wald", ausloeser: AUS.betreten.de,
      beschreibung: "Ein altes Jagdhorn hängt an einem Ast, in das Horn sind Tierzeichen geschnitten.",
      wirkung: "Das Horn bläst von selbst, und eine Kreatur bis Stufe 5 antwortet und erscheint in der Mitte des Auslösebereichs. Sie würfelt sofort Initiative, greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Mundstück mit Wachs verschließen", ruecksetzen: "Keines."
    },
    en: {
      name: "Horn Call in the Woods", ausloeser: AUS.betreten.en,
      beschreibung: "An old hunting horn hangs from a branch, animal signs cut into it.",
      wirkung: "The horn blows by itself and a creature of up to level 5 answers and appears at the centre of the trigger area. It rolls initiative at once, attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "seal the mouthpiece with wax", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum4-bodenspeere", art: "raum", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 22, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 20, 1]],
    angriff: { bonus: 14, schaden: [D("2d10+8", "piercing")], hoechstens: null, nah: true },
    de: {
      name: "Speere aus dem Boden", ausloeser: AUS.platte.de,
      beschreibung: "Im Boden des Gangs sind kleine Löcher in Reihen, eine Platte sitzt lose.",
      wirkung: "Speere stoßen aus dem Boden: je ein Nahkampf-Angriff +14 gegen jede Kreatur im Wirkungsbereich, 2W10+8 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Setzt sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Spears from the Floor", ausloeser: AUS.platte.en,
      beschreibung: "Small holes lie in rows in the corridor floor, one slab sits loose.",
      wirkung: "Spears thrust up from the floor: one melee Strike +14 against each creature in the area, 2d10+8 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "wedge the slab", ruecksetzen: "Resets itself after 1 minute."
    }
  },
  {
    id: "raum4-rollfels", art: "raum", stufe: 4, merkmale: ["mechanical", "trap"],
    heimlichkeit: 19, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["thievery", 19, 1], ["athletics", 21, 0]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "bludgeoning")], f: [D("2d10+8", "bludgeoning"), Z("prone")],
        kf: [D("4d10+16", "bludgeoning"), Z("prone"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Rollender Fels im Gang", ausloeser: AUS.betreten.de,
      beschreibung: "Der Gang fällt leicht ab, am oberen Ende liegt eine Nische mit einem runden Felsblock.",
      wirkung: "Der Fels löst sich aus der Nische und rollt den Gang hinab über alle im Wirkungsbereich. Danach liegt er am unteren Ende.",
      entschaerfen: "den Fels in der Nische mit Keilen festsetzen", ruecksetzen: "Fels mit Seilwinde zurückziehen (1 Stunde)."
    },
    en: {
      name: "Rolling Boulder in the Corridor", ausloeser: AUS.betreten.en,
      beschreibung: "The corridor slopes slightly, at its upper end a niche holds a round boulder.",
      wirkung: "The boulder breaks loose from the niche and rolls down the corridor over everyone in the area. It comes to rest at the lower end.",
      entschaerfen: "wedge the boulder in its niche", ruecksetzen: "Winch the boulder back up (1 hour)."
    }
  },
  {
    id: "raum4-gruener-dunst", art: "raum", stufe: 4, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 15, werte: { rk: 19, haerte: 6, tp: 24 },
    entschaerfen: [["thievery", 20, 1], ["crafting", 19, 1]],
    gift: {
      typ: "fortitude", dc: 21, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("2d6", "poison"), Z("enfeebled", 1)],
        [D("2d10", "poison"), Z("enfeebled", 1), Z("clumsy", 1)],
        [D("3d8+3", "poison"), Z("enfeebled", 2), Z("clumsy", 1)]
      ]
    },
    de: {
      name: "Grüner Dunst", ausloeser: AUS.betreten.de,
      beschreibung: "Unter der Decke laufen Tonrohre, an ihren Enden hängen grünliche Tropfen.",
      wirkung: "Aus den Rohren sinkt ein grüner Dunst und füllt den Wirkungsbereich. Grünschwaden.", gift: "Grünschwaden",
      entschaerfen: "die Rohre mit Lumpen verstopfen", ruecksetzen: "Behälter neu füllen."
    },
    en: {
      name: "Green Haze", ausloeser: AUS.betreten.en,
      beschreibung: "Clay pipes run beneath the ceiling, greenish drops hanging at their ends.",
      wirkung: "A green haze sinks from the pipes and fills the area. Green fumes.", gift: "Green fumes",
      entschaerfen: "plug the pipes with rags", ruecksetzen: "Refill the tank."
    }
  },
  {
    id: "raum4-feuerstatuen", art: "raum", stufe: 4, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 21, 1]],
    wurf: {
      typ: "reflex", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "fire")], f: [D("2d10+8", "fire")],
        kf: [D("4d10+16", "fire"), D("1d6", "fire", "persistent"), T("und ein Rußschatten", "and a soot shadow")]
      }
    },
    aussehen: { de: ["Rußschatten", "Ein dunkler Schatten aus Ruß liegt auf einer Gesichtshälfte. Verblasst nach 1 Tag."], en: ["Soot Shadow", "A dark shadow of soot lies across half the face. Fades after 1 day."], toenung: "#8c8070", dauer: tag },
    de: {
      name: "Feuerspeiende Statuen", ausloeser: AUS.betreten.de,
      beschreibung: "Zwei Drachenstatuen flankieren den Raum, ihre Mäuler sind innen geschwärzt.",
      wirkung: "Beide Statuen speien Feuer, die Flammen kreuzen sich in der Raummitte.",
      entschaerfen: "die Runen in den Mäulern bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Fire-Breathing Statues", ausloeser: AUS.betreten.en,
      beschreibung: "Two dragon statues flank the room, their maws blackened inside.",
      wirkung: "Both statues breathe fire, the flames crossing at the centre of the room.",
      entschaerfen: "dispel the runes in the maws", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum4-schattenkammer", art: "raum", stufe: 4, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 21, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["religion", 20, 1], ["occultism", 21, 1]],
    wurf: {
      typ: "fortitude", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "void")], f: [D("3d8+5", "void"), Z("enfeebled", 1, "r1")],
        kf: [D("6d8+10", "void"), Z("enfeebled", 1, "m1"), Z("frightened", 1)]
      }
    },
    de: {
      name: "Kammer der Schatten", ausloeser: AUS.betreten.de,
      beschreibung: "Die Fackeln im Raum brennen auffällig schwach, die Schatten an den Wänden sind zu lang.",
      wirkung: "Die Schatten lösen sich von den Wänden und zehren an allen im Raum.",
      entschaerfen: "den Raum mit hellem Licht fluten und die Bindung lösen", ruecksetzen: "Lädt sich bei Sonnenuntergang neu."
    },
    en: {
      name: "Chamber of Shadows", ausloeser: AUS.betreten.en,
      beschreibung: "The torches in the room burn strikingly low, the shadows on the walls are too long.",
      wirkung: "The shadows peel away from the walls and gnaw at everyone in the room.",
      entschaerfen: "flood the room with bright light and unravel the binding", ruecksetzen: "Recharges at sunset."
    }
  },
  {
    id: "raum4-echokammer", art: "raum", stufe: 4, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 20, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 20, 1], ["thievery", 21, 1]],
    wurf: {
      typ: "fortitude", dc: 21, grade: {
        ke: [], e: [D("1d10+4", "sonic")], f: [D("4d6+5", "sonic"), Z("deafened", null, "m1")],
        kf: [D("8d6+10", "sonic"), Z("deafened", null, "m1"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Echokammer", ausloeser: AUS.betreten.de,
      beschreibung: "Ein runder Raum mit gewölbter Decke, jeder Schritt hallt vielfach nach.",
      wirkung: "Der nächste Laut schwillt im Raum zu einem Donnern an, das alle darin trifft. Es ist 500 Fuß weit zu hören.",
      entschaerfen: "die Rune im Scheitel der Kuppel bannen oder mit Tüchern dämpfen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Echo Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "A round room with a vaulted ceiling, every step echoes many times over.",
      wirkung: "The next sound swells in the room into a thunder that strikes everyone inside. It can be heard 500 feet away.",
      entschaerfen: "dispel the rune at the top of the dome or muffle it with cloths", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum4-spiegelsaal", art: "raum", stufe: 4, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 22, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 21, 1], ["arcana", 22, 1]],
    wurf: {
      typ: "will", dc: 21, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [D("2d10+8", "mental"), Z("off-guard", null, "r1"), Z("stupefied", 1, "m1")],
        kf: [D("4d10+16", "mental"), Z("confused", null, "r1"), Z("stupefied", 1, "m1")]
      }
    },
    de: {
      name: "Saal der Spiegelbilder", ausloeser: AUS.betreten.de,
      beschreibung: "Die Wände des Saals sind mit Spiegeln verkleidet, die Bilder darin bewegen sich einen Hauch zu spät.",
      wirkung: "Die Spiegelbilder treten einen Schritt vor, und niemand weiß mehr, wer Bild ist und wer nicht.",
      entschaerfen: "einen Spiegel verhängen und die Rune dahinter lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Hall of Reflections", ausloeser: AUS.betreten.en,
      beschreibung: "The walls of the hall are lined with mirrors, the images in them move a breath too late.",
      wirkung: "The reflections step forward, and no one knows any more who is image and who is not.",
      entschaerfen: "cover one mirror and unravel the rune behind it", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum4-saeulenwaechter", art: "raum", stufe: 4, merkmale: ["magical", "trap"],
    heimlichkeit: 22, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 21, 1], ["religion", 21, 1]],
    beschwoerung: { stufe: 5, runden: null, ort: "falle" },
    de: {
      name: "Wächter im Säulengang", ausloeser: AUS.betreten.de,
      beschreibung: "Zwischen zwei Säulen steht eine Figur aus Stein, der Sockel trägt eine verwitterte Inschrift.",
      wirkung: "Die Figur erwacht: Eine Kreatur bis Stufe 5 erscheint an ihrer Stelle und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Inschrift vollständig lesen und das letzte Wort tilgen", ruecksetzen: "Keines."
    },
    en: {
      name: "Guardian of the Colonnade", ausloeser: AUS.betreten.en,
      beschreibung: "A stone figure stands between two columns, its plinth bearing a weathered inscription.",
      wirkung: "The figure awakens: a creature of up to level 5 appears in its place and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "read the whole inscription and erase its last word", ruecksetzen: "None."
    }
  }
];
