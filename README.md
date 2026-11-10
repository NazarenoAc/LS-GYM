# LS-GYM · API REST de gimnasio

API REST para gestionar las **sesiones** de un gimnasio: kinesiología y rehabilitación para deportistas, sala de musculación y entrenamiento funcional. Cada sesión tiene un profesional, una sala, una fecha y un rango horario, y la API impide que dos sesiones se superpongan en la misma sala.

Trabajo práctico integrador · Bootcamp 5.0 · Módulo Node.js.

> **Estado: etapa 1 (punto de control).** Proyecto, conexión a MongoDB y CRUD completo de sesiones, todavía sin autenticación. La etapa 2 suma usuarios, registro/login con Bcrypt y JWT y rutas protegidas.

## Tecnologías

- Node.js + TypeScript
- Express 5
- MongoDB Atlas + Mongoose
- dotenv

## Estructura del proyecto

Organizado por componentes, con arquitectura en capas (rutas → controlador → servicio → acceso a datos):

```
LS-GYM/
├── API/
│   ├── src/
│   │   ├── components/
│   │   │   └── sesiones/
│   │   │       ├── sesion.routes.ts       # rutas de /api/sesiones
│   │   │       ├── sesion.controller.ts   # req/res, try/catch y códigos de estado
│   │   │       ├── sesion.service.ts      # validaciones de negocio
│   │   │       ├── sesion.repository.ts   # acceso a datos (Mongoose)
│   │   │       └── sesion.model.ts        # schema de la sesión
│   │   ├── config/db.ts                   # conexión a MongoDB
│   │   ├── utils/AppError.ts              # error con código de estado
│   │   ├── app.ts                         # configuración de Express
│   │   └── index.ts                       # punto de entrada
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── LS-GYM.postman_collection.json         # pruebas (se importa en Thunder Client)
└── README.md
```

## Instalación

Requisitos: Node.js 18 o superior y una base de MongoDB (por ejemplo, un cluster gratuito de MongoDB Atlas).

```bash
git clone https://github.com/NazarenoAc/LS-GYM.git
cd LS-GYM/API
npm install
```

## Variables de entorno

Copiá `API/.env.example` como `API/.env` y completá los valores:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `MONGO_URI` | Cadena de conexión a MongoDB | `mongodb+srv://usuario:pass@cluster0.xxxxx.mongodb.net/ls-gym` |
| `JWT_SECRET` | Clave para firmar los tokens  | — |

El archivo `.env` está en el `.gitignore` y no se sube al repositorio.

## Ejecución

Desde la carpeta `API`:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor en modo desarrollo (se reinicia con cada cambio) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Ejecuta la versión compilada |

Si todo está bien, la consola muestra:

```
Conectado a MongoDB
Servidor escuchando en http://localhost:3000
```

## Modelo: Sesión

| Campo | Tipo | Descripción |
|---|---|---|
| `tipo` | string | `kinesiologia`, `musculacion` o `funcional` |
| `profesional` | string | Entrenador o kinesiólogo a cargo |
| `sala` | string | Sala donde se realiza |
| `fecha` | string | Día, formato `YYYY-MM-DD` |
| `horaInicio` | string | Hora de inicio, formato `HH:mm` |
| `horaFin` | string | Hora de fin, formato `HH:mm` |
| `cupo` | number | Cantidad de personas |

Además, Mongo agrega `_id`, `createdAt` y `updatedAt`.

### Validaciones de negocio (capa de servicio)

1. **Sin superposición:** dos sesiones en la misma sala y fecha no pueden pisarse en el horario. Una sesión que empieza justo cuando termina otra sí se permite.
2. **Horario coherente:** `horaFin` tiene que ser posterior a `horaInicio`, y ambas en formato `HH:mm` válido.
3. **Cupo válido:** número entero mayor a 0.
4. **Kinesiología individual:** las sesiones de kinesiología tienen cupo 1.
5. **Tipo válido:** solo `kinesiologia`, `musculacion` o `funcional`.
6. Campos obligatorios completos, fecha con formato `YYYY-MM-DD` e id con formato válido.

## Endpoints

URL base: `http://localhost:3000`

| Método | Ruta | Descripción | Éxito | Errores |
|---|---|---|---|---|
| GET | `/api/sesiones` | Lista todas las sesiones | 200 | 500 |
| GET | `/api/sesiones/:id` | Obtiene una sesión | 200 | 400, 404, 500 |
| POST | `/api/sesiones` | Crea una sesión | 201 | 400, 500 |
| PUT | `/api/sesiones/:id` | Modifica una sesión (se pueden mandar solo los campos a cambiar) | 200 | 400, 404, 500 |
| DELETE | `/api/sesiones/:id` | Elimina una sesión | 200 | 400, 404, 500 |

### Ejemplos

**Crear una sesión** · `POST /api/sesiones`

```json
{
  "tipo": "kinesiologia",
  "profesional": "Lic. Pérez",
  "sala": "Kinesio 1",
  "fecha": "2026-11-12",
  "horaInicio": "18:00",
  "horaFin": "19:00",
  "cupo": 1
}
```

Respuesta `201 Created`:

```json
{
  "_id": "6af25d86235e227a4e2b6597",
  "tipo": "kinesiologia",
  "profesional": "Lic. Pérez",
  "sala": "Kinesio 1",
  "fecha": "2026-11-12",
  "horaInicio": "18:00",
  "horaFin": "19:00",
  "cupo": 1,
  "createdAt": "2026-11-09T23:55:50.989Z",
  "updatedAt": "2026-11-09T23:55:50.989Z",
  "__v": 0
}
```

**Modificar una sesión** · `PUT /api/sesiones/:id`

```json
{
  "profesional": "Lic. Gómez"
}
```

Respuesta `200 OK` con la sesión actualizada.

**Eliminar una sesión** · `DELETE /api/sesiones/:id`

Respuesta `200 OK`:

```json
{ "mensaje": "Sesión eliminada correctamente" }
```

### Formato de los errores

Todos los errores responden con un JSON con la clave `error`:

```json
{ "error": "La sala \"Kinesio 1\" ya tiene una sesión en ese horario" }
```

| Código | Cuándo |
|---|---|
| 400 | Faltan campos, datos inválidos, horario superpuesto, id mal formado o JSON mal escrito |
| 404 | La sesión o la ruta no existen |
| 500 | Error inesperado del servidor |

## Pruebas con Thunder Client

El archivo [`LS-GYM.postman_collection.json`](LS-GYM.postman_collection.json) (formato Postman 2.1, compatible con Thunder Client) tiene 16 requests: los 5 endpoints y sus casos de error (400 y 404). El nombre de cada request indica el código que tiene que devolver.

1. En VS Code, abrí Thunder Client → **Collections** → menú **☰** → **Import** y elegí el archivo.
2. Con el servidor levantado (`npm run dev`), mandá **01 · Crear sesión** y copiá el `_id` de la respuesta.
3. En la pestaña **Env** de Thunder Client, creá un entorno, agregá la variable `sesionId` con ese `_id` y marcalo como activo. Las requests 09, 12, 13, 15 y 16 la usan como `{{sesionId}}`. Si no querés usar entornos, pegá el `_id` directamente en esas URLs.
4. Mandá el resto de las requests en orden (de la 02 a la 16). La última vuelve a borrar la sesión ya eliminada, así que para repetir las pruebas se empieza de nuevo por la 01.
