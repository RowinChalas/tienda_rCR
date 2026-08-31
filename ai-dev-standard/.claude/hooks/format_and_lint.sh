#!/bin/bash
# PostToolUse — corre formateador y linter automáticamente tras cada Write/Edit.
# AJUSTA los comandos de la sección "STACK" al proyecto real. Deja comentados los que no apliquen.

set -e

echo "Ejecutando formato y lint..." >&2

# ---- STACK: .NET ----
# Requiere: linters/dotnet/.editorconfig y Directory.Build.props copiados a la raíz del proyecto .NET
# dotnet format --no-restore >&2 || { echo "Formato .NET falló"; exit 2; }

# ---- STACK: Node / TypeScript ----
# Requiere: linters/node/eslint.config.js y .prettierrc.json copiados a la raíz del proyecto frontend
# npx eslint . --fix >&2 || { echo "ESLint falló"; exit 2; }
# npx prettier --write . >&2

# ---- STACK: Python ----
# Requiere: linters/python/pyproject.toml (sección [tool.ruff]/[tool.black]) en el proyecto
# ruff check --fix . >&2 || { echo "Ruff falló"; exit 2; }
# black . >&2

# Exit code 2 = bloquea y devuelve el error a Claude para que lo corrija.
# Exit code 0 = todo bien, continúa.
exit 0
