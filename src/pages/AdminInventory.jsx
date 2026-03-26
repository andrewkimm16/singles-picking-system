import { useState } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext.jsx';
import { formatPrice } from '../utils/formatters.js';
import { GAMES, CONDITIONS, FINISHES } from '../utils/constants.js';

const EMPTY_FORM = {
  card_name: '',
  game: 'MTG',
  set_code: '',
  collector_number: '',
  condition: 'NM',
  finish: 'non-foil',
  price: '',
  quantity_available: '',
};

export default function AdminInventory() {
  const { items, addItem, updateItem, deleteItem } = useInventory();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredItems = items.filter((item) =>
    item.card_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    item.set_code.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleEdit = (item) => {
    setForm({
      card_name: item.card_name,
      game: item.game,
      set_code: item.set_code,
      collector_number: item.collector_number || '',
      condition: item.condition,
      finish: item.finish,
      price: item.price,
      quantity_available: item.quantity_available,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      price: Number(form.price),
      quantity_available: Number(form.quantity_available),
    };

    if (editingId) {
      updateItem(editingId, data);
    } else {
      addItem(data);
    }

    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="page-wrapper" id="admin-inventory">
      <div className="page-header">
        <Link to="/admin" className="btn btn-ghost" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Inventory Management</h1>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button className="btn btn-secondary btn-sm" disabled title="Coming soon">
              <Upload size={14} /> CSV Import
            </button>
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}>
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="checkout-section" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h3>{editingId ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Card Name</label>
              <input className="form-input" value={form.card_name} onChange={(e) => setForm({ ...form, card_name: e.target.value })} required placeholder="e.g. Lightning Bolt" />
            </div>
            <div className="form-group">
              <label className="form-label">Game</label>
              <select className="form-select" value={form.game} onChange={(e) => setForm({ ...form, game: e.target.value })}>
                {GAMES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Set Code</label>
              <input className="form-input" value={form.set_code} onChange={(e) => setForm({ ...form, set_code: e.target.value })} required placeholder="e.g. MH3" />
            </div>
            <div className="form-group">
              <label className="form-label">Collector Number</label>
              <input className="form-input" value={form.collector_number} onChange={(e) => setForm({ ...form, collector_number: e.target.value })} placeholder="Optional" />
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select className="form-select" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                {CONDITIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Finish</label>
              <select className="form-select" value={form.finish} onChange={(e) => setForm({ ...form, finish: e.target.value })}>
                {FINISHES.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input className="form-input" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input className="form-input" type="number" min="0" value={form.quantity_available} onChange={(e) => setForm({ ...form, quantity_available: e.target.value })} required placeholder="0" />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Add'} Item</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <input
          className="form-input"
          placeholder="Search inventory..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Card Name</th>
              <th>Game</th>
              <th>Set</th>
              <th>Condition</th>
              <th>Finish</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 700 }}>{item.card_name}</td>
                <td>
                  <span className={`product-tile-game-badge ${item.game.toLowerCase()}`} style={{ position: 'relative', top: 'auto', right: 'auto', fontSize: '0.65rem', display: 'inline-block' }}>
                    {item.game}
                  </span>
                </td>
                <td>{item.set_code}</td>
                <td>{item.condition}</td>
                <td>{item.finish === 'foil' ? '✦ Foil' : 'Non-Foil'}</td>
                <td style={{ fontWeight: 700 }}>{formatPrice(item.price)}</td>
                <td>
                  <span style={{
                    fontWeight: 700,
                    color: item.quantity_available === 0 ? 'var(--color-error)' :
                           item.quantity_available <= 2 ? 'var(--color-warning)' : undefined,
                  }}>
                    {item.quantity_available}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)} title="Edit">
                      <Pencil size={14} />
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(item.id)} title="Delete" style={{ color: 'var(--color-error)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
        Showing {filteredItems.length} of {items.length} items
      </div>
    </div>
  );
}
