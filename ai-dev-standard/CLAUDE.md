# CLAUDE.md — Estándar de Desarrollo

> Plantilla reutilizable. Copia este archivo a la raíz de cada proyecto nuevo y completa
> los `<placeholders>`. Objetivo: menos de 200 líneas siempre — este archivo se lee en
> CADA sesión, así que cada línea debe ganarse su lugar. Lo que no cambia entre proyectos
> ya vive aquí; lo que sí cambia son solo los placeholders.

## 1. Stack del proyecto

- Backend: `<ej. .NET 8 / Node 22 / Python 3.12>`
- Frontend: `<ej. React 18 + TypeScript>`
- Base de datos: `<ej. PostgreSQL vía Supabase con RLS>`
- Infraestructura: `<ej. OCI / AWS / Vercel>`

## 2. Comandos esenciales

```
build:  <comando>
test:   <comando>
lint:   <comando>
format: <comando>
run:    <comando>
```

Estos comandos son los que los hooks de `.claude/settings.json` ejecutan automáticamente.
Si cambian, actualízalos en ambos lugares.

## 3. Flujo de trabajo obligatorio

**Explorar → Planificar → Ejecutar → Verificar → Entregar.**

- Para cualquier tarea de 3+ pasos o que toque más de un archivo: primero explora el
  código relevante y propone un plan (modo plan). No implementes sin plan aprobado.
- Un solo issue por prompt. Si el usuario lista varios problemas, trabájalos uno a la vez.
- Nunca declares una tarea "terminada" sin evidencia real: salida de test, salida de
  build, o captura de pantalla. "Debería funcionar" no es una entrega válida.
- Al cerrar una tarea, resume: archivos modificados, checks ejecutados, límites conocidos,
  y pendientes — no solo "listo".

## 4. Reglas de calidad no negociables

1. **Correctness > Maintainability > Performance.** En caso de duda entre estas tres,
   ese es el orden.
2. Ninguna lógica de negocio se entrega sin su prueba asociada (unitaria como mínimo).
3. Cero secretos, tokens o credenciales hardcodeados — siempre variables de entorno.
4. Cero código muerto o comentado "por si acaso": si no se usa, se borra.
5. Commits atómicos con Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`...).
   Nunca push directo a `main`/`master`.
6. Si una regla de negocio real está en duda, pregunta — no asumas ni inventes.

## 5. Language & Style (solo lo que un linter no puede exigir)

> No repitas aquí principios genéricos (SOLID, DRY, KISS) — el modelo ya los conoce y
> repetirlos solo diluye las reglas específicas de este proyecto. Documenta únicamente
> decisiones que un linter no puede detectar por sí solo.

- `<ej. Los Controllers nunca acceden a DbContext directamente, solo vía Services.>`
- `<ej. Toda función pública expone su contrato con un docstring de una línea.>`
- `<ej. Nombres de tablas en snake_case, nombres de clases C# en PascalCase.>`

## 6. Reglas modulares por área

Reglas específicas de cada capa viven en `.claude/rules/` y se cargan solo cuando
Claude trabaja en esa ruta (ver `paths:` en cada archivo). No dupliques aquí lo que
ya está en:

- `.claude/rules/architecture.md`
- `.claude/rules/api-guidelines.md`
- `.claude/rules/testing-rules.md`
- `.claude/rules/security.md`
- `.claude/rules/git-commits.md`

## 7. Qué NO hacer

- No editar archivos generados automáticamente (migraciones aplicadas, `dist/`, `build/`).
- No usar datos simulados/mock en rutas que corren en producción.
- No saltarte ni desactivar un hook para "avanzar más rápido" — si un hook bloquea algo,
  el problema es el código, no el hook.
- No expandir el alcance de una tarea sin decirlo explícitamente ("de paso también...").

## 8. Especificaciones del proyecto

- Requerimientos: `docs/ERS.md`
- Diseño técnico: `docs/diseno-tecnico.md`
- Historias de usuario / casos de uso: `docs/historias-usuario.md`
- Requerimientos críticos en notación EARS: `docs/requerimientos-ears.md`
