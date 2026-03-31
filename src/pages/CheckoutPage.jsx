import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useOrders } from '../context/OrderContext.jsx';
import { useInventory } from '../context/InventoryContext.jsx';
import { usePreorders } from '../context/PreorderContext.jsx';
import { useQueue } from '../context/QueueContext.jsx';
import { formatPrice } from '../utils/formatters.js';
import { QUEUE_STATUSES } from '../utils/constants.js';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { decrementQuantity, getItemById } = useInventory();
  
  // Preorder specific contexts
  const [searchParams] = useSearchParams();
  const preorderId = searchParams.get('preorder');
  const { getPreorderById, decrementStock } = usePreorders();
  const { getUserEntry, markCheckedOut } = useQueue();

  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [error, setError] = useState('');

  // Setup data sources based on checkout mode (Single vs Preorder)
  const isPreorderMode = !!preorderId;
  const preorderEvent = isPreorderMode ? getPreorderById(preorderId) : null;
  const queueEntry = isPreorderMode ? getUserEntry(preorderId) : null;

  const checkoutItems = isPreorderMode && preorderEvent ? [{
    inventory_id: `preorder-${preorderEvent.id}`,
    card_name: preorderEvent.title,
    set_code: 'PREORDER',
    condition: 'FNM',
    finish: 'Standard',
    quantity: 1, // hardcoded for prototype simplicity, could be dynamic
    price: preorderEvent.price
  }] : cart.items;

  const checkoutTotal = isPreorderMode && preorderEvent ? preorderEvent.price : cartTotal;

  // Enforce cart / claim rules
  useEffect(() => {
    if (confirmedOrder) return;
    
    if (!isPreorderMode && cart.items.length === 0) {
      navigate('/');
    }
    
    if (isPreorderMode) {
      if (!preorderEvent || !queueEntry || queueEntry.status !== QUEUE_STATUSES.ACTIVE_CLAIM) {
        navigate(`/preorders/${preorderId}`);
      }
    }
  }, [cart.items.length, isPreorderMode, preorderEvent, queueEntry, preorderId, navigate, confirmedOrder]);

  if (confirmedOrder) {
    return (
      <div className="page-wrapper">
        <div className="confirmation" id="order-confirmation">
          <div className="confirmation-icon">
            <CheckCircle size={40} />
          </div>
          <h1>Order Placed!</h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Thanks, {confirmedOrder.customer_name}! Your order is confirmed.
            You'll hear from us with further updates.
          </p>
          <div className="confirmation-order-id">
            {confirmedOrder.order_id}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', marginTop: 'var(--spacing-lg)' }}>
            <Link to={isPreorderMode ? "/preorders" : "/"} className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isPreorderMode && cart.items.length === 0) return null;
  if (isPreorderMode && (!preorderEvent || !queueEntry)) return null;

  const handlePlaceOrder = () => {
    setError('');
    
    if (isPreorderMode) {
      // PREORDER CHECKOUT
      if (queueEntry.status !== QUEUE_STATUSES.ACTIVE_CLAIM || Date.now() > queueEntry.claim_expires_at) {
        setError('Your claim window has expired. Please rejoin the queue.');
        return;
      }
      if (preorderEvent.total_stock < 1) {
        setError('Sorry, this preorder event just sold out.');
        return;
      }
      
      const order = createOrder(user.userId, user.name, user.email, phone || null, checkoutItems);
      decrementStock(preorderEvent.id, 1);
      markCheckedOut(preorderEvent.id);
      setConfirmedOrder(order);

    } else {
      // SINGLES CHECKOUT
      for (const item of cart.items) {
        const invItem = getItemById(item.inventory_id);
        if (!invItem || invItem.quantity_available < item.quantity) {
          setError(`Sorry, ${item.card_name} only has ${invItem?.quantity_available || 0} left in stock. Please update your cart.`);
          return;
        }
      }

      const order = createOrder(user.userId, user.name, user.email, phone || null, checkoutItems);
      cart.items.forEach((item) => {
        decrementQuantity(item.inventory_id, item.quantity);
      });
      clearCart();
      setConfirmedOrder(order);
    }
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
          <h1>Checkout {isPreorderMode ? '(Drop Claim)' : ''}</h1>
        </div>

        {isPreorderMode && (
          <div className="checkout-mock-notice" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }}>
            <Info size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            Your claim is active! Complete checkout before the timer expires.
          </div>
        )}

        <div className="checkout-mock-notice" style={{ marginTop: isPreorderMode ? 'var(--spacing-md)' : 0 }}>
          <Info size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Payment integration coming soon (Shopify). Orders are simulated as paid for now.
        </div>

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

        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="checkout-items">
            {checkoutItems.map((item) => (
              <div className="checkout-item" key={item.inventory_id}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                    {item.card_name}
                  </div>
                  {!isPreorderMode && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      {item.set_code} · {item.condition}
                      {item.finish === 'foil' && ' · ✦ Foil'}
                      {' · '}Qty: {item.quantity}
                    </div>
                  )}
                  {isPreorderMode && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Preorder Drop Edition
                      {' · '}Qty: {item.quantity}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <span>{formatPrice(checkoutTotal)}</span>
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
