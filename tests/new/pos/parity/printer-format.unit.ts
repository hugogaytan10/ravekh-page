import assert from "node:assert/strict";
import { getDefaultPosPrinter, readPosPrinters, writePosPrinters } from "../../../../src/new/systems/pos/shared/config/posPrinters";
export const run = () => {
  const previousWindow = globalThis.window;
  let stored = JSON.stringify([{ id:"old", name:"Anterior", protocol:"bluetooth", address:"old-address", port:9100, paperMm:"58", isDefault:true }]);
  Object.assign(globalThis, { window: { localStorage: { getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; } } } });
  try {
    const legacy = readPosPrinters();
    assert.equal(getDefaultPosPrinter(legacy)?.paperMm, "58");
    assert.equal("protocol" in legacy[0], false);
    assert.equal("address" in legacy[0], false);
    writePosPrinters([{id:"browser-ticket",name:"Formato",paperMm:"80",isDefault:true,createdAt:""}]);
    assert.equal(getDefaultPosPrinter(readPosPrinters())?.paperMm, "80");
    stored = JSON.stringify([{id:"invalid"},null]);
    assert.deepEqual(readPosPrinters(), []);
    stored = "invalid json";
    assert.deepEqual(readPosPrinters(), []);
  } finally { Object.assign(globalThis, { window: previousWindow }); }
};
