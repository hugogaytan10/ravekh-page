# Systems Feature Architecture (Modern)

This directory now follows a **feature-first** structure per system.

## Systems

- `pos`
- `catalog`
- `loyalty`

Each system contains `features/<feature-name>` folders with the same internal layout:

Current POS migration now includes `sales`, `employees`, `products`, `finance`, `settings`, `customers`, and `orders`.

- `api/` for external integration adapters
- `interface/` for dependency contracts
- `model/` for feature entities and DTOs
- `services/` for use-cases and orchestration logic
- `pages/` for UI composition

## Migration strategy

Legacy code remains untouched and operational while modern features are introduced incrementally.

1. Create modern feature modules in parallel.
2. Reuse and normalize legacy API payloads with mappers.
3. Move page entrypoints to modern services once behavior is validated.
4. Remove legacy modules only when parity is confirmed.

This keeps migration low-risk and allows gradual, testable adoption.
