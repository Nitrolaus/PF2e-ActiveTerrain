// Eigene Fallen (0.4.0), Logik ohne Foundry. Aufruf: node --test tests/fallen.test.mjs
// Prüft, dass die gebauten Akteure so aussehen, wie die Gefahren-Karte sie liest.
import test from "node:test";
import assert from "node:assert/strict";
import { FALLEN, DATEN_STAND } from "../scripts/fallen-daten.mjs";
import { akteurDaten, damageBefehl, gradText, klartext, sprache, ZUSTAENDE } from "../scripts/fallen-logik.mjs";
import { absatzFuer, ausloeseAktion, befehle, entschaerfenWuerfe, mindestRang, schadenFuer } from "../scripts/gefahren-logik.mjs";

const SPRACHEN = ["de", "en"];
const bau = (f, s) => akteurDaten(f, s, DATEN_STAND);
const reaktion = (a) => a.items.find((it) => it.flags.gelaendepinsel.rolle === "ausloesen");
const als = (it) => ({ ...it, getFlag: () => undefined });

test("32 Fallen Stufe 5, je Ort 8, Kennungen eindeutig (Wunsch: alle 8 behalten)", () => {
  assert.equal(FALLEN.length, 32);
  assert.equal(new Set(FALLEN.map((f) => f.id)).size, 32);
  for (const art of ["tuer", "schloss", "gelaende", "raum"]) assert.equal(FALLEN.filter((f) => f.art === art).length, 8, art);
  assert.ok(FALLEN.every((f) => f.stufe === 5));
});

test("Herbeigerufene Gegner Stufe 8 (Wunsch: Gegner Stufe 8)", () => {
  const rufen = FALLEN.filter((f) => f.beschwoerung);
  assert.equal(rufen.length, 3);
  assert.ok(rufen.every((f) => f.beschwoerung.stufe === 8));
  for (const f of rufen) for (const s of SPRACHEN) assert.match(f[s].wirkung, /8/u, `${f.id} ${s}`);
});

test("Jeder Akteur baut in beiden Sprachen, mit Heimlichkeit, Entschärfen und Auslöse-Reaktion", () => {
  for (const f of FALLEN) {
    for (const s of SPRACHEN) {
      const a = bau(f, s);
      assert.equal(a.type, "hazard");
      assert.equal(a.system.details.level.value, 5);
      assert.equal(a.system.attributes.stealth.value + 10, f.heimlichkeit, f.id);
      assert.equal(mindestRang(a.system.attributes.stealth.details), f.rang, `${f.id} Mindestgrad`);
      const wege = entschaerfenWuerfe(a.system.details.disable);
      assert.deepEqual(wege.map((w) => [w.typ, w.dc, w.rang]), f.entschaerfen, `${f.id} ${s} Entschärfen`);
      const items = a.items.map(als);
      assert.equal(ausloeseAktion(items)?.name, a.items[0].name, `${f.id} Auslöse-Reaktion`);
      assert.equal(a.flags.gelaendepinsel.falle.id, f.id);
      assert.equal(a.flags.gelaendepinsel.wirkung, f.wirkung ?? 0);
      assert.doesNotMatch(klartext(reaktion(a).system.description.value, s), /@|<|\[/u, `${f.id} ${s} Klartext`);
    }
  }
});

test("Rettungswurf-Fallen: Schaden je Erfolgsgrad aus dem Absatz, Zusatzschaden des Grads im selben Wurf", () => {
  for (const f of FALLEN.filter((x) => x.wurf || x.gift)) {
    for (const s of SPRACHEN) {
      const text = reaktion(bau(f, s)).system.description.value;
      const wurf = befehle(text, "Check")[0];
      assert.equal(wurf.basic, false, `${f.id}: Grade stehen ausgeschrieben`);
      for (const grad of ["criticalSuccess", "success", "failure", "criticalFailure"]) assert.notEqual(absatzFuer(text, grad), null, `${f.id} ${grad}`);
      assert.equal(schadenFuer(text, "criticalSuccess", false), null, `${f.id} kritischer Erfolg ohne Schaden`);
      const fehl = schadenFuer(text, "failure", false);
      const krit = schadenFuer(text, "criticalFailure", false);
      if (f.wurf?.grade.f.some((e) => e.d)) assert.ok(fehl?.formeln?.length === 1, `${f.id} Fehlschlag ein Wurf`);
      if (f.wurf?.grade.kf.some((e) => e.d) || f.gift) assert.ok(krit?.formeln?.length === 1, `${f.id} kritischer Fehlschlag ein Wurf`);
    }
  }
  const flamme = reaktion(bau(FALLEN.find((f) => f.id === "tuer-flammenklinke"), "de")).system.description.value;
  assert.deepEqual(schadenFuer(flamme, "failure", false).formeln, ["10d6[fire],2d6[persistent,fire]"]);
  assert.deepEqual(schadenFuer(flamme, "criticalFailure", false).formeln, ["20d6[fire],3d6[persistent,fire]"]);
});

test("Wer auslöst, fällt um: Fehlschlag im Schnitt mindestens 28, kritischer Fehlschlag mindestens 50 Schaden", () => {
  const schnitt = (formel) => formel.split(/[,+]/u).reduce((summe, teil) => {
    const m = /(\d+)d(\d+)/u.exec(teil);
    if (m) return summe + Number(m[1]) * (Number(m[2]) + 1) / 2;
    const n = /^\(?(\d+)\)?/u.exec(teil);
    return summe + (n ? Number(n[1]) : 0);
  }, 0);
  for (const f of FALLEN.filter((x) => x.wurf && x.wurf.grade.f.some((e) => e.d))) {
    const text = reaktion(bau(f, "de")).system.description.value;
    const roh = (grad) => befehle(absatzFuer(text, grad), "Damage")[0].formel.replace(/\[[^\]]*\]/gu, "");
    assert.ok(schnitt(roh("failure")) >= 28, `${f.id} Fehlschlag ${schnitt(roh("failure"))}`);
    assert.ok(schnitt(roh("criticalFailure")) >= 50, `${f.id} kritisch ${schnitt(roh("criticalFailure"))}`);
  }
});

test("Angriffsfallen: Angriff als PF2e-Angriff mit Bonus und Schaden, Reaktion weist darauf", () => {
  for (const f of FALLEN.filter((x) => x.angriff)) {
    const a = bau(f, "en");
    const angriff = a.items.find((it) => it.flags.gelaendepinsel.rolle === "angriff");
    assert.equal(angriff.type, "melee");
    assert.equal(angriff.system.bonus.value, 17);
    const rolls = Object.values(angriff.system.damageRolls);
    assert.equal(rolls.length, f.angriff.schaden.length);
    assert.ok(rolls.every((r) => r.damage && r.damageType));
    assert.equal(reaktion(a).flags.gelaendepinsel.hoechstens, f.angriff.hoechstens ?? null);
  }
  const lanzen = bau(FALLEN.find((f) => f.id === "tuer-kraftlanzen"), "de");
  assert.equal(reaktion(lanzen).flags.gelaendepinsel.hoechstens, 3);
  assert.deepEqual(lanzen.items[1].system.traits.value, ["magical"]);
});

test("Auslöseart: Tür beim Öffnen, Schloss am Knopf, sonst Betreten", () => {
  for (const f of FALLEN) {
    const art = bau(f, "de").flags.gelaendepinsel.falle.ausloesung;
    assert.equal(art, { tuer: "tuer", schloss: "knopf" }[f.art] ?? "betreten", f.id);
  }
});

test("Äußere Veränderung: sechs Fallen, Tönung als Farbe oder keine", () => {
  const mit = FALLEN.filter((f) => f.aussehen);
  assert.equal(mit.length, 6);
  for (const f of mit) {
    const a = bau(f, "de").flags.gelaendepinsel.falle.aussehen;
    assert.ok(a.name && a.text);
    assert.ok(a.toenung === null || /^#[0-9a-f]{6}$/u.test(a.toenung), f.id);
  }
});

test("Bausteine: Schaden, Zustände, Satzbau", () => {
  assert.equal(damageBefehl([{ d: "6d10+12", typ: "piercing" }, { d: "2d6", typ: "bleed", kat: "persistent" }]), "@Damage[(6d10+12)[piercing],2d6[persistent,bleed]]");
  assert.equal(gradText([], "de"), "Keine Wirkung.");
  const satz = gradText([{ d: "4d6", typ: "fire" }, { z: "prone" }, { z: "stunned", wert: 1, dauer: "r1" }], "de");
  assert.equal(satz, "@Damage[4d6[fire]], @UUID[Compendium.pf2e.conditionitems.Item.j91X7x0XSomq8d60]{Liegend} und @UUID[Compendium.pf2e.conditionitems.Item.dfCMdR4wnpbYNTix]{Betäubt 1} für 1 Runde.");
  assert.equal(sprache("de"), "de");
  assert.equal(sprache("en"), "en");
  assert.equal(sprache("fr"), "en");
  for (const [id] of Object.values(ZUSTAENDE)) assert.match(id, /^[A-Za-z0-9]{16}$/u);
});

test("Nur - und _ als waagerechte Zeichen, keine typografischen Zeichen in den Texten", () => {
  const roh = JSON.stringify(FALLEN);
  assert.doesNotMatch(roh, /[–—−…„“” ]/u);
  for (const f of FALLEN) for (const s of SPRACHEN) assert.doesNotMatch(JSON.stringify(bau(f, s)), /[–—−…„“” ]/u, f.id);
});
