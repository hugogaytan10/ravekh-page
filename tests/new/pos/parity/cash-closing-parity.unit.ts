import assert from "node:assert/strict";
import { PosCashClosingApi } from "../../../../src/new/systems/pos/features/cash-closing/api/PosCashClosingApi";
import { CashClosingService } from "../../../../src/new/systems/pos/features/cash-closing/services/CashClosingService";
import { CashClosingPage } from "../../../../src/new/systems/pos/features/cash-closing/pages/CashClosingPage";
import { cashClosingCsv } from "../../../../src/new/systems/pos/features/cash-closing/model/CashClosing";
import { HttpRequest } from "../../../../src/new/core/api/HttpClient";

export async function run() {
  const calls: HttpRequest[] = [];
  let currencies = [{ currency: "USD", total: 25 }];
  const api = new PosCashClosingApi({ request: async <T,>(request: HttpRequest): Promise<T> => {
    calls.push(request);
    if (request.path === "employee/business/1") return [{ Id: 1, Name: "Admin" }, { Id: 2, Name: "Vendedor" }] as T;
    if (request.path.endsWith("preview")) return { data: { byCurrency: currencies } } as T;
    return { data: [{ Id: 9, Employee_Id: 2, Total: 25, Date: "2026-10-16" }] } as T;
  }, requestStatus: async () => 200 });
  const page = new CashClosingPage(new CashClosingService(api));
  assert.equal((await page.listEmployees(1, "admin-token")).length, 2, "administrator can select another employee");
  assert.deepEqual(await page.loadCurrentPreview(2, "admin-token"), { total: 25, currency: "USD" });
  assert.deepEqual(calls.at(-1)?.query, { employeeId: 2 });
  assert.equal(await page.loadCurrentTotal(2, "admin-token"), 25, "existing preview adapter still works");
  await page.listByEmployee(2, "admin-token");
  assert.deepEqual(calls.at(-1)?.query, { employeeId: 2, limit: 50 });
  await page.register({ employeeId: 2 }, "admin-token");
  assert.deepEqual(calls.at(-1)?.body, { Employee_Id: 2 });
  assert.equal(calls.at(-1)?.token, "admin-token");
  currencies = [{ currency: "USD", total: 25 }, { currency: "MXN", total: 40 }];
  await assert.rejects(() => page.loadCurrentPreview(2, "token"), /más de una moneda/);
  currencies = [{ currency: "USD", total: Number.NaN }];
  await assert.rejects(() => page.loadCurrentPreview(2, "token"), /no es válido/);
  currencies = [];
  assert.equal((await page.loadCurrentPreview(2, "token")).total, 0);
  await assert.rejects(() => page.register({ employeeId: 0 }, "token"), /empleado válido/);
  const csv = cashClosingCsv([{ id: 9, date: "2026-10-16", employeeName: '=HYPERLINK("test")', total: 25 }]);
  assert.ok(csv.includes("'="), "spreadsheet formula is escaped");
  assert.ok(csv.includes('""test""'));
}
