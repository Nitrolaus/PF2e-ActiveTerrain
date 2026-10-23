// Rechenkern des Geländepinsels ohne Foundry. Aufruf: node --test tests/
import test from "node:test";
import assert from "node:assert/strict";
import { ARTEN, pinselFelder, spurFelder, zuRechtecken, aussenkanten, aufschlagFuss, schluessel } from "../scripts/felder.mjs";

test("Stempelgrößen 1, 2 und 3", () => {
  assert.deepEqual(pinselFelder(5, 5, 1), ["5,5"]);
  assert.deepEqual(pinselFelder(5, 5, 2).sort(), ["5,5", "5,6", "6,5", "6,6"]);
  assert.equal(pinselFelder(5, 5, 3).length, 9);
  assert.ok(pinselFelder(5, 5, 3).includes("4,4") && pinselFelder(5, 5, 3).includes("6,6"), "3x3 liegt um die Mitte");
});

test("Durchgehende Spur: keine Lücken bei schneller Maus", () => {
  const spur = spurFelder({ spalte: 0, zeile: 0 }, { spalte: 6, zeile: 2 });
  assert.deepEqual(spur[0], { spalte: 0, zeile: 0 });
  assert.deepEqual(spur.at(-1), { spalte: 6, zeile: 2 });
  for (let i = 1; i < spur.length; i += 1) {
    const ds = Math.abs(spur[i].spalte - spur[i - 1].spalte);
    const dz = Math.abs(spur[i].zeile - spur[i - 1].zeile);
    assert.ok(ds <= 1 && dz <= 1, "Jedes Feld grenzt an das vorige");
  }
  assert.deepEqual(spurFelder({ spalte: 3, zeile: 3 }, { spalte: 3, zeile: 3 }), [{ spalte: 3, zeile: 3 }]);
});

test("Rechtecke decken genau die Felder ab", () => {
  const felder = ["1,1", "2,1", "3,1", "1,2", "2,2", "3,2", "5,2", "5,3"];
  const rechtecke = zuRechtecken(felder);
  const abgedeckt = new Set();
  for (const r of rechtecke) for (let z = r.zeile; z < r.zeile + r.hoehe; z += 1) for (let s = r.spalte; s < r.spalte + r.breite; s += 1) {
    assert.ok(!abgedeckt.has(schluessel(s, z)), "Kein Feld doppelt");
    abgedeckt.add(schluessel(s, z));
  }
  assert.deepEqual([...abgedeckt].sort(), [...felder].sort());
  assert.equal(rechtecke.length, 2, "3x2-Block und 1x2-Streifen");
});

test("Außenkanten: ein 2x1-Block hat 6 Randstücke", () => {
  assert.equal(aussenkanten(["0,0", "1,0"]).length, 6);
  assert.equal(aussenkanten(["0,0"]).length, 4);
});

test("Aufschlag nach PF2e: +5 und +10 Fuß, Proben-Gelände ohne Aufschlag", () => {
  assert.equal(aufschlagFuss("schwierig"), 5);
  assert.equal(aufschlagFuss("sehr"), 10);
  for (const art of ["gefahr", "schmal", "uneben"]) assert.equal(aufschlagFuss(art), 0);
  assert.equal(Object.keys(ARTEN).length, 5);
});
