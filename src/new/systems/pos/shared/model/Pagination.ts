export type PaginatedMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const toPaginationMeta = (
  pagination: Record<string, unknown> | null | undefined,
  fallbackPage: number,
  fallbackPageSize: number,
  fallbackTotal: number,
): PaginatedMeta => {
  const safePage = Math.max(1, Number(pagination?.page ?? fallbackPage) || fallbackPage);
  const safeTotalPages = Math.max(1, Number(pagination?.totalPages ?? 1) || 1);

  return {
    page: safePage,
    pageSize: Math.max(1, Number(pagination?.pageSize ?? fallbackPageSize) || fallbackPageSize),
    total: Math.max(0, Number(pagination?.total ?? fallbackTotal) || fallbackTotal),
    totalPages: safeTotalPages,
    hasNext: Boolean(pagination?.hasNext) || safePage < safeTotalPages,
    hasPrev: Boolean(pagination?.hasPrev) || safePage > 1,
  };
};
