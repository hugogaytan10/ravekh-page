import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.browser";
import { usePosTheme } from "../../../../src/new/systems/pos/shared/ui/usePosTheme";
const Probe = () => createElement("output", null, usePosTheme()[0]);
const renderTheme = (stored: string | null, systemDark: boolean, denied = false) => {
  Object.assign(globalThis, { window: { localStorage: { getItem: () => { if (denied) throw new Error("Denied"); return stored; } }, matchMedia: () => ({ matches: systemDark }) } });
  return renderToStaticMarkup(createElement(Probe));
};
export const run = () => {
  const previousWindow = globalThis.window;
  try {
assert.equal(renderTheme("dark", false), "<output>dark</output>");
assert.equal(renderTheme("light", true), "<output>light</output>");
assert.equal(renderTheme(null, true), "<output>dark</output>");
assert.equal(renderTheme("invalid", false), "<output>light</output>");
assert.equal(renderTheme(null, true, true), "<output>dark</output>");
  } finally { Object.assign(globalThis, { window: previousWindow }); }
};
