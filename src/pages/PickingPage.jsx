import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Package, Clock, User, ChevronRight } from 'lucide-react';
import { useOrders } from '../context/OrderContext.jsx';
import StatusBadge from '../components/picking/StatusBadge.jsx';
import { formatPrice, formatDate, timeAgo } from '../utils/formatters.js';
import { ORDER_STATUSES, PICK_STATUSES } from '../utils/constants.js';

export default function PickingPage() {
  const { orders, updateOrderStatus, updatePickStatus, getOrderById } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const navigate = useNavigate();

  // Orders available for picking: PAID or PICKING
  const pickableOrders = orders
    .filter((o) => o.status === ORDER_STATUSES.PAID || o.status === ORDER_STATUSES.PICKING)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // If viewing a specific order's pick list
  if (selectedOrderId) {
    const order = getOrderById(selectedOrderId);
    if (!order) {
      setSelectedOrderId(null);
      return null;
    }

    const allPicked = order.items.every((i) => i.pick_status !== PICK_STATUSES.PENDING);
    const allFound = order.items.every((i) => i.pick_status === PICK_STATUSES.FOUND);
    const hasNotFound = order.items.some((i) => i.pick_status === PICK_STATUSES.NOT_FOUND);

    const handleStartPicking = () => {
      if (order.status === ORDER_STATUSES.PAID) {
        updateOrderStatus(order.order_id, ORDER_STATUSES.PICKING);
      }
    };

    const handleMarkFound = (inventoryId) => {
      handleStartPicking();
      updatePickStatus(order.order_id, inventoryId, PICK_STATUSES.FOUND);
    };

    const handleMarkNotFound = (inventoryId) => {
      handleStartPicking();
      updatePickStatus(order.order_id, inventoryId, PICK_STATUSES.NOT_FOUND);
    };

    const handleResetItem = (inventoryId) => {
      updatePickStatus(order.order_id, inventoryId, PICK_STATUSES.PENDING);
    };

    const handleCompletePicking = () => {
      if (allFound) {
        updateOrderStatus(order.order_id, ORDER_STATUSES.PICKED);
        setSelectedOrderId(null);
      } else if (hasNotFound) {
        updateOrderStatus(order.order_id, ORDER_STATUSES.ITEM_UNAVAILABLE);
        setSelectedOrderId(null);
      }
    };

    const pickedCount = order.items.filter((i) => i.pick_status !== PICK_STATUSES.PENDING).length;

    return (
      <div className="page-wrapper" id="pick-list-view">
        <div className="page-header">
          <button className="btn btn-ghost" onClick={() => setSelectedOrderId(null)} style={{ marginBottom: 'var(--spacing-sm)' }}>
            <ArrowLeft size={16} /> Back to Queue
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <h1>Pick List — {order.order_id}</h1>
                <StatusBadge status={order.status} />
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                <User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {order.customer_name}
                {' · '}
                <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {timeAgo(order.created_at)}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>
                {pickedCount}/{order.items.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>items checked</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: 6,
          background: 'var(--color-border)',
          borderRadius: 'var(--border-radius-full)',
          marginBottom: 'var(--spacing-xl)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${(pickedCount / order.items.length) * 100}%`,
            background: hasNotFound
              ? 'var(--color-warning)'
              : 'linear-gradient(135deg, var(--color-accent-pink), var(--color-accent-purple))',
            borderRadius: 'var(--border-radius-full)',
            transition: 'width 400ms ease',
          }} />
        </div>

        {/* Pick Items */}
        <div className="pick-list">
          {order.items.map((item) => (
            <div
              key={item.inventory_id}
              className={`pick-item ${item.pick_status === PICK_STATUSES.FOUND ? 'found' : item.pick_status === PICK_STATUSES.NOT_FOUND ? 'not-found' : ''}`}
            >
              <div className="pick-item-info">
                <div className="pick-item-name">{item.card_name}</div>
                <div className="pick-item-meta">
                  {item.game} · {item.set_code} · {item.condition}
                  {item.finish === 'foil' && ' · ✦ Foil'}
                  {' · '}
                  {formatPrice(item.price_at_purchase)}
                </div>
              </div>

              <span className="pick-item-qty">×{item.quantity}</span>

              <div className="pick-item-actions">
                {item.pick_status === PICK_STATUSES.PENDING ? (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleMarkFound(item.inventory_id)}
                      title="Found"
                    >
                      <Check size={14} /> Found
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleMarkNotFound(item.inventory_id)}
                      title="Not Found"
                    >
                      <X size={14} /> Not Found
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleResetItem(item.inventory_id)}
                    title="Reset"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Complete Action */}
        {allPicked && (
          <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
            {allFound ? (
              <button className="btn btn-success btn-lg" onClick={handleCompletePicking}>
                <Package size={18} /> All Items Found — Mark as Picked
              </button>
            ) : (
              <button className="btn btn-danger btn-lg" onClick={handleCompletePicking}>
                Some Items Missing — Flag for Review
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Order Queue View
  return (
    <div className="page-wrapper" id="picking-page">
      <div className="page-header">
        <h1>Picking Queue</h1>
        <p>Orders ready to be picked, sorted by oldest first</p>
      </div>

      {pickableOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Package size={36} />
          </div>
          <h3>All caught up!</h3>
          <p>No orders waiting to be picked. Nice work! 🎉</p>
        </div>
      ) : (
        <div className="order-queue">
          {pickableOrders.map((order) => (
            <div
              key={order.order_id}
              className="order-queue-item"
              onClick={() => setSelectedOrderId(order.order_id)}
              id={`queue-item-${order.order_id}`}
            >
              <div className="order-queue-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <span className="order-queue-id">{order.order_id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="order-queue-meta">
                  <span><User size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {order.customer_name}</span>
                  <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                  <span><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {timeAgo(order.created_at)}</span>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--color-text-muted)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Also show recently completed for reference */}
      {orders.filter((o) => o.status === ORDER_STATUSES.PICKED || o.status === ORDER_STATUSES.COMPLETED).length > 0 && (
        <div style={{ marginTop: 'var(--spacing-3xl)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>Recently Completed</h2>
          <div className="order-queue">
            {orders
              .filter((o) => o.status === ORDER_STATUSES.PICKED || o.status === ORDER_STATUSES.COMPLETED)
              .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
              .slice(0, 5)
              .map((order) => (
                <div key={order.order_id} className="order-queue-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  <div className="order-queue-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <span className="order-queue-id">{order.order_id}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="order-queue-meta">
                      <span>{order.customer_name}</span>
                      <span>{order.items.length} items</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
