# Fotografías del equipo

Coloca aquí las cuatro fotos, preferiblemente verticales (proporción 4:5), con estos nombres:

- barbero-01.jpg
- barbero-02.jpg
- barbero-03.jpg
- barbero-04.jpg

En `src/data/barbers.ts`, cambia el nombre de cada profesional y sustituye `photo: null` por su ruta. Ejemplo:

```ts
{ id: 'barbero-01', name: 'Nombre del barbero', photo: '/images/barberos/barbero-01.jpg' }
```

Con `photo: null`, la página conserva un espacio ilustrado para la foto. Si una imagen no carga, se muestra ese espacio de respaldo. Mantén los identificadores `id` para conservar las asignaciones de las reservas.
