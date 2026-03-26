import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getOrders, setOrders } from '../data/dataStore.js';
import { generateOrderId } from '../utils/formatters.js';
import { ORDER_STATUSES, PICK_STATUSES, STATUS_TRANSITIONS } from '../utils/constants.js';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrdersState] = useState([]);

  useEffect(() => {
    setOrdersState(getOrders());
  }, []);

  const persist = useCallback((newOrders) => {
    setOrdersState(newOrders);
    setOrders(newOrders);
  }, []);

  const createOrder = useCallback((userId, customerName, customerEmail, customerPhone, cartItems) => {
    const order = {
      order_id: generateOrderId(orders),
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      status: ORDER_STATUSES.PAID,
      items: cartItems.map((item) => ({
        inventory_id: item.inventory_id,
        card_name: item.card_name,
        game: item.game,
        set_code: item.set_code,
        condition: item.condition,
        finish: item.finish,
        quantity: item.quantity,
        price_at_purchase: item.price,
        pick_status: PICK_STATUSES.PENDING,
      })),
      subtotal: cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [...orders, order];
    persist(updated);
    return order;
  }, [orders, persist]);

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    const updated = orders.map((order) => {
      if (order.order_id !== orderId) return order;
      // Validate transition
      const validNext = STATUS_TRANSITIONS[order.status] || [];
      if (!validNext.includes(newStatus)) {
        console.warn(`Invalid transition: ${order.status} → ${newStatus}`);
        return order;
      }
      return { ...order, status: newStatus, updated_at: new Date().toISOString() };
    });
    persist(updated);
  }, [orders, persist]);

  const updatePickStatus = useCallback((orderId, inventoryId, pickStatus) => {
    const updated = orders.map((order) => {
      if (order.order_id !== orderId) return order;
      const newItems = order.items.map((item) =>
        item.inventory_id === inventoryId
          ? { ...item, pick_status: pickStatus }
          : item
      );
      return { ...order, items: newItems, updated_at: new Date().toISOString() };
    });
    persist(updated);
  }, [orders, persist]);

  const getOrderById = useCallback((orderId) => {
    return orders.find((o) => o.order_id === orderId) || null;
  }, [orders]);

  const getOrdersByStatus = useCallback((status) => {
    return orders.filter((o) => o.status === status);
  }, [orders]);

  const getOrdersByUser = useCallback((userId) => {
    return orders.filter((o) => o.user_id === userId);
  }, [orders]);

  return (
    <OrderContext.Provider value={{
      orders,
      createOrder,
      updateOrderStatus,
      updatePickStatus,
      getOrderById,
      getOrdersByStatus,
      getOrdersByUser,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
