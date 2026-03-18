# POS Customers Feature (Modern)

This feature modernizes the legacy customer flow while legacy modules stay active.

## Legacy references

- `src/Components/CatalogoWeb/PuntoVenta/Customers/Petitions.tsx`
- `src/Components/CatalogoWeb/PuntoVenta/Customers/Client.tsx`
- `src/Components/CatalogoWeb/PuntoVenta/Customers/OrdersByCustomer.tsx`

## Improvements

1. Feature-first folder layout with explicit boundaries.
2. English contracts and domain models for maintainability.
3. OOP adapters (`CustomerApi`) and use cases (`CustomerService`) to decouple API and business rules.
4. Search filtering consolidated in service layer to reduce duplicated UI logic.
5. Incremental migration-safe design: legacy remains untouched until modern pages are adopted.
