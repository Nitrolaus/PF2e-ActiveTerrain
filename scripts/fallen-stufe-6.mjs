// Eigene Fallen Stufe 6 (0.5.0, 06.11.2026: "jetzt Fallen für Stufe 6 bauen"). Maßstab wie Stufe 5, eine Stufe
// härter (Wunsch: "die nächsten Fallen für das nächste Level noch tödlicher und debuffender", "Fallen in PF2e sollen brutal
// sein"): Ein Fehlschlag wirft eine Figur der Stufe 6 um (im Schnitt rund 50 Schaden), ein kritischer Fehlschlag jede.
// Rettungswurf SG 25, Angriff +19, Heimlichkeit 24 bis 27, Entschärfen 24 bis 27, Mindestgrad höchstens Experte.
// Herbeigerufene Gegner bis Stufe 9 (Stufe 5 rief bis Stufe 8, also drei Stufen über der Falle).
// Lange Zustände (Wunsch: "arbeite mehr mit Zuständen, die länger andauern, blind für 28 Stunden oder versteinert"):
// Dauer t1 (24 Stunden) und w1 (1 Woche); das Modul setzt sie als PF2e-Effekt, der von selbst abläuft.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante", "grabs the edge");

export const STUFE_6 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer6-giftarmbrust", art: "tuer", stufe: 6, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 0, wirkung: 0, werte: { rk: 24, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 25, 2]],
    angriff: { bonus: 19, schaden: [D("7d10+14", "piercing"), D("3d6", "poison", "persistent")], hoechstens: 1 },
    de: {
      name: "Giftarmbrust im Türrahmen", ausloeser: AUS.tuer.de,
      beschreibung: "Eine schwere Armbrust steckt im Rahmen, ihr Bolzen glänzt feucht, ein Faden läuft zum Türblatt.",
      wirkung: "Die Falle schießt einen vergifteten Bolzen auf die öffnende Kreatur: Fernkampf-Treffer (ohne Angriffswurf), 7W10+14 Stich und 3W6 anhaltendes Gift. Treffer: Kränkelnd 1.",
      krit: "Kritischer Treffer: doppelter Schaden, Kränkelnd 2, und das Gift lähmt die Muskeln: Kraftlos 2 für 24 Stunden.",
      entschaerfen: "den Faden durchtrennen, ohne ihn zu lösen", ruecksetzen: "Von Hand neu spannen und den Bolzen neu vergiften."
    },
    en: {
      name: "Poisoned Crossbow in the Door Frame", ausloeser: AUS.tuer.en,
      beschreibung: "A heavy crossbow hides in the frame, its bolt gleaming wet, a thread runs to the door leaf.",
      wirkung: "The trap fires a poisoned bolt at the creature opening the door: ranged hit (no attack roll), 7d10+14 piercing and 3d6 persistent poison. Hit: sickened 1.",
      krit: "Critical hit: double damage, sickened 2, and the poison seizes the muscles: enfeebled 2 for 24 hours.",
      entschaerfen: "cut the thread without releasing it", ruecksetzen: "Rearm by hand and poison a new bolt."
    },
    trefferZ: [Z("sickened", 1)], kritZ: [Z("sickened", 2), Z("enfeebled", 2, "t1")]
  },
  {
    id: "tuer6-schmettertuer", art: "tuer", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 25, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 24, haerte: 14, tp: 60 },
    entschaerfen: [["thievery", 24, 1], ["athletics", 26, 0]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("4d10+7", "bludgeoning")], f: [D("7d10+14", "bludgeoning"), Z("prone"), Z("stunned", 1)],
        kf: [D("14d10+28", "bludgeoning"), Z("prone"), Z("stunned", 2), T("Rippen gebrochen:", "ribs broken:"), Z("clumsy", 2, "t1")]
      }
    },
    de: {
      name: "Schmetternde Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Das Türblatt hängt an schweren Federn, die Angeln sind mit Eisen verstärkt.",
      wirkung: "Die Tür schlägt mit ungeheurer Wucht auf und schleudert alle davor gegen die Wand.",
      entschaerfen: "die Federn aushängen", ruecksetzen: "Spannt sich nach 1 Minute selbst."
    },
    en: {
      name: "Slamming Door", ausloeser: AUS.tuer.en,
      beschreibung: "The door leaf hangs on heavy springs, the hinges are reinforced with iron.",
      wirkung: "The door bursts open with tremendous force and hurls everyone in front of it against the wall.",
      entschaerfen: "unhook the springs", ruecksetzen: "Rewinds itself after 1 minute."
    }
  },
  {
    id: "tuer6-blitzrahmen", art: "tuer", stufe: 6, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 25, 2], ["thievery", 26, 2]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("4d12", "electricity")], f: [D("8d12", "electricity"), D("2d6", "electricity", "persistent"), Z("stunned", 1)],
        kf: [D("16d12", "electricity"), D("3d6", "electricity", "persistent"), Z("stunned", 2), Z("deafened", null, "t1"), T("und das Herz stolpert:", "and the heart stumbles:"), Z("drained", 1)]
      }
    },
    de: {
      name: "Blitzrahmen", ausloeser: AUS.tuer.de,
      beschreibung: "Kupferdraht ist in die Fugen des Rahmens eingelassen, darunter eine Rune.",
      wirkung: "Ein Blitz schlägt aus dem Rahmen in alle davor.",
      entschaerfen: "die Rune bannen oder den Draht erden", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Lightning Frame", ausloeser: AUS.tuer.en,
      beschreibung: "Copper wire is set into the joints of the frame, a rune beneath it.",
      wirkung: "Lightning strikes from the frame into everyone in front of it.",
      entschaerfen: "dispel the rune or ground the wire", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer6-verwesungsfluch", art: "tuer", stufe: 6, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 0, wirkung: 5, werte: null,
    entschaerfen: [["religion", 25, 2], ["occultism", 26, 2]],
    wurf: {
      typ: "fortitude", dc: 25, grade: {
        ke: [], e: [D("6d8", "void")], f: [D("12d8", "void"), Z("drained", 2), Z("enfeebled", 1, "t1")],
        kf: [D("24d8", "void"), Z("drained", 3), Z("doomed", 1, "w1"), T("und die Totenblässe", "and the pallor of death")]
      }
    },
    aussehen: { de: ["Totenblässe", "Wachsbleiche Haut, dunkle Ringe unter den Augen, kalte Hände."], en: ["Pallor of Death", "Waxen skin, dark rings under the eyes, cold hands."], toenung: "#b8b8a8", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Verwesungsfluch", ausloeser: AUS.tuer.de,
      beschreibung: "Unter dem Türknauf ist ein Knochenzeichen eingeritzt, das Holz darum ist schwarz verfärbt.",
      wirkung: "Fäulnis kriecht aus dem Zeichen in jeden, der davor steht.",
      entschaerfen: "das Zeichen weihen oder lösen", ruecksetzen: "Lädt sich bei Sonnenuntergang neu."
    },
    en: {
      name: "Curse of Decay", ausloeser: AUS.tuer.en,
      beschreibung: "A bone sign is carved beneath the door knob, the wood around it stained black.",
      wirkung: "Rot crawls out of the sign into everyone standing in front of it.",
      entschaerfen: "consecrate or unravel the sign", ruecksetzen: "Recharges at sunset."
    }
  },
  {
    id: "tuer6-sonnenglyphe", art: "tuer", stufe: 6, merkmale: ["magical", "fire", "light", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 25, 2], ["religion", 25, 2]],
    wurf: {
      typ: "fortitude", dc: 25, grade: {
        ke: [], e: [D("5d10", "fire"), Z("dazzled", null, "m1")], f: [D("10d10", "fire"), Z("blinded", null, "m1"), T("danach", "then"), Z("dazzled", null, "t1")],
        kf: [D("20d10", "fire"), Z("blinded", null, "t1"), T("und der Sonnenbrand", "and the sunburn")]
      }
    },
    aussehen: { de: ["Sonnenbrand", "Rot verbrannte, sich schälende Haut, die Augen tränen."], en: ["Sunburn", "Red, peeling burnt skin, watering eyes."], toenung: "#e0a070", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Sonnenglyphe", ausloeser: AUS.tuer.de,
      beschreibung: "Ein goldenes Strahlenzeichen über dem Türsturz, kaum vom Zierrat zu unterscheiden.",
      wirkung: "Die Glyphe entlädt grelles Sonnenfeuer.",
      entschaerfen: "die Glyphe abdecken und bannen", ruecksetzen: "Lädt sich bei Sonnenaufgang neu."
    },
    en: {
      name: "Sun Glyph", ausloeser: AUS.tuer.en,
      beschreibung: "A golden sunburst sign above the lintel, hard to tell from the ornaments.",
      wirkung: "The glyph discharges blazing sunfire.",
      entschaerfen: "cover and dispel the glyph", ruecksetzen: "Recharges at sunrise."
    }
  },
  {
    id: "tuer6-kettenblitz", art: "tuer", stufe: 6, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["arcana", 25, 2], ["thievery", 27, 2]],
    angriff: { bonus: 19, schaden: [D("9d6+3d10", "electricity")], hoechstens: 4, magisch: true },
    de: {
      name: "Kettenblitz-Siegel", ausloeser: AUS.tuer.de,
      beschreibung: "Vier Kupfernieten im Türblatt bilden ein Quadrat.",
      wirkung: "Ein Blitz springt von Kreatur zu Kreatur: je ein Zaubertreffer (ohne Angriffswurf) gegen bis zu vier Kreaturen im Wirkungsbereich, die öffnende Kreatur zuerst, 9W6+3W10 Elektrizität. Treffer: Betäubt 1.",
      krit: "Kritischer Treffer: doppelter Schaden, Betäubt 2 und Taub für 24 Stunden.",
      entschaerfen: "die Nieten erden und das Siegel bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Chain Lightning Seal", ausloeser: AUS.tuer.en,
      beschreibung: "Four copper rivets in the door leaf form a square.",
      wirkung: "Lightning leaps from creature to creature: one spell hit (no attack roll) each against up to four creatures in the area, the creature opening the door first, 9d6+3d10 electricity. Hit: stunned 1.",
      krit: "Critical hit: double damage, stunned 2 and deafened for 24 hours.",
      entschaerfen: "ground the rivets and dispel the seal", ruecksetzen: "Recharges after 1 hour."
    },
    trefferZ: [Z("stunned", 1)], kritZ: [Z("stunned", 2), Z("deafened", null, "t1")]
  },
  {
    id: "tuer6-schachtschwelle", art: "tuer", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 25, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 24, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 24, 1], ["crafting", 25, 2]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 40 Fuß tief auf Eisendornen", "falls 40 feet onto iron spikes"), D("20", "bludgeoning"), D("5d8+12", "piercing"), D("2d8", "bleed", "persistent"), Z("prone")],
        kf: [T("stürzt kopfüber und wird aufgespießt", "plunges head first and is impaled"), D("20", "bludgeoning"), D("10d8+24", "piercing"), D("3d8", "bleed", "persistent"), Z("immobilized"), T("bis Entkommen SG 25, ein Bein gebrochen:", "until it Escapes (DC 25), a leg broken:"), Z("slowed", 1, "t1")]
      }
    },
    de: {
      name: "Schachtschwelle", ausloeser: AUS.tuer.de,
      beschreibung: "Die Bodenplatten vor der Tür liegen auf einer Klappe, darunter ein Schacht voller Eisendornen.",
      wirkung: "Öffnet sich die Tür, klappt der Boden davor weg. Herausklettern Athletik SG 25.",
      entschaerfen: "die Klappe verkeilen", ruecksetzen: "Schließt sich nach 1 Minute."
    },
    en: {
      name: "Shaft Threshold", ausloeser: AUS.tuer.en,
      beschreibung: "The floor slabs in front of the door rest on a trapdoor, a shaft full of iron spikes below.",
      wirkung: "When the door opens, the floor in front of it drops away. Climbing out takes Athletics DC 25.",
      entschaerfen: "wedge the trapdoor", ruecksetzen: "Closes after 1 minute."
    }
  },
  {
    id: "tuer6-torwaechter", art: "tuer", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 25, 2], ["religion", 26, 2]],
    beschwoerung: { stufe: 9, runden: 10, ort: "neben" },
    de: {
      name: "Ruf des Torwächters", ausloeser: AUS.tuer.de,
      beschreibung: "Zwei leere Nischen links und rechts der Tür, in jeder ein verblasstes Zeichen.",
      wirkung: "Die Zeichen flammen auf und rufen den Wächter der Tür: Eine Kreatur bis Stufe 9 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Tür geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "beide Zeichen gleichzeitig löschen", ruecksetzen: "Keines."
    },
    en: {
      name: "Call of the Gate Warden", ausloeser: AUS.tuer.en,
      beschreibung: "Two empty niches left and right of the door, a faded sign in each.",
      wirkung: "The signs flare up and call the warden of the door: a creature of up to level 9 appears in a free square next to the door and rolls initiative at once. It attacks whoever opened the door first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "erase both signs at the same time", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss6-schwarznadel", art: "schloss", stufe: 6, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 24, haerte: 6, tp: 24 },
    entschaerfen: [["thievery", 25, 2]],
    gift: {
      typ: "fortitude", dc: 25, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("5d6", "poison"), Z("enfeebled", 1, "r1")],
        [D("7d6", "poison"), Z("enfeebled", 2, "r1"), Z("slowed", 1, "r1")],
        [D("9d6", "poison"), Z("paralyzed", null, "r1"), Z("drained", 1)]
      ]
    },
    de: {
      name: "Schwarze Nadel", ausloeser: AUS.schloss.de,
      beschreibung: "Im Schlüsselloch sitzt eine schwarz angelaufene Nadel.",
      wirkung: "Die Nadel sticht zu. Schwarzgift.", gift: "Schwarzgift",
      entschaerfen: "die Nadel ausbauen, ohne sich zu stechen", ruecksetzen: "Nadel neu vergiften."
    },
    en: {
      name: "Black Needle", ausloeser: AUS.schloss.en,
      beschreibung: "A needle tarnished black sits in the keyhole.",
      wirkung: "The needle pricks. Black venom.", gift: "Black venom",
      entschaerfen: "remove the needle without pricking yourself", ruecksetzen: "Poison the needle again."
    }
  },
  {
    id: "schloss6-hoellensiegel", art: "schloss", stufe: 6, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 25, 2], ["religion", 26, 2]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("6d6", "fire")], f: [D("12d6", "fire"), D("3d6", "fire", "persistent"), Z("clumsy", 1, "t1")],
        kf: [D("24d6", "fire"), D("4d6", "fire", "persistent"), Z("clumsy", 2, "t1"), T("und verkohlte Hände", "and charred hands")]
      }
    },
    aussehen: { de: ["Verkohlte Hände", "Schwarz verkohlte Finger und Handflächen, jeder Griff schmerzt."], en: ["Charred Hands", "Charred black fingers and palms, every grip hurts."], toenung: "#6b4a3a", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Höllensiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein rotes Siegel aus Siegellack, darin glimmt ein Zeichen.",
      wirkung: "Das Siegel bricht und speit Höllenfeuer.",
      entschaerfen: "das Zeichen löschen", ruecksetzen: "Keines."
    },
    en: {
      name: "Hellfire Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A red seal of sealing wax, a sign glowing within.",
      wirkung: "The seal breaks and spews hellfire.",
      entschaerfen: "extinguish the sign", ruecksetzen: "None."
    }
  },
  {
    id: "schloss6-saegeblatt", art: "schloss", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 25, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 24, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 24, 1]],
    angriff: { bonus: 19, schaden: [D("7d8+16", "slashing"), D("3d6", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Sägeblatt im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Hinter dem Schlüsselloch liegen zwei gezahnte Scheiben auf einer Feder.",
      wirkung: "Die Scheiben fahren heraus und zerfetzen die Hand am Schloss: Nahkampf-Treffer (ohne Angriffswurf), 7W8+16 Hieb und 3W6 anhaltende Blutung. Treffer: Die Hand ist zerschnitten, Unbeholfen 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Sehnen durchtrennt: Unbeholfen 2 und Kraftlos 2 für 24 Stunden.",
      entschaerfen: "die Feder durch das Schlüsselloch sperren", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Saw Blade Lock", ausloeser: AUS.schloss.en,
      beschreibung: "Two toothed discs on a spring lie behind the keyhole.",
      wirkung: "The discs shoot out and shred the hand at the lock: melee hit (no attack roll), 7d8+16 slashing and 3d6 persistent bleed. Hit: the hand is cut, clumsy 1 for 24 hours.",
      krit: "Critical hit: double damage, tendons severed: clumsy 2 and enfeebled 2 for 24 hours.",
      entschaerfen: "jam the spring through the keyhole", ruecksetzen: "Rearm by hand."
    },
    trefferZ: [Z("clumsy", 1, "t1")], kritZ: [Z("clumsy", 2, "t1"), Z("enfeebled", 2, "t1")]
  },
  {
    id: "schloss6-basiliskensiegel", art: "schloss", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 26, 2], ["occultism", 26, 2]],
    wurf: {
      typ: "fortitude", dc: 25, grade: {
        ke: [], e: [D("5d8", "bludgeoning"), Z("slowed", 1, "r1")],
        f: [D("10d8+5", "bludgeoning"), T("die Glieder werden steinern:", "the limbs turn to stone:"), Z("slowed", 1, "t1")],
        kf: [D("20d8+10", "bludgeoning"), Z("petrified", null, "t1"), T("und die Steinhaut", "and the stone skin")]
      }
    },
    aussehen: { de: ["Steinhaut", "Graue, steinharte Flecken auf Händen und Gesicht."], en: ["Stone Skin", "Grey, stone-hard patches on hands and face."], toenung: "#9a9a90", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Basiliskensiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Auge aus grauem Stein ist in das Schlossblech gesetzt.",
      wirkung: "Das Auge öffnet sich, und Stein kriecht über die Haut der Kreatur am Schloss.",
      entschaerfen: "das Auge verbinden und das Siegel lösen", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Basilisk Seal", ausloeser: AUS.schloss.en,
      beschreibung: "An eye of grey stone is set into the lock plate.",
      wirkung: "The eye opens, and stone creeps over the skin of the creature at the lock.",
      entschaerfen: "blindfold the eye and unravel the seal", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "schloss6-wahnsiegel", art: "schloss", stufe: 6, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["occultism", 25, 2], ["arcana", 26, 2]],
    wurf: {
      typ: "will", dc: 25, grade: {
        ke: [], e: [D("5d8", "mental"), Z("stupefied", 1, "m1")], f: [D("10d8+5", "mental"), Z("confused", null, "r1"), Z("stupefied", 2, "t1")],
        kf: [D("20d8+10", "mental"), Z("confused", null, "m1"), Z("stupefied", 3, "w1"), T("und der irre Blick", "and the mad stare")]
      }
    },
    aussehen: { de: ["Irrer Blick", "Ein Auge zuckt unaufhörlich, die Pupillen sind ungleich groß."], en: ["Mad Stare", "One eye twitches without end, the pupils are of unequal size."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Wahnsiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Spiralen aus Silberdraht um das Schlüsselloch, die sich beim Hinsehen zu drehen scheinen.",
      wirkung: "Das Siegel bricht in den Geist aller in der Nähe ein.",
      entschaerfen: "die Spirale durchtrennen, ohne hinzusehen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Seal of Madness", ausloeser: AUS.schloss.en,
      beschreibung: "Spirals of silver wire around the keyhole that seem to turn when you look at them.",
      wirkung: "The seal breaks into the minds of everyone nearby.",
      entschaerfen: "cut the spiral without looking at it", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss6-saeurestrahl", art: "schloss", stufe: 6, merkmale: ["mechanical", "acid", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 22, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 25, 2], ["crafting", 24, 1]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("5d6", "acid")], f: [D("10d6", "acid"), D("4d6", "acid", "persistent"), Z("blinded", null, "r1"), T("danach", "then"), Z("dazzled", null, "t1")],
        kf: [D("20d6", "acid"), D("6d6", "acid", "persistent"), T("die Säure trifft die Augen:", "the acid hits the eyes:"), Z("blinded", null, "t1")]
      }
    },
    de: {
      name: "Säurestrahl aus dem Schlüsselloch", ausloeser: AUS.schloss.de,
      beschreibung: "Hinter dem Schlüsselloch sitzt eine Druckblase voller Säure.",
      wirkung: "Ein Säurestrahl schießt der Kreatur am Schloss ins Gesicht.",
      entschaerfen: "die Blase anstechen und ablassen", ruecksetzen: "Blase neu füllen."
    },
    en: {
      name: "Acid Jet from the Keyhole", ausloeser: AUS.schloss.en,
      beschreibung: "A pressure bladder full of acid sits behind the keyhole.",
      wirkung: "A jet of acid shoots into the face of the creature at the lock.",
      entschaerfen: "pierce and drain the bladder", ruecksetzen: "Refill the bladder."
    }
  },
  {
    id: "schloss6-bindungsschloss", art: "schloss", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 26, 2], ["thievery", 27, 2]],
    beschwoerung: { stufe: 9, runden: 10, ort: "neben" },
    de: {
      name: "Bindungsschloss", ausloeser: AUS.schloss.de,
      beschreibung: "Ein schweres Schloss, über und über mit eingeritzten Ketten bedeckt.",
      wirkung: "Das Schloss springt auf und gibt frei, was darin gebunden war: Eine Kreatur bis Stufe 9 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer das Schloss geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Bindung verstärken, bevor sie reißt", ruecksetzen: "Keines."
    },
    en: {
      name: "Binding Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A heavy lock covered all over in carved chains.",
      wirkung: "The lock springs open and releases what was bound inside: a creature of up to level 9 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever opened the lock first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "strengthen the binding before it snaps", ruecksetzen: "None."
    }
  },
  {
    id: "schloss6-kraftfaust", art: "schloss", stufe: 6, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 25, 2], ["thievery", 26, 2]],
    angriff: { bonus: 19, schaden: [D("10d6+3d10", "force")], hoechstens: 1, magisch: true },
    de: {
      name: "Kraftfaust", ausloeser: AUS.schloss.de,
      beschreibung: "Eine kleine Faust aus Messing als Türklopfer oder Deckelzier.",
      wirkung: "Eine Faust aus Kraft schlägt zu: Zaubertreffer (ohne Angriffswurf) gegen die Kreatur am Schloss, 10W6+3W10 Kraft. Treffer: 20 Fuß zurückgeschleudert, Liegend und Betäubt 1.",
      krit: "Kritischer Treffer: doppelter Schaden, 30 Fuß zurückgeschleudert, Liegend, Betäubt 2 und Taub für 24 Stunden.",
      entschaerfen: "die Faust bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Force Fist", ausloeser: AUS.schloss.en,
      beschreibung: "A small brass fist as door knocker or lid ornament.",
      wirkung: "A fist of force strikes: spell hit (no attack roll) against the creature at the lock, 10d6+3d10 force. Hit: hurled back 20 feet, prone and stunned 1.",
      krit: "Critical hit: double damage, hurled back 30 feet, prone, stunned 2 and deafened for 24 hours.",
      entschaerfen: "dispel the fist", ruecksetzen: "Recharges after 1 hour."
    },
    trefferZ: [Z("prone"), Z("stunned", 1)], kritZ: [Z("prone"), Z("stunned", 2), Z("deafened", null, "t1")]
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende6-dornengrube", art: "gelaende", stufe: 6, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 25, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 24, 1], ["thievery", 24, 1]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 30 Fuß tief in vergiftete Dornen", "falls 30 feet into poisoned thorns"), D("15", "bludgeoning"), D("6d8+14", "piercing"), D("2d8", "poison", "persistent"), Z("prone"), Z("sickened", 1)],
        kf: [T("stürzt und wird aufgespießt", "falls and is impaled"), D("15", "bludgeoning"), D("12d8+28", "piercing"), D("3d8", "poison", "persistent"), Z("immobilized"), T("bis Entkommen SG 25,", "until it Escapes (DC 25),"), Z("sickened", 2), T("und das Gift bleibt im Blut:", "and the poison stays in the blood:"), Z("enfeebled", 1, "t1")]
      }
    },
    de: {
      name: "Dornengrube", ausloeser: AUS.betreten.de,
      beschreibung: "Eine abgedeckte Grube, 30 Fuß tief, am Boden mit Gift bestrichene Dornen.",
      wirkung: "Die Abdeckung bricht ein. Herausklettern Athletik SG 25.",
      entschaerfen: "die Abdeckung sichtbar machen und überbrücken", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Thorn Pit", ausloeser: AUS.betreten.en,
      beschreibung: "A covered pit, 30 feet deep, thorns smeared with poison at the bottom.",
      wirkung: "The cover gives way. Climbing out takes Athletics DC 25.",
      entschaerfen: "expose the cover and bridge it", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende6-baumfall", art: "gelaende", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 24, rang: 1, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["survival", 25, 1], ["thievery", 24, 1]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("4d10+6", "bludgeoning")], f: [D("8d10+12", "bludgeoning"), Z("prone")],
        kf: [D("16d10+24", "bludgeoning"), Z("immobilized"), T("unter dem Stamm eingeklemmt bis Athletik SG 25, 2W10 Wucht zu Beginn jedes ihrer Züge, Knochen gebrochen:", "pinned under the trunk until Athletics DC 25, 2d10 bludgeoning at the start of each of its turns, bones broken:"), Z("clumsy", 2, "t1")]
      }
    },
    de: {
      name: "Fallender Stamm", ausloeser: AUS.feld.de,
      beschreibung: "Ein angesägter Baumstamm, mit einem Stolperseil über dem Pfad gehalten.",
      wirkung: "Der Stamm kracht quer über den Pfad.",
      entschaerfen: "das Seil entlasten und den Stamm abstützen", ruecksetzen: "Keines."
    },
    en: {
      name: "Falling Trunk", ausloeser: AUS.feld.en,
      beschreibung: "A half-sawn tree trunk, held above the path by a tripwire.",
      wirkung: "The trunk crashes down across the path.",
      entschaerfen: "take the load off the wire and brace the trunk", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende6-bolzensalve", art: "gelaende", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 24, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 25, 2], ["survival", 25, 1]],
    angriff: { bonus: 19, schaden: [D("6d10+12", "piercing"), D("2d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Bolzensalve aus dem Unterholz", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Stolperdraht quer über den Pfad, im Unterholz eine Reihe gespannter Armbrüste.",
      wirkung: "Bolzen fliegen aus dem Unterholz: je ein Fernkampf-Treffer (ohne Angriffswurf) gegen jede Kreatur im Wirkungsbereich, 6W10+12 Stich und 2W6 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Bolzen steckt im Knochen: Kraftlos 1 für 24 Stunden.",
      entschaerfen: "den Draht entlasten", ruecksetzen: "Armbrüste neu spannen (10 Minuten)."
    },
    en: {
      name: "Bolt Volley from the Undergrowth", ausloeser: AUS.betreten.en,
      beschreibung: "A tripwire across the path, a row of cocked crossbows in the undergrowth.",
      wirkung: "Bolts fly from the undergrowth: one ranged hit (no attack roll) against each creature in the area, 6d10+12 piercing and 2d6 persistent bleed.",
      krit: "Critical hit: double damage, prone, and the bolt lodges in the bone: enfeebled 1 for 24 hours.",
      entschaerfen: "take the load off the wire", ruecksetzen: "Rearm the crossbows (10 minutes)."
    },
    kritZ: [Z("prone"), Z("enfeebled", 1, "t1")]
  },
  {
    id: "gelaende6-giftdornen", art: "gelaende", stufe: 6, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["survival", 24, 1], ["nature", 25, 1]],
    gift: {
      typ: "fortitude", dc: 25, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("5d6", "poison"), Z("clumsy", 1)],
        [D("7d6", "poison"), Z("clumsy", 2), Z("slowed", 1)],
        [D("9d6", "poison"), Z("clumsy", 3), Z("slowed", 2), Z("drained", 1)]
      ]
    },
    de: {
      name: "Giftdornen im Gras", ausloeser: AUS.feld.de,
      beschreibung: "Dornige Zweige im hohen Gras, an den Spitzen ein dunkler Belag.",
      wirkung: "Die Dornen dringen durch Stiefel und Kleidung. Krampfgift.", gift: "Krampfgift",
      entschaerfen: "die Zweige aufspüren und abschneiden", ruecksetzen: "Neu auslegen."
    },
    en: {
      name: "Poison Thorns in the Grass", ausloeser: AUS.feld.en,
      beschreibung: "Thorny twigs in the tall grass, a dark coating on their tips.",
      wirkung: "The thorns pierce boots and clothing. Cramp poison.", gift: "Cramp poison",
      entschaerfen: "find and cut the twigs", ruecksetzen: "Lay them out again."
    }
  },
  {
    id: "gelaende6-erdbebenrune", art: "gelaende", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 25, 2], ["nature", 25, 2]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("5d8", "bludgeoning"), Z("prone")], f: [D("10d8+10", "bludgeoning"), Z("prone"), Z("stunned", 1)],
        kf: [D("20d8+20", "bludgeoning"), Z("prone"), Z("immobilized"), T("in einer Spalte eingeklemmt bis Entkommen SG 25,", "trapped in a crevice until it Escapes (DC 25),"), T("dazu gequetscht:", "and crushed:"), Z("enfeebled", 1, "t1")]
      }
    },
    de: {
      name: "Erdbebenrune", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Rune in einem flachen Felsen, um ihn feine Risse im Boden.",
      wirkung: "Der Boden bebt und reißt auf. Der Wirkungsbereich wird schwieriges Gelände.",
      entschaerfen: "die Rune bannen oder den Fels spalten", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Earthquake Rune", ausloeser: AUS.betreten.en,
      beschreibung: "A rune in a flat rock, fine cracks in the ground around it.",
      wirkung: "The ground quakes and splits open. The area becomes difficult terrain.",
      entschaerfen: "dispel the rune or split the rock", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "gelaende6-irrlichter", art: "gelaende", stufe: 6, merkmale: ["magical", "mental", "light", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 25, 2], ["nature", 26, 2]],
    wurf: {
      typ: "will", dc: 25, grade: {
        ke: [], e: [D("4d8+5", "mental"), Z("fascinated", null, "r1")], f: [D("10d8+5", "mental"), Z("fascinated", null, "m1"), Z("stupefied", 1, "t1")],
        kf: [D("20d8+10", "mental"), Z("confused", null, "m1"), Z("stupefied", 2, "t1"), T("und das Irrlichtmal", "and the wisp mark")]
      }
    },
    aussehen: { de: ["Irrlichtmal", "Die Augen schimmern im Dunkeln bläulich, als läge ein Licht dahinter."], en: ["Wisp Mark", "The eyes shimmer bluish in the dark, as if a light lay behind them."], toenung: "#9fd8ff", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Irrlichter", ausloeser: AUS.feld.de,
      beschreibung: "Kleine Lichter tanzen über Sumpf oder Wiese, sobald jemand näher kommt.",
      wirkung: "Die Lichter brennen sich in den Geist aller, die sie sehen.",
      entschaerfen: "die Lichter mit einem Bann zerstreuen", ruecksetzen: "Kehren in der nächsten Nacht zurück."
    },
    en: {
      name: "Luring Lights", ausloeser: AUS.feld.en,
      beschreibung: "Small lights dance over marsh or meadow as soon as someone comes closer.",
      wirkung: "The lights burn themselves into the minds of everyone who sees them.",
      entschaerfen: "scatter the lights with a ward", ruecksetzen: "Return the next night."
    }
  },
  {
    id: "gelaende6-sporenfeld", art: "gelaende", stufe: 6, merkmale: ["environmental", "fungus", "poison", "inhaled"],
    heimlichkeit: 24, rang: 1, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["nature", 24, 1], ["survival", 25, 1]],
    gift: {
      typ: "fortitude", dc: 25, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("4d6", "poison"), Z("sickened", 1)],
        [D("6d6", "poison"), Z("sickened", 2), Z("blinded", null, "r1")],
        [D("8d6", "poison"), Z("sickened", 3), Z("drained", 2)]
      ]
    },
    de: {
      name: "Sporenfeld", ausloeser: AUS.betreten.de,
      beschreibung: "Bleiche Pilze unter dem Laub, die bei Druck in einer Wolke platzen.",
      wirkung: "Eine Sporenwolke füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Erstickende Sporen.", gift: "Erstickende Sporen",
      entschaerfen: "die Pilze mit Feuer oder Wasser unschädlich machen", ruecksetzen: "Wächst in 1 Woche nach."
    },
    en: {
      name: "Spore Field", ausloeser: AUS.betreten.en,
      beschreibung: "Pale fungi under the leaves that burst into a cloud when pressed.",
      wirkung: "A cloud of spores fills the area for 1 minute. A creature starting its turn inside rolls again. Choking spores.", gift: "Choking spores",
      entschaerfen: "render the fungi harmless with fire or water", ruecksetzen: "Grows back in 1 week."
    }
  },
  {
    id: "gelaende6-gebrochener-bann", art: "gelaende", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 26, 2], ["arcana", 26, 2]],
    beschwoerung: { stufe: 9, runden: 10, ort: "falle" },
    de: {
      name: "Gebrochener Bannkreis", ausloeser: AUS.betreten.de,
      beschreibung: "Ein überwachsener Kreis aus Grenzsteinen, einer davon liegt umgestürzt.",
      wirkung: "Wer den Kreis betritt, bricht den letzten Rest des Banns: Eine Kreatur bis Stufe 9 erscheint in der Mitte des Kreises, würfelt sofort Initiative, greift zuerst an, wer die Falle ausgelöst hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den umgestürzten Stein aufrichten und den Bann erneuern", ruecksetzen: "Keines."
    },
    en: {
      name: "Broken Warding Circle", ausloeser: AUS.betreten.en,
      beschreibung: "An overgrown circle of boundary stones, one of them toppled.",
      wirkung: "Whoever enters the circle breaks the last of the ward: a creature of up to level 9 appears at the centre of the circle, rolls initiative at once, attacks whoever triggered the trap first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "raise the toppled stone and renew the ward", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum6-klingenwand", art: "raum", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 24, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 25, 2]],
    angriff: { bonus: 19, schaden: [D("7d8+16", "slashing"), D("2d8", "bleed", "persistent")], hoechstens: null, nah: true },
    de: {
      name: "Klingenwand", ausloeser: AUS.platte.de,
      beschreibung: "Schmale Schlitze in beiden Wänden eines Gangs, eine Druckplatte im Boden.",
      wirkung: "Sichelklingen fahren aus den Wänden: je ein Nahkampf-Treffer (ohne Angriffswurf) gegen jede Kreatur im Wirkungsbereich, 7W8+16 Hieb und 2W8 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und eine Sehne ist durchtrennt: Kraftlos 2 für 24 Stunden.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Setzt sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Blade Wall", ausloeser: AUS.platte.en,
      beschreibung: "Narrow slots in both walls of a corridor, a pressure plate in the floor.",
      wirkung: "Scythe blades sweep out of the walls: one melee hit (no attack roll) against each creature in the area, 7d8+16 slashing and 2d8 persistent bleed.",
      krit: "Critical hit: double damage, prone, and a tendon is severed: enfeebled 2 for 24 hours.",
      entschaerfen: "wedge the plate", ruecksetzen: "Resets itself after 1 minute."
    },
    kritZ: [Z("prone"), Z("enfeebled", 2, "t1")]
  },
  {
    id: "raum6-deckensturz", art: "raum", stufe: 6, merkmale: ["mechanical", "trap"],
    heimlichkeit: 25, rang: 1, ausloeser: 5, wirkung: 10, werte: { rk: 24, haerte: 14, tp: 60 },
    entschaerfen: [["thievery", 25, 1], ["crafting", 25, 2]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("5d8+8", "bludgeoning")], f: [D("10d8+15", "bludgeoning"), Z("prone")],
        kf: [D("20d8+30", "bludgeoning"), T("verschüttet", "buried"), Z("immobilized"), T("bis Athletik SG 25, 2W8 Wucht zu Beginn jedes ihrer Züge, dazu gequetscht:", "until Athletics DC 25, 2d8 bludgeoning at the start of each of its turns, and crushed:"), Z("clumsy", 1, "t1")]
      }
    },
    de: {
      name: "Einstürzende Decke", ausloeser: AUS.betreten.de,
      beschreibung: "Risse in der Decke, ein Stützbalken hängt an einem Stift, der zu einer Bodenplatte führt.",
      wirkung: "Die Decke bricht herab. Der Wirkungsbereich wird danach schwieriges Gelände.",
      entschaerfen: "den Stift sichern und den Balken abstützen", ruecksetzen: "Keines."
    },
    en: {
      name: "Collapsing Ceiling", ausloeser: AUS.betreten.en,
      beschreibung: "Cracks in the ceiling, a support beam hangs on a pin that leads to a floor slab.",
      wirkung: "The ceiling comes crashing down. The area becomes difficult terrain afterwards.",
      entschaerfen: "secure the pin and brace the beam", ruecksetzen: "None."
    }
  },
  {
    id: "raum6-saeuredusche", art: "raum", stufe: 6, merkmale: ["mechanical", "acid", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 22, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 25, 2], ["crafting", 24, 1]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("5d6", "acid")], f: [D("10d6", "acid"), D("4d6", "acid", "persistent"), Z("dazzled", null, "t1")],
        kf: [D("20d6", "acid"), D("6d6", "acid", "persistent"), T("die Säure trifft die Augen:", "the acid hits the eyes:"), Z("blinded", null, "t1")]
      }
    },
    de: {
      name: "Säuredusche", ausloeser: AUS.betreten.de,
      beschreibung: "Kupferrohre unter der Decke, als Zierrat getarnt, eine lose Bodenplatte als Auslöser.",
      wirkung: "Säure regnet aus den Rohren.",
      entschaerfen: "die Rohre verstopfen", ruecksetzen: "Behälter neu füllen."
    },
    en: {
      name: "Acid Shower", ausloeser: AUS.betreten.en,
      beschreibung: "Copper pipes beneath the ceiling, disguised as ornaments, a loose floor slab as the trigger.",
      wirkung: "Acid rains down from the pipes.",
      entschaerfen: "plug the pipes", ruecksetzen: "Refill the tank."
    }
  },
  {
    id: "raum6-eissturm", art: "raum", stufe: 6, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 25, 2], ["nature", 26, 2]],
    wurf: {
      typ: "fortitude", dc: 25, grade: {
        ke: [], e: [D("5d6+1d10", "cold"), Z("slowed", 1, "r1")], f: [D("10d6+2d10", "cold"), Z("slowed", 1, "m1"), Z("clumsy", 1, "t1")],
        kf: [D("20d6+4d10", "cold"), Z("immobilized"), T("festgefroren bis Entkommen SG 25,", "frozen in place until it Escapes (DC 25),"), Z("slowed", 2, "m1"), Z("clumsy", 2, "t1"), T("und Erfrierungen", "and frostbite")]
      }
    },
    aussehen: { de: ["Erfrierungen", "Schwarzblaue Fingerspitzen und Ohren, die Haut ist rissig vom Frost."], en: ["Frostbite", "Black-blue fingertips and ears, the skin cracked by frost."], toenung: "#a8c8e8", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Eissturm-Kammer", ausloeser: AUS.betreten.de,
      beschreibung: "Raureif in den Ecken des Raums, eine Rune unter einer Bodenfliese.",
      wirkung: "Ein eisiger Sturm fegt durch den Raum.",
      entschaerfen: "die Rune bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Ice Storm Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "Hoarfrost in the corners of the room, a rune beneath a floor tile.",
      wirkung: "An icy storm sweeps through the room.",
      entschaerfen: "dispel the rune", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum6-gedankenfresser", art: "raum", stufe: 6, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 26, 2], ["arcana", 26, 2]],
    wurf: {
      typ: "will", dc: 25, grade: {
        ke: [], e: [D("5d8", "mental"), Z("stupefied", 1, "m1")], f: [D("10d8+5", "mental"), Z("slowed", 1, "r1"), Z("stupefied", 2, "t1")],
        kf: [D("20d8+10", "mental"), Z("paralyzed", null, "r1"), Z("stupefied", 3, "w1"), T("und die Erinnerung an den letzten Tag ist ausgelöscht", "and the memory of the last day is erased")]
      }
    },
    de: {
      name: "Gedankenfresser-Rune", ausloeser: "Eine Kreatur betritt die Platte unter der Rune.",
      beschreibung: "Eine Rune in der Decke, um sie herum Kratzspuren in der Wand.",
      wirkung: "Die Rune frisst sich in den Geist aller im Raum.",
      entschaerfen: "die Rune lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Mind-Eater Rune", ausloeser: "A creature steps on the slab beneath the rune.",
      beschreibung: "A rune in the ceiling, scratch marks in the wall around it.",
      wirkung: "The rune eats its way into the minds of everyone in the room.",
      entschaerfen: "unravel the rune", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum6-betaeubungsgas", art: "raum", stufe: 6, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 25, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 22, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 25, 2], ["crafting", 24, 1]],
    gift: {
      typ: "fortitude", dc: 25, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("5d6", "poison"), Z("enfeebled", 1)],
        [D("7d6", "poison"), Z("enfeebled", 2), Z("slowed", 1)],
        [D("9d6", "poison"), Z("unconscious"), T("bis das Gift endet", "until the poison ends")]
      ]
    },
    de: {
      name: "Betäubungsgas-Kammer", ausloeser: AUS.betreten.de,
      beschreibung: "Die Türen fallen ins Schloss, aus Düsen in den Fugen zischt es.",
      wirkung: "Gas füllt den Raum für 1 Minute, die Türen verriegeln sich (Diebeskunst SG 25 oder Athletik SG 27 zum Aufbrechen). Wer eine Runde darin beginnt, würfelt erneut. Betäubungsgas.", gift: "Betäubungsgas",
      entschaerfen: "die Düsen verstopfen", ruecksetzen: "Behälter neu füllen."
    },
    en: {
      name: "Knockout Gas Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "The doors slam shut, nozzles in the joints start to hiss.",
      wirkung: "Gas fills the room for 1 minute, the doors lock (Thievery DC 25 or Athletics DC 27 to force them). A creature starting its turn inside rolls again. Knockout gas.", gift: "Knockout gas",
      entschaerfen: "plug the nozzles", ruecksetzen: "Refill the tank."
    }
  },
  {
    id: "raum6-umkehrrune", art: "raum", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 26, 2], ["thievery", 27, 2]],
    wurf: {
      typ: "reflex", dc: 25, grade: {
        ke: [], e: [D("5d8", "bludgeoning"), Z("prone")], f: [D("10d8+10", "bludgeoning"), Z("prone"), Z("stunned", 1)],
        kf: [D("20d8+20", "bludgeoning"), Z("prone"), Z("stunned", 2), T("Knochen gebrochen:", "bones broken:"), Z("enfeebled", 2, "t1")]
      }
    },
    de: {
      name: "Umkehrrune", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Rune in der Mitte der Decke, darunter seltsam saubere Bodenfliesen.",
      wirkung: "Die Schwerkraft kehrt sich um: Alles im Wirkungsbereich stürzt an die Decke und 1 Runde später wieder herab.",
      entschaerfen: "die Rune bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Reversal Rune", ausloeser: AUS.betreten.en,
      beschreibung: "A rune at the centre of the ceiling, strangely clean floor tiles below.",
      wirkung: "Gravity reverses: everything in the area falls to the ceiling and back down 1 round later.",
      entschaerfen: "dispel the rune", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum6-spiegelwaechter", art: "raum", stufe: 6, merkmale: ["magical", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["occultism", 26, 2], ["arcana", 26, 2]],
    beschwoerung: { stufe: 9, runden: null, ort: "falle" },
    de: {
      name: "Spiegel des Wächters", ausloeser: AUS.betreten.de,
      beschreibung: "Ein hoher Spiegel an der Wand, in dem sich etwas bewegt, das nicht im Raum steht.",
      wirkung: "Das Spiegelbild tritt heraus: Eine Kreatur bis Stufe 9 erscheint vor dem Spiegel und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Spiegel verhängen und die Bindung lösen", ruecksetzen: "Keines."
    },
    en: {
      name: "Warden's Mirror", ausloeser: AUS.betreten.en,
      beschreibung: "A tall mirror on the wall, something moving in it that is not in the room.",
      wirkung: "The reflection steps out: a creature of up to level 9 appears in front of the mirror and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "cover the mirror and release the binding", ruecksetzen: "None."
    }
  }
];
