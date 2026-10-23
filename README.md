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
- **Movement costs via Foundry regions**: the terrain is an ordinary region with the "Modify Movement
  Cost" behavior, so other modules that read Foundry's movement costs see it too.
- **Freehand painting**: a square counts when at least half of it is painted. Grid painting can be
  switched on in the settings.
- **Values per area**: DC, damage, damage type and saving throw can be set for each painted area.
  Without a DC, a DC by the party level is used (level 4: DC 19).
- **Check cards**: whispered to the gamemaster and the token's owners. Rolls are made with the buttons
  on the card; the gamemaster applies damage. Flying or teleporting creatures get no card.
- **Badges**: creatures standing on terrain show a small badge with the terrain's symbol. Chests,
  loot and map markers get none.
- **Player display**: each player shows or hides the outlines. Movement costs always apply.

## How to use

### Gamemaster

1. Choose the "Terrain Brush" tool in the left toolbar (mountain with sun).
2. Choose a terrain type. Hovering a button shows the rule in short.
3. Choose the brush size: ½, 1, 2 or 3 squares. Exactly one size is active; the default is one square.
4. Paint with the left mouse button held down. Fast strokes leave no gaps.
5. Erase: choose the eraser, or use the right mouse button with any brush. The eraser previews what
   will remain.
6. Set values: the button with the sliders opens a window for DC, damage (e.g. `2d6`), damage type and
   saving throw. They apply to everything painted afterwards as narrow, uneven or hazardous. An empty
   DC means the DC by party level.

### Players

The "Show terrain" button (mountain) in the left toolbar turns the outlines on and off. The toolbar
then returns to the token tools by itself.

### Settings

Under "Configure Settings", per client:

- **Display**: Soft (default), Simple on the grid (easier on older computers) or Off. Costs always
  apply.
- **Advanced: Opacity of terrain lines**
- **Advanced: Highlight counting squares** (gamemaster only)
- **Advanced: Paint on the grid instead of freehand**

## Requirements

- Foundry VTT 14
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

Gelände für Pathfinder 2e in Foundry VTT 14 malen, mit Pinsel und Stempel statt mit Wegpunkten. Auf
Deutsch heißt das Modul Geländepinsel. Es gibt das Modul auf Deutsch und Englisch; Foundry nimmt die
Sprache, die jeder Spieler eingestellt hat.

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
- **Bewegungskosten über Foundry-Regionen**: Das Gelände ist eine gewöhnliche Region mit dem
  Verhalten "Bewegungskosten ändern". Andere Module, die Foundrys Bewegungskosten lesen, sehen es
  ebenfalls.
- **Frei malen**: Ein Feld zählt, wenn mindestens die Hälfte davon bemalt ist. Wer lieber ganze
  Felder malt, schaltet in den Einstellungen das Malen am Raster ein.
- **Werte je Fläche**: SG, Schaden, Schadensart und Rettungswurf lassen sich für jede gemalte Fläche
  festlegen. Ohne SG gilt ein SG nach der Stufe der Gruppe (Stufe 4: SG 19).
- **Würfelkarten**: Die Karten gehen geflüstert an die Spielleitung und an die, denen die Figur
  gehört. Gewürfelt wird über die Knöpfe in der Karte, den Schaden wendet die Spielleitung selbst an.
  Wer fliegt oder sich teleportiert, bekommt keine Karte.
- **Abzeichen**: Kreaturen, die auf Gelände stehen, tragen ein kleines Abzeichen mit dem Symbol der
  Geländeart. Kisten, Beute und Kartenmarken bekommen keins.
- **Anzeige für Spieler**: Jeder Spieler blendet die Umrandungen selbst ein oder aus. Die
  Bewegungskosten wirken immer, auch wenn die Anzeige aus ist.

## Anleitung

### Für die Spielleitung

1. In der Leiste links das Werkzeug "Geländepinsel" wählen (Berg mit Sonne).
2. Die Geländeart wählen. Beim Überfahren der Knöpfe steht die Regel kurz dabei.
3. Die Pinselgröße wählen: ½, 1, 2 oder 3 Felder. Es ist immer genau eine Größe an, Vorgabe ist
   ein Feld.
4. Mit gedrückter linker Maustaste malen. Auch beim schnellen Ziehen bleibt keine Lücke.
5. Radieren: den Radierer wählen oder bei jedem Pinsel einfach die rechte Maustaste nehmen. Der
   Radierer zeigt beim Überfahren, was danach übrig bleibt.
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
- **Erweitert: Zählende Felder blass hinterlegen** (nur Spielleitung): zeigt, welche Felder zur
  Hälfte bemalt sind und damit Bewegung kosten.
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
