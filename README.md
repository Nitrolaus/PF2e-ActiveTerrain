# PF2e-ActiveTerrain

Deutsch: Geländepinsel. Modul für Foundry VTT mit dem System Pathfinder 2e: Gelände wird mit Pinsel
und Stempel auf die Karte gemalt, Feld für Feld, ohne Wegpunkte wie bei Wänden. Die Oberfläche ist
deutsch.

## Geländearten

- Schwieriges Gelände: +1,50 m je Feld
- Sehr schwieriges Gelände: +3 m je Feld
- Gefährliches Gelände: Karte mit Rettungswurf und Schaden beim Betreten
- Schmale Oberfläche: Karte mit Balancieren beim Betreten
- Unebener Boden: Karte mit Balancieren beim Betreten

Die Bewegungskosten laufen über Foundrys Regionen, Foundry und PF2e rechnen sie also selbst mit,
im Kampf und außerhalb. Schwierigkeitsgrad, Schaden, Schadensart und Rettungswurf lassen sich je
Fläche einstellen; ohne Angabe gilt ein SG nach der Stufe der Gruppe. Den Schaden wendet die
Spielleitung selbst an.

Spieler können die Umrandung des Geländes über einen eigenen Knopf ein- und ausblenden. Figuren
auf solchem Gelände bekommen ein kleines Abzeichen.

## Voraussetzungen

- Foundry VTT 14
- Pathfinder 2e ab 8.6.0

## Installieren

In Foundry auf der Startseite unter "Add-on-Module" auf "Modul installieren" gehen und unten bei
"Manifest-URL" diese Adresse eintragen:

```
https://github.com/Nitrolaus/PF2e-ActiveTerrain/releases/latest/download/module.json
```

Auf The Forge geht das genauso über das Foundry-Setup. Danach das Modul in der Welt unter
"Module verwalten" einschalten.

## Zusammenspiel

Das Modul läuft allein. Ist das Modul reaction_monitor aktiv, kommt dazu eine Reflexkarte, wenn
eine Figur auf schmalem oder unebenem Gelände getroffen wird oder einen Rettungswurf verfehlt.

## Urheber

Code und Bilder: Ju. Es sind keine fremden Grafiken, Schriften oder Bibliotheken enthalten.
