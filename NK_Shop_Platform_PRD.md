# Product Requirements Document (PRD): New Kawaii Vault & Order Fulfillment Platform

**Date:** March 2026  
**Product Category:** E-commerce / Inventory Management / B2B Operations  
**Current Status:** V1 Interactive Prototype (Local React + Context Architecture)

---

## 1. Executive Summary

New Kawaii requires a specialized e-commerce and internal fulfillment platform capable of handling the extreme complexities of Trading Card Game (TCG) retail. Standard platforms like Shopify fail to account for the massive scale of unique variants (e.g., condition, foil finish, set codes across 50,000+ individual cards), highly volatile stock levels, manual in-store picking operations, and high-demand hype drops.

The **NK Vault Platform** serves a dual purpose:
1. **The Customer Storefront:** A premium, lightning-fast shopping experience split into "Singles" (standard browsing) and "Preorders" (live scarcity queues).
2. **The Internal Ops Engine:** A specialized dashboard that facilitates exact-match inventory tracking, order status progression, and a physical "Picking Matrix" for staff to locate cards in binders.

---

## 2. Platform Goals & Objectives

1. **Circumvent Shopify's Variant Limits:** Act as a Headless CMS cataloging thousands of individual TCG singles while eventually piping finalized, bundled mock-carts to Shopify strictly for payment processing.
2. **Eliminate "Overselling":** Enforce rigorous inventory checks at the moment of checkout, and utilize an automated Queue Engine for high-demand hype products so stock is allocated exactly 1:1.
3. **Digitize the Fulfillment Floor:** Replace paper pick-lists with a digital "Picking Queue" that allows staff to mark cards as "Found" or "Not Found" in real-time, instantly notifying management if a customer requires a partial refund due to a missing physical card.

---

## 3. User Roles & Access Control

The platform enforces strict Role-Based Access Control (RBAC) preventing unauthorized access to the business logic.

*   **Customer (Demo: Andrew)**
    *   Can browse, search, and filter the Singles catalog.
    *   Can add/remove items to the Cart and check out.
    *   Can join Live Preorder Queues and access Active Claim checkout flows.
*   **Staff / Picker (Demo: Levy)**
    *   Has full Customer capabilities.
    *   Has access to the **Picking Queue** mode (`/picking`).
    *   Can claim unfulfilled orders, generate pick-lists, and transition order statuses (e.g., PAID → PICKING → PICKED).
*   **Administrator (Demo: Paul)**
    *   Has full Staff and Customer capabilities.
    *   Has access to the **Admin Dashboard** (`/admin`).
    *   Can oversee all business metrics (Total Revenue, Pending vs Completed Orders).
    *   Can manually manage global Inventory (adjust single stock levels).
    *   Can author, edit, pause, and configure Preorder Events (limits, claim windows, stock).

---

## 4. Feature Specifications: The Customer Experience

### 4.1 The Singles Storefront (`/`)
*   **Fuzzy Search Engine**: Powered by `fuse.js`, allowing rapid locating of specific card names across sets.
*   **Advanced Filtering**: Users can drill down by Game (MTG, Pokémon), Card Condition (NM, LP, MP), and Finish (Standard, Foil).
*   **Real-time Cart Validation**: The Cart Drawer constantly validates line items against global inventory. The `+` quantity toggle disables dynamically if the user hits the maximum available physical stock.

### 4.2 The Preorder / Hype Drop Flow (`/preorders`)
A strict, queue-based funnel designed to prevent botting and server crashes during highly coveted TCG sealed product releases.
*   **The Hub**: Distinctly separated from the Singles shop.
*   **The Live Queue Engine**: Users joining a Live Drop are assigned a position. The client maintains an active heartbeat session. If the user closes the tab, they forfeit their spot. 
*   **The Active Claim Window**: Once promoted to the front of the line, the UI morphs into a strict countdown timer (e.g., 5:00).
*   **Bypassed Checkout**: Preorder checkouts sidestep the generic shopping cart, forcing the user to complete their single-item transaction before the timer expires. Failure to do so immediately promotes the next user.

### 4.3 Checkout Verification (`/checkout`)
*   To prevent the "Ghost Inventory" race condition (User A and User B fighting for the last card), the system performs a final atomic stock check the exact millisecond the "Place Order" button is clicked.

---

## 5. Feature Specifications: Internal Operations

### 5.1 The Picking Workflow (`/picking`)
A specialized UI designed to run on a tablet or mobile device while a staff member works the physical store binders.
*   **Queue Claiming**: Staff view a global list of `PAID` orders and "Claim" them, locking the order to their user profile and changing the status to `PICKING`.
*   **The Pick List**: Staff are presented with a checklist of cards required for the order. They physically locate the card and mark it **"Found"**.
*   **The Exception Path ("Not Found")**: If the physical card cannot be located (e.g., lost or stolen), staff mark it as **"Not Found"**. This automatically overrides the entire order status to `ITEM_UNAVAILABLE`.
*   **Order Completion**: If all items are found, the order transitions to `COMPLETED` and is closed.

### 5.2 The Admin CMS (`/admin`)
The business management suite for store owners.
*   **Inventory Database**: A master data table providing total CRUD (Create, Read, Update, Delete) over the 50,000+ singles catalog. Admin can force stock changes manually.
*   **Preorders Command Center**: A complex edit modal utilizing native HTML5 Date pickers (`datetime-local`) to schedule drops in the future. Admins can view real-time metrics showing exactly how many users are actively waiting or claiming a hype drop, and can hit a "Panic Pause" button to immediately halt queue advancement.
*   **Order Management**: Admins can view all historical orders. Crucially, they use this panel to track down `ITEM_UNAVAILABLE` orders stemming from the Picking workflow in order to process final Partial Refunds through Shopify before dismissing the order.

---

## 6. Technical Architecture & Constraints

### 6.1 Current Prototype Scope (React + Vite)
*   **State**: Global contexts (`AuthContext`, `CartContext`, `InventoryContext`, `OrderContext`, `PreorderContext`, `QueueContext`) manage all application logic.
*   **Persistence**: Handled entirely through `localStorage` wrappers (`dataStore.js`), allowing full feature testing across browser refreshes and multiple profiles without a persistent backend.
*   **Design**: Custom SCSS/CSS leveraging modern standards. No UI libraries (e.g., Bootstrap/Tailwind) were used, ensuring total control over the "New Kawaii" brand aesthetics.

### 6.2 Future Production Dependencies
To convert this prototype to a fully live application, the following system integrations are required:
1.  **Shopify Storefront API**: Routing the simulated `createOrder` JSON payload into a Shopify Draft Order, generating a Web URL that the customer clicks to actually pay via credit card.
2.  **Card API Integration**: Connecting to the Scryfall API (Magic) or Pokémon TCG API to dynamically hydrate the current "Gradient Placeholder" tiles with high-resolution imagery.
3.  **Authentication (SSO)**: Hooking the simulated `AuthGate` into Shopify Customer Accounts so users don't have to create separate logins for the Singles platform vs the main retail site.
4.  **Backend Database / Redis**: The `QueueContext` heartbeat logic requires porting to a genuine WebSocket or Polling backend (Node.js + Redis) to enforce queue sorting across thousands of concurrent geographical clients securely.
