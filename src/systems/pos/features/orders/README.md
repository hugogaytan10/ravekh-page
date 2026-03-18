# POS Orders Feature (Modern)

This modern feature migrates legacy order catalog behavior from:

- `src/Components/CatalogoWeb/PuntoVenta/Settings/StoreOnline/Petitions.ts`
- `src/Components/CatalogoWeb/PuntoVenta/Customers/OrdersByCustomer.tsx`

## Improvements

1. Uses feature folders (`api`, `interface`, `model`, `services`, `pages`) for clear boundaries.
2. Applies OOP and dependency inversion with `IOrderRepository`.
3. Normalizes legacy statuses to a stable domain enum.
4. Keeps legacy code untouched while new flows are validated.
