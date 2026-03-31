import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getPreorders, setPreorders } from '../data/dataStore.js';
import { seedPreorders } from '../data/seedPreorders.js';

const PreorderContext = createContext(null);

export function PreorderProvider({ children }) {
  const [preorders, setPreordersState] = useState([]);

  useEffect(() => {
    let stored = getPreorders();
    if (!stored) {
      // Seed preorders on first load for demo purposes
      stored = seedPreorders;
      setPreorders(stored);
    }
    setPreordersState(stored);
  }, []);

  const persist = useCallback((newList) => {
    setPreordersState(newList);
    setPreorders(newList);
  }, []);

  const addPreorder = useCallback((data) => {
    const updated = [...preorders, data];
    persist(updated);
  }, [preorders, persist]);

  const updatePreorder = useCallback((id, updates) => {
    const updated = preorders.map((p) => p.id === id ? { ...p, ...updates } : p);
    persist(updated);
  }, [preorders, persist]);

  const deletePreorder = useCallback((id) => {
    const updated = preorders.filter((p) => p.id !== id);
    persist(updated);
  }, [preorders, persist]);

  const getPreorderById = useCallback((id) => {
    return preorders.find((p) => p.id === id) || null;
  }, [preorders]);

  // Safely decrement stock, automatically triggering SOLD_OUT if 0
  const decrementStock = useCallback((id, quantity) => {
    const updated = preorders.map((p) => {
      if (p.id !== id) return p;
      const newStock = Math.max(0, p.total_stock - quantity);
      const newStatus = newStock === 0 && p.status === 'live' ? 'sold_out' : p.status;
      return { ...p, total_stock: newStock, status: newStatus };
    });
    persist(updated);
  }, [preorders, persist]);

  return (
    <PreorderContext.Provider value={{
      preorders,
      addPreorder,
      updatePreorder,
      deletePreorder,
      getPreorderById,
      decrementStock,
    }}>
      {children}
    </PreorderContext.Provider>
  );
}

export function usePreorders() {
  const ctx = useContext(PreorderContext);
  if (!ctx) throw new Error('usePreorders must be used within PreorderProvider');
  return ctx;
}
