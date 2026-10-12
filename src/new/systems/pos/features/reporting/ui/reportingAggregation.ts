import type { SalesTicket, SalesTicketsPage } from "../model/SalesReport";

export type TopChartItem = { id: number; name: string; quantity: number };

export const combineTopItems = (sets: Array<Array<{ id: number; name: string; quantity?: number; totalSales?: number }>>): TopChartItem[] => {
  const grouped = new Map<string, TopChartItem>();

  for (const [setIndex, rows] of sets.entries()) {
    for (const row of rows) {
      const name = row.name?.trim() || "Sin datos";
      const key = row.id > 0 ? String(row.id) : `${setIndex}:${name}`;
      const current = grouped.get(key);
      grouped.set(key, {
        id: row.id,
        name,
        quantity: (current?.quantity ?? 0) + Number(row.quantity ?? row.totalSales ?? 0),
      });
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);
};

export const loadAllTicketPages = async (
  loadPage: (page: number, pageSize: number) => Promise<SalesTicketsPage>,
): Promise<SalesTicket[]> => {
  const pageSize = 500;
  const first = await loadPage(1, pageSize);
  const remaining = await Promise.all(
    Array.from({ length: Math.max(0, first.pagination.totalPages - 1) }, (_, index) =>
      loadPage(index + 2, pageSize),
    ),
  );
  return [first, ...remaining].flatMap((result) => result.items);
};
