# 🏛️ FORO DE ALCALDES Y GOBERNADORES 2026 - SISTEMA MODULAR

> **Especificación Técnica y Réplica Oficial de Diseño:** Construido siguiendo los estándares canónicos de arquitectura modular definidos en `E:\GUIA\www_app`.
>
> **Autor Oficial:** Ricardo Alonso Rodriguez Malaver (DNI: 74909613) | [GitHub](https://github.com/ROMA147258) | [Contacto](mailto:ricardo27roma13@gmail.com)  
> **Patrón Arquitectónico:** Topología A (Directa: `backend/` + `frontend/` + `packages/shared/`) | Clean Architecture | Zero God-Files (< 300 líneas/archivo) | Zero Tech-Exposure | Idempotencia y Prevención de Race Conditions | GPU-Accelerated Preloader

---

## 📱 INTEGRACIÓN DE WHATSAPP OFICIAL
- **Número Asignado:** `907772155` (+51 907 772 155)
- **Botón Flotante Activo:** Widget permanente en la esquina inferior derecha con halo pulsante animado y tooltip interactivo.
- **Acceso en Header:** Enlace directo en la barra superior de navegación.
- **Enlace de Comunicación:** `https://wa.me/51907772155` con mensajes contextuales predeterminados para registro, ponencias y misiones de la Ruta Internacional.

---

## 🧭 TOPOLOGÍA A & MONOREPO DE DOMINIO

```text
E:\MCDL\GOBERNA\
├── package.json                         # NPM Workspaces ("packages/*", "backend", "frontend")
├── .env.example                         # Plantilla raíz con placeholders seguros
├── .env                                 # Variables de entorno locales
├── .gitignore                           # Exclusión de archivos sensibles
├── arrancar_servidor.bat                # Script de arranque en un solo clic
├── README.md                            # Documentación y autoría
│
├── packages/
│   └── shared/                          # 📦 Contratos, constantes, validadores y utilidades
│       ├── package.json                 # @mcdl/shared
│       └── src/
│           ├── index.js
│           ├── constants/               # Info institucional, ponentes, ejes, ruta
│           ├── validators/              # Validación de teléfono Perú (9 dígitos), DNI, emails
│           └── utils/                   # Formateadores y utilidades
│
├── backend/                             # ⚙️ Servidor Modular Express (< 300 líneas por archivo)
│   ├── package.json                     # @mcdl/backend
│   ├── server.js                        # Bootstrap ultra-compacto (< 40 líneas)
│   ├── src/
│   │   ├── app.js                       # Montaje modular, compresión, middlewares de seguridad
│   │   ├── core/                        # RateLimiting en memoria O(1), ErrorHandler silencioso
│   │   └── modules/
│   │       ├── registro/                # Ingesta idempotente de participantes
│   │       ├── ponentes/                # Datos y trayectorias de expositores
│   │       └── info/                    # Información del evento y endpoints de WhatsApp
│
└── frontend/                            # 🎨 Interfaz visual desacoplada (UI/UX)
    ├── package.json                     # @mcdl/frontend
    ├── index.html                       # Shell HTML semántico, accesible y responsivo
    ├── css/
    │   ├── tokens.css                   # Tokens de color, tipografía oficial y gradientes
    │   ├── preloader.css                # Preloader GPU-accelerated Zero-FOUC
    │   ├── main.css                     # Layouts, utilidades y tipografía
    │   └── sections.css                 # Hero, Bento Grid, Ponentes, Ruta y WhatsApp
    ├── assets/img/                      # Recursos visuales reales exportados de Adobe XD
    └── src/
        ├── main.js                      # Bootstrap del cliente
        ├── store.js                     # Store reactivo desacoplado (Cero window.*)
        ├── apiClient.js                 # Consumo de API
        └── features/                    # Ponentes, Trayectorias, WhatsApp, Registro
```

---

## 🚀 PUESTA EN MARCHA (LOCAL)

### Opción 1: En un Clic (Windows)
Ejecute el archivo:
```bat
arrancar_servidor.bat
```

### Opción 2: Vía Terminal
```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Iniciar servidor integrado
npm start
```

Abrir navegador en:
👉 `http://localhost:5236`

---

## 🔒 CUMPLIMIENTO DE LAS REGLAS DE ORO
1. **Zero Tech-Exposure:** No se exponen firmas criptográficas, nombres de bases de datos ni términos técnicos en la UI.
2. **Login y Formularios Limpios:** Sin tabs innecesarios ni selectores superfluos.
3. **Cero Secretos en Cliente:** Variables protegidas en backend y exclusión en `.gitignore`.
4. **Prevención de Race Conditions:** Candado de idempotencia inmediato en el botón de reserva (`submitBtn.disabled = true`) y control de duplicidad en backend.
5. **Zero God-Files:** Todos los archivos respetan el límite de < 300 líneas.
6. **Desacoplamiento de Estado:** Estado centralizado en `store.js` sin polución de `window.*`.
7. **Base de Datos Cloud / Anti-JSON:** Prohibición estricta de archivos `.json` locales para almacenamiento persistente. Los registros se despachan directamente a la nube (Google Sheets / PostgreSQL) evitando la pérdida por sistemas de archivos efímeros (Serverless/Contenedores/Vercel/Render) y la corrupción por colisiones concurrentes (Race Conditions).

