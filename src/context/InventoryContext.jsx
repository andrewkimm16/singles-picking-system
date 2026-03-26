import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getInventory, setInventory, isSeeded, markSeeded } from '../data/dataStore.js';
import { seedInventory } from '../data/seedInventory.js';
import { normalizeCardName } from '../utils/normalize.js';
import { generateId } from '../utils/formatters.js';

const InventoryContext = createContext(null);

export function InventoryProvider({ children }) {
  const [items, setItems] = useState([]);

  // Initialize: seed on first load, then load from storage
  useEffect(() => {
    if (!isSeeded()) {
      setInventory(seedInventory);
      markSeeded();
      setItems(seedInventory);
    } else {
      setItems(getInventory());
    }
  }, []);

  // Persist to localStorage on change
  const persist = useCallback((newItems) => {
    setItems(newItems);
    setInventory(newItems);
  }, []);

  const addItem = useCallback((itemData) => {
    const newItem = {
      id: generateId(),
      ...itemData,
      normalized_card_name: normalizeCardName(itemData.card_name),
      created_at: new Date().toISOString(),
    };
    const updated = [...items, newItem];
    persist(updated);
    return newItem;
  }, [items, persist]);

  const updateItem = useCallback((id, updates) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      const merged = { ...item, ...updates };
      if (updates.card_name) {
        merged.normalized_card_name = normalizeCardName(updates.card_name);
      }
      return merged;
    });
    persist(updated);
  }, [items, persist]);

  const deleteItem = useCallback((id) => {
    const updated = items.filter((item) => item.id !== id);
    persist(updated);
  }, [items, persist]);

  const decrementQuantity = useCallback((id, qty) => {
    const updated = items.map((item) => {
      if (item.id !== id) return item;
      return { ...item, quantity_available: Math.max(0, item.quantity_available - qty) };
    });
    persist(updated);
  }, [items, persist]);

  const getItemById = useCallback((id) => {
    return items.find((item) => item.id === id) || null;
  }, [items]);

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, deleteItem, decrementQuantity, getItemById }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
}
