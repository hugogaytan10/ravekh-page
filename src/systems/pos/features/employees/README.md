# POS Employees Feature (Modern)

This module is a feature-first rewrite of the legacy POS employee flow.

## Folder layout

- `api/`: legacy endpoint adapters and payload normalization.
- `interface/`: contracts that decouple use-cases from data access.
- `model/`: feature entities and filters.
- `services/`: business use-cases with single responsibility.
- `pages/`: React composition with minimal UI logic.

## Migration notes

- Keep legacy employee screens active until parity is validated.
- Wire `EmployeesModernPage` behind a controlled route/flag.
- Replace direct fetch calls with `IEmployeeRepository` implementations.
