# Historias de Usuario y Casos de Uso Detallados
### Hub de Retail "Just-in-Time" y CRM Omnicanal para Venta de Mobiliario
**Versión 1.0 — Complementa el ERS y el Documento de Diseño Técnico**

Cada historia usa el formato `Como [actor] quiero [acción] para [beneficio]` con criterios de aceptación en formato Gherkin (Given/When/Then), y referencia su requerimiento funcional (RF) del ERS cuando aplica.

---

## Épica A — Ingesta de Catálogo

### US-01 — Crear pre-producto desde WhatsApp
**Como** proveedor, **quiero** enviar una foto y precio por WhatsApp, **para** publicar mercancía sin usar un sistema nuevo.
*(RF-01)*

- **Dado** que soy un número registrado como proveedor
- **Cuando** envío una imagen con texto de precio y descripción
- **Entonces** el sistema crea un registro en estado `Borrador` visible en la bandeja del Administrador
- **Y** el mensaje original (foto + texto) queda ligado al pre-producto como referencia

### US-02 — Cargar producto vía portal web
**Como** proveedor, **quiero** subir productos desde un formulario web, **para** digitalizar mi inventario sin depender de WhatsApp.
*(RF-02)*

- **Dado** que tengo acceso al Portal de Proveedores
- **Cuando** completo foto, dimensiones, color y costo base
- **Entonces** el producto entra en estado `Borrador` pendiente de aprobación del Administrador

### US-03 — Gestionar bandeja de borradores
**Como** administrador, **quiero** ver los borradores en columnas (Crudos / En Edición / Listos), **para** priorizar mi trabajo de curaduría.
*(RF-03)*

- **Dado** que existen productos en distintos estados de preparación
- **Cuando** abro el panel de catálogo
- **Entonces** veo un tablero tipo Kanban con los productos agrupados por su nivel de completitud

### US-04 — Editar imágenes desde el panel
**Como** administrador, **quiero** remover el fondo y recortar la foto sin salir del sistema, **para** estandarizar el catálogo rápidamente.
*(RF-04)*

- **Dado** que estoy editando un pre-producto
- **Cuando** aplico "Remover fondo" o "Recortar 1:1"
- **Entonces** la imagen se actualiza en el registro sin necesidad de herramientas externas

### US-05 — Bloqueo de publicación incompleta
**Como** administrador, **quiero** que el botón "Publicar" esté bloqueado si faltan datos, **para** evitar publicar productos incompletos.
*(RF-05)*

- **Dado** que un producto no tiene foto procesada, costo o categoría
- **Cuando** intento publicarlo
- **Entonces** el sistema impide la acción y señala los campos faltantes

### US-06 — Marcar producto como agotado
**Como** proveedor, **quiero** marcar un artículo como agotado, **para** evitar que se venda algo que ya no tengo.
*(RF-06)*

- **Dado** que uno de mis productos se vendió físicamente en mi tienda
- **Cuando** lo marco como `Agotado` en mi portal
- **Entonces** desaparece del catálogo público en tiempo real

---

## Épica B — Motor de Precios

### US-07 — Sugerencia automática de precio
**Como** administrador, **quiero** que el sistema calcule el precio sugerido al ingresar el costo, **para** no tener que calcular márgenes manualmente.
*(RF-07, RF-08)*

- **Dado** que ingreso un costo de proveedor de $15,000 y una regla de margen del 35%
- **Cuando** el sistema procesa el dato
- **Entonces** muestra un Precio de Venta Sugerido de $20,250 y un Precio Suelo calculado según la regla configurada

### US-08 — Ajuste manual del precio final
**Como** administrador, **quiero** poder redondear el precio sugerido, **para** aplicar psicología de precios antes de publicar.
*(RF-09)*

- **Dado** un precio sugerido de $20,250
- **Cuando** lo edito manualmente a $19,990
- **Entonces** el sistema conserva ese valor como precio de publicación, sin alterar el Precio Suelo

---

## Épica C — CRM Omnicanal y Agente de IA

### US-09 — Bandeja unificada de mensajes
**Como** administrador, **quiero** ver en un solo lugar los mensajes de WhatsApp, Instagram y Messenger, **para** no saltar entre aplicaciones.
*(RF-11)*

### US-10 — Respuesta automática de disponibilidad
**Como** cliente, **quiero** recibir respuesta inmediata sobre disponibilidad de un mueble, **para** decidir sin esperar horas.
*(RF-14)*

- **Dado** que pregunto por un producto publicado
- **Cuando** el agente de IA procesa mi mensaje
- **Entonces** recibo una respuesta con disponibilidad real, consultada en tiempo real contra el inventario

### US-11 — Negociación automática dentro de límites
**Como** administrador, **quiero** que la IA pueda ofrecer descuentos hasta el Precio Suelo, **para** cerrar ventas sin mi intervención constante.
*(RF-16, RF-17)*

- **Dado** que un cliente pide un descuento
- **Cuando** el descuento solicitado está por encima del Precio Suelo
- **Entonces** la IA lo negocia automáticamente
- **Pero si** el cliente exige un precio por debajo del Precio Suelo
- **Entonces** la IA se detiene y transfiere la conversación al Administrador (handoff)

### US-12 — Sugerencias de venta cruzada
**Como** cliente, **quiero** recibir sugerencias de productos relacionados, **para** completar mi compra en una sola conversación.
*(RF-15)*

---

## Épica D — Enrutamiento Logístico

### US-13 — Enrutamiento por volumen
**Como** sistema, **quiero** enrutar automáticamente el pedido según cantidad de artículos, **para** dirigirlo al proveedor correcto sin decisión manual.
*(RF-19, RF-20)*

- **Dado** un pedido de 2 artículos
- **Cuando** se genera la solicitud de reserva
- **Entonces** se enruta a la tienda satélite del familiar correspondiente
- **Dado** un pedido de 20 artículos
- **Entonces** se enruta al proveedor principal/fábrica

### US-14 — Verificación de stock antes de cobrar
**Como** administrador, **quiero** que el sistema confirme existencia física antes de cobrar al cliente, **para** evitar vender algo que ya no está disponible.
*(RF-21)*

- **Dado** que un cliente confirma intención de compra
- **Cuando** el sistema envía el "ping" al proveedor
- **Entonces** el pedido permanece en estado `Validación de Inventario` hasta recibir respuesta
- **Y** el proveedor puede responder con un botón interactivo ("Confirmar Stock" / "Agotado") sin entrar al panel

---

## Épica E — Facturación Dinámica y Entrega

### US-15 — Elegir quién factura
**Como** administrador, **quiero** decidir por pedido si factura mi tienda o el proveedor, **para** adaptarme a cada acuerdo comercial.
*(RF-23, RF-24, RF-25)*

- **Dado** que apruebo un pedido
- **Cuando** selecciono "Facturación Delegada"
- **Entonces** el sistema envía automáticamente al proveedor los datos fiscales del cliente
- **Dado** que selecciono "Facturación Centralizada"
- **Entonces** el proveedor solo recibe una orden de despacho sin montos

### US-16 — Pago contra entrega con depósito de seguridad
**Como** administrador, **quiero** exigir un depósito antes de despachar en pedidos de pago contra entrega, **para** reducir el riesgo de rechazo en puerta.
*(RF-27, RF-28)*

- **Dado** que un pedido usa la modalidad "Cobro en Destino"
- **Cuando** se intenta generar la orden de despacho
- **Entonces** el sistema exige el pago de un depósito de seguridad antes de liberar la orden al proveedor

### US-17 — Validación de comprobante de transferencia
**Como** cliente, **quiero** poder subir mi comprobante de transferencia, **para** confirmar mi pago sin esperar validación manual inmediata.
*(RF-29)*

- **Dado** que subo una captura de mi transferencia
- **Cuando** el sistema la procesa con OCR
- **Entonces** extrae monto y referencia y las deja listas para la revisión humana final

---

## Épica F — Analítica y KPIs

### US-18 — Margen por proveedor
**Como** administrador, **quiero** ver el margen de contribución por proveedor, **para** saber cuál me genera más rentabilidad real.
*(RF-30)*

### US-19 — Tasa de agotamiento (stockout)
**Como** administrador, **quiero** ver cuántas veces un producto consultado ya no estaba disponible, **para** evaluar la confiabilidad de cada proveedor.
*(RF-31)*

---

## Casos de Uso Detallados (flujo extendido)

### UC-01 — Validación de Inventario antes de Cobro

| Campo | Detalle |
|---|---|
| **Actor principal** | Sistema (orquestado por el Backend) |
| **Actores secundarios** | Cliente, Proveedor, Administrador |
| **Precondición** | Producto en catálogo con estado `publicado`; cliente ha confirmado intención de compra |
| **Flujo principal** | 1. El sistema aplica Soft Lock sobre el producto.<br>2. Envía mensaje de verificación al WhatsApp del proveedor con botones interactivos.<br>3. El proveedor confirma disponibilidad.<br>4. El sistema envía al cliente el enlace de pago o solicitud de depósito.<br>5. El pedido pasa a `Pendiente de Pago`. |
| **Flujo alternativo — Sin respuesta del proveedor** | Si no hay respuesta dentro del tiempo del Soft Lock, el sistema libera el bloqueo y notifica al Administrador para seguimiento manual. |
| **Flujo alternativo — Producto agotado** | El proveedor responde "Agotado"; el sistema cancela la reserva, libera el Soft Lock y la IA sugiere alternativas al cliente. |
| **Postcondición** | El pedido queda en un estado consistente con el inventario real del proveedor. |

### UC-02 — Checkout con Pago Contra Entrega

| Campo | Detalle |
|---|---|
| **Actor principal** | Cliente |
| **Actores secundarios** | Administrador, Proveedor |
| **Precondición** | Pedido validado en inventario; modalidad de entrega = "Cobro en Destino" |
| **Flujo principal** | 1. El sistema solicita el depósito de seguridad.<br>2. El cliente paga el depósito.<br>3. El sistema genera la orden de despacho y libera los datos logísticos al proveedor.<br>4. El proveedor entrega el mueble y cobra el saldo.<br>5. El pedido pasa a `Entregado – Pendiente de Conciliación`.<br>6. El Administrador y el proveedor concilian el monto cobrado vs. margen. |
| **Flujo alternativo — Depósito no pagado** | El pedido permanece en `Pendiente de Pago` indefinidamente hasta que el cliente complete el depósito o cancele. |
| **Postcondición** | La liquidación queda registrada para el cuadre financiero entre plataforma y proveedor. |

### UC-03 — Ingesta y Publicación de Producto

| Campo | Detalle |
|---|---|
| **Actor principal** | Proveedor |
| **Actor secundario** | Administrador |
| **Precondición** | El proveedor tiene un número registrado o acceso al portal |
| **Flujo principal** | 1. El proveedor envía foto + precio por WhatsApp (o lo carga en el portal).<br>2. El sistema crea el registro en estado `Borrador`.<br>3. El Administrador procesa la imagen (remoción de fondo, recorte) y confirma el costo.<br>4. El sistema calcula precio sugerido y precio suelo.<br>5. El Administrador ajusta y publica.<br>6. El producto aparece en el catálogo activo. |
| **Flujo alternativo — Datos incompletos** | El sistema bloquea la publicación y señala los campos faltantes (checklist RF-05). |
| **Postcondición** | El producto está disponible para ser ofrecido por el Agente de IA y visible en catálogo. |

---

## Trazabilidad Historias ↔ Requerimientos

| Historia | Requerimiento(s) ERS |
|---|---|
| US-01 a US-06 | RF-01 a RF-06 |
| US-07, US-08 | RF-07 a RF-10 |
| US-09 a US-12 | RF-11 a RF-18 |
| US-13, US-14 | RF-19 a RF-22 |
| US-15 a US-17 | RF-23 a RF-29 |
| US-18, US-19 | RF-30 a RF-34 |
