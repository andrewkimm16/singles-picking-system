import { useState } from 'react';
import { X, Minus, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { formatPrice } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.jsx';

export default function CardDetailModal({ item, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!item) return null;

  const maxQty = item.quantity_available;
  const isOutOfStock = maxQty === 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    addToCart(item, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="card-detail-modal">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{item.card_name}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Card Image Placeholder */}
          <div style={{
            aspectRatio: '5/7',
            maxHeight: 280,
            borderRadius: 'var(--border-radius)',
            background: 'linear-gradient(135deg, var(--color-accent-blue-subtle), var(--color-accent-purple-subtle), var(--color-accent-pink-subtle))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-lg)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 700,
            color: 'var(--color-text-secondary)',
            margin: '0 auto var(--spacing-lg)',
            width: 200,
          }}>
            {item.finish === 'foil' && <Sparkles size={18} style={{ marginRight: 6 }} />}
            {item.card_name}
          </div>

          {/* Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Game</div>
              <div style={{ fontWeight: 600 }}>{item.game === 'MTG' ? 'Magic: The Gathering' : 'Pokémon'}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Set</div>
              <div style={{ fontWeight: 600 }}>{item.set_code}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Condition</div>
              <div style={{ fontWeight: 600 }}>
                {item.condition === 'NM' && 'Near Mint'}
                {item.condition === 'LP' && 'Lightly Played'}
                {item.condition === 'MP' && 'Moderately Played'}
                {item.condition === 'HP' && 'Heavily Played'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Finish</div>
              <div style={{ fontWeight: 600 }}>
                {item.finish === 'foil' ? '✦ Foil' : 'Non-Foil'}
              </div>
            </div>
            {item.collector_number && (
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Collector #</div>
                <div style={{ fontWeight: 600 }}>{item.collector_number}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Available</div>
              <div style={{ fontWeight: 600, color: isOutOfStock ? 'var(--color-error)' : undefined }}>
                {isOutOfStock ? 'Out of stock' : `${item.quantity_available} available`}
              </div>
            </div>
          </div>

          {/* Price */}
          <div style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 800,
            marginBottom: 'var(--spacing-lg)',
          }}>
            {formatPrice(item.price)}
          </div>

          {/* Quantity + Add to Cart */}
          {!isOutOfStock && (
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
              <div className="cart-item-qty-controls" style={{ height: 44 }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{ width: 36, height: '100%' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ minWidth: 32 }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  disabled={quantity >= maxQty}
                  style={{ width: 36, height: '100%' }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-lg`}
                style={{ flex: 1 }}
                onClick={handleAdd}
              >
                <ShoppingCart size={18} />
                {added ? 'Added to cart ✓' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
