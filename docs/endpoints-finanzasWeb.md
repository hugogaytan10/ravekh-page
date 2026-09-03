# Endpoints del apartado de Finanzas

El apartado web de Finanzas (`/MainFinances`) utiliza **8 endpoints únicos**. Todos parten de `VITE_API_URL` y requieren el token de la sesión.

## Autenticación

El cliente HTTP envía el token en los dos headers siguientes:

```http
Authorization: Bearer <token>
token: <token>
```

## Endpoints activos

| Método | Endpoint | Uso | Body |
| --- | --- | --- | --- |
| `GET` | `income/month/:businessId` | Obtiene el total de ingresos del mes actual. | — |
| `GET` | `expenses/month/:businessId` | Obtiene el total de egresos del mes actual. | — |
| `GET` | `income/today/:businessId` | Obtiene el total y los movimientos de ingresos de hoy. | — |
| `GET` | `expenses/today/:businessId` | Obtiene el total y los movimientos de egresos de hoy. | — |
| `POST` | `income/bymonth/:businessId` | Obtiene los movimientos de ingresos del mes seleccionado. | `{ "month": 1..12 }` |
| `POST` | `expenses/bymonth/:businessId` | Obtiene los movimientos de egresos del mes seleccionado. | `{ "month": 1..12 }` |
| `POST` | `income` | Registra un ingreso. | `{ "Business_Id", "Name", "Amount" }` |
| `POST` | `expenses` | Registra un egreso. | `{ "Business_Id", "Name", "Amount" }` |

## Cuerpos enviados

### Consulta por mes

```json
{
  "month": 8
}
```

Aunque el selector interno de JavaScript trabaja con meses de `0` a `11`, la capa de API suma uno y envía valores de `1` a `12`.

### Registro de ingreso o egreso

```json
{
  "Business_Id": 123,
  "Name": "VENTA",
  "Amount": 500
}
```

Antes de enviarse, `Name` se convierte a mayúsculas. `Amount` debe ser mayor que cero y la pantalla lo limita a dos decimales.

## Comportamiento al cargar la pantalla

Cada carga, cambio de mes o actualización manual dispara **8 solicitudes** en paralelo:

1. Cuatro solicitudes para el resumen mensual y diario.
2. Dos solicitudes para los movimientos del mes seleccionado.
3. Dos solicitudes para los movimientos de hoy.

Por este flujo, `income/today/:businessId` y `expenses/today/:businessId` se llaman dos veces en cada actualización: una para calcular totales y otra para obtener el listado.

Después de registrar un ingreso o egreso se ejecuta el `POST` correspondiente y luego se vuelven a realizar las 8 solicitudes de actualización, dando **9 solicitudes** en esa operación completa.

## Vistas y filtros

La pantalla ofrece las vistas **Mes** y **Hoy**. El cambio de mes vuelve a consultar los movimientos mediante los endpoints `bymonth`; la vista de hoy utiliza los endpoints `today`.

Los filtros por tipo de movimiento y la búsqueda por concepto se aplican localmente sobre los resultados recibidos, por lo que no generan solicitudes adicionales.

## Archivos relacionados

- `src/new/systems/pos/features/finance/api/PosFinanceApi.ts`: definición y transformación de las solicitudes.
- `src/new/systems/pos/features/finance/ui/PosV2FinancePage.tsx`: carga, filtros y registro de movimientos.
- `src/new/core/api/FetchHttpClient.ts`: URL final, headers y serialización del body.
- `src/new/systems/pos/shared/config/posEnv.ts`: lectura de `VITE_API_URL`.
