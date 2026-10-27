# Paridad móvil y web — 16 de octubre de 2026

Referencia móvil: `C:\RavekhPos`. Los cambios se aplican en la web `ravekh-page`; no se modificaron el móvil ni el backend.

## Cambios entregados

| Flujo | Corrección en web |
| --- | --- |
| Más | Accesos principales con iconos como el móvil, separados de ajustes y material del catálogo. Se conservan CRM, chat, importación IA y las herramientas web existentes. |
| Ajustes | Página propia con catálogo, ticket, métodos de pago, moneda, impuesto, mesas, cuenta, seguridad y ayuda. Las opciones de administración respetan el rol. |
| Ticket | Logo, teléfono, dirección, RFC, devoluciones, vendedor, método de pago, mensaje final y QR de visitas. Vista previa y aplicación en el ticket impreso de ventas. Personalización desde START; QR sujeto a fidelidad activa. Preferencias locales por negocio, como en el móvil. |
| Moneda | Selector MXN/USD/BNY/EUR con confirmación y el mismo contrato `POST monedas`. Las ventas dejan de enviar MXN fijo. Importes del POS usan la moneda del negocio; BNY se presenta con el código ISO CNY. |
| Análisis del negocio | Resumen, filtros, detalle, métricas, lectura, archivo e historial con los endpoints existentes. Solo administradores; capacidades y bloqueos por plan provienen del servidor. Acceso desde Más y Reportes. |
| Cuenta | Consulta y edición de nombre y contraseña con la validación del móvil. Eliminación de la propia cuenta con confirmación escrita y cierre de sesión únicamente tras éxito del servidor. |
| Tienda en línea | Enlace público por sucursal, copiar, abrir catálogo y accesos a banner/QR, ajustes e información del negocio, junto a los pedidos existentes. |
| Impresora | La prueba abre un ticket imprimible real en lugar de afirmar conexión sin comprobarla. La impresión utiliza el diálogo del navegador y una impresora instalada en el sistema. |
| Actualizar plan | Abre el checkout de planes existente; deja de enviar al alta de Stripe Connect. |
| Corte de caja | Recupera todos los empleados y envía el seleccionado en consulta, historial y creación. Evita ocultar fallos como caja vacía, mantiene la moneda del resumen y bloquea la consolidación de varias monedas conforme al backend. Exportación CSV del historial mostrado. |

## Validación

- 21 suites de `npm test` aprobadas, incluidas regresiones de selección de empleado, moneda, CSV, tickets, cuenta, rutas y análisis.
- `npm run build` aprobado.
- Revisión en navegador con datos ficticios: Más, ticket, guardar preferencias, moneda, detalle/lectura/archivo/historial del análisis, cuenta, selector de empleado, bloqueo del plan gratuito y ajustes del ayudante.
- Revisión visual a tamaño de escritorio y 390 px; el editor de ticket no desborda horizontalmente.
- La fixture reproducible está en `/tests/new/pos/parity/preview.html` al ejecutar Vite. Usa almacenamiento en memoria e intercepta las solicitudes; no modifica cuentas reales. Parámetros: `screen`, `plan`, `role`, `theme`.

El chequeo global con TypeScript 5.0 encuentra errores en código previo: imports de interfaces con rutas incorrectas, uniones de respuestas y compatibilidad de los tipos de iconos. Vite no realiza ese chequeo; una compilación correcta no equivale a TypeScript sin errores.

## Límites y diferencias de plataforma

No se realizaron pagos, ventas, cortes, cambios de contraseña ni eliminaciones reales. No se verificó impresión con hardware físico. El navegador no usa la conexión Bluetooth/ESC-POS nativa del teléfono.

No se migraron la base Realm, su cola de sincronización sin conexión, las notificaciones Firebase nativas ni Tap to Pay nativo. Tampoco se certificó equivalencia visual y funcional de todas las pantallas existentes. Estos cambios cubren los flujos anteriores; la paridad completa requiere revisar y probar esos otros recorridos.

El backend todavía no conserva la moneda en el histórico de cortes. Por eso el historial muestra el importe sin atribuirle una moneda inventada y se rechaza un resumen con varias monedas.

## Ampliación de la revisión visual

La revisión posterior cubre 34 rutas, temas claro/oscuro, pantallas estrechas y formularios. Detalle y límites en [pos-mobile-visual-parity.md](pos-mobile-visual-parity.md). La batería actual contiene 22 suites aprobadas.
