# Macho Alfa · Barbería

Proyecto local con React, TypeScript y Vite: catálogo, carrito, pedidos, reservas y panel separado para el personal. Conserva la identidad negra y dorada y adapta las pantallas a móvil y escritorio.

## Ejecutar y comprobar

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run build
npm.cmd test
```

Abre la URL indicada por Vite. El comando de compilación comprueba TypeScript y genera `dist/`. `npm.cmd run preview` permite revisar esa compilación. También está disponible `npm.cmd run lint`.

## Acceso del personal

Pulsa **Iniciar sesión · Personal** o abre `/login`:

- CI: `13028039`
- Contraseña: `13028039`

Al entrar se abre `/admin`. Sin sesión, esa ruta redirige al formulario de acceso. El cierre de sesión también se refleja entre pestañas del mismo origen.

El panel incluye:

- Resumen de reservas del día, próximos turnos, pedidos en curso y ventas entregadas.
- Reservas: búsqueda, filtros por fecha, estado y barbero, edición, reprogramación, asignación de profesional, cancelación y eliminación con confirmación.
- Pedidos: búsqueda y filtro por estado; edición de cliente, productos, cantidades e indicaciones; preparación, recogida, entrega y cancelación.
- Historial de cambios de pedidos. Los entregados y cancelados quedan cerrados y se pueden consultar sin modificar su registro.

## Clientes

- Reservas sin cuenta, con nombre, correo, servicio, fecha y hora. La fecha se elige en un desplegable con formato dd/mm/aaaa, desde hoy hasta siete días después (inclusive), en hora de Bolivia. Solo aparecen días con turnos libres; se excluyen domingos y horarios pasados u ocupados.
- **Mi reserva** muestra automáticamente la última reserva realizada en este navegador, con todos sus datos, estado y avisos del personal. Se conserva al recargar y no requiere buscar por código o correo. El código `MA-...` se mantiene como referencia del turno.
- Cuatro barberos seleccionables desde las fichas del equipo o el formulario. Se comprueba la duración del servicio y la disponibilidad de cada profesional: dos barberos pueden atender a la misma hora, pero el mismo no puede tener citas solapadas. El servicio debe terminar antes de las 20:00.
- Tres combos reservables con precio, duración y ahorro respecto a los servicios por separado: Corte & Barba (Bs 75, ahorro Bs 15), Fade & Barba (Bs 90, ahorro Bs 10) y Corte & Cuidado (Bs 95, ahorro Bs 15). Cada combo dispone de 90 minutos.
- Preguntas frecuentes desplegables con información de reservas, barberos, combos, horarios y pedidos.
- Carrito en `/carrito`: cantidades de 1 a 20 por producto, quitar productos, vaciar, total y pedido con nombre, correo e indicaciones opcionales.
- Los pedidos generan un código `PED-...`; se consultan en `/carrito#mi-pedido` con el correo. Se recogen y pagan en el local; no hay pagos ni correos automáticos.
- Los productos usan ilustraciones locales de sus envases. Las fotos de servicios y fuentes siguen siendo externas.
- Se eliminó el mapa de Google Maps.

## Datos y alcance

Esta versión es una **demostración local**, sin backend. Las reservas, pedidos, carrito y sesión usan `localStorage`, asociado al navegador y origen. Recargar conserva los datos; borrar los datos del sitio los elimina. No hay sincronización entre dispositivos, gestión de inventario ni reservas simultáneas garantizadas entre varias pestañas.

Las credenciales están en el frontend y el control de acceso es de interfaz: **no proporciona seguridad de producción**. Antes de usarlo con clientes reales se requiere servidor, base de datos compartida, autenticación con contraseñas protegidas y validación/autorización en el servidor. Confirma también teléfono, correo y dirección del negocio; se conservan los datos de contacto originales.

Se mantienen legibles las reservas anteriores con teléfono u `ownerId`. El carrito anterior, que guardaba una fila por unidad, se agrupa por producto usando precios del catálogo.

Las reservas antiguas sin barbero se muestran como **Por asignar**. Por precaución, ocupan ese intervalo para todos los barberos hasta que el personal asigne un profesional o cancele la reserva desde el panel.

## Personalizar el equipo

`src/data/barbers.ts` contiene los cuatro nombres provisionales (`Barbero 01` a `Barbero 04`) y el campo `photo` de cada ficha. Los espacios de foto ya están diseñados y no necesitan imágenes para verse correctamente. Coloca los retratos en `public/images/barberos/` y asigna cada ruta al campo `photo`; hay un ejemplo en `public/images/barberos/LEEME.md`. Mantén los identificadores de los barberos para conservar las reservas.

Los combos y sus precios se configuran en `src/data/catalog.ts`. Las preguntas frecuentes están en `src/components/site/FaqSection.tsx`.

Claves: `machoAlfaReservations`, `machoAlfaOrders`, `machoAlfaCart`, `app_session`. No edites estas claves manualmente para operar el sitio.

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Catálogo, reservas, consulta y contacto |
| `/carrito` | Carrito, registro y consulta de pedidos |
| `/login` | Inicio de sesión del personal |
| `/admin` | Gestión de reservas y pedidos |

`vercel.json` incluye la reescritura SPA para abrir las rutas internas directamente. El proyecto no se ha publicado en un servicio nuevo.

## Archivos principales

- `src/pages/CartPage.tsx`: carrito y confirmación del pedido.
- `src/pages/admin/AdminDashboard.tsx`: resumen y secciones del panel.
- `src/components/AdminOrders.tsx`: gestión y detalle de pedidos.
- `src/repositories/`: persistencia y validación de reservas, pedidos, carrito y sesión.
- `tests/reservations.test.mjs`: pruebas de acceso, pedidos, reservas, migración del carrito y fallos de almacenamiento.
- `docs/GUIA_DEMOSTRACION.md`: recorrido de comprobación manual.
