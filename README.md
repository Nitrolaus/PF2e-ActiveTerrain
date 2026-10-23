# PF2e-ActiveTerrain

Gelände für Pathfinder 2e in Foundry VTT 14 malen, mit Pinsel und Stempel statt mit Wegpunkten.
Auf Deutsch heißt das Modul Geländepinsel, die Oberfläche ist deutsch.

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

## Voraussetzungen

- Foundry VTT 14
- Pathfinder 2e ab 8.6.0

## Installieren

Manifest-URL:

```
https://github.com/Nitrolaus/PF2e-ActiveTerrain/releases/latest/download/module.json
```

- **Eigener Foundry-Server**: auf der Startseite unter "Add-on-Module" auf "Modul installieren"
  gehen und die Adresse unten bei "Manifest-URL" eintragen.
- **The Forge**: im Bazaar links "Install From Manifest" wählen und die Adresse einfügen.

Danach das Modul in der Welt unter "Module verwalten" einschalten.

## Zusammenspiel

Das Modul läuft allein. Ist das Modul reaction_monitor aktiv, kommt dazu eine Reflexkarte, wenn
eine Figur auf schmalem oder unebenem Gelände getroffen wird oder einen Rettungswurf verfehlt.

## Fehler und Wünsche

Bitte hier auf GitHub unter "Issues" melden. Hilfreich sind die Fassungen von Foundry, PF2e und
diesem Modul, was du getan hast, was passiert ist und, wenn möglich, ein Bildschirmfoto.

## Urheber und Maintainer

Sarevoc.

Es sind keine fremden Grafiken, Schriften oder Bibliotheken enthalten.

## Coding

Idee, Vorgaben, Regelauslegung und die Tests am Spieltisch kommen von Sarevoc. Den Code hat Claude,
die KI von Anthropic, nach diesen Vorgaben geschrieben. Vor jeder Freigabe laufen die automatischen
Tests im Ordner `tests` (mit Node.js), danach wird die Fassung in einer laufenden Foundry-Welt
erprobt.

## Deployment

Jede Fassung erscheint als Release hier auf GitHub, mit `module.json` und
`pf2e-activeterrain.zip`. Die Manifest-URL zeigt immer auf das neueste Release; Foundry meldet
neue Fassungen dadurch von selbst. Die Modul-ID ist `gelaendepinsel`.

## Lizenz

MIT, siehe `LICENSE`.
