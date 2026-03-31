import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, ShieldCheck, ArrowRight, XCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { usePreorders } from '../context/PreorderContext.jsx';
import { useQueue, HEARTBEAT_INTERVAL_MS } from '../context/QueueContext.jsx';
import { QUEUE_STATUSES } from '../utils/constants.js';

export default function PreorderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPreorderById } = usePreorders();
  const { joinQueue, sendHeartbeat, getUserEntry, markCheckedOut, queues } = useQueue();

  const [timeLeft, setTimeLeft] = useState(null);

  const event = getPreorderById(id);
  const queueEntry = getUserEntry(id);

  // Heartbeat loop for Waiting state
  useEffect(() => {
    let interval;
    if (queueEntry?.status === QUEUE_STATUSES.WAITING) {
      interval = setInterval(() => {
        sendHeartbeat(id);
      }, HEARTBEAT_INTERVAL_MS);
      // Run once immediately
      sendHeartbeat(id);
    }
    return () => clearInterval(interval);
  }, [queueEntry?.status, id, sendHeartbeat]);

  // Countdown loop for Active Claim state
  useEffect(() => {
    let interval;
    if (queueEntry?.status === QUEUE_STATUSES.ACTIVE_CLAIM && queueEntry.claim_expires_at) {
      interval = setInterval(() => {
        const remaining = Math.max(0, queueEntry.claim_expires_at - Date.now());
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      // Run immediately
      setTimeLeft(Math.max(0, queueEntry.claim_expires_at - Date.now()));
    } else {
      setTimeLeft(null);
    }
    return () => clearInterval(interval);
  }, [queueEntry?.status, queueEntry?.claim_expires_at]);


  if (!event) return <div className="page-wrapper">Drop not found.</div>;

  const isLive = event.status === 'live';
  const hasStarted = Date.now() >= new Date(event.start_time).getTime();
  
  // Calculate relative position based on timestamps of all waiting users
  const getQueuePosition = () => {
    if (!queueEntry || queueEntry.status !== QUEUE_STATUSES.WAITING) return 0;
    const waitingUsers = queues
      .filter(q => q.preorder_id === id && q.status === QUEUE_STATUSES.WAITING)
      .sort((a, b) => a.join_timestamp - b.join_timestamp);
    return waitingUsers.findIndex(q => q.user_id === user.userId) + 1;
  };

  const formatCountdown = (ms) => {
    if (ms === null || ms < 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ---------------------------------------------
  // RENDER: NOT IN QUEUE (Overview Page)
  // ---------------------------------------------
  if (!queueEntry || [QUEUE_STATUSES.REMOVED, QUEUE_STATUSES.EXPIRED].includes(queueEntry.status)) {
    return (
      <div className="page-wrapper" style={{ maxWidth: 800 }}>
        {queueEntry?.status === QUEUE_STATUSES.EXPIRED && (
          <div className="checkout-mock-notice" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', border: '1px solid var(--color-error)' }}>
            <XCircle size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
            Your claim window expired. You have lost your place in the queue.
          </div>
        )}
        
        <div className="card" style={{ overflow: 'hidden', marginTop: 'var(--spacing-lg)' }}>
          <div style={{ height: 240, background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <h1 style={{ color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.4)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>{event.title}</h1>
          </div>
          
          <div className="card-body" style={{ padding: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-xl)' }}>
              <div>
                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>About this Drop</h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-lg)' }}>{event.description}</p>
                
                <h4 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Drop Rules</h4>
                <ul style={{ paddingLeft: 'var(--spacing-lg)', marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                  <li>Strict limit of {event.max_per_user} per customer.</li>
                  <li>Joining the queue does not guarantee inventory.</li>
                  <li>You will have {event.claim_window_minutes} minutes to complete checkout once your turn arrives.</li>
                  <li>Do not close this window while in the queue.</li>
                </ul>
              </div>
              
              <div style={{ background: 'var(--color-bg)', padding: 'var(--spacing-lg)', borderRadius: 'var(--border-radius)', height: 'fit-content' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--spacing-md)' }}>
                  ${event.price.toFixed(2)}
                </div>
                
                {event.status === 'sold_out' ? (
                  <button className="btn btn-secondary btn-full" disabled>Sold Out</button>
                ) : event.status === 'upcoming' ? (
                  <button className="btn btn-secondary btn-full" disabled>Opens at {new Date(event.start_time).toLocaleTimeString()}</button>
                ) : (
                  <button className="btn btn-primary btn-lg btn-full" onClick={() => joinQueue(id)}>
                    Join Queue
                  </button>
                )}
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                  {event.total_stock > 0 ? `${event.total_stock} units available` : 'Check restock status'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // RENDER: CHECKED OUT OR FAILED
  // ---------------------------------------------
  if (queueEntry.status === QUEUE_STATUSES.CHECKED_OUT) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: 'var(--spacing-3xl)' }}>
        <ShieldCheck size={64} style={{ color: 'var(--color-success)', margin: '0 auto var(--spacing-lg)' }} />
        <h1>Drop Secured!</h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto var(--spacing-xl)' }}>
          You have successfully preordered {event.title}. Keep an eye on your email for shipping updates.
        </p>
        <Link to="/preorders" className="btn btn-primary">Back to Drops</Link>
      </div>
    );
  }

  if (queueEntry.status === QUEUE_STATUSES.SOLD_OUT) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: 'var(--spacing-3xl)' }}>
        <XCircle size={64} style={{ color: 'var(--color-text-muted)', margin: '0 auto var(--spacing-lg)' }} />
        <h1>Sold Out</h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto var(--spacing-xl)' }}>
          Inventory ran out before your turn. Better luck next time!
        </p>
        <Link to="/preorders" className="btn btn-primary">Back to Drops</Link>
      </div>
    );
  }

  // ---------------------------------------------
  // RENDER: ACTIVE CLAIM (It's their turn!)
  // ---------------------------------------------
  if (queueEntry.status === QUEUE_STATUSES.ACTIVE_CLAIM) {
    const isWarning = timeLeft !== null && timeLeft < 60000; // less than 1 min
    
    // Simulate direct checkout via context or a dedicated checkout page. 
    // Usually preorders push to a dedicated checkout URL bypassing the cart.
    const handleCheckout = () => {
       // We'll pass the preorder ID to a special simplified checkout route or just process it here
       navigate(`/checkout?preorder=${id}`);
    };

    return (
      <div className="page-wrapper" style={{ maxWidth: 600, marginTop: 'var(--spacing-2xl)' }}>
        <div className="card" style={{ border: `2px solid ${isWarning ? 'var(--color-error)' : 'var(--color-success)'}` }}>
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
             <h2 style={{ color: isWarning ? 'var(--color-error)' : 'var(--color-success)' }}>It's Your Turn!</h2>
             <p style={{ margin: 'var(--spacing-md) 0 var(--spacing-xl)' }}>
               {event.title} is reserved for you. Complete your purchase before the timer runs out.
             </p>
             
             <div style={{ fontSize: '4rem', fontWeight: 800, fontFamily: 'monospace', color: isWarning ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
               {formatCountdown(timeLeft)}
             </div>
             
             <div style={{ background: 'var(--color-bg)', padding: 'var(--spacing-md)', borderRadius: 'var(--border-radius)', margin: 'var(--spacing-xl) 0', textAlign: 'left' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                 <span>{event.title}</span>
                 <span>${event.price.toFixed(2)}</span>
               </div>
               <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                 Max Quantity: {event.max_per_user}
               </div>
             </div>

             <button className="btn btn-primary btn-lg btn-full" onClick={handleCheckout}>
               Proceed to Checkout <ArrowRight size={18} />
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // RENDER: WAITING IN QUEUE
  // ---------------------------------------------
  const pos = getQueuePosition();
  return (
    <div className="page-wrapper" style={{ maxWidth: 600, marginTop: 'var(--spacing-2xl)' }}>
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-3xl) var(--spacing-xl)' }}>
           
           <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto var(--spacing-lg)' }}>
             <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--color-border)', borderRadius: '50%' }} />
             <div style={{ position: 'absolute', inset: 0, border: '4px solid var(--color-accent-pink)', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1.5s linear infinite' }} />
             <Users size={32} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--color-text-secondary)' }} />
           </div>

           <h2 style={{ marginBottom: 'var(--spacing-sm)' }}>You are in line</h2>
           <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xl)' }}>
             Please don't close this page or hit back. Your place in line is secured automatically.
           </p>

           <div style={{ background: 'var(--color-bg)', padding: 'var(--spacing-xl)', borderRadius: 'var(--border-radius)' }}>
             <div style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>
               Your Position
             </div>
             <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
               {pos}
             </div>
             <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--spacing-sm)' }}>
               Keep this window open. When it's your turn, checkout will automatically appear.
             </div>
           </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
