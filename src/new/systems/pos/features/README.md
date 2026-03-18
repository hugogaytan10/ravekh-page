# POS Features

This folder contains POS features that already follow the feature-first structure under `features/<feature-name>`.

## Active feature modules in this folder

- `payment-method-management`

Each feature module must include these layers:

- `interface`
- `model`
- `services`
- `api`
- `pages`

Legacy and transitional POS features can remain in `src/new/systems/pos/<feature-name>` while migration is in progress.
