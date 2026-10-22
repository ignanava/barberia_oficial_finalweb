# Guía de demostración

1. Ejecute `npm.cmd run dev` y abra la URL que muestra Vite. Use el mismo navegador y origen en todo el recorrido.
2. Sin iniciar sesión, añada dos productos desde **Productos**. Abra **Carrito**, aumente/reduzca cantidades y compruebe el total. Pruebe quitar un producto.
3. Complete nombre y correo y confirme el pedido. Guarde el código `PED-...`. El carrito queda vacío. Consulte el pedido con ese código y correo en **Mi pedido**.
4. Abra **Combos** y elija un paquete. Su nombre y precio deben aparecer en el formulario. Abra **Barberos**, elija una de las cuatro fichas y compruebe que la selección del combo se conserva. Las fichas reservan espacio para las fotos del equipo.
5. En **Reservar**, abra **Fecha (dd/mm/aaaa)**: ofrece días disponibles desde hoy hasta una semana después, sin domingos ni días completos. Registre un turno y abra **Mi reserva**: sus datos y barbero aparecen automáticamente. Recargue y compruebe que siguen visibles. Un combo de 90 minutos a las 09:00 debe bloquear las 09:00 y 10:00 para ese barbero; otro profesional puede seguir libre. Los combos no pueden empezar a las 19:00 porque terminarían después del cierre.
6. Pulse **Iniciar sesión · Personal**. Una contraseña incorrecta debe mostrar un error. Entre con CI `13028039` y contraseña `13028039`.
7. En `/admin`, compruebe el resumen. Busque la reserva, filtre por fecha/estado/barbero, edite el horario o el profesional y guarde. También puede cancelarla con confirmación para liberar su horario.
8. Abra **Pedidos**, busque el pedido y pulse **Gestionar**. Modifique cantidades, añada un motivo y cambie el estado a **Listo para recoger**. Compruebe el nuevo total.
9. Cierre sesión. Consulte **Mi pedido** con su código y correo; abra **Mi reserva** para ver automáticamente los datos de la última reserva. Ambas secciones deben mostrar los cambios.
10. Vuelva al panel y entregue o cancele el pedido. Quedará disponible en **Ver detalle** con su historial. Los pedidos cerrados no se editan.
11. Cierre sesión e intente abrir `/admin` directamente: debe volver a `/login`. Revise también el menú y las pantallas a un ancho móvil.
12. Abra **Ayuda** y despliegue las preguntas frecuentes con clic o teclado. Las respuestas deben ser legibles y el enlace de contacto debe llevar a esa sección.

## Respuestas rápidas

**¿Por qué el cliente no inicia sesión?** El flujo está diseñado para una reserva pública y rápida. La última reserva se guarda automáticamente en este navegador y aparece en **Mi reserva**, sin búsqueda.

**¿Quién inicia sesión?** Solo el personal administrador, para abrir el panel de gestión `/admin`.

**¿Qué es localStorage?** Almacenamiento del navegador vinculado al origen actual. Persiste normalmente al actualizar, pero no es una base de datos compartida entre dispositivos.

**¿Dónde se guardan los datos?** Reservas en `machoAlfaReservations`, pedidos en `machoAlfaOrders` y carrito en `machoAlfaCart`, dentro del `localStorage` del navegador.

**¿Hay mapa o pagos en línea?** El mapa se eliminó. El pedido se paga en la barbería; no se procesa ningún cobro en línea ni se envían correos automáticos.

**¿Qué falta para producción?** Backend, base de datos central, autenticación segura del personal, validación de servidor y protección de datos.
