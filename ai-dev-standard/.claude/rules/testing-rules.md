---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "**/*Tests.cs"
  - "**/tests/**"
---

# Reglas de Pruebas

## No negociable

- Ninguna lógica de negocio se entrega sin al menos una prueba unitaria que la cubra.
- Ante un bug: primero se escribe una prueba que falla reproduciendo el defecto,
  después se corrige el código, y la prueba pasa a ser la evidencia del arreglo.
- Una tarea no está "terminada" hasta que el comando de test del proyecto se ejecutó
  y su salida real (no un resumen inventado) se muestra como evidencia.

## Estructura

- Patrón Arrange-Act-Assert (AAA) en cada prueba: preparar datos, ejecutar la acción,
  verificar el resultado. Un solo "Act" por prueba.
- Nombre de prueba describe comportamiento esperado, no implementación:
  `debería_rechazar_descuento_menor_al_precio_suelo`, no `test_pricing_1`.
- Nada de pruebas que solo verifiquen que "no lanza excepción" sin verificar el
  resultado real.

## Cobertura razonable, no cobertura por vanidad

- Prioriza cubrir: reglas de negocio, casos límite (vacío, nulo, máximo, mínimo),
  y rutas de error.
- No es necesario probar getters/setters triviales ni código generado.

## Pirámide de pruebas

1. Unitarias (mayoría) — rápidas, sin red ni base de datos real.
2. Integración — repositorios contra una base de datos de prueba real o contenedor.
3. End-to-end (mínimas) — solo los flujos críticos de negocio completos.
