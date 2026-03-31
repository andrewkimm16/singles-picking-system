import { useState } from 'react';
import { Play, Pause, XCircle, Search, Edit2 } from 'lucide-react';
import { usePreorders } from '../context/PreorderContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { PREORDER_STATUSES, QUEUE_STATUSES } from '../utils/constants.js';
import StatusBadge from '../components/picking/StatusBadge.jsx';

export default function AdminPreorders() {
  const { preorders, updatePreorder } = usePreorders();
  const { queues } = useQueue();

  const [searchTerm, setSearchTerm] = useState('');

  const filtered = preorders.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStatusToggle = (event) => {
    let nextStatus = event.status;
    if (event.status === 'upcoming' || event.status === 'paused') nextStatus = 'live';
    else if (event.status === 'live') nextStatus = 'paused';
    
    updatePreorder(event.id, { status: nextStatus });
  };

  const handleStockUpdate = (event) => {
    const val = prompt(`Update stock for ${event.title} (current: ${event.total_stock}):`, event.total_stock);
    if (val !== null && !isNaN(parseInt(val, 10))) {
      const newStock = Math.max(0, parseInt(val, 10));
      updatePreorder(event.id, { 
        total_stock: newStock,
        status: newStock === 0 && event.status === 'live' ? 'sold_out' : event.status
      });
    }
  };

  return (
    <div className="page-wrapper" id="admin-preorders-page">
      <div className="page-header" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1>Manage Preorders & Queues</h1>
      </div>

      <div className="inventory-controls" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search drops..." 
            style={{ paddingLeft: 44, height: 44 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Event Title</th>
                <th>Status</th>
                <th>Stock</th>
                <th>Live Queue</th>
                <th>Active Claims</th>
                <th>Completed</th>
                <th style={{ textAlign: 'right' }}>Controls</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(event => {
                const eventQueues = queues.filter(q => q.preorder_id === event.id);
                const waiting = eventQueues.filter(q => q.status === QUEUE_STATUSES.WAITING).length;
                const active = eventQueues.filter(q => q.status === QUEUE_STATUSES.ACTIVE_CLAIM).length;
                const completed = eventQueues.filter(q => q.status === QUEUE_STATUSES.CHECKED_OUT).length;

                return (
                  <tr key={event.id}>
                    <td style={{ fontWeight: 600 }}>{event.title}</td>
                    <td>
                      <StatusBadge status={event.status === 'sold_out' ? 'ITEM_UNAVAILABLE' : event.status === 'live' ? 'COMPLETED' : 'PENDING'} />
                      <span style={{ marginLeft: 8, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                        {event.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                        {event.total_stock}
                        <button className="btn btn-ghost btn-icon-only" onClick={() => handleStockUpdate(event)} style={{ padding: 4, height: 'auto', minHeight: 0 }}>
                          <Edit2 size={12} />
                        </button>
                      </div>
                    </td>
                    <td><b style={{ color: 'var(--color-text-primary)' }}>{waiting}</b> wating</td>
                    <td><b style={{ color: 'var(--color-success)' }}>{active}</b> claiming</td>
                    <td><b style={{ color: 'var(--color-text-secondary)' }}>{completed}</b> secured</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
                         {event.status === 'live' ? (
                           <button className="btn btn-secondary btn-sm" onClick={() => handleStatusToggle(event)}>
                             <Pause size={14} /> Pause Drop
                           </button>
                         ) : ['upcoming', 'paused'].includes(event.status) ? (
                           <button className="btn btn-primary btn-sm" onClick={() => handleStatusToggle(event)} style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
                             <Play size={14} /> Start Drop
                           </button>
                         ) : (
                           <button className="btn btn-secondary btn-sm" disabled>
                             Drop Ended
                           </button>
                         )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', color: 'var(--color-text-muted)' }}>
                    No drops found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
