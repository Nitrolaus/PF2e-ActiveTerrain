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
const STUFEN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// Je Stufe: Rettungswurf-SG, Angriffsbonus, Gegnerstufe, Mindestschaden Fehlschlag und kritischer Fehlschlag, Fallen mit Aussehen.
const MASS = { 1: { dc: 17, bonus: 9, gegner: 2, aussehen: 2 }, 2: { dc: 18, bonus: 11, gegner: 3, aussehen: 3 },
  3: { dc: 20, bonus: 12, gegner: 4, aussehen: 4 }, 4: { dc: 21, bonus: 14, gegner: 5, aussehen: 5 }, 5: { dc: 23, bonus: 17, gegner: 8, f: 28, kf: 50, aussehen: 6 }, 6: { dc: 25, bonus: 19, gegner: 9, f: 45, kf: 90, aussehen: 7 },
  7: { dc: 27, bonus: 21, gegner: 10, f: 55, kf: 110, aussehen: 8 }, 8: { dc: 29, bonus: 23, gegner: 11, f: 65, kf: 130, aussehen: 9 },
  9: { dc: 31, bonus: 25, gegner: 12, f: 75, kf: 150, aussehen: 10 }, 10: { dc: 33, bonus: 27, gegner: 13, f: 85, kf: 170, aussehen: 11 } };

test("Je Stufe 32 Fallen, je Ort 8, 17 magisch, Kennungen eindeutig (Stufe 1 bis 10)", () => {
  assert.equal(FALLEN.length, 320);
  assert.equal(new Set(FALLEN.map((f) => f.id)).size, 320);
  for (const s of ["de", "en"]) assert.equal(new Set(FALLEN.map((f) => f[s].name)).size, 320, `Namen eindeutig ${s}`);
  assert.deepEqual([...new Set(FALLEN.map((f) => f.stufe))].sort((a, b) => a - b), STUFEN);
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

test("Herbeigerufene Gegner ab Stufe 5 drei Stufen über der Falle (Wunsch: Gegner Stufe 8 bei Stufe 5), bis Stufe 4 eine darüber", () => {
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

test("Wer auslöst, fällt um: Mindestschaden je Stufe (5: 28 und 50, 6: 45 und 90, 7: 55 und 110, 8: 65 und 130, 9: 75 und 150, 10: 85 und 170)", () => {
  const schnitt = (formel) => formel.split(/[,+]/u).reduce((summe, teil) => {
    const m = /(\d+)d(\d+)/u.exec(teil);
    if (m) return summe + Number(m[1]) * (Number(m[2]) + 1) / 2;
    const n = /^\(?(\d+)\)?/u.exec(teil);
    return summe + (n ? Number(n[1]) : 0);
  }, 0);
  for (const f of FALLEN.filter((x) => x.stufe >= 5 && x.wurf && x.wurf.grade.f.some((e) => e.d))) {
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

test("Äußere Veränderung: Stufe 1 zwei Fallen, je Stufe eine mehr, Stufe 5 sechs Fallen, Stufe 6 sieben, Stufe 7 acht, Stufe 8 neun, Stufe 9 zehn, Stufe 10 elf, Tönung als Farbe oder keine", () => {
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
  assert.ok(FALLEN.filter((f) => f.stufe <= 4).every((f) => lang(f).length === 0), "Stufe 1 bis 4 ohne lange Zustände");
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
  // Stufe 8: jede Falle ohne Gift und ohne Beschwörung hinterlässt Langes schon beim Fehlschlag oder Treffer,
  // der kritische Fehlschlag fast immer 1 Woche; neu Gelähmt und Verwirrt für 24 Stunden.
  const acht = FALLEN.filter((f) => f.stufe === 8);
  const mitLang8 = acht.filter((f) => !f.gift && !f.beschwoerung);
  assert.equal(mitLang8.length, 24);
  for (const f of mitLang8) {
    const leicht = f.wurf ? langeZustaende(f, "failure") : langeZustaende(f, "hit");
    assert.ok(leicht.length, `${f.id} ohne Langes beim Fehlschlag oder Treffer`);
  }
  const kritWoche8 = mitLang8.filter((f) => [...langeZustaende(f, "criticalFailure"), ...langeZustaende(f, "criticalHit")].some((z) => z.dauer === "w1"));
  assert.ok(kritWoche8.length >= 22, `Stufe 8 kritisch 1 Woche: ${kritWoche8.length}`);
  const slugs8 = new Set(acht.flatMap((f) => lang(f).map((z) => z.z)));
  for (const z of ["paralyzed", "confused", "petrified", "blinded", "doomed", "stupefied", "sickened", "slowed"]) assert.ok(slugs8.has(z), `Stufe 8 ${z}`);
  const starre = FALLEN.find((f) => f.id === "tuer8-totenstarre");
  assert.deepEqual(langeZustaende(starre, "criticalFailure").map((z) => [z.z, z.dauer]), [["paralyzed", "t1"], ["clumsy", "w1"]]);
  const salz = FALLEN.find((f) => f.id === "gelaende8-salzpfanne");
  assert.deepEqual(langeZustaende(salz, "criticalFailure").map((z) => [z.z, z.dauer]), [["petrified", "w1"]]);
  const fluester = FALLEN.find((f) => f.id === "raum8-fluesterkammer");
  assert.deepEqual(langeZustaende(fluester, "criticalFailure").map((z) => [z.z, z.dauer]), [["confused", "t1"], ["stupefied", "w1"]]);
  assert.ok(gradText(starre.wurf.grade.kf, "de").includes("{Gelähmt} für 24 Stunden"));
  // Stufe 9: Langes schon beim Fehlschlag oder Treffer, mindestens acht davon schon 1 Woche, kritisch immer 1 Woche;
  // neu Bewusstlos für 1 Woche und Blind und Taub zugleich.
  const neun = FALLEN.filter((f) => f.stufe === 9);
  const mitLang9 = neun.filter((f) => !f.gift && !f.beschwoerung);
  assert.equal(mitLang9.length, 24);
  const leicht9 = (f) => (f.wurf ? langeZustaende(f, "failure") : langeZustaende(f, "hit"));
  for (const f of mitLang9) assert.ok(leicht9(f).length, `${f.id} ohne Langes beim Fehlschlag oder Treffer`);
  assert.ok(mitLang9.filter((f) => leicht9(f).some((z) => z.dauer === "w1")).length >= 8, "Stufe 9 Fehlschlag 1 Woche");
  for (const f of mitLang9) assert.ok([...langeZustaende(f, "criticalFailure"), ...langeZustaende(f, "criticalHit")].some((z) => z.dauer === "w1"), `${f.id} kritisch ohne Woche`);
  const slugs9 = new Set(neun.flatMap((f) => lang(f).map((z) => z.z)));
  for (const z of ["unconscious", "petrified", "paralyzed", "blinded", "deafened", "confused", "doomed"]) assert.ok(slugs9.has(z), `Stufe 9 ${z}`);
  const ruhe = FALLEN.find((f) => f.id === "tuer9-ewige-ruhe");
  assert.deepEqual(langeZustaende(ruhe, "criticalFailure").map((z) => [z.z, z.dauer]), [["unconscious", "w1"]]);
  const stille = FALLEN.find((f) => f.id === "tuer9-stille");
  assert.deepEqual(langeZustaende(stille, "criticalFailure").map((z) => [z.z, z.dauer]), [["blinded", "w1"], ["deafened", "w1"]]);
  assert.ok(gradText(ruhe.wurf.grade.kf, "de").includes("{Bewusstlos} für 1 Woche"));
  // Stufe 10 (Wunsch: "etwas kürzere Zustände, dafür aber mehrere"): alles Lange hält 24 Stunden, keines 1 Woche;
  // beim Fehlschlag oder Treffer mindestens zwei, beim kritischen Fehlschlag oder Treffer mindestens drei.
  const zehn = FALLEN.filter((f) => f.stufe === 10);
  const mitLang10 = zehn.filter((f) => !f.gift && !f.beschwoerung);
  assert.equal(mitLang10.length, 24);
  for (const f of mitLang10) {
    const leicht = f.wurf ? langeZustaende(f, "failure") : langeZustaende(f, "hit");
    const schwer = f.wurf ? langeZustaende(f, "criticalFailure") : langeZustaende(f, "criticalHit");
    assert.ok(leicht.length >= 2, `${f.id} Fehlschlag ${leicht.length}`);
    assert.ok(schwer.length >= 3, `${f.id} kritisch ${schwer.length}`);
    assert.ok([...leicht, ...schwer].every((z) => z.dauer === "t1"), `${f.id} nur 24 Stunden`);
  }
  assert.ok(new Set(zehn.flatMap((f) => lang(f).map((z) => z.z))).size >= 10, "Stufe 10 viele verschiedene Zustände");
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

/*
 * Stufe 1 bis 4 (0.10.0, 07.11.2026: "gerecht für die normalen PF2e-Spieler, die nicht so starke Gruppen haben und
 * eventuell nicht so gut heilen können"). Maßstab: zerbrechliche Figur der Stufe (Elf, Magier, Konstitution +0) mit
 * 12, 18, 24 oder 30 TP. Ein Fehlschlag oder Treffer wirft sie mit vollen TP nicht um (höchster Wurf ohne anhaltenden
 * Schaden unter den TP), ein kritischer Fehlschlag tötet nie sofort (höchster Wurf unter dem Doppelten der TP).
 */
const GERECHT = { 1: { tp: 12, f: [7, 10], heim: [14, 17], ent: [15, 17] }, 2: { tp: 18, f: [10, 14], heim: [15, 18], ent: [15, 18] },
  3: { tp: 24, f: [14, 19], heim: [17, 20], ent: [17, 20] }, 4: { tp: 30, f: [17, 23], heim: [18, 22], ent: [18, 22] } };
const wert = (formel, hoechst) => formel.split("+").reduce((s, teil) => {
  const m = /^(\d+)d(\d+)$/u.exec(teil);
  return s + (m ? Number(m[1]) * (hoechst ? Number(m[2]) : (Number(m[2]) + 1) / 2) : Number(teil));
}, 0);
const schaden = (liste, hoechst) => (liste ?? []).filter((e) => e.d && (!hoechst || e.kat !== "persistent")).reduce((s, e) => s + wert(e.d, hoechst), 0);
const alleZustaende = (f) => [...Object.values(f.wurf?.grade ?? {}).flat(), ...(f.gift?.stufen.flat() ?? []), ...(f.trefferZ ?? []), ...(f.kritZ ?? [])].filter((e) => e.z);

test("Stufe 1 bis 4 gerecht: Fehlschlag wirft niemanden mit vollen TP um, kritisch kein Sofort-Tod", () => {
  for (const f of FALLEN.filter((x) => x.stufe <= 4)) {
    const g = GERECHT[f.stufe];
    if (f.wurf?.grade.f.some((e) => e.d)) {
      const s = schaden(f.wurf.grade.f, false);
      assert.ok(s >= g.f[0] && s <= g.f[1], `${f.id} Fehlschlag im Schnitt ${s}`);
      assert.ok(schaden(f.wurf.grade.f, true) < g.tp, `${f.id} Fehlschlag höchstens ${schaden(f.wurf.grade.f, true)}`);
    }
    if (f.wurf) assert.ok(schaden(f.wurf.grade.kf, true) < 2 * g.tp, `${f.id} kritisch höchstens ${schaden(f.wurf.grade.kf, true)}`);
    if (f.angriff) {
      assert.ok(schaden(f.angriff.schaden, true) < g.tp, `${f.id} Treffer höchstens ${schaden(f.angriff.schaden, true)}`);
      assert.ok(schaden(f.angriff.schaden, false) >= g.f[0] - 1, `${f.id} Treffer zu schwach`);
    }
    for (const stufe of f.gift?.stufen ?? []) assert.ok(schaden(stufe, true) < g.tp, `${f.id} Giftstufe höchstens ${schaden(stufe, true)}`);
    const anhaltend = [...Object.values(f.wurf?.grade ?? {}).flat(), ...(f.angriff?.schaden ?? [])].filter((e) => e.kat === "persistent");
    for (const e of anhaltend) assert.ok(wert(e.d, true) <= (f.stufe <= 2 ? 4 : 6), `${f.id} anhaltend ${e.d}`);
    assert.ok(f.heimlichkeit >= g.heim[0] && f.heimlichkeit <= g.heim[1], `${f.id} Heimlichkeit ${f.heimlichkeit}`);
    assert.ok(f.rang <= 1, `${f.id} Mindestgrad`);
    for (const [, dc, rang] of f.entschaerfen) assert.ok(dc >= g.ent[0] && dc <= g.ent[1] && rang <= 1, `${f.id} Entschärfen ${dc} (${rang})`);
  }
});

test("Stufe 1 bis 4 gerecht: nur kurze Zustände, nichts, was nur Heilung oder Rast abnimmt", () => {
  const verboten = ["drained", "doomed", "petrified", "unconscious", "paralyzed"];
  const tief = FALLEN.filter((x) => x.stufe <= 4);
  for (const f of tief) {
    for (const z of alleZustaende(f)) {
      assert.ok(!verboten.includes(z.z), `${f.id} ${z.z}`);
      assert.ok(!z.dauer || ["r1", "m1", "zug"].includes(z.dauer), `${f.id} ${z.z} ${z.dauer}`);
      assert.ok(!z.wert || z.wert <= 2, `${f.id} ${z.z} ${z.wert}`);
      if (["blinded", "fleeing", "fascinated", "confused", "slowed"].includes(z.z)) assert.ok(!z.dauer || z.dauer === "r1" || z.dauer === "zug", `${f.id} ${z.z} zu lang`);
      if (z.z === "stunned") assert.ok(z.wert === 1, `${f.id} Betäubt ${z.wert}`);
      if (z.z === "confused") assert.ok(f.stufe >= 3, `${f.id} Verwirrt unter Stufe 3`);
    }
    if (f.aussehen) assert.deepEqual(f.aussehen.dauer, { value: 1, unit: "days" }, `${f.id} Aussehen 1 Tag`);
    if (f.gift) assert.ok(["4 Runden", "6 Runden"].includes(f.gift.max.de), `${f.id} Giftdauer`);
  }
  assert.equal(tief.filter((f) => f.gift).length, 16, "je Stufe 4 Gifte");
  assert.equal(tief.filter((f) => f.angriff).length, 16, "je Stufe 4 Angriffsfallen");
  assert.ok(tief.filter((f) => alleZustaende(f).some((z) => z.z === "confused")).every((f) => f.stufe >= 3));
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
