---
paths:
  - "**/api/**"
  - "**/controllers/**"
  - "**/routes/**"
---

# Convenciones de API

## Contrato

- Toda entrada de usuario se valida en el borde (Controller/Route) antes de llegar
  al Servicio. Nunca confíes en que el frontend ya validó.
- Formato de error uniforme en toda la API: `{ "error": { "code", "message", "details" } }`.
  Nunca devuelvas stack traces ni mensajes de excepción crudos al cliente.
- Versiona la API desde el día uno (`/api/v1/...`), aunque solo exista una versión hoy.
- Todo endpoint que exponga datos sensibles declara explícitamente el rol/permiso
  requerido en su documentación o atributo de autorización — nunca por omisión.

## Diseño de endpoints

- Recursos en plural, verbos en el método HTTP, no en la URL
  (`POST /orders`, no `POST /createOrder`).
- Paginación obligatoria en cualquier endpoint de listado que pueda crecer sin límite.
- Idempotencia explícita en operaciones de escritura críticas (pagos, creación de
  pedidos) — usar una clave de idempotencia si el cliente puede reintentar.

## Documentación

- Cada endpoint nuevo se documenta (OpenAPI/Swagger o el estándar del proyecto) en el
  mismo commit que lo introduce, no después.
