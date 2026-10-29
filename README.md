# PF2e-ActiveTerrain

Paint terrain for Pathfinder 2e in Foundry VTT 14 with a brush and stamp instead of waypoints, and
let hidden traps trigger, be found and be disabled at the table. The module is available in English
and German; Foundry uses each player's language setting.

*Deutsche Beschreibung weiter unten.*

The gamemaster paints terrain directly onto the map, freehand with a soft edge or cell by cell on the
grid. The module turns it into Foundry regions with the matching movement costs, so Foundry and the
PF2e system deduct them on their own, in and out of combat, when dragging tokens and in the ruler.
When a creature enters a narrow surface, uneven ground or hazardous terrain, a card with the matching
check is posted to chat.

## Features

- **Five terrain types** following the Player Core (p. 423):
  - Difficult Terrain: each square costs 5 feet more, no Step into it
  - Greater Difficult Terrain: each square costs 10 feet more, no Step into it
  - Hazardous Terrain: a card with a saving throw and damage when moving through
    (basic save: after the roll the GM gets the degree of success and which damage applies, critical
    failure double, and the damage is rolled, as with traps)
  - Narrow Surface: a card with Balance (Acrobatics) on entering, off-guard
  - Uneven Ground: a card with Balance (Acrobatics) on entering, off-guard
- **Terrain on top of terrain**: the types form three groups, costs (difficult, greater difficult),
  footing (narrow surface, uneven ground) and hazard. Within a group, new paint replaces the old.
  Types of different groups lie on top of each other and both apply, for example hazardous terrain
  inside difficult terrain. Greater difficult inside difficult counts once: 10 feet more, not 15.
- **Movement costs via Foundry regions**: the terrain is an ordinary region with the "Modify Movement
  Cost" behavior, so other modules that read Foundry's movement costs see it too. The regions are
  hidden in Foundry's Regions layer and protected: deleting all regions there leaves the terrain in
  place, and the module recreates missing regions.
- **Freehand painting**: a square counts when at least half of it is painted. Grid painting can be
  switched on in the settings. Pieces smaller than one square, such as slivers left by the eraser,
  remove themselves after three seconds.
- **Values per area**: DC, damage, damage type and saving throw can be set for each painted area.
  Without a DC, a DC by the party level is used (level 4: DC 19). With the values tool selected, a click
  on a narrow, uneven or hazardous area shows its values and changes them for exactly that connected area,
  including what is already painted; a click elsewhere sets the values for new painting.
- **Check cards**: one card when a creature enters an area from outside, at the moment it visibly
  covers a square of the area at least halfway during its move, not when the move starts. Moving on
  inside the area gives no further card, even over several turns; leaving and entering again gives a
  new one. A creature only counts as having left when it no longer touches the area at all, so cutting
  across a corner inside the area gives no second card. Further checks are up to the gamemaster, the
  roll on the card can be clicked again. Cards are whispered to the gamemaster and the token's owners;
  the gamemaster applies damage. Flying or teleporting creatures get no card.
- **The move stops at the check**: on a narrow surface, uneven ground or hazardous terrain the move
  ends exactly where the card is triggered, with the token fully on that square. Difficult and
  greater difficult terrain never stop a move, they only cost movement.
- **Badges**: creatures standing on terrain show a small badge with the terrain's symbol. Chests,
  loot and map markers get none. Where the badges sit at the token can be set.
- **Player display**: players see the dashed outlines and the badges by default, never the filled
  squares the gamemaster sees, and only where they currently see or have already explored, like the
  map itself; terrain behind a closed door stays hidden. Each player can hide the outlines. Movement
  costs always apply.
- **Hidden terrain**: with the "Paint hidden" switch (crossed-out eye) every brush paints terrain the
  players do not see: no outline, no badge. Movement costs, check cards and stops still apply. The
  gamemaster sees hidden terrain dotted instead of dashed. The "Reveal" brush (eye) makes hidden
  terrain under it visible to players without changing the terrain; painting the same type visibly
  over it does the same.

## Hazards and traps

Hazards are tokens of PF2e hazard actors, usually placed hidden by the gamemaster.

- **Walking into a hidden trap**: when a creature reaches a square of the trigger area, the move stops
  there, the trap is revealed and its trigger action fires. One card lists every creature in the
  effect area, each with its own saving throw; after the roll the damage for its degree of success is
  rolled from the hazard's text. Strikes are rolled with PF2e's own attack.
- **Trigger and effect area**: two separate radii in feet. Without a value the trap triggers only on
  its own squares, and the effect uses the area named in the hazard's data (a template or "within X
  feet"). The gamemaster sets both per token in the hazard menu. Other modules can bring them along as
  the flags `gelaendepinsel.ausloeser` and `gelaendepinsel.wirkung` on the token or the actor.
- **Line of effect**: trigger and effect stop at walls that block movement and at closed doors. Open
  doors let them through, walls that only block sight do not stop them.
- **Finding**: only by Perception. A character using the exploration activity Search rolls secretly
  when starting a move toward a hidden trap and, on a success, stops 15 feet from its trigger area;
  this search zone ends at walls and closed doors, so nobody finds a trap behind a locked door. The
  minimum proficiency from the hazard's Stealth entry applies. The Seek action reveals traps within
  30 feet in line of sight whose Stealth DC the result meets. Detect magic reports magic within 30 feet
  by its rank; an advanced setting lets it reveal magical traps.
- **Disabling**: the hazard menu posts a card with the checks from the hazard's Disable entry. A check
  counts only for a creature adjacent to the hazard and with the required proficiency. The number of
  successes needed is read from the text; a critical failure triggers the trap.
- **Trigger from afar**: for example a stone thrown onto the plate. The trap reveals itself and hits
  whoever stands in the effect area.
- **Simple hazards** have no "Toggle Combat" button in the token HUD; complex hazards keep it to roll
  initiative.

## Search

- A magnifying glass in the token HUD of player characters turns on the exploration activity Search;
  the action is taken from the PF2e compendium if the character lacks it. Clicking it again stops
  searching.
- Searching lasts 10 minutes of game time (house rule). World time runs while somebody searches, six
  seconds every six seconds, not while the game is paused or in combat. Moving while searching costs
  time as well, 150 feet per minute.
- While a character searches, small cartoon eyes beside its token look left and right and blink,
  visible to everyone.

## How to use

### Gamemaster

1. Choose the "PF2e-ActiveTerrain" tool in the left toolbar (mountain with sun).
2. Choose a terrain type. Hovering a button shows the rule in short.
3. Choose the brush size: ½, 1, 2 or 3 squares. Exactly one size is active; the default is one square.
4. Paint with the left mouse button held down. Fast strokes leave no gaps. To combine terrain, paint
   a type of another group over it.
5. Erase: choose the eraser, or use the right mouse button with any brush. The eraser previews what
   will remain and removes all types.
6. Set values: the button with the sliders opens a window for DC, damage (e.g. `2d6`), damage type and
   saving throw. They apply to everything painted afterwards as narrow, uneven or hazardous. An empty
   DC means the DC by party level.
7. Hazards: the skull button in the token HUD of a hazard opens its menu: trigger one of its actions,
   trigger from afar, reveal, offer disabling, set trigger and effect area.
8. Hidden terrain: turn on the switch with the crossed-out eye; everything you paint until you turn it
   off is hidden from players. The "Reveal" brush (eye) shows it to them where you paint over it.

### Players

The outlines are shown by default. The terrain button (mountain) in the left toolbar hides them and
shows them again. The toolbar
then returns to the token tools by itself. The magnifying glass in the token HUD of your character
starts and stops Search.

### Settings

Under "Configure Settings", per client:

- **Display**: Smooth (default), Simple along the grid (easier on older computers) or Off. Costs
  always apply.
- **Advanced: Opacity of the terrain lines**
- **Advanced: Terrain line width**
- **Advanced: Faintly shade counting squares** (gamemaster only)
- **Advanced: Position of the badges at the token**: right or left side, from the top or from the
  bottom, or above or below the token side by side. Default is right side from the top.
- **Advanced: Paint on the grid instead of freehand**

For the whole world (gamemaster):

- **Advanced: Known terrain (house rule)**: a creature that already crossed a square of a narrow surface or
  uneven ground and rolled does not roll there again (for that creature and scene). Off by default: by the
  rules every crossing needs a roll. Hazardous terrain always deals damage.
- **Advanced: Detect magic reveals magical traps within 30 feet**: by the rules the spell only tells
  whether magic is present; when enabled it also reveals hidden magical traps to everyone.

## Requirements

- Foundry VTT 14 (verified 14.369)
- Pathfinder 2e 8.6.0 or later

## Installation

Manifest URL:

```
https://github.com/Nitrolaus/PF2e-ActiveTerrain/releases/latest/download/module.json
```

- **Own Foundry server**: on the setup screen go to "Add-on Modules", "Install Module", and paste the
  address into "Manifest URL".
- **The Forge**: in the Bazaar choose "Install From Manifest" and paste the address.

Then enable the module in your world under "Manage Modules".

## Works with

The module runs on its own. If the reaction_monitor module is active, a Reflex card is added when a
creature on a narrow surface or uneven ground is hit or fails a saving throw.

When a move stops at a check, the module calls the hook `gelaendepinselAnhalten` with
`{ tokenId, sceneId }` on every client, so modules that move tokens themselves can stop their own
movement there.

## Bugs and requests

Please report them here on GitHub under "Issues". Helpful: the versions of Foundry, PF2e and this
module, what you did, what happened and, if possible, a screenshot.

## Author and maintainer

Sarevoc.

No third-party graphics, fonts or libraries are included.

## Coding

Idea, specifications, rule interpretation and testing at the table come from Sarevoc. The code was
written by Claude, the AI by Anthropic, following these specifications. Before each release the
automated tests in the `tests` folder run (with Node.js); the version is then tried in a running
Foundry world.

## Deployment

Each version is published as a release here on GitHub, with `module.json` and
`pf2e-activeterrain.zip`. The manifest URL always points to the latest release, so Foundry reports
new versions by itself. The module ID is `gelaendepinsel`.

## License

MIT, see `LICENSE`.

---

# Deutsch

Gelände für Pathfinder 2e in Foundry VTT 14 malen, mit Pinsel und Stempel statt mit Wegpunkten, und
versteckte Fallen am Tisch auslösen, finden und entschärfen. Es gibt das Modul auf Deutsch und
Englisch; Foundry nimmt die Sprache, die jeder Spieler eingestellt hat.

Die Spielleitung malt Gelände direkt auf die Karte, frei mit weichem Rand oder Feld für Feld am
Raster. Das Modul legt daraus Foundry-Regionen mit den passenden Bewegungskosten an. Foundry und das
PF2e-System ziehen die Kosten dann selbst ab, im Kampf und außerhalb, beim Ziehen von Tokens genauso
wie im Lineal. Betritt eine Figur schmale Oberflächen, unebenen Boden oder gefährliches Gelände,
kommt eine Karte mit dem passenden Wurf in den Chat.

## Was das Modul kann

- **Fünf Geländearten** nach den Kernregeln (Spieler, S. 423):
  - Schwieriges Gelände: jedes Feld kostet 5 Fuß (1,50 m) mehr, kein Schritt hinein
  - Sehr schwieriges Gelände: jedes Feld kostet 10 Fuß (3 m) mehr, kein Schritt hinein
  - Gefährliches Gelände: beim Hindurchgehen eine Karte mit Rettungswurf und Schaden
    (einfacher Rettungswurf: danach meldet die Karte der Spielleitung Erfolgsgrad und Schaden, kritischer
    Fehlschlag doppelt, und würfelt den Schaden, wie bei den Fallen)
  - Schmale Oberfläche: beim Betreten eine Karte mit Balancieren (Akrobatik), Auf dem Falschen Fuß
  - Unebener Boden: beim Betreten eine Karte mit Balancieren (Akrobatik), Auf dem Falschen Fuß
- **Gelände übereinander**: Die Arten bilden drei Gruppen, Kosten (schwierig, sehr schwierig), Halt
  (schmale Oberfläche, unebener Boden) und Gefahr. In einer Gruppe ersetzt neu Gemaltes das Alte.
  Arten verschiedener Gruppen liegen übereinander und wirken beide, etwa gefährliches Gelände in
  schwierigem. Sehr schwierig in schwierigem zählt einmal: 10 Fuß mehr, nicht 15.
- **Bewegungskosten über Foundry-Regionen**: Das Gelände ist eine gewöhnliche Region mit dem
  Verhalten "Bewegungskosten ändern". Andere Module, die Foundrys Bewegungskosten lesen, sehen es
  ebenfalls. In Foundrys Regionen-Ebene sind diese Regionen ausgeblendet und geschützt: Wer dort alle
  Regionen löscht, behält sein Gelände, fehlende Regionen legt das Modul neu an.
- **Frei malen**: Ein Feld zählt, wenn mindestens die Hälfte davon bemalt ist. Wer lieber ganze
  Felder malt, schaltet in den Einstellungen das Malen am Raster ein. Stücke unter einem Feld, etwa
  Reste nach dem Radieren, verschwinden nach drei Sekunden von selbst.
- **Werte je Fläche**: SG, Schaden, Schadensart und Rettungswurf lassen sich für jede gemalte Fläche
  festlegen. Ohne SG gilt ein SG nach der Stufe der Gruppe (Stufe 4: SG 19). Mit dem Werte-Knopf zeigt ein
  Klick auf eine schmale, unebene oder gefährliche Fläche ihre Werte und ändert sie für genau diese
  zusammenhängende Fläche, auch für schon Gemaltes; ein Klick daneben stellt die Werte für Neugemaltes ein.
- **Würfelkarten**: eine Karte, wenn eine Figur eine Fläche von außen betritt, und zwar in dem
  Augenblick, in dem sie während des Zugs ein Feld der Fläche sichtbar mindestens zur Hälfte bedeckt,
  nicht schon beim Losfahren. Wer sich in der Fläche weiterbewegt, bekommt keine weitere, auch nicht
  über mehrere Züge; wer sie verlässt und wieder betritt, bekommt eine neue. Verlassen hat eine Figur
  die Fläche erst, wenn sie sie gar nicht mehr berührt; wer innerhalb der Fläche schräg über eine Ecke
  zieht, bekommt keine zweite Karte. Weitere Würfe verlangt die Spielleitung selbst, der Wurf auf der
  Karte lässt sich noch einmal anklicken. Die Karten gehen geflüstert an die Spielleitung und an die,
  denen die Figur gehört; den Schaden wendet die Spielleitung selbst an. Wer fliegt oder sich
  teleportiert, bekommt keine Karte.
- **Der Zug hält an der Probe**: Bei schmaler Oberfläche, unebenem Boden und gefährlichem Gelände endet
  der Zug genau dort, wo die Karte ausgelöst wird, mit dem Token ganz auf diesem Feld. Schwieriges und
  sehr schwieriges Gelände halten nie an, sie kosten nur Bewegung.
- **Abzeichen**: Kreaturen, die auf Gelände stehen, tragen ein kleines Abzeichen mit dem Symbol der
  Geländeart. Kisten, Beute und Kartenmarken bekommen keins. Wo die Abzeichen am Token stehen, lässt
  sich einstellen.
- **Anzeige für Spieler**: Spieler sehen von Haus aus die gestrichelten Umrandungen und die
  Abzeichen, nie die gefüllten Felder der Spielleitung, und nur dort, wo sie gerade sehen oder schon
  waren, wie die Karte selbst; Gelände hinter einer geschlossenen Tür bleibt verborgen. Jeder Spieler
  kann die Umrandungen ausblenden. Die Bewegungskosten wirken immer, auch wenn die Anzeige aus ist.
- **Verborgenes Gelände**: Mit dem Schalter "Verborgen malen" (durchgestrichenes Auge) malt jeder
  Pinsel Gelände, das Spieler nicht sehen: keine Umrandung, kein Abzeichen. Bewegungskosten,
  Würfelkarten und der Halt wirken trotzdem. Die Spielleitung sieht verborgenes Gelände gepunktet statt
  gestrichelt. Der Pinsel "Aufdecken" (Auge) macht es dort sichtbar, wo er drüberstreicht, ohne am
  Gelände etwas zu ändern; dieselbe Art sichtbar darübermalen tut dasselbe.

## Gefahren und Fallen

Gefahren sind Tokens von PF2e-Gefahren, meist von der Spielleitung versteckt aufgestellt.

- **In eine versteckte Falle laufen**: Erreicht eine Figur ein Feld des Auslösebereichs, endet der Zug
  dort, die Falle wird aufgedeckt und ihre Auslöse-Aktion wirkt. Eine Karte nennt alle Figuren im
  Wirkungsbereich, jede mit ihrem eigenen Rettungswurf; nach dem Wurf wird der Schaden für ihren
  Erfolgsgrad aus dem Text der Gefahr gewürfelt. Angriffe würfelt PF2e mit seinem eigenen Angriff.
- **Auslöse- und Wirkungsbereich**: zwei getrennte Radien in Fuß. Ohne Angabe löst die Falle nur auf
  ihren eigenen Feldern aus, und die Wirkung nimmt den Bereich aus den Daten der Gefahr (Schablone oder
  "innerhalb von X Fuß"). Die Spielleitung stellt beides je Token im Menü der Gefahr ein. Andere Module
  können es als Flaggen `gelaendepinsel.ausloeser` und `gelaendepinsel.wirkung` am Token oder am
  Akteur mitbringen.
- **Wirkungslinie**: Auslöser und Wirkung enden an Wänden, die Bewegung sperren, und an geschlossenen
  Türen. Offene Türen lassen sie durch, Wände nur für die Sicht halten sie nicht auf.
- **Finden**: nur über Wahrnehmung. Eine Figur mit der Erkundung Absuchen würfelt geheim, wenn sie auf
  eine versteckte Falle zufährt, und hält bei Erfolg 15 Fuß vor deren Auslösebereich; diese Suchzone
  endet an Wänden und geschlossenen Türen, hinter einer verschlossenen Tür findet also niemand etwas. Der
  Mindestgrad aus dem Heimlichkeitseintrag der Gefahr gilt. Die Aktion Suchen deckt Fallen innerhalb von 30 Fuß in
  Sichtlinie auf, deren Heimlichkeits-SG das Ergebnis erreicht. Magie entdecken meldet Magie innerhalb
  von 30 Fuß nach seinem Grad; eine erweiterte Einstellung lässt es magische Fallen aufdecken.
- **Entschärfen**: Das Menü der Gefahr schickt eine Karte mit den Würfen aus ihrem Eintrag zum
  Entschärfen. Ein Wurf zählt nur für eine Figur, die neben der Gefahr steht und den nötigen Übungsgrad
  hat. Wie viele Erfolge nötig sind, steht im Text; ein kritischer Fehlschlag löst die Falle aus.
- **Aus der Ferne auslösen**: etwa mit einem Stein auf die Platte. Die Falle zeigt sich und trifft, wer
  im Wirkungsbereich steht.
- **Einfache Gefahren** haben im Token-HUD keinen Knopf "Kampf beitreten"; komplexe behalten ihn, um
  Initiative zu würfeln.

## Absuchen

- Eine Lupe im Token-HUD von Spielercharakteren schaltet die Erkundung Absuchen ein; fehlt die Aktion,
  holt das Modul sie aus dem PF2e-Kompendium. Ein zweiter Klick beendet das Absuchen.
- Absuchen dauert 10 Minuten Spielzeit (Hausregel). Solange jemand sucht, läuft die Weltzeit mit, alle
  sechs Sekunden sechs Sekunden, nicht bei Pause und nicht im Kampf. Gehen beim Absuchen kostet
  ebenfalls Zeit, 150 Fuß (45 m) pro Minute.
- Während eine Figur sucht, schauen neben ihrem Token kleine Zeichentrick-Augen nach links und rechts
  und blinzeln, für alle sichtbar.

## Anleitung

### Für die Spielleitung

1. In der Leiste links das Werkzeug "PF2e-ActiveTerrain" wählen (Berg mit Sonne).
2. Die Geländeart wählen. Beim Überfahren der Knöpfe steht die Regel kurz dabei.
3. Die Pinselgröße wählen: ½, 1, 2 oder 3 Felder. Es ist immer genau eine Größe an, Vorgabe ist
   ein Feld.
4. Mit gedrückter linker Maustaste malen. Auch beim schnellen Ziehen bleibt keine Lücke. Wer Gelände
   verbinden will, malt eine Art aus einer anderen Gruppe darüber.
5. Radieren: den Radierer wählen oder bei jedem Pinsel einfach die rechte Maustaste nehmen. Der
   Radierer zeigt beim Überfahren, was danach übrig bleibt, und nimmt alle Arten weg.
6. Werte festlegen: Der Knopf mit den Schiebereglern öffnet ein Fenster für SG, Schaden (etwa
   `2d6`), Schadensart und Rettungswurf. Das gilt für alles, was danach als schmal, uneben oder
   gefährlich gemalt wird. Bleibt der SG leer, gilt der SG nach Gruppenstufe.
7. Gefahren: Der Knopf mit dem Totenkopf im Token-HUD einer Gefahr öffnet ihr Menü: eine ihrer
   Aktionen auslösen, aus der Ferne auslösen, aufdecken, Entschärfen anbieten, Auslöser und Wirkung
   einstellen.
8. Verborgenes Gelände: den Schalter mit dem durchgestrichenen Auge einschalten; alles, was du malst,
   bis du ihn ausschaltest, sehen Spieler nicht. Der Pinsel "Aufdecken" (Auge) zeigt es ihnen dort, wo
   du drüberstreichst.

### Für Spieler

Die Umrandungen sind von Haus aus zu sehen. Der Knopf mit dem Berg in der Leiste links blendet sie
aus und wieder ein. Danach springt die Leiste von selbst zurück zu den Token-Werkzeugen. Die Lupe im Token-HUD der
eigenen Figur beginnt und beendet das Absuchen.

### Einstellungen

Unter "Module einstellen", jeweils für den eigenen Rechner:

- **Darstellung**: Weich (Standard), Einfach am Raster (schont ältere Rechner) oder Aus. Gerechnet
  wird immer.
- **Erweitert: Deckkraft der Geländelinien**: wie kräftig die Umrandungen zu sehen sind.
- **Erweitert: Strichstärke der Geländelinien**: wie dick die Umrandungen gezeichnet werden.
- **Erweitert: Zählende Felder blass hinterlegen** (nur Spielleitung): zeigt, welche Felder zur
  Hälfte bemalt sind und damit Bewegung kosten.
- **Erweitert: Lage der Abzeichen am Token**: rechts oder links daneben, von oben oder von unten,
  oder darüber oder darunter nebeneinander. Vorgabe ist rechts daneben von oben.
- **Erweitert: Am Raster malen statt frei**: malt ganze Felder, etwa für Räume mit geraden Wänden.

Für die ganze Welt (Spielleitung):

- **Erweitert: Bekanntes Gelände (Hausregel)**: Wer auf schmaler Oberfläche oder unebenem Boden schon einmal
  über ein Feld gegangen ist und gewürfelt hat, würfelt dort nicht mehr (für diese Figur und Szene). Von Haus
  aus aus: Nach den Regeln wird bei jedem Durchqueren gewürfelt. Gefährliches Gelände verletzt immer.
- **Erweitert: Magie entdecken deckt magische Fallen in 9 m auf**: Nach den Regeln sagt der
  Zauber nur, ob Magie da ist; eingeschaltet deckt er zusätzlich versteckte magische Fallen für alle
  auf.

## Installieren

Manifest-URL wie oben. Eigener Foundry-Server: auf der Startseite unter "Add-on-Module" auf "Modul
installieren" gehen und die Adresse unten bei "Manifest-URL" eintragen. The Forge: im Bazaar links
"Install From Manifest" wählen und die Adresse einfügen. Danach das Modul in der Welt unter "Module
verwalten" einschalten.

## Fehler und Wünsche

Bitte hier auf GitHub unter "Issues" melden, gern auf Deutsch.

## Urheber und Maintainer

Sarevoc. Code von Claude, der KI von Anthropic, nach Sarevocs Vorgaben; MIT-Lizenz.
