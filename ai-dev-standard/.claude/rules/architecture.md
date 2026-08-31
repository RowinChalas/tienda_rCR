---
paths:
  - "src/**/*"
  - "app/**/*"
---

# Arquitectura y Capas

> Se carga solo cuando Claude trabaja dentro del código fuente. Ajusta los nombres de
> capa a los de tu proyecto real; la estructura de abajo es el patrón por defecto.

## Capas y responsabilidad única

1. **Presentación / Controllers / Endpoints** — reciben la petición, validan forma
   (no reglas de negocio), delegan al servicio correspondiente. Nunca contienen lógica
   de negocio ni acceden a la base de datos directamente.
2. **Servicios / Casos de uso** — contienen la lógica de negocio y orquestan repositorios.
   Un servicio no conoce detalles de HTTP ni de la UI.
3. **Repositorios / Acceso a datos** — únicos autorizados a hablar con la base de datos
   o con APIs externas. No contienen reglas de negocio.
4. **Dominio / Entidades** — modelos y reglas invariantes del negocio, sin dependencias
   de infraestructura.

**Regla de dependencia:** las capas superiores dependen de las inferiores, nunca al
revés. Si un Repositorio necesita algo de un Servicio, es una señal de diseño incorrecto
— detente y repórtalo en vez de forzarlo.

## Tamaño y modularización

- Una función/método hace una sola cosa. Si necesitas "y" para describir qué hace,
  probablemente son dos funciones.
- Límite orientativo: funciones de más de ~40 líneas o archivos de más de ~300 líneas
  son candidatos a dividir — no es una regla dura, es una señal de alerta.
- Un archivo, un propósito. Si un archivo mezcla configuración, lógica de negocio y
  utilidades sin relación, se divide.
- Prefiere composición sobre herencia profunda (más de 2 niveles de herencia es una
  señal de alerta).

## Antes de crear un archivo nuevo

Busca primero si ya existe un patrón equivalente en el proyecto (`grep`/`glob`) y
síguelo, en vez de introducir una convención nueva para el mismo problema.
