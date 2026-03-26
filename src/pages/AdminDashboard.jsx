import { Link } from 'react-router-dom';
import { Package, ShoppingCart, ClipboardList, TrendingUp } from 'lucide-react';
import { useInventory } from '../context/InventoryContext.jsx';
import { useOrders } from '../context/OrderContext.jsx';
import { ORDER_STATUSES } from '../utils/constants.js';
import { formatPrice } from '../utils/formatters.js';

export default function AdminDashboard() {
  const { items } = useInventory();
  const { orders } = useOrders();

  const totalCards = items.reduce((sum, i) => sum + i.quantity_available, 0);
  const totalValue = items.reduce((sum, i) => sum + i.price * i.quantity_available, 0);
  const pendingOrders = orders.filter((o) =>
    o.status === ORDER_STATUSES.PAID || o.status === ORDER_STATUSES.PICKING
  ).length;
  const completedOrders = orders.filter((o) => o.status === ORDER_STATUSES.COMPLETED).length;
  const totalRevenue = orders
    .filter((o) => o.status !== ORDER_STATUSES.PARTIAL_REFUND_REQUIRED)
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="page-wrapper" id="admin-dashboard">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your singles inventory and orders</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--color-accent-blue-subtle)', color: 'var(--color-info)' }}>
            <Package size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{items.length}</div>
            <div className="admin-stat-label">Unique Items</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--color-accent-mint-subtle)', color: 'var(--color-success)' }}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{totalCards}</div>
            <div className="admin-stat-label">Total Cards</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--color-accent-pink-subtle)', color: '#c2255c' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{pendingOrders}</div>
            <div className="admin-stat-label">Pending Orders</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--color-accent-purple-subtle)', color: '#6741d9' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{formatPrice(totalRevenue)}</div>
            <div className="admin-stat-label">Revenue</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--spacing-md)',
      }}>
        <Link to="/admin/inventory" className="card" style={{ textDecoration: 'none', padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <Package size={24} style={{ color: 'var(--color-accent-purple)' }} />
            <div>
              <h3 style={{ marginBottom: 2 }}>Inventory</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Add, edit, and manage your singles inventory
              </p>
            </div>
          </div>
        </Link>

        <Link to="/admin/orders" className="card" style={{ textDecoration: 'none', padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <ClipboardList size={24} style={{ color: 'var(--color-accent-pink)' }} />
            <div>
              <h3 style={{ marginBottom: 2 }}>Orders</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                View and manage customer orders
              </p>
            </div>
          </div>
        </Link>

        <Link to="/picking" className="card" style={{ textDecoration: 'none', padding: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <ShoppingCart size={24} style={{ color: 'var(--color-accent-mint)' }} />
            <div>
              <h3 style={{ marginBottom: 2 }}>Picking Queue</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                Pick and fulfill orders
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
