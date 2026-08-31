# Requerimientos Críticos del Sistema — Notación EARS
### Hub de Retail "Just-in-Time" y CRM Omnicanal para Venta de Mobiliario
**Versión 1.0 — Contratos de Dominio Inmutables**

Este documento formaliza en notación EARS (*Easy Approach to Requirements Syntax*) los requerimientos críticos del sistema con mayor impacto en integridad financiera, seguridad de datos, condiciones de carrera y trazabilidad de pedidos.

---

## 1. Requerimientos Ubicuos (Reglas Universales)

### EARS-U-01 — Aislamiento del Costo de Proveedor (RF-08, RNF-04)
> **El sistema debe ocultar el costo base del proveedor (`supplier_cost`) y las reglas de margen a cualquier actor que no posea el rol explícito de `admin` o servicio backend autenticado.**
- *Invariante:* Ni el agente IA, ni el frontend público, ni el portal del proveedor pueden acceder a los márgenes o costos de otros proveedores.

### EARS-U-02 — Formato de Respuestas de Error (API Conventions)
> **El sistema debe retornar todas las respuestas de error bajo la estructura unificada `{"error": {"code": string, "message": string, "details"?: any}}` y nunca exponer stack traces.**

### EARS-U-03 — Inmutabilidad del Registro de Auditoría de Estados (RF-22)
> **El sistema debe registrar de forma inmutable cada cambio de estado de un pedido en la tabla `order_state_log`, incluyendo estado previo, nuevo estado, timestamp y actor desencadenante (`sistema`, `ia`, `admin`, `proveedor`).**

---

## 2. Requerimientos Guiados por Evento (Event-Driven)

### EARS-E-01 — Bloqueo Temporal (Soft Lock) al Confirmar Intención de Compra (RF-21, UC-01)
> **Cuando el cliente confirma su intención de compra, el sistema debe aplicar un `Soft Lock` con expiración automática de 15 a 30 minutos sobre el producto antes de proceder con el cobro o la solicitud de depósito.**

### EARS-E-02 — Notificación Interactiva de Verificación de Stock (RF-21, US-14)
> **Cuando se aplica el Soft Lock sobre un pedido, el sistema debe emitir un ping interactivo vía WhatsApp al proveedor con las opciones rápidas "Confirmar Stock" y "Agotado".**

### EARS-E-03 — Ingesta Automática de Pre-Productos desde WhatsApp (RF-01, US-01)
> **Cuando un proveedor registrado envía una imagen con descripción y costo vía WhatsApp, el sistema debe crear un registro de pre-producto en estado `borrador` y asociar el archivo multimedia original.**

### EARS-E-04 — Cálculo Automático de Precios en Ingesta (RF-07, RF-08, US-07)
> **Cuando el administrador o proveedor ingresa el costo base de un producto, el sistema debe calcular inmediatamente el Precio de Venta Sugerido y el Precio Suelo (`floor_price`) aplicando la regla de margen correspondiente a la categoría o proveedor.**

---

## 3. Requerimientos Guiados por Estado (State-Driven)

### EARS-S-01 — Depósito Obligatorio en Modalidad Cobro en Destino (RF-27, RF-28, US-16)
> **Mientras un pedido se encuentre en la modalidad "Cobro en Destino", el sistema debe exigir el registro y confirmación del pago del depósito de seguridad antes de autorizar la generación de la orden de despacho.**

### EARS-S-02 — Visibilidad Restringida en Facturación Centralizada (RF-24, US-15)
> **Mientras un pedido se procese bajo "Facturación Centralizada", el sistema debe entregar al proveedor una orden de despacho sin información de precios de venta finales ni datos fiscales del cliente.**

### EARS-S-03 — Liberación de Datos Fiscales en Facturación Delegada (RF-25, US-15)
> **Mientras un pedido se procese bajo "Facturación Delegada", el sistema debe transmitir al proveedor los datos fiscales completos del cliente para la emisión directa del comprobante de venta.**

### EARS-S-04 — Exclusión de Catálogo Público para Productos Agotados (RF-06, US-06)
> **Mientras un producto tenga el estado `agotado`, el sistema debe excluirlo de los resultados de búsqueda públicos y marcarlo como no ofertable para el Agente de IA.**

---

## 4. Requerimientos de Manejo No Deseado / Casos Límite (Unwanted / Edge Cases)

### EARS-N-01 — Handoff Inmediato ante Ofertas por Debajo del Precio Suelo (RF-16, RF-17, US-11)
> **Si el cliente solicita un precio inferior al `floor_price` configurado para el producto, entonces el sistema debe pausar al Agente de IA, transferir la conversación a un operador humano (`handoff`) y registrar la alerta en el CRM sin conceder el descuento.**

### EARS-N-02 — Bloqueo de Publicación de Productos Incompletos (RF-05, US-05)
> **Si un producto en estado `borrador` o `revision` carece de imagen procesada, dimensiones, categoría o costo base válido, entonces el sistema debe bloquear el botón "Publicar" e indicar la lista exacta de campos faltantes.**

### EARS-N-03 — Expiración de Soft Lock sin Respuesta del Proveedor (UC-01)
> **Si el proveedor no confirma la existencia del producto antes de que expire el temporizador del Soft Lock, entonces el sistema debe liberar el bloqueo del producto, marcar la solicitud en espera y notificar al Administrador para intervención manual.**

### EARS-N-04 — Respuesta de Proveedor "Agotado" en Validación (UC-01)
> **Si el proveedor responde "Agotado" durante la validación de inventario, entonces el sistema debe cancelar la reserva, actualizar el estado del producto a `agotado`, y solicitar al Agente de IA que ofrezca productos relacionados (cross-sell/alternativas) al cliente.**

---

## 5. Requerimientos Opcionales (Features Condicionales)

### EARS-O-01 — Redondeo Psicológico de Precios (RF-09, US-08)
> **Donde el Administrador active la sugerencia de psicología de precios, el sistema debe redondear automáticamente el precio sugerido a la terminación comercial más cercana (ej: $19,990 en lugar de $20,250) respetando siempre el Precio Suelo.**

### EARS-O-02 — Extracción OCR de Comprobantes de Transferencia (RF-29, US-17)
> **Donde el cliente adjunte una imagen de comprobante de transferencia bancaria, el sistema debe procesar la imagen con OCR para pre-llenar el número de referencia y el monto para validación rápida del Administrador.**
