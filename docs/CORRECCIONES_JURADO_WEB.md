# Estado técnico vigente de Macho Alfa

## Flujo público de clientes

La reserva y la compra de productos no requieren inicio de sesión. La reserva solicita únicamente nombre y correo como datos personales; también conserva los datos operativos imprescindibles: servicio, fecha, hora y un mensaje opcional.

La fecha se selecciona entre los días disponibles desde hoy hasta siete días después (ambos inclusive), en formato dd/mm/aaaa y hora de Bolivia. Se excluyen domingos y días sin horarios libres. Cada reserva genera un código `MA-...` de referencia. **Mi reserva** muestra automáticamente la última reserva guardada en este navegador, sus datos, estado y avisos, también después de recargar. No hay formulario ni botón de búsqueda. El teléfono dejó de solicitarse; las reservas históricas que sí lo tienen permanecen legibles para no perder datos.

## Acceso del personal

El botón de navegación se denomina **Iniciar sesión · Personal**. Las credenciales solicitadas son CI `13028039` y contraseña `13028039`. Solo una cuenta con rol `ADMIN` puede iniciar sesión y entrar en `/admin`. El panel tiene secciones de reservas y pedidos, resumen, búsqueda y filtros. Permite editar y cancelar reservas, además de gestionar productos, cantidades y estados de pedidos.

El login no representa seguridad real: las credenciales de demostración están en el frontend y no existe un servidor que valide permisos. En producción se necesitarían cuentas gestionadas en backend, contraseñas protegidas y autorización de servidor.

## Persistencia, mapa y despliegue

Las reservas, pedidos y carrito se guardan mediante `localStorage`, asociado al navegador y origen actual. No existe sincronización entre dispositivos ni base de datos remota. El carrito tiene cantidades, eliminación y confirmación de pedidos para recoger/pagar en el local. Los pedidos se consultan con código `PED-...` y correo; sus cambios conservan historial.

El mapa de Google Maps y sus estilos se eliminaron. Se conserva el contacto y los horarios. Las ilustraciones de productos son locales y corresponden a sus tipos de envase; se corrigió la discrepancia entre productos y fotografías de herramientas.

La compilación genera `dist/` y `vercel.json` aporta la reescritura SPA para abrir `/carrito`, `/login` y `/admin` directamente en Vercel. No se afirma que exista un despliegue público.
