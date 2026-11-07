// Eigene Fallen Stufe 9 (0.8.0, 07.11.2026: "jetzt Fallen für Stufe 9 bauen"). Maßstab wie Stufe 8, eine Stufe
// härter (Wunsch: "die nächsten Fallen für das nächste Level noch tödlicher und debuffender", "Fallen in PF2e sollen brutal
// sein"): Ein Fehlschlag wirft eine Figur der Stufe 9 um (im Schnitt rund 85 Schaden), ein kritischer Fehlschlag jede.
// Rettungswurf SG 31, Angriff +25, Heimlichkeit 30 bis 33, Entschärfen 30 bis 33, Mindestgrad höchstens Experte.
// Herbeigerufene Gegner bis Stufe 12 (drei Stufen über der Falle wie bei Stufe 5 bis 8).
// Lange Zustände (Wunsch: "arbeite mehr mit Zuständen, die länger andauern, blind für 28 Stunden oder versteinert"):
// Jede Falle, die nicht vergiftet oder herbeiruft, hinterlässt schon beim Fehlschlag oder Treffer etwas Langes, ein
// Drittel davon schon für 1 Woche; der kritische Fehlschlag hält immer 1 Woche. Neu auf Stufe 9: Bewusstlos für
// 1 Woche (Siegel der ewigen Ruhe), Blind und Taub zugleich für 1 Woche (Pforte der Stille), Gelähmt im Eisblock.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante", "grabs the edge");
const seil = T("hält sich am Seil fest", "holds on to the rope");

export const STUFE_9 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer9-harpunen", art: "tuer", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 28, haerte: 18, tp: 72 },
    entschaerfen: [["thievery", 31, 2]],
    angriff: { bonus: 25, schaden: [D("10d10+20", "piercing"), D("5d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Harpunen in der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Das Türblatt ist mit Eisen beschlagen, zwischen den Beschlägen sitzen runde Klappen.",
      wirkung: "Aus den Klappen schießen Harpunen mit Widerhaken: je ein Fernkampf-Angriff +25 gegen jede Kreatur im Wirkungsbereich, 10W10+20 Stich und 5W6 anhaltende Blutung. Treffer: Die Widerhaken reißen beim Herausziehen, Kraftlos 2 und Unbeholfen 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und die Harpune zerreißt Muskeln und Sehnen: Kraftlos 2 und Unbeholfen 2 für 1 Woche.",
      entschaerfen: "die Klappen von innen vernageln", ruecksetzen: "Harpunen neu laden (10 Minuten)."
    },
    en: {
      name: "Harpoons in the Door", ausloeser: AUS.tuer.en,
      beschreibung: "The door leaf is shod with iron, round flaps sit between the fittings.",
      wirkung: "Barbed harpoons shoot out of the flaps: one ranged Strike +25 against each creature in the area, 10d10+20 piercing and 5d6 persistent bleed. Hit: the barbs tear when pulled out, enfeebled 2 and clumsy 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the harpoon tears muscles and tendons: enfeebled 2 and clumsy 2 for 1 week.",
      entschaerfen: "nail the flaps shut from inside", ruecksetzen: "Reload the harpoons (10 minutes)."
    },
    trefferZ: [Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1")], kritZ: [Z("prone"), Z("enfeebled", 2, "w1"), Z("clumsy", 2, "w1")]
  },
  {
    id: "tuer9-torfluegel", art: "tuer", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 30, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 28, haerte: 20, tp: 80 },
    entschaerfen: [["thievery", 30, 1], ["athletics", 32, 0]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("6d10+12", "bludgeoning")],
        f: [D("11d10+24", "bludgeoning"), T("Rippen gebrochen:", "ribs broken:"), Z("enfeebled", 2, "t1"), Z("slowed", 1, "t1")],
        kf: [D("22d10+48", "bludgeoning"), Z("immobilized"), T("zwischen den Flügeln eingeklemmt bis Athletik SG 31, der Brustkorb eingedrückt:", "pinned between the wings until Athletics DC 31, the chest caved in:"), Z("enfeebled", 3, "w1"), Z("slowed", 1, "w1")]
      }
    },
    de: {
      name: "Zermalmende Torflügel", ausloeser: AUS.tuer.de,
      beschreibung: "Ein zweiflügliges Tor aus Eichenbohlen, die Flügel hängen an armdicken Federn.",
      wirkung: "Kaum ist ein Flügel offen, schlagen beide mit voller Wucht zusammen.",
      entschaerfen: "die Federn mit Ketten sichern", ruecksetzen: "Spannt sich nach 1 Minute selbst."
    },
    en: {
      name: "Crushing Gate Wings", ausloeser: AUS.tuer.en,
      beschreibung: "A double gate of oak planks, the wings hang on springs as thick as an arm.",
      wirkung: "As soon as one wing is open, both slam together with full force.",
      entschaerfen: "secure the springs with chains", ruecksetzen: "Rewinds itself after 1 minute."
    }
  },
  {
    id: "tuer9-saeureschleuse", art: "tuer", stufe: 9, merkmale: ["mechanical", "acid", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 26, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 31, 2], ["crafting", 30, 1]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("9d6", "acid")],
        f: [D("18d6", "acid"), D("6d6", "acid", "persistent"), T("verätzt:", "corroded:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("36d6", "acid"), D("8d6", "acid", "persistent"), T("die Säure frisst sich in die Augen:", "the acid eats into the eyes:"), Z("blinded", null, "w1"), Z("clumsy", 2, "w1"), T("und die Säurenarben", "and the acid scars")]
      }
    },
    aussehen: { de: ["Säurenarben", "Glänzende, wulstige Narben ziehen sich über Gesicht und Hände."], en: ["Acid Scars", "Shiny, raised scars run across face and hands."], toenung: "#a8b878", dauer: { value: 30, unit: "days" } },
    de: {
      name: "Säureschleuse", ausloeser: AUS.tuer.de,
      beschreibung: "Die Steine um die Tür sind angefressen und fleckig, über dem Sturz läuft eine Rinne.",
      wirkung: "Eine Schleuse öffnet sich, und ein Schwall Säure stürzt über alle vor der Tür.",
      entschaerfen: "die Rinne verstopfen und die Schleuse verkeilen", ruecksetzen: "Becken neu füllen."
    },
    en: {
      name: "Acid Sluice", ausloeser: AUS.tuer.en,
      beschreibung: "The stones around the door are eaten away and stained, a gutter runs above the lintel.",
      wirkung: "A sluice opens, and a gush of acid pours over everyone in front of the door.",
      entschaerfen: "block the gutter and wedge the sluice", ruecksetzen: "Refill the basin."
    }
  },
  {
    id: "tuer9-ewige-ruhe", art: "tuer", stufe: 9, merkmale: ["magical", "mental", "curse", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 31, 2], ["religion", 32, 2]],
    wurf: {
      typ: "will", dc: 31, grade: {
        ke: [], e: [D("8d8+6", "mental"), Z("slowed", 1, "r1")],
        f: [D("16d8+12", "mental"), Z("slowed", 1, "m1"), T("bleierne Müdigkeit:", "leaden weariness:"), Z("stupefied", 2, "w1")],
        kf: [D("32d8+24", "mental"), T("fällt in einen Schlaf wie der Tod:", "falls into a sleep like death:"), Z("unconscious", null, "w1"), T("weder Lärm noch Schmerz wecken sie, nur ein Bann oder das Ende der Laufzeit; dazu der Grabesstaub", "neither noise nor pain wake it, only a dispel or the end of the duration; and the grave dust")]
      }
    },
    aussehen: { de: ["Grabesstaub", "Haut und Haar sind von grauem Staub bedeckt, der sich nicht abwaschen lässt."], en: ["Grave Dust", "Skin and hair are covered in grey dust that will not wash off."], toenung: "#a0a0a0", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Siegel der ewigen Ruhe", ausloeser: AUS.tuer.de,
      beschreibung: "Auf der Tür ein Siegel mit geschlossenen Augen, darunter die Inschrift: Wer hier eintritt, schlafe.",
      wirkung: "Ein Schlaf wie der Tod legt sich auf alle vor der Tür.",
      entschaerfen: "die Inschrift tilgen und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Woche neu."
    },
    en: {
      name: "Seal of Eternal Rest", ausloeser: AUS.tuer.en,
      beschreibung: "On the door a seal with closed eyes, below it the inscription: Whoever enters here, sleep.",
      wirkung: "A sleep like death settles on everyone in front of the door.",
      entschaerfen: "erase the inscription and unravel the spell", ruecksetzen: "Recharges after 1 week."
    }
  },
  {
    id: "tuer9-stille", art: "tuer", stufe: 9, merkmale: ["magical", "sonic", "visual", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 31, 2], ["occultism", 32, 2]],
    wurf: {
      typ: "fortitude", dc: 31, grade: {
        ke: [], e: [D("8d10", "sonic"), Z("deafened", null, "m1")],
        f: [D("16d10", "sonic"), Z("stunned", 1), T("das Gehör stirbt ab:", "the hearing dies:"), Z("deafened", null, "w1"), Z("dazzled", null, "t1")],
        kf: [D("32d10", "sonic"), Z("stunned", 3), T("Augen und Ohren sterben ab:", "eyes and ears die:"), Z("blinded", null, "w1"), Z("deafened", null, "w1"), T("und die blutigen Tränen", "and the bloody tears")]
      }
    },
    aussehen: { de: ["Blutige Tränen", "Aus Augen und Ohren sickern dünne Blutfäden, die immer wieder kommen."], en: ["Bloody Tears", "Thin threads of blood seep from eyes and ears, again and again."], toenung: "#b04848", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Pforte der Stille", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Tor aus weißem Stein ohne jeden Schmuck, davor verschluckt die Luft jedes Geräusch.",
      wirkung: "Ein lautloser Schlag aus Licht und Schall nimmt allen vor der Pforte Sicht und Gehör.",
      entschaerfen: "in völliger Stille die Rune unter der Schwelle bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Gate of Silence", ausloeser: AUS.tuer.en,
      beschreibung: "A gate of white stone without any ornament, before it the air swallows every sound.",
      wirkung: "A soundless blow of light and sound takes sight and hearing from everyone before the gate.",
      entschaerfen: "dispel the rune beneath the threshold in complete silence", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer9-drachenkopf", art: "tuer", stufe: 9, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 31, 2], ["thievery", 32, 2]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("9d6", "fire")],
        f: [D("18d6", "fire"), D("6d6", "fire", "persistent"), T("Brandblasen:", "blistering burns:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("36d6", "fire"), D("8d6", "fire", "persistent"), Z("prone"), Z("drained", 2), T("bis auf die Knochen verbrannt:", "burnt to the bone:"), Z("clumsy", 2, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Drachenkopf über der Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Tür ragt ein steinerner Drachenkopf aus der Wand, zwischen seinen Zähnen glimmt es.",
      wirkung: "Der Drachenkopf speit einen Kegel aus Feuer über alle vor der Tür.",
      entschaerfen: "das Maul mit nassem Lehm verschließen und die Rune bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Dragon Head above the Door", ausloeser: AUS.tuer.en,
      beschreibung: "Above the door a stone dragon's head juts from the wall, something glows between its teeth.",
      wirkung: "The dragon head spews a cone of fire over everyone in front of the door.",
      entschaerfen: "seal the maw with wet clay and dispel the rune", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer9-schwarzeis", art: "tuer", stufe: 9, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 31, 2], ["nature", 32, 2]],
    wurf: {
      typ: "fortitude", dc: 31, grade: {
        ke: [], e: [D("8d10", "cold"), Z("slowed", 1, "r1")],
        f: [D("16d10", "cold"), Z("slowed", 1, "m1"), T("Frostbeulen:", "frostbite:"), Z("clumsy", 1, "w1")],
        kf: [D("32d10", "cold"), Z("drained", 2), T("Finger und Zehen erfrieren:", "fingers and toes freeze:"), Z("clumsy", 3, "w1"), Z("slowed", 1, "w1"), T("und die schwarzen Finger", "and the black fingers")]
      }
    },
    aussehen: { de: ["Schwarze Finger", "Die Fingerspitzen sind schwarz und gefühllos, die Nägel splittern."], en: ["Black Fingers", "The fingertips are black and numb, the nails splinter."], toenung: "#6878a0", dauer: { value: 30, unit: "days" } },
    de: {
      name: "Tür aus schwarzem Eis", ausloeser: AUS.tuer.de,
      beschreibung: "Die Tür ist aus dunklem, durchscheinendem Eis, das auch im Sommer nicht taut.",
      wirkung: "Beißende Kälte bricht aus dem Eis und fährt in alle vor der Tür.",
      entschaerfen: "das Eis mit Feuer und einer Rune zum Schmelzen bringen", ruecksetzen: "Friert in der nächsten Nacht neu."
    },
    en: {
      name: "Door of Black Ice", ausloeser: AUS.tuer.en,
      beschreibung: "The door is made of dark, translucent ice that does not thaw even in summer.",
      wirkung: "Biting cold breaks from the ice and enters everyone in front of the door.",
      entschaerfen: "melt the ice with fire and a rune", ruecksetzen: "Freezes anew the next night."
    }
  },
  {
    id: "tuer9-schwarze-glocke", art: "tuer", stufe: 9, merkmale: ["magical", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["religion", 31, 2], ["arcana", 32, 2]],
    beschwoerung: { stufe: 12, runden: 10, ort: "neben" },
    de: {
      name: "Ruf der Schwarzen Glocke", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Tür hängt eine kleine Glocke aus schwarzem Eisen, ihr Klöppel ist mit Draht festgebunden.",
      wirkung: "Der Draht reißt, die Glocke schlägt einmal, und etwas antwortet: Eine Kreatur bis Stufe 12 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Tür geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Klöppel mit Wachs ausgießen", ruecksetzen: "Keines."
    },
    en: {
      name: "Call of the Black Bell", ausloeser: AUS.tuer.en,
      beschreibung: "A small bell of black iron hangs above the door, its clapper tied down with wire.",
      wirkung: "The wire snaps, the bell tolls once, and something answers: a creature of up to level 12 appears in a free square next to the door and rolls initiative at once. It attacks whoever opened the door first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "fill the clapper with wax", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss9-wyvernstachel", art: "schloss", stufe: 9, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 28, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 31, 2]],
    gift: {
      typ: "fortitude", dc: 31, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("8d6", "poison"), Z("enfeebled", 1, "r1")],
        [D("10d6", "poison"), Z("enfeebled", 2, "r1"), Z("slowed", 1)],
        [D("14d6", "poison"), Z("paralyzed", null, "m1"), Z("drained", 3)]
      ]
    },
    de: {
      name: "Wyvernstachel im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Im Schlüsselloch steckt die Spitze eines dunklen, gebogenen Stachels, groß wie ein Daumen.",
      wirkung: "Der Stachel schnellt hervor und bohrt sich in die Hand. Wyverngift.", gift: "Wyverngift",
      entschaerfen: "den Stachel abbrechen, ohne ihn zu berühren", ruecksetzen: "Stachel neu vergiften."
    },
    en: {
      name: "Wyvern Sting in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "The tip of a dark, curved sting as big as a thumb sits in the keyhole.",
      wirkung: "The sting snaps out and drills into the hand. Wyvern venom.", gift: "Wyvern venom",
      entschaerfen: "break off the sting without touching it", ruecksetzen: "Poison the sting again."
    }
  },
  {
    id: "schloss9-beissender-deckel", art: "schloss", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 30, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 28, haerte: 18, tp: 72 },
    entschaerfen: [["thievery", 30, 1]],
    angriff: { bonus: 25, schaden: [D("10d8+22", "slashing"), D("5d6", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Beißender Deckel", ausloeser: AUS.schloss.de,
      beschreibung: "Die Kante des Deckels ist mit einer Leiste beschlagen, darunter blitzt eine Schneide.",
      wirkung: "Der Deckel schlägt mit einer Klinge an der Kante auf die Hand am Schloss: Nahkampf-Angriff +25, 10W8+22 Hieb und 5W6 anhaltende Blutung. Treffer: Die Hand ist tief geschnitten, Unbeholfen 2 und Kraftlos 2 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, die Hand ist halb abgetrennt: Unbeholfen 3 und Kraftlos 2 für 1 Woche.",
      entschaerfen: "den Deckel mit einem Keil offen halten", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Biting Lid", ausloeser: AUS.schloss.en,
      beschreibung: "The edge of the lid is shod with a strip, a cutting edge flashes beneath it.",
      wirkung: "The lid slams down on the hand at the lock with a blade on its edge: melee Strike +25, 10d8+22 slashing and 5d6 persistent bleed. Hit: the hand is cut deep, clumsy 2 and enfeebled 2 for 24 hours.",
      krit: "Critical hit: double damage, the hand is half severed: clumsy 3 and enfeebled 2 for 1 week.",
      entschaerfen: "keep the lid open with a wedge", ruecksetzen: "Rearm by hand."
    },
    trefferZ: [Z("clumsy", 2, "t1"), Z("enfeebled", 2, "t1")], kritZ: [Z("clumsy", 3, "w1"), Z("enfeebled", 2, "w1")]
  },
  {
    id: "schloss9-grabstaub", art: "schloss", stufe: 9, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: "knopf", wirkung: 10, werte: { rk: 26, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 31, 2], ["crafting", 30, 1]],
    gift: {
      typ: "fortitude", dc: 31, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("8d6", "poison"), Z("sickened", 1)],
        [D("10d6", "poison"), Z("sickened", 2), Z("stupefied", 1)],
        [D("14d6", "poison"), Z("sickened", 3), Z("unconscious"), T("bis das Gift endet", "until the poison ends"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Grabstaub-Phiole", ausloeser: AUS.schloss.de,
      beschreibung: "Aus den Fugen des Schlossblechs rieselt feiner grauer Staub, wenn man daran rüttelt.",
      wirkung: "Eine Phiole zerbricht, grauer Staub wirbelt aus allen Fugen und füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Grabstaub.", gift: "Grabstaub",
      entschaerfen: "die Phiole durch das Schlüsselloch sichern", ruecksetzen: "Neue Phiole einsetzen."
    },
    en: {
      name: "Grave Dust Vial", ausloeser: AUS.schloss.en,
      beschreibung: "Fine grey dust trickles from the joints of the lock plate when it is shaken.",
      wirkung: "A vial shatters, grey dust swirls from every joint and fills the area for 1 minute. A creature starting its turn inside rolls again. Grave dust.", gift: "Grave dust",
      entschaerfen: "secure the vial through the keyhole", ruecksetzen: "Insert a new vial."
    }
  },
  {
    id: "schloss9-steinhand", art: "schloss", stufe: 9, merkmale: ["magical", "earth", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 31, 2], ["occultism", 32, 2]],
    wurf: {
      typ: "fortitude", dc: 31, grade: {
        ke: [], e: [D("6d10+12", "bludgeoning"), Z("clumsy", 1, "m1")],
        f: [D("11d10+24", "bludgeoning"), T("die Hand versteinert:", "the hand turns to stone:"), Z("clumsy", 2, "w1"), Z("slowed", 1, "t1")],
        kf: [D("22d10+48", "bludgeoning"), T("der Stein kriecht den Arm hinauf bis ins Herz:", "the stone creeps up the arm into the heart:"), Z("petrified", null, "w1")]
      }
    },
    de: {
      name: "Steinerne Hand am Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schloss wird von einer steinernen Hand gehalten, deren Finger um den Bügel gekrümmt sind.",
      wirkung: "Die Hand packt zu, zerquetscht die Finger am Schloss, und der Stein kriecht in das Fleisch.",
      entschaerfen: "die Finger mit einem Bann lösen, bevor sie zugreifen", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Stone Hand on the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "The lock is held by a stone hand whose fingers are curled around the shackle.",
      wirkung: "The hand grips, crushes the fingers at the lock, and the stone creeps into the flesh.",
      entschaerfen: "loosen the fingers with a dispel before they grip", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "schloss9-albtraum", art: "schloss", stufe: 9, merkmale: ["magical", "mental", "fear", "curse", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["occultism", 31, 2], ["religion", 32, 2]],
    wurf: {
      typ: "will", dc: 31, grade: {
        ke: [], e: [D("8d8+6", "mental"), Z("frightened", 1)],
        f: [D("16d8+12", "mental"), Z("frightened", 2), T("Albträume in jeder Nacht:", "nightmares every night:"), Z("stupefied", 1, "w1")],
        kf: [D("32d8+24", "mental"), Z("frightened", 3), T("die Albträume bleiben auch am Tag:", "the nightmares stay by day too:"), Z("stupefied", 3, "w1"), Z("doomed", 1, "w1"), T("und die schlaflosen Augen", "and the sleepless eyes")]
      }
    },
    aussehen: { de: ["Schlaflose Augen", "Tiefe, dunkle Ringe unter den Augen, der Blick zuckt bei jedem Geräusch."], en: ["Sleepless Eyes", "Deep, dark rings beneath the eyes, the gaze flinches at every sound."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Albtraumsiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel aus violettem Wachs, wer es länger ansieht, meint darin Gesichter zu sehen.",
      wirkung: "Das Siegel bricht, und Albträume fallen über alle in der Nähe her.",
      entschaerfen: "das Siegel im Schlaf lösen, mit einem Zauber, der Träume lenkt", ruecksetzen: "Lädt sich in der nächsten Nacht neu."
    },
    en: {
      name: "Nightmare Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A seal of violet wax, whoever looks at it for long believes they see faces in it.",
      wirkung: "The seal breaks, and nightmares fall upon everyone nearby.",
      entschaerfen: "unravel the seal in sleep, with a spell that steers dreams", ruecksetzen: "Recharges the next night."
    }
  },
  {
    id: "schloss9-splitterspiegel", art: "schloss", stufe: 9, merkmale: ["magical", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 31, 2], ["thievery", 32, 2]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("6d10+12", "slashing")],
        f: [D("11d10+24", "slashing"), D("4d6", "bleed", "persistent"), T("Splitter in den Augen:", "splinters in the eyes:"), Z("dazzled", null, "w1")],
        kf: [D("22d10+48", "slashing"), D("6d6", "bleed", "persistent"), T("die Splitter treffen die Augen:", "the splinters strike the eyes:"), Z("blinded", null, "w1"), Z("clumsy", 1, "w1"), T("und die Spiegelnarben", "and the mirror scars")]
      }
    },
    aussehen: { de: ["Spiegelnarben", "Hunderte feiner Schnitte glänzen silbrig auf der Haut, als wäre Spiegelglas hineingewachsen."], en: ["Mirror Scars", "Hundreds of fine cuts gleam silvery on the skin, as if mirror glass had grown into it."], toenung: "#c0c8d0", dauer: { value: 30, unit: "days" } },
    de: {
      name: "Splitternder Spiegel", ausloeser: AUS.schloss.de,
      beschreibung: "In den Deckel ist ein kleiner Spiegel eingelassen, der das eigene Gesicht ein wenig zu spät zeigt.",
      wirkung: "Der Spiegel zerspringt in tausend Splitter, die in alle in der Nähe fahren.",
      entschaerfen: "den Spiegel verhängen und den Zauber lösen", ruecksetzen: "Setzt sich nach 1 Tag wieder zusammen."
    },
    en: {
      name: "Shattering Mirror", ausloeser: AUS.schloss.en,
      beschreibung: "A small mirror is set into the lid, showing one's own face a little too late.",
      wirkung: "The mirror bursts into a thousand splinters that drive into everyone nearby.",
      entschaerfen: "cover the mirror and unravel the spell", ruecksetzen: "Reassembles itself after 1 day."
    }
  },
  {
    id: "schloss9-blutpakt", art: "schloss", stufe: 9, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["religion", 31, 2], ["occultism", 32, 2]],
    wurf: {
      typ: "fortitude", dc: 31, grade: {
        ke: [], e: [D("8d8+6", "void"), Z("drained", 1)],
        f: [D("16d8+12", "void"), Z("drained", 2), T("das Blut wird schwer:", "the blood grows heavy:"), Z("enfeebled", 2, "t1")],
        kf: [D("32d8+24", "void"), Z("drained", 4), T("das Siegel trinkt sich satt:", "the seal drinks its fill:"), Z("enfeebled", 2, "w1"), Z("doomed", 1, "w1")]
      }
    },
    de: {
      name: "Siegel des Blutpakts", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel aus dunklem Eisen mit einer Nadel in der Mitte, daneben die Worte eines Pakts.",
      wirkung: "Die Nadel sticht, und das Siegel nimmt sich, was der Pakt verlangt.",
      entschaerfen: "die Worte des Pakts durchstreichen und das Siegel mit Salz bedecken", ruecksetzen: "Lädt sich auf, sobald wieder Blut daran kommt."
    },
    en: {
      name: "Seal of the Blood Pact", ausloeser: AUS.schloss.en,
      beschreibung: "A seal of dark iron with a needle at its centre, beside it the words of a pact.",
      wirkung: "The needle pricks, and the seal takes what the pact demands.",
      entschaerfen: "strike out the words of the pact and cover the seal with salt", ruecksetzen: "Recharges as soon as blood touches it again."
    }
  },
  {
    id: "schloss9-urnensiegel", art: "schloss", stufe: 9, merkmale: ["magical", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 32, 2], ["religion", 33, 2]],
    beschwoerung: { stufe: 12, runden: 10, ort: "neben" },
    de: {
      name: "Urnensiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Über dem Schloss ist eine kleine versiegelte Urne aus Ton befestigt, sie ist warm.",
      wirkung: "Das Siegel der Urne springt, und ihr Bewohner tritt heraus: Eine Kreatur bis Stufe 12 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer das Schloss geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Urne mit einem zweiten Siegel verschließen", ruecksetzen: "Keines."
    },
    en: {
      name: "Urn Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A small sealed clay urn is fixed above the lock, it is warm.",
      wirkung: "The urn's seal bursts, and its occupant steps out: a creature of up to level 12 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever opened the lock first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "close the urn with a second seal", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende9-bogenfalle", art: "gelaende", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 28, haerte: 12, tp: 52 },
    entschaerfen: [["thievery", 31, 2], ["survival", 31, 1]],
    angriff: { bonus: 25, schaden: [D("10d10+20", "piercing"), D("5d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Bogenfalle am Wildwechsel", ausloeser: AUS.betreten.de,
      beschreibung: "Ein schmaler Wildwechsel, an den Stämmen daneben sind Bögen festgebunden und mit Laub verdeckt.",
      wirkung: "Ein Draht löst die Bögen: je ein Fernkampf-Angriff +25 gegen jede Kreatur im Wirkungsbereich, 10W10+20 Stich und 5W6 anhaltende Blutung. Treffer: Der Pfeil steckt im Oberschenkel, Kraftlos 1 und Verlangsamt 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Pfeil zertrümmert das Knie: Verlangsamt 1 und Kraftlos 2 für 1 Woche.",
      entschaerfen: "den Draht entlasten und die Sehnen kappen", ruecksetzen: "Bögen neu spannen (10 Minuten)."
    },
    en: {
      name: "Bow Trap on the Game Trail", ausloeser: AUS.betreten.en,
      beschreibung: "A narrow game trail, bows are tied to the trunks beside it and hidden with leaves.",
      wirkung: "A wire releases the bows: one ranged Strike +25 against each creature in the area, 10d10+20 piercing and 5d6 persistent bleed. Hit: the arrow lodges in the thigh, enfeebled 1 and slowed 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the arrow shatters the knee: slowed 1 and enfeebled 2 for 1 week.",
      entschaerfen: "take the load off the wire and cut the strings", ruecksetzen: "Restring the bows (10 minutes)."
    },
    trefferZ: [Z("enfeebled", 1, "t1"), Z("slowed", 1, "t1")], kritZ: [Z("prone"), Z("slowed", 1, "w1"), Z("enfeebled", 2, "w1")]
  },
  {
    id: "gelaende9-haengebruecke", art: "gelaende", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 30, rang: 1, ausloeser: 0, wirkung: 20, werte: null,
    entschaerfen: [["thievery", 30, 1], ["survival", 31, 1]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [seil], e: [seil],
        f: [T("stürzt 80 Fuß in die Schlucht", "falls 80 feet into the gorge"), D("40", "bludgeoning"), D("5d10+10", "bludgeoning"), Z("prone"), T("geprellt und verstaucht:", "bruised and sprained:"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [T("stürzt und schlägt auf die Felsen", "falls and strikes the rocks"), D("40", "bludgeoning"), D("12d10+50", "bludgeoning"), Z("prone"), T("Knochen gebrochen:", "bones broken:"), Z("slowed", 1, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Morsche Hängebrücke", ausloeser: AUS.feld.de,
      beschreibung: "Eine Hängebrücke über eine tiefe Schlucht, eines der Tragseile ist frisch angeschnitten.",
      wirkung: "Das Seil reißt, die Brücke kippt, und alle darauf stürzen. Herausklettern Athletik SG 31.",
      entschaerfen: "das angeschnittene Seil finden und mit einem zweiten sichern", ruecksetzen: "Keines."
    },
    en: {
      name: "Rotten Rope Bridge", ausloeser: AUS.feld.en,
      beschreibung: "A rope bridge across a deep gorge, one of the main ropes freshly cut into.",
      wirkung: "The rope snaps, the bridge tips, and everyone on it falls. Climbing out takes Athletics DC 31.",
      entschaerfen: "find the cut rope and secure it with a second one", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende9-steinschleudern", art: "gelaende", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 26, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 31, 2], ["crafting", 31, 2]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("6d10+12", "bludgeoning"), Z("prone")],
        f: [D("11d10+24", "bludgeoning"), Z("prone"), T("getroffen und benommen:", "struck and dazed:"), Z("enfeebled", 2, "t1"), Z("stupefied", 1, "t1")],
        kf: [D("22d10+48", "bludgeoning"), Z("prone"), T("Schädel und Schulter zerschmettert:", "skull and shoulder shattered:"), Z("stupefied", 2, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Verborgene Steinschleudern", ausloeser: AUS.betreten.de,
      beschreibung: "Auf den Felsen über dem Pass stehen Gerüste unter Tarnnetzen, daneben aufgeschichtete Steine.",
      wirkung: "Die Schleudern lösen aus, und Steine prasseln auf den Pass.",
      entschaerfen: "die Auslöseleine kappen", ruecksetzen: "Schleudern neu laden (10 Minuten)."
    },
    en: {
      name: "Hidden Catapults", ausloeser: AUS.betreten.en,
      beschreibung: "Frames stand under camouflage nets on the rocks above the pass, stones piled beside them.",
      wirkung: "The catapults release, and stones rain down on the pass.",
      entschaerfen: "cut the trigger line", ruecksetzen: "Reload the catapults (10 minutes)."
    }
  },
  {
    id: "gelaende9-lawine", art: "gelaende", stufe: 9, merkmale: ["environmental", "cold"],
    heimlichkeit: 30, rang: 1, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["survival", 30, 1], ["nature", 31, 1]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("4d10+6", "bludgeoning"), D("3d10", "cold")],
        f: [D("8d10+12", "bludgeoning"), D("6d10", "cold"), Z("prone"), T("unterkühlt:", "chilled:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("16d10+24", "bludgeoning"), D("12d10", "cold"), T("verschüttet", "buried"), Z("immobilized"), T("bis Athletik SG 31, 2W10 Kälte zu Beginn jedes ihrer Züge, danach Erfrierungen:", "until Athletics DC 31, 2d10 cold at the start of each of its turns, then frostbite:"), Z("clumsy", 2, "w1"), Z("sickened", 1, "w1")]
      }
    },
    de: {
      name: "Schneebrett am Hang", ausloeser: AUS.feld.de,
      beschreibung: "Ein steiler, verschneiter Hang, über dem Pfad wölbt sich eine schwere Wechte.",
      wirkung: "Der Schnee bricht los und begräbt den Pfad unter sich. Der Wirkungsbereich wird schwieriges Gelände.",
      entschaerfen: "die Wechte von oben gezielt abtreten, solange niemand darunter ist", ruecksetzen: "Baut sich im nächsten Schneefall neu auf."
    },
    en: {
      name: "Snow Slab on the Slope", ausloeser: AUS.feld.en,
      beschreibung: "A steep, snowy slope, a heavy cornice bulging above the path.",
      wirkung: "The snow breaks loose and buries the path beneath it. The area becomes difficult terrain.",
      entschaerfen: "kick off the cornice from above while nobody is beneath", ruecksetzen: "Builds up again in the next snowfall."
    }
  },
  {
    id: "gelaende9-schwefelquellen", art: "gelaende", stufe: 9, merkmale: ["environmental", "poison", "inhaled"],
    heimlichkeit: 30, rang: 1, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["nature", 30, 1], ["survival", 31, 1]],
    gift: {
      typ: "fortitude", dc: 31, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("8d6", "poison"), Z("sickened", 1)],
        [D("10d6", "poison"), Z("sickened", 2), Z("slowed", 1)],
        [D("14d6", "poison"), Z("sickened", 3), Z("blinded", null, "m1"), Z("drained", 3)]
      ]
    },
    de: {
      name: "Schwefelquellen", ausloeser: AUS.betreten.de,
      beschreibung: "Gelbe Krusten um dampfende Tümpel, kein Vogel singt, und es riecht nach faulen Eiern.",
      wirkung: "Wer die Kruste durchtritt, löst einen Schwall giftiger Dämpfe; sie hängen 1 Minute über den Quellen. Wer eine Runde darin beginnt, würfelt erneut. Schwefeldampf.", gift: "Schwefeldampf",
      entschaerfen: "einen Weg über die festen Krusten finden und markieren", ruecksetzen: "Sammelt sich in 1 Stunde neu."
    },
    en: {
      name: "Sulphur Springs", ausloeser: AUS.betreten.en,
      beschreibung: "Yellow crusts around steaming pools, no bird sings, and it smells of rotten eggs.",
      wirkung: "Stepping through the crust releases a gush of poisonous fumes; they hang over the springs for 1 minute. A creature starting its turn inside rolls again. Sulphur fumes.", gift: "Sulphur fumes",
      entschaerfen: "find and mark a way across the solid crusts", ruecksetzen: "Gathers again in 1 hour."
    }
  },
  {
    id: "gelaende9-steinkreis", art: "gelaende", stufe: 9, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["arcana", 31, 2], ["nature", 32, 2]],
    wurf: {
      typ: "fortitude", dc: 31, grade: {
        ke: [], e: [D("8d10", "force"), Z("slowed", 1, "r1")],
        f: [D("16d10", "force"), Z("stunned", 1), T("die Glieder werden schwer:", "the limbs grow heavy:"), Z("slowed", 1, "t1"), Z("enfeebled", 1, "w1")],
        kf: [D("32d10", "force"), Z("stunned", 3), Z("drained", 3), T("der Kreis nimmt die Jahre:", "the circle takes the years:"), Z("enfeebled", 2, "w1"), Z("clumsy", 2, "w1"), T("und die Runen auf der Haut", "and the runes on the skin")]
      }
    },
    aussehen: { de: ["Runen auf der Haut", "Blasse blaue Runen wie auf den alten Steinen ziehen sich über Arme und Nacken."], en: ["Runes on the Skin", "Pale blue runes like those on the old stones run across arms and neck."], toenung: "#7090c0", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Steinkreis der Alten", ausloeser: AUS.feld.de,
      beschreibung: "Ein Kreis aus mannshohen Steinen auf einem Hügel, ihre Runen glimmen in der Dämmerung.",
      wirkung: "Die Steine erwachen, und ihre Kraft drückt alle im Kreis zu Boden.",
      entschaerfen: "einen der Steine mit Blut und Rune versöhnen", ruecksetzen: "Erwacht in der nächsten Dämmerung neu."
    },
    en: {
      name: "Circle of the Old Stones", ausloeser: AUS.feld.en,
      beschreibung: "A circle of man-high stones on a hill, their runes glowing at dusk.",
      wirkung: "The stones awaken, and their power crushes everyone in the circle to the ground.",
      entschaerfen: "appease one of the stones with blood and rune", ruecksetzen: "Awakens again at the next dusk."
    }
  },
  {
    id: "gelaende9-blitzeiche", art: "gelaende", stufe: 9, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["nature", 31, 2], ["arcana", 32, 2]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("8d10", "electricity")],
        f: [D("16d10", "electricity"), Z("stunned", 1), T("verbrannte Nerven:", "burnt nerves:"), Z("clumsy", 2, "t1")],
        kf: [D("32d10", "electricity"), Z("stunned", 3), T("das Herz stolpert:", "the heart stumbles:"), Z("doomed", 1, "w1"), Z("clumsy", 2, "w1"), T("und die Blitzfiguren", "and the lightning figures")]
      }
    },
    aussehen: { de: ["Blitzfiguren", "Rote, farnartig verzweigte Muster ziehen sich über die Haut, wo der Blitz durchging."], en: ["Lightning Figures", "Red, fern-like branching patterns run across the skin where the lightning passed."], toenung: "#d08080", dauer: { value: 30, unit: "days" } },
    de: {
      name: "Blitzeiche", ausloeser: AUS.betreten.de,
      beschreibung: "Eine alte Eiche, vom Blitz gespalten, in ihrer Rinde glänzen eingeschlagene Kupfernägel.",
      wirkung: "Ein Blitz fährt aus heiterem Himmel in die Eiche und springt auf alle in der Nähe über.",
      entschaerfen: "die Kupfernägel ziehen, ohne den Stamm zu berühren", ruecksetzen: "Lädt sich im nächsten Gewitter neu."
    },
    en: {
      name: "Lightning Oak", ausloeser: AUS.betreten.en,
      beschreibung: "An old oak split by lightning, copper nails driven into its bark gleam.",
      wirkung: "A bolt from a clear sky strikes the oak and leaps to everyone nearby.",
      entschaerfen: "pull the copper nails without touching the trunk", ruecksetzen: "Recharges in the next thunderstorm."
    }
  },
  {
    id: "gelaende9-schwarzer-tuempel", art: "gelaende", stufe: 9, merkmale: ["magical", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 32, 2], ["nature", 32, 2]],
    beschwoerung: { stufe: 12, runden: null, ort: "falle" },
    de: {
      name: "Schwarzer Tümpel", ausloeser: AUS.betreten.de,
      beschreibung: "Ein runder Tümpel mit schwarzem, glattem Wasser, in dem sich nichts spiegelt.",
      wirkung: "Das Wasser beginnt zu kochen, und etwas steigt herauf: Eine Kreatur bis Stufe 12 erhebt sich am Ufer und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "Salz und geweihtes Wasser in den Tümpel geben", ruecksetzen: "Keines."
    },
    en: {
      name: "Black Pool", ausloeser: AUS.betreten.en,
      beschreibung: "A round pool of black, smooth water in which nothing is reflected.",
      wirkung: "The water begins to boil, and something rises: a creature of up to level 12 emerges at the bank and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "pour salt and holy water into the pool", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum9-speerboden", art: "raum", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 28, haerte: 16, tp: 64 },
    entschaerfen: [["thievery", 31, 2]],
    angriff: { bonus: 25, schaden: [D("10d10+20", "piercing"), D("5d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Speerboden", ausloeser: AUS.platte.de,
      beschreibung: "Der Boden besteht aus Bohlen mit fingerbreiten Fugen, in denen es metallisch schimmert.",
      wirkung: "Speere schießen aus den Fugen: je ein Nahkampf-Angriff +25 gegen jede Kreatur im Wirkungsbereich, 10W10+20 Stich und 5W6 anhaltende Blutung. Treffer: Der Speer durchbohrt den Fuß, Verlangsamt 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Speer fährt durch Fuß und Knie: Verlangsamt 1 und Unbeholfen 1 für 1 Woche.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Zieht sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Spear Floor", ausloeser: AUS.platte.en,
      beschreibung: "The floor consists of planks with finger-wide gaps in which something gleams like metal.",
      wirkung: "Spears shoot out of the gaps: one melee Strike +25 against each creature in the area, 10d10+20 piercing and 5d6 persistent bleed. Hit: the spear pierces the foot, slowed 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the spear drives through foot and knee: slowed 1 and clumsy 1 for 1 week.",
      entschaerfen: "wedge the plate", ruecksetzen: "Withdraws by itself after 1 minute."
    },
    trefferZ: [Z("slowed", 1, "t1")], kritZ: [Z("prone"), Z("slowed", 1, "w1"), Z("clumsy", 1, "w1")]
  },
  {
    id: "raum9-sandflut", art: "raum", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 26, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 31, 2], ["crafting", 30, 1]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("6d10+12", "bludgeoning")],
        f: [D("11d10+24", "bludgeoning"), Z("immobilized"), T("bis zur Brust im Sand bis Athletik SG 31, Sand in der Lunge:", "buried to the chest until Athletics DC 31, sand in the lungs:"), Z("sickened", 1, "t1")],
        kf: [D("22d10+48", "bludgeoning"), Z("immobilized"), T("ganz verschüttet bis Athletik SG 31, 2W10 Wucht zu Beginn jedes ihrer Züge, danach rasselt die Lunge:", "buried entirely until Athletics DC 31, 2d10 bludgeoning at the start of each of its turns, then the lungs rattle:"), Z("sickened", 2, "w1"), Z("enfeebled", 1, "w1")]
      }
    },
    de: {
      name: "Sandflut-Kammer", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Kammer mit trichterförmiger Decke, auf dem Boden knirscht feiner Sand.",
      wirkung: "Die Türen schlagen zu, und aus der Decke stürzt eine Flut aus Sand in die Kammer.",
      entschaerfen: "den Trichter in der Decke verschließen", ruecksetzen: "Sand neu einfüllen (1 Stunde)."
    },
    en: {
      name: "Sand Flood Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "A chamber with a funnel-shaped ceiling, fine sand crunches on the floor.",
      wirkung: "The doors slam shut, and a flood of sand pours from the ceiling into the chamber.",
      entschaerfen: "close the funnel in the ceiling", ruecksetzen: "Refill the sand (1 hour)."
    }
  },
  {
    id: "raum9-arsengeblaese", art: "raum", stufe: 9, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 26, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 31, 2], ["crafting", 30, 1]],
    gift: {
      typ: "fortitude", dc: 31, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("8d6", "poison"), Z("sickened", 1)],
        [D("10d6", "poison"), Z("sickened", 2), Z("enfeebled", 1)],
        [D("14d6", "poison"), Z("sickened", 3), Z("enfeebled", 2), Z("drained", 3)]
      ]
    },
    de: {
      name: "Arsengebläse", ausloeser: AUS.betreten.de,
      beschreibung: "In den Ecken der Kammer stehen Blasebälge aus Leder, ihr Boden ist weiß bestäubt.",
      wirkung: "Die Blasebälge treiben weißen Staub in den Raum, er hängt 1 Minute in der Luft, die Türen fallen zu (Diebeskunst SG 31 oder Athletik SG 33 zum Aufbrechen). Wer eine Runde darin beginnt, würfelt erneut. Arsenstaub.", gift: "Arsenstaub",
      entschaerfen: "die Blasebälge durchstechen", ruecksetzen: "Staub neu einfüllen."
    },
    en: {
      name: "Arsenic Bellows", ausloeser: AUS.betreten.en,
      beschreibung: "Leather bellows stand in the corners of the chamber, the floor is dusted white.",
      wirkung: "The bellows drive white dust into the room, it hangs in the air for 1 minute, the doors slam shut (Thievery DC 31 or Athletics DC 33 to force them). A creature starting its turn inside rolls again. Arsenic dust.", gift: "Arsenic dust",
      entschaerfen: "pierce the bellows", ruecksetzen: "Refill the dust."
    }
  },
  {
    id: "raum9-klingenwalzen", art: "raum", stufe: 9, merkmale: ["mechanical", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 5, wirkung: 10, werte: { rk: 28, haerte: 18, tp: 72 },
    entschaerfen: [["thievery", 31, 2], ["crafting", 31, 2]],
    wurf: {
      typ: "reflex", dc: 31, grade: {
        ke: [], e: [D("6d10+12", "slashing")],
        f: [D("11d10+24", "slashing"), D("5d6", "bleed", "persistent"), T("zerschnitten:", "cut up:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("22d10+48", "slashing"), D("6d6", "bleed", "persistent"), Z("prone"), T("Muskeln und Sehnen zerfetzt:", "muscles and tendons shredded:"), Z("clumsy", 2, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Klingenwalzen im Gang", ausloeser: AUS.betreten.de,
      beschreibung: "Ein langer Gang, an beiden Wänden laufen Walzen in Schlitzen, auf denen Rostspuren kleben.",
      wirkung: "Mit Klingen besetzte Walzen rollen aus den Wänden durch den Gang.",
      entschaerfen: "die Walzen in ihren Schlitzen verkeilen", ruecksetzen: "Rollt nach 1 Minute selbst zurück."
    },
    en: {
      name: "Blade Rollers in the Corridor", ausloeser: AUS.betreten.en,
      beschreibung: "A long corridor, rollers run in slots along both walls, traces of rust sticking to them.",
      wirkung: "Rollers studded with blades roll out of the walls through the corridor.",
      entschaerfen: "wedge the rollers in their slots", ruecksetzen: "Rolls back by itself after 1 minute."
    }
  },
  {
    id: "raum9-seelenkerzen", art: "raum", stufe: 9, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["religion", 31, 2], ["occultism", 32, 2]],
    wurf: {
      typ: "will", dc: 31, grade: {
        ke: [], e: [D("8d8+6", "void"), Z("drained", 1)],
        f: [D("16d8+12", "void"), Z("drained", 2), T("die Seele flackert:", "the soul flickers:"), Z("doomed", 1, "t1"), Z("stupefied", 1, "t1")],
        kf: [D("32d8+24", "void"), Z("drained", 3), T("die Kerze brennt die halbe Seele:", "the candle burns half the soul:"), Z("doomed", 2, "w1"), Z("stupefied", 2, "w1"), T("und die wachsbleiche Haut", "and the wax-pale skin")]
      }
    },
    aussehen: { de: ["Wachsbleiche Haut", "Die Haut ist bleich und glatt wie Kerzenwachs und riecht nach erloschenem Docht."], en: ["Wax-Pale Skin", "The skin is pale and smooth like candle wax and smells of a snuffed wick."], toenung: "#e8e0c8", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Kammer der Seelenkerzen", ausloeser: AUS.betreten.de,
      beschreibung: "Hunderte Kerzen auf Regalen, die meisten erloschen, einige brennen mit blauer Flamme.",
      wirkung: "Die blauen Flammen lodern auf und ziehen jedem im Wirkungsbereich ein Stück Seele aus dem Leib.",
      entschaerfen: "die blauen Kerzen mit den Fingern löschen, eine nach der anderen", ruecksetzen: "Entzündet sich nach 1 Stunde neu."
    },
    en: {
      name: "Chamber of Soul Candles", ausloeser: AUS.betreten.en,
      beschreibung: "Hundreds of candles on shelves, most of them out, a few burning with a blue flame.",
      wirkung: "The blue flames flare up and draw a piece of soul from the body of everyone in the area.",
      entschaerfen: "snuff the blue candles with the fingers, one after another", ruecksetzen: "Rekindles after 1 hour."
    }
  },
  {
    id: "raum9-verdrehte-wege", art: "raum", stufe: 9, merkmale: ["magical", "mental", "visual", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 32, 2], ["arcana", 32, 2]],
    wurf: {
      typ: "will", dc: 31, grade: {
        ke: [], e: [D("8d8+6", "mental"), Z("stupefied", 1, "m1")],
        f: [D("16d8+12", "mental"), Z("confused", null, "m1"), T("die Orientierung bleibt verloren:", "the sense of direction stays lost:"), Z("stupefied", 2, "t1")],
        kf: [D("32d8+24", "mental"), T("weiß nicht mehr, wo oben und unten ist:", "no longer knows up from down:"), Z("confused", null, "t1"), Z("clumsy", 2, "w1"), Z("stupefied", 2, "w1")]
      }
    },
    de: {
      name: "Kammer der verdrehten Wege", ausloeser: "Eine Kreatur betritt den Raum und sieht auf das Muster am Boden.",
      beschreibung: "Boden, Wände und Decke tragen dasselbe verschlungene Muster, Türen scheinen an der Decke zu liegen.",
      wirkung: "Das Muster dreht sich, und mit ihm der Verstand aller im Raum.",
      entschaerfen: "mit geschlossenen Augen die Rune im Mittelpunkt des Musters bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Chamber of Twisted Ways", ausloeser: "A creature enters the room and looks at the pattern on the floor.",
      beschreibung: "Floor, walls and ceiling bear the same winding pattern, doors seem to lie on the ceiling.",
      wirkung: "The pattern turns, and with it the minds of everyone in the room.",
      entschaerfen: "dispel the rune at the centre of the pattern with eyes closed", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum9-gefrorene-gruft", art: "raum", stufe: 9, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 31, 2], ["religion", 32, 2]],
    wurf: {
      typ: "fortitude", dc: 31, grade: {
        ke: [], e: [D("8d10", "cold"), Z("slowed", 1, "r1")],
        f: [D("16d10", "cold"), Z("slowed", 1, "m1"), T("die Kälte bleibt im Leib:", "the cold stays in the body:"), Z("enfeebled", 1, "w1")],
        kf: [D("32d10", "cold"), T("friert zu einem Block aus Eis:", "freezes into a block of ice:"), Z("paralyzed", null, "t1"), Z("enfeebled", 2, "w1"), T("und der Raureif im Haar", "and the hoarfrost in the hair")]
      }
    },
    aussehen: { de: ["Raureif im Haar", "Haar, Brauen und Wimpern sind weiß bereift, und der Atem dampft auch in warmen Räumen."], en: ["Hoarfrost in the Hair", "Hair, brows and lashes are rimed white, and the breath steams even in warm rooms."], toenung: "#d0e8ff", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Gefrorene Gruft", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Gruft, deren Wände mit dickem Eis überzogen sind, darin eingeschlossen die Umrisse von Menschen.",
      wirkung: "Eisiger Hauch fegt durch die Gruft und lässt alle im Wirkungsbereich gefrieren.",
      entschaerfen: "das Herz der Gruft, einen blauen Kristall, mit Feuer zum Schmelzen bringen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Frozen Crypt", ausloeser: AUS.betreten.en,
      beschreibung: "A crypt whose walls are coated with thick ice, the outlines of people locked within.",
      wirkung: "An icy breath sweeps through the crypt and freezes everyone in the area.",
      entschaerfen: "melt the heart of the crypt, a blue crystal, with fire", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum9-totenthron", art: "raum", stufe: 9, merkmale: ["magical", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 32, 2], ["occultism", 32, 2]],
    beschwoerung: { stufe: 12, runden: null, ort: "falle" },
    de: {
      name: "Thron des toten Königs", ausloeser: AUS.betreten.de,
      beschreibung: "Auf einem Thron am Ende der Halle sitzt eine Gestalt in Rüstung, die Krone schief auf dem Schädel.",
      wirkung: "Der König hebt den Kopf: Eine Kreatur bis Stufe 12 erhebt sich vom Thron und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "dem König die Krone abnehmen, bevor er erwacht", ruecksetzen: "Keines."
    },
    en: {
      name: "Throne of the Dead King", ausloeser: AUS.betreten.en,
      beschreibung: "On a throne at the end of the hall sits an armoured figure, the crown askew on its skull.",
      wirkung: "The king raises his head: a creature of up to level 12 rises from the throne and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "take the crown from the king before he wakes", ruecksetzen: "None."
    }
  }
];
