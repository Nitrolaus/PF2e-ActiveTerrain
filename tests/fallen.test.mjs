// Eigene Fallen (0.4.0), Logik ohne Foundry. Aufruf: node --test tests/fallen.test.mjs
// Prüft, dass die gebauten Akteure so aussehen, wie die Gefahren-Karte sie liest.
import test from "node:test";
import assert from "node:assert/strict";
import { FALLEN, DATEN_STAND } from "../scripts/fallen-daten.mjs";
import { akteurDaten, damageBefehl, gradText, klartext, LANGE_DAUER, langeZustaende, sprache, zustandEffekt, ZUSTAENDE } from "../scripts/fallen-logik.mjs";
import { absatzFuer, ausloeseAktion, befehle, entschaerfenWuerfe, mindestRang, schadenFuer } from "../scripts/gefahren-logik.mjs";

const SPRACHEN = ["de", "en"];
const bau = (f, s) => akteurDaten(f, s, DATEN_STAND);
const reaktion = (a) => a.items.find((it) => it.flags.gelaendepinsel.rolle === "ausloesen");
const als = (it) => ({ ...it, getFlag: () => undefined });
const STUFEN = [5, 6, 7];
// Je Stufe: Rettungswurf-SG, Angriffsbonus, Gegnerstufe, Mindestschaden Fehlschlag und kritischer Fehlschlag, Fallen mit Aussehen.
const MASS = { 5: { dc: 23, bonus: 17, gegner: 8, f: 28, kf: 50, aussehen: 6 }, 6: { dc: 25, bonus: 19, gegner: 9, f: 45, kf: 90, aussehen: 7 },
  7: { dc: 27, bonus: 21, gegner: 10, f: 55, kf: 110, aussehen: 8 } };

test("Je Stufe 32 Fallen, je Ort 8, 17 magisch, Kennungen eindeutig (Stufe 5, 6 und 7)", () => {
  assert.equal(FALLEN.length, 96);
  assert.equal(new Set(FALLEN.map((f) => f.id)).size, 96);
  assert.deepEqual([...new Set(FALLEN.map((f) => f.stufe))].sort(), STUFEN);
  for (const st of STUFEN) {
    const liste = FALLEN.filter((f) => f.stufe === st);
    assert.equal(liste.length, 32, `Stufe ${st}`);
    for (const art of ["tuer", "schloss", "gelaende", "raum"]) assert.equal(liste.filter((f) => f.art === art).length, 8, `${st} ${art}`);
    assert.equal(liste.filter((f) => f.merkmale.includes("magical")).length, 17, `Stufe ${st} magisch`);
  }
});

test("Werte je Stufe: Rettungswurf-SG, Mindestgrad höchstens Experte", () => {
  for (const f of FALLEN) {
    const wurf = f.wurf ?? f.gift;
    if (wurf) assert.equal(wurf.dc, MASS[f.stufe].dc, f.id);
    assert.ok(f.rang <= 2, `${f.id} Mindestgrad`);
  }
});

test("Herbeigerufene Gegner drei Stufen über der Falle (Wunsch: Gegner Stufe 8 bei Stufe 5)", () => {
  for (const st of STUFEN) {
    const rufen = FALLEN.filter((f) => f.stufe === st && f.beschwoerung);
    assert.ok(rufen.length >= 3, `Stufe ${st}`);
    for (const f of rufen) {
      assert.equal(f.beschwoerung.stufe, MASS[st].gegner, f.id);
      for (const s of SPRACHEN) assert.match(f[s].wirkung, new RegExp(`${MASS[st].gegner}`, "u"), `${f.id} ${s}`);
    }
  }
});

test("Jeder Akteur baut in beiden Sprachen, mit Heimlichkeit, Entschärfen und Auslöse-Reaktion", () => {
  for (const f of FALLEN) {
    for (const s of SPRACHEN) {
      const a = bau(f, s);
      assert.equal(a.type, "hazard");
      assert.equal(a.system.details.level.value, f.stufe);
      assert.equal(a.flags.gelaendepinsel.falle.stufe, f.stufe);
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

test("Wer auslöst, fällt um: Mindestschaden je Stufe (5: 28 und 50, 6: 45 und 90, 7: 55 und 110)", () => {
  const schnitt = (formel) => formel.split(/[,+]/u).reduce((summe, teil) => {
    const m = /(\d+)d(\d+)/u.exec(teil);
    if (m) return summe + Number(m[1]) * (Number(m[2]) + 1) / 2;
    const n = /^\(?(\d+)\)?/u.exec(teil);
    return summe + (n ? Number(n[1]) : 0);
  }, 0);
  for (const f of FALLEN.filter((x) => x.wurf && x.wurf.grade.f.some((e) => e.d))) {
    const text = reaktion(bau(f, "de")).system.description.value;
    const roh = (grad) => befehle(absatzFuer(text, grad), "Damage")[0].formel.replace(/\[[^\]]*\]/gu, "");
    assert.ok(schnitt(roh("failure")) >= MASS[f.stufe].f, `${f.id} Fehlschlag ${schnitt(roh("failure"))}`);
    assert.ok(schnitt(roh("criticalFailure")) >= MASS[f.stufe].kf, `${f.id} kritisch ${schnitt(roh("criticalFailure"))}`);
  }
});

test("Angriffsfallen: Angriff als PF2e-Angriff mit Bonus und Schaden, Reaktion weist darauf", () => {
  for (const f of FALLEN.filter((x) => x.angriff)) {
    const a = bau(f, "en");
    const angriff = a.items.find((it) => it.flags.gelaendepinsel.rolle === "angriff");
    assert.equal(angriff.type, "melee");
    assert.equal(angriff.system.bonus.value, MASS[f.stufe].bonus, f.id);
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

test("Äußere Veränderung: Stufe 5 sechs Fallen, Stufe 6 sieben, Stufe 7 acht, Tönung als Farbe oder keine", () => {
  for (const st of STUFEN) assert.equal(FALLEN.filter((f) => f.stufe === st && f.aussehen).length, MASS[st].aussehen, `Stufe ${st}`);
  const mit = FALLEN.filter((f) => f.aussehen);
  for (const f of mit) {
    const a = bau(f, "de").flags.gelaendepinsel.falle.aussehen;
    assert.ok(a.name && a.text);
    assert.ok(a.toenung === null || /^#[0-9a-f]{6}$/u.test(a.toenung), f.id);
  }
});

test("Lange Zustände (Wunsch: blind für 28 Stunden oder versteinert): ab Stufe 6, als PF2e-Effekt mit Laufzeit", () => {
  const lang = (f) => ["failure", "criticalFailure", "hit", "criticalHit"].flatMap((g) => langeZustaende(f, g));
  assert.ok(FALLEN.filter((f) => f.stufe === 5).every((f) => lang(f).length === 0), "Stufe 5 bleibt wie live");
  const sechs = FALLEN.filter((f) => f.stufe === 6);
  assert.ok(sechs.filter((f) => lang(f).length).length >= 24, "die meisten Fallen der Stufe 6 hinterlassen Langes");
  const slugs = new Set(sechs.flatMap((f) => lang(f).map((z) => z.z)));
  for (const z of ["blinded", "petrified", "doomed", "stupefied", "enfeebled", "clumsy", "deafened"]) assert.ok(slugs.has(z), z);
  // Stufe 7: jede Falle ohne Gift und ohne Beschwörung hinterlässt Langes, der kritische Fehlschlag meist 1 Woche.
  const sieben = FALLEN.filter((f) => f.stufe === 7);
  const mitLang = sieben.filter((f) => !f.gift && !f.beschwoerung);
  assert.equal(mitLang.length, 24);
  for (const f of mitLang) assert.ok(lang(f).length, `${f.id} ohne Langes`);
  const kritWoche = mitLang.filter((f) => [...langeZustaende(f, "criticalFailure"), ...langeZustaende(f, "criticalHit")].some((z) => z.dauer === "w1"));
  assert.ok(kritWoche.length >= 18, `kritisch 1 Woche: ${kritWoche.length}`);
  const slugs7 = new Set(sieben.flatMap((f) => lang(f).map((z) => z.z)));
  for (const z of ["petrified", "blinded", "unconscious", "fascinated", "doomed", "slowed", "sickened"]) assert.ok(slugs7.has(z), `Stufe 7 ${z}`);
  // Versteinert für 1 Woche (Gorgonentür), Zauberschlaf für 24 Stunden (Schlafdorn), nur beim kritischen Fehlschlag.
  const gorgo = FALLEN.find((f) => f.id === "tuer7-gorgonentuer");
  assert.deepEqual(langeZustaende(gorgo, "criticalFailure").map((z) => [z.z, z.dauer]), [["petrified", "w1"]]);
  assert.deepEqual(langeZustaende(gorgo, "failure").map((z) => [z.z, z.dauer]), [["slowed", "t1"]]);
  const schlaf = FALLEN.find((f) => f.id === "tuer7-schlafdorn");
  assert.deepEqual(langeZustaende(schlaf, "criticalFailure").map((z) => [z.z, z.dauer]), [["unconscious", "t1"]]);
  assert.ok(gradText(gorgo.wurf.grade.kf, "de").includes("{Versteinert} für 1 Woche"));
  // Blind 24 Stunden bei der Sonnenglyphe, versteinert 24 Stunden beim Basiliskensiegel, nur beim kritischen Fehlschlag.
  const sonne = FALLEN.find((f) => f.id === "tuer6-sonnenglyphe");
  assert.deepEqual(langeZustaende(sonne, "criticalFailure").map((z) => [z.z, z.dauer]), [["blinded", "t1"]]);
  assert.deepEqual(langeZustaende(sonne, "failure").map((z) => [z.z, z.dauer]), [["dazzled", "t1"]]);
  assert.deepEqual(langeZustaende(sonne, "success"), []);
  const basilisk = FALLEN.find((f) => f.id === "schloss6-basiliskensiegel");
  assert.deepEqual(langeZustaende(basilisk, "criticalFailure").map((z) => z.z), ["petrified"]);
  // Der Effekt trägt den Zustand wie PF2es eigene Zaubereffekte, mit Wert und Laufzeit.
  const e = zustandEffekt({ z: "stupefied", wert: 3, dauer: "w1" }, FALLEN.find((f) => f.id === "schloss6-wahnsiegel"), "de");
  assert.equal(e.type, "effect");
  assert.equal(e.name, "Benommen 3 (Wahnsiegel)");
  assert.deepEqual(e.system.duration, { value: 7, unit: "days", expiry: "turn-start", sustained: false });
  assert.deepEqual(e.system.rules, [{ key: "GrantItem", uuid: "Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg", inMemoryOnly: true, alterations: [{ mode: "override", property: "badge-value", value: 3 }] }]);
  assert.equal(e.system.level.value, 6);
  assert.deepEqual(e.flags.gelaendepinsel.langzeit, { falle: "schloss6-wahnsiegel", zustand: "stupefied" });
  const blind = zustandEffekt({ z: "blinded", wert: null, dauer: "t1" }, sonne, "en");
  assert.equal(blind.name, "Blinded (Sun Glyph)");
  assert.deepEqual(blind.system.duration, { value: 24, unit: "hours", expiry: "turn-start", sustained: false });
  assert.equal(blind.system.rules[0].alterations, undefined, "ohne Wert keine Änderung");
  assert.deepEqual(Object.keys(LANGE_DAUER), ["t1", "w1"]);
  // Der Text der Karte nennt die Dauer.
  assert.ok(gradText(sonne.wurf.grade.kf, "de").includes("{Blind} für 24 Stunden"));
  assert.ok(gradText(FALLEN.find((f) => f.id === "tuer6-verwesungsfluch").wurf.grade.kf, "de").includes("{Todgeweiht 1} für 1 Woche"));
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
