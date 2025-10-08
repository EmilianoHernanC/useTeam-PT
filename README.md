# 🎨 Kanban Board - Colaborativo en Tiempo Real

> Tablero Kanban estilo Trello con colaboración en tiempo real, drag & drop fluido y exportación automática a CSV vía email.

---

## 📝 Sobre el Proyecto

Tablero Kanban colaborativo en tiempo real creado con **Docker, MongoDB, NestJS, TypeScript, React y Tailwind** como principales tecnologías.

Busqué crear una interfaz dinámica e intuitiva, con un diseño llamativo de estilo retro y colores vivos. Al crear una tarea, se puede agregar título, descripción, barra de progreso, nivel de urgencia (con esquema de colores), fecha de inicio y fecha estimada de entrega.

Donde más experiencia tengo es en React, Tailwind, NestJS, TypeScript y MongoDB. Había leído mucho sobre N8N pero no había tenido oportunidad de usarlo, y me pareció muy interesante y veloz. Tampoco había utilizado WebSockets y creo que fue uno de los desafíos más grandes del proyecto. Fue lindo trabajar con algo de presión (ya estoy acostumbrado), y quedé conforme con el producto final, aunque sé que tiene mejoras por realizar.
Gracias por leer y gracias por la oportunidad.
---

## 🚀 Stack Tecnológico

**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS
- @dnd-kit (drag & drop)
- Zustand (state management)
- Socket.io-client
- Framer Motion

**Backend:**
- NestJS (arquitectura MVC)
- MongoDB + Mongoose
- Socket.io (WebSockets)
- Docker

**Automatización:**
- N8N (workflows)
- Nodemailer (emails)

---

## ✨ Funcionalidades

- ✅ Tablero Kanban con drag & drop fluido
- ✅ Columnas fijas: "To Do" y "Done"
- ✅ Columnas personalizables
- ✅ Gestión completa de tareas (crear, editar, eliminar)
- ✅ Prioridades visuales (baja, media, alta)
- ✅ Fechas de inicio y vencimiento
- ✅ Barra de progreso
- ✅ **Colaboración en tiempo real** (WebSocket)
- ✅ **Exportación CSV automática** vía email (N8N)
- ✅ Tema claro/oscuro
- ✅ Notificaciones en tiempo real

---

## 🛠️ Instalación

### Requisitos
- Node.js 18+
- Docker y Docker Compose

### 1. Clonar el repositorio
```bash
git clone https://github.com/EmilianoHernanC/useTeam-PT.git
cd useTeam-PT
2. Configurar variables de entorno
Copiar los archivos .env.example y renombrarlos a .env:
Backend (/backend/.env):
env
MONGODB_URI=mongodb://localhost:27017/kanban-board
PORT=3000
N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
Frontend (/frontend/.env):
env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
3. Levantar servicios Docker
Esto inicia MongoDB y N8N:
bashdocker-compose up -d
Verificar que estén corriendo:
bashdocker ps
4. Instalar dependencias
bash# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
5. Configurar N8N

Abre http://localhost:5678
Crea credenciales locales (email y password cualquiera)
Importa el workflow:

Click en Workflows → Import from File
Selecciona: /n8n/workflow.json


Configura credenciales de Gmail:

Genera una App Password en: https://myaccount.google.com/apppasswords
En el nodo "Send Email" → Credentials → Ingresa tu email y la App Password


Activa el workflow (toggle verde arriba a la derecha)
Guarda (Ctrl+S)

Ver más detalles en: /n8n/setup-instructions.md
6. Ejecutar la aplicación
Terminal 1 - Backend:
bashcd backend
npm run start:dev
Terminal 2 - Frontend:
bashcd frontend
npm run dev

🎮 Uso
Probar Colaboración en Tiempo Real

Abre http://localhost:5173 en dos pestañas del navegador
Crea/edita/mueve tareas en una pestaña
Las tareas se sincronizan automáticamente en la otra pestaña

Exportar Backlog a CSV

Crea algunas tareas
Click en "Exportar Backlog" (botón arriba a la derecha)
Revisa tu email (puede tardar 10-30 segundos)
Descarga el CSV adjunto


🐛 Troubleshooting
MongoDB no conecta:
bashdocker-compose down
docker-compose up -d
WebSocket no funciona:

Verifica que .env del frontend tenga: VITE_WS_URL=ws://localhost:3000

Email no llega:

Usa una App Password de Gmail (no tu contraseña normal)
Revisa spam
En N8N → Executions, verifica si hay errores

N8N no recibe datos:

Asegúrate de que el workflow esté activo (verde)
Verifica la URL del webhook en .env del backend


📁 Estructura
El proyecto sigue la arquitectura MVC de NestJS:
useTeam-PT/
├── backend/           # API NestJS
│   └── src/boards/    # Módulo principal (controllers, services, gateways, schemas)
├── frontend/          # React App
│   └── src/           # Components, hooks, services, stores
├── n8n/               # Workflow de N8N
│   ├── workflow.json
│   └── setup-instructions.md
└── docker-compose.yml

📦 Servicios Docker
El docker-compose.yml levanta:

MongoDB (puerto 27017)
N8N (puerto 5678)

Credenciales N8N por defecto:

Usuario: admin
Password: admin123


🔄 Flujo de Exportación
[Frontend] 
    ↓ Click "Exportar"
[Backend API] 
    ↓ POST /api/export/backlog
[N8N Webhook] 
    ↓ Recibe datos
[Genera CSV] 
    ↓ Estructura datos
[Email Service] 
    ↓ Envía adjunto
[Usuario recibe email]

✅ Checklist de Funcionalidades

 CRUD completo de tableros, columnas y tareas
 Drag & drop entre columnas
 Prioridades con feedback visual
 Fechas y barra de progreso
 WebSocket para colaboración en tiempo real
 Exportación CSV automatizada
 Envío de email con N8N
 Tema claro/oscuro
 Notificaciones
 Docker para servicios
 TypeScript en todo el stack
