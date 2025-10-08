# 📘 Configuración de N8N para Exportación de Backlog

Este documento explica cómo configurar N8N para la funcionalidad de exportación de backlog en formato CSV.

---

## 🚀 Requisitos Previos

- Docker y Docker Compose instalados
- Cuenta de Gmail con verificación en 2 pasos activada
- Proyecto ya clonado y configurado

---

## 📦 Paso 1: Levantar N8N

N8N ya está configurado en el `docker-compose.yml`. Para levantarlo:

```bash
docker-compose up -d
```

Verificar que esté corriendo:

```bash
docker ps
```

Deberías ver el contenedor `kanban-n8n` en el puerto 5678.

---

## 🔑 Paso 2: Acceder a N8N

1. Abre tu navegador en: `http://localhost:5678`
2. **Primera vez:** Crea credenciales locales:
   - Email: cualquier email (ej: `admin@localhost.com`)
   - Password: elige una contraseña
   - Nombre: tu nombre

**Nota:** Estas credenciales son solo para tu instalación local.

---

## 📥 Paso 3: Importar el Workflow

1. En N8N, click en **Workflows** (menú lateral)
2. Click en **Import from File**
3. Selecciona el archivo: `n8n/workflow.json`
4. El workflow "Kanban Export CSV" se importará automáticamente

---

## ⚙️ Paso 4: Configurar Credenciales de Gmail

El workflow necesita credenciales de Gmail para enviar emails:

### 4.1. Generar App Password de Gmail

1. Ve a: https://myaccount.google.com/apppasswords
2. **Nombre de la app:** N8N Kanban
3. Click en **Generar**
4. **Copia el código de 16 caracteres** (sin espacios)

### 4.2. Configurar en N8N

1. Abre el workflow importado
2. Click en el nodo **"Send Email"**
3. En **Credentials**, click en **Create New Credential**
4. Completa:
   - **User:** tu-email@gmail.com
   - **Password:** [el código de 16 caracteres sin espacios]
   - **Host:** smtp.gmail.com
   - **Port:** 587
   - **SSL/TLS:** Activado
   - **Client Host Name:** (dejar vacío)
5. Click en **Save**

---

## ✅ Paso 5: Activar el Workflow

1. En el workflow, asegúrate de que todos los nodos estén conectados:
   ```
   [Webhook] → [Code] → [Send Email]
   ```
2. Arriba a la derecha, activa el **toggle** para que quede en **verde** (Active)
3. Click en **Save** (Ctrl+S)

---

## 🧪 Paso 6: Probar la Exportación

1. Abre el frontend: `http://localhost:5173`
2. Crea algunas tareas en diferentes columnas
3. Click en el botón **"Exportar Backlog"** (header)
4. Deberías recibir un email con el archivo CSV adjunto

---

## 🔍 Verificar Ejecuciones

Para ver si el workflow se ejecutó correctamente:

1. En N8N, click en **Executions** (arriba a la derecha)
2. Verás el historial de ejecuciones
3. Click en una ejecución para ver los detalles de cada nodo

---

## 🐛 Troubleshooting

### Email no llega

- Verifica que la App Password esté sin espacios
- Revisa la carpeta de Spam
- En N8N → Executions, revisa si hay errores

### Webhook no recibe datos

- Verifica que el workflow esté **activo** (verde)
- Revisa que el `.env` del backend tenga:
  ```
  N8N_WEBHOOK_URL=http://localhost:5678/webhook/kanban-export
  ```

### CSV vacío

- Verifica que haya tareas creadas en el tablero
- Revisa los logs del backend en la consola

---

## 📧 Configuración del Email Destino

Por defecto, el email se envía al mismo correo configurado en las credenciales. 

Para cambiarlo:
1. Abre el workflow
2. Click en el nodo **"Send Email"**
3. Cambia el campo **"To Email"**
4. Guarda el workflow

---

## ℹ️ Información Adicional

- **Puerto N8N:** 5678
- **Webhook URL:** `http://localhost:5678/webhook/kanban-export`
- **Versión N8N:** 1.106.3
- **Formato CSV:** ID, Título, Descripción, Columna, Prioridad, Fecha Límite, Progreso, Fecha Creación

---

## 🔄 Reiniciar N8N

Para reiniciar N8N:

```bash
docker-compose restart kanban-n8n
```

Para detener todo:

```bash
docker-compose down
```

Para limpiar volúmenes (borra configuración):

```bash
docker-compose down -v
docker-compose up -d
```

