#!/bin/bash
# PreToolUse — bloquea escritura/edición en rutas que nunca deben tocarse a mano por el agente.
# Lee el path del archivo objetivo desde stdin (JSON) y lo compara contra la lista negra.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed -E 's/.*:"(.*)"/\1/')

PROTECTED_PATTERNS=(
  "\.env$"
  "\.env\."
  "migrations/.*\.sql$"
  "node_modules/"
  "dist/"
  "build/"
  "\.claude/settings\.json$"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qE "$pattern"; then
    echo "{\"decision\": \"block\", \"reason\": \"Ruta protegida por directriz de proyecto: $FILE_PATH. Si el cambio es intencional, edítalo manualmente o actualiza la lista en block_protected_paths.sh.\"}"
    exit 0
  fi
done

echo "{\"decision\": \"approve\"}"
exit 0
