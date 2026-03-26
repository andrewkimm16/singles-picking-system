import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, ChevronRight } from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import StatusBadge from '../components/picking/StatusBadge.jsx';
import { formatPrice, formatDate } from '../utils/formatters.js';
import { ORDER_STATUSES, STATUS_TRANSITIONS } from '../utils/constants.js';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useOrders();
  const { updateItem, getItemById } = useInventory();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const handleMarkUnavailable = (order, item) => {
    // mark inventory item qty to 0
    const inv = getItemById(item.inventory_id);
    if (inv) {
      updateItem(inv.id, { quantity_available: 0 });
    }
    // transition order to ITEM_UNAVAILABLE if currently PICKING
    if (order.status === ORDER_STATUSES.PICKING) {
      updateOrderStatus(order.order_id, ORDER_STATUSES.ITEM_UNAVAILABLE);
    }
    setSelectedOrder(null);
  };

  if (selectedOrder) {
    const order = orders.find((o) => o.order_id === selectedOrder);
    if (!order) {
      setSelectedOrder(null);
      return null;
    }
    const validTransitions = STATUS_TRANSITIONS[order.status] || [];

    return (
      <div className="page-wrapper" id="order-detail">
        <div className="page-header">
          <button className="btn btn-ghost" onClick={() => setSelectedOrder(null)} style={{ marginBottom: 'var(--spacing-sm)' }}>
            <ArrowLeft size={16} /> Back to Orders
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <h1>Order {order.order_id}</h1>
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Order Info */}
        <div className="checkout-section">
          <h3>Customer</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700 }}>Name</div>
              <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700 }}>Email</div>
              <div style={{ fontWeight: 600 }}>{order.customer_email}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700 }}>Created</div>
              <div style={{ fontWeight: 600 }}>{formatDate(order.created_at)}</div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="checkout-section">
          <h3>Items</h3>
          <div className="checkout-items">
            {order.items.map((item, i) => (
              <div className="checkout-item" key={i}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{item.card_name}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {item.set_code} · {item.condition} · {item.finish === 'foil' ? '✦ Foil' : 'Non-Foil'} · Qty: {item.quantity}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <span style={{ fontWeight: 700 }}>{formatPrice(item.price_at_purchase * item.quantity)}</span>
                  {order.status === ORDER_STATUSES.PICKING && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleMarkUnavailable(order, item)}
                    >
                      Mark Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
        </div>

        {/* Status Actions */}
        {validTransitions.length > 0 && (
          <div className="checkout-section">
            <h3>Actions</h3>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
              {validTransitions.map((status) => (
                <button
                  key={status}
                  className={`btn ${status === ORDER_STATUSES.COMPLETED ? 'btn-success' : status === ORDER_STATUSES.PARTIAL_REFUND_REQUIRED ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => {
                    updateOrderStatus(order.order_id, status);
                  }}
                >
                  Move to: {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-wrapper" id="admin-orders">
      <div className="page-header">
        <Link to="/admin" className="btn btn-ghost" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1>Order Management</h1>
      </div>

      {/* Status Filter Tabs */}
      <div className="admin-tabs">
        {['all', ...Object.values(ORDER_STATUSES)].map((status) => (
          <button
            key={status}
            className={`admin-tab ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            {status !== 'all' && (
              <span style={{ marginLeft: 4, opacity: 0.6 }}>
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      {sortedOrders.length === 0 ? (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>Orders will appear here once customers start shopping!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => (
                <tr key={order.order_id} style={{ cursor: 'pointer' }} onClick={() => setSelectedOrder(order.order_id)}>
                  <td style={{ fontWeight: 800 }}>{order.order_id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 700 }}>{formatPrice(order.subtotal)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</td>
                  <td><ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
