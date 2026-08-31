# CLAUDE.md — Estándar de Desarrollo

## 1. Stack del proyecto

- Backend: .NET 8+ API REST (OCI) / Supabase Client agnostic wrapper
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide React
- Base de datos: Supabase (PostgreSQL + RLS/JWT)
- Testing: Vitest + React Testing Library (AAA Pattern)
- Linters: ESLint 9 (Flat Config) + Prettier + EditorConfig

## 2. Comandos esenciales

```
build:        npm run build
test:         npm run test:run
lint:         npm run lint
format:       npm run format
format:check: npm run format:check
run:          npm run dev
```

## 3. Flujo de trabajo obligatorio

**Explorar → Planificar → Ejecutar → Verificar → Entregar.**

- Para cualquier tarea de 3+ pasos o que toque más de un archivo: primero explora el código relevante y propone un plan (modo plan). No implementes sin plan aprobado.
- Un solo issue por prompt. Si el usuario lista varios problemas, trabájalos uno a la vez.
- Nunca declares una tarea "terminada" sin evidencia real: salida de test, salida de build, o captura de pantalla. "Debería funcionar" no es una entrega válida.
- Al cerrar una tarea, resume: archivos modificados, checks ejecutados, límites conocidos, y pendientes — no solo "listo".

## 4. Reglas de calidad no negociables

1. **Correctness > Maintainability > Performance.** En caso de duda entre estas tres, ese es el orden.
2. Ninguna lógica de negocio se entrega sin su prueba asociada (unitaria como mínimo con patrón AAA).
3. Cero secretos, tokens o credenciales hardcodeados — siempre variables de entorno.
4. Cero código muerto o comentado "por si acaso": si no se usa, se borra.
5. Commits atómicos con Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`...).
6. Si una regla de negocio real está en duda, pregunta — no asumas ni inventes.

## 5. Language & Style (decisiones de arquitectura)

- La UI es "tonta" (solo muestra datos y despacha eventos). La Lógica es "ciega" (no sabe cómo se muestra).
- Toda llamada a API / base de datos pasa por Interfaces de Repositorio intermedias (`IProductRepository`, `IOrderRepository`, etc.).
- Nunca usar números ni colores mágicos hardcodeados; usar siempre variables semánticas (`var(--color-...)` / `src/design-system/tokens.css`).
- Todo componente visual maneja explícitamente sus 4 estados: Loading, Error, Empty y Data Overflow.
- Formato de error unificado: `{ "error": { "code": string, "message": string, "details"?: any } }`.

## 6. Reglas modulares por área

- `.claude/rules/architecture.md`
- `.claude/rules/api-guidelines.md`
- `.claude/rules/testing-rules.md`
- `.claude/rules/security.md`
- `.claude/rules/git-commits.md`

## 7. Qué NO hacer

- No editar archivos generados automáticamente (`dist/`, `build/`, `node_modules/`).
- No usar datos simulados sin interfaz abstracta que permita conectar la API real sin cambiar la UI.
- No saltarse los tests unitarios ni entregar sin salida real de `npm run test:run` o `npm run build`.

## 8. Especificaciones del proyecto

- Requerimientos: `Requerimientos/Diseno_Tecnico.md`
- Historias de usuario / casos de uso: `Requerimientos/Historias_Usuario_Casos_Uso.md`
- Requerimientos críticos en notación EARS: `docs/requerimientos-ears.md`
