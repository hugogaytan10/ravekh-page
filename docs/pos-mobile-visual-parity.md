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


## Corrección de QR dinámico web

Se eliminó la llamada a logDynamicQrFlow, que no estaba definida y detenía la generación antes de llamar al backend. El QR se dibuja localmente con el generador existente y margen de cuatro módulos, sin depender de qrserver. Se respeta refreshAfterSeconds y se reciben eventos nextQr/message del stream existente para renovar al escanear. La pantalla cancela el stream y el temporizador al salir; muestra los errores y reintenta la generación. Una respuesta HTTP antigua no sobrescribe un QR más reciente recibido por evento. Pruebas: 24 suites, API directa/envelope, datos inválidos, eventos y cierre, imagen local; navegador con generación, renovación manual, evento de escaneo simulado y vencimiento de 5 segundos. No se realizó un escaneo físico ni un canje de visita en cuentas reales.

## Corrección de clientes frecuentes

La sección top estaba excluida del validador de navegación de visitas; al abrirla se mostraba el inicio. Se habilitó la sección, se conectó el orden Más/Menos frecuentes y se distinguen carga, error y lista vacía, también en la vista ampliada. Verificación en navegador con dos clientes: acceso desde Visitas, nombres y visitas, inversión del orden, vista ampliada y regreso; estados vacío/error/carga aprobados. 24 suites y build aprobados. Datos de prueba aislados; sin cambios en datos reales.

## Permisos de fidelidad sin bloqueos transitorios

Visitas, cupones y QR esperan la verificación del negocio antes de mostrar opciones de compra. Los errores o permisos ausentes muestran un aviso de verificación con reintento; no se convierten en nivel 0. Más solo bloquea un nivel 0 confirmado. El lector compartido admite Features/features y Fidelity/fidelity, además de CouponsPlan legado. Configuración de ticket tampoco interpreta un plan ausente como GRATUITO. Se ignoran respuestas de permisos antiguas y se vuelve a consultar al actualizar el negocio.

Validación: 25 suites y build aprobados. Navegador con consultas retenidas en visitas/cupones/QR, acceso temprano desde Más, error HTTP, respuesta sin permiso, bloqueo real de nivel 0 y QR premium bloqueado en nivel 1. Datos simulados y aislados; sin modificar planes ni datos reales.

## Reimpresión de ventas en reportes

La lista de ingresos solo contiene una referencia de venta: no sirve como detalle de un ticket. Al reimprimir se consultan la orden/comanda original y sus productos con la sucursal del registro, también al consolidar sucursales. Se usan precio y cantidad guardados, variantes, notas, total recibido, subtotal, descuento e impuesto aplicados con la misma fórmula del reporte móvil/backend; el total del ingreso no sustituye el total de venta. Se conservan negocio, personalización y papel de 58/80 mm. Un error de consulta o detalle ausente impide generar un ticket vacío. No se crean ventas ni QRs nuevos.

Validación: 26 suites y build; pruebas de venta/comanda, sucursal, ajustes, cambio, total cero, importes inválidos, detalle ausente, error HTTP y escape HTML. Vista imprimible desde Reimprimir con datos aislados: Café 150, descuento 15, impuesto 21.60, total 156.60, recibido 200 y cambio 43.40; negocio, vendedor, cliente y nota visibles. Sin impresión física ni consulta de tickets de producción.

## Contraste al seleccionar variantes en ventas

Se retiró el texto blanco forzado del estado activo y el relleno morado del tema oscuro. La selección conserva fondo suave, colores de texto del tema y borde morado reforzado. Verificación en navegador alternando Azul/M y Rojo/G en ambos temas: radio seleccionado correcto y contraste mínimo de 6.47:1 en claro y 5.53:1 en oscuro para nombre, atributos, stock y precio. Sin registrar ventas reales.
Ajuste posterior contra VariantSelectorModal móvil: el estado seleccionado conserva también el mismo fondo de la tarjeta sin seleccionar; solo refuerza el borde, como variantCardSelected del móvil.

## Selección múltiple de base y variantes en ventas

Se reemplazó la selección única por una lista de opciones independientes, como selectedVariantIds del móvil. Se pueden marcar/desmarcar base y variantes, conservar cantidades por opción y confirmar juntas. La selección inicia vacía; confirmar requiere al menos una opción cuando hay opciones disponibles. Se conservan validación de talla y stock: primero se comprueba todo el conjunto contra lo que ya está en carrito, para evitar una adición parcial.

Autocomprobación en navegador con fixture aislada: base 1, Azul 2 y Rojo 3 aparecen como tres líneas y total 1560; desmarcar Rojo conserva las otras selecciones y su cantidad al volverlo a marcar. Un segundo conjunto base 1 + Rojo 3 excede el stock acumulado y no cambia ninguna línea; al corregir Rojo a 2, quedan cantidades 2/2/5. Sin registrar ventas reales.

## CRM: estado de conversación y editor visible

Al abrir y después de guardar mensajes se consulta la conversación actual junto al historial. El cambio de estado obtiene la versión vigente, conserva Expected_Version y usa la respuesta confirmada del PATCH para actualizar el selector y la lista. Un error no se presenta como guardado. Las respuestas de una conversación anterior no sustituyen la abierta después. El historial tiene altura flexible limitada y scroll propio; cabecera, herramientas y editor no se encogen ni son empujados por los mensajes. La lista lateral tiene scroll independiente.

Validación: 27 suites y build aprobados. Fixture aislada con 24 conversaciones y 40 mensajes: OPEN → PENDING, nota interna simulada, RESOLVED, ARCHIVED y OPEN; fallo HTTP conserva OPEN y muestra error. A 1280/768/390 px se midió que el editor mantiene su posición al llegar al final del historial; también sigue visible al abrir la última conversación de la lista. Sin mensajes enviados ni estados modificados en cuentas reales.
