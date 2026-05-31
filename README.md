# Gestor de Tareas

Aplicación web CRUD completa para gestionar tareas, construida con **Next.js 14** (App Router) y **Amazon DynamoDB** como base de datos. Permite crear, leer, actualizar y eliminar tareas directamente desde el navegador.

---

## Tabla de Tecnologías

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| Lenguaje | JavaScript (ES2022) |
| Base de datos | Amazon DynamoDB |
| SDK de AWS | @aws-sdk/client-dynamodb + @aws-sdk/lib-dynamodb |
| Estilos | Tailwind CSS v3 |
| Generación de IDs | uuid v4 |
| Despliegue | Vercel |

---

## Arquitectura AWS

```
┌─────────────────────────────────────────────────┐
│                   VERCEL (Edge)                  │
│                                                  │
│  ┌──────────────┐      ┌──────────────────────┐ │
│  │   Next.js    │      │   Next.js API Routes  │ │
│  │   Frontend   │ ───► │  /api/tasks           │ │
│  │  (page.js)   │      │  /api/tasks/[id]      │ │
│  └──────────────┘      └──────────┬───────────┘ │
│                                   │              │
└───────────────────────────────────┼──────────────┘
                                    │ HTTPS (AWS SDK v3)
                                    ▼
                   ┌────────────────────────────┐
                   │         AWS Cloud          │
                   │                            │
                   │  ┌──────────────────────┐  │
                   │  │   Amazon DynamoDB     │  │
                   │  │   Tabla: Tasks        │  │
                   │  │   PK: id (String)     │  │
                   │  └──────────────────────┘  │
                   │                            │
                   │  ┌──────────────────────┐  │
                   │  │   IAM User           │  │
                   │  │   AmazonDynamoDB      │  │
                   │  │   FullAccess         │  │
                   │  └──────────────────────┘  │
                   └────────────────────────────┘
```

---

## 1. Configuración de la tabla en Amazon DynamoDB

1. Inicia sesión en la consola de [AWS](https://console.aws.amazon.com/).
2. Navega a **DynamoDB → Tablas → Crear tabla**.
3. Configura los siguientes parámetros:

| Parámetro | Valor |
|---|---|
| Nombre de la tabla | `Tasks` |
| Clave de partición | `id` (tipo **String**) |
| Clase de tabla | DynamoDB Standard |
| Modo de capacidad | On-demand (pago por uso) |

4. Haz clic en **Crear tabla** y espera a que el estado sea **Activa**.

---

## 2. Configuración del usuario IAM

1. Navega a **IAM → Usuarios → Crear usuario**.
2. Introduce un nombre, por ejemplo `dynamo-crud-user`.
3. En **Permisos**, selecciona **Adjuntar políticas directamente** y busca:
   - ✅ `AmazonDynamoDBFullAccess`
4. Crea el usuario y luego ve a **Credenciales de seguridad → Crear clave de acceso**.
5. Elige el caso de uso **Acceso mediante CLI/SDK**.
6. **Descarga o copia** el `Access Key ID` y el `Secret Access Key` — solo se muestran una vez.

---

## 3. Desarrollo local

### Prerrequisitos
- Node.js 18.x o superior
- npm 9.x o superior
- Credenciales AWS configuradas (paso anterior)

### Pasos

```bash
# 1. Clona el repositorio
git clone <url-del-repositorio>
cd my-crud-app

# 2. Instala las dependencias
npm install

# 3. Copia el archivo de variables de entorno
cp .env.local.example .env.local

# 4. Edita .env.local con tus credenciales reales
#    AWS_ACCESS_KEY_ID=AKIA...
#    AWS_SECRET_ACCESS_KEY=...
#    AWS_REGION=us-east-1

# 5. Inicia el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 4. Despliegue en Vercel

### Opción A — Desde la CLI de Vercel

```bash
npm install -g vercel
vercel
```

### Opción B — Desde el panel de Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Vercel detecta automáticamente que es un proyecto Next.js.
3. Antes de hacer clic en **Deploy**, ve a **Environment Variables** y agrega:

| Variable | Valor |
|---|---|
| `AWS_ACCESS_KEY_ID` | Tu Access Key de IAM |
| `AWS_SECRET_ACCESS_KEY` | Tu Secret Access Key de IAM |
| `AWS_REGION` | `us-east-1` (o la región de tu tabla) |

4. Haz clic en **Deploy**.
5. Vercel generará una URL pública tipo `https://my-crud-app-xxxx.vercel.app`.

> **Importante:** Las variables de entorno agregadas en Vercel aplican para los entornos **Production**, **Preview** y **Development**. Asegúrate de agregarlas en los tres si lo necesitas.

---

## 5. Capturas de pantalla

> *(Agregar capturas después del despliegue)*

| Vista | Captura |
|---|---|
| Página principal — lista de tareas | `screenshot-home.png` |
| Formulario de creación | `screenshot-create.png` |
| Modo de edición inline | `screenshot-edit.png` |

---

## 6. Estructura del proyecto

```
my-crud-app/
├── app/
│   ├── api/
│   │   └── tasks/
│   │       ├── route.js          # GET (listar) y POST (crear)
│   │       └── [id]/
│   │           └── route.js      # PUT (actualizar) y DELETE (eliminar)
│   ├── globals.css               # Reset de Tailwind CSS
│   ├── layout.js                 # Layout raíz con metadata
│   └── page.js                   # Componente cliente principal (UI)
├── lib/
│   └── dynamo.js                 # Cliente DynamoDB reutilizable
├── .env.local.example            # Plantilla de variables de entorno
├── .gitignore
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

---

## 7. Variables de entorno requeridas

| Variable | Descripción |
|---|---|
| `AWS_ACCESS_KEY_ID` | ID de la clave de acceso del usuario IAM |
| `AWS_SECRET_ACCESS_KEY` | Clave de acceso secreta del usuario IAM |
| `AWS_REGION` | Región de AWS donde se encuentra la tabla DynamoDB |

---

## 8. Licencia

MIT — Uso libre para proyectos académicos y personales.
