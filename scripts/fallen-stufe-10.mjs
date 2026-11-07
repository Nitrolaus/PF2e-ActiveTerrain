// Eigene Fallen Stufe 10 (0.9.0, 07.11.2026: "dann Stufe 10, etwas kürzere Zustände, dafür aber mehrere").
// Maßstab wie Stufe 9, eine Stufe härter beim Schaden: Ein Fehlschlag wirft eine Figur der Stufe 10 um (im Schnitt
// rund 95 Schaden), ein kritischer Fehlschlag jede. Rettungswurf SG 33, Angriff +27, Heimlichkeit 32 bis 35,
// Entschärfen 32 bis 35, Mindestgrad höchstens Experte. Herbeigerufene Gegner bis Stufe 13.
// Lange Zustände nach Vorgabe kürzer, dafür mehrere: Jeder lange Zustand hält 24 Stunden (t1), keiner 1 Woche.
// Jede Falle, die nicht vergiftet oder herbeiruft, hinterlässt beim Fehlschlag oder Treffer mindestens zwei davon,
// beim kritischen Fehlschlag oder Treffer mindestens drei. Die äußere Veränderung bleibt bei 7 Tagen.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante", "grabs the edge");

export const STUFE_10 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer10-klingenkranz", art: "tuer", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 30, haerte: 20, tp: 80 },
    entschaerfen: [["thievery", 33, 2]],
    angriff: { bonus: 27, schaden: [D("11d10+22", "slashing"), D("6d6", "bleed", "persistent")], hoechstens: null, nah: true },
    de: {
      name: "Klingenkranz im Türrahmen", ausloeser: AUS.tuer.de,
      beschreibung: "Rund um den Türrahmen läuft eine Nut, in der hin und wieder eine Schneide aufblitzt.",
      wirkung: "Ein Kranz kreisender Klingen fährt aus dem Rahmen: je ein Nahkampf-Angriff +27 gegen jede Kreatur im Wirkungsbereich, 11W10+22 Hieb und 6W6 anhaltende Blutung. Treffer: Schnitte an Armen und Beinen, Kraftlos 1 und Unbeholfen 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und die Klingen gehen bis auf die Knochen: Kraftlos 2, Unbeholfen 2 und Verlangsamt 1 für 24 Stunden.",
      entschaerfen: "die Nut mit Eisenkeilen füllen", ruecksetzen: "Spannt sich nach 1 Minute selbst."
    },
    en: {
      name: "Blade Wreath in the Door Frame", ausloeser: AUS.tuer.en,
      beschreibung: "A groove runs all around the door frame, now and then a cutting edge flashes in it.",
      wirkung: "A wreath of circling blades sweeps out of the frame: one melee Strike +27 against each creature in the area, 11d10+22 slashing and 6d6 persistent bleed. Hit: cuts on arms and legs, enfeebled 1 and clumsy 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the blades cut to the bone: enfeebled 2, clumsy 2 and slowed 1 for 24 hours.",
      entschaerfen: "fill the groove with iron wedges", ruecksetzen: "Rewinds itself after 1 minute."
    },
    trefferZ: [Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")], kritZ: [Z("prone"), Z("enfeebled", 2, "t1"), Z("clumsy", 2, "t1"), Z("slowed", 1, "t1")]
  },
  {
    id: "tuer10-dornengitter", art: "tuer", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 32, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 30, haerte: 22, tp: 88 },
    entschaerfen: [["thievery", 32, 1], ["athletics", 34, 0]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("6d10+14", "piercing")],
        f: [D("12d10+28", "piercing"), D("4d6", "bleed", "persistent"), T("aufgespießt:", "impaled:"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("24d10+56", "piercing"), D("6d6", "bleed", "persistent"), Z("immobilized"), T("unter dem Gitter festgenagelt bis Athletik SG 33, durchbohrt:", "pinned beneath the grate until Athletics DC 33, run through:"), Z("enfeebled", 2, "t1"), Z("clumsy", 2, "t1"), Z("slowed", 1, "t1"), Z("sickened", 1, "t1")]
      }
    },
    de: {
      name: "Dornengitter", ausloeser: AUS.tuer.de,
      beschreibung: "Im Türsturz steckt die Unterkante eines Gitters, an dessen Stäben lange Dornen sitzen.",
      wirkung: "Das Gitter saust herab und spießt alle in der Tür auf.",
      entschaerfen: "das Gitter im Sturz verkeilen", ruecksetzen: "Wird nach 1 Minute von einer Winde hochgezogen."
    },
    en: {
      name: "Thorned Grate", ausloeser: AUS.tuer.en,
      beschreibung: "The lower edge of a grate sits in the lintel, long thorns on its bars.",
      wirkung: "The grate drops and impales everyone in the doorway.",
      entschaerfen: "wedge the grate in the lintel", ruecksetzen: "A winch hauls it back up after 1 minute."
    }
  },
  {
    id: "tuer10-pulverladung", art: "tuer", stufe: 10, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 0, wirkung: 15, werte: { rk: 28, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 33, 2], ["crafting", 32, 1]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("6d6", "fire"), D("6d6", "bludgeoning")],
        f: [D("12d6", "fire"), D("12d6", "bludgeoning"), D("3d6", "fire", "persistent"), T("Knall und Blitz:", "bang and flash:"), Z("deafened", null, "t1"), Z("dazzled", null, "t1")],
        kf: [D("24d6", "fire"), D("24d6", "bludgeoning"), D("5d6", "fire", "persistent"), Z("prone"), Z("stunned", 2), T("Splitter und Knall:", "splinters and bang:"), Z("deafened", null, "t1"), Z("blinded", null, "t1"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")]
      }
    },
    de: {
      name: "Pulverladung im Türblatt", ausloeser: AUS.tuer.de,
      beschreibung: "Das Türblatt ist frisch verspachtelt, und es riecht nach Schwefel und Holzkohle.",
      wirkung: "Eine Ladung Schwarzpulver im Türblatt zündet und zerreißt die Tür.",
      entschaerfen: "die Lunte durch ein Bohrloch ziehen", ruecksetzen: "Keines."
    },
    en: {
      name: "Powder Charge in the Door Leaf", ausloeser: AUS.tuer.en,
      beschreibung: "The door leaf is freshly filled, and it smells of sulphur and charcoal.",
      wirkung: "A charge of black powder in the door leaf ignites and tears the door apart.",
      entschaerfen: "pull the fuse out through a drill hole", ruecksetzen: "None."
    }
  },
  {
    id: "tuer10-hexentuer", art: "tuer", stufe: 10, merkmale: ["magical", "mental", "curse", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 33, 2], ["religion", 34, 2]],
    wurf: {
      typ: "will", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "mental"), Z("stupefied", 1, "m1")],
        f: [D("18d8+14", "mental"), T("der Hexenbann haftet:", "the hex clings:"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1"), Z("stupefied", 1, "t1")],
        kf: [D("36d8+28", "mental"), Z("slowed", 1, "m1"), T("der volle Bann:", "the full hex:"), Z("enfeebled", 2, "t1"), Z("clumsy", 2, "t1"), Z("stupefied", 2, "t1"), Z("doomed", 1, "t1"), T("und das Hexenmal", "and the witch mark")]
      }
    },
    aussehen: { de: ["Hexenmal", "Eine Warze auf der Nasenspitze und ein grünlicher Schimmer auf der Haut."], en: ["Witch Mark", "A wart on the tip of the nose and a greenish sheen on the skin."], toenung: "#90a870", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Tür der Hexe", ausloeser: AUS.tuer.de,
      beschreibung: "An der Tür hängen getrocknete Kräuter, Knochen und eine Puppe aus Stroh mit Nadeln darin.",
      wirkung: "Die Puppe dreht den Kopf, und ein Bann fällt auf alle vor der Tür.",
      entschaerfen: "die Nadeln aus der Puppe ziehen und sie verbrennen", ruecksetzen: "Lädt sich in der nächsten Neumondnacht neu."
    },
    en: {
      name: "Witch's Door", ausloeser: AUS.tuer.en,
      beschreibung: "Dried herbs, bones and a straw doll with needles in it hang on the door.",
      wirkung: "The doll turns its head, and a hex falls upon everyone in front of the door.",
      entschaerfen: "pull the needles from the doll and burn it", ruecksetzen: "Recharges on the next new moon night."
    }
  },
  {
    id: "tuer10-finsternis", art: "tuer", stufe: 10, merkmale: ["magical", "void", "darkness", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["occultism", 33, 2], ["arcana", 34, 2]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "void"), Z("dazzled", null, "m1")],
        f: [D("18d8+14", "void"), Z("blinded", null, "m1"), T("danach", "then"), Z("dazzled", null, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("36d8+28", "void"), Z("frightened", 2), T("die Finsternis bleibt in Augen und Gliedern:", "the darkness stays in eyes and limbs:"), Z("blinded", null, "t1"), Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1"), T("und die schwarzen Adern", "and the black veins")]
      }
    },
    aussehen: { de: ["Schwarze Adern", "Die Adern zeichnen sich schwarz unter der Haut ab, am deutlichsten an Schläfen und Händen."], en: ["Black Veins", "The veins show black beneath the skin, most clearly at the temples and hands."], toenung: "#5a5a6a", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Tor der Finsternis", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Tor aus schwarzem Stein, das alles Licht in seiner Nähe trübt.",
      wirkung: "Lebendige Finsternis quillt aus dem Tor und fährt in Augen und Glieder aller davor.",
      entschaerfen: "das Tor in hellem Licht mit einem Bann lösen", ruecksetzen: "Lädt sich in der nächsten Nacht neu."
    },
    en: {
      name: "Gate of Darkness", ausloeser: AUS.tuer.en,
      beschreibung: "A gate of black stone that dims all light near it.",
      wirkung: "Living darkness wells from the gate and enters the eyes and limbs of everyone before it.",
      entschaerfen: "unravel the gate with a dispel in bright light", ruecksetzen: "Recharges the next night."
    }
  },
  {
    id: "tuer10-sturmtor", art: "tuer", stufe: 10, merkmale: ["magical", "air", "electricity", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 0, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 33, 2], ["nature", 34, 2]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("4d10", "electricity"), D("5d10", "bludgeoning")],
        f: [D("9d10", "electricity"), D("9d10", "bludgeoning"), Z("prone"), T("vom Sturm zerschlagen:", "battered by the storm:"), Z("clumsy", 1, "t1"), Z("deafened", null, "t1")],
        kf: [D("18d10", "electricity"), D("18d10", "bludgeoning"), Z("prone"), Z("stunned", 2), T("Blitz und Donner:", "lightning and thunder:"), Z("clumsy", 2, "t1"), Z("deafened", null, "t1"), Z("enfeebled", 1, "t1"), Z("dazzled", null, "t1")]
      }
    },
    de: {
      name: "Sturmtor", ausloeser: AUS.tuer.de,
      beschreibung: "Ein Tor mit Flügeln aus Kupfer, in die Wolken und Blitze getrieben sind, es summt leise.",
      wirkung: "Ein Sturm bricht aus dem Tor, Wind und Blitze fegen durch den Gang.",
      entschaerfen: "die Kupferflügel erden und die Rune bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Storm Gate", ausloeser: AUS.tuer.en,
      beschreibung: "A gate with copper wings embossed with clouds and lightning, it hums softly.",
      wirkung: "A storm bursts from the gate, wind and lightning sweep through the corridor.",
      entschaerfen: "ground the copper wings and dispel the rune", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer10-mumienfluch", art: "tuer", stufe: 10, merkmale: ["magical", "void", "disease", "curse", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["religion", 33, 2], ["occultism", 34, 2]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "void"), Z("sickened", 1)],
        f: [D("18d8+14", "void"), T("die Haut wird trocken wie Papyrus:", "the skin grows dry as papyrus:"), Z("sickened", 1, "t1"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("36d8+28", "void"), Z("drained", 2), T("der Fluch dörrt den Leib:", "the curse withers the body:"), Z("sickened", 2, "t1"), Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1"), Z("doomed", 1, "t1"), T("und die Pergamenthaut", "and the parchment skin")]
      }
    },
    aussehen: { de: ["Pergamenthaut", "Die Haut ist gelblich, trocken und rissig wie altes Pergament."], en: ["Parchment Skin", "The skin is yellowish, dry and cracked like old parchment."], toenung: "#c8b890", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Mumienfluch", ausloeser: AUS.tuer.de,
      beschreibung: "Die Tür ist mit Hieroglyphen bemalt, über allen steht ein Auge, darunter ein Fluch.",
      wirkung: "Der Fluch des Grabes fährt in alle, die die Ruhe der Toten stören.",
      entschaerfen: "den Fluch mit Weihrauch und den Namen der Toten lösen", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Mummy's Curse", ausloeser: AUS.tuer.en,
      beschreibung: "The door is painted with hieroglyphs, an eye above them all, a curse beneath.",
      wirkung: "The curse of the tomb enters everyone who disturbs the rest of the dead.",
      entschaerfen: "unravel the curse with incense and the names of the dead", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "tuer10-tuerklopfer", art: "tuer", stufe: 10, merkmale: ["magical", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 33, 2], ["religion", 34, 2]],
    beschwoerung: { stufe: 13, runden: 10, ort: "neben" },
    de: {
      name: "Ruf des Löwenklopfers", ausloeser: AUS.tuer.de,
      beschreibung: "Ein bronzener Löwenkopf mit einem Ring im Maul dient als Türklopfer, seine Augen sind aus Bernstein.",
      wirkung: "Der Löwe brüllt, und sein Ruf wird gehört: Eine Kreatur bis Stufe 13 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Tür geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "dem Löwen das Maul mit dem Ring zubinden", ruecksetzen: "Keines."
    },
    en: {
      name: "Call of the Lion Knocker", ausloeser: AUS.tuer.en,
      beschreibung: "A bronze lion's head with a ring in its mouth serves as a door knocker, its eyes are amber.",
      wirkung: "The lion roars, and its call is heard: a creature of up to level 13 appears in a free square next to the door and rolls initiative at once. It attacks whoever opened the door first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "tie the lion's mouth shut with the ring", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss10-kobrazahn", art: "schloss", stufe: 10, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 30, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 33, 2]],
    gift: {
      typ: "fortitude", dc: 33, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("9d6", "poison"), Z("enfeebled", 1)],
        [D("11d6", "poison"), Z("enfeebled", 2), Z("clumsy", 1)],
        [D("15d6", "poison"), Z("enfeebled", 2), Z("paralyzed", null, "r1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Kobrazahn im Schloss", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schloss hat die Form eines Kobrakopfs aus Messing, im offenen Maul glänzen zwei Zähne.",
      wirkung: "Der Kopf schnellt vor und schlägt die Zähne in die Hand. Kobragift.", gift: "Kobragift",
      entschaerfen: "die Zähne mit einer Zange ausbrechen", ruecksetzen: "Zähne neu vergiften."
    },
    en: {
      name: "Cobra Fang in the Lock", ausloeser: AUS.schloss.en,
      beschreibung: "The lock is shaped like a brass cobra's head, two fangs gleam in its open mouth.",
      wirkung: "The head lunges and sinks its fangs into the hand. Cobra venom.", gift: "Cobra venom",
      entschaerfen: "break out the fangs with pliers", ruecksetzen: "Poison the fangs again."
    }
  },
  {
    id: "schloss10-bohrer", art: "schloss", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 32, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 30, haerte: 20, tp: 80 },
    entschaerfen: [["thievery", 32, 1]],
    angriff: { bonus: 27, schaden: [D("11d8+24", "piercing"), D("6d6", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Schlüssellochbohrer", ausloeser: AUS.schloss.de,
      beschreibung: "Tief im Schlüsselloch dreht sich etwas, wenn man das Ohr ans Holz legt, hört man ein Surren.",
      wirkung: "Ein Bohrer schießt aus dem Schlüsselloch in die Hand: Nahkampf-Angriff +27, 11W8+24 Stich und 6W6 anhaltende Blutung. Treffer: Die Hand ist durchbohrt, Unbeholfen 2 und Kraftlos 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, der Bohrer zermalmt die Handknochen: Unbeholfen 3, Kraftlos 2 und Kränkelnd 1 für 24 Stunden.",
      entschaerfen: "den Bohrer mit einem Nagel im Schlüsselloch blockieren", ruecksetzen: "Von Hand neu aufziehen."
    },
    en: {
      name: "Keyhole Drill", ausloeser: AUS.schloss.en,
      beschreibung: "Something turns deep in the keyhole, pressing an ear to the wood reveals a whirring.",
      wirkung: "A drill shoots out of the keyhole into the hand: melee Strike +27, 11d8+24 piercing and 6d6 persistent bleed. Hit: the hand is pierced, clumsy 2 and enfeebled 1 for 24 hours.",
      krit: "Critical hit: double damage, the drill crushes the bones of the hand: clumsy 3, enfeebled 2 and sickened 1 for 24 hours.",
      entschaerfen: "block the drill with a nail in the keyhole", ruecksetzen: "Wind it up again by hand."
    },
    trefferZ: [Z("clumsy", 2, "t1"), Z("enfeebled", 1, "t1")], kritZ: [Z("clumsy", 3, "t1"), Z("enfeebled", 2, "t1"), Z("sickened", 1, "t1")]
  },
  {
    id: "schloss10-nesselstaub", art: "schloss", stufe: 10, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: "knopf", wirkung: 10, werte: { rk: 28, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 33, 2], ["crafting", 32, 1]],
    gift: {
      typ: "fortitude", dc: 33, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("9d6", "poison"), Z("sickened", 1)],
        [D("11d6", "poison"), Z("sickened", 2), Z("dazzled", null, "r1")],
        [D("15d6", "poison"), Z("sickened", 3), Z("blinded", null, "m1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Kapsel mit Nesselstaub", ausloeser: AUS.schloss.de,
      beschreibung: "Am Schlossblech kleben grünliche Krümel, und wer daran riecht, muss niesen.",
      wirkung: "Eine Kapsel platzt, brennender grüner Staub füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Nesselstaub.", gift: "Nesselstaub",
      entschaerfen: "die Kapsel durch das Schlüsselloch mit Wachs versiegeln", ruecksetzen: "Neue Kapsel einsetzen."
    },
    en: {
      name: "Nettle Dust Capsule", ausloeser: AUS.schloss.en,
      beschreibung: "Greenish crumbs stick to the lock plate, and whoever smells them has to sneeze.",
      wirkung: "A capsule bursts, burning green dust fills the area for 1 minute. A creature starting its turn inside rolls again. Nettle dust.", gift: "Nettle dust",
      entschaerfen: "seal the capsule with wax through the keyhole", ruecksetzen: "Insert a new capsule."
    }
  },
  {
    id: "schloss10-vampirschloss", art: "schloss", stufe: 10, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["religion", 33, 2], ["occultism", 34, 2]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "void"), Z("drained", 1)],
        f: [D("18d8+14", "void"), Z("drained", 2), T("Bisswunden am Handgelenk:", "bite wounds on the wrist:"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("36d8+28", "void"), Z("drained", 3), T("blutleer:", "drained of blood:"), Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1"), Z("sickened", 1, "t1"), Z("doomed", 1, "t1"), T("und die Bissmale", "and the bite marks")]
      }
    },
    aussehen: { de: ["Bissmale", "Zwei kleine, entzündete Wunden am Handgelenk, die nicht heilen wollen."], en: ["Bite Marks", "Two small, inflamed wounds on the wrist that will not heal."], toenung: "#a05050", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Vampirschloss", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Schloss aus schwarzem Silber, der Bügel ist wie zwei Fangzähne geformt.",
      wirkung: "Der Bügel beißt in das Handgelenk und trinkt.",
      entschaerfen: "das Schloss mit Knoblauchöl einreiben und den Zauber lösen", ruecksetzen: "Lädt sich in der nächsten Nacht neu."
    },
    en: {
      name: "Vampire Lock", ausloeser: AUS.schloss.en,
      beschreibung: "A lock of black silver, its shackle shaped like two fangs.",
      wirkung: "The shackle bites into the wrist and drinks.",
      entschaerfen: "rub the lock with garlic oil and unravel the spell", ruecksetzen: "Recharges the next night."
    }
  },
  {
    id: "schloss10-grauen", art: "schloss", stufe: 10, merkmale: ["magical", "mental", "fear", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["occultism", 33, 2], ["religion", 34, 2]],
    wurf: {
      typ: "will", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "mental"), Z("frightened", 1)],
        f: [D("18d8+14", "mental"), Z("frightened", 2), T("die Angst sitzt tief:", "the fear sits deep:"), Z("stupefied", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("36d8+28", "mental"), Z("frightened", 3), Z("fleeing", null, "r1"), T("bricht innerlich:", "breaks inside:"), Z("stupefied", 2, "t1"), Z("enfeebled", 1, "t1"), Z("doomed", 1, "t1"), T("und die weiße Strähne", "and the white streak")]
      }
    },
    aussehen: { de: ["Weiße Strähne", "Eine schneeweiße Strähne zieht sich durch das Haar, wie nach einem großen Schrecken."], en: ["White Streak", "A snow-white streak runs through the hair, as after a great fright."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Siegel des Grauens", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel mit einem Gesicht, das schreit, wer es ansieht, hört es beinahe.",
      wirkung: "Der Schrei bricht aus dem Siegel und zeigt jedem in der Nähe seine schlimmste Angst.",
      entschaerfen: "dem Gesicht die Augen verbinden und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Seal of Horror", ausloeser: AUS.schloss.en,
      beschreibung: "A seal bearing a screaming face, whoever looks at it almost hears it.",
      wirkung: "The scream breaks from the seal and shows everyone nearby their worst fear.",
      entschaerfen: "blindfold the face and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss10-donnerkiste", art: "schloss", stufe: 10, merkmale: ["magical", "sonic", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 33, 2], ["thievery", 34, 2]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d10", "sonic"), Z("deafened", null, "m1")],
        f: [D("18d10", "sonic"), Z("stunned", 1), T("es klingelt in den Ohren:", "the ears ring:"), Z("deafened", null, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("36d10", "sonic"), Z("prone"), Z("stunned", 3), T("Trommelfelle und Gleichgewicht zerstört:", "eardrums and balance destroyed:"), Z("deafened", null, "t1"), Z("clumsy", 2, "t1"), Z("sickened", 1, "t1"), Z("stupefied", 1, "t1")]
      }
    },
    de: {
      name: "Donnerkiste", ausloeser: AUS.schloss.de,
      beschreibung: "Die Kiste ist mit Fell ausgeschlagen und dröhnt dumpf, wenn man daran klopft.",
      wirkung: "Ein gefangener Donnerschlag bricht aus der Kiste.",
      entschaerfen: "die Kiste mit Decken umwickeln und die Rune im Deckel bannen", ruecksetzen: "Lädt sich im nächsten Gewitter neu."
    },
    en: {
      name: "Thunder Chest", ausloeser: AUS.schloss.en,
      beschreibung: "The chest is lined with fur and booms dully when knocked on.",
      wirkung: "A captured thunderclap bursts from the chest.",
      entschaerfen: "wrap the chest in blankets and dispel the rune in the lid", ruecksetzen: "Recharges in the next thunderstorm."
    }
  },
  {
    id: "schloss10-rostsiegel", art: "schloss", stufe: 10, merkmale: ["magical", "acid", "metal", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 33, 2], ["crafting", 34, 2]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("10d6", "acid")],
        f: [D("20d6", "acid"), D("7d6", "acid", "persistent"), T("die Haut ist verätzt:", "the skin is corroded:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("40d6", "acid"), D("9d6", "acid", "persistent"), T("die Säure ist überall:", "the acid is everywhere:"), Z("blinded", null, "t1"), Z("clumsy", 2, "t1"), Z("enfeebled", 1, "t1"), Z("sickened", 1, "t1"), T("und die Rostflecken", "and the rust stains")]
      }
    },
    aussehen: { de: ["Rostflecken", "Rotbraune Flecken wie Rost auf Haut und Kleidung, die sich nicht abreiben lassen."], en: ["Rust Stains", "Red-brown stains like rust on skin and clothes that will not rub off."], toenung: "#b06a3a", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Rostsiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schloss ist von Rost zerfressen, doch das Siegel darauf glänzt wie neu.",
      wirkung: "Das Siegel bricht, und ein Sprühregen ätzender Säure fährt aus allen Rostlöchern.",
      entschaerfen: "das Siegel mit Öl tränken und lösen", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Rust Seal", ausloeser: AUS.schloss.en,
      beschreibung: "The lock is eaten through with rust, yet the seal on it shines like new.",
      wirkung: "The seal breaks, and a spray of corrosive acid bursts from every rust hole.",
      entschaerfen: "soak the seal in oil and loosen it", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "schloss10-geisterlampe", art: "schloss", stufe: 10, merkmale: ["magical", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 34, 2], ["occultism", 35, 2]],
    beschwoerung: { stufe: 13, runden: 10, ort: "neben" },
    de: {
      name: "Geisterlampe", ausloeser: AUS.schloss.de,
      beschreibung: "Neben dem Schloss ist eine kleine Öllampe angeschmiedet, ihr Docht ist schwarz und kalt.",
      wirkung: "Die Lampe entzündet sich von selbst, und aus dem Rauch formt sich ihr Bewohner: Eine Kreatur bis Stufe 13 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer das Schloss geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Docht abschneiden, bevor er brennt", ruecksetzen: "Keines."
    },
    en: {
      name: "Spirit Lamp", ausloeser: AUS.schloss.en,
      beschreibung: "A small oil lamp is forged on beside the lock, its wick black and cold.",
      wirkung: "The lamp lights by itself, and its occupant takes shape from the smoke: a creature of up to level 13 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever opened the lock first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "cut the wick before it burns", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende10-armbrustnester", art: "gelaende", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 30, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 33, 2], ["survival", 33, 1]],
    angriff: { bonus: 27, schaden: [D("11d10+22", "piercing"), D("6d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Armbrustnester in den Felsen", ausloeser: AUS.betreten.de,
      beschreibung: "In den Felsen zu beiden Seiten der Schlucht sitzen dunkle Nischen, darin glänzt Metall.",
      wirkung: "Armbrüste feuern aus den Nischen: je ein Fernkampf-Angriff +27 gegen jede Kreatur im Wirkungsbereich, 11W10+22 Stich und 6W6 anhaltende Blutung. Treffer: Der Bolzen steckt tief, Kraftlos 1 und Verlangsamt 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Bolzen splittert im Knochen: Kraftlos 2, Verlangsamt 1 und Unbeholfen 1 für 24 Stunden.",
      entschaerfen: "die Auslöseleine in der Schlucht finden und kappen", ruecksetzen: "Armbrüste neu spannen (10 Minuten)."
    },
    en: {
      name: "Crossbow Nests in the Rocks", ausloeser: AUS.betreten.en,
      beschreibung: "Dark niches sit in the rocks on both sides of the gorge, metal gleams inside.",
      wirkung: "Crossbows fire from the niches: one ranged Strike +27 against each creature in the area, 11d10+22 piercing and 6d6 persistent bleed. Hit: the bolt lodges deep, enfeebled 1 and slowed 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the bolt splinters in the bone: enfeebled 2, slowed 1 and clumsy 1 for 24 hours.",
      entschaerfen: "find and cut the trigger line in the gorge", ruecksetzen: "Cock the crossbows again (10 minutes)."
    },
    trefferZ: [Z("enfeebled", 1, "t1"), Z("slowed", 1, "t1")], kritZ: [Z("prone"), Z("enfeebled", 2, "t1"), Z("slowed", 1, "t1"), Z("clumsy", 1, "t1")]
  },
  {
    id: "gelaende10-pechgrube", art: "gelaende", stufe: 10, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 32, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 32, 1], ["thievery", 33, 1]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 20 Fuß in kochendes Pech", "falls 20 feet into boiling pitch"), D("10", "bludgeoning"), D("20d6", "fire"), D("5d6", "fire", "persistent"), Z("immobilized"), T("im Pech festgeklebt bis Athletik SG 33, verbrannt:", "stuck in the pitch until Athletics DC 33, burnt:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [T("versinkt im kochenden Pech", "sinks into the boiling pitch"), D("10", "bludgeoning"), D("40d6", "fire"), D("8d6", "fire", "persistent"), Z("immobilized"), T("bis Athletik SG 33, schwer verbrannt:", "until Athletics DC 33, badly burnt:"), Z("clumsy", 2, "t1"), Z("enfeebled", 2, "t1"), Z("sickened", 1, "t1")]
      }
    },
    de: {
      name: "Pechgrube", ausloeser: AUS.betreten.de,
      beschreibung: "Es riecht nach Teer, und der Boden ist an einer Stelle warm, als läge darunter ein Ofen.",
      wirkung: "Eine dünne Decke bricht ein, darunter brodelt kochendes Pech. Herausklettern Athletik SG 33.",
      entschaerfen: "die Grube mit Steinen und Balken überbrücken", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Pitch Pit", ausloeser: AUS.betreten.en,
      beschreibung: "It smells of tar, and in one place the ground is warm, as if an oven lay beneath.",
      wirkung: "A thin cover gives way, boiling pitch bubbles beneath. Climbing out takes Athletics DC 33.",
      entschaerfen: "bridge the pit with stones and beams", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende10-federpfaehle", art: "gelaende", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 32, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 28, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 32, 1], ["survival", 33, 1]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("6d10+14", "piercing")],
        f: [D("12d10+28", "piercing"), D("4d6", "bleed", "persistent"), T("aufgespießt:", "impaled:"), Z("slowed", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("24d10+56", "piercing"), D("6d6", "bleed", "persistent"), Z("prone"), T("durchbohrt:", "run through:"), Z("slowed", 1, "t1"), Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1"), Z("sickened", 1, "t1")]
      }
    },
    de: {
      name: "Federpfähle im Gras", ausloeser: AUS.feld.de,
      beschreibung: "Hohes Gras auf einer Lichtung, an einer Stelle ist es merkwürdig gleichmäßig niedergedrückt.",
      wirkung: "Angespitzte Pfähle schnellen auf Federn schräg aus dem Boden.",
      entschaerfen: "die Federn mit einem Stock auslösen, ohne davor zu stehen", ruecksetzen: "Pfähle neu spannen (10 Minuten)."
    },
    en: {
      name: "Spring Stakes in the Grass", ausloeser: AUS.feld.en,
      beschreibung: "Tall grass in a clearing, in one place oddly evenly flattened.",
      wirkung: "Sharpened stakes snap out of the ground at an angle on springs.",
      entschaerfen: "trigger the springs with a staff without standing in front of them", ruecksetzen: "Rearm the stakes (10 minutes)."
    }
  },
  {
    id: "gelaende10-glutwind", art: "gelaende", stufe: 10, merkmale: ["environmental", "fire"],
    heimlichkeit: 32, rang: 1, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["survival", 32, 1], ["nature", 33, 1]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d10", "fire")],
        f: [D("18d10", "fire"), T("ausgedörrt:", "parched:"), Z("enfeebled", 1, "t1"), Z("sickened", 1, "t1"), Z("dazzled", null, "t1")],
        kf: [D("36d10", "fire"), Z("drained", 2), T("verdurstet beinahe:", "nearly dies of thirst:"), Z("enfeebled", 2, "t1"), Z("sickened", 2, "t1"), Z("clumsy", 1, "t1"), Z("dazzled", null, "t1"), T("und die ausgedörrte Haut", "and the parched skin")]
      }
    },
    aussehen: { de: ["Ausgedörrte Haut", "Die Haut ist rot verbrannt, schält sich in Fetzen, die Lippen sind aufgesprungen."], en: ["Parched Skin", "The skin is burnt red and peels in shreds, the lips are cracked."], toenung: "#c89060", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Glutwind in der Wüste", ausloeser: AUS.feld.de,
      beschreibung: "Eine Senke zwischen Dünen, in der die Luft flimmert und kein Wind zu gehen scheint.",
      wirkung: "Ein Glutwind fährt plötzlich durch die Senke und dörrt alle darin aus.",
      entschaerfen: "die Senke bei Nacht durchqueren oder ihren Wind mit Wasser binden", ruecksetzen: "Kommt am nächsten heißen Tag wieder."
    },
    en: {
      name: "Searing Wind in the Desert", ausloeser: AUS.feld.en,
      beschreibung: "A hollow between dunes where the air shimmers and no wind seems to blow.",
      wirkung: "A searing wind suddenly sweeps through the hollow and parches everyone in it.",
      entschaerfen: "cross the hollow by night or bind its wind with water", ruecksetzen: "Returns on the next hot day."
    }
  },
  {
    id: "gelaende10-eisenhut", art: "gelaende", stufe: 10, merkmale: ["environmental", "poison", "inhaled"],
    heimlichkeit: 32, rang: 1, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["nature", 32, 1], ["survival", 33, 1]],
    gift: {
      typ: "fortitude", dc: 33, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("9d6", "poison"), Z("clumsy", 1)],
        [D("11d6", "poison"), Z("clumsy", 2), Z("slowed", 1)],
        [D("15d6", "poison"), Z("clumsy", 2), Z("paralyzed", null, "r1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Wiese aus Wolfseisenhut", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Wiese voller violetter Blüten in Form kleiner Helme, über der eine Wolke aus Blütenstaub schwebt.",
      wirkung: "Wer hindurchgeht, wirbelt den Blütenstaub auf; er hängt 1 Minute in der Luft. Wer eine Runde darin beginnt, würfelt erneut. Eisenhutstaub.", gift: "Eisenhutstaub",
      entschaerfen: "eine Schneise mähen oder den Staub mit Wasser binden", ruecksetzen: "Blüht im nächsten Sommer neu."
    },
    en: {
      name: "Meadow of Wolfsbane", ausloeser: AUS.betreten.en,
      beschreibung: "A meadow full of violet flowers shaped like small helmets, a cloud of pollen floating above it.",
      wirkung: "Walking through stirs up the pollen; it hangs in the air for 1 minute. A creature starting its turn inside rolls again. Wolfsbane dust.", gift: "Wolfsbane dust",
      entschaerfen: "mow a path or bind the dust with water", ruecksetzen: "Blooms again next summer."
    }
  },
  {
    id: "gelaende10-irrnebel", art: "gelaende", stufe: 10, merkmale: ["magical", "mental", "visual", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 33, 2], ["nature", 34, 2]],
    wurf: {
      typ: "will", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "mental"), Z("confused", null, "r1")],
        f: [D("18d8+14", "mental"), Z("confused", null, "r1"), T("die Richtung bleibt verloren:", "the direction stays lost:"), Z("stupefied", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("36d8+28", "mental"), Z("frightened", 1), T("verirrt sich im eigenen Kopf:", "gets lost in its own head:"), Z("confused", null, "t1"), Z("stupefied", 2, "t1"), Z("clumsy", 1, "t1")]
      }
    },
    de: {
      name: "Nebel der Verirrten", ausloeser: AUS.feld.de,
      beschreibung: "Ein Tal voller Nebel, in dem Stimmen rufen und Wege in alle Richtungen zu führen scheinen.",
      wirkung: "Der Nebel dringt in den Geist aller im Wirkungsbereich und verdreht ihnen die Sinne.",
      entschaerfen: "den Kern des Nebels, einen Stein mit einer Rune, finden und bannen", ruecksetzen: "Steigt am nächsten Morgen neu auf."
    },
    en: {
      name: "Mist of the Lost", ausloeser: AUS.feld.en,
      beschreibung: "A valley full of mist in which voices call and paths seem to lead in every direction.",
      wirkung: "The mist enters the minds of everyone in the area and twists their senses.",
      entschaerfen: "find and dispel the heart of the mist, a stone bearing a rune", ruecksetzen: "Rises again the next morning."
    }
  },
  {
    id: "gelaende10-dornbusch", art: "gelaende", stufe: 10, merkmale: ["magical", "fire", "plant", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 5, wirkung: 15, werte: null,
    entschaerfen: [["nature", 33, 2], ["religion", 34, 2]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("6d6", "fire"), D("6d6", "piercing")],
        f: [D("11d6", "fire"), D("11d6", "piercing"), D("4d6", "fire", "persistent"), T("Dornen und Flammen:", "thorns and flames:"), Z("clumsy", 1, "t1"), Z("dazzled", null, "t1")],
        kf: [D("22d6", "fire"), D("22d6", "piercing"), D("6d6", "fire", "persistent"), Z("prone"), T("im Dornbusch gefangen und verbrannt:", "caught in the thornbush and burnt:"), Z("clumsy", 2, "t1"), Z("enfeebled", 1, "t1"), Z("blinded", null, "t1"), T("und die Dornennarben", "and the thorn scars")]
      }
    },
    aussehen: { de: ["Dornennarben", "Ein Netz feiner, verkohlter Kratzer überzieht Arme und Gesicht."], en: ["Thorn Scars", "A net of fine, charred scratches covers arms and face."], toenung: "#c08070", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Brennender Dornbusch", ausloeser: AUS.betreten.de,
      beschreibung: "Ein mannshoher Dornbusch, der brennt, ohne zu verbrennen, die Flammen sind fast unsichtbar.",
      wirkung: "Der Busch greift mit brennenden Ranken nach allen in der Nähe.",
      entschaerfen: "den Busch mit geweihtem Wasser löschen", ruecksetzen: "Entflammt in der nächsten Nacht neu."
    },
    en: {
      name: "Burning Thornbush", ausloeser: AUS.betreten.en,
      beschreibung: "A man-high thornbush that burns without being consumed, the flames almost invisible.",
      wirkung: "The bush reaches with burning tendrils for everyone nearby.",
      entschaerfen: "quench the bush with holy water", ruecksetzen: "Ignites again the next night."
    }
  },
  {
    id: "gelaende10-drachenschaedel", art: "gelaende", stufe: 10, merkmale: ["magical", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 34, 2], ["arcana", 34, 2]],
    beschwoerung: { stufe: 13, runden: null, ort: "falle" },
    de: {
      name: "Drachenschädel im Sand", ausloeser: AUS.betreten.de,
      beschreibung: "Ein riesiger, vom Wind gebleichter Schädel ragt aus dem Sand, in seinen Augenhöhlen glimmt es.",
      wirkung: "Der Schädel erwacht und ruft seinen Wächter: Eine Kreatur bis Stufe 13 erhebt sich aus dem Sand und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Augenhöhlen mit Sand und Salz füllen", ruecksetzen: "Keines."
    },
    en: {
      name: "Dragon Skull in the Sand", ausloeser: AUS.betreten.en,
      beschreibung: "A huge skull bleached by the wind juts from the sand, something glows in its eye sockets.",
      wirkung: "The skull awakens and calls its warden: a creature of up to level 13 rises from the sand and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "fill the eye sockets with sand and salt", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum10-klingenarme", art: "raum", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 30, haerte: 18, tp: 72 },
    entschaerfen: [["thievery", 33, 2]],
    angriff: { bonus: 27, schaden: [D("11d10+22", "slashing"), D("6d6", "bleed", "persistent")], hoechstens: null, nah: true },
    de: {
      name: "Klingenarme an der Decke", ausloeser: AUS.platte.de,
      beschreibung: "An der Decke hängen gefaltete Eisenarme wie die Beine einer riesigen Spinne.",
      wirkung: "Die Arme klappen herab und schlagen mit Klingen um sich: je ein Nahkampf-Angriff +27 gegen jede Kreatur im Wirkungsbereich, 11W10+22 Hieb und 6W6 anhaltende Blutung. Treffer: Schnitte an Kopf und Schultern, Unbeholfen 1 und Kraftlos 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und eine Klinge trifft tief: Unbeholfen 2, Kraftlos 2 und Kränkelnd 1 für 24 Stunden.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Faltet sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Blade Arms on the Ceiling", ausloeser: AUS.platte.en,
      beschreibung: "Folded iron arms hang from the ceiling like the legs of a giant spider.",
      wirkung: "The arms fold down and lash about with blades: one melee Strike +27 against each creature in the area, 11d10+22 slashing and 6d6 persistent bleed. Hit: cuts to head and shoulders, clumsy 1 and enfeebled 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and a blade strikes deep: clumsy 2, enfeebled 2 and sickened 1 for 24 hours.",
      entschaerfen: "wedge the plate", ruecksetzen: "Folds back by itself after 1 minute."
    },
    trefferZ: [Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")], kritZ: [Z("prone"), Z("clumsy", 2, "t1"), Z("enfeebled", 2, "t1"), Z("sickened", 1, "t1")]
  },
  {
    id: "raum10-flutkammer", art: "raum", stufe: 10, merkmale: ["mechanical", "water", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 28, haerte: 16, tp: 64 },
    entschaerfen: [["thievery", 33, 2], ["crafting", 32, 1]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("6d10+14", "bludgeoning")],
        f: [D("12d10+28", "bludgeoning"), Z("slowed", 1, "m1"), T("halb ertrunken:", "half drowned:"), Z("sickened", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("24d10+56", "bludgeoning"), Z("drained", 2), T("fast ertrunken, Wasser in der Lunge:", "nearly drowned, water in the lungs:"), Z("sickened", 2, "t1"), Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1")]
      }
    },
    de: {
      name: "Flutkammer", ausloeser: AUS.betreten.de,
      beschreibung: "Die Wände tragen bis unter die Decke Wasserränder, im Boden sitzen große Abflussgitter.",
      wirkung: "Die Türen schlagen zu, und Wasser schießt mit Wucht durch die Gitter, bis die Kammer voll ist; nach 1 Minute läuft es ab.",
      entschaerfen: "die Zuflüsse unter den Gittern verschließen", ruecksetzen: "Läuft nach 1 Minute ab und setzt sich zurück."
    },
    en: {
      name: "Flooding Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "Water lines mark the walls up to the ceiling, large drain grates sit in the floor.",
      wirkung: "The doors slam shut, and water shoots forcefully through the grates until the chamber is full; it drains after 1 minute.",
      entschaerfen: "close the inlets beneath the grates", ruecksetzen: "Drains after 1 minute and resets."
    }
  },
  {
    id: "raum10-bilsenkraut", art: "raum", stufe: 10, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 32, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 28, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 33, 2], ["crafting", 32, 1]],
    gift: {
      typ: "fortitude", dc: 33, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("9d6", "poison"), Z("stupefied", 1)],
        [D("11d6", "poison"), Z("stupefied", 2), Z("confused", null, "r1")],
        [D("15d6", "poison"), Z("stupefied", 3), Z("unconscious"), T("bis das Gift endet", "until the poison ends"), Z("drained", 1)]
      ]
    },
    de: {
      name: "Bilsenkraut-Räucherwerk", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Tempelraum mit Räucherschalen auf Dreifüßen, in ihnen liegt dunkles, getrocknetes Kraut.",
      wirkung: "Funken springen in die Schalen, betäubender Rauch füllt den Raum für 1 Minute, die Türen fallen zu (Diebeskunst SG 33 oder Athletik SG 35 zum Aufbrechen). Wer eine Runde darin beginnt, würfelt erneut. Bilsenkrautrauch.", gift: "Bilsenkrautrauch",
      entschaerfen: "die Schalen mit Sand füllen, bevor die Funken springen", ruecksetzen: "Kraut nachlegen."
    },
    en: {
      name: "Henbane Incense", ausloeser: AUS.betreten.en,
      beschreibung: "A temple room with censers on tripods, dark dried herbs lying in them.",
      wirkung: "Sparks leap into the censers, stupefying smoke fills the room for 1 minute, the doors slam shut (Thievery DC 33 or Athletics DC 35 to force them). A creature starting its turn inside rolls again. Henbane smoke.", gift: "Henbane smoke",
      entschaerfen: "fill the censers with sand before the sparks leap", ruecksetzen: "Add more herbs."
    }
  },
  {
    id: "raum10-drehboden", art: "raum", stufe: 10, merkmale: ["mechanical", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 30, haerte: 20, tp: 80 },
    entschaerfen: [["thievery", 33, 2], ["crafting", 33, 2]],
    wurf: {
      typ: "reflex", dc: 33, grade: {
        ke: [], e: [D("6d10+14", "bludgeoning"), Z("prone")],
        f: [D("12d10+28", "bludgeoning"), Z("prone"), T("gegen die Wände geschleudert:", "hurled against the walls:"), Z("clumsy", 1, "t1"), Z("sickened", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("24d10+56", "bludgeoning"), Z("prone"), Z("stunned", 2), T("Knochen geprellt, der Magen umgedreht:", "bones bruised, the stomach turned:"), Z("clumsy", 2, "t1"), Z("sickened", 2, "t1"), Z("enfeebled", 1, "t1"), Z("slowed", 1, "t1"), T("und die grünliche Blässe", "and the greenish pallor")]
      }
    },
    aussehen: { de: ["Grünliche Blässe", "Das Gesicht ist grünlich blass, beim Anblick von Bewegung dreht sich der Magen."], en: ["Greenish Pallor", "The face is greenish pale, the stomach turns at the sight of motion."], toenung: "#a0c090", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Rotierender Boden", ausloeser: AUS.betreten.de,
      beschreibung: "Ein runder Raum, dessen Boden durch eine feine Fuge von den Wänden getrennt ist.",
      wirkung: "Der Boden beginnt sich rasend schnell zu drehen und schleudert alle gegen die Wände.",
      entschaerfen: "die Fuge mit Keilen verschließen", ruecksetzen: "Kommt nach 1 Minute zum Stillstand."
    },
    en: {
      name: "Spinning Floor", ausloeser: AUS.betreten.en,
      beschreibung: "A round room whose floor is separated from the walls by a fine gap.",
      wirkung: "The floor begins to spin at frantic speed and hurls everyone against the walls.",
      entschaerfen: "seal the gap with wedges", ruecksetzen: "Comes to a halt after 1 minute."
    }
  },
  {
    id: "raum10-pein", art: "raum", stufe: 10, merkmale: ["magical", "mental", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["occultism", 33, 2], ["arcana", 34, 2]],
    wurf: {
      typ: "will", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "mental"), Z("stunned", 1)],
        f: [D("18d8+14", "mental"), Z("stunned", 1), T("der Schmerz hallt nach:", "the pain echoes:"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1"), Z("stupefied", 1, "t1")],
        kf: [D("36d8+28", "mental"), Z("stunned", 3), T("jeder Nerv brennt:", "every nerve burns:"), Z("enfeebled", 2, "t1"), Z("clumsy", 2, "t1"), Z("stupefied", 2, "t1"), Z("sickened", 1, "t1"), T("und die zitternden Hände", "and the trembling hands")]
      }
    },
    aussehen: { de: ["Zitternde Hände", "Die Hände zittern unaufhörlich, auch im Schlaf."], en: ["Trembling Hands", "The hands tremble ceaselessly, even in sleep."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Kammer der Pein", ausloeser: AUS.betreten.de,
      beschreibung: "An den Wänden hängen Ketten und Haken, eingeritzte Runen bilden einen Kreis um den ganzen Raum.",
      wirkung: "Die Runen glühen, und reiner Schmerz fährt durch alle im Wirkungsbereich.",
      entschaerfen: "eine Rune des Kreises zerkratzen und den Zauber lösen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Chamber of Torment", ausloeser: AUS.betreten.en,
      beschreibung: "Chains and hooks hang on the walls, carved runes form a circle around the whole room.",
      wirkung: "The runes glow, and pure pain courses through everyone in the area.",
      entschaerfen: "scratch out one rune of the circle and unravel the spell", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum10-blutregen", art: "raum", stufe: 10, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 33, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["religion", 33, 2], ["occultism", 34, 2]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d8+7", "void"), Z("drained", 1)],
        f: [D("18d8+14", "void"), Z("drained", 1), T("das eigene Blut regnet herab:", "one's own blood rains down:"), Z("enfeebled", 1, "t1"), Z("sickened", 1, "t1")],
        kf: [D("36d8+28", "void"), Z("drained", 3), T("ausgeblutet:", "bled out:"), Z("enfeebled", 2, "t1"), Z("sickened", 1, "t1"), Z("clumsy", 1, "t1"), Z("doomed", 1, "t1"), T("und die roten Sprenkel", "and the red speckles")]
      }
    },
    aussehen: { de: ["Rote Sprenkel", "Feine rote Punkte bedecken die Haut, wo Blut aus den Poren trat."], en: ["Red Speckles", "Fine red dots cover the skin where blood seeped from the pores."], toenung: "#c06060", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Kammer des Blutregens", ausloeser: AUS.betreten.de,
      beschreibung: "Die Decke ist rot verfärbt, und von ihr fallen in langen Abständen dunkle Tropfen.",
      wirkung: "Blut tritt allen im Wirkungsbereich aus den Poren und regnet von der Decke zurück auf sie herab.",
      entschaerfen: "die Rune hinter der Verfärbung bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Chamber of Blood Rain", ausloeser: AUS.betreten.en,
      beschreibung: "The ceiling is stained red, and dark drops fall from it at long intervals.",
      wirkung: "Blood seeps from the pores of everyone in the area and rains from the ceiling back down on them.",
      entschaerfen: "dispel the rune behind the stain", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum10-zeitlos", art: "raum", stufe: 10, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["arcana", 34, 2], ["occultism", 34, 2]],
    wurf: {
      typ: "fortitude", dc: 33, grade: {
        ke: [], e: [D("9d10", "force"), Z("slowed", 1, "r1")],
        f: [D("18d10", "force"), Z("stunned", 1), T("die Zeit läuft zäh:", "time runs thick:"), Z("slowed", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("36d10", "force"), Z("paralyzed", null, "m1"), T("die Zeit bleibt in den Gliedern stehen:", "time stands still in the limbs:"), Z("slowed", 1, "t1"), Z("clumsy", 2, "t1"), Z("stupefied", 1, "t1"), Z("enfeebled", 1, "t1")]
      }
    },
    de: {
      name: "Zeitlose Kammer", ausloeser: AUS.feld.de,
      beschreibung: "Staub hängt reglos in der Luft, und eine Kerzenflamme auf dem Tisch flackert nicht.",
      wirkung: "Die Zeit bleibt stehen und reißt danach alle im Wirkungsbereich mit Wucht weiter.",
      entschaerfen: "die Kerze löschen und die Rune unter dem Tisch bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Timeless Chamber", ausloeser: AUS.feld.en,
      beschreibung: "Dust hangs motionless in the air, and a candle flame on the table does not flicker.",
      wirkung: "Time stands still and then wrenches everyone in the area onward with force.",
      entschaerfen: "snuff the candle and dispel the rune beneath the table", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum10-ruestungen", art: "raum", stufe: 10, merkmale: ["magical", "trap"],
    heimlichkeit: 34, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 34, 2], ["crafting", 34, 2]],
    beschwoerung: { stufe: 13, runden: null, ort: "falle" },
    de: {
      name: "Halle der Rüstungen", ausloeser: AUS.betreten.de,
      beschreibung: "Leere Rüstungen stehen in Reihen an den Wänden, eine davon ist nicht verstaubt.",
      wirkung: "Die saubere Rüstung tritt aus der Reihe: Eine Kreatur bis Stufe 13 erhebt sich und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Rune in der sauberen Rüstung zerkratzen, bevor sie erwacht", ruecksetzen: "Keines."
    },
    en: {
      name: "Hall of Armours", ausloeser: AUS.betreten.en,
      beschreibung: "Empty suits of armour stand in rows along the walls, one of them free of dust.",
      wirkung: "The clean suit steps out of the row: a creature of up to level 13 rises and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "scratch out the rune in the clean suit before it awakens", ruecksetzen: "None."
    }
  }
];
