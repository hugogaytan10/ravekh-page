# Revisión visual móvil → web — 16/10/2026

Esta revisión amplía la primera entrega funcional de [mobile-parity.md](mobile-parity.md). Referencia: componentes y estilos de C:/RavekhPos. La web se verificó renderizada en navegador; no se ejecutó una app móvil ni una comparación de píxeles contra capturas de un dispositivo.

## Cambios

- Tema POS común con los valores claros/oscuros de src/Utils/Theme/Theme.ts, fuentes Poppins 400/500/600/700 del móvil y contraste de estados. Los colores de texto de énfasis usan el tono legible del tema; no se reutiliza el fondo del botón para texto pequeño oscuro.
- Cabecera de 56 px, títulos de 20 px, espaciado de 16 px y tarjetas/controles de 8 px. Rejilla Más de 3/4/5 columnas y badges del móvil de 56 px, borde y fondo neutros. Ajustes con iconos de 36 px y switches con pulgar blanco.
- Corrección del espacio reservado para navegación ausente y del solapamiento con navegación inferior entre 768 y 1023 px.
- Ventas: catálogo y carrito juntos desde 740 px con altura suficiente, como useAdaptiveLayout del móvil. Carrito → cobro → volver al carrito también en escritorio, sin presentar todo el formulario de cobro inicialmente. Se conserva el flujo por pantallas en teléfono.
- Catálogo: búsqueda y filtros compactos, rejilla adaptable y herramientas web (chat, IA, CSV y exportación) conservadas en un desplegable. Formularios desplazables sin salir de la pantalla.
- Clientes y empleados: encabezados y densidad basados en el móvil, iconos y acciones legibles. Sucursales abre primero el selector; Usar cambia la sucursal mediante persistPosBranch; Editar/Nueva siguen disponibles para administradores.
- Cupones y visitas abren sus menús propios. Crear/ver cupón, listado y edición; generación de QR, clientes frecuentes y QR dinámico accesibles desde sus acciones. El QR automático rota solo al entrar en su pantalla. Una sección ajena o inválida vuelve al inicio del módulo.
- Reportes recupera el resumen del periodo con los campos realmente disponibles (ingresos, ganancia, ticket promedio, ventas, balance). Se elimina el bloque de módulos pendientes y textos internos de implementación.
- Acceso/registro/recuperación usan una única columna y el tema común, sin la composición promocional de dos paneles.
- Revisión de superficies, botones, formularios y contraste en finanzas, pendientes, mesas, caja, inventario, tienda, ticket, moneda, cuenta, catálogo, impuestos, negocio, redes, pagos, Stripe, exportación, impresoras, seguridad y planes.

Se mantienen las funciones exclusivas de la web, incluidas CRM, chat y herramientas de importación. No se agregó modo offline, una cola de sincronización ni un service worker.

## Cobertura en navegador

34 rutas: 390×844 claro y 1280×900 claro/oscuro (102 comprobaciones). Comprobación de ancho del documento frente al viewport y de fuente/fondo del tema. Otros 18 controles de ancho a 320, 768 y 1024 px cubren ventas, catálogo, clientes, sucursales, Más y ticket. Otras 21 capturas cubren vacío/error/carga en productos, clientes, empleados, pendientes, inventario, cupones y visitas. Se inspeccionaron las capturas en hojas de contacto y se repitieron las vistas afectadas tras los ajustes.

| Pantalla | Ruta |
| --- | --- |
| sales | `/MainSales` |
| products | `/main-products/items` |
| discontinued | `/main-products/discontinued` |
| finance | `/MainFinances` |
| reports | `/dashboard` |
| customers | `/customers` |
| employees | `/employees` |
| pending | `/pending-payments` |
| branches | `/settings/branches` |
| tables | `/settings/table-zones` |
| cash | `/cash-closing` |
| inventory | `/inventory` |
| store | `/online-store` |
| coupons | `/pos/coupons` |
| visits | `/pos/visits` |
| more | `/more` |
| settings | `/settings` |
| ticket | `/settings/ticket` |
| currency | `/settings/currency` |
| account | `/settings/account` |
| delete-account | `/settings/delete-account` |
| catalog | `/catalog` |
| tax | `/more/preview/sales-tax` |
| business | `/more/preview/business` |
| social | `/more/preview/social-networks` |
| payments | `/more/preview/payment-methods` |
| stripe | `/more/preview/stripe-connect` |
| exports | `/more/preview/exports` |
| printers | `/settings/printers` |
| security | `/settings/security-questions` |
| intelligence | `/pos/intelligence` |
| plans | `/upgrade-plan?requiredPlan=PRO` |
| login | `/login-punto-venta` |
| recovery | `/recuperar-contrasena` |

Recorridos adicionales: formularios de producto/cliente/empleado, herramientas del catálogo, crear/listar/ver cupón y volver, generar QR/QR dinámico y volver, selección/edición de sucursal, agregar al carrito/cobro/volver, detalle y abonos pendientes, creación de zona, alta de movimiento financiero, confirmación de moneda y apertura de registro. El rol ayudante conserva la redirección de rutas administrativas a ventas.

## Reproducir

Ejecutar npm run dev y abrir /tests/new/pos/parity/preview.html?screen=%2Fmore&theme=dark. Parámetros: screen (ruta interna, puede incluir query), theme=light|dark, role, plan y state=content|empty|error|loading. La fixture reemplaza fetch y localStorage en memoria, usa imágenes embebidas y datos ficticios; no envía estas acciones a cuentas reales.

Evidencia local: C:/Users/Clemente/.codex/visualizations/2026/10/16/01a1454a-74f9-7671-a9c9-4423d11946f6/visual-review. verification.json guarda las rutas y mediciones. Capturas: nombre-mobile-light.png, nombre-desktop-light.png, nombre-desktop-dark.png y formularios/estados separados.

## Validación y límites

- 22 suites de npm test aprobadas, incluida la preferencia de tema guardada, preferencia del sistema y almacenamiento bloqueado.
- npm run build aprobado; git diff --check sin errores.
- Sin cambios en el backend o en el móvil. No se ejecutaron ventas, cortes, pagos, altas de Stripe, cambios de credenciales ni eliminaciones reales.
- Impresoras físicas, cámara/escáner y pagos requieren validación con hardware/cuentas reales. No hay certificación de igualdad píxel a píxel con el móvil ejecutándose. La adaptación conserva distribución de escritorio y funciones web propias.
- El chequeo global TypeScript conserva los errores previos documentados en mobile-parity.md; Vite no realiza ese chequeo.

## Corrección de impresión web

Se retiraron protocolo, Bluetooth/USB, IP, puerto y registro de dispositivos: esos campos no establecían una conexión. La página guarda únicamente el ancho del ticket y abre la prueba imprimible. La impresora instalada se selecciona mediante window.print en el diálogo del navegador. Las preferencias previas de 58/80 mm se conservan. Validación: 23 suites aprobadas, build aprobado y revisión de guardar formato/abrir prueba con la fixture. Sin prueba con impresora física.

