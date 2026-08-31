# Notación EARS (Easy Approach to Requirements Syntax)

Convierte requerimientos ambiguos en enunciados verificables que el agente puede seguir
sin interpretar. Úsala para los requerimientos **críticos** de cada proyecto — no hace
falta reescribir los 30+ requerimientos de un ERS completo, solo los que tienen mayor
riesgo de ambigüedad o de error costoso.

## Los 5 patrones

| Patrón | Estructura | Cuándo usarlo |
|---|---|---|
| **Ubicuo** | El sistema debe `<comportamiento>`. | Reglas siempre activas, sin condición. |
| **Guiado por evento** | Cuando `<evento>`, el sistema debe `<respuesta>`. | Algo dispara una acción. |
| **Guiado por estado** | Mientras `<estado>`, el sistema debe `<comportamiento>`. | Comportamiento válido solo en cierto estado. |
| **Opcional** | Donde `<característica>`, el sistema debe `<comportamiento>`. | Funcionalidad condicionada a configuración. |
| **No deseado** | Si `<condición no deseada>`, entonces el sistema debe `<respuesta>`. | Manejo de errores / casos límite. |

## Ejemplos aplicados (tomados del proyecto de retail)

**Guiado por evento:**
> Cuando el cliente confirma la intención de compra, el sistema debe aplicar un Soft
> Lock de 15 a 30 minutos sobre el producto antes de continuar el flujo.

**No deseado:**
> Si el cliente exige un precio por debajo del Precio Suelo configurado, entonces el
> sistema debe pausar al Agente de IA y notificar al Administrador (handoff), sin
> ofrecer el descuento.

**Guiado por estado:**
> Mientras un pedido esté en la modalidad "Cobro en Destino", el sistema debe exigir el
> pago de un depósito de seguridad antes de permitir la generación de la orden de
> despacho.

**Ubicuo:**
> El sistema debe ocultar el costo del proveedor (`supplier_cost`) a cualquier actor
> distinto al rol Administrador.

## Cómo usar esta plantilla en un proyecto nuevo

1. Copia este archivo a `docs/requerimientos-ears.md` dentro del proyecto.
2. Identifica del ERS los 5-15 requerimientos con mayor riesgo (dinero, seguridad,
   condiciones de carrera, reglas de negocio con excepciones).
3. Reescríbelos en el patrón EARS correspondiente.
4. Referencia el ID original del ERS (`RF-XX`) para trazabilidad.
