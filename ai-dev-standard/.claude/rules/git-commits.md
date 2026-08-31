---
paths:
  - "**/*"
---

# Convenciones de Git

- Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`,
  seguido de una descripción breve en modo imperativo.
- Un commit, un cambio lógico. No mezclar una refactorización con una funcionalidad
  nueva en el mismo commit.
- Nunca `git push --force` sobre una rama compartida.
- Nunca commitear archivos de configuración local, `.env`, ni artefactos de build.
- Antes de proponer un commit, confirma que los checks del proyecto (lint + test)
  pasaron — no se commitea código roto "para arreglarlo después".
