import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, setCart, clearCart as clearCartStorage } from '../data/dataStore.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCartState] = useState({ userId: null, items: [], updated_at: null });

  // Load cart when user changes
  useEffect(() => {
    if (user?.userId) {
      const stored = getCart(user.userId);
      setCartState(stored);
    } else {
      setCartState({ userId: null, items: [], updated_at: null });
    }
  }, [user?.userId]);

  const persist = useCallback((newCart) => {
    if (!user?.userId) return;
    const updated = { ...newCart, userId: user.userId };
    setCartState(updated);
    setCart(user.userId, updated);
  }, [user?.userId]);

  const addToCart = useCallback((inventoryItem, quantity = 1) => {
    const existing = cart.items.find((i) => i.inventory_id === inventoryItem.id);
    let newItems;
    if (existing) {
      newItems = cart.items.map((i) =>
        i.inventory_id === inventoryItem.id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    } else {
      newItems = [
        ...cart.items,
        {
          inventory_id: inventoryItem.id,
          card_name: inventoryItem.card_name,
          game: inventoryItem.game,
          set_code: inventoryItem.set_code,
          condition: inventoryItem.condition,
          finish: inventoryItem.finish,
          quantity,
          price: inventoryItem.price,
        },
      ];
    }
    persist({ ...cart, items: newItems });
  }, [cart, persist]);

  const removeFromCart = useCallback((inventoryId) => {
    const newItems = cart.items.filter((i) => i.inventory_id !== inventoryId);
    persist({ ...cart, items: newItems });
  }, [cart, persist]);

  const updateQuantity = useCallback((inventoryId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(inventoryId);
      return;
    }
    const newItems = cart.items.map((i) =>
      i.inventory_id === inventoryId ? { ...i, quantity } : i
    );
    persist({ ...cart, items: newItems });
  }, [cart, persist, removeFromCart]);

  const clearCart = useCallback(() => {
    if (!user?.userId) return;
    const empty = { userId: user.userId, items: [], updated_at: null };
    setCartState(empty);
    clearCartStorage(user.userId);
  }, [user?.userId]);

  const cartTotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
