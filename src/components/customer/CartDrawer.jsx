import { X, ShoppingBag, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext.jsx';
import { useInventory } from '../../context/InventoryContext.jsx';
import { formatPrice } from '../../utils/formatters.js';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ open, onClose }) {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const { getItemById } = useInventory();
  const navigate = useNavigate();

  if (!open) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />
      <div className="cart-drawer" id="cart-drawer">
        <div className="cart-drawer-header">
          <h2>Your Cart ({cartCount})</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        <div className="cart-drawer-items">
          {cart.items.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
              <div className="empty-state-icon">
                <ShoppingBag size={32} />
              </div>
              <h3>Your cart is empty</h3>
              <p>Find your next favorite card and add it here!</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div className="cart-item" key={item.inventory_id}>
                <div className="cart-item-image">
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--color-text-muted)', textAlign: 'center', padding: 4 }}>
                    {item.game}
                  </span>
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.card_name}</div>
                  <div className="cart-item-meta">
                    {item.set_code} · {item.condition}
                    {item.finish === 'foil' && ' · ✦ Foil'}
                  </div>
                  <div className="cart-item-bottom">
                    <span className="cart-item-price">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <div className="cart-item-qty-controls">
                      <button onClick={() => updateQuantity(item.inventory_id, item.quantity - 1)}>
                        {item.quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.inventory_id, item.quantity + 1)}
                        disabled={item.quantity >= (getItemById(item.inventory_id)?.quantity_available || 0)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-total">
              <span>Total</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn btn-primary btn-lg btn-full" onClick={handleCheckout} id="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
