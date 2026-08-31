# Git hooks nativos con Husky (proyectos Node/React)

Los hooks de `.claude/` solo corren **dentro de una sesión de Claude Code**. Si alguien
edita a mano y hace `git commit` sin pasar por el agente, nada lo detiene. Husky cierra
ese hueco a nivel de Git, para cualquier editor o persona.

## Instalación

```bash
npm install -D husky lint-staged
npx husky init
```

Esto crea `.husky/pre-commit`. Reemplaza su contenido por:

```bash
#!/usr/bin/env sh
npx lint-staged
```

## Configuración de lint-staged

Agrega a `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

## Hook adicional: no permitir push si los tests fallan

Crea `.husky/pre-push`:

```bash
#!/usr/bin/env sh
npm test -- --run
```

## Resultado

- `git commit` → lint-staged corrige/valida solo los archivos modificados (rápido).
- `git push` → corre la suite completa de tests antes de permitir el push.
- Esto corre **siempre**, sin importar si el cambio vino de Claude Code o de una
  edición manual — es la red de seguridad real.
