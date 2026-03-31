# New Kawaii: Singles & Preorders Platform
**Status:** Functioning prototype, deployed on Vercel | Built for a real local game store in Westchester County, New York

**Live Demo:** [singles-picking-system.vercel.app](https://singles-picking-system.vercel.app/login)

> Three demo accounts available. See Usage section below.

---

## The Problem

Trading card game retail is operationally unlike any other retail category. A single store carries 50,000+ individual card variants, each uniquely defined by card name, set code, condition, and finish. Standard platforms like Shopify break at this scale. Their variant architecture has hard limits, overselling is a constant risk, and high-demand product releases create race conditions that no off-the-shelf solution handles correctly.

The less visible but equally painful problem is inventory integrity. TCG singles inventory is uniquely fragile. Cards get pulled from binders, misfiled, stolen, added through buylist trades, and adjusted mid-operation. Any gap between physical reality and software state creates customer-facing failures: oversells, unfulfillable orders, and eroded trust. For the store owner, maintaining a 1:1 relationship between what the software says is in stock and what is actually in the binder was the biggest operational pain point, more than the storefront itself.

New Kawaii, a local game store in Westchester County, New York, needed a purpose-built platform to:

- Handle a massive singles catalog that Shopify's variant model can't support
- Give customers a fast, friction-free way to find and buy specific cards
- Enforce real inventory integrity through the full order lifecycle, not just at checkout
- Give staff a digital picking workflow to replace paper pick-lists
- Handle high-demand preorder drops fairly: no bots, no overselling, no manual chaos

I designed and built this platform as a functioning prototype for the store owner, who has approved its use as a portfolio artifact.

---

## What It Does

The platform serves two audiences simultaneously.

**For customers:** A fast, searchable singles storefront with fuzzy search and advanced filtering. A preorders hub for high-demand releases with a real-time queue engine, heartbeat session tracking, and a timed claim window at the front of the line.

**For the store:** A staff-facing picking interface designed for tablet use on the floor. A full admin CMS for inventory management, preorder configuration, and order oversight.

---

## Architecture

```
[Customer Storefront]          [Staff / Admin Portal]
   /                              /picking
   /preorders                     /admin
        │                              │
        ▼                              ▼
[React Context Layer]
  AuthContext      : Role-based access control (Customer / Staff / Admin)
  InventoryContext : Single source of truth for all card stock
  CartContext      : Real-time cart validation against live inventory
  OrderContext     : Order lifecycle management
  PreorderContext  : Drop configuration and status
  QueueContext     : Queue position, heartbeat, claim window logic
        │
        ▼
[localStorage Persistence Layer]
  dataStore.js : Simulates backend persistence across browser sessions
  Enables full multi-role testing without a live database
```

---

## Key Product Decisions

**Why fuzzy search?**
Card names are inconsistently formatted across sets and editions. Customers search "lightning bolt m11" or "bolt foil" and exact match fails them constantly. fuse.js gives tolerant, fast search that meets customers where they are.

**Why three distinct user roles?**
Customer, Staff/Picker, and Admin have fundamentally different jobs and need fundamentally different interfaces. A picker working the floor shouldn't see revenue dashboards. RBAC enforces this cleanly without building separate applications.

**Why no inventory reservation on cart-add?**
Reserving at cart-add would allow users to tie up stock indefinitely. Inventory decrements only on successful checkout. Cart adds are optimistic; checkouts are definitive. The claim window in preorders creates urgency without artificial reservation mechanics.

**Why an atomic stock check at checkout?**
The Ghost Inventory race condition (two users fighting for the last card) is a real problem in high-traffic scenarios. A final verification at the exact moment of order creation eliminates this. The cart is a suggestion; checkout is the source of truth.

**Why localStorage for V1?**
The goal of V1 was to validate the full product experience across all user flows and edge cases before committing to backend infrastructure. localStorage enables complete prototype testing across browser sessions and user profiles without operational overhead. The production backend is a defined next phase, not an afterthought.

---

## Features

### Customer Experience
- Fuzzy search across 50,000+ card variants via fuse.js
- Filter by game (MTG, Pokémon), condition (NM/LP/MP/HP), and finish (foil/non-foil)
- Real-time cart validation. Quantity controls disable dynamically when stock is exhausted
- Preorders hub with live, upcoming, and closed drop states

### Preorders: Fair-Access Queue Engine
How do you distribute limited inventory fairly when demand outstrips supply? That's the core problem this feature solves, the same challenge that powers fair-access ticketing for live events at scale.

- Users join a live drop and are assigned a position by join time
- The client maintains an active heartbeat. Closing the tab forfeits the spot, preventing queue squatting
- Queue advancement is automatic, no user action required to move forward
- At the front of the line, the UI transitions to an Active Claim state with a configurable countdown timer
- Checkout must complete within the claim window or the position expires and the next user is promoted
- A final atomic stock check at order creation prevents overselling even under concurrent checkout pressure

Admins control the full drop lifecycle: scheduling drops, setting claim windows and per-user limits, monitoring real-time queue depth, and using a Panic Pause to immediately halt queue advancement.

The production version of this feature requires a WebSocket or polling backend with Redis for queue state management to handle concurrent users at scale.

### Staff Picking Workflow
The picking interface is the bridge between software inventory and physical reality, and the feature the store owner cares about most.

- Global order queue sorted by creation time
- Order claiming locks an order to a picker's profile, preventing double-picking
- Card-by-card pick checklist designed for tablet use on the store floor
- Every card must be explicitly confirmed as Found before an order closes
- The "Not Found" exception path immediately flags the discrepancy, blocks order completion, and escalates to admin. This creates an audit trail that surfaces inventory gaps rather than letting them compound silently
- Every order functions as an inventory verification event, not just a fulfillment task

### Admin CMS
- Full CRUD over the singles catalog
- Preorder configuration: stock, max per user, claim window, scheduled start time
- Real-time queue monitoring: waiting, claiming, and checked-out counts per drop
- Panic Pause: immediately halts queue advancement for any active drop
- Order management: tracks ITEM_UNAVAILABLE orders through to refund resolution
- Manual inventory adjustment outside of the standard order flow

---

## Usage

Three demo accounts cover the full platform:

| Role | Username | Access |
|---|---|---|
| Customer | Andrew | Browse singles, build cart, join preorder queues |
| Staff/Picker | Paul | Everything above + claim and fulfill orders |
| Admin | Levy | Everything above + manage inventory, configure drops, oversee orders |

---

## Production Roadmap

**Backend: Supabase**
Replace localStorage with a persistent database. Inventory, orders, and user accounts become real server-side state.

**Queue Backend: Node.js + Redis**
The heartbeat queue requires a WebSocket or polling backend to manage concurrent users across geographies. Redis handles queue state with the speed and atomicity the mechanic requires.

**Shopify Integration**
The simulated createOrder payload maps to a Shopify Draft Order, generating a checkout URL for payment. Shopify handles payments; this platform handles everything else.

**Card API Integration**
Connect to Scryfall (Magic) and Pokémon TCG API to replace placeholder tiles with high-resolution imagery and canonical card metadata.

**Authentication**
Hook the simulated AuthGate into Shopify Customer Accounts for unified login across the main retail site and the singles storefront.

**Buylist**
A reverse commerce surface where the store publishes cards they are actively looking to buy, with prices they are willing to pay. Customers submit cards for sale, and the store manages incoming offers through the admin CMS. Buylist purchases feed directly back into inventory stock, closing the full loop between outbound singles sales and inbound card acquisition.

---

## What I Learned

Building this end-to-end, making every product decision myself and using AI as a build accelerator, taught me things that writing specs alone never would have.

The hardest problem wasn't the queue or the checkout validation. It was inventory state management across concurrent user roles. When a picker marks a card as "Not Found" mid-pick, that state has to propagate immediately to the admin dashboard, to the customer's order history, and to the inventory count. All from a single user action. Getting those context dependencies right required thinking through every state transition before touching code.

It also clarified where AI-assisted development breaks down. The AI could generate component code quickly. It couldn't make product decisions. Every time the code diverged from the intended user experience, the fix required going back to the product logic, not the code, to figure out what was actually supposed to happen.

---

## Context

New Kawaii is a real local game store in Westchester County, New York. This platform was designed and built with the store owner's involvement and has been approved for portfolio use. It is a functioning prototype. All core user flows are operational, with production backend integration as the defined next phase.

---

*Built by Andrew Kim | Technical Product Manager*
*andrewkimm16@gmail.com | [LinkedIn](https://linkedin.com/in/yourprofile) | [GitHub](https://github.com/andrewkimm16)*