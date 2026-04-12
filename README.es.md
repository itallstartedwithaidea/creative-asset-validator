# Creative Asset Validator

[English](README.md) | [Français](README.fr.md) | [Español](README.es.md) | [中文](README.zh.md) | [Nederlands](README.nl.md) | [Русский](README.ru.md) | [한국어](README.ko.md)

## Plataforma de inteligencia creativa de nivel empresarial

<div align="center">

![Version](https://img.shields.io/badge/version-5.11.0-blue.svg)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)
![AI Powered](https://img.shields.io/badge/AI-Powered-purple.svg)

**La solución completa para validar, organizar y optimizar assets creativos publicitarios en más de 50 plataformas con persistencia de datos a prueba de todo.**

> 🎉 **NUEVO: ¡v5.11.0 ya está aquí!** - Fiabilidad de eliminación al 100%, cero errores de consola, diagnósticos de clase mundial. [Ver novedades →](README-v5.11.0.md)

[Inicio rápido](#inicio-rápido) | [Docs v5.11.0](README-v5.11.0.md) | [Características](#características-principales) | [Despliegue](#despliegue)

</div>

---

## El problema que resolvemos

En la publicidad digital, los equipos creativos enfrentan un desafío diario: asegurar que cada asset cumpla con las especificaciones exactas requeridas por docenas de plataformas diferentes. Un solo creativo con dimensiones incorrectas puede resultar en anuncios rechazados, presupuestos de campaña desperdiciados y oportunidades de mercado perdidas.

Los flujos de trabajo tradicionales implican:
- Verificación manual de dimensiones contra documentación dispersa
- Creación de interminables variaciones de tamaño para cada plataforma
- Pérdida de seguimiento de qué formatos necesita cada cliente
- Búsqueda en estructuras de carpetas desorganizadas
- Incumplimiento de directrices de marca y requisitos de conformidad

Estas ineficiencias cuestan a las agencias y equipos de marketing miles de horas al año.

## Nuestra solución

Creative Asset Validator es una plataforma integral que automatiza todo el flujo de trabajo de assets creativos. Diseñada para equipos de marketing, agencias y empresas, valida assets contra las especificaciones de las plataformas, los organiza de manera inteligente y aprovecha la IA para optimizar el rendimiento creativo.

La plataforma funciona completamente en el navegador con sincronización en la nube opcional, sin necesidad de infraestructura backend compleja, ofreciendo seguridad y funciones de colaboración de nivel empresarial.

---

## Características principales

### Biblioteca de assets y validación

El centro neurálgico de todos los assets creativos. Suba imágenes y videos con arrastrar y soltar, y el sistema los valida automáticamente contra las especificaciones de más de 50 plataformas publicitarias incluyendo YouTube, TikTok, Meta, Google Ads, DV360, The Trade Desk y redes de TV conectada.

- Validación automática de dimensiones y formatos
- Verificación de cumplimiento de tamaño y duración de archivos
- Indicadores visuales de estado para cada plataforma
- Organización por carpetas con etiquetas y favoritos
- Separación de almacenamiento personal y de equipo

### Análisis creativo potenciado por IA

Aproveche múltiples proveedores de IA para analizar la efectividad creativa:

- **Análisis de gancho**: Evalúe los primeros segundos para la captura de atención
- **Detección de CTA**: Evalúe la claridad y ubicación del llamado a la acción
- **Cumplimiento de marca**: Verifique ubicación del logo, colores y directrices
- **Predicción de rendimiento**: Estime el engagement, CTR y potencial de conversión

El sistema orquesta Claude, GPT-4 y Gemini para proporcionar un análisis integral desde múltiples perspectivas.

### Generador de Kit de marca

Transforme un solo logo en un paquete completo de assets de marca. Suba un logo de alta resolución y genere más de 100 variaciones de formato:

- Imágenes de perfil y portadas para redes sociales
- Tamaños de banners de Google Ads
- Favicons e iconos de aplicación
- Firmas de correo electrónico
- Formatos listos para impresión

Cada variación mantiene las proporciones correctas e incluye escalado con IA para fuentes de baja resolución.

### AI Studio

Acceso directo a las capacidades de generación con IA:

- **Texto a imagen**: Genere visuales a partir de descripciones con Gemini
- **Imagen a video**: Convierta imágenes estáticas en movimiento con Veo 3.1
- **Outpainting**: Extienda imágenes a nuevas proporciones
- **Eliminación de fondo**: Aísle sujetos instantáneamente

### Módulo de estrategia

Planifique campañas con confianza:

- **Matriz de ubicaciones**: Cuadrícula visual mostrando todos los requisitos de cada plataforma
- **Hoja de ruta de derivados**: Mapee todas las variaciones necesarias desde los assets principales
- **Planificador de tests A/B**: Diseñe pruebas creativas basadas en hipótesis
- **Predicción de fatiga creativa**: Sepa cuándo los assets necesitan renovarse

### Integración CRM

Gestión integrada de clientes y proyectos que elimina la necesidad de herramientas separadas:

- Perfiles de empresa con directrices de marca
- Seguimiento de proyectos con cronogramas y presupuestos
- Vinculación de assets e historial de versiones
- Uso compartido en equipo con niveles de acceso granulares (Ver, Editar, Completo)
- Compartición automática basada en dominio

### Hub de integraciones

Conéctese a su ecosistema existente:

- **Google Drive**: Navegue carpetas, escanee assets, importe directamente
- **Google Sheets**: Extraiga URLs de imágenes desde hojas de cálculo
- **Gmail**: Escanee adjuntos en busca de assets creativos
- **Dropbox**: Sincronización de carpetas
- **Slack**: Escaneo de archivos de canales

Cada integración incluye análisis de elegibilidad, mostrando qué assets cumplen los requisitos y cuáles necesitan atención.

---

## Arquitectura

### Infraestructura lista para SaaS

La plataforma incluye una arquitectura backend completa para despliegue en producción:

**Capa de base de datos (MySQL)**
- Gestión de usuarios y equipos con acceso basado en roles
- Metadatos de assets con resultados de validación
- Entidades CRM (empresas, proyectos, contactos)
- Seguimiento de sincronización para operación offline-first
- Analítica de uso y registro de auditoría

**Capa API (PHP)**
- Endpoints RESTful para todas las operaciones
- Validación de tokens Google OAuth
- Gestión de sesiones con cifrado
- Integración con Cloudinary para procesamiento de assets

**Motor de sincronización (JavaScript)**
- Sincronización bidireccional entre navegador y servidor
- Resolución de conflictos con seguimiento de versiones
- Cola offline para cambios pendientes
- Actualizaciones de estado en tiempo real

**Opciones de almacenamiento**
- Local: IndexedDB para almacenamiento en el navegador
- Cloud: Cloudinary para procesamiento de imágenes/video y entrega CDN
- Híbrido: Sincronización automática entre local y cloud

### Implementación de seguridad

| Capa | Implementación |
|-------|----------------|
| Cifrado de sesión | AES-256-GCM con derivación de clave PBKDF2 |
| Autenticación | Google SSO con validación JWT |
| Aplicación de dominio | Requisitos de dominio corporativo configurables |
| Vinculación de dispositivo | Sesiones vinculadas a huellas del navegador |
| Anti-manipulación | Verificación de firma HMAC-SHA256 |
| Registro de actividad | Pista de auditoría de 360 días con exportación |
| Aislamiento de datos | Almacenamiento cifrado por usuario |
| Acceso basado en roles | Super Admin, Admin de dominio, Editor, Lector |

---

## Licencia

Software propietario - Todos los derechos reservados

Copyright 2024-2025 It All Started With An Idea

---

<div align="center">

**Creative Asset Validator**

*Valide. Organice. Optimice.*

Diseñado para equipos creativos que exigen precisión y eficiencia.

</div>
