# TCG Singles Picking System – Product Requirements Document

## 1. Overview

Build a **singles picking system** for a local game/hobby store to get
their singles program up and running. This system enables a local game
store (LGS) to:

- manage TCG singles inventory
- provide a modern customer-facing singles shopping experience
- allow customers to build and purchase orders
- enable staff to efficiently pick and fulfill orders

The system is designed as a standalone application with future integration into Shopify for checkout and payment processing.

---

## 2. Goals

### Customer Goals
- Quickly find cards (even with typos or formatting issues)
- Filter by set, condition, finish, and price
- Build a cart and place an order
- Receive a clear order confirmation

### Staff Goals
- Easily manage singles inventory
- View incoming orders
- Pick orders efficiently
- Handle exceptions (missing items, refunds)

### Business Goals
- Increase singles sales
- Reduce friction in finding cards
- Reduce fulfillment time
- Minimize inventory errors

---

## 3. Non-Goals (V1)

- No real-time Shopify integration
- No automatic pricing APIs (manual pricing only)
- No inventory reservation system
- No enforced physical picking path optimization
- No multi-location inventory

---

## 4. System Architecture

### High-Level Architecture

- **Frontend (Customer + Staff UI)**
  - Hosted separately (e.g., `singles.store.com`)
- **Backend**
  - Inventory
  - Orders
  - Picking workflow
- **Checkout Layer**
  - Mock checkout (V1)
  - Shopify integration (future)

---

## 5. Customer Experience

### Entry Point
- User clicks "Singles" from main Shopify site
- Redirects to `singles.store.com`

---

### Search

Search must support:
- case insensitivity
- missing commas
- partial matches
- fuzzy matching (typos)

Examples:
- "lightning bolt"
- "Lightning Bolt M11"
- "lightning bolt foil"

---

### Filters

- Game (MTG / Pokémon / etc)
- Set
- Condition (NM, LP, MP, HP)
- Finish (Foil / Non-Foil)
- Price range

---

### Card Listing

Each listing must show:
- card name
- set
- condition
- finish
- price
- quantity available

---

### Cart

- Users can add/remove items
- Users can adjust quantity
- Cart is owned entirely by the singles system

---

## 6. Checkout (V1)

### Mock Checkout Flow

When user clicks checkout:

1. validate cart
2. create internal order
3. mark order as PAID (simulated)
4. show confirmation screen

UI must clearly indicate:
> “Payment integration coming soon (Shopify)”

---

### Checkout (Future – Shopify)

- Cart will be translated into Shopify line items
- Shopify will handle payment
- Orders will be ingested via webhook

---

## 7. Inventory Model

### Inventory Item Definition

Each item is uniquely defined by:

- card_name
- set_code or set_name
- collector_number (optional but recommended)
- condition (NM / LP / MP / HP)
- finish (foil / non-foil)

These are NOT interchangeable.

---

### Fields

- id
- card_name
- normalized_card_name
- set_code
- collector_number
- condition
- finish
- price
- quantity_available

---

### Normalized Card Name

Used for search matching:
- lowercase
- punctuation removed
- commas ignored

Example:
"Lightning Bolt, M11" → "lightning bolt m11"

---

## 8. Pricing

- Pricing is manually set by staff
- No automatic pricing integration in V1
- Prices are captured at checkout (price snapshot)

---

## 9. Order System

### Required Fields

#### Order Level
- order_id
- customer_name (required)
- customer_email (required)
- customer_phone (optional)
- status
- created_at

#### Order Items
- card_name
- set_code
- condition
- finish
- quantity
- price_at_purchase

---

## 10. Order Statuses

### Core Status Flow

1. PAID  
2. PICKING  
3. PICKED  
4. COMPLETED  

---

### Exception Statuses

- ITEM_UNAVAILABLE
- PARTIAL_REFUND_REQUIRED

---

## 11. Inventory Behavior

### Key Rule

Inventory is only decremented when:
> order is created and marked as PAID

---

### No Reservation System

- Adding to cart does NOT reserve inventory
- First successful checkout wins

---

### Checkout Validation

Before order creation:
- verify quantity_available
- if insufficient → block checkout

---

### Post-Purchase Failure

If item cannot be picked:
- mark item as unavailable
- trigger refund process
- notify customer

---

## 12. Picking Workflow

### Order Queue

Staff sees:
- list of PAID orders
- sorted by creation time

---

### Picking Process

1. open order
2. view pick list
3. manually locate cards
4. mark each item as:
   - found
   - not found

---

### Important Constraint

> The system does NOT enforce physical pick order.

Employees determine optimal picking path.

---

## 13. Admin Portal

### Inventory Management

- add/edit inventory items
- update price
- update quantity

---

### Order Management

- view orders
- update status
- handle exceptions

---

## 14. Refund Handling

Refunds occur when:
- item cannot be found
- item is out of stock

Process:
- mark item unavailable
- calculate refund
- notify customer

---

## 15. Shopify Integration (Future)

### Responsibilities

Shopify will handle:
- checkout
- payment
- transaction record

Singles system will handle:
- inventory
- cart
- fulfillment

---

### Required Future Mapping

Each inventory item must map to:
- shopify_product_id
- shopify_variant_id

---

### Sync Layer (Future)

- system creates Shopify products/variants
- system updates pricing and availability

---

## 16. Technical Considerations

- system must support large inventories (thousands of singles)
- search must remain fast
- system must handle concurrent checkouts safely

---

## 17. Configuration

```ts
CHECKOUT_MODE = "mock" | "shopify"