# Estándar de Desarrollo Asistido por IA — Kit Reutilizable

Este kit es tu punto de partida para **cualquier proyecto nuevo**. Encapsula el
enfoque de Spec-Driven Development (spec como contrato, código como artefacto) más
un sistema de compuertas reales (hooks) para que la calidad no dependa de que el
agente "se acuerde" de una instrucción.

## Contenido

```
ai-dev-standard/
├── CLAUDE.md                        # Núcleo de instrucciones — se lee cada sesión
├── .claude/
│   ├── settings.json                 # Registro de hooks
│   ├── hooks/
│   │   ├── block_protected_paths.sh  # PreToolUse: bloquea rutas sensibles
│   │   ├── format_and_lint.sh        # PostToolUse: formatea/lintea tras cada edición
│   │   └── require_test_evidence.sh  # Stop: exige que las pruebas pasen antes de cerrar
│   └── rules/
│       ├── architecture.md           # Capas, límites de tamaño, modularización
│       ├── api-guidelines.md         # Convenciones REST
│       ├── testing-rules.md          # AAA, pirámide de pruebas, no negociables
│       ├── security.md               # Siempre activa, sin importar la ruta
│       └── git-commits.md            # Conventional Commits, un commit = un cambio
├── docs/
│   └── EARS-template.md              # Notación para requerimientos críticos
├── linters/                          # Configs reales que los hooks invocan
│   ├── dotnet/
│   │   ├── .editorconfig
│   │   ├── stylecop.json
│   │   └── Directory.Build.props
│   ├── node/
│   │   ├── eslint.config.js
│   │   ├── .prettierrc.json
│   │   └── .editorconfig
│   └── python/
│       └── pyproject.toml
├── ci/
│   └── github-actions-ci.yml         # Red de seguridad independiente de Claude Code
└── git-hooks/
    ├── husky-setup.md                # Para proyectos Node/React
    └── native/
        └── pre-commit                # Para proyectos .NET-only, sin npm
```

**Tres capas de la misma regla, cada una independiente de la anterior:**
1. `.claude/hooks/` → corre solo dentro de una sesión de Claude Code.
2. `git-hooks/` (Husky o nativo) → corre en cualquier `git commit`/`push`, con o sin IA.
3. `ci/github-actions-ci.yml` → corre en el servidor de GitHub, aunque alguien se salte
   los dos anteriores localmente. Esta es la que de verdad no se puede evadir.

## Cómo arrancar un proyecto nuevo con este kit

1. **Copia toda la carpeta** `.claude/` y `CLAUDE.md` a la raíz del nuevo repositorio.
2. **Completa los placeholders** de `CLAUDE.md` (§1 Stack, §2 Comandos, §5 Language & Style).
3. **Descomenta los comandos correctos** en `.claude/hooks/format_and_lint.sh` y
   `.claude/hooks/require_test_evidence.sh` según el stack (.NET / Node / Python ya
   están de ejemplo; agrega el tuyo si es distinto).
4. **Da permisos de ejecución** a los scripts:
   ```bash
   chmod +x .claude/hooks/*.sh
   ```
5. **Coloca tus documentos de especificación** en `docs/` (`ERS.md`,
   `diseno-tecnico.md`, `historias-usuario.md`) — son los que `CLAUDE.md` §8 referencia.
6. **Escribe en EARS** los 5-15 requerimientos más críticos usando
   `docs/EARS-template.md` como guía, y guárdalos en `docs/requerimientos-ears.md`.
7. Corre `/init` en Claude Code para que complemente el `CLAUDE.md` con lo que
   detecte automáticamente del código ya existente (si es un proyecto brownfield).
8. **Copia los archivos de `linters/<tu-stack>/`** a la raíz de cada subproyecto
   (backend/frontend) — son los que los hooks de `.claude/hooks/format_and_lint.sh`
   terminan invocando.
9. **Copia `ci/github-actions-ci.yml`** a `.github/workflows/ci.yml` en la raíz del
   repo, ajusta los `working-directory` a tus carpetas reales, y borra el job del
   stack que no uses (backend-dotnet o frontend-node).
10. **Configura git hooks nativos:**
    - Proyecto con Node/React → sigue `git-hooks/husky-setup.md`.
    - Proyecto .NET-only sin npm → copia `git-hooks/native/pre-commit` a
      `.githooks/pre-commit` y corre `git config core.hooksPath .githooks`.
11. Commitea todo (`CLAUDE.md`, `.claude/`, `docs/`, configs de linters copiadas,
    `.github/workflows/ci.yml`, `.husky/` o `.githooks/`) al repositorio — nada de
    esto es configuración local, se comparte con todo el equipo.

## Filosofía detrás del kit (resumen)

- **La especificación es el contrato; el código es el artefacto.** No se codifica
  sin spec, aunque sea breve.
- **Instrucción ≠ garantía.** Lo que debe cumplirse siempre va en un hook, no solo
  en una frase de CLAUDE.md.
- **Progressive disclosure.** `CLAUDE.md` se mantiene corto; el detalle vive en
  `.claude/rules/` y solo se carga cuando el agente trabaja en esa ruta.
- **Evidencia, no promesas.** Ninguna tarea se cierra sin salida real de tests/build.
- **Correctness > Maintainability > Performance**, en ese orden, ante cualquier duda.

## Mantenimiento

Revisa y actualiza este kit cada 1-2 meses conforme aprendas qué reglas realmente se
cumplen y cuáles se ignoran — un CLAUDE.md/hook que nadie sigue es peor que no tenerlo,
porque genera falsa confianza.
