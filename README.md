# PRISMA — Seguridad Industrial · ISO 45001

Plataforma web + PWA para **seguridad e higiene laboral**: checklists y permisos de trabajo, incidentes con **foto + GPS**, **mapa de riesgos** (Leaflet), sensores, **capacitaciones con voz**, **QR por tarea**, **exportación PDF/CSV**, **offline-first**, **i18n (ES/EN)** y **tema claro/oscuro**.

![Logo](logo-prisma.png)

---

## Tabla de contenido
- [Demo local](#demo-local)
- [Características](#características)
- [Stack técnico](#stack-técnico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Configuración rápida](#configuración-rápida)
- [Módulos y navegación](#módulos-y-navegación)
- [Persistencia de datos (LocalStorage)](#persistencia-de-datos-localstorage)
- [PWA (Service Worker + Manifest)](#pwa-service-worker--manifest)
- [Internacionalización (ES/EN)](#internacionalización-esen)
- [Accesibilidad](#accesibilidad)
- [Seguridad y privacidad](#seguridad-y-privacidad)
- [Despliegue](#despliegue)
- [Hoja de ruta](#hoja-de-ruta)
- [Solución de problemas](#solución-de-problemas)
- [Cómo contribuir](#cómo-contribuir)
- [Licencia](#licencia)

---

## Demo local
- Abre `index.html` con **Live Server** (VSCode) **o** sirve la carpeta con:
  ```bash
  npx serve .
