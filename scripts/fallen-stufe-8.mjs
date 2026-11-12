// Eigene Fallen Stufe 8 (0.7.0, 07.11.2026: "jetzt Fallen für Stufe 8 bauen"). Maßstab wie Stufe 7, eine Stufe
// härter (Wunsch: "die nächsten Fallen für das nächste Level noch tödlicher und debuffender", "Fallen in PF2e sollen brutal
// sein"): Ein Fehlschlag wirft eine Figur der Stufe 8 um (im Schnitt rund 75 Schaden), ein kritischer Fehlschlag jede.
// Rettungswurf SG 29, Angriff +23, Heimlichkeit 28 bis 31, Entschärfen 28 bis 31, Mindestgrad höchstens Experte.
// Herbeigerufene Gegner bis Stufe 11 (drei Stufen über der Falle wie bei Stufe 5 bis 7).
// Lange Zustände (Wunsch: "arbeite mehr mit Zuständen, die länger andauern, blind für 28 Stunden oder versteinert"):
// Jede Falle, die nicht vergiftet oder herbeiruft, hinterlässt schon beim Fehlschlag etwas für 24 Stunden (t1), der
// kritische Fehlschlag fast immer für 1 Woche (w1). Neu auf Stufe 8: Gelähmt für 24 Stunden (Totenstarre, Bernstein),
// Verwirrt für 24 Stunden (Flüsterkammer), Benommen 3 für 1 Woche, Versteinert als Salzsäule.

import { AUS, D, T, Z } from "./fallen-bausteine.mjs";

const kante = T("greift die Kante", "grabs the edge");
const stufe = T("hält sich an einer Stufe fest", "holds on to a step");

export const STUFE_8 = [
  /* ---------------------------------------------------------------- Türen */
  {
    id: "tuer8-schiessscharten", art: "tuer", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 27, haerte: 16, tp: 64 },
    entschaerfen: [["thievery", 29, 2]],
    angriff: { bonus: 23, schaden: [D("9d10+18", "piercing"), D("4d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Schießscharten im Türrahmen", ausloeser: AUS.tuer.de,
      beschreibung: "Der Türrahmen ist aus schwerem Stein, in seinen Kanten sitzen schmale Schlitze wie Schießscharten.",
      wirkung: "Aus den Schlitzen schießen Pfeile: je ein Fernkampf-Treffer (ohne Angriffswurf) gegen jede Kreatur im Wirkungsbereich, 9W10+18 Stich und 4W6 anhaltende Blutung. Treffer: Die Pfeile stecken in Arm und Schulter, Kraftlos 1 und Unbeholfen 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und ein Pfeil splittert im Gelenk: Kraftlos 2 und Unbeholfen 1 für 1 Woche.",
      entschaerfen: "die Schlitze von innen verstopfen", ruecksetzen: "Magazine neu füllen (10 Minuten)."
    },
    en: {
      name: "Arrow Slits in the Door Frame", ausloeser: AUS.tuer.en,
      beschreibung: "The door frame is heavy stone, narrow slits like arrow slits sit in its edges.",
      wirkung: "Arrows shoot out of the slits: one ranged hit (no attack roll) against each creature in the area, 9d10+18 piercing and 4d6 persistent bleed. Hit: the arrows lodge in arm and shoulder, enfeebled 1 and clumsy 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and an arrow splinters in the joint: enfeebled 2 and clumsy 1 for 1 week.",
      entschaerfen: "plug the slits from inside", ruecksetzen: "Refill the magazines (10 minutes)."
    },
    trefferZ: [Z("enfeebled", 1, "t1"), Z("clumsy", 1, "t1")], kritZ: [Z("prone"), Z("enfeebled", 2, "w1"), Z("clumsy", 1, "w1")]
  },
  {
    id: "tuer8-sichelschwelle", art: "tuer", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 28, rang: 1, ausloeser: 0, wirkung: 5, werte: { rk: 27, haerte: 16, tp: 64 },
    entschaerfen: [["thievery", 28, 1], ["athletics", 30, 0]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("5d10+10", "slashing")],
        f: [D("10d10+20", "slashing"), D("4d6", "bleed", "persistent"), T("die Sehnen angeschnitten:", "the tendons nicked:"), Z("slowed", 1, "t1")],
        kf: [D("20d10+40", "slashing"), D("6d6", "bleed", "persistent"), Z("prone"), T("die Sehnen durchtrennt:", "the tendons severed:"), Z("slowed", 1, "w1"), Z("clumsy", 2, "w1")]
      }
    },
    de: {
      name: "Sichelschwelle", ausloeser: AUS.tuer.de,
      beschreibung: "Die Schwelle ist ungewöhnlich hoch, an ihrer Oberkante läuft eine haarfeine Fuge.",
      wirkung: "Zwei Sicheln schnellen aus der Schwelle und mähen in Knöchelhöhe durch die Tür.",
      entschaerfen: "die Fuge mit Keilen verschließen", ruecksetzen: "Spannt sich nach 1 Minute selbst."
    },
    en: {
      name: "Sickle Threshold", ausloeser: AUS.tuer.en,
      beschreibung: "The threshold is unusually high, a hairline slot runs along its upper edge.",
      wirkung: "Two sickles snap out of the threshold and mow through the doorway at ankle height.",
      entschaerfen: "seal the slot with wedges", ruecksetzen: "Rewinds itself after 1 minute."
    }
  },
  {
    id: "tuer8-mahlwerk", art: "tuer", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 0, wirkung: 5, werte: { rk: 27, haerte: 18, tp: 72 },
    entschaerfen: [["thievery", 29, 2], ["crafting", 29, 2]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("5d10+10", "bludgeoning")],
        f: [D("10d10+20", "bludgeoning"), T("der Arm gerät ins Getriebe:", "the arm is caught in the gears:"), Z("enfeebled", 2, "t1"), Z("clumsy", 1, "t1")],
        kf: [D("20d10+40", "bludgeoning"), Z("immobilized"), T("im Getriebe gefangen bis Athletik SG 29, 2W10 Wucht zu Beginn jedes ihrer Züge, der Arm zermalmt:", "caught in the gears until Athletics DC 29, 2d10 bludgeoning at the start of each of its turns, the arm crushed:"), Z("enfeebled", 3, "w1"), Z("clumsy", 2, "w1")]
      }
    },
    de: {
      name: "Mahlwerk im Türrahmen", ausloeser: AUS.tuer.de,
      beschreibung: "Hinter dem Türrahmen tickt es leise, in den Angeln glänzt frisches Fett.",
      wirkung: "Zahnräder springen aus dem Rahmen und ziehen alle in der Tür ins Mahlwerk.",
      entschaerfen: "eine Eisenstange ins Getriebe schieben", ruecksetzen: "Läuft nach 1 Minute von selbst zurück."
    },
    en: {
      name: "Grinding Gears in the Door Frame", ausloeser: AUS.tuer.en,
      beschreibung: "Something ticks softly behind the door frame, fresh grease gleams in the hinges.",
      wirkung: "Gear wheels spring out of the frame and drag everyone in the doorway into the works.",
      entschaerfen: "jam an iron bar into the gears", ruecksetzen: "Winds back by itself after 1 minute."
    }
  },
  {
    id: "tuer8-totenstarre", art: "tuer", stufe: 8, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["religion", 29, 2], ["occultism", 30, 2]],
    wurf: {
      typ: "fortitude", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "void"), Z("slowed", 1, "r1")],
        f: [D("14d8+10", "void"), Z("paralyzed", null, "r1"), T("danach bleiben die Glieder steif:", "then the limbs stay stiff:"), Z("clumsy", 2, "t1"), Z("slowed", 1, "t1")],
        kf: [D("28d8+20", "void"), T("erstarrt wie eine Leiche:", "goes rigid like a corpse:"), Z("paralyzed", null, "t1"), Z("clumsy", 2, "w1"), T("und die Leichenblässe", "and the corpse pallor")]
      }
    },
    aussehen: { de: ["Leichenblässe", "Die Haut ist grau und kalt wie bei einem Toten, die Lippen blutleer."], en: ["Corpse Pallor", "The skin is grey and cold like a dead body's, the lips bloodless."], toenung: "#b8c0b8", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Tür der Totenstarre", ausloeser: AUS.tuer.de,
      beschreibung: "Die Tür ist mit Leichentüchern verhängt, das Holz darunter ist kalt wie Stein.",
      wirkung: "Die Kälte des Todes fährt aus der Tür in die Glieder aller, die davor stehen.",
      entschaerfen: "die Tücher verbrennen und den Fluch lösen", ruecksetzen: "Lädt sich auf, sobald wieder jemand in der Nähe stirbt."
    },
    en: {
      name: "Door of Rigor Mortis", ausloeser: AUS.tuer.en,
      beschreibung: "The door is draped with shrouds, the wood beneath is cold as stone.",
      wirkung: "The chill of death leaps from the door into the limbs of everyone standing before it.",
      entschaerfen: "burn the shrouds and unravel the curse", ruecksetzen: "Recharges as soon as someone dies nearby again."
    }
  },
  {
    id: "tuer8-hoellenmaul", art: "tuer", stufe: 8, merkmale: ["magical", "fire", "unholy", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["religion", 29, 2], ["arcana", 30, 2]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("8d6", "fire")],
        f: [D("16d6", "fire"), D("5d6", "fire", "persistent"), T("das Höllenfeuer frisst sich ein:", "the hellfire eats in:"), Z("enfeebled", 1, "t1"), Z("doomed", 1, "t1")],
        kf: [D("32d6", "fire"), D("7d6", "fire", "persistent"), Z("prone"), Z("drained", 2), T("die Seele ist versengt:", "the soul is scorched:"), Z("doomed", 2, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Höllenmaul", ausloeser: AUS.tuer.de,
      beschreibung: "Die Tür ist als aufgerissenes Dämonenmaul geschnitzt, das Holz um die Zähne ist verkohlt.",
      wirkung: "Das Maul speit Höllenfeuer in den Gang vor der Tür.",
      entschaerfen: "das Maul mit geweihtem Salz füllen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Hellmaw", ausloeser: AUS.tuer.en,
      beschreibung: "The door is carved as a gaping demon's maw, the wood around the teeth is charred.",
      wirkung: "The maw spews hellfire into the corridor in front of the door.",
      entschaerfen: "fill the maw with consecrated salt", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "tuer8-vergessen", art: "tuer", stufe: 8, merkmale: ["magical", "mental", "curse", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 29, 2], ["arcana", 30, 2]],
    wurf: {
      typ: "will", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "mental"), Z("stupefied", 1, "m1")],
        f: [D("14d8+10", "mental"), Z("slowed", 1, "m1"), T("Erinnerungen zerfasern:", "memories fray:"), Z("stupefied", 2, "t1")],
        kf: [D("28d8+20", "mental"), Z("confused", null, "m1"), T("vergisst Freunde, Namen und Weg:", "forgets friends, names and the way:"), Z("stupefied", 3, "w1"), T("und der leere Blick", "and the empty gaze")]
      }
    },
    aussehen: { de: ["Leerer Blick", "Der Blick geht ins Leere, als suche er etwas, das nicht mehr da ist."], en: ["Empty Gaze", "The gaze stares into nothing, as if searching for something that is no longer there."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Siegel des Vergessens", ausloeser: AUS.tuer.de,
      beschreibung: "Über der Klinke ein verblasstes Siegel, das man sofort wieder vergisst, wenn man wegsieht.",
      wirkung: "Das Siegel löscht Erinnerungen aus dem Geist aller vor der Tür.",
      entschaerfen: "das Siegel abschreiben und den Zauber lösen, ohne es aus den Augen zu lassen", ruecksetzen: "Lädt sich nach 1 Tag neu."
    },
    en: {
      name: "Seal of Forgetting", ausloeser: AUS.tuer.en,
      beschreibung: "Above the handle a faded seal that is forgotten the moment one looks away.",
      wirkung: "The seal erases memories from the minds of everyone in front of the door.",
      entschaerfen: "copy the seal and unravel the spell without taking your eyes off it", ruecksetzen: "Recharges after 1 day."
    }
  },
  {
    id: "tuer8-ertrunkene", art: "tuer", stufe: 8, merkmale: ["magical", "water", "cold", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 0, wirkung: 10, werte: null,
    entschaerfen: [["occultism", 29, 2], ["religion", 30, 2]],
    wurf: {
      typ: "fortitude", dc: 29, grade: {
        ke: [], e: [D("7d10", "cold"), Z("slowed", 1, "r1")],
        f: [D("14d10", "cold"), Z("slowed", 1, "m1"), T("Wasser in der Lunge:", "water in the lungs:"), Z("sickened", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("28d10", "cold"), Z("drained", 2), T("ertrinkt beinahe, danach rasselt die Lunge:", "nearly drowns, then the lungs rattle:"), Z("sickened", 2, "w1"), Z("enfeebled", 2, "w1"), T("und die Haut der Ertrunkenen", "and the drowned skin")]
      }
    },
    aussehen: { de: ["Haut der Ertrunkenen", "Die Haut ist bleich und aufgequollen wie bei einer Wasserleiche, es riecht nach Tang."], en: ["Drowned Skin", "The skin is pale and swollen like a drowned corpse's, it smells of seaweed."], toenung: "#a8c0c8", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Tür der Ertrunkenen", ausloeser: AUS.tuer.de,
      beschreibung: "Das Holz ist nass, obwohl es nicht regnet, unter der Tür sickert dunkles Wasser hervor.",
      wirkung: "Die Geister der Ertrunkenen greifen durch die Tür und füllen allen davor die Lungen mit eisigem Wasser.",
      entschaerfen: "die Tür trocknen und den Geistern ein Grab versprechen", ruecksetzen: "Lädt sich in der nächsten Flut neu."
    },
    en: {
      name: "Door of the Drowned", ausloeser: AUS.tuer.en,
      beschreibung: "The wood is wet although it is not raining, dark water seeps from beneath the door.",
      wirkung: "The ghosts of the drowned reach through the door and fill the lungs of everyone before it with icy water.",
      entschaerfen: "dry the door and promise the ghosts a grave", ruecksetzen: "Recharges at the next flood."
    }
  },
  {
    id: "tuer8-ahnenwacht", art: "tuer", stufe: 8, merkmale: ["magical", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 0, wirkung: 0, werte: null,
    entschaerfen: [["religion", 29, 2], ["arcana", 30, 2]],
    beschwoerung: { stufe: 11, runden: 10, ort: "neben" },
    de: {
      name: "Ruf der Ahnenwacht", ausloeser: AUS.tuer.de,
      beschreibung: "Neben der Tür hängen Bildnisse strenger Ahnen, ihre Augen scheinen jedem zu folgen.",
      wirkung: "Ein Ahne tritt aus seinem Bild, um die Tür zu bewachen: Eine Kreatur bis Stufe 11 erscheint in einem freien Feld neben der Tür und würfelt sofort Initiative. Sie greift zuerst an, wer die Tür geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Bilder umdrehen und die Ahnen um Erlaubnis bitten", ruecksetzen: "Keines."
    },
    en: {
      name: "Call of the Ancestral Watch", ausloeser: AUS.tuer.en,
      beschreibung: "Portraits of stern ancestors hang beside the door, their eyes seem to follow everyone.",
      wirkung: "An ancestor steps out of its portrait to guard the door: a creature of up to level 11 appears in a free square next to the door and rolls initiative at once. It attacks whoever opened the door first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "turn the portraits around and ask the ancestors for leave", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Schlösser */
  {
    id: "schloss8-uhrwerkspinne", art: "schloss", stufe: 8, merkmale: ["mechanical", "poison", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: "knopf", wirkung: 0, werte: { rk: 27, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 29, 2]],
    gift: {
      typ: "fortitude", dc: 29, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("7d6", "poison"), Z("clumsy", 1, "r1")],
        [D("9d6", "poison"), Z("clumsy", 2, "r1"), Z("slowed", 1)],
        [D("12d6", "poison"), Z("paralyzed", null, "m1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Uhrwerkspinne", ausloeser: AUS.schloss.de,
      beschreibung: "Im Schlüsselloch glänzt etwas Messingfarbenes, und manchmal bewegt es sich.",
      wirkung: "Eine winzige Spinne aus Messing springt aus dem Schlüsselloch und beißt in die Hand. Spinnengift.", gift: "Spinnengift",
      entschaerfen: "die Spinne mit einer Zange festhalten und aufziehen, bis die Feder bricht", ruecksetzen: "Spinne neu vergiften und aufziehen."
    },
    en: {
      name: "Clockwork Spider", ausloeser: AUS.schloss.en,
      beschreibung: "Something brass-coloured gleams in the keyhole, and sometimes it moves.",
      wirkung: "A tiny brass spider leaps out of the keyhole and bites the hand. Spider venom.", gift: "Spider venom",
      entschaerfen: "hold the spider with pliers and wind it until the spring breaks", ruecksetzen: "Poison and wind the spider again."
    }
  },
  {
    id: "schloss8-handfessel", art: "schloss", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 28, rang: 1, ausloeser: "knopf", wirkung: 0, werte: { rk: 27, haerte: 16, tp: 64 },
    entschaerfen: [["thievery", 28, 1]],
    angriff: { bonus: 23, schaden: [D("9d8+20", "slashing"), D("4d6", "bleed", "persistent")], hoechstens: 1, nah: true },
    de: {
      name: "Handfessel mit Klinge", ausloeser: AUS.schloss.de,
      beschreibung: "Unter dem Schloss ist ein offener Eisenring eingelassen, gerade groß genug für ein Handgelenk.",
      wirkung: "Der Ring schnappt um das Handgelenk, eine Klinge fährt darüber: Nahkampf-Treffer (ohne Angriffswurf), 9W8+20 Hieb und 4W6 anhaltende Blutung. Treffer: Die Sehnen der Hand sind angeschnitten, Unbeholfen 2 und Kraftlos 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, die Sehnen sind durchtrennt: Unbeholfen 3 und Kraftlos 2 für 1 Woche.",
      entschaerfen: "den Ring mit einem Keil offen halten", ruecksetzen: "Von Hand neu spannen."
    },
    en: {
      name: "Bladed Manacle", ausloeser: AUS.schloss.en,
      beschreibung: "An open iron ring is set below the lock, just large enough for a wrist.",
      wirkung: "The ring snaps shut around the wrist, a blade sweeps across it: melee hit (no attack roll), 9d8+20 slashing and 4d6 persistent bleed. Hit: the tendons of the hand are nicked, clumsy 2 and enfeebled 1 for 24 hours.",
      krit: "Critical hit: double damage, the tendons are severed: clumsy 3 and enfeebled 2 for 1 week.",
      entschaerfen: "keep the ring open with a wedge", ruecksetzen: "Rearm by hand."
    },
    trefferZ: [Z("clumsy", 2, "t1"), Z("enfeebled", 1, "t1")], kritZ: [Z("clumsy", 3, "w1"), Z("enfeebled", 2, "w1")]
  },
  {
    id: "schloss8-pestsiegel", art: "schloss", stufe: 8, merkmale: ["magical", "void", "disease", "curse", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["religion", 29, 2], ["occultism", 30, 2]],
    wurf: {
      typ: "fortitude", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "void"), Z("sickened", 1)],
        f: [D("14d8+10", "void"), T("das Fieber steigt:", "the fever rises:"), Z("sickened", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("28d8+20", "void"), Z("drained", 2), T("die Pest bricht aus:", "the plague breaks out:"), Z("sickened", 2, "w1"), Z("enfeebled", 2, "w1"), T("und die Pestbeulen", "and the plague boils")]
      }
    },
    aussehen: { de: ["Pestbeulen", "Schwarze Beulen an Hals und Achseln, die Haut darum ist fiebrig heiß."], en: ["Plague Boils", "Black boils on neck and armpits, the skin around them feverishly hot."], toenung: "#8a9a5b", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Pestsiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Ein Siegel aus grünlichem Wachs mit dem Zeichen eines Raben, es riecht süßlich nach Fäulnis.",
      wirkung: "Das Siegel platzt, und die Pest fährt in alle in der Nähe.",
      entschaerfen: "das Siegel mit Weihrauch und Gebet lösen", ruecksetzen: "Lädt sich nach 1 Woche neu."
    },
    en: {
      name: "Plague Seal", ausloeser: AUS.schloss.en,
      beschreibung: "A seal of greenish wax bearing the sign of a raven, it smells sweetly of rot.",
      wirkung: "The seal bursts, and the plague enters everyone nearby.",
      entschaerfen: "unravel the seal with incense and prayer", ruecksetzen: "Recharges after 1 week."
    }
  },
  {
    id: "schloss8-bernstein", art: "schloss", stufe: 8, merkmale: ["magical", "fire", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 29, 2], ["thievery", 30, 2]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("8d6", "fire")],
        f: [D("16d6", "fire"), D("5d6", "fire", "persistent"), T("heißes Harz verklebt die Finger:", "hot resin glues the fingers:"), Z("clumsy", 2, "t1")],
        kf: [D("32d6", "fire"), D("7d6", "fire", "persistent"), T("in Bernstein gegossen:", "cast in amber:"), Z("paralyzed", null, "t1"), Z("clumsy", 2, "w1"), T("und der Bernsteinglanz", "and the amber sheen")]
      }
    },
    aussehen: { de: ["Bernsteinglanz", "Die Haut schimmert goldgelb, in den Haaren kleben Harzperlen, die sich nicht lösen."], en: ["Amber Sheen", "The skin shimmers golden yellow, beads of resin stick in the hair and will not come loose."], toenung: "#e0b050", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Bernsteinsiegel", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schloss ist in einen Klumpen Bernstein gefasst, darin ein Insekt, das noch zuckt.",
      wirkung: "Der Bernstein schmilzt und ergießt sich glühend über die Kreatur am Schloss.",
      entschaerfen: "den Bernstein kühlen und das Insekt befreien", ruecksetzen: "Erstarrt nach 1 Tag neu."
    },
    en: {
      name: "Amber Seal", ausloeser: AUS.schloss.en,
      beschreibung: "The lock is set in a lump of amber, an insect inside that still twitches.",
      wirkung: "The amber melts and pours, glowing, over the creature at the lock.",
      entschaerfen: "cool the amber and free the insect", ruecksetzen: "Hardens again after 1 day."
    }
  },
  {
    id: "schloss8-seelendieb", art: "schloss", stufe: 8, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 31, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["occultism", 30, 2], ["religion", 31, 2]],
    wurf: {
      typ: "will", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "void"), Z("drained", 1)],
        f: [D("14d8+10", "void"), Z("drained", 2), T("ein Stück der Seele fehlt:", "a piece of the soul is missing:"), Z("doomed", 1, "t1")],
        kf: [D("28d8+20", "void"), Z("drained", 3), T("der Stein behält die halbe Seele:", "the stone keeps half the soul:"), Z("doomed", 2, "w1"), Z("stupefied", 2, "w1"), T("und der fehlende Schatten", "and the missing shadow")]
      }
    },
    aussehen: { de: ["Kein Schatten", "Die Figur wirft keinen Schatten mehr, weder im Licht noch am Feuer."], en: ["No Shadow", "The figure no longer casts a shadow, neither in light nor by the fire."], toenung: null, dauer: { value: 30, unit: "days" } },
    de: {
      name: "Schloss des Seelendiebs", ausloeser: AUS.schloss.de,
      beschreibung: "Statt eines Schlüssellochs sitzt ein schwarzer Edelstein im Schloss, in dem ein Licht wandert.",
      wirkung: "Der Stein saugt der Kreatur am Schloss die Seele aus dem Leib.",
      entschaerfen: "den Stein mit Silber fassen und das Licht darin freilassen", ruecksetzen: "Lädt sich nach 1 Woche neu."
    },
    en: {
      name: "Soulthief Lock", ausloeser: AUS.schloss.en,
      beschreibung: "Instead of a keyhole a black gem sits in the lock, a light wandering inside it.",
      wirkung: "The gem draws the soul out of the body of the creature at the lock.",
      entschaerfen: "set the gem in silver and release the light within", ruecksetzen: "Recharges after 1 week."
    }
  },
  {
    id: "schloss8-frostherz", art: "schloss", stufe: 8, merkmale: ["magical", "cold", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: "knopf", wirkung: 10, werte: null,
    entschaerfen: [["arcana", 29, 2], ["nature", 30, 2]],
    wurf: {
      typ: "fortitude", dc: 29, grade: {
        ke: [], e: [D("7d10", "cold"), Z("slowed", 1, "r1")],
        f: [D("14d10", "cold"), Z("slowed", 1, "m1"), T("die Kälte sitzt in den Knochen:", "the cold sits in the bones:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("28d10", "cold"), Z("drained", 2), T("das Herz gefriert halb:", "the heart half freezes:"), Z("slowed", 1, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Frostherz-Siegel", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schloss ist mit Raureif überzogen, mitten darin ein Siegel in Form eines Herzens aus Eis.",
      wirkung: "Das Eisherz zerspringt, und klirrende Kälte fährt in alle in der Nähe.",
      entschaerfen: "das Siegel mit einer Flamme lösen, ohne es zu brechen", ruecksetzen: "Friert in der nächsten Nacht neu."
    },
    en: {
      name: "Frostheart Seal", ausloeser: AUS.schloss.en,
      beschreibung: "The lock is coated with hoarfrost, in its middle a seal shaped like a heart of ice.",
      wirkung: "The ice heart shatters, and biting cold enters everyone nearby.",
      entschaerfen: "loosen the seal with a flame without breaking it", ruecksetzen: "Freezes anew the next night."
    }
  },
  {
    id: "schloss8-kroetenatem", art: "schloss", stufe: 8, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: "knopf", wirkung: 10, werte: { rk: 25, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 29, 2], ["crafting", 28, 1]],
    gift: {
      typ: "fortitude", dc: 29, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("7d6", "poison"), Z("sickened", 1)],
        [D("9d6", "poison"), Z("sickened", 2), Z("blinded", null, "r1")],
        [D("12d6", "poison"), Z("sickened", 3), Z("blinded", null, "m1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Phiole mit Krötenatem", ausloeser: AUS.schloss.de,
      beschreibung: "Das Schlossblech ist an den Rändern gelb verfärbt, es riecht nach Moder.",
      wirkung: "Eine Phiole zerbricht, gelber Dunst quillt aus allen Fugen und füllt den Wirkungsbereich für 1 Minute. Wer eine Runde darin beginnt, würfelt erneut. Krötenatem.", gift: "Krötenatem",
      entschaerfen: "die Phiole durch das Schlüsselloch sichern", ruecksetzen: "Neue Phiole einsetzen."
    },
    en: {
      name: "Toad Breath Vial", ausloeser: AUS.schloss.en,
      beschreibung: "The lock plate is stained yellow at the edges, it smells of mould.",
      wirkung: "A vial shatters, yellow vapour pours from every joint and fills the area for 1 minute. A creature starting its turn inside rolls again. Toad breath.", gift: "Toad breath",
      entschaerfen: "secure the vial through the keyhole", ruecksetzen: "Insert a new vial."
    }
  },
  {
    id: "schloss8-gebundener", art: "schloss", stufe: 8, merkmale: ["magical", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: "knopf", wirkung: 0, werte: null,
    entschaerfen: [["arcana", 30, 2], ["thievery", 31, 2]],
    beschwoerung: { stufe: 11, runden: 10, ort: "neben" },
    de: {
      name: "Schloss des Gebundenen", ausloeser: AUS.schloss.de,
      beschreibung: "Um das Schloss ist eine Kette gewunden, auf jedem Glied steht ein Wort einer Bannformel.",
      wirkung: "Die Kette springt, und was an sie gebunden war, ist frei: Eine Kreatur bis Stufe 11 erscheint in einem freien Feld neben Truhe oder Tür und würfelt sofort Initiative. Sie greift zuerst an, wer das Schloss geöffnet hat, und verschwindet nach 1 Minute oder wenn sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "die Bannformel auf der Kette zu Ende sprechen", ruecksetzen: "Keines."
    },
    en: {
      name: "Lock of the Bound One", ausloeser: AUS.schloss.en,
      beschreibung: "A chain is wound around the lock, each link bearing one word of a binding formula.",
      wirkung: "The chain snaps, and what was bound to it is free: a creature of up to level 11 appears in a free square next to the chest or door and rolls initiative at once. It attacks whoever opened the lock first and vanishes after 1 minute or when defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "finish speaking the binding formula on the chain", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Gelände */
  {
    id: "gelaende8-felsspalte", art: "gelaende", stufe: 8, merkmale: ["environmental"],
    heimlichkeit: 28, rang: 1, ausloeser: 5, wirkung: 5, werte: null,
    entschaerfen: [["survival", 28, 1], ["nature", 29, 1]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [kante], e: [kante],
        f: [T("stürzt 60 Fuß tief in eine Felsspalte", "falls 60 feet into a rock crevasse"), D("30", "bludgeoning"), D("6d10+10", "bludgeoning"), Z("prone"), T("geprellt:", "bruised:"), Z("enfeebled", 1, "t1")],
        kf: [T("stürzt und verkeilt sich tief in der Spalte", "falls and wedges deep in the crevasse"), D("30", "bludgeoning"), D("12d10+40", "bludgeoning"), Z("immobilized"), T("bis Athletik SG 29, der Rücken gestaucht:", "until Athletics DC 29, the back wrenched:"), Z("enfeebled", 2, "w1"), Z("slowed", 1, "w1")]
      }
    },
    de: {
      name: "Verschneite Felsspalte", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Schneefeld zwischen Felsen, an einer Stelle liegt der Schnee eine Spur tiefer.",
      wirkung: "Die Schneebrücke bricht. Herausklettern Athletik SG 29.",
      entschaerfen: "die Spalte mit einem Stock finden und markieren", ruecksetzen: "Schneit im nächsten Sturm wieder zu."
    },
    en: {
      name: "Snow-Covered Crevasse", ausloeser: AUS.betreten.en,
      beschreibung: "A snowfield between rocks, in one place the snow lies a touch lower.",
      wirkung: "The snow bridge breaks. Climbing out takes Athletics DC 29.",
      entschaerfen: "find and mark the crevasse with a staff", ruecksetzen: "Snows over again in the next storm."
    }
  },
  {
    id: "gelaende8-speerschleuder", art: "gelaende", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 27, haerte: 12, tp: 52 },
    entschaerfen: [["thievery", 29, 2], ["survival", 29, 1]],
    angriff: { bonus: 23, schaden: [D("9d10+18", "piercing"), D("4d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Speerschleudern im Unterholz", ausloeser: AUS.betreten.de,
      beschreibung: "Im dichten Unterholz zu beiden Seiten des Pfads glänzt hier und da Metall, ein Draht läuft quer.",
      wirkung: "Gespannte Schleudern werfen Speere über den Pfad: je ein Fernkampf-Treffer (ohne Angriffswurf) gegen jede Kreatur im Wirkungsbereich, 9W10+18 Stich und 4W6 anhaltende Blutung. Treffer: Liegend, und die Wunde reißt bei jedem Schritt: Unbeholfen 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, der Speer nagelt sie an den Boden: Liegend und Bewegungsunfähig, bis sie ihn mit einer Interagieren-Aktion herauszieht, und das Bein ist durchbohrt: Verlangsamt 1 für 1 Woche.",
      entschaerfen: "den Draht entlasten und die Schleudern entspannen", ruecksetzen: "Schleudern neu spannen (10 Minuten)."
    },
    en: {
      name: "Spear Slings in the Undergrowth", ausloeser: AUS.betreten.en,
      beschreibung: "Metal glints here and there in the dense undergrowth on both sides of the path, a wire runs across.",
      wirkung: "Cocked slings hurl spears across the path: one ranged hit (no attack roll) against each creature in the area, 9d10+18 piercing and 4d6 persistent bleed. Hit: prone, and the wound tears with every step: clumsy 1 for 24 hours.",
      krit: "Critical hit: double damage, the spear pins it to the ground: prone and immobilized until it pulls the spear out with an Interact action, and the leg is pierced: slowed 1 for 1 week.",
      entschaerfen: "take the load off the wire and release the slings", ruecksetzen: "Cock the slings again (10 minutes)."
    },
    trefferZ: [Z("prone"), Z("clumsy", 1, "t1")], kritZ: [Z("prone"), Z("immobilized"), Z("slowed", 1, "w1")]
  },
  {
    id: "gelaende8-hakennetz", art: "gelaende", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 28, rang: 1, ausloeser: 0, wirkung: 10, werte: { rk: 25, haerte: 8, tp: 40 },
    entschaerfen: [["thievery", 28, 1], ["survival", 29, 1]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("5d10+10", "slashing")],
        f: [D("10d10+20", "slashing"), D("4d6", "bleed", "persistent"), Z("restrained"), T("im Hakennetz gefangen bis Entkommen SG 29, die Haken reißen das Fleisch:", "caught in the hook net until it Escapes (DC 29), the hooks tear the flesh:"), Z("enfeebled", 1, "t1")],
        kf: [D("20d10+40", "slashing"), D("6d6", "bleed", "persistent"), Z("restrained"), T("bis Entkommen SG 29, die Haken sitzen tief in Armen und Beinen:", "until it Escapes (DC 29), the hooks sit deep in arms and legs:"), Z("clumsy", 2, "w1"), Z("enfeebled", 1, "w1")]
      }
    },
    de: {
      name: "Hakennetz in den Baumkronen", ausloeser: AUS.feld.de,
      beschreibung: "Zwischen den Ästen über dem Pfad hängt etwas Dunkles, Laub verdeckt es fast ganz.",
      wirkung: "Ein schweres Netz voller Angelhaken fällt auf alle im Wirkungsbereich.",
      entschaerfen: "das Halteseil kappen, solange niemand darunter steht", ruecksetzen: "Netz neu aufhängen (10 Minuten)."
    },
    en: {
      name: "Hook Net in the Treetops", ausloeser: AUS.feld.en,
      beschreibung: "Something dark hangs between the branches above the path, nearly hidden by leaves.",
      wirkung: "A heavy net full of fish hooks drops onto everyone in the area.",
      entschaerfen: "cut the holding rope while nobody stands beneath", ruecksetzen: "Hang the net again (10 minutes)."
    }
  },
  {
    id: "gelaende8-steinwalze", art: "gelaende", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 28, rang: 1, ausloeser: 0, wirkung: 20, werte: null,
    entschaerfen: [["thievery", 29, 1], ["survival", 28, 1]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("5d10+10", "bludgeoning"), Z("prone")],
        f: [D("10d10+20", "bludgeoning"), Z("prone"), T("überrollt:", "rolled over:"), Z("enfeebled", 2, "t1")],
        kf: [D("20d10+40", "bludgeoning"), Z("prone"), T("zermalmt, das Becken gebrochen:", "crushed, the pelvis broken:"), Z("slowed", 1, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Rollende Steinwalze", ausloeser: AUS.feld.de,
      beschreibung: "Ein Hohlweg zwischen steilen Hängen, oben am Rand ruht eine riesige Steinwalze auf zwei Keilen.",
      wirkung: "Die Keile springen weg, und die Walze donnert durch den Hohlweg.",
      entschaerfen: "die Keile festbinden", ruecksetzen: "Keines."
    },
    en: {
      name: "Rolling Stone Cylinder", ausloeser: AUS.feld.en,
      beschreibung: "A sunken lane between steep slopes, a huge stone cylinder rests on two wedges at the top edge.",
      wirkung: "The wedges spring away, and the cylinder thunders down the lane.",
      entschaerfen: "tie the wedges down", ruecksetzen: "None."
    }
  },
  {
    id: "gelaende8-faulgas", art: "gelaende", stufe: 8, merkmale: ["environmental", "poison", "inhaled"],
    heimlichkeit: 28, rang: 1, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["nature", 28, 1], ["survival", 29, 1]],
    gift: {
      typ: "fortitude", dc: 29, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("7d6", "poison"), Z("sickened", 1)],
        [D("9d6", "poison"), Z("sickened", 1), Z("confused", null, "r1")],
        [D("12d6", "poison"), Z("sickened", 2), Z("confused", null, "m1"), Z("drained", 2)]
      ]
    },
    de: {
      name: "Faulgas im Moor", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Moor, aus dem in langen Abständen Blasen steigen, über dem Wasser flimmert die Luft.",
      wirkung: "Wer hineintritt, bricht die Kruste auf, und Faulgas steigt auf; es hängt 1 Minute über dem Moor und lässt Trugbilder sehen. Wer eine Runde darin beginnt, würfelt erneut. Faulgas.", gift: "Faulgas",
      entschaerfen: "einen Weg aus Reisig legen oder das Gas abbrennen", ruecksetzen: "Sammelt sich in 1 Tag neu."
    },
    en: {
      name: "Marsh Gas", ausloeser: AUS.betreten.en,
      beschreibung: "A bog from which bubbles rise at long intervals, the air shimmers above the water.",
      wirkung: "Stepping in breaks the crust, and marsh gas rises; it hangs over the bog for 1 minute and conjures phantoms. A creature starting its turn inside rolls again. Marsh gas.", gift: "Marsh gas",
      entschaerfen: "lay a path of brushwood or burn off the gas", ruecksetzen: "Gathers again in 1 day."
    }
  },
  {
    id: "gelaende8-salzpfanne", art: "gelaende", stufe: 8, merkmale: ["magical", "void", "curse", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 0, wirkung: 20, werte: null,
    entschaerfen: [["religion", 29, 2], ["occultism", 30, 2]],
    wurf: {
      typ: "fortitude", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "void"), Z("slowed", 1, "r1")],
        f: [D("14d8+10", "void"), Z("slowed", 1, "m1"), T("die Haut reißt auf wie ausgedörrter Boden:", "the skin cracks like parched earth:"), Z("clumsy", 1, "t1"), Z("drained", 1)],
        kf: [D("28d8+20", "void"), T("erstarrt zur Salzsäule:", "turns into a pillar of salt:"), Z("petrified", null, "w1")]
      }
    },
    de: {
      name: "Salzpfanne der Verfluchten", ausloeser: AUS.feld.de,
      beschreibung: "Eine weiße Salzebene, auf der vereinzelt Säulen aus Salz stehen, manche mit Armen und Gesichtern.",
      wirkung: "Der Fluch der Ebene zieht allen im Wirkungsbereich das Wasser aus dem Leib.",
      entschaerfen: "Wasser aus einer heiligen Quelle auf das Salz gießen", ruecksetzen: "Lädt sich in der nächsten Mittagshitze neu."
    },
    en: {
      name: "Salt Pan of the Cursed", ausloeser: AUS.feld.en,
      beschreibung: "A white salt plain dotted with pillars of salt, some with arms and faces.",
      wirkung: "The curse of the plain draws the water out of the bodies of everyone in the area.",
      entschaerfen: "pour water from a holy spring onto the salt", ruecksetzen: "Recharges in the next midday heat."
    }
  },
  {
    id: "gelaende8-hexenring", art: "gelaende", stufe: 8, merkmale: ["magical", "mental", "curse", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 0, wirkung: 15, werte: null,
    entschaerfen: [["nature", 29, 2], ["occultism", 30, 2]],
    wurf: {
      typ: "will", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "mental"), Z("fascinated", null, "r1")],
        f: [D("14d8+10", "mental"), Z("confused", null, "r1"), T("tanzt, bis die Füße bluten:", "dances until the feet bleed:"), Z("clumsy", 1, "t1"), Z("stupefied", 1, "t1")],
        kf: [D("28d8+20", "mental"), Z("fascinated", null, "m1"), T("tanzt bis zum Zusammenbruch, danach ausgezehrt:", "dances until it collapses, then worn out:"), Z("enfeebled", 2, "w1"), Z("clumsy", 2, "w1"), Z("stupefied", 2, "w1"), T("und der Pilzring", "and the mushroom ring")]
      }
    },
    aussehen: { de: ["Pilzring", "Um ein Handgelenk wächst ein Ring aus winzigen weißen Pilzen, der nachwächst, wenn man ihn abreißt."], en: ["Mushroom Ring", "A ring of tiny white mushrooms grows around one wrist and grows back when torn off."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Hexenring", ausloeser: AUS.feld.de,
      beschreibung: "Ein Kreis aus bleichen Pilzen auf einer Lichtung, das Gras darin ist niedergetreten wie von vielen Füßen.",
      wirkung: "Unhörbare Musik zwingt alle im Wirkungsbereich zum Tanz.",
      entschaerfen: "einen Pilz des Rings mit Eisen ausstechen", ruecksetzen: "Wächst in der nächsten Vollmondnacht nach."
    },
    en: {
      name: "Fairy Ring", ausloeser: AUS.feld.en,
      beschreibung: "A circle of pale mushrooms in a clearing, the grass inside trampled as if by many feet.",
      wirkung: "Inaudible music forces everyone in the area to dance.",
      entschaerfen: "cut out one mushroom of the ring with iron", ruecksetzen: "Grows back on the next full moon night."
    }
  },
  {
    id: "gelaende8-schlachtfeld", art: "gelaende", stufe: 8, merkmale: ["magical", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["religion", 30, 2], ["arcana", 30, 2]],
    beschwoerung: { stufe: 11, runden: null, ort: "falle" },
    de: {
      name: "Altes Schlachtfeld", ausloeser: AUS.betreten.de,
      beschreibung: "Rostige Klingen und Helme im hohen Gras, in der Mitte ein Banner, das kein Wind bewegt.",
      wirkung: "Wer das Banner erreicht, weckt den, der darunter fiel: Eine Kreatur bis Stufe 11 erhebt sich am Banner und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Banner einholen und den Gefallenen die Ehre erweisen", ruecksetzen: "Keines."
    },
    en: {
      name: "Old Battlefield", ausloeser: AUS.betreten.en,
      beschreibung: "Rusty blades and helmets in the tall grass, at its centre a banner that no wind stirs.",
      wirkung: "Whoever reaches the banner wakes the one who fell beneath it: a creature of up to level 11 rises at the banner and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "lower the banner and honour the fallen", ruecksetzen: "None."
    }
  },

  /* ---------------------------------------------------------------- Räume */
  {
    id: "raum8-armbrustgalerie", art: "raum", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 27, haerte: 14, tp: 56 },
    entschaerfen: [["thievery", 29, 2]],
    angriff: { bonus: 23, schaden: [D("9d10+18", "piercing"), D("4d6", "bleed", "persistent")], hoechstens: null },
    de: {
      name: "Armbrustgalerie", ausloeser: AUS.platte.de,
      beschreibung: "Unter der Decke läuft eine schmale Galerie, hinter ihrer Brüstung reihen sich dunkle Öffnungen.",
      wirkung: "Armbrüste feuern von der Galerie: je ein Fernkampf-Treffer (ohne Angriffswurf) gegen jede Kreatur im Wirkungsbereich, 9W10+18 Stich und 4W6 anhaltende Blutung. Treffer: Der Bolzen steckt im Fleisch, Kraftlos 1 für 24 Stunden.",
      krit: "Kritischer Treffer: doppelter Schaden, Liegend, und der Bolzen splittert im Knochen: Kraftlos 1 für 1 Woche und Verlangsamt 1 für 24 Stunden.",
      entschaerfen: "die Platte verkeilen", ruecksetzen: "Armbrüste neu spannen (10 Minuten)."
    },
    en: {
      name: "Crossbow Gallery", ausloeser: AUS.platte.en,
      beschreibung: "A narrow gallery runs beneath the ceiling, dark openings in a row behind its parapet.",
      wirkung: "Crossbows fire from the gallery: one ranged hit (no attack roll) against each creature in the area, 9d10+18 piercing and 4d6 persistent bleed. Hit: the bolt lodges in the flesh, enfeebled 1 for 24 hours.",
      krit: "Critical hit: double damage, prone, and the bolt splinters in the bone: enfeebled 1 for 1 week and slowed 1 for 24 hours.",
      entschaerfen: "wedge the plate", ruecksetzen: "Cock the crossbows again (10 minutes)."
    },
    trefferZ: [Z("enfeebled", 1, "t1")], kritZ: [Z("prone"), Z("enfeebled", 1, "w1"), Z("slowed", 1, "t1")]
  },
  {
    id: "raum8-brennofen", art: "raum", stufe: 8, merkmale: ["mechanical", "fire", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 25, haerte: 12, tp: 48 },
    entschaerfen: [["thievery", 29, 2], ["crafting", 28, 1]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("8d6", "fire")],
        f: [D("16d6", "fire"), D("5d6", "fire", "persistent"), T("Brandwunden:", "burns:"), Z("clumsy", 1, "t1"), Z("enfeebled", 1, "t1")],
        kf: [D("32d6", "fire"), D("7d6", "fire", "persistent"), Z("drained", 1), T("die Haut verkohlt:", "the skin chars:"), Z("clumsy", 2, "w1"), Z("enfeebled", 2, "w1")]
      }
    },
    de: {
      name: "Brennofen", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Raum aus gebrannten Ziegeln, die Wände rußgeschwärzt, im Boden Düsen unter Gittern.",
      wirkung: "Die Türen schlagen zu, und aus den Düsen fauchen Flammen durch den Raum.",
      entschaerfen: "die Gaszufuhr unter dem Boden schließen", ruecksetzen: "Heizt in 10 Minuten nach."
    },
    en: {
      name: "Kiln Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "A room of fired bricks, the walls blackened with soot, nozzles beneath grates in the floor.",
      wirkung: "The doors slam shut, and flames roar from the nozzles through the room.",
      entschaerfen: "close the gas supply beneath the floor", ruecksetzen: "Heats up again in 10 minutes."
    }
  },
  {
    id: "raum8-quecksilber", art: "raum", stufe: 8, merkmale: ["mechanical", "poison", "inhaled", "trap"],
    heimlichkeit: 28, rang: 2, ausloeser: 5, wirkung: 20, werte: { rk: 25, haerte: 8, tp: 32 },
    entschaerfen: [["thievery", 29, 2], ["crafting", 28, 1]],
    gift: {
      typ: "fortitude", dc: 29, max: { de: "6 Runden", en: "6 rounds" },
      stufen: [
        [D("7d6", "poison"), Z("clumsy", 1)],
        [D("9d6", "poison"), Z("clumsy", 2), Z("stupefied", 1)],
        [D("12d6", "poison"), Z("clumsy", 3), Z("stupefied", 2), Z("drained", 2)]
      ]
    },
    de: {
      name: "Quecksilberkammer", ausloeser: AUS.betreten.de,
      beschreibung: "Ein Labor mit zerbrochenen Kolben, in den Ritzen des Bodens glänzen silberne Tropfen.",
      wirkung: "Ein Kessel mit Quecksilber kippt auf eine heiße Platte, giftiger Dampf füllt den Raum für 1 Minute, die Türen fallen zu (Diebeskunst SG 29 oder Athletik SG 31 zum Aufbrechen). Wer eine Runde darin beginnt, würfelt erneut. Quecksilberdampf.", gift: "Quecksilberdampf",
      entschaerfen: "den Kessel festbinden und die Platte abkühlen", ruecksetzen: "Kessel neu füllen."
    },
    en: {
      name: "Quicksilver Chamber", ausloeser: AUS.betreten.en,
      beschreibung: "A laboratory with broken flasks, silver droplets gleam in the cracks of the floor.",
      wirkung: "A cauldron of quicksilver tips onto a hot plate, poisonous vapour fills the room for 1 minute, the doors slam shut (Thievery DC 29 or Athletics DC 31 to force them). A creature starting its turn inside rolls again. Quicksilver vapour.", gift: "Quicksilver vapour",
      entschaerfen: "tie down the cauldron and cool the plate", ruecksetzen: "Refill the cauldron."
    }
  },
  {
    id: "raum8-rutschtreppe", art: "raum", stufe: 8, merkmale: ["mechanical", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 0, wirkung: 10, werte: { rk: 27, haerte: 16, tp: 64 },
    entschaerfen: [["thievery", 29, 2], ["crafting", 29, 2]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [stufe], e: [stufe],
        f: [T("rutscht 30 Fuß tief in einen Klingenschacht", "slides 30 feet down into a blade shaft"), D("15", "bludgeoning"), D("8d10+16", "slashing"), D("3d6", "bleed", "persistent"), Z("prone"), T("zerschnitten:", "cut up:"), Z("clumsy", 1, "t1")],
        kf: [T("stürzt kopfüber in die Klingen", "plunges head first into the blades"), D("15", "bludgeoning"), D("16d10+32", "slashing"), D("5d6", "bleed", "persistent"), Z("prone"), T("die Sehnen zerschnitten:", "the tendons cut:"), Z("clumsy", 2, "w1"), Z("slowed", 1, "w1")]
      }
    },
    de: {
      name: "Rutschende Treppe", ausloeser: AUS.feld.de,
      beschreibung: "Eine steile Treppe nach unten, die Stufen haben an der Vorderkante feine Scharniere.",
      wirkung: "Die Stufen klappen weg, die Treppe wird zur Rutsche in einen Schacht voller Klingen. Herausklettern Athletik SG 29.",
      entschaerfen: "die Scharniere verkeilen", ruecksetzen: "Stellt sich nach 1 Minute selbst auf."
    },
    en: {
      name: "Sliding Staircase", ausloeser: AUS.feld.en,
      beschreibung: "A steep staircase leading down, the steps have fine hinges at their front edge.",
      wirkung: "The steps fold away, the stairs become a chute into a shaft full of blades. Climbing out takes Athletics DC 29.",
      entschaerfen: "wedge the hinges", ruecksetzen: "Rights itself after 1 minute."
    }
  },
  {
    id: "raum8-beinhaus", art: "raum", stufe: 8, merkmale: ["magical", "void", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["religion", 29, 2], ["occultism", 30, 2]],
    wurf: {
      typ: "fortitude", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "void"), Z("drained", 1)],
        f: [D("14d8+10", "void"), Z("drained", 1), T("die Kälte des Grabes:", "the chill of the grave:"), Z("enfeebled", 1, "t1"), Z("doomed", 1, "t1")],
        kf: [D("28d8+20", "void"), Z("drained", 3), T("der Tod hat sie gezeichnet:", "death has marked it:"), Z("doomed", 2, "w1"), Z("enfeebled", 2, "w1"), T("und der graue Handabdruck", "and the grey handprint")]
      }
    },
    aussehen: { de: ["Grauer Handabdruck", "Auf der Brust zeichnet sich ein grauer Handabdruck ab, kalt wie Stein."], en: ["Grey Handprint", "A grey handprint shows on the chest, cold as stone."], toenung: "#9a9a9a", dauer: { value: 7, unit: "days" } },
    de: {
      name: "Rufendes Beinhaus", ausloeser: AUS.betreten.de,
      beschreibung: "Schädel und Knochen sind bis unter die Decke gestapelt, alle Schädel blicken zur Tür.",
      wirkung: "Hunderte Knochenhände greifen aus den Stapeln nach allen im Wirkungsbereich.",
      entschaerfen: "die Schädel mit geweihtem Öl salben", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Calling Ossuary", ausloeser: AUS.betreten.en,
      beschreibung: "Skulls and bones are stacked up to the ceiling, every skull facing the door.",
      wirkung: "Hundreds of bony hands reach from the stacks for everyone in the area.",
      entschaerfen: "anoint the skulls with consecrated oil", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum8-sonnenkammer", art: "raum", stufe: 8, merkmale: ["magical", "fire", "light", "trap"],
    heimlichkeit: 29, rang: 2, ausloeser: 5, wirkung: 20, werte: null,
    entschaerfen: [["arcana", 29, 2], ["thievery", 30, 2]],
    wurf: {
      typ: "reflex", dc: 29, grade: {
        ke: [], e: [D("7d10", "fire"), Z("dazzled", null, "m1")],
        f: [D("14d10", "fire"), Z("blinded", null, "m1"), T("danach", "then"), Z("dazzled", null, "t1")],
        kf: [D("28d10", "fire"), T("das Licht brennt die Augen aus:", "the light burns out the eyes:"), Z("blinded", null, "w1"), T("und die milchigen Augen", "and the milky eyes")]
      }
    },
    aussehen: { de: ["Milchige Augen", "Die Augen sind milchig weiß getrübt, wie bei einem alten Blinden."], en: ["Milky Eyes", "The eyes are clouded milky white, like an old blind man's."], toenung: null, dauer: { value: 7, unit: "days" } },
    de: {
      name: "Kammer der hundert Sonnen", ausloeser: AUS.betreten.de,
      beschreibung: "Die Decke ist mit geschliffenen Kristallen besetzt, in der Mitte steht ein Spiegel auf einem Sockel.",
      wirkung: "Der Spiegel fängt einen Lichtstrahl, und die Kristalle bündeln ihn zu hundert Sonnen im Raum.",
      entschaerfen: "den Spiegel mit einem Tuch verhängen und die Rune im Sockel bannen", ruecksetzen: "Lädt sich nach 10 Minuten neu."
    },
    en: {
      name: "Chamber of a Hundred Suns", ausloeser: AUS.betreten.en,
      beschreibung: "The ceiling is studded with cut crystals, a mirror stands on a pedestal at the centre.",
      wirkung: "The mirror catches a ray of light, and the crystals focus it into a hundred suns in the room.",
      entschaerfen: "cover the mirror with a cloth and dispel the rune in the pedestal", ruecksetzen: "Recharges after 10 minutes."
    }
  },
  {
    id: "raum8-fluesterkammer", art: "raum", stufe: 8, merkmale: ["magical", "mental", "auditory", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 0, wirkung: 30, werte: null,
    entschaerfen: [["occultism", 30, 2], ["arcana", 30, 2]],
    wurf: {
      typ: "will", dc: 29, grade: {
        ke: [], e: [D("7d8+5", "mental"), Z("stupefied", 1, "m1")],
        f: [D("14d8+10", "mental"), Z("confused", null, "r1"), Z("stupefied", 2, "t1")],
        kf: [D("28d8+20", "mental"), Z("frightened", 2), T("die Stimmen bleiben im Kopf:", "the voices stay in the head:"), Z("confused", null, "t1"), Z("stupefied", 2, "w1")]
      }
    },
    de: {
      name: "Flüsterkammer", ausloeser: "Eine Kreatur betritt den Raum und spricht ein Wort.",
      beschreibung: "Ein runder Raum mit einer Kuppel, jedes Geräusch kehrt vielfach und verzerrt zurück.",
      wirkung: "Das Echo antwortet mit tausend Stimmen, die sich in den Geist aller im Raum fressen.",
      entschaerfen: "in völliger Stille die Rune im Scheitel der Kuppel bannen", ruecksetzen: "Lädt sich nach 1 Stunde neu."
    },
    en: {
      name: "Whispering Chamber", ausloeser: "A creature enters the room and speaks a word.",
      beschreibung: "A round room beneath a dome, every sound returns many times over and distorted.",
      wirkung: "The echo answers with a thousand voices that eat into the minds of everyone in the room.",
      entschaerfen: "dispel the rune at the crown of the dome in complete silence", ruecksetzen: "Recharges after 1 hour."
    }
  },
  {
    id: "raum8-golemkammer", art: "raum", stufe: 8, merkmale: ["magical", "trap"],
    heimlichkeit: 30, rang: 2, ausloeser: 5, wirkung: 0, werte: null,
    entschaerfen: [["arcana", 30, 2], ["crafting", 30, 2]],
    beschwoerung: { stufe: 11, runden: null, ort: "falle" },
    de: {
      name: "Ruhender Wächter", ausloeser: AUS.betreten.de,
      beschreibung: "In einer Nische steht eine reglose Gestalt aus Stein und Eisen, auf ihrer Stirn ein erloschenes Zeichen.",
      wirkung: "Das Zeichen leuchtet auf: Eine Kreatur bis Stufe 11 tritt aus der Nische und würfelt sofort Initiative. Sie greift zuerst an, wer die Falle ausgelöst hat, und bleibt, bis sie besiegt ist. Welche Kreatur, legt die SL beim Setzen der Falle fest.",
      entschaerfen: "das Zeichen auf der Stirn auskratzen, bevor es aufleuchtet", ruecksetzen: "Keines."
    },
    en: {
      name: "Dormant Warden", ausloeser: AUS.betreten.en,
      beschreibung: "A motionless figure of stone and iron stands in a niche, an extinguished sign on its brow.",
      wirkung: "The sign lights up: a creature of up to level 11 steps out of the niche and rolls initiative at once. It attacks whoever triggered the trap first and stays until defeated. The GM picks the creature when placing the trap.",
      entschaerfen: "scratch out the sign on its brow before it lights up", ruecksetzen: "None."
    }
  }
];
