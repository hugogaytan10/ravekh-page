# POS Features

All POS modules now live under:

`src/new/systems/pos/features/<feature-name>/{api,interface,model,services,pages}`

## Naming convention

- Always use `features/<feature-name>`.
- Feature names should be short and functional.
- Avoid mixing redundant suffixes such as `*-management` or `*-tracking` unless strictly needed by domain language.
- Settings-related capabilities are grouped under `features/settings/*` as subfeatures.

## Current feature map

### Core

- `sales`
- `products`
- `orders`
- `customers`
- `employees`
- `inventory`
- `finance`
- `dashboard`
- `reporting`
- `exports`
- `online-orders`
- `cash-closing`
- `auth`
- `health`

### Settings subfeatures

- `settings/business`
- `settings/tax`
- `settings/table-zones`
- `settings/payment-methods`
- `settings/branding`

## Contract per feature

Each feature (or settings subfeature) must include:

- `api`
- `interface`
- `model`
- `services`
- `pages`
