import assert from "node:assert/strict";
import {
  canIncreaseSessionLimit,
  getSessionClosurePath,
  processLoginFailure,
} from "../../../../src/new/systems/pos/features/auth/model/LoginSessionLimit";

const limitError = (overrides: Record<string, unknown> = {}) => Object.assign(new Error("Request failed: 409"), {
  payload: {
    code: "PLAN_DEVICE_LIMIT_EXCEEDED",
    error: "Demasiadas sesiones",
    plan: "PRO",
    role: "ADMINISTRADOR",
    businessId: 123,
    employeeId: 456,
    ...overrides,
  },
});

export async function run(): Promise<void> {
  const limitFailure = processLoginFailure(limitError());
  assert.equal(limitFailure.error, null);
  assert.equal(limitFailure.sessionLimit?.error, "Demasiadas sesiones", "session limit opens the modal state");

  const maxFailure = processLoginFailure(limitError({ plan: " max " }));
  assert.equal(canIncreaseSessionLimit(maxFailure.sessionLimit!), false, "MAX hides upgrade");

  assert.equal(getSessionClosurePath(limitFailure.sessionLimit!), "business/deviceidentifier/business/123");

  const employeeFailure = processLoginFailure(limitError({ role: "CAJERO" }));
  assert.equal(getSessionClosurePath(employeeFailure.sessionLimit!), "business/deviceidentifier/employee/456");

  const ordinaryError = new Error("Credenciales incorrectas");
  const ordinaryFailure = processLoginFailure(ordinaryError);
  assert.equal(ordinaryFailure.sessionLimit, null);
  assert.equal(ordinaryFailure.error, "Credenciales incorrectas", "ordinary login errors keep the normal flow");
}
