// Frei gemalte Flächen (0.2.0) ohne Foundry. Aufruf: node --test tests/flaeche.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { FEIN, bedeckung, flaechenAusStrichen, gelaendeWirkung, strichPunkte, vereinfachen, weicherRand, zaehlendeFelder } from "../scripts/flaeche.mjs";

const strich = (art, r, ...p) => ({ art, r, p });

test("50-Prozent-Regel: ein Feld zählt ab der Hälfte", () => {
  // Waagrechter Strich durch die Mitte der Zeile 5, Breite ein Feld: Zeile 5 voll, Nachbarn kaum.
  const flaechen = flaechenAusStrichen([strich("schwierig", 0.5, 2, 5.5, 8, 5.5)]);
  const felder = zaehlendeFelder(flaechen.schwierig);
  for (let s = 3; s <= 7; s += 1) assert.ok(felder.has(`${s},5`), `Feld ${s},5 zählt`);
  assert.equal(felder.has("5,4"), false);
  assert.equal(felder.has("5,6"), false);
  // Strich nur bis zur Mitte von Feld 10: knapp die Hälfte bemalt.
  const halb = flaechenAusStrichen([strich("schwierig", 0.5, 10.5, 2.5, 10.5, 2.5)]);
  const anteil = bedeckung(halb.schwierig, 10, 2);
  assert.ok(anteil > 0.7 && anteil < 0.9, `Kreis mit Radius 0,5 bedeckt etwa 78 Prozent (${anteil})`);
  const rand = flaechenAusStrichen([strich("schwierig", 0.5, 10, 2.5, 10, 2.5)]);
  assert.ok(bedeckung(rand.schwierig, 10, 2) < 0.5, "Kreis auf der Feldkante: unter der Hälfte");
  assert.equal(zaehlendeFelder(rand.schwierig).has("10,2"), false);
});

test("Radierer nimmt allen Arten, neue Art ersetzt die alte", () => {
  const flaechen = flaechenAusStrichen([
    strich("schwierig", 1, 2.5, 2.5, 8.5, 2.5),
    strich("sehr", 0.5, 5.5, 2.5, 5.5, 2.5),
    strich("radierer", 0.5, 7.5, 2.5, 7.5, 2.5)
  ]);
  const schwierig = zaehlendeFelder(flaechen.schwierig);
  assert.ok(zaehlendeFelder(flaechen.sehr).has("5,2"), "Sehr schwierig in der Mitte");
  assert.equal(schwierig.has("5,2"), false, "Dort nicht mehr schwierig");
  assert.equal(schwierig.has("7,2"), false, "Radiert");
  assert.ok(schwierig.has("6,2") && schwierig.has("3,2"), "Der Rest bleibt");
  for (const k of flaechen.sehr) assert.equal(flaechen.schwierig.has(k), false, "Ein Punkt hat eine Art");
});

test("Weicher Rand: geschlossener Zug um einen Fleck, ohne Treppenstufen der Feldgröße", () => {
  const punkte = strichPunkte(strich("schwierig", 1.5, 5, 5, 5, 5));
  const zuege = weicherRand(punkte);
  assert.equal(zuege.length, 1);
  const zug = zuege[0];
  assert.deepEqual(zug[0], zug.at(-1), "Geschlossen");
  for (const p of zug) {
    const r = Math.hypot(p.x - 5, p.y - 5);
    assert.ok(r > 1.2 && r < 1.7, `Rand nahe am Kreis (${r.toFixed(2)})`);
  }
  // Ein Ring hat zwei Züge (außen und innen).
  const ring = new Set([...strichPunkte(strich("x", 2, 10, 10, 10, 10))].filter((k) => !strichPunkte(strich("x", 1, 10, 10, 10, 10)).has(k)));
  assert.equal(weicherRand(ring).length, 2);
});

test("Striche vereinfachen: gerade Strecke wird zu zwei Punkten", () => {
  const punkte = Array.from({ length: 30 }, (_u, i) => ({ x: i * 0.2, y: 3 + (i % 2) * 0.01 }));
  assert.equal(vereinfachen(punkte).length, 2);
  const knick = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }];
  assert.deepEqual(vereinfachen(knick), [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 3 }]);
});

test("Wirkung wie PF2e: Fliegen und Teleport frei, Gelände-Ignorieren zählt", () => {
  const aktionen = { walk: {}, fly: {}, displace: { teleport: true } };
  const kreatur = (difficult = [], greater = []) => ({ isOfType: () => true, system: { movement: { terrain: { difficult: { ignored: difficult }, greater: { ignored: greater } } } } });
  const alles = [{ environment: "all", feature: "all" }];
  assert.equal(gelaendeWirkung(kreatur(), "schwierig", "walk", aktionen), 1);
  assert.equal(gelaendeWirkung(kreatur(), "schwierig", "fly", aktionen), 0, "Fliegen");
  assert.equal(gelaendeWirkung(kreatur(), "sehr", "displace", aktionen), 0, "Teleport");
  assert.equal(gelaendeWirkung(kreatur(alles), "schwierig", "walk", aktionen), 0, "Ignoriert schwieriges Gelände");
  assert.equal(gelaendeWirkung(kreatur(alles), "sehr", "walk", aktionen), 0.5, "Sehr schwierig dann halb");
  assert.equal(gelaendeWirkung(kreatur(alles, alles), "sehr", "walk", aktionen), 0);
  assert.equal(gelaendeWirkung(kreatur(), "schmal", "fly", aktionen), 0, "Fliegend keine Balance");
  assert.equal(gelaendeWirkung(kreatur(alles), "gefahr", "walk", aktionen), 1, "Gefahr bleibt am Boden");
  assert.equal(FEIN, 8);
});
