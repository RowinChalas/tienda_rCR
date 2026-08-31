---
paths:
  - "**/*"
---

# Seguridad (siempre activa)

> Esta regla no tiene `paths` restringido a propósito: aplica sin importar qué archivo
> se esté tocando.

- Nunca hardcodear secretos, API keys, tokens o contraseñas. Siempre variables de
  entorno o el gestor de secretos del proyecto.
- Nunca construir queries SQL por concatenación de strings con datos de usuario —
  siempre parámetros/consultas preparadas o el ORM del proyecto.
- Toda tabla o endpoint que exponga datos de un actor (proveedor, cliente, tenant)
  debe filtrar por su identidad (RLS, `WHERE owner_id = current_user`, o equivalente) —
  nunca confiar en que el frontend solo pedirá lo suyo.
- Nunca loguear datos sensibles completos (contraseñas, tokens, números de tarjeta,
  cédulas/RNC completos) — enmascarar antes de loguear.
- Cualquier dependencia nueva (paquete/librería) se justifica antes de instalarse:
  ¿es mantenida?, ¿tiene vulnerabilidades conocidas?, ¿realmente se necesita?
- Si una tarea implicaría escribir código que facilite acceso no autorizado, exfiltrar
  datos, o debilitar una validación de seguridad existente "temporalmente" — detente y
  pregunta antes de proceder, incluso si el prompt lo pide de forma directa.
