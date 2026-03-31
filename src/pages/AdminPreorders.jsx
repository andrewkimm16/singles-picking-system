import { useState } from 'react';
import { Play, Pause, Search, Edit2, Plus, X, Trash2 } from 'lucide-react';
import { usePreorders } from '../context/PreorderContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { PREORDER_STATUSES, QUEUE_STATUSES } from '../utils/constants.js';
import { generateId } from '../utils/formatters.js';
import StatusBadge from '../components/picking/StatusBadge.jsx';

export default function AdminPreorders() {
  const { preorders, updatePreorder, addPreorder, deletePreorder } = usePreorders();
  const { queues } = useQueue();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingEvent, setEditingEvent] = useState(null); // null = table view. ID or "new" = modal view

  const filtered = preorders.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStatusToggle = (event) => {
    let nextStatus = event.status;
    if (event.status === 'upcoming' || event.status === 'paused') nextStatus = 'live';
    else if (event.status === 'live') nextStatus = 'paused';
    
    updatePreorder(event.id, { status: nextStatus });
  };

  // Convert Date to YYYY-MM-DDTHH:mm format for datetime-local
  const formatForInput = (isoDateString) => {
    if (!isoDateString) return '';
    const d = new Date(isoDateString);
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: parseFloat(formData.get('price')),
      total_stock: parseInt(formData.get('total_stock'), 10),
      max_per_user: parseInt(formData.get('max_per_user'), 10),
      claim_window_minutes: parseInt(formData.get('claim_window_minutes'), 10),
      start_time: new Date(formData.get('start_time')).toISOString(),
      status: formData.get('status')
    };

    if (editingEvent === 'new') {
      const newDrop = { 
        ...data, 
        id: generateId(), 
        created_at: new Date().toISOString(),
        image_url: null 
      };
      addPreorder(newDrop);
    } else {
      updatePreorder(editingEvent, data);
    }
    setEditingEvent(null);
  };

  const currentModalEvent = editingEvent && editingEvent !== 'new' ? preorders.find(p => p.id === editingEvent) : null;

  return (
    <div className="page-wrapper" id="admin-preorders-page">
      <div className="page-header" style={{ marginBottom: 'var(--spacing-2xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Manage Preorders & Queues</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setEditingEvent('new')}>
          <Plus size={18} style={{ marginRight: 6 }} /> New Drop
        </button>
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
                <th>Price & Limits</th>
                <th>Stock</th>
                <th>Live Queue Status</th>
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
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>
                      <div>${event.price.toFixed(2)}</div>
                      <div style={{ color: 'var(--color-text-muted)' }}>Max {event.max_per_user} · {event.claim_window_minutes}m claim</div>
                      <div style={{ color: 'var(--color-text-muted)' }}>{new Date(event.start_time).toLocaleString()}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{event.total_stock}</span> left
                    </td>
                    <td style={{ fontSize: 'var(--font-size-xs)' }}>
                      <div><b style={{ color: 'var(--color-text-primary)' }}>{waiting}</b> waiting</div>
                      <div><b style={{ color: 'var(--color-success)' }}>{active}</b> claiming</div>
                      <div><b style={{ color: 'var(--color-text-secondary)' }}>{completed}</b> secured</div>
                    </td>
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
                         <button className="btn btn-ghost btn-icon-only" onClick={() => setEditingEvent(event.id)}>
                           <Edit2 size={16} />
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', color: 'var(--color-text-muted)' }}>
                    No drops found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {editingEvent && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setEditingEvent(null);
        }}>
          <div className="modal" style={{ maxWidth: 600, padding: 0 }}>
            <div className="modal-header">
              <h2>{editingEvent === 'new' ? 'Create New Drop' : 'Edit Drop'}</h2>
              <button className="btn btn-ghost btn-icon-only" onClick={() => setEditingEvent(null)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveModal}>
              <div style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input required name="title" className="form-input" defaultValue={currentModalEvent?.title || ''} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description / Drop Rules</label>
                  <textarea required name="description" className="form-input" rows="3" defaultValue={currentModalEvent?.description || ''} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input required name="price" type="number" step="0.01" min="0" className="form-input" defaultValue={currentModalEvent?.price || ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Drop Status</label>
                    <select required name="status" className="form-input" defaultValue={currentModalEvent?.status || 'upcoming'}>
                      <option value="upcoming">Upcoming</option>
                      <option value="live">Live Now</option>
                      <option value="paused">Paused</option>
                      <option value="sold_out">Sold Out</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Total Stock Quantity</label>
                    <input required name="total_stock" type="number" min="0" className="form-input" defaultValue={currentModalEvent?.total_stock ?? ''} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Drop Start Time</label>
                    <input required name="start_time" type="datetime-local" className="form-input" defaultValue={currentModalEvent ? formatForInput(currentModalEvent.start_time) : formatForInput(new Date().toISOString())} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Max Allowed Per User</label>
                    <input required name="max_per_user" type="number" min="1" className="form-input" defaultValue={currentModalEvent?.max_per_user || 1} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Claim Window (Minutes)</label>
                    <input required name="claim_window_minutes" type="number" min="1" className="form-input" defaultValue={currentModalEvent?.claim_window_minutes || 5} />
                  </div>
                </div>

              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--spacing-xl)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)' }}>
                {editingEvent !== 'new' && (
                  <button type="button" className="btn btn-ghost" style={{ color: 'var(--color-error)', marginRight: 'auto' }} onClick={() => {
                    if (confirm('Are you sure you want to permanently delete this drop event?')) {
                      deletePreorder(editingEvent);
                      setEditingEvent(null);
                    }
                  }}>
                    <Trash2 size={16} style={{ marginRight: 6 }} /> Delete Drop
                  </button>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setEditingEvent(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Drop Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
