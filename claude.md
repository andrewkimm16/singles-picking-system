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

# 21. Preorders System

## 21.1 Overview

The platform must support a dedicated **Preorders system** separate from the Singles storefront.

Preorders are not standard browse-and-buy listings. They are **limited-stock, queue-based events** designed to handle high-demand product drops (e.g., sealed product, limited releases).

Unlike Singles, where users can immediately add items to cart, Preorders require users to:
- join a live queue
- wait for their turn
- receive a timed claim window
- proceed to checkout if eligible

Preorders are designed to provide a fair and controlled purchasing experience while preventing overselling and abuse.

---

## 21.2 User Experience

### Entry

Users access Preorders via the main navigation:

- Shop
  - Singles
  - Preorders

---

### Preorders Landing Page

The Preorders page must display events grouped by status:

- Live Now
- Upcoming
- Sold Out / Closed

Each preorder card should display:
- title
- image
- release/start time
- stock status
- CTA:
  - Join Queue (if live)
  - View Details (if upcoming)
  - Sold Out (if unavailable)

---

### Preorder Detail Page

Each preorder must have a dedicated page showing:

- product details
- preorder rules
- max quantity per user
- queue instructions
- preorder status

If the preorder is live:
- display **Join Queue** button

---

### Queue Experience

When a user joins a queue:

- a queue modal or persistent panel is displayed
- the user remains on the preorder page
- the modal displays:
  - queue position
  - queue status
  - instructions
  - optional estimated wait time

Users must keep the preorder page open to maintain their place in queue.

Users may:
- switch tabs
- browse elsewhere

But must keep the queue session active in the browser.

---

## 21.3 Queue Mechanics

### Queue Entry Rules

- users must be logged in to join a queue
- each user may only have one active queue entry per preorder
- queue position is assigned based on join timestamp

---

### Queue Advancement

- queue progression must be automatic
- users should not be required to manually confirm their turn
- backend logic is responsible for:
  - advancing the queue
  - handling expired users
  - promoting the next eligible user

---

### Presence Requirement

Queue participation requires an active session.

- frontend must send periodic heartbeat signals
- backend tracks user presence
- if heartbeat is lost beyond a grace period:
  - user may lose queue eligibility

---

### Session Recovery

- if a user refreshes the page and their session is still valid:
  - queue state should be restored automatically

---

## 21.4 Claim Flow

### Active Claim State

When a user reaches the front of the queue:

- their state changes from `Waiting` to `Active Claim`
- the UI must automatically transition into claim mode
- a modal or overlay must display:
  - countdown timer
  - claim instructions
  - checkout CTA

Users should not need to manually accept their turn.

---

### Claim Window

- each preorder defines a fixed claim window (e.g., 5 minutes)
- countdown timer must be visible
- if the timer expires:
  - user forfeits their turn
  - queue advances automatically

---

### Claim Action

When in Active Claim:

- user can proceed to checkout
- user may select quantity (if allowed)
- quantity must respect:
  - preorder stock
  - max per user

---

## 21.5 Checkout Integration

Preorders must use the same checkout architecture as Singles.

### Shared Checkout Model

- application prepares order
- user is routed to checkout
- Shopify handles payment (future state)

---

### Current Implementation (Prototype)

- checkout is mocked
- system simulates:
  - successful payment
  - order creation
- UI must indicate:
  - “Shopify checkout integration coming soon”

---

### Eligibility Validation

Before allowing checkout, system must verify:

- user is in `Active Claim` state
- claim timer has not expired
- preorder stock is still available

If validation fails:
- block checkout
- show clear error message

---

## 21.6 Inventory Rules

### Core Rule

Preorder queues do **NOT** reserve inventory.

Inventory is only decremented when checkout is successfully completed.

---

### Implications

- joining queue does not affect stock
- reaching front of queue does not affect stock
- entering claim window does not affect stock
- only successful checkout decrements stock

---

### Stock Exhaustion During Checkout

If stock runs out while a user is in checkout:

- checkout must fail
- user must see a clear error message
- queue entry should be updated accordingly

---

## 21.7 Admin Controls

Staff/admin must be able to:

### Preorder Management
- create preorder events
- edit event details
- set total stock
- set max quantity per user
- set claim window duration

---

### Queue Control
- view queue length
- view current active user
- pause queue
- resume queue
- manually advance queue (optional override)
- remove users from queue

---

### Inventory Control
- adjust stock
- mark preorder as sold out
- close preorder event

---

### Monitoring

Admin must be able to:
- track queue progression
- monitor stock consumption
- identify oversell situations

---

## 21.8 Status Definitions

### Preorder Event Status
- Upcoming
- Live
- Sold Out
- Closed
- Paused
- Cancelled

---

### Queue Entry Status
- Waiting
- Active Claim
- Checked Out
- Expired
- Failed Checkout
- Sold Out
- Removed

---

## 21.9 Edge Cases

### User Leaves Page
- heartbeat stops
- after grace period, queue entry may expire

---

### User Refreshes Page
- if session is still valid:
  - restore queue state

---

### Multiple Tabs
- only one active queue entry per user per preorder
- additional tabs should reuse or restore existing session

---

### Stock Runs Out Mid-Queue
- remaining users transition to:
  - Sold Out or Unfulfilled

---

### Oversell Scenario
- staff must be able to:
  - adjust stock
  - cancel affected orders
  - issue refunds

---

## 21.10 Design Principles

- Preorders must feel like a **live drop experience**
- user interaction should be minimal and automatic
- system must prioritize fairness and clarity
- checkout experience must remain consistent with Singles