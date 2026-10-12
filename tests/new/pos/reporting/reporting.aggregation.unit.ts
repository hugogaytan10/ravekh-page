import assert from "node:assert/strict";
import {
  combineTopItems,
  loadAllTicketPages,
} from "../../../../src/new/systems/pos/features/reporting/ui/reportingAggregation";

export async function run(): Promise<void> {
  assert.deepEqual(
    combineTopItems([
      [{ id: 1, name: "Juan", totalSales: 10 }],
      [{ id: 2, name: "Juan", totalSales: 20 }],
    ]),
    [
      { id: 2, name: "Juan", quantity: 20 },
      { id: 1, name: "Juan", quantity: 10 },
    ],
  );

  const requestedPages: number[] = [];
  const tickets = await loadAllTicketPages(async (page, pageSize) => {
    requestedPages.push(page);
    return {
      items: [{ id: page, type: "ORDER", date: "", paymentMethod: "", currency: "MXN", customerName: null, employeeName: null, total: 0, discountApplied: 0, taxesApplied: 0, products: [] }],
      pagination: { page, pageSize, totalItems: 3, totalPages: 3 },
    };
  });

  assert.deepEqual(requestedPages, [1, 2, 3]);
  assert.deepEqual(tickets.map((ticket) => ticket.id), [1, 2, 3]);
}
