"use client";

// Zpětně kompatibilní vstupní bod — skutečná implementace žije v `./rezora`
// (dispatcher podle variant → per-šablona design). Sekční registr importuje
// odtud, proto zachováváme tento re-export.
export { RezoraWidget } from "./rezora";
