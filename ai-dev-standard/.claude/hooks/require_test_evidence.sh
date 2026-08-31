#!/bin/bash
# Stop — corre la suite de pruebas antes de permitir que la sesión termine limpiamente.
# Si las pruebas fallan, se bloquea el cierre y se le devuelve la salida a Claude para que corrija.
# AJUSTA el comando de test de la sección "STACK" al proyecto real.

echo "Verificando evidencia de pruebas antes de cerrar..." >&2

# ---- STACK: .NET ----
# TEST_OUTPUT=$(dotnet test 2>&1) || { echo "$TEST_OUTPUT" >&2; echo '{"decision": "block", "reason": "Las pruebas fallaron. Corrige antes de cerrar la tarea."}'; exit 0; }

# ---- STACK: Node / TypeScript ----
# TEST_OUTPUT=$(npm test 2>&1) || { echo "$TEST_OUTPUT" >&2; echo '{"decision": "block", "reason": "Las pruebas fallaron. Corrige antes de cerrar la tarea."}'; exit 0; }

# ---- STACK: Python ----
# TEST_OUTPUT=$(pytest 2>&1) || { echo "$TEST_OUTPUT" >&2; echo '{"decision": "block", "reason": "Las pruebas fallaron. Corrige antes de cerrar la tarea."}'; exit 0; }

echo '{"decision": "approve"}'
exit 0
