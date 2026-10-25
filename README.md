# PF2e-ActiveTerrain

Paint terrain for Pathfinder 2e in Foundry VTT 14 with a brush and stamp instead of waypoints.
The module is available in English and German; Foundry uses each player's language setting.

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
  Without a DC, a DC by the party level is used (level 4: DC 19).
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
- **Player display**: each player shows or hides the outlines. Movement costs always apply.

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

### Players

The "Show terrain" button (mountain) in the left toolbar turns the outlines on and off. The toolbar
then returns to the token tools by itself.

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

Gelände für Pathfinder 2e in Foundry VTT 14 malen, mit Pinsel und Stempel statt mit Wegpunkten. Es
gibt das Modul auf Deutsch und Englisch; Foundry nimmt die Sprache, die jeder Spieler eingestellt hat.

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
  festlegen. Ohne SG gilt ein SG nach der Stufe der Gruppe (Stufe 4: SG 19).
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
- **Anzeige für Spieler**: Jeder Spieler blendet die Umrandungen selbst ein oder aus. Die
  Bewegungskosten wirken immer, auch wenn die Anzeige aus ist.

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

### Für Spieler

In der Leiste links schaltet der Knopf "Gelände anzeigen" (Berg) die Umrandungen ein und wieder
aus. Danach springt die Leiste von selbst zurück zu den Token-Werkzeugen.

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

## Installieren

Manifest-URL wie oben. Eigener Foundry-Server: auf der Startseite unter "Add-on-Module" auf "Modul
installieren" gehen und die Adresse unten bei "Manifest-URL" eintragen. The Forge: im Bazaar links
"Install From Manifest" wählen und die Adresse einfügen. Danach das Modul in der Welt unter "Module
verwalten" einschalten.

## Fehler und Wünsche

Bitte hier auf GitHub unter "Issues" melden, gern auf Deutsch.

## Urheber und Maintainer

Sarevoc. Code von Claude, der KI von Anthropic, nach Sarevocs Vorgaben; MIT-Lizenz.
