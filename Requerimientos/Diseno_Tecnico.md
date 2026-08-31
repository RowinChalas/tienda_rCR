# Documento de Diseño Técnico
### Hub de Retail "Just-in-Time" y CRM Omnicanal para Venta de Mobiliario
**Versión 1.0 — Complementa el Documento de Especificación de Requerimientos (ERS)**

---

## 1. Arquitectura General

```mermaid
flowchart LR
    subgraph Canales["Canales del Cliente"]
        WA[WhatsApp Business]
        IG[Instagram Direct]
        MS[Messenger]
    end

    subgraph Meta["Meta Graph API"]
        WH[Webhooks]
    end

    subgraph Backend[".NET 8+ API REST (OCI)"]
        WHC[Webhook Controller]
        AI[Servicio de Orquestación IA]
        PR[Pricing Engine]
        RT[Motor de Enrutamiento]
        SR[SignalR Hub]
    end

    subgraph DB["Supabase (PostgreSQL + RLS/JWT)"]
        T1[(Products)]
        T2[(Suppliers)]
        T3[(Orders)]
        T4[(Customers)]
        T5[(Supplier_Costs)]
    end

    subgraph FE["React SPA (Panel Admin / Portal Proveedor)"]
        UIA[Panel Administrador]
        UIP[Portal Proveedor]
    end

    LLM[LLM: OpenAI / Gemini API]

    WA & IG & MS --> WH --> WHC
    WHC --> AI --> LLM
    AI --> RT --> DB
    PR --> DB
    Backend <--> DB
    SR <--> UIA
    SR <--> UIP
    UIA <--> Backend
    UIP <--> Backend
```

**Notas de arquitectura:**
- El backend es el único componente con permisos de escritura sensibles; el frontend consume exclusivamente la API REST y el canal SignalR.
- Supabase actúa como fuente de verdad y como capa de autorización (RLS), reduciendo lógica de permisos duplicada en el backend.
- El LLM nunca accede directamente a la base de datos: siempre recibe contexto ya consultado y filtrado por el backend (evita fugas de `Supplier_Costs`).

---

## 2. Modelo de Datos

### 2.1 Diagrama Entidad-Relación

```mermaid
erDiagram
    SUPPLIER ||--o{ PRODUCT : "provee"
    SUPPLIER ||--o{ SUPPLIER_CONTACT : "tiene"
    SUPPLIER ||--o{ ORDER : "despacha"
    CUSTOMER ||--o{ ORDER : "realiza"
    PRODUCT ||--o{ ORDER_ITEM : "incluido en"
    ORDER ||--o{ ORDER_ITEM : "contiene"
    PRODUCT ||--|| SUPPLIER_COST : "tiene costo oculto"
    PRODUCT }o--o{ PRODUCT : "producto relacionado (cross-sell)"
    ORDER ||--o{ ORDER_STATE_LOG : "registra"
    ADMIN_USER ||--o{ PRICING_RULE : "configura"

    SUPPLIER {
        uuid id PK
        string business_name
        string contact_whatsapp
        int level "1=Principal, 2=Satelite"
        int min_volume
        int max_volume
        string geo_zone
    }

    PRODUCT {
        uuid id PK
        uuid supplier_id FK
        string name
        string category
        string status "borrador|revision|publicado|agotado"
        decimal suggested_price
        decimal floor_price
        jsonb dimensions
        jsonb images
    }

    SUPPLIER_COST {
        uuid product_id PK,FK
        decimal base_cost
        timestamptz updated_at
    }

    CUSTOMER {
        uuid id PK
        string phone
        string name
        string channel_origin
        decimal ltv
        timestamptz created_at
    }

    ORDER {
        uuid id PK
        uuid customer_id FK
        uuid supplier_id FK
        string state
        string billing_mode "centralizada|delegada"
        string delivery_mode "contacto_directo|cobro_destino"
        boolean deposit_required
        boolean deposit_paid
        timestamptz soft_lock_expires_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price_final
    }

    ORDER_STATE_LOG {
        uuid id PK
        uuid order_id FK
        string previous_state
        string new_state
        string triggered_by "sistema|ia|admin|proveedor"
        timestamptz created_at
    }

    PRICING_RULE {
        uuid id PK
        string scope "categoria|proveedor|global"
        string scope_ref
        decimal markup_pct
        decimal floor_pct
    }
```

### 2.2 Notas sobre seguridad a nivel de fila (RLS)

| Tabla | Regla RLS (resumen) |
|---|---|
| `products` | Lectura pública solo si `status = 'publicado'`. Escritura restringida al rol `admin`. |
| `supplier_cost` | Sin acceso para roles `supplier` y `customer`. Solo `admin`. |
| `orders` | Rol `supplier` solo lee filas donde `supplier_id = auth.uid()` mapeado. Rol `admin` ve todo. |
| `order_state_log` | Igual que `orders`; heredado por `order_id`. |
| `customers` | Visible solo para `admin`; `supplier` nunca ve datos de contacto del cliente salvo que la orden esté en modalidad "Contacto Directo" (se libera vía función segura, no acceso directo a la tabla). |

Ejemplo de política (pseudo-SQL, Supabase):

```sql
create policy "supplier_reads_own_orders"
on orders for select
using ( supplier_id = (auth.jwt() ->> 'supplier_id')::uuid );

create policy "only_admin_reads_costs"
on supplier_cost for select
using ( (auth.jwt() ->> 'role') = 'admin' );
```

---

## 3. Especificación de Endpoints API (REST — .NET 8)

Prefijo base: `/api/v1`

### 3.1 Catálogo

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/products` | Lista productos publicados (filtros: categoría, proveedor). | Público |
| GET | `/products/{id}` | Detalle de un producto. | Público |
| POST | `/products/draft` | Crea un pre-producto en estado `borrador` (usado por ingesta WhatsApp o portal proveedor). | Sistema / Proveedor |
| PATCH | `/products/{id}` | Edita datos del borrador (precio, dimensiones, categoría). | Admin |
| POST | `/products/{id}/process-image` | Remueve fondo / recorta / aplica marca de agua. | Admin |
| POST | `/products/{id}/publish` | Publica el producto (valida checklist RF-05). | Admin |
| PATCH | `/products/{id}/status` | Marca producto como `agotado`. | Admin / Proveedor (solo propios) |

### 3.2 Precios

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/pricing/calculate` | Dado `base_cost` + regla aplicable, retorna `suggested_price` y `floor_price`. | Admin |
| GET | `/pricing/rules` | Lista reglas de margen configuradas. | Admin |
| POST | `/pricing/rules` | Crea/edita regla de margen (por categoría/proveedor/global). | Admin |

### 3.3 Proveedores

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/suppliers` | Lista proveedores con nivel y capacidad. | Admin |
| POST | `/suppliers` | Registra un nuevo proveedor y su contacto WhatsApp. | Admin |
| GET | `/suppliers/{id}/orders` | Órdenes delegadas al proveedor (filtradas por RLS). | Proveedor / Admin |
| GET | `/suppliers/{id}/settlements` | Historial de conciliaciones/liquidaciones. | Proveedor / Admin |

### 3.4 Órdenes

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/orders` | Crea una orden en estado `Consulta` o `Intención de Compra`. | Sistema (IA) / Admin |
| GET | `/orders/{id}` | Detalle de la orden y su historial de estados. | Admin / Proveedor (propia) |
| PATCH | `/orders/{id}/state` | Transiciona el estado (ver máquina de estados, ERS §5). | Sistema / Admin |
| POST | `/orders/{id}/verify-stock` | Dispara el "ping" de verificación al WhatsApp del proveedor. | Sistema |
| POST | `/orders/{id}/confirm-stock` | Callback del botón interactivo de Meta ("Confirmar" / "Agotado"). | Webhook Meta |
| POST | `/orders/{id}/deposit` | Registra pago de depósito de seguridad. | Sistema (gateway) |
| PATCH | `/orders/{id}/billing-mode` | Alterna facturación centralizada/delegada. | Admin |
| POST | `/orders/{id}/reconcile` | Cierra la conciliación proveedor-admin. | Admin |

### 3.5 CRM / Chats

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/conversations` | Bandeja unificada (WhatsApp, IG, Messenger). | Admin |
| GET | `/conversations/{id}/messages` | Historial del hilo. | Admin |
| POST | `/conversations/{id}/handoff` | Fuerza el paso de IA a humano. | Admin / Sistema |
| POST | `/conversations/{id}/quote` | Genera cotización (enlace de pago / PDF). | Admin |

### 3.6 Webhooks (Meta)

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/webhooks/meta` | Verificación inicial (`hub.challenge`). |
| POST | `/webhooks/meta` | Recepción de mensajes/eventos en tiempo real. Debe responder `200 OK` en &lt;3s (RNF-03). |

### 3.7 Analítica

| Método | Endpoint | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/analytics/kpis` | Margen por proveedor, stockout rate, conversión, ticket promedio. | Admin |
| GET | `/analytics/cohorts` | Análisis de recompra por cohortes. | Admin |

---

## 4. Diagramas de Secuencia

### 4.1 Flujo del Agente de IA ante una consulta de cliente

```mermaid
sequenceDiagram
    participant C as Cliente (WhatsApp)
    participant M as Meta Graph API
    participant B as Backend (.NET)
    participant DB as Supabase
    participant IA as LLM

    C->>M: "¿Tienen el comedor de 6 sillas?"
    M->>B: POST /webhooks/meta
    B-->>M: 200 OK (< 3s)
    B->>DB: Buscar cliente por teléfono
    DB-->>B: Historial / nuevo cliente
    B->>DB: Buscar producto en catálogo activo
    DB-->>B: Stock, precio venta, precio suelo
    B->>IA: Contexto + instrucción de venta
    IA-->>B: JSON {accion: "responder"|"escalar", texto}
    alt accion = responder
        B->>M: Enviar respuesta al cliente
        M->>C: "Sí, tenemos 2 disponibles en caoba..."
    else accion = escalar
        B->>M: Mensaje de espera al cliente
        B->>DB: Registrar handoff
        B-->>Admin: Alerta vía SignalR
    end
```

### 4.2 Flujo de validación de stock y checkout

```mermaid
sequenceDiagram
    participant C as Cliente
    participant B as Backend
    participant DB as Supabase
    participant P as Proveedor (WhatsApp)

    C->>B: Confirma intención de compra
    B->>DB: Aplicar Soft Lock (15-30 min) en Product
    B->>P: Ping de verificación (botones interactivos)
    P-->>B: "Confirmar Stock" / "Agotado"
    alt Confirmado
        B->>C: Enlace de pago / solicitud de depósito
        C->>B: Pago procesado
        B->>DB: state = "Orden de Despacho"
        B->>P: Datos logísticos (según billing_mode)
    else Agotado
        B->>DB: state = "Cancelado/Agotado"
        B->>C: Sugerencias de productos similares
    end
```

---

## 5. Consideraciones de Despliegue

- **Backend:** VM en Oracle Cloud Infrastructure (OCI), puerto expuesto para webhooks de Meta con certificado TLS válido (requisito de Meta Graph API).
- **Base de datos:** Instancia gestionada de Supabase; habilitar backups automáticos y `point-in-time recovery`.
- **Frontend:** Build estático de React servido vía CDN o el mismo OCI; conexión a Supabase Realtime / SignalR para actualizaciones en vivo.
- **Secretos:** Tokens de verificación de Meta, claves de LLM y credenciales de Supabase gestionados vía variables de entorno / vault, nunca en el repositorio.
- **Observabilidad mínima recomendada:** logging estructurado de cada transición de estado de orden y de cada decisión del agente IA (trazabilidad, RNF-05).
