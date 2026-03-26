import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useOrders } from '../context/OrderContext.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import { formatPrice } from '../utils/formatters.js';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { decrementQuantity } = useInventory();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState('');

  if (confirmedOrder) {
    return (
      <div className="page-wrapper">
        <div className="confirmation" id="order-confirmation">
          <div className="confirmation-icon">
            <CheckCircle size={40} />
          </div>
          <h1>Order Placed!</h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Thanks, {confirmedOrder.customer_name}! Your order is being prepared.
            You'll hear from us when it's ready for pickup.
          </p>
          <div className="confirmation-order-id">
            {confirmedOrder.order_id}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', marginTop: 'var(--spacing-lg)' }}>
            <Link to="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (cart.items.length === 0 && !confirmedOrder) {
      navigate('/');
    }
  }, [cart.items.length, navigate, confirmedOrder]);

  if (cart.items.length === 0 && !confirmedOrder) {
    return null;
  }

  const handlePlaceOrder = () => {
    setError('');
    
    // Check inventory first
    for (const item of cart.items) {
      const invItem = getItemById(item.inventory_id);
      if (!invItem || invItem.quantity_available < item.quantity) {
        setError(`Sorry, ${item.card_name} only has ${invItem?.quantity_available || 0} left in stock. Please update your cart.`);
        return;
      }
    }

    // Create internal order
    const order = createOrder(
      user.userId,
      user.name,
      user.email,
      phone || null,
      cart.items
    );

    // Decrement inventory
    cart.items.forEach((item) => {
      decrementQuantity(item.inventory_id, item.quantity);
    });

    // Clear cart and show confirmation
    clearCart();
    setConfirmedOrder(order);
  };

  return (
    <div className="page-wrapper" id="checkout-page">
      <div className="checkout-page">
        <div className="page-header">
          <button
            className="btn btn-ghost"
            onClick={() => navigate(-1)}
            style={{ marginBottom: 'var(--spacing-sm)' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1>Checkout</h1>
        </div>

        {/* Mock Payment Notice */}
        <div className="checkout-mock-notice">
          <Info size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Payment integration coming soon (Shopify). Orders are simulated as paid for now.
        </div>

        {/* Customer Info */}
        <div className="checkout-section">
          <h3>Your Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={user.name} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user.email} disabled />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 'var(--spacing-md)' }}>
            <label className="form-label" htmlFor="checkout-phone">Phone (optional)</label>
            <input
              id="checkout-phone"
              className="form-input"
              type="tel"
              placeholder="(555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="checkout-items">
            {cart.items.map((item) => (
              <div className="checkout-item" key={item.inventory_id}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                    {item.card_name}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    {item.set_code} · {item.condition}
                    {item.finish === 'foil' && ' · ✦ Foil'}
                    {' · '}Qty: {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--border-radius)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
          }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary btn-lg btn-full"
          onClick={handlePlaceOrder}
          id="place-order-btn"
        >
          <CreditCard size={18} />
          Place Order (Simulated Payment)
        </button>
      </div>
    </div>
  );
}
