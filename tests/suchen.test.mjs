// Suchen am Token (0.3.4), Logik ohne Foundry. Aufruf: node --test tests/suchen.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { augenStand, restMinuten, wegSekunden } from "../scripts/suchen-logik.mjs";

test("Weg beim Absuchen: 45 m pro Minute, 2 Sekunden je 1,5-m-Feld", () => {
  assert.equal(wegSekunden(5), 2);
  assert.equal(wegSekunden(60), 24);
  assert.equal(wegSekunden(1500), 600, "10 Minuten reichen für 300 Felder");
  assert.equal(wegSekunden(0), 0);
  assert.equal(wegSekunden(-5), 0);
  assert.equal(wegSekunden("x"), 0);
});

test("Augen: Mitte, links, rechts, zurück, dann Blinzeln, wie Variante C", () => {
  assert.deepEqual(augenStand(0), { blick: 0, lid: 1 });
  assert.equal(augenStand(0.3).blick, -1, "links");
  assert.equal(augenStand(0.6).blick, 1, "rechts");
  assert.equal(augenStand(0.84).blick, 0, "wieder in der Mitte");
  assert.ok(Math.abs(augenStand(0.47).blick) < 0.01, "auf halbem Weg von links nach rechts in der Mitte");
  assert.ok(Math.abs(augenStand(0.9).lid - 0.08) < 1e-9, "zu");
  assert.equal(augenStand(0.95).lid, 1, "wieder offen");
  assert.equal(augenStand(0.5).lid, 1, "beim Schauen offen");
  assert.deepEqual(augenStand(1.3), augenStand(0.3), "jeder Umlauf gleich");
});

test("Restzeit in ganzen Minuten Spielzeit", () => {
  assert.equal(restMinuten(700, 100), 10);
  assert.equal(restMinuten(700, 161), 9, "8 Minuten 59 aufgerundet");
  assert.equal(restMinuten(700, 700), 0);
  assert.equal(restMinuten(700, 900), 0, "nie unter 0");
  assert.equal(restMinuten(undefined, 0), 0);
});
