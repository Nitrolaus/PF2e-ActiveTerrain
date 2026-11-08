// Eigene Fallen Stufe 2 (0.10.0, 07.11.2026: "gerecht für die normalen PF2e-Spieler, die nicht so starke Gruppen haben
// und eventuell nicht so gut heilen können"). Maßstab wie Stufe 1 (siehe fallen-stufe-1.mjs), eine Stufe höher:
// Rettungswurf SG 18, Angriff +11, Heimlichkeit 15 bis 18, Entschärfen 15 bis 18, Mindestgrad höchstens Geübt.
// Ein Fehlschlag wirft eine zerbrechliche Figur der Stufe 2 (18 TP) mit vollen TP nicht um, ein kritischer Fehlschlag
// tötet nie sofort (höchster Wurf unter 36). Keine langen Zustände, Zustände höchstens 1 Minute. Herbeigerufene Gegner
// bis Stufe 3. Die äußere Veränderung verblasst nach 1 Tag.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante und stürzt nicht", "grabs the edge and does not fall");
const tag = { value: 1, unit: "days" };

export const STUFE_2 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer2-speer", art: "tuer", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 18, haerte: 6, tp: 24 },
    entschaerfen: [["thievery", 17, 1]],
    angriff: { bonus: 11, schaden: [D("2d6+4", "piercing")], hoechstens: 1, nah: true },
    de: {
      name: "Speer im Türspalt", ausloeser: AUS.tuer.de,
      beschreibung: "Im Spalt neben der Angel steckt eine Speerspitze, kaum zu sehen im Schatten des Rahmens.",
      wirkung: "Der Speer stößt aus dem Spalt: Nahkampf-Angriff +11 gegen die öffnende Kreatur, 2W6+4 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "den Speer im Spalt verkeilen", ruecksetzen: "Von Hand zurückziehen und spannen."
    },
    en: {
      name: "Spear in the Door Gap", ausloeser: AUS.tuer.en,
      beschreibung: "A spearhead sits in the gap beside the hinge, barely visible in the shadow of the frame.",
      wirkung: "The spear thrusts from the gap: melee Strike +11 against the creature opening the door, 2d6+4 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "wedge the spear in the gap", ruecksetzen: "Pull back and cock by hand."
    }
  },
  {
    id: "tuer2-holzgatter", art: "tuer", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 0, ausloeser: 0, wirkung: 5, werte: { rk: 17, haerte: 6, tp: 28 },
    entschaerfen: [["thievery", 16, 1], ["athletics", 18, 0]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "bludgeoning")], f: [D("2d6+4", "bludgeoning"), Z("prone")],
        kf: [D("4d6+8", "bludgeoning"), Z("immobilized"), T("eingeklemmt bis Entkommen SG 18", "pinned until it Escapes (DC 18)")]
      }
    },
    de: {
      name: "Fallgatter aus Holz", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Tür hängt ein Gatter aus schweren Bohlen in einer Führung.",
      wirkung: "Das Gatter fällt hinter der öffnenden Kreatur herab und versperrt den Rückweg (Athletik SG 18 zum Anheben).",
      entschaerfen: "einen Keil in die Führung treiben", ruecksetzen: "Gatter an der Kette hochziehen."
    },
    en: {
      name: "Wooden Drop Gate", ausloeser: AUS.tuer.en,
      beschreibung: "A gate of heavy planks hangs in a guide rail above the door.",
      wirkung: "The gate drops behind the creature opening the door and blocks the way back (Athletics DC 18 to lift).",
      entschaerfen: "drive a wedge into the guide rail", ruecksetzen: "Haul the gate up by its chain."
    }
  },
  {
    id: "tuer2-kalkschuette", art: "tuer", stufe: 2, merkmale: ["mechanical", "acid", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 16, haerte: 4, tp: 16 },
    entschaerfen: [["thievery", 16, 1], ["crafting", 17, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "acid")], f: [D("1d10+6", "acid"), Z("dazzled", null, "r1")],
        kf: [D("2d10+12", "acid"), Z("blinded", null, "r1"), T("danach", "then"), Z("dazzled", null, "m1")]
      }
    },
    de: {
      name: "Löschkalk-Schütte", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Holzkasten hängt über dem Türsturz, feiner weißer Staub liegt auf der Schwelle.",
      wirkung: "Der Kasten klappt auf und schüttet ätzenden Kalk über alle unter dem Türsturz.",
      entschaerfen: "die Klappe mit einem Nagel sichern", ruecksetzen: "Kasten neu füllen."
    },
    en: {
      name: "Quicklime Chute", ausloeser: AUS.tuer.en,
      beschreibung: "A wooden box hangs above the lintel, fine white dust lies on the threshold.",
      wirkung: "The box flaps open and pours caustic lime over everyone under the lintel.",
      entschaerfen: "secure the flap with a nail", ruecksetzen: "Refill the box."
    }
  },
  {
    id: "tuer2-spinnendorn", art: "tuer", stufe: 2, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 16, haerte: 4, tp: 12 },
    entschaerfen: [["thievery", 17, 1]],
    gift: {
      typ: "fortitude", dc: 18, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d8", "poison"), Z("enfeebled", 1)],
        [D("2d6", "poison"), Z("enfeebled", 1), Z("clumsy", 1)],
        [D("2d6+3", "poison"), Z("enfeebled", 2), Z("clumsy", 1)]
      ]
    },
    de: {
      name: "Spinnengift-Dorn", ausloeser: AUS.tuer.de,
      beschreibung: "Ein schwarzer Dorn sitzt unter dem Türknauf, an der Spitze ein Tropfen Harz.",
      wirkung: "Der Dorn sticht in die Hand der öffnenden Kreatur. Spinnengift.", gift: "Spinnengift",
      entschaerfen: "den Dorn mit einer Zange abknipsen", ruecksetzen: "Neuen Dorn einsetzen."
    },
    en: {
      name: "Spider Venom Thorn", ausloeser: AUS.tuer.en,
      beschreibung: "A black thorn sits beneath the doorknob, a drop of resin on its tip.",
      wirkung: "The thorn pricks the hand of the creature opening the door. Spider venom.", gift: "Spider venom",
      entschaerfen: "nip off the thorn with pliers", ruecksetzen: "Fit a new thorn."
    }
  },
  {
    id: "tuer2-glutsiegel", art: "tuer", stufe: 2, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 0, wirkung: 5, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "fire")], f: [D("2d6+4", "fire")],
        kf: [D("4d6+8", "fire"), D("1d4", "fire", "persistent")]
      }
    },
    de: {
      name: "Glutsiegel", ausloeser: AUS.tuer.de,
      beschreibung: "Ein rotes Siegel aus Siegellack auf dem Türspalt, warm, wenn man die Hand darüber hält.",
      wirkung: "Das Siegel bricht und schleudert Glut über alle vor der Tür.",
      entschaerfen: "das Siegel bannen oder mit Wasser tränken und lösen", ruecksetzen: "Keines, das Siegel ist verbraucht."
    },
    en: {
      name: "Ember Seal", ausloeser: AUS.tuer.en,
      beschreibung: "A red seal of sealing wax across the door gap, warm when a hand is held over it.",
      wirkung: "The seal breaks and flings embers over everyone in front of the door.",
      entschaerfen: "dispel the seal or soak it with water and loosen it", ruecksetzen: "None, the seal is spent."
    }
  },
  {
    id: "tuer2-klageglocke", art: "tuer", stufe: 2, merkmale: ["magical", "mental", "fear", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 17, 1], ["religion", 18, 1]],
    wurf: {
      typ: "will", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "mental")], f: [D("2d6+4", "mental"), Z("frightened", 1)],
        kf: [D("4d6+8", "mental"), Z("frightened", 2), Z("fleeing", null, "r1")]
      }
    },
    de: {
      name: "Klagende Türglocke", ausloeser: AUS.tuer.de,
      beschreibung: "Eine kleine Bronzeglocke hängt über der Tür, ihr Klöppel ist mit Haar umwickelt.",
      wirkung: "Die Glocke schlägt an, und ein Klagen wie von Verlorenen hallt durch die Köpfe aller in der Nähe.",
      entschaerfen: "den Klöppel festbinden und den Spuk lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Wailing Door Bell", ausloeser: AUS.tuer.en,
      beschreibung: "A small bronze bell hangs above the door, its clapper wrapped in hair.",
      wirkung: "The bell strikes and a wailing as of the lost echoes through the minds of everyone nearby.",
      entschaerfen: "tie down the clapper and unravel the haunting", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer2-blitzrahmen", art: "tuer", stufe: 2, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 5, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "electricity")], f: [D("2d6+4", "electricity"), Z("off-guard", null, "zug")],
        kf: [D("4d6+8", "electricity"), Z("stunned", 1), T("und abstehendes Haar", "and hair on end")]
      }
    },
    aussehen: { de: ["Abstehendes Haar", "Das Haar steht in alle Richtungen ab und knistert bei Berührung. Verblasst nach 1 Tag."], en: ["Hair on End", "The hair sticks out in all directions and crackles when touched. Fades after 1 day."], toenung: "#e4dcff", dauer: tag },
    de: {
      name: "Kupferstreifen-Tür", ausloeser: AUS.tuer.de,
      beschreibung: "In den Türrahmen sind Kupferstreifen eingelassen, die leicht nach Gewitter riechen.",
      wirkung: "Ein Blitz springt zwischen den Streifen über und trifft alle im Türrahmen.",
      entschaerfen: "die Streifen mit einem Holzstab überbrücken und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Copper-Strip Door", ausloeser: AUS.tuer.en,
      beschreibung: "Copper strips are set into the door frame, smelling faintly of thunderstorm.",
      wirkung: "Lightning arcs between the strips and strikes everyone in the doorway.",
      entschaerfen: "bridge the strips with a wooden rod and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer2-tuerhueter", art: "tuer", stufe: 2, merkmale: ["magical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 18, 1], ["thievery", 18, 1]],
    beschwoerung: { stufe: 3, runden: 10, ort: "neben" },
    de: {
      name: "Türhüter-Zeichen", ausloeser: AUS.tuer.de,
      beschreibung: "Ein eingebranntes Zeichen auf dem Türblatt, ein Auge über einem Schlüssel.",
      wirkung: "Das Zeichen ruft einen Türhüter herbei: Eine Kreatur bis Stufe 3 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Auge aus dem Zeichen schneiden", ruecksetzen: "Keines."
    },
    en: {
      name: "Doorkeeper Sign", ausloeser: AUS.tuer.en,
      beschreibung: "A sign burned into the door leaf, an eye above a key.",
      wirkung: "The sign calls a doorkeeper: a creature of up to level 3 appears in a free square next to the door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "cut the eye out of the sign", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss2-giftfeder", art: "schloss", stufe: 2, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 17, haerte: 5, tp: 16 },
    entschaerfen: [["thievery", 17, 1]],
    gift: {
      typ: "fortitude", dc: 18, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d8", "poison"), Z("off-guard")],
        [D("2d6", "poison"), Z("off-guard"), Z("clumsy", 1)],
        [D("2d6+3", "poison"), Z("clumsy", 1), Z("prone")]
      ]
    },
    de: {
      name: "Giftfeder im Deckel", ausloeser: AUS.schloss.de,
      beschreibung: "Unter dem Deckelrand liegt eine Stahlfeder mit einer feinen Spitze.",
      wirkung: "Die Feder schnellt hervor und ritzt die Hand. Schwindelgift.", gift: "Schwindelgift",
      entschaerfen: "die Feder mit einem Messer niederdrücken und festbinden", ruecksetzen: "Spitze neu vergiften."
    },
    en: {
      name: "Poison Spring in the Lid", ausloeser: AUS.schloss.en,
      beschreibung: "A steel spring with a fine point lies under the rim of the lid.",
      wirkung: "The spring snaps out and scratches the hand. Dizzying poison.", gift: "Dizzying poison",
      entschaerfen: "press the spring down with a knife and tie it", ruecksetzen: "Poison the point again."
    }
  },
  {
    id: "schloss2-haken", art: "schloss", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 18, haerte: 6, tp: 24 },
    entschaerfen: [["thievery", 17, 1]],
    angriff: { bonus: 11, schaden: [D("1d10+5", "piercing")], hoechstens: 1, nah: true },
    de: {
      name: "Hakenfalle im Schlüsselloch", ausloeser: AUS.schloss.de,
      beschreibung: "Tief im Schlüsselloch glänzt ein gebogener Haken, der beim Drehen herausschnellt.",
      wirkung: "Der Haken schnellt heraus: Nahkampf-Angriff +11 gegen die Kreatur am Schloss, 1W10+5 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden, und die Hand hängt am Haken fest, Bewegungsunfähig bis Entkommen SG 18.",
      entschaerfen: "den Haken mit einem Draht festhalten", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Hook Trap in the Keyhole", ausloeser: AUS.schloss.en,
      beschreibung: "Deep in the keyhole gleams a curved hook that snaps out when the lock is turned.",
      wirkung: "The hook snaps out: melee Strike +11 against the creature at the lock, 1d10+5 piercing.",
      krit: "Critical hit: double damage, and the hand is caught on the hook, immobilized until it Escapes (DC 18).",
      entschaerfen: "hold the hook in place with a wire", ruecksetzen: "Rearm by hand."
    },
    kritZ: [Z("immobilized")]
  },
  {
    id: "schloss2-faerberpulver", art: "schloss", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 15, rang: 0, ausloeser: "knopf", wirkung: 5, werte: { rk: 15, haerte: 2, tp: 8 },
    entschaerfen: [["thievery", 15, 1], ["crafting", 16, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [Z("dazzled", null, "r1")], f: [Z("dazzled", null, "m1")],
        kf: [Z("blinded", null, "r1"), T("danach", "then"), Z("dazzled", null, "m1"), T("und grün gefärbt", "and dyed green")]
      }
    },
    aussehen: { de: ["Grün gefärbt", "Gesicht und Hände leuchtend grün, die Farbe geht nicht ab. Verblasst nach 1 Tag."], en: ["Dyed Green", "Face and hands bright green, the dye will not wash off. Fades after 1 day."], toenung: "#8fc98f", dauer: tag },
    de: {
      name: "Färberpulver", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Beutel unter dem Deckel, an der Naht ein grüner Fleck.",
      wirkung: "Der Beutel platzt und hüllt alle am Schloss in eine Wolke aus grünem Pulver.",
      entschaerfen: "den Beutel durch den Spalt herausziehen", ruecksetzen: "Neuen Beutel einlegen."
    },
    en: {
      name: "Dyer's Powder", ausloeser: AUS.schloss.en,
      beschreibung: "A pouch under the lid, a green stain on its seam.",
      wirkung: "The pouch bursts and wraps everyone at the lock in a cloud of green powder.",
      entschaerfen: "pull the pouch out through the gap", ruecksetzen: "Put in a new pouch."
    }
  },
  {
    id: "schloss2-feuerzunge", art: "schloss", stufe: 2, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "fire")], f: [D("1d10+6", "fire")],
        kf: [D("2d10+12", "fire"), D("1d4", "fire", "persistent")]
      }
    },
    de: {
      name: "Feuerzunge im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schlüsselloch ist innen verrußt, ein Geruch nach Lampenöl hängt daran.",
      wirkung: "Eine Flammenzunge leckt aus dem Schlüsselloch über die Hände der Kreatur am Schloss.",
      entschaerfen: "die Rune im Schloss bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Flame Tongue in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "The keyhole is sooty inside, a smell of lamp oil clings to it.",
      wirkung: "A tongue of flame licks out of the keyhole over the hands of the creature at the lock.",
      entschaerfen: "dispel the rune inside the lock", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss2-saeurespucker", art: "schloss", stufe: 2, merkmale: ["magical", "acid", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "acid")], f: [D("3d4+5", "acid")],
        kf: [D("6d4+10", "acid"), D("1d4", "acid", "persistent")]
      }
    },
    de: {
      name: "Säurespeiendes Siegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel in Form eines Krötenkopfs, das Maul halb offen.",
      wirkung: "Die Kröte speit einen Strahl Säure auf die Kreatur am Schloss.",
      entschaerfen: "das Maul mit Wachs verschließen und das Siegel lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Acid-Spitting Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A seal shaped like a toad's head, its mouth half open.",
      wirkung: "The toad spits a jet of acid at the creature at the lock.",
      entschaerfen: "close the mouth with wax and unravel the seal", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss2-daemmersiegel", art: "schloss", stufe: 2, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["occultism", 17, 1], ["arcana", 18, 1]],
    wurf: {
      typ: "will", dc: 18, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("slowed", 1, "r1"), Z("stupefied", 1, "m1")],
        kf: [Z("slowed", 1, "r1"), Z("stupefied", 2, "m1"), Z("prone")]
      }
    },
    de: {
      name: "Dämmersiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein blasses Siegel mit einem halb geschlossenen Auge.",
      wirkung: "Das Siegel bricht, und eine bleierne Müdigkeit legt sich auf die Kreatur am Schloss.",
      entschaerfen: "das Siegel lösen, ohne dem Auge zu begegnen", ruecksetzen: "Keines, das Siegel ist verbraucht."
    },
    en: {
      name: "Drowsing Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A pale seal showing a half-closed eye.",
      wirkung: "The seal breaks and a leaden weariness settles on the creature at the lock.",
      entschaerfen: "unravel the seal without meeting the eye", ruecksetzen: "None, the seal is spent."
    }
  },
  {
    id: "schloss2-knallsiegel", art: "schloss", stufe: 2, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: "knopf", wirkung: 5, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "fortitude", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "sonic")], f: [D("2d6+4", "sonic"), Z("deafened", null, "m1")],
        kf: [D("4d6+8", "sonic"), Z("deafened", null, "m1"), Z("stunned", 1)]
      }
    },
    de: {
      name: "Knallsiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein dickes Siegel aus grauem Wachs, darin eine Spirale eingedrückt.",
      wirkung: "Das Siegel platzt mit einem ohrenbetäubenden Knall. Er ist 300 Fuß weit zu hören.",
      entschaerfen: "die Spirale im Wachs lösen", ruecksetzen: "Keines."
    },
    en: {
      name: "Bang Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A thick seal of grey wax with a spiral pressed into it.",
      wirkung: "The seal bursts with a deafening bang. It can be heard 300 feet away.",
      entschaerfen: "unravel the spiral in the wax", ruecksetzen: "None."
    }
  },
  {
    id: "schloss2-hueter", art: "schloss", stufe: 2, merkmale: ["magical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 18, 1], ["occultism", 18, 1]],
    beschwoerung: { stufe: 3, runden: 10, ort: "neben" },
    de: {
      name: "Siegel des Hüters", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Kreis aus Zeichen auf dem Deckel, in der Mitte eine kleine Krone.",
      wirkung: "Das Siegel ruft einen Hüter herbei: Eine Kreatur bis Stufe 3 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Krone aus dem Kreis kratzen", ruecksetzen: "Keines."
    },
    en: {
      name: "Keeper's Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A circle of signs on the lid, a small crown at its centre.",
      wirkung: "The seal calls a keeper: a creature of up to level 3 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "scratch the crown out of the circle", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende2-fussangel", art: "gelaende", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 0, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["survival", 16, 1], ["thievery", 16, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [D("1d10+6", "piercing"), Z("immobilized"), T("(Entkommen SG 18)", "(Escape DC 18)")],
        kf: [D("2d10+12", "piercing"), Z("immobilized"), T("(Entkommen SG 18)", "(Escape DC 18)"), Z("clumsy", 1, "m1")]
      }
    },
    de: {
      name: "Fußangel-Loch", ausloeser: AUS.feld.de,
      beschreibung: "Ein fußbreites Loch unter Laub, die Wände mit schräg nach unten zeigenden Spitzen gespickt.",
      wirkung: "Der Fuß bricht ein und steckt zwischen den Spitzen fest.",
      entschaerfen: "das Loch aufdecken und mit einem Stein füllen", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Ankle-Breaker Hole", ausloeser: AUS.feld.en,
      beschreibung: "A foot-wide hole under leaves, its walls studded with spikes pointing down at an angle.",
      wirkung: "The foot breaks through and sticks between the spikes.",
      entschaerfen: "uncover the hole and fill it with a stone", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende2-baumstamm", art: "gelaende", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 0, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["thievery", 16, 1], ["athletics", 17, 0]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "bludgeoning")], f: [D("2d6+4", "bludgeoning"), Z("prone")],
        kf: [D("4d6+8", "bludgeoning"), Z("prone"), Z("off-guard", null, "r1")]
      }
    },
    de: {
      name: "Rollender Baumstamm", ausloeser: AUS.betreten.de,
      beschreibung: "Am Hang über dem Pfad liegt ein Baumstamm hinter zwei Pflöcken, ein Seil führt quer über den Weg.",
      wirkung: "Die Pflöcke geben nach, und der Stamm rollt den Hang herab über den Pfad.",
      entschaerfen: "die Pflöcke mit Steinen abstützen", ruecksetzen: "Stamm mit Seilen hochziehen."
    },
    en: {
      name: "Rolling Log", ausloeser: AUS.betreten.en,
      beschreibung: "On the slope above the path a log lies behind two stakes, a rope runs across the way.",
      wirkung: "The stakes give way and the log rolls down the slope across the path.",
      entschaerfen: "brace the stakes with stones", ruecksetzen: "Haul the log back up with ropes."
    }
  },
  {
    id: "gelaende2-fallnetz", art: "gelaende", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: { rk: 15, haerte: 1, tp: 10 },
    entschaerfen: [["survival", 16, 1], ["thievery", 17, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [Z("off-guard", null, "r1")], f: [Z("immobilized"), T("(Entkommen SG 18), unter dem Netz", "(Escape DC 18), under the net")],
        kf: [Z("restrained"), T("(Entkommen SG 18), im Netz verheddert", "(Escape DC 18), tangled in the net"), Z("prone")]
      }
    },
    de: {
      name: "Fallnetz in den Ästen", ausloeser: AUS.betreten.de,
      beschreibung: "Hoch in den Ästen hängt ein zusammengerafftes Netz, beschwert mit Steinen.",
      wirkung: "Das Netz fällt über alle im Wirkungsbereich. Das Netz hat RK 15, Härte 1 und 10 TP.",
      entschaerfen: "die Haltschnur oben im Baum lösen", ruecksetzen: "Netz neu aufhängen."
    },
    en: {
      name: "Drop Net in the Branches", ausloeser: AUS.betreten.en,
      beschreibung: "High in the branches hangs a gathered net, weighted with stones.",
      wirkung: "The net drops over everyone in the area. The net has AC 15, Hardness 1 and 10 HP.",
      entschaerfen: "untie the holding cord up in the tree", ruecksetzen: "Hang the net again."
    }
  },
  {
    id: "gelaende2-bolzenfalle", art: "gelaende", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 0, werte: { rk: 17, haerte: 5, tp: 20 },
    entschaerfen: [["thievery", 17, 1], ["survival", 18, 1]],
    angriff: { bonus: 11, schaden: [D("2d6+4", "piercing")], hoechstens: 1 },
    de: {
      name: "Bolzenfalle am Wildwechsel", ausloeser: AUS.feld.de,
      beschreibung: "Eine gespannte Armbrust ist im Gebüsch am Wildwechsel festgebunden, ein Faden läuft über den Pfad.",
      wirkung: "Die Armbrust schießt: Fernkampf-Angriff +11 gegen die auslösende Kreatur, 2W6+4 Stich.",
      krit: "Kritischer Treffer: doppelter Schaden.",
      entschaerfen: "den Faden lösen oder die Armbrust entspannen", ruecksetzen: "Neu spannen und laden."
    },
    en: {
      name: "Bolt Trap on the Game Trail", ausloeser: AUS.feld.en,
      beschreibung: "A cocked crossbow is tied in the bushes by the game trail, a thread runs across the path.",
      wirkung: "The crossbow fires: ranged Strike +11 against the triggering creature, 2d6+4 piercing.",
      krit: "Critical hit: double damage.",
      entschaerfen: "loosen the thread or uncock the crossbow", ruecksetzen: "Cock and load it again."
    }
  },
  {
    id: "gelaende2-giftdornbusch", art: "gelaende", stufe: 2, merkmale: ["environmental", "poison", "trap"],
    heimlichkeit: 15, rang: 0, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["nature", 15, 1], ["survival", 16, 1]],
    gift: {
      typ: "fortitude", dc: 18, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d8", "poison"), Z("sickened", 1)],
        [D("2d6", "poison"), Z("sickened", 1), Z("enfeebled", 1)],
        [D("2d6+3", "poison"), Z("sickened", 2), Z("enfeebled", 1)]
      ]
    },
    de: {
      name: "Giftdornbusch", ausloeser: AUS.feld.de,
      beschreibung: "Ein unscheinbarer Strauch mit langen, rötlichen Dornen wächst über den Pfad.",
      wirkung: "Die Dornen streifen die Haut. Dornensaft.", gift: "Dornensaft",
      entschaerfen: "die Zweige mit Handschuhen zurückbinden oder abschneiden", ruecksetzen: "Wächst in einigen Tagen nach."
    },
    en: {
      name: "Venom Thornbush", ausloeser: AUS.feld.en,
      beschreibung: "An unremarkable shrub with long, reddish thorns grows over the path.",
      wirkung: "The thorns graze the skin. Thorn sap.", gift: "Thorn sap",
      entschaerfen: "tie back or cut the branches with gloves", ruecksetzen: "Grows back in a few days."
    }
  },
  {
    id: "gelaende2-boeenstein", art: "gelaende", stufe: 2, merkmale: ["magical", "air", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["nature", 17, 1], ["arcana", 17, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [T("5 Fuß weggestoßen", "pushed 5 feet away")],
        f: [D("2d6+4", "bludgeoning"), T("10 Fuß weggeschleudert", "hurled 10 feet away"), Z("prone")],
        kf: [D("4d6+8", "bludgeoning"), T("20 Fuß weggeschleudert", "hurled 20 feet away"), Z("prone")]
      }
    },
    de: {
      name: "Böenstein", ausloeser: AUS.betreten.de,
      beschreibung: "Ein flacher Stein mit Löchern wie eine Flöte, der Wind pfeift leise darin.",
      wirkung: "Eine heftige Bö bricht aus dem Stein und fegt alle im Wirkungsbereich davon.",
      entschaerfen: "die Löcher mit Moos stopfen und den Zauber lösen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Gust Stone", ausloeser: AUS.betreten.en,
      beschreibung: "A flat stone with holes like a flute, the wind whistles softly inside.",
      wirkung: "A fierce gust bursts from the stone and sweeps everyone in the area away.",
      entschaerfen: "stop the holes with moss and unravel the spell", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "gelaende2-eisbach", art: "gelaende", stufe: 2, merkmale: ["magical", "cold", "water", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["nature", 16, 1], ["arcana", 17, 1]],
    wurf: {
      typ: "fortitude", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "cold")], f: [D("2d6+4", "cold"), Z("slowed", 1, "r1")],
        kf: [D("4d6+8", "cold"), Z("slowed", 1, "r1"), Z("clumsy", 1, "m1")]
      }
    },
    de: {
      name: "Eisiger Bachlauf", ausloeser: AUS.betreten.de,
      beschreibung: "Ein flacher Bach, an dessen Ufer mitten im Sommer Reif liegt.",
      wirkung: "Das Wasser wird schlagartig eiskalt und kriecht an den Beinen hoch.",
      entschaerfen: "den Bannstein im Bachbett finden und herausnehmen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Icy Brook", ausloeser: AUS.betreten.en,
      beschreibung: "A shallow brook with frost on its banks in the middle of summer.",
      wirkung: "The water turns ice-cold at once and creeps up the legs.",
      entschaerfen: "find the ward stone in the brook bed and take it out", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "gelaende2-huegelgrab", art: "gelaende", stufe: 2, merkmale: ["magical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 18, 1], ["arcana", 18, 1]],
    beschwoerung: { stufe: 3, runden: 10, ort: "falle" },
    de: {
      name: "Ruf aus dem Hügelgrab", ausloeser: AUS.betreten.de,
      beschreibung: "Ein flacher Grabhügel, auf der Kuppe ein umgestürzter Stein mit einer Inschrift.",
      wirkung: "Die Erde bricht auf, und eine Kreatur bis Stufe 3 steigt aus dem Hügel. Sie würfelt sofort Initiative, greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Inschrift mit einem Gebet versiegeln", ruecksetzen: "Keines."
    },
    en: {
      name: "Call from the Barrow", ausloeser: AUS.betreten.en,
      beschreibung: "A low burial mound, a toppled stone with an inscription on its crest.",
      wirkung: "The earth breaks open and a creature of up to level 3 climbs out of the mound. It rolls initiative at once, attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "seal the inscription with a prayer", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum2-sichelpendel", art: "raum", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 18, haerte: 7, tp: 28 },
    entschaerfen: [["thievery", 17, 1], ["athletics", 18, 0]],
    angriff: { bonus: 11, schaden: [D("2d6+4", "slashing")], hoechstens: null, nah: true },
    de: {
      name: "Sichelpendel", ausloeser: AUS.platte.de,
      beschreibung: "Eine Rinne in der Decke, darin eine rostige Sichel an einem Pendelarm.",
      wirkung: "Die Sichel schwingt herab: Nahkampf-Angriff +11 gegen jede Kreatur in der Bahn, 2W6+4 Hieb.",
      krit: "Kritischer Treffer: doppelter Schaden und Liegend.",
      entschaerfen: "den Pendelarm blockieren", ruecksetzen: "Schwingt zurück, nach 1 Runde wieder bereit."
    },
    en: {
      name: "Sickle Pendulum", ausloeser: AUS.platte.en,
      beschreibung: "A groove in the ceiling, inside it a rusty sickle on a pendulum arm.",
      wirkung: "The sickle swings down: melee Strike +11 against each creature in its path, 2d6+4 slashing.",
      krit: "Critical hit: double damage and prone.",
      entschaerfen: "block the pendulum arm", ruecksetzen: "Swings back, ready again after 1 round."
    },
    kritZ: [Z("prone")]
  },
  {
    id: "raum2-falltuer", art: "raum", stufe: 2, merkmale: ["mechanical", "trap"],
    heimlichkeit: 16, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["thievery", 16, 1], ["crafting", 17, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt und fängt sich nach 10 Fuß an einem Vorsprung", "falls and catches a ledge after 10 feet"), D("5", "bludgeoning"), D("1d10", "bludgeoning"), Z("prone")],
        kf: [T("stürzt 20 Fuß bis auf den Grund", "falls 20 feet to the bottom"), D("10", "bludgeoning"), D("2d10", "bludgeoning"), Z("prone")]
      }
    },
    de: {
      name: "Falltür im Gang", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Bodenplatte mit feinen Fugen rundum, darunter ein 20 Fuß tiefer Schacht mit einem Vorsprung.",
      wirkung: "Die Falltür klappt auf. Herausklettern Athletik SG 16.",
      entschaerfen: "die Falltür von unten oder mit Keilen festsetzen", ruecksetzen: "Klappt von selbst zurück."
    },
    en: {
      name: "Trapdoor in the Corridor", ausloeser: AUS.betreten.en,
      beschreibung: "A floor slab with fine joints all round, beneath it a 20-foot shaft with a ledge.",
      wirkung: "The trapdoor swings open. Climbing out takes Athletics DC 16.",
      entschaerfen: "fix the trapdoor from below or with wedges", ruecksetzen: "Swings shut on its own."
    }
  },
  {
    id: "raum2-wuergerauch", art: "raum", stufe: 2, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: { rk: 15, haerte: 4, tp: 14 },
    entschaerfen: [["thievery", 17, 1], ["crafting", 16, 1]],
    gift: {
      typ: "fortitude", dc: 18, max: { de: "4 Runden", en: "4 rounds" },
      stufen: [
        [D("1d8", "poison"), Z("sickened", 1)],
        [D("2d6", "poison"), Z("sickened", 1), Z("off-guard")],
        [D("2d6+3", "poison"), Z("sickened", 2), Z("off-guard")]
      ]
    },
    de: {
      name: "Würgerauch-Kamin", ausloeser: AUS.betreten.de,
      beschreibung: "Ein kalter Kamin an der Wand, aus dem Abzug riecht es nach nassem Ruß.",
      wirkung: "Ein Schwall beißender Rauch quillt aus dem Kamin und füllt den Wirkungsbereich. Würgerauch.", gift: "Würgerauch",
      entschaerfen: "den Abzug mit einem Tuch verstopfen", ruecksetzen: "Rauchtopf neu füllen."
    },
    en: {
      name: "Choking Smoke Flue", ausloeser: AUS.betreten.en,
      beschreibung: "A cold fireplace against the wall, the flue smells of wet soot.",
      wirkung: "A gush of acrid smoke billows from the fireplace and fills the area. Choking smoke.", gift: "Choking smoke",
      entschaerfen: "plug the flue with a cloth", ruecksetzen: "Refill the smoke pot."
    }
  },
  {
    id: "raum2-gluehrost", art: "raum", stufe: 2, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "fire")], f: [D("2d6+4", "fire")],
        kf: [D("4d6+8", "fire"), D("1d4", "fire", "persistent")]
      }
    },
    de: {
      name: "Glühender Bodenrost", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Eisenrost im Boden, darunter liegt kalte Asche.",
      wirkung: "Der Rost glüht auf, und Flammen schlagen durch die Gitterstäbe.",
      entschaerfen: "die Rune unter dem Rost bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Glowing Floor Grate", ausloeser: AUS.betreten.en,
      beschreibung: "An iron grate in the floor, cold ash beneath it.",
      wirkung: "The grate glows and flames lash up through the bars.",
      entschaerfen: "dispel the rune beneath the grate", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum2-raureifkammer", art: "raum", stufe: 2, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 17, 1], ["nature", 17, 1]],
    wurf: {
      typ: "fortitude", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "cold")], f: [D("3d4+5", "cold"), Z("clumsy", 1, "r1")],
        kf: [D("6d4+10", "cold"), Z("clumsy", 1, "m1"), Z("slowed", 1, "r1")]
      }
    },
    de: {
      name: "Raureifkammer", ausloeser: AUS.betreten.de,
      beschreibung: "Die Wände des Raums sind mit einer dünnen Reifschicht überzogen, der Atem dampft.",
      wirkung: "Eisiger Nebel fällt von der Decke und legt sich auf alle im Raum.",
      entschaerfen: "die Kälterune in der Decke bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Hoarfrost Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "The walls of the room are coated with a thin layer of frost, breath steams.",
      wirkung: "Icy mist falls from the ceiling and settles on everyone in the room.",
      entschaerfen: "dispel the cold rune in the ceiling", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum2-angstspiegel", art: "raum", stufe: 2, merkmale: ["magical", "mental", "fear", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 17, 1], ["religion", 18, 1]],
    wurf: {
      typ: "will", dc: 18, grade: {
        ke: [], e: [Z("frightened", 1)], f: [D("2d6+4", "mental"), Z("frightened", 1)],
        kf: [D("4d6+8", "mental"), Z("frightened", 2), T("und eine weiße Strähne", "and a white streak")]
      }
    },
    aussehen: { de: ["Weiße Strähne", "Eine schneeweiße Strähne im Haar, wie vor Schreck. Verblasst nach 1 Tag."], en: ["White Streak", "A snow-white streak in the hair, as if from fright. Fades after 1 day."], toenung: null, dauer: tag },
    de: {
      name: "Spiegel der Angst", ausloeser: AUS.betreten.de,
      beschreibung: "Ein mannshoher Spiegel mit schwarzem Rahmen, das Glas ist leicht trüb.",
      wirkung: "Im Spiegel zeigt sich jedem, was er am meisten fürchtet.",
      entschaerfen: "den Spiegel verhängen und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Mirror of Dread", ausloeser: AUS.betreten.en,
      beschreibung: "A man-high mirror in a black frame, the glass slightly clouded.",
      wirkung: "The mirror shows everyone what they fear most.",
      entschaerfen: "cover the mirror and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum2-stosswaende", art: "raum", stufe: 2, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 17, rang: 1, ausloeser: 5, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 17, 1], ["thievery", 18, 1]],
    wurf: {
      typ: "reflex", dc: 18, grade: {
        ke: [], e: [D("1d6+3", "force")], f: [D("2d6+4", "force"), Z("prone")],
        kf: [D("4d6+8", "force"), T("gegen die Wand geschleudert", "hurled against the wall"), Z("prone")]
      }
    },
    de: {
      name: "Stoßende Wände", ausloeser: AUS.betreten.de,
      beschreibung: "Die Wände des Gangs tragen zwei gleiche Runen, eine links, eine rechts.",
      wirkung: "Die Runen leuchten auf, und Kraftwellen stoßen von beiden Seiten in den Gang.",
      entschaerfen: "eine der beiden Runen bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Shoving Walls", ausloeser: AUS.betreten.en,
      beschreibung: "The walls of the corridor bear two matching runes, one left, one right.",
      wirkung: "The runes light up and waves of force shove into the corridor from both sides.",
      entschaerfen: "dispel one of the two runes", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum2-wandbild", art: "raum", stufe: 2, merkmale: ["magical", "trap"],
    heimlichkeit: 18, rang: 1, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 18, 1], ["religion", 18, 1]],
    beschwoerung: { stufe: 3, runden: null, ort: "falle" },
    de: {
      name: "Wächter im Wandbild", ausloeser: AUS.betreten.de,
      beschreibung: "Ein verblasstes Wandbild zeigt einen Wächter mit erhobener Waffe, seine Augen sind frisch übermalt.",
      wirkung: "Der Wächter tritt aus dem Bild: Eine Kreatur bis Stufe 3 erscheint vor der Wand und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Augen des Wächters übermalen, solange er schläft", ruecksetzen: "Keines."
    },
    en: {
      name: "Guardian in the Mural", ausloeser: AUS.betreten.en,
      beschreibung: "A faded mural shows a guardian with a raised weapon, its eyes freshly painted over.",
      wirkung: "The guardian steps out of the painting: a creature of up to level 3 appears in front of the wall and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "paint over the guardian's eyes while it sleeps", ruecksetzen: "None."
    }
  }
];
