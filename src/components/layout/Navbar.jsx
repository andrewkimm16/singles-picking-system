import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, LogOut, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar({ onCartClick }) {
  const { user, isStaff, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <Store size={22} />
          <span>New Kawaii</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginLeft: '-4px',
            WebkitTextFillColor: 'var(--color-text-muted)',
          }}>
            Singles
          </span>
        </Link>

        <ul className="navbar-links">
          <li>
            <NavLink to="/" end>Shop</NavLink>
          </li>
          {isStaff && (
            <>
              <li>
                <NavLink to="/admin">Admin</NavLink>
              </li>
              <li>
                <NavLink to="/picking">Picking</NavLink>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-actions">
          <button
            className="navbar-cart-btn"
            onClick={onCartClick}
            aria-label="Open cart"
            id="cart-button"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="navbar-cart-badge">{cartCount}</span>
            )}
          </button>

          <button className="navbar-user" onClick={handleLogout} title="Sign out">
            <span className="navbar-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
            {user?.name?.split(' ')[0]}
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
