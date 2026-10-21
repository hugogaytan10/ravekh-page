import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

export const run = () => {
  for (const [module, prefix] of [['finance', 'Finance'], ['reporting', 'Report']] as const) {
    const component = module === 'finance' ? 'PosV2FinancePage' : 'PosV2ReportingPage';
    const source = readFileSync(`src/new/systems/pos/features/${module}/ui/${component}.tsx`, 'utf8');
    const initialState = source.match(/useState\(\(\) => (readActivePosBranchId\(session.businessId\) \|\| -1)\)/);
    assert.ok(initialState, `${component} must wait for the primary branch instead of selecting all branches`);
    const initial = new Function('readActivePosBranchId', 'session', `return ${initialState[1]};`);
    assert.equal(initial(() => 0, {businessId: 529}), -1);
    assert.equal(initial(() => 521, {businessId: 529}), 521);
    const callback = source.match(/onPosBranchUpdated\(\(branch\) => \{([\s\S]*?)\}/);
    assert.ok(callback, `${component} must follow the header branch for every role`);
    let selected = 0;
    const listener = new Function('branch', 'session', 'businessId', `set${prefix}BranchId`, callback[1]);
    const select = (id: number) => {selected = id;};
    listener({id: 521, businessId: 529}, {businessId: 529}, 529, select);
    assert.equal(selected, 521);
    listener({id: 1, businessId: 999}, {businessId: 529}, 529, select);
    assert.equal(selected, 521, 'Ignore events from another business');
    listener({id: 1, businessId: 529}, {businessId: 529}, 529, select);
    assert.equal(selected, 1, 'Return to main branch');
  }
};
