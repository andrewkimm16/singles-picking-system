import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getQueues, setQueues } from '../data/dataStore.js';
import { QUEUE_STATUSES } from '../utils/constants.js';
import { useAuth } from './AuthContext.jsx';
import { usePreorders } from './PreorderContext.jsx';

const QueueContext = createContext(null);

// Heartbeat interval in ms (client sends signal)
export const HEARTBEAT_INTERVAL_MS = 10000; 
// Time before a missing heartbeat means user left the queue
const HEARTBEAT_TIMEOUT_MS = 25000; 

export function QueueProvider({ children }) {
  const { user } = useAuth();
  const { preorders } = usePreorders();
  const [queues, setQueuesState] = useState(getQueues());

  const persist = useCallback((newQueues) => {
    setQueuesState(newQueues);
    setQueues(newQueues);
  }, []);

  // ----------------------------------------------------
  // BACKEND SIMULATION LOOP
  // ----------------------------------------------------
  // This interval forces queue advancement and expires dead sessions
  useEffect(() => {
    const backendLoop = setInterval(() => {
      setQueuesState((currentQueues) => {
        let changed = false;
        const now = Date.now();
        let nextQueues = [...currentQueues];

        // 1. Expire missed heartbeats and timed-out claims
        nextQueues = nextQueues.map((q) => {
          if (q.status === QUEUE_STATUSES.WAITING && (now - q.last_heartbeat > HEARTBEAT_TIMEOUT_MS)) {
            changed = true;
            return { ...q, status: QUEUE_STATUSES.REMOVED };
          }
          if (q.status === QUEUE_STATUSES.ACTIVE_CLAIM && q.claim_expires_at && now > q.claim_expires_at) {
            changed = true;
            return { ...q, status: QUEUE_STATUSES.EXPIRED };
          }
          return q;
        });

        // 2. Advance Queues per Preorder
        const livePreorders = preorders.filter((p) => p.status === 'live');
        
        livePreorders.forEach((preorder) => {
          const preorderQueues = nextQueues.filter((q) => q.preorder_id === preorder.id);
          const activeClaims = preorderQueues.filter((q) => q.status === QUEUE_STATUSES.ACTIVE_CLAIM).length;
          
          // If there is active stock left, and nobody is currently claiming (or depending on rules, 
          // we could let multiple people claim at once if stock > active claims)
          // For simplicity and fairness, let's allow 1 active claim per stock available up to max 1 at a time,
          // or allow batching. Let's do strictly 1-by-1 processing for highest hype control.
          if (activeClaims === 0 && preorder.total_stock > 0) {
            // Find the next waiting person
            const nextWaiting = preorderQueues
              .filter((q) => q.status === QUEUE_STATUSES.WAITING)
              .sort((a, b) => a.join_timestamp - b.join_timestamp)[0];

            if (nextWaiting) {
              changed = true;
              nextWaiting.status = QUEUE_STATUSES.ACTIVE_CLAIM;
              // Set claim window expiration (e.g. 5 minutes)
              const durationMs = preorder.claim_window_minutes * 60 * 1000;
              nextWaiting.claim_expires_at = now + durationMs;
              nextWaiting.claim_started_at = now;
            }
          }
        });

        if (changed) {
          setQueues(nextQueues);
          return nextQueues;
        }
        return currentQueues;
      });
    }, 2000); // Check every 2 seconds

    return () => clearInterval(backendLoop);
  }, [preorders]); // Re-bind if preorders change (stock drops)

  // ----------------------------------------------------
  // CLIENT ACTIONS
  // ----------------------------------------------------

  const joinQueue = useCallback((preorderId) => {
    if (!user?.userId) return;

    // Check if user is already in queue
    const existing = queues.find((q) => q.user_id === user.userId && q.preorder_id === preorderId);
    if (existing && [QUEUE_STATUSES.WAITING, QUEUE_STATUSES.ACTIVE_CLAIM].includes(existing.status)) {
      return; // Already active
    }

    const newEntry = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      user_id: user.userId,
      user_name: user.name, // storing name for admin display ease
      preorder_id: preorderId,
      status: QUEUE_STATUSES.WAITING,
      join_timestamp: Date.now(),
      last_heartbeat: Date.now(),
      claim_started_at: null,
      claim_expires_at: null,
    };

    persist([...queues, newEntry]);
  }, [queues, persist, user]);

  const sendHeartbeat = useCallback((preorderId) => {
    if (!user?.userId) return;
    
    const updated = queues.map((q) => {
      if (q.user_id === user.userId && q.preorder_id === preorderId && q.status === QUEUE_STATUSES.WAITING) {
        return { ...q, last_heartbeat: Date.now() };
      }
      return q;
    });
    
    persist(updated);
  }, [queues, persist, user]);

  const markCheckedOut = useCallback((preorderId) => {
    if (!user?.userId) return;
    const updated = queues.map((q) => {
      if (q.user_id === user.userId && q.preorder_id === preorderId && q.status === QUEUE_STATUSES.ACTIVE_CLAIM) {
        return { ...q, status: QUEUE_STATUSES.CHECKED_OUT };
      }
      return q;
    });
    persist(updated);
  }, [queues, persist, user]);

  const getUserEntry = useCallback((preorderId) => {
    if (!user?.userId) return null;
    return queues.find((q) => q.user_id === user.userId && q.preorder_id === preorderId) || null;
  }, [queues, user]);

  // Admin helper
  const getQueueForPreorder = useCallback((preorderId) => {
    return queues.filter((q) => q.preorder_id === preorderId);
  }, [queues]);


  return (
    <QueueContext.Provider value={{
      queues,
      joinQueue,
      sendHeartbeat,
      getUserEntry,
      markCheckedOut,
      getQueueForPreorder,
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
}
