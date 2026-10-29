// Gefahren-Karte (0.3.0), Logik ohne Foundry. Aufruf: node --test tests/gefahren.test.mjs
// Die Texte stammen aus echten Gefahren (deutsch nach der Übersetzungskorrektur vom 25.10.2026, englisch aus PF2e).
import test from "node:test";
import assert from "node:assert/strict";
import {
  befehle, mitOption, textMitOption, absatzFuer, schadenFuer, mindestRang, entschaerfenWuerfe, noetigeErfolge,
  entschaerfenSchritt, ausloeseAktion, kennungFalle, kennungEntschaerfen, kennungGelaende, kennungLesen, wuerfeFuer, textOhneWuerfe
} from "../scripts/gefahren-logik.mjs";

test("Eine Karte für alle (0.3.10): Würfe je Figur, Text ohne Würfe", () => {
  const atem = "<p>Die Kreatur muss einen @Check[fortitude|dc:30]{Zähigkeitswurf} ablegen.</p><p>Dazu @Check[reflex|dc:28|basic] und @Damage[6d6[poison]].</p>";
  assert.deepEqual(wuerfeFuer(atem, "k:1"), ["@Check[fortitude|dc:30|options:k:1]{Zähigkeitswurf}", "@Check[reflex|dc:28|basic|options:k:1]"]);
  const ohne = textOhneWuerfe(atem, (b) => `<${b.typ}>`);
  assert.equal(ohne, "<p>Die Kreatur muss einen Zähigkeitswurf ablegen.</p><p>Dazu <reflex> und @Damage[6d6[poison]].</p>");
  assert.equal(textOhneWuerfe(atem), ohne.replace("<reflex>", "reflex"), "ohne Namen das Kürzel");
  assert.deepEqual(wuerfeFuer("<p>Kein Wurf.</p>", "k:1"), []);
});

const HERZ_ENTSCHAERFEN = "<p>@Check[arcana|dc:25] oder @Check[occultism|dc:25], um einen planaren Riss zu schließen, @Check[athletics|dc:21], um einen der Äste zu knicken, oder @UUID[Compendium.pf2e.spells-srd.Item.ksLCg62cLOojw3gN]{Planare Fessel} des 4. Grades, um einen Riss abzudichten. Für jeden geknickten Ast oder abgedichteten Riss wird eine Aktion aus dem Ablauf des Herzens entfernt. Sobald das Herz 0 Aktionen in seinem Ablauf erreicht, wird es deaktiviert.</p>";
const FALLGRUBE = "<p>Wenn eine Kreatur auf die Falltür tritt, fällt sie hinein, es sei denn, ihr gelingt [[/act grab-an-edge dc=16]]. Die Grube ist 20 Fuß/6 m tief und verursacht @Damage[10[bludgeoning]|options:fall-damage] Schaden.</p>";
const AUGEN = "<p><strong>Auslöser</strong> Eine Kreatur betritt das Feld</p><hr /><p><strong>Effekt</strong> Die Falle verursacht @Damage[(2d6+8)[void]] Schaden (@Check[fortitude|dc:26|basic] Rettungswurf).</p>";
const GEFRIEREN = "<p><strong>Effekt</strong> Jede Kreatur muss einen @Check[reflex|dc:45] Rettungswurf ablegen.</p>\n<hr />\n<p><strong>Kritischer Erfolg</strong> Die Kreatur ist nicht betroffen.</p>\n<p><strong>Erfolg</strong> Die Kreatur erleidet @Damage[(3d10+5)[cold]] Schaden.</p>\n<p><strong>Fehlschlag</strong> Die Kreatur erleidet @Damage[(6d10+10)[cold]] Schaden.</p>\n<p><strong>Kritischer Fehlschlag</strong> Die Kreatur erleidet @Damage[(12d10+20)[cold]] Schaden.</p>";

test("Befehle mit geschachtelten Klammern und ihre Angaben", () => {
  const b = befehle(AUGEN);
  assert.equal(b.length, 2);
  assert.equal(b[0].art, "Damage");
  assert.equal(b[0].formel, "(2d6+8)[void]");
  assert.deepEqual([b[1].typ, b[1].dc, b[1].basic], ["fortitude", 26, true]);
  assert.equal(befehle("@Check[type:reflex|dc:20]")[0].typ, "reflex");
});

test("Rolloption an einen @Check anhängen, auch bei vorhandenen options", () => {
  assert.equal(mitOption("@Check[reflex|dc:20|basic]", "x:y"), "@Check[reflex|dc:20|basic|options:x:y]");
  assert.equal(mitOption("@Check[will|dc:22|options:area-effect]", "x:y"), "@Check[will|dc:22|options:area-effect,x:y]");
  const neu = textMitOption(AUGEN, "k:1");
  assert.ok(neu.includes("@Check[fortitude|dc:26|basic|options:k:1]"));
  assert.ok(neu.includes("@Damage[(2d6+8)[void]]"), "Schaden bleibt unberührt");
});

test("Absatz und Schaden je Erfolgsgrad", () => {
  assert.match(absatzFuer(GEFRIEREN, "failure"), /6d10\+10/u);
  assert.match(absatzFuer(GEFRIEREN, "success"), /3d10\+5/u, "Erfolg ist nicht der kritische Erfolg");
  assert.deepEqual(schadenFuer(GEFRIEREN, "criticalFailure", false), { formeln: ["(12d10+20)[cold]"], faktor: 1 });
  assert.equal(schadenFuer(GEFRIEREN, "criticalSuccess", false), null);
  // Einfacher Rettungswurf: Schaden vor den Absätzen, Faktor nach Grad.
  assert.deepEqual(schadenFuer(AUGEN, "failure", true), { formeln: ["(2d6+8)[void]"], faktor: 1 });
  assert.deepEqual(schadenFuer(AUGEN, "success", true), { formeln: ["(2d6+8)[void]"], faktor: 0.5 });
  assert.deepEqual(schadenFuer(AUGEN, "criticalFailure", true), { formeln: ["(2d6+8)[void]"], faktor: 2 });
  assert.equal(schadenFuer(AUGEN, "criticalSuccess", true), null);
  assert.equal(schadenFuer(AUGEN, "failure", false), null, "ohne einfachen Rettungswurf und ohne Absatz kein Schaden");
});

test("Mindest-Übungsgrad aus dem Heimlichkeitseintrag", () => {
  assert.equal(mindestRang("<p>(Experte) um die abblätternden Ebenen wahrzunehmen</p>"), 2);
  assert.equal(mindestRang("<p>(trained)</p>"), 1);
  assert.equal(mindestRang("<p>+21 (Meister) oder ...</p>"), 3);
  assert.equal(mindestRang("<p>Die Falle ist gut versteckt.</p>"), 0);
});

test("Würfe zum Entschärfen mit Übungsgrad, auch für mehrere Würfe vor einer Klammer", () => {
  const w = entschaerfenWuerfe("<p>@Check[crafting|dc:25] oder @Check[thievery|dc:25] (Meister), um das Gerät zu erden, oder @Check[arcana|dc:25] (Geübt)</p>");
  assert.deepEqual(w.map((x) => [x.typ, x.rang]), [["crafting", 3], ["thievery", 3], ["arcana", 1]]);
  const herz = entschaerfenWuerfe(HERZ_ENTSCHAERFEN);
  assert.deepEqual(herz.map((x) => [x.typ, x.dc, x.rang]), [["arcana", 25, 0], ["occultism", 25, 0], ["athletics", 21, 0]]);
  const beschriftet = entschaerfenWuerfe("<p>@Check[thievery|dc:20]{Diebeskunst} (Experte) um</p>");
  assert.equal(beschriftet[0].rang, 2, "Beschriftung zwischen Befehl und Klammer");
});

test("Nötige Erfolge aus dem Text", () => {
  assert.equal(noetigeErfolge("<p>insgesamt sind zwei Erfolge nötig</p>"), 2);
  assert.equal(noetigeErfolge("<p>three total successes in any combination</p>"), 3);
  assert.equal(noetigeErfolge("<p>drei Gesamterfolge in beliebiger Kombination</p>"), 3);
  assert.equal(noetigeErfolge(HERZ_ENTSCHAERFEN), 1);
});

test("Entschärfen wie Mechanismus ausschalten", () => {
  assert.deepEqual(entschaerfenSchritt("criticalSuccess"), { erfolge: 2, ausloesen: false });
  assert.deepEqual(entschaerfenSchritt("success"), { erfolge: 1, ausloesen: false });
  assert.deepEqual(entschaerfenSchritt("failure"), { erfolge: 0, ausloesen: false });
  assert.deepEqual(entschaerfenSchritt("criticalFailure"), { erfolge: 0, ausloesen: true });
});

test("Auslöse-Aktion: Reaktion mit Auslöser vor anderen Aktionen, Angriffe nie", () => {
  const items = [
    { type: "melee", name: "Dornige Liane", system: { description: { value: "" } } },
    { type: "action", name: "Angst", system: { actionType: { value: "passive" }, description: { value: "<p>Text</p>" } } },
    { type: "action", name: "Zerschmetternder Schrecken", system: { actionType: { value: "reaction" }, description: { value: "<p><strong>Auslöser</strong> Das Herz sprengt seine Fesseln</p>" } } }
  ];
  assert.equal(ausloeseAktion(items).name, "Zerschmetternder Schrecken");
  assert.equal(ausloeseAktion([{ type: "action", name: "Fallgrube", system: { description: { value: FALLGRUBE } } }]).name, "Fallgrube");
  assert.equal(ausloeseAktion([items[0]]), null);
});

test("Kennungen hin und zurück", () => {
  assert.deepEqual(kennungLesen(["action:seek", kennungFalle("A", "B", "C")]), { art: "falle", gefahr: "A", item: "B", ziel: "C" });
  assert.deepEqual(kennungLesen([kennungEntschaerfen("A", 2)]), { art: "entschaerfen", gefahr: "A", index: 2 });
  // Gefährliches Gelände (0.3.18): das Komma im Feld würde die Optionen trennen
  assert.equal(kennungGelaende("Tok1", "5,7"), "gelaendepinsel:gelaende:Tok1:5_7");
  assert.deepEqual(kennungLesen(["x", kennungGelaende("Tok1", "5,7")]), { art: "gelaende", ziel: "Tok1", feld: "5,7" });
  assert.equal(kennungLesen(["self:x"]), null);
});

test("Bereich der Falle aus Schablone oder Text, sonst nur ihr Feld", async () => {
  const { bereichFuss } = await import("../scripts/gefahren-logik.mjs");
  assert.equal(bereichFuss("<p>Alle in einer @Template[emanation|distance:10] erleiden ...</p>"), 10);
  assert.equal(bereichFuss("<p>@Template[type:burst|distance:20]</p>"), 20);
  assert.equal(bereichFuss("<p>Jede Kreatur innerhalb von 30 Fuß/9 m muss ...</p>"), 30);
  assert.equal(bereichFuss("<p>each creature within 15 feet</p>"), 15);
  assert.equal(bereichFuss("<p>Wenn eine Kreatur auf die Falltür tritt</p>"), 0);
  assert.equal(bereichFuss("", "<p>within 5 feet</p>"), 5, "zweiter Text, wenn der erste nichts nennt");
});
