import assert from "node:assert/strict";
import { readPosBusinessFeatures, isPosFeatureBlocked } from "../../../../src/new/systems/pos/shared/config/posFeatureFlags";
export const run = () => {
  for(const payload of [null, {}, {Name:"Negocio"}, {Features:{Fidelity:null}}]) {
    const features=readPosBusinessFeatures(payload);
    assert.equal(features.fidelity,null);
    assert.equal(isPosFeatureBlocked(features.fidelity),false,"Un permiso desconocido no confirma un bloqueo");
  }
  for(const payload of [{Features:{Fidelity:2}},{Features:{fidelity:2}},{features:{Fidelity:2}},{features:{fidelity:2}},{CouponsPlan:2},{data:{Features:{Fidelity:2}}}]) {
    assert.equal(readPosBusinessFeatures(payload).fidelity,2);
    assert.equal(isPosFeatureBlocked(readPosBusinessFeatures(payload).fidelity),false);
  }
  assert.equal(isPosFeatureBlocked(readPosBusinessFeatures({Features:{Fidelity:0}}).fidelity),true);
};
