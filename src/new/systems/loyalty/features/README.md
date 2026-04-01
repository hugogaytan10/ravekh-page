# Loyalty Features

This folder is the feature-first entry point for the loyalty system.

## Current feature modules

- `rewards-management`
- `customer-experience` (portal de cliente para validar token, progreso de visitas y canje de cupones)

Each feature is expected to contain:

- `interface`
- `model`
- `services`
- `api`
- `pages`

Legacy-compatible features can stay in `src/new/systems/loyalty/<feature-name>` until migration is completed.
