# Plantilla de entrevista: Node.js + Express API

Starter de API REST con **Node.js**, **Express 5**, validación **Zod**, el modo watch integrado de Node y pruebas con el test runner de Node. Los posts se guardan en memoria para que el repo inicie sin instalar base de datos ni herramientas extra.

## Índice

1. [Qué trae y qué no trae](#qué-trae-y-qué-no-trae)
2. [Instalar Node.js en Windows](#instalar-nodejs-en-windows)
3. [Clonar e instalar](#clonar-e-instalar)
4. [Comandos de uso diario](#comandos-de-uso-diario)
5. [Endpoints y ejemplos](#endpoints-y-ejemplos)
6. [Estructura y flujo de una petición](#estructura-y-flujo-de-una-petición)
7. [Añadir una ruta](#añadir-una-ruta)
8. [Solución de problemas](#solución-de-problemas)

## Qué trae y qué no trae

- `GET /health` para verificar que el proceso responde.
- CRUD `GET/POST/PATCH/DELETE /api/posts`.
- Validación del body con Zod; errores 422, 404 y 500 en JSON.
- Pruebas de los endpoints y casos de validación.
- **No** trae PostgreSQL ni otra base; los datos se pierden al reiniciar el servidor.
- No necesita Laravel, Composer, PHP, Vue, Docker ni Nodemon.

## Instalar Node.js en Windows

Instala **Node.js LTS** desde [nodejs.org](https://nodejs.org/) (el instalador incluye npm). Deja activada la opción para agregar Node al PATH. Cierra y vuelve a abrir PowerShell.

También puedes instalarlo con winget:

```powershell
winget search --id OpenJS.NodeJS.LTS
winget install --id OpenJS.NodeJS.LTS -e
```

Verifica:

```powershell
node --version
npm --version
where.exe node
```

Se recomienda Node 20 o superior. Si `node` no se reconoce, repara PATH o vuelve a ejecutar el instalador y abre una terminal nueva.

Si empezaras una API Express vacía, crea carpeta/proyecto, inicializa npm e instala Express y Zod así:

```powershell
mkdir mi-api
cd mi-api
npm init -y
npm install express zod
```

Para recarga en desarrollo este starter usa `node --watch`, integrado en Node 20+; no hace falta instalar Nodemon.

Instala Git for Windows desde [git-scm.com/download/win](https://git-scm.com/download/win) para clonar. VS Code es opcional.

## Clonar e instalar

```powershell
git clone https://github.com/Erschin1011/entrevista-express-api.git
cd entrevista-express-api
powershell -ExecutionPolicy Bypass -File .\scripts\setup.ps1
```

El script comprueba Node/npm, instala exactamente las versiones del lockfile (`npm ci`) y ejecuta las pruebas.

Instalación manual equivalente:

```powershell
npm ci
npm test
```

Usa `npm ci` al clonar/restaurar desde `package-lock.json`. Usa `npm install` si agregas o actualizas una dependencia y quieres actualizar el lockfile.

## Comandos de uso diario

```powershell
npm run dev                 # servidor con recarga automática (Node --watch)
npm start                   # servidor normal, sin recarga automática
npm test                    # pruebas automáticas
npm ls --depth=0            # dependencias directas instaladas
npm audit                   # informe de dependencias vulnerables
npm install express         # agregar dependencia de producción
npm install -D paquete      # agregar dependencia de desarrollo
```

Inicia desarrollo con `npm run dev` y abre `http://localhost:3000/health`. Node 20+ ya incluye `--watch`, por eso no hay que instalar Nodemon global ni localmente. Detén el servidor con `Ctrl+C`. Para cambiar puerto en PowerShell:

```powershell
$env:PORT=3001
npm run dev
```

## Endpoints y ejemplos

| Método | URL | Resultado |
|---|---|---|
| GET | `/health` | `{"status":"ok"}` |
| GET | `/api/posts` | lista `{ data: [...] }` |
| POST | `/api/posts` | crea, responde 201 |
| GET | `/api/posts/:id` | obtiene uno, o 404 |
| PATCH | `/api/posts/:id` | actualiza campos enviados |
| DELETE | `/api/posts/:id` | elimina, responde 204 |

Crear con PowerShell y `curl.exe`:

```powershell
curl.exe -i http://localhost:3000/api/posts
curl.exe -i -X POST http://localhost:3000/api/posts -H "Content-Type: application/json" -d '{"title":"Primer post","body":"Hola API"}'
curl.exe -i http://localhost:3000/api/posts/1
curl.exe -i -X PATCH http://localhost:3000/api/posts/1 -H "Content-Type: application/json" -d '{"title":"Editado"}'
curl.exe -i -X DELETE http://localhost:3000/api/posts/1
```

También puedes usar Postman/Insomnia con body **raw → JSON** y encabezado `Content-Type: application/json`.

Validación de ejemplo:

```json
{"title":" ","body":""}
```

Devuelve HTTP 422 con `message` y detalles `errors`. Si pides un ID inexistente devuelve 404.

## Estructura y flujo de una petición

```text
src/server.js  -> levanta HTTP y selecciona PORT
src/app.js     -> middleware, rutas, Zod, respuestas JSON
tests/         -> solicitudes reales contra un puerto local efímero
```

1. Express recibe método y URL.
2. `express.json()` convierte JSON del body en `req.body`.
3. La ruta selecciona la función.
4. Zod valida los campos externos.
5. La función manipula el array en memoria y devuelve JSON/HTTP status.
6. El middleware final traduce errores de validación a 422 y errores inesperados a 500.

## Añadir una ruta

Ejemplo conceptual de una ruta de búsqueda:

```js
app.get('/api/posts/search', (request, response) => {
  const query = String(request.query.q ?? '').toLowerCase()
  const results = posts.filter((post) => post.title.toLowerCase().includes(query))
  return response.json({ data: results })
})
```

Pon rutas estáticas antes de `/:id` para que `search` no se interprete como el ID. Para un ejercicio real con persistencia, cambia el array por una capa de repositorio/ORM y agrega migraciones; configura secretos con `.env` sin versionarlo.

## Solución de problemas

| Problema | Solución |
|---|---|
| `node`/`npm` no se reconoce | Reinstala Node LTS con PATH habilitado y abre una PowerShell nueva. |
| `npm ci` dice que no hay lockfile | Verifica estar en la carpeta raíz del repo, donde está `package-lock.json`. |
| `EADDRINUSE` | El puerto está ocupado; cierra el otro proceso o usa `$env:PORT=3001`. |
| JSON llega como `undefined` | Incluye `Content-Type: application/json` y body JSON válido. |
| Recibo 404 en todas las rutas | Confirma que levantaste `npm run dev` desde esta carpeta y usas `/api/posts`. |
| Cambios no recargan | Confirma que usas `npm run dev`, no `npm start`. |

No subas `.env`, contraseñas ni tokens a GitHub. El `.gitignore` excluye archivos de entorno y `node_modules`.
