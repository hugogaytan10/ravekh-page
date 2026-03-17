# POS Products Feature (Modern)

This feature is the modern replacement for legacy product petitions and models.

## Legacy references

- `src/Components/CatalogoWeb/PuntoVenta/Products/Petitions.ts`
- `src/Components/CatalogoWeb/PuntoVenta/Model/Item.d.ts`
- `src/Components/CatalogoWeb/PuntoVenta/Model/Variant.d.ts`

## Improvements

1. Strongly typed contracts and use cases (`interfaces`).
2. Dedicated domain entities (`models`).
3. Adapter + mapper isolation (`api`) to keep backend payload shape out of UI.
4. Encapsulated business logic in `ProductService` (`services`).
5. Feature page that depends on use cases, not low-level fetch calls (`pages`).

## Migration strategy

Legacy code remains active until all product flows are routed to this feature.
