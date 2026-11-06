// Bausteine der eigenen Fallen (seit 0.5.0 eigene Datei, damit jede Stufe ihre eigene Datendatei hat).
// D Schaden (Formel, Art, "persistent"), Z Zustand (Slug, Wert, Dauer), T freier Text je Sprache.
// Dauern: r1 1 Runde, m1 1 Minute, h1 1 Stunde, zug bis Ende des nächsten Zugs; lange Dauern (0.5.0, 06.11.2026:
// "arbeite mehr mit Zuständen, die länger andauern, blind für 28 Stunden oder versteinert"): t1 24 Stunden,
// w1 1 Woche. Lange Zustände setzt das Modul als PF2e-Effekt mit dieser Laufzeit auf die Figur.

export const D = (formel, typ, kat = null) => ({ d: formel, typ, kat });
export const Z = (slug, wert = null, dauer = null) => ({ z: slug, wert, dauer });
export const T = (de, en) => ({ t: { de, en } });

export const AUS = Object.freeze({
  tuer: { de: "Die Tür wird geöffnet.", en: "The door is opened." },
  schloss: { de: "Eine Kreatur öffnet das Schloss oder versucht, es zu knacken.", en: "A creature opens the lock or attempts to pick it." },
  betreten: { de: "Eine Kreatur betritt den Auslösebereich.", en: "A creature enters the trigger area." },
  feld: { de: "Eine Kreatur betritt das Feld.", en: "A creature enters the square." },
  platte: { de: "Eine Kreatur betritt die Druckplatte.", en: "A creature steps on the pressure plate." }
});
