import { formatPrice } from '../../utils/formatters.js';
import { Sparkles } from 'lucide-react';

export default function CardTile({ item, onClick }) {
  const isLowStock = item.quantity_available <= 2 && item.quantity_available > 0;
  const isOutOfStock = item.quantity_available === 0;

  return (
    <div
      className="product-tile"
      onClick={onClick}
      id={`card-tile-${item.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="product-tile-image">
        <div className="product-tile-image-label">
          {item.finish === 'foil' && <Sparkles size={14} style={{ marginBottom: 4, color: 'var(--color-accent-purple)' }} />}
          {item.card_name}
        </div>
        <span className={`product-tile-game-badge ${item.game.toLowerCase()}`}>
          {item.game}
        </span>
      </div>

      <div className="product-tile-info">
        <div className="product-tile-name">{item.card_name}</div>
        <div className="product-tile-meta">
          <span>{item.set_code}</span>
          <span>·</span>
          <span>{item.condition}</span>
          {item.finish === 'foil' && (
            <>
              <span>·</span>
              <span style={{ color: 'var(--color-accent-purple)' }}>✦ Foil</span>
            </>
          )}
        </div>
        <div className="product-tile-bottom">
          <span className="product-tile-price">{formatPrice(item.price)}</span>
          {isOutOfStock ? (
            <span className="product-tile-qty" style={{ color: 'var(--color-error)', fontWeight: 700 }}>
              Out of stock
            </span>
          ) : isLowStock ? (
            <span className="product-tile-qty low">
              Only {item.quantity_available} left
            </span>
          ) : (
            <span className="product-tile-qty">
              {item.quantity_available} available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
