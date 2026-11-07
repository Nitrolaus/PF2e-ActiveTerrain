// Eigene Fallen Stufe 7 (0.6.0, 07.11.2026: "jetzt Fallen für Stufe 7 bauen"). Maßstab wie Stufe 6, eine Stufe
// härter (Wunsch: "die nächsten Fallen für das nächste Level noch tödlicher und debuffender", "Fallen in PF2e sollen brutal
// sein"): Ein Fehlschlag wirft eine Figur der Stufe 7 um (im Schnitt rund 60 Schaden), ein kritischer Fehlschlag jede.
// Rettungswurf SG 27, Angriff +21, Heimlichkeit 26 bis 29, Entschärfen 26 bis 29, Mindestgrad höchstens Experte.
// Herbeigerufene Gegner bis Stufe 10 (drei Stufen über der Falle wie bei Stufe 5 und 6).
// Lange Zustände (Wunsch: "arbeite mehr mit Zuständen, die länger andauern, blind für 28 Stunden oder versteinert"):
// Jede Falle, die nicht vergiftet oder herbeiruft, hinterlässt etwas für 24 Stunden (t1) oder 1 Woche (w1), der
// kritische Fehlschlag meist für 1 Woche: versteinert, blind, im Zauberschlaf, gealtert, von Gier gebannt.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante", "grabs the edge");

export const STUFE_7 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer7-speerfront", art: "tuer", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 0, wirkung: 5, werte: { rk: 25, haerte: 15, tp: 60 },
    entschaerfen: [["thievery", 27, 2]],
    angriff: { bonus: 21, schaden: [D("8d10+16", "piercing"), D("3d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Speerfront im Türblatt", ausloeser: AUS.tuer.de,
      beschreibung: "Das Türblatt ist ungewöhnlich dick, in der Maserung sitzen feine Löcher in einer Reihe.",
      wirkung: "Speere schießen aus dem Türblatt: je ein Nahkampf-Angriff +21 gegen jede Kreatur im Wirkungsbereich, 8W10+16 Stich und 3W6 anhaltende Blutung. Treffer: Die Spitze reißt Muskeln auf, Kraftlos 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Speer durchbohrt die Schulter: Kraftlos 2 für 1 Woche.",
      entschaerfen: "die Speere durch die Löcher verkeilen", ruecksetzen: "Spannt sich nach 1 Minute selbst."
    },
    en: {
      name: "Spear Front in the Door Leaf", ausloeser: AUS.tuer.en,
      beschreibung: "The door leaf is unusually thick, a row of fine holes sits in the grain.",
      wirkung: "Spears shoot out of the door leaf: one melee Strike +21 against each creature in the area, 8d10+16 piercing and 3d6 persistent bleed. Hit: the tip tears the muscles, enfeebled 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the spear pierces the shoulder: enfeebled 2 for 1 week.",
      entschaerfen: "wedge the spears through the holes", ruecksetzen: "Rewinds itself after 1 minute."
    },
    trefferZ: [Z("enfeebled", 1, "t1")], kritZ: [Z("prone"), Z("enfeebled", 2, "w1")]
  },
  {
    id: "tuer7-fallbeil", art: "tuer", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 26, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 25, haerte: 15, tp: 64 },
    entschaerfen: [["thievery", 26, 1], ["athletics", 28, 0]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("4d10+8", "slashing")],
        f: [D("8d10+16", "slashing"), D("3d6", "bleed", "persistent"), T("die Klinge streift den Arm:", "the blade grazes the arm:"), Z("clumsy", 1, "t1")],
        kf: [D("16d10+32", "slashing"), D("4d6", "bleed", "persistent"), Z("prone"), T("die Klinge trifft die Schulter:", "the blade strikes the shoulder:"), Z("clumsy", 3, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Fallbeil im Türsturz", ausloeser: AUS.tuer.de,
      beschreibung: "Im Türsturz verläuft eine schmale Fuge, auf der Schwelle dunkle Flecken, die keiner weggeschrubbt hat.",
      wirkung: "Ein schweres Beil saust aus dem Sturz herab auf alle, die in der Tür stehen.",
      entschaerfen: "das Beil im Sturz verkeilen", ruecksetzen: "Wird nach 1 Minute von einem Gegengewicht hochgezogen."
    },
    en: {
      name: "Guillotine in the Lintel", ausloeser: AUS.tuer.en,
      beschreibung: "A narrow slot runs along the lintel, dark stains on the threshold that nobody scrubbed away.",
      wirkung: "A heavy blade drops from the lintel onto everyone standing in the doorway.",
      entschaerfen: "wedge the blade in the lintel", ruecksetzen: "A counterweight pulls it back up after 1 minute."
    }
  },
  {
    id: "tuer7-gorgonentuer", art: "tuer", stufe: 7, merkmale: ["magical", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["arcana", 27, 2], ["occultism", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("5d10", "bludgeoning"), Z("slowed", 1, "r1")],
        f: [D("10d10+5", "bludgeoning"), Z("petrified", null, "m1"), T("danach bleiben die Glieder steif:", "then the limbs stay stiff:"), Z("slowed", 1, "t1")],
        kf: [D("20d10+10", "bludgeoning"), T("wird zu Stein:", "turns to stone:"), Z("petrified", null, "w1")]
      }
    },
    de: {
      name: "Gorgonentür", ausloeser: AUS.tuer.de,
      beschreibung: "Ein steinernes Frauengesicht mit Schlangenhaar ist in das Türblatt gemeißelt, die Augen geschlossen.",
      wirkung: "Das Gesicht schlägt die Augen auf, und ihr Blick trifft alle vor der Tür.",
      entschaerfen: "die Augen verbinden und den Zauber lösen", ruecksetzen: "Schließt die Augen nach 10 Minuten und lädt sich neu."
    },
    en: {
      name: "Gorgon Door", ausloeser: AUS.tuer.en,
      beschreibung: "A stone woman's face with snakes for hair is carved into the door leaf, its eyes closed.",
      wirkung: "The face opens its eyes, and its gaze strikes everyone in front of the door.",
      entschaerfen: "blindfold the eyes and unravel the spell", ruecksetzen: "Closes its eyes after 10 minutes and recharges."
    }
  },
  {
    id: "tuer7-donnertuer", art: "tuer", stufe: 7, merkmale: ["magical", "sonic", "auditory", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["arcana", 27, 2], ["thievery", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("6d10", "sonic"), Z("deafened", null, "m1")],
        f: [D("12d10", "sonic"), Z("stunned", 1), Z("deafened", null, "t1")],
        kf: [D("24d10", "sonic"), Z("prone"), Z("stunned", 3), T("die Trommelfelle reißen:", "the eardrums burst:"), Z("deafened", null, "w1"), T("und das Gleichgewicht ist gestört:", "and the balance is gone:"), Z("clumsy", 1, "t1")]
      }
    },
    de: {
      name: "Donnernde Tür", ausloeser: AUS.tuer.de,
      beschreibung: "Bronzene Beschläge in Form von Hörnern, das Holz dazwischen ist rissig, als hätte es gebebt.",
      wirkung: "Ein Donnerschlag bricht aus der Tür und fegt durch den Gang.",
      entschaerfen: "die Hörner mit Wachs verschließen und die Rune bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Thundering Door", ausloeser: AUS.tuer.en,
      beschreibung: "Bronze fittings shaped like horns, the wood between them cracked as if it had quaked.",
      wirkung: "A thunderclap bursts from the door and sweeps through the corridor.",
      entschaerfen: "seal the horns with wax and dispel the rune", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer7-blutsiegel", art: "tuer", stufe: 7, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 0, wirkung: 5, werte: null,
    entschaerfen: [["religion", 27, 2], ["occultism", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "void")],
        f: [D("12d8+8", "void"), Z("drained", 2), Z("enfeebled", 2, "t1")],
        kf: [D("24d8+16", "void"), Z("drained", 3), Z("doomed", 2, "w1"), T("und das Blutmal", "and the blood mark")]
      }
    },
    aussehen: { de: ["Blutmal", "Ein dunkelrotes Zeichen brennt auf der Stirn und lässt sich nicht abwaschen."], en: ["Blood Mark", "A dark red sign burns on the forehead and will not wash off."], toenung: "#a04040", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Blutsiegel", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Klinke ein Siegel aus getrocknetem Blut, das an den Rändern frisch glänzt.",
      wirkung: "Das Siegel trinkt vom Blut aller, die vor der Tür stehen.",
      entschaerfen: "das Siegel mit geweihtem Wasser lösen", ruecksetzen: "Lädt sich auf, sobald wieder Blut daran kommt."
    },
    en: {
      name: "Blood Seal", ausloeser: AUS.tuer.en,
      beschreibung: "Above the handle a seal of dried blood that gleams fresh at the edges.",
      wirkung: "The seal drinks the blood of everyone standing in front of the door.",
      entschaerfen: "unravel the seal with holy water", ruecksetzen: "Recharges as soon as blood touches it again."
    }
  },
  {
    id: "tuer7-schlafdorn", art: "tuer", stufe: 7, merkmale: ["magical", "mental", "curse", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 27, 2], ["arcana", 28, 2]],
    wurf: {
      typ: "will", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "mental"), Z("stupefied", 1, "m1")],
        f: [D("12d8+8", "mental"), Z("slowed", 1, "m1"), Z("stupefied", 2, "t1")],
        kf: [D("24d8+16", "mental"), T("sinkt in einen Zauberschlaf:", "sinks into an enchanted sleep:"), Z("unconscious", null, "t1"), T("weder Lärm noch Schmerz wecken sie, nur ein Bann oder das Ende der Laufzeit", "neither noise nor pain wake it, only a dispel or the end of the duration")]
      }
    },
    de: {
      name: "Fluch des Schlafdorns", ausloeser: AUS.tuer.de,
      beschreibung: "Eine verdorrte Dornenranke ist um die Klinke gewunden, ihre Spitzen sind silbern.",
      wirkung: "Die Dornen ritzen die Hand, und ein schwerer Schlaf greift nach allen vor der Tür.",
      entschaerfen: "die Ranke mit einer Silberklinge abschneiden", ruecksetzen: "Wächst in 1 Woche nach."
    },
    en: {
      name: "Curse of the Sleeping Thorn", ausloeser: AUS.tuer.en,
      beschreibung: "A withered thorn vine is wound around the handle, its tips silver.",
      wirkung: "The thorns scratch the hand, and a heavy sleep reaches for everyone in front of the door.",
      entschaerfen: "cut the vine with a silver blade", ruecksetzen: "Grows back in 1 week."
    }
  },
  {
    id: "tuer7-oelflut", art: "tuer", stufe: 7, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 26, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 23, haerte: 9, tp: 36 },
    entschaerfen: [["thievery", 26, 1], ["crafting", 27, 2]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("7d6", "fire")],
        f: [D("14d6", "fire"), D("4d6", "fire", "persistent"), T("Brandwunden:", "burns:"), Z("clumsy", 1, "t1")],
        kf: [D("28d6", "fire"), D("6d6", "fire", "persistent"), Z("prone"), T("schwere Brandwunden:", "severe burns:"), Z("clumsy", 2, "w1"), Z("sickened", 1, "t1")]
      }
    },
    de: {
      name: "Brennende Ölflut", ausloeser: AUS.tuer.de,
      beschreibung: "Es riecht nach Lampenöl, über der Tür hängt ein Kessel hinter einer Blende, daneben ein Feuerstein an einer Feder.",
      wirkung: "Der Kessel kippt, brennendes Öl ergießt sich über alle vor der Tür. Der Boden brennt danach 1 Minute lang.",
      entschaerfen: "den Feuerstein abklemmen und das Öl ablassen", ruecksetzen: "Kessel neu füllen."
    },
    en: {
      name: "Burning Oil Flood", ausloeser: AUS.tuer.en,
      beschreibung: "It smells of lamp oil, a cauldron hangs behind a panel above the door, a flint on a spring beside it.",
      wirkung: "The cauldron tips, burning oil pours over everyone in front of the door. The floor keeps burning for 1 minute.",
      entschaerfen: "clamp the flint and drain the oil", ruecksetzen: "Refill the cauldron."
    }
  },
  {
    id: "tuer7-kerkermeister", art: "tuer", stufe: 7, merkmale: ["magical", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 27, 2], ["religion", 28, 2]],
    beschwoerung: { stufe: 10, runden: 10, ort: "neben" },
    de: {
      name: "Ruf des Kerkermeisters", ausloeser: AUS.tuer.de,
      beschreibung: "Ein schwerer Eisenring hängt als Klopfer an der Tür, in ihn sind Namen geritzt.",
      wirkung: "Der Ring schlägt von selbst gegen die Tür und ruft ihren Hüter: Eine Kreatur bis Stufe 10 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Tür geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Ring festbinden und die Namen tilgen", ruecksetzen: "Keines."
    },
    en: {
      name: "Call of the Jailer", ausloeser: AUS.tuer.en,
      beschreibung: "A heavy iron ring hangs on the door as a knocker, names scratched into it.",
      wirkung: "The ring knocks against the door by itself and calls its keeper: a creature of up to level 10 appears in a free square next to the door and rolls initiative at once. It attacks whoever opened the door first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "tie down the ring and erase the names", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss7-skorpionstachel", art: "schloss", stufe: 7, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 25, haerte: 7, tp: 28 },
    entschaerfen: [["thievery", 27, 2]],
    gift: {
      typ: "fortitude", dc: 27, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("6d6", "poison"), Z("enfeebled", 1, "r1")],
        [D("8d6", "poison"), Z("enfeebled", 2, "r1"), Z("clumsy", 1, "r1")],
        [D("10d6", "poison"), Z("paralyzed", null, "r1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Skorpionstachel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein gebogener Stachel aus schwarzem Chitin steckt im Schloss, an der Spitze ein gelber Tropfen.",
      wirkung: "Der Stachel schnellt hervor und sticht in die Hand. Skorpiongift.", gift: "Skorpiongift",
      entschaerfen: "den Stachel abbrechen, ohne ihn zu berühren", ruecksetzen: "Stachel neu vergiften."
    },
    en: {
      name: "Scorpion Sting", ausloeser: AUS.schloss.en,
      beschreibung: "A curved sting of black chitin sits in the lock, a yellow drop at its tip.",
      wirkung: "The sting snaps out and pricks the hand. Scorpion venom.", gift: "Scorpion venom",
      entschaerfen: "break off the sting without touching it", ruecksetzen: "Poison the sting again."
    }
  },
  {
    id: "schloss7-fingerbrecher", art: "schloss", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 26, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 25, haerte: 15, tp: 60 },
    entschaerfen: [["thievery", 26, 1]],
    angriff: { bonus: 21, schaden: [D("8d8+18", "bludgeoning"), D("3d6", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Fingerbrecher", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schlüsselloch ist auffällig breit, dahinter liegen zwei gezahnte Eisenbacken.",
      wirkung: "Die Backen schnappen um die Hand am Schloss zu: Nahkampf-Angriff +21, 8W8+18 Wucht und 3W6 anhaltende Blutung. Treffer: Die Finger sind gequetscht, Unbeholfen 2 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, die Hand ist zertrümmert: Unbeholfen 3 und Kraftlos 1 für 1 Woche.",
      entschaerfen: "die Backen mit einem Keil offen halten", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Finger Breaker", ausloeser: AUS.schloss.en,
      beschreibung: "The keyhole is strikingly wide, two toothed iron jaws lie behind it.",
      wirkung: "The jaws snap shut around the hand at the lock: melee Strike +21, 8d8+18 bludgeoning and 3d6 persistent bleed. Hit: the fingers are crushed, clumsy 2 for 24 hours.",
      krit: "Critical hit: double damage, the hand is shattered: clumsy 3 and enfeebled 1 for 1 week.",
      entschaerfen: "keep the jaws open with a wedge", ruecksetzen: "Rearm by hand."
    },
    trefferZ: [Z("clumsy", 2, "t1")], kritZ: [Z("clumsy", 3, "w1"), Z("enfeebled", 1, "w1")]
  },
  {
    id: "schloss7-schattensiegel", art: "schloss", stufe: 7, merkmale: ["magical", "void", "darkness", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["occultism", 27, 2], ["arcana", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "void"), Z("dazzled", null, "m1")],
        f: [D("12d8+8", "void"), Z("blinded", null, "m1"), T("danach", "then"), Z("dazzled", null, "w1")],
        kf: [D("24d8+16", "void"), T("die Augen werden schwarz:", "the eyes turn black:"), Z("blinded", null, "w1"), T("und die schwarzen Augen", "and the black eyes")]
      }
    },
    aussehen: { de: ["Schwarze Augen", "Die Augen sind ganz schwarz, ohne Weiß und ohne Iris."], en: ["Black Eyes", "The eyes are entirely black, without white or iris."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Schattensiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel aus mattschwarzem Wachs, das kein Licht zurückwirft.",
      wirkung: "Das Siegel bricht, und Schatten fahren in die Augen aller in der Nähe.",
      entschaerfen: "das Siegel in hellem Licht lösen", ruecksetzen: "Lädt sich in der nächsten mondlosen Nacht neu."
    },
    en: {
      name: "Shadow Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A seal of matte black wax that reflects no light.",
      wirkung: "The seal breaks, and shadows dive into the eyes of everyone nearby.",
      entschaerfen: "unravel the seal in bright light", ruecksetzen: "Recharges on the next moonless night."
    }
  },
  {
    id: "schloss7-gierfluch", art: "schloss", stufe: 7, merkmale: ["magical", "mental", "curse", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["occultism", 27, 2], ["religion", 28, 2]],
    wurf: {
      typ: "will", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "mental"), Z("fascinated", null, "r1")],
        f: [D("12d8+8", "mental"), Z("fascinated", null, "m1"), Z("stupefied", 2, "t1")],
        kf: [D("24d8+16", "mental"), T("verfällt der Gier und will sich nicht vom Schatz entfernen:", "falls prey to greed and will not leave the treasure:"), Z("fascinated", null, "t1"), Z("stupefied", 2, "w1"), T("und die Goldgier", "and the gold lust")]
      }
    },
    aussehen: { de: ["Goldgier", "Die Augen glänzen fiebrig, die Finger tasten ständig nach dem Geldbeutel."], en: ["Gold Lust", "The eyes gleam feverishly, the fingers keep groping for the purse."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Fluch der Gier", ausloeser: AUS.schloss.de,
      beschreibung: "Ein goldenes Schloss, viel zu kostbar für die Truhe, in die es eingesetzt ist.",
      wirkung: "Gier frisst sich in den Geist der Kreatur am Schloss.",
      entschaerfen: "das Gold abkratzen, ohne es zu begehren", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Curse of Greed", ausloeser: AUS.schloss.en,
      beschreibung: "A golden lock, far too precious for the chest it is set into.",
      wirkung: "Greed eats into the mind of the creature at the lock.",
      entschaerfen: "scrape off the gold without coveting it", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "schloss7-knochenbrecher", art: "schloss", stufe: 7, merkmale: ["magical", "force", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 27, 2], ["thievery", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("6d10", "force"), Z("prone")],
        f: [D("12d10", "force"), Z("prone"), T("Knochen angebrochen:", "bones cracked:"), Z("enfeebled", 2, "t1")],
        kf: [D("24d10", "force"), Z("prone"), T("Knochen splittern:", "bones splinter:"), Z("enfeebled", 3, "w1"), Z("slowed", 1, "w1")]
      }
    },
    de: {
      name: "Knochenbrecher-Siegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel aus gebleichtem Knochen, in das ein zerbrochenes Gerippe geritzt ist.",
      wirkung: "Eine unsichtbare Faust zermalmt die Kreatur am Schloss.",
      entschaerfen: "das Siegel bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Bonebreaker Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A seal of bleached bone, a broken skeleton scratched into it.",
      wirkung: "An invisible fist crushes the creature at the lock.",
      entschaerfen: "dispel the seal", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "schloss7-zeitsiegel", art: "schloss", stufe: 7, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 28, 2], ["occultism", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "void"), Z("slowed", 1, "r1")],
        f: [D("12d8+8", "void"), Z("slowed", 1, "m1"), T("die Jahre zehren:", "the years gnaw:"), Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("24d8+16", "void"), T("altert um Jahrzehnte:", "ages by decades:"), Z("drained", 2), Z("enfeebled", 2, "w1"), Z("clumsy", 2, "w1"), T("und das ergraute Haar", "and the greyed hair")]
      }
    },
    aussehen: { de: ["Ergrautes Haar", "Das Haar ist schlohweiß, tiefe Falten zeichnen das Gesicht, als wären Jahrzehnte vergangen."], en: ["Greyed Hair", "The hair is snow white, deep wrinkles line the face, as if decades had passed."], toenung: "#d8d4c8", dauer: { value: 30, unit: "days" } },
    de: {
      name: "Siegel der verlorenen Jahre", ausloeser: AUS.schloss.de,
      beschreibung: "Eine kleine Sanduhr ist in das Schlossblech eingelassen, der Sand darin steht still.",
      wirkung: "Der Sand rinnt, und die Zeit stürzt auf die Kreatur am Schloss ein.",
      entschaerfen: "die Sanduhr anhalten, ohne sie umzudrehen", ruecksetzen: "Lädt sich nach 1 Woche neu."
    },
    en: {
      name: "Seal of Lost Years", ausloeser: AUS.schloss.en,
      beschreibung: "A small hourglass is set into the lock plate, the sand in it stands still.",
      wirkung: "The sand runs, and time crashes down on the creature at the lock.",
      entschaerfen: "stop the hourglass without turning it", ruecksetzen: "Recharges after 1 week."
    }
  },
  {
    id: "schloss7-wuergegas", art: "schloss", stufe: 7, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: "knopf", wirkung: 10, werte: { rk: 23, haerte: 7, tp: 28 },
    entschaerfen: [["thievery", 27, 2], ["crafting", 26, 1]],
    gift: {
      typ: "fortitude", dc: 27, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("6d6", "poison"), Z("sickened", 1)],
        [D("8d6", "poison"), Z("sickened", 2), Z("slowed", 1)],
        [D("10d6", "poison"), Z("sickened", 3), Z("blinded", null, "r1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Würgegas-Phiole", ausloeser: AUS.schloss.de,
      beschreibung: "Hinter dem Schlossblech klirrt beim Rütteln leise Glas.",
      wirkung: "Eine Phiole zerbricht, grünliches Gas quillt aus allen Fugen und füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Würgegas.", gift: "Würgegas",
      entschaerfen: "die Phiole durch das Schlüsselloch sichern", ruecksetzen: "Neue Phiole einsetzen."
    },
    en: {
      name: "Choking Gas Vial", ausloeser: AUS.schloss.en,
      beschreibung: "Glass clinks softly behind the lock plate when it is shaken.",
      wirkung: "A vial shatters, greenish gas pours from every joint and fills the area for 1 minute. A creature starting its turn inside rolls again. Choking gas.", gift: "Choking gas",
      entschaerfen: "secure the vial through the keyhole", ruecksetzen: "Insert a new vial."
    }
  },
  {
    id: "schloss7-kerkersiegel", art: "schloss", stufe: 7, merkmale: ["magical", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 28, 2], ["thievery", 29, 2]],
    beschwoerung: { stufe: 10, runden: 10, ort: "neben" },
    de: {
      name: "Kerkersiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Vorhängeschloss aus dunklem Eisen, in das eine winzige Zelle mit Gittern geschmiedet ist.",
      wirkung: "Das Schloss springt auf und mit ihm die Zelle darin: Eine Kreatur bis Stufe 10 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer das Schloss geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Gitter der Zelle verstärken, bevor sie aufgehen", ruecksetzen: "Keines."
    },
    en: {
      name: "Prison Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A padlock of dark iron with a tiny barred cell forged into it.",
      wirkung: "The lock springs open and with it the cell inside: a creature of up to level 10 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever opened the lock first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "reinforce the bars of the cell before they open", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende7-wolfsgrube", art: "gelaende", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 26, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 26, 1], ["thievery", 26, 1]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 40 Fuß tief auf angespitzte Pfähle", "falls 40 feet onto sharpened stakes"), D("20", "bludgeoning"), D("6d8+16", "piercing"), D("2d8", "bleed", "persistent"), Z("prone"), T("der Knöchel verstaucht:", "the ankle sprained:"), Z("clumsy", 1, "t1")],
        kf: [T("stürzt und wird aufgespießt", "falls and is impaled"), D("20", "bludgeoning"), D("12d8+32", "piercing"), D("3d8", "bleed", "persistent"), Z("immobilized"), T("bis Entkommen SG 27, ein Bein gebrochen:", "until it Escapes (DC 27), a leg broken:"), Z("slowed", 1, "w1")]
      }
    },
    de: {
      name: "Wolfsgrube", ausloeser: AUS.betreten.de,
      beschreibung: "Eine mit Reisig und Erde abgedeckte Grube, 40 Fuß tief, am Boden angespitzte Pfähle.",
      wirkung: "Die Abdeckung bricht ein. Herausklettern Athletik SG 27.",
      entschaerfen: "die Abdeckung sichtbar machen und überbrücken", ruecksetzen: "Neu abdecken."
    },
    en: {
      name: "Wolf Pit", ausloeser: AUS.betreten.en,
      beschreibung: "A pit covered with brushwood and earth, 40 feet deep, sharpened stakes at the bottom.",
      wirkung: "The cover gives way. Climbing out takes Athletics DC 27.",
      entschaerfen: "expose the cover and bridge it", ruecksetzen: "Cover it again."
    }
  },
  {
    id: "gelaende7-felslawine", art: "gelaende", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 26, rang: 1, ausloeser: 0, wirkung: 20, werte: null,
    entschaerfen: [["survival", 26, 1], ["thievery", 27, 1]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("4d10+8", "bludgeoning")],
        f: [D("9d10+16", "bludgeoning"), Z("prone"), T("geprellt:", "bruised:"), Z("enfeebled", 1, "t1")],
        kf: [D("18d10+32", "bludgeoning"), T("verschüttet", "buried"), Z("immobilized"), T("bis Athletik SG 27, 2W10 Wucht zu Beginn jedes ihrer Züge, Rippen gebrochen:", "until Athletics DC 27, 2d10 bludgeoning at the start of each of its turns, ribs broken:"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Felslawine", ausloeser: AUS.feld.de,
      beschreibung: "Am Hang über dem Pfad liegt Geröll hinter einem Holzgatter, ein Stolperseil hält es.",
      wirkung: "Das Gatter fällt, und Felsbrocken donnern über den Pfad. Der Wirkungsbereich wird schwieriges Gelände.",
      entschaerfen: "das Seil entlasten und das Gatter verkeilen", ruecksetzen: "Keines."
    },
    en: {
      name: "Rockslide", ausloeser: AUS.feld.en,
      beschreibung: "Rubble lies behind a wooden gate on the slope above the path, held by a tripwire.",
      wirkung: "The gate falls, and boulders thunder across the path. The area becomes difficult terrain.",
      entschaerfen: "take the load off the wire and wedge the gate", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende7-stachelbaum", art: "gelaende", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 5, wirkung: 10, werte: { rk: 25, haerte: 12, tp: 52 },
    entschaerfen: [["thievery", 27, 2], ["survival", 27, 1]],
    angriff: { bonus: 21, schaden: [D("8d10+16", "piercing"), D("2d8", "bleed", "persistent")], hoechstens: null, nah: true },
    de: {
      name: "Schwingender Stachelbaum", ausloeser: AUS.betreten.de,
      beschreibung: "Ein mit Eisendornen gespickter Stamm hängt in den Baumkronen, ein Draht läuft dicht über den Boden.",
      wirkung: "Der Stamm schwingt herab und fegt über den Pfad: je ein Nahkampf-Angriff +21 gegen jede Kreatur im Wirkungsbereich, 8W10+16 Stich und 2W8 anhaltende Blutung. Treffer: Liegend.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und die Dornen reißen tief: Kraftlos 2 und Verlangsamt 1 für 24 Stunden.",
      entschaerfen: "den Draht entlasten und den Stamm festbinden", ruecksetzen: "Stamm hochziehen (10 Minuten)."
    },
    en: {
      name: "Swinging Spiked Log", ausloeser: AUS.betreten.en,
      beschreibung: "A log studded with iron spikes hangs in the treetops, a wire runs just above the ground.",
      wirkung: "The log swings down and sweeps across the path: one melee Strike +21 against each creature in the area, 8d10+16 piercing and 2d8 persistent bleed. Hit: prone.",
      krit: "Critical hit: double damage, prone, and the spikes tear deep: enfeebled 2 and slowed 1 for 24 hours.",
      entschaerfen: "take the load off the wire and tie down the log", ruecksetzen: "Haul the log back up (10 minutes)."
    },
    trefferZ: [Z("prone")], kritZ: [Z("prone"), Z("enfeebled", 2, "t1"), Z("slowed", 1, "t1")]
  },
  {
    id: "gelaende7-schlafmohn", art: "gelaende", stufe: 7, merkmale: ["environmental", "poison", "inhaled"],
    heimlichkeit: 26, rang: 1, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["nature", 26, 1], ["survival", 27, 1]],
    gift: {
      typ: "fortitude", dc: 27, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("6d6", "poison"), Z("stupefied", 1)],
        [D("8d6", "poison"), Z("stupefied", 2), Z("slowed", 1)],
        [D("10d6", "poison"), Z("unconscious"), T("bis das Gift endet", "until the poison ends")]
      ]
    },
    de: {
      name: "Feld aus Schlafmohn", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Wiese voller dunkelroter Mohnblüten, über der ein süßer, schwerer Duft liegt.",
      wirkung: "Wer hindurchgeht, wirbelt den Blütenstaub auf; er hängt 1 Minute in der Luft. Wer eine Runde darin beginnt, würfelt erneut. Mohnstaub.", gift: "Mohnstaub",
      entschaerfen: "eine Schneise mähen oder den Staub mit Wasser binden", ruecksetzen: "Blüht im nächsten Sommer neu."
    },
    en: {
      name: "Field of Sleep Poppies", ausloeser: AUS.betreten.en,
      beschreibung: "A meadow full of dark red poppies, a sweet, heavy scent hanging above it.",
      wirkung: "Walking through stirs up the pollen; it hangs in the air for 1 minute. A creature starting its turn inside rolls again. Poppy dust.", gift: "Poppy dust",
      entschaerfen: "mow a path or bind the dust with water", ruecksetzen: "Blooms again next summer."
    }
  },
  {
    id: "gelaende7-eisbruch", art: "gelaende", stufe: 7, merkmale: ["environmental", "cold"],
    heimlichkeit: 26, rang: 1, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["survival", 26, 1], ["nature", 27, 1]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("5d10", "cold"), Z("slowed", 1, "r1")],
        f: [T("bricht ins eisige Wasser ein", "breaks into the icy water"), D("11d10", "cold"), Z("slowed", 1, "m1"), T("unterkühlt:", "chilled:"), Z("clumsy", 1, "t1")],
        kf: [T("treibt unter das Eis", "drifts under the ice"), D("22d10", "cold"), Z("immobilized"), T("bis Athletik SG 27, 2W10 Kälte zu Beginn jedes ihrer Züge, danach Fieber:", "until Athletics DC 27, 2d10 cold at the start of each of its turns, then fever:"), Z("sickened", 1, "w1"), Z("drained", 1), T("und der Fieberglanz", "and the fever sheen")]
      }
    },
    aussehen: { de: ["Fieberglanz", "Glasige Augen, blaue Lippen und ein Husten, der nicht weggeht."], en: ["Fever Sheen", "Glassy eyes, blue lips and a cough that will not go away."], toenung: "#b0c4d8", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Brüchiges Eis", ausloeser: AUS.feld.de,
      beschreibung: "Ein zugefrorener See oder Fluss, Schnee verdeckt die Stellen, an denen das Eis dünn ist.",
      wirkung: "Das Eis bricht unter allen im Wirkungsbereich.",
      entschaerfen: "die dünnen Stellen finden und markieren", ruecksetzen: "Friert in der nächsten kalten Nacht wieder zu."
    },
    en: {
      name: "Brittle Ice", ausloeser: AUS.feld.en,
      beschreibung: "A frozen lake or river, snow hides the places where the ice is thin.",
      wirkung: "The ice breaks beneath everyone in the area.",
      entschaerfen: "find and mark the thin places", ruecksetzen: "Freezes over again on the next cold night."
    }
  },
  {
    id: "gelaende7-sternenfall", art: "gelaende", stufe: 7, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 27, 2], ["nature", 28, 2]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("4d6", "fire"), D("4d6", "bludgeoning"), Z("prone")],
        f: [D("9d6", "fire"), D("9d6", "bludgeoning"), Z("prone"), Z("dazzled", null, "t1")],
        kf: [D("18d6", "fire"), D("18d6", "bludgeoning"), Z("prone"), Z("blinded", null, "t1"), T("Brandnarben:", "burn scars:"), Z("clumsy", 1, "w1"), T("und das Sternenmal", "and the star mark")]
      }
    },
    aussehen: { de: ["Sternenmal", "Feine, silbrig glimmende Narben ziehen sich wie Sternbilder über die Haut."], en: ["Star Mark", "Fine, silvery glowing scars run across the skin like constellations."], toenung: "#c8b8ff", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Sternenfallrune", ausloeser: AUS.betreten.de,
      beschreibung: "Ein verkohlter Krater, in seiner Mitte ein Stein mit einer Rune aus Sternzeichen.",
      wirkung: "Brennende Splitter stürzen vom Himmel in den Wirkungsbereich.",
      entschaerfen: "die Rune bannen oder den Stein umdrehen", ruecksetzen: "Lädt sich in der nächsten klaren Nacht neu."
    },
    en: {
      name: "Starfall Rune", ausloeser: AUS.betreten.en,
      beschreibung: "A charred crater, at its centre a stone bearing a rune of star signs.",
      wirkung: "Burning shards plunge from the sky into the area.",
      entschaerfen: "dispel the rune or turn the stone over", ruecksetzen: "Recharges on the next clear night."
    }
  },
  {
    id: "gelaende7-klagestein", art: "gelaende", stufe: 7, merkmale: ["magical", "mental", "auditory", "fear", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["religion", 27, 2], ["occultism", 28, 2]],
    wurf: {
      typ: "will", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "mental"), Z("frightened", 1)],
        f: [D("12d8+8", "mental"), Z("frightened", 2), Z("stupefied", 1, "t1")],
        kf: [D("24d8+16", "mental"), Z("frightened", 3), T("die Totenklage folgt ihr:", "the death wail follows it:"), Z("doomed", 1, "w1"), Z("deafened", null, "t1")]
      }
    },
    de: {
      name: "Klagestein", ausloeser: AUS.feld.de,
      beschreibung: "Ein mannshoher Stein am Wegrand, ausgehöhlt vom Wind, darin ein Gesicht wie aus Wachs.",
      wirkung: "Der Stein erhebt eine Totenklage, die bis ins Mark dringt.",
      entschaerfen: "die Höhlung mit geweihter Erde füllen", ruecksetzen: "Klagt in der nächsten Nacht wieder."
    },
    en: {
      name: "Wailing Stone", ausloeser: AUS.feld.en,
      beschreibung: "A man-high stone by the wayside, hollowed by the wind, a face like wax within.",
      wirkung: "The stone raises a death wail that pierces to the marrow.",
      entschaerfen: "fill the hollow with consecrated earth", ruecksetzen: "Wails again the next night."
    }
  },
  {
    id: "gelaende7-huegelgrab", art: "gelaende", stufe: 7, merkmale: ["magical", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 28, 2], ["arcana", 28, 2]],
    beschwoerung: { stufe: 10, runden: null, ort: "falle" },
    de: {
      name: "Offenes Hügelgrab", ausloeser: AUS.betreten.de,
      beschreibung: "Ein flaches, grasbewachsenes Hügelgrab, der Stein vor dem Eingang ist eingesunken.",
      wirkung: "Wer das Grab betritt, weckt seinen Bewohner: Eine Kreatur bis Stufe 10 erhebt sich am Eingang des Grabs und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Stein aufrichten und die Totenriten sprechen", ruecksetzen: "Keines."
    },
    en: {
      name: "Open Barrow", ausloeser: AUS.betreten.en,
      beschreibung: "A low, grass-covered barrow, the stone before the entrance has sunk.",
      wirkung: "Whoever enters the barrow wakes its occupant: a creature of up to level 10 rises at the entrance of the barrow and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "raise the stone and speak the funeral rites", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum7-presswand", art: "raum", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 5, wirkung: 10, werte: { rk: 25, haerte: 15, tp: 64 },
    entschaerfen: [["thievery", 27, 2], ["crafting", 27, 2]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("4d10+8", "bludgeoning")],
        f: [D("9d10+16", "bludgeoning"), Z("immobilized"), T("eingeklemmt bis Athletik SG 27, gequetscht:", "pinned until Athletics DC 27, crushed:"), Z("enfeebled", 1, "t1")],
        kf: [D("18d10+32", "bludgeoning"), Z("immobilized"), T("zwischen den Wänden eingeklemmt bis Athletik SG 27, 2W10 Wucht zu Beginn jedes ihrer Züge, der Brustkorb gequetscht:", "pinned between the walls until Athletics DC 27, 2d10 bludgeoning at the start of each of its turns, the chest crushed:"), Z("enfeebled", 2, "w1"), Z("slowed", 1, "t1")]
      }
    },
    de: {
      name: "Pressende Wände", ausloeser: AUS.betreten.de,
      beschreibung: "Ein enger Gang, die Wände stehen auf Schienen, am Boden Schleifspuren.",
      wirkung: "Die Wände schieben sich zusammen und pressen alle im Wirkungsbereich ein. Sie weichen nach 1 Minute zurück.",
      entschaerfen: "die Schienen verkeilen", ruecksetzen: "Setzt sich nach 1 Minute selbst zurück."
    },
    en: {
      name: "Crushing Walls", ausloeser: AUS.betreten.en,
      beschreibung: "A narrow corridor, the walls stand on rails, drag marks on the floor.",
      wirkung: "The walls slide together and pin everyone in the area. They withdraw after 1 minute.",
      entschaerfen: "wedge the rails", ruecksetzen: "Resets itself after 1 minute."
    }
  },
  {
    id: "raum7-bolzenkammer", art: "raum", stufe: 7, merkmale: ["mechanical", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 25, haerte: 12, tp: 52 },
    entschaerfen: [["thievery", 27, 2]],
    angriff: { bonus: 21, schaden: [D("8d10+16", "piercing"), D("3d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Bolzenkammer", ausloeser: AUS.platte.de,
      beschreibung: "Die Wände sind mit Reliefs von Kriegern bedeckt, in deren Schilden kleine Öffnungen sitzen.",
      wirkung: "Aus den Schilden schießen Bolzen: je ein Fernkampf-Angriff +21 gegen jede Kreatur im Wirkungsbereich, 8W10+16 Stich und 3W6 anhaltende Blutung.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Bolzen steckt im Knie: Verlangsamt 1 für 24 Stunden.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Magazine neu füllen (10 Minuten)."
    },
    en: {
      name: "Bolt Chamber", ausloeser: AUS.platte.en,
      beschreibung: "The walls are covered with reliefs of warriors, small openings in their shields.",
      wirkung: "Bolts shoot out of the shields: one ranged Strike +21 against each creature in the area, 8d10+16 piercing and 3d6 persistent bleed.",
      krit: "Critical hit: double damage, prone, and the bolt lodges in the knee: slowed 1 for 24 hours.",
      entschaerfen: "wedge the plate", ruecksetzen: "Refill the magazines (10 minutes)."
    },
    kritZ: [Z("prone"), Z("slowed", 1, "t1")]
  },
  {
    id: "raum7-dampfkammer", art: "raum", stufe: 7, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 23, haerte: 10, tp: 40 },
    entschaerfen: [["thievery", 27, 2], ["crafting", 26, 1]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("7d6", "fire"), Z("dazzled", null, "m1")],
        f: [D("14d6", "fire"), D("4d6", "fire", "persistent"), Z("dazzled", null, "t1"), T("verbrüht:", "scalded:"), Z("clumsy", 1, "t1")],
        kf: [D("28d6", "fire"), D("6d6", "fire", "persistent"), T("der Dampf trifft die Augen:", "the steam hits the eyes:"), Z("blinded", null, "t1"), Z("clumsy", 2, "w1"), T("und die verbrühte Haut", "and the scalded skin")]
      }
    },
    aussehen: { de: ["Verbrühte Haut", "Rote, nässende Blasen auf Gesicht und Händen."], en: ["Scalded Skin", "Red, weeping blisters on face and hands."], toenung: "#d98c8c", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Dampfkammer", ausloeser: AUS.betreten.de,
      beschreibung: "Feuchte Wände, Kupferrohre hinter Gittern, irgendwo unter dem Boden brodelt es.",
      wirkung: "Kochender Dampf schießt aus den Rohren und füllt den Raum.",
      entschaerfen: "die Ventile schließen", ruecksetzen: "Kessel heizt in 10 Minuten nach."
    },
    en: {
      name: "Steam Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "Damp walls, copper pipes behind grates, something boiling somewhere beneath the floor.",
      wirkung: "Scalding steam shoots from the pipes and fills the room.",
      entschaerfen: "close the valves", ruecksetzen: "The boiler heats up again in 10 minutes."
    }
  },
  {
    id: "raum7-leichengas", art: "raum", stufe: 7, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 26, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 23, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 27, 2], ["crafting", 26, 1]],
    gift: {
      typ: "fortitude", dc: 27, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("6d6", "poison"), Z("sickened", 1)],
        [D("8d6", "poison"), Z("sickened", 2), Z("drained", 1)],
        [D("10d6", "poison"), Z("sickened", 3), Z("drained", 2), Z("blinded", null, "r1")]
      ]
    },
    de: {
      name: "Leichengas-Gruft", ausloeser: AUS.betreten.de,
      beschreibung: "Eine Gruft mit versiegelten Nischen, in den Fugen der Siegel klebt schwarzer Schleim.",
      wirkung: "Die Siegel platzen, und Leichengas füllt den Raum für 1 Minute, die Türen fallen zu (Diebeskunst SG 27 oder Athletik SG 29 zum Aufbrechen). Wer eine Runde darin beginnt, würfelt erneut. Leichengas.", gift: "Leichengas",
      entschaerfen: "die Siegel mit Wachs verstärken", ruecksetzen: "Gas sammelt sich in 1 Woche neu."
    },
    en: {
      name: "Corpse Gas Crypt", ausloeser: AUS.betreten.en,
      beschreibung: "A crypt with sealed niches, black slime sticking in the joints of the seals.",
      wirkung: "The seals burst, and corpse gas fills the room for 1 minute, the doors slam shut (Thievery DC 27 or Athletics DC 29 to force them). A creature starting its turn inside rolls again. Corpse gas.", gift: "Corpse gas",
      entschaerfen: "reinforce the seals with wax", ruecksetzen: "The gas builds up again in 1 week."
    }
  },
  {
    id: "raum7-schwerkraft", art: "raum", stufe: 7, merkmale: ["magical", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 27, 2], ["occultism", 28, 2]],
    wurf: {
      typ: "fortitude", dc: 27, grade: {
        ke: [], e: [D("6d8+6", "bludgeoning"), Z("prone")],
        f: [D("12d8+12", "bludgeoning"), Z("prone"), Z("slowed", 1, "m1"), T("die Gelenke gestaucht:", "the joints compressed:"), Z("clumsy", 1, "t1")],
        kf: [D("24d8+24", "bludgeoning"), Z("prone"), Z("immobilized"), T("1 Minute an den Boden gepresst, Knochen gestaucht:", "pressed to the floor for 1 minute, bones crushed:"), Z("clumsy", 2, "w1"), Z("slowed", 1, "t1")]
      }
    },
    de: {
      name: "Kammer der Schwere", ausloeser: AUS.betreten.de,
      beschreibung: "Der Boden ist zu einer flachen Schale gesenkt, Möbel und Knochen liegen platt gedrückt darin.",
      wirkung: "Die Schwerkraft vervielfacht sich für einen Herzschlag und drückt alles im Wirkungsbereich zu Boden.",
      entschaerfen: "die Rune unter der Mitte der Schale bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Chamber of Weight", ausloeser: AUS.betreten.en,
      beschreibung: "The floor sinks into a shallow bowl, furniture and bones lie flattened within.",
      wirkung: "Gravity multiplies for a heartbeat and crushes everything in the area to the floor.",
      entschaerfen: "dispel the rune beneath the centre of the bowl", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum7-zerrbilder", art: "raum", stufe: 7, merkmale: ["magical", "mental", "visual", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 28, 2], ["arcana", 28, 2]],
    wurf: {
      typ: "will", dc: 27, grade: {
        ke: [], e: [D("6d8+4", "mental"), Z("stupefied", 1, "m1")],
        f: [D("12d8+8", "mental"), Z("confused", null, "r1"), Z("stupefied", 2, "t1")],
        kf: [D("24d8+16", "mental"), Z("confused", null, "m1"), T("das Zerrbild behält ein Stück der Seele:", "the distorted image keeps a piece of the soul:"), Z("doomed", 1, "w1"), Z("stupefied", 2, "w1"), T("und das fremde Spiegelbild", "and the stranger's reflection")]
      }
    },
    aussehen: { de: ["Fremdes Spiegelbild", "Das Spiegelbild bewegt sich einen Herzschlag zu spät und lächelt, wenn man es nicht tut."], en: ["Stranger's Reflection", "The reflection moves a heartbeat too late and smiles when you do not."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Kammer der Zerrbilder", ausloeser: "Eine Kreatur betritt den Raum und sieht in einen der Spiegel.",
      beschreibung: "Ein Raum voller Spiegel aus poliertem Silber, jedes Bild darin ist ein wenig verzerrt.",
      wirkung: "Die Zerrbilder greifen nach dem Geist aller im Raum.",
      entschaerfen: "die Spiegel verhängen und den Zauber lösen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Chamber of Distortions", ausloeser: "A creature enters the room and looks into one of the mirrors.",
      beschreibung: "A room full of mirrors of polished silver, every image in them slightly distorted.",
      wirkung: "The distortions reach for the minds of everyone in the room.",
      entschaerfen: "cover the mirrors and unravel the spell", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum7-blitzkammer", art: "raum", stufe: 7, merkmale: ["magical", "electricity", "trap"],
    heimlichkeit: 27, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 27, 2], ["thievery", 28, 2]],
    wurf: {
      typ: "reflex", dc: 27, grade: {
        ke: [], e: [D("6d10", "electricity")],
        f: [D("12d10", "electricity"), D("3d6", "electricity", "persistent"), Z("stunned", 1), T("die Hände zittern:", "the hands tremble:"), Z("clumsy", 1, "t1")],
        kf: [D("24d10", "electricity"), D("4d6", "electricity", "persistent"), Z("stunned", 3), T("die Nerven sind verbrannt:", "the nerves are burnt:"), Z("clumsy", 2, "w1"), Z("deafened", null, "t1")]
      }
    },
    de: {
      name: "Blitzkammer", ausloeser: AUS.betreten.de,
      beschreibung: "Kupferkugeln auf Säulen in allen vier Ecken, die Luft riecht nach Gewitter.",
      wirkung: "Blitze springen zwischen den Kugeln hin und her und durch alle im Wirkungsbereich.",
      entschaerfen: "eine Kugel erden und die Rune darin bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Lightning Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "Copper spheres on pillars in all four corners, the air smells of thunderstorms.",
      wirkung: "Lightning leaps back and forth between the spheres and through everyone in the area.",
      entschaerfen: "ground one sphere and dispel the rune within", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum7-gruftwaechter", art: "raum", stufe: 7, merkmale: ["magical", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 28, 2], ["occultism", 28, 2]],
    beschwoerung: { stufe: 10, runden: null, ort: "falle" },
    de: {
      name: "Sarkophag des Wächters", ausloeser: AUS.betreten.de,
      beschreibung: "Ein steinerner Sarkophag in der Mitte des Raums, der Deckel liegt einen Fingerbreit verschoben.",
      wirkung: "Der Deckel gleitet zur Seite: Eine Kreatur bis Stufe 10 steigt aus dem Sarkophag und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "den Deckel versiegeln, bevor er sich öffnet", ruecksetzen: "Keines."
    },
    en: {
      name: "Warden's Sarcophagus", ausloeser: AUS.betreten.en,
      beschreibung: "A stone sarcophagus at the centre of the room, its lid shifted by a finger's width.",
      wirkung: "The lid slides aside: a creature of up to level 10 climbs out of the sarcophagus and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "seal the lid before it opens", ruecksetzen: "None."
    }
  }
];
