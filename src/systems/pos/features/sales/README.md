# POS Sales Feature (Modern)

This feature modernizes the legacy POS sales bootstrap flow while keeping legacy screens active during migration.

## Legacy references

- `src/Components/CatalogoWeb/PuntoVenta/Sales/MainSales.tsx`
- `src/Components/CatalogoWeb/PuntoVenta/Sales/Petitions.ts`
- `src/Components/CatalogoWeb/PuntoVenta/Sales/Cart/Petitions.ts`

## Improvements

1. Feature-oriented folder structure with clear boundaries (`interfaces`, `models`, `api`, `services`, `pages`).
2. Domain models in English and consistent TypeScript contracts.
3. Decoupled responsibilities using OOP (`PosSalesApi` for infrastructure and `PosSalesService` for use cases).
4. Optimized bootstrap loading with concurrent requests and product deduplication.
5. Incremental migration support: old code remains untouched until new flows are fully adopted.
