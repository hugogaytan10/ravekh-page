# Systems Feature Architecture (Legacy Note)

This file is legacy-facing documentation.

For the current source of truth of the modern structure, use:

- `src/new/systems/FEATURES.md`
- `src/new/systems/pos/features/README.md`

## Modern structure summary

Modern systems follow a feature-first structure per system:

- `src/new/systems/pos/features/<feature-name>`
- `src/new/systems/catalog/<feature-name>`
- `src/new/systems/loyalty/<feature-name>`

Each feature contains:

- `api/`
- `interface/`
- `model/`
- `services/`
- `pages/`

Legacy modules can still exist outside `src/new` during migration windows, but all net-new POS development should target `src/new/systems/pos/features/*`.
