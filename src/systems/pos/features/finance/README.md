# POS Finance Feature (Modern)

This feature modernizes finance records while keeping legacy finance screens running during rollout.

## Legacy references

- `src/Components/CatalogoWeb/PuntoVenta/Finance/Petitions.ts`
- `src/Components/CatalogoWeb/PuntoVenta/Finance/MainFinances.tsx`

## Improvements

1. Feature-based boundaries (`interfaces`, `models`, `api`, `services`, `pages`).
2. Domain-first English models and contracts.
3. OOP decoupling between transport (`FinanceApi`) and business use cases (`FinanceService`).
4. Optimized overview loading using concurrent API requests (`Promise.all`).
5. Migration-safe design with zero modifications to legacy modules.
