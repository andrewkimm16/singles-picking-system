import CardTile from './CardTile.jsx';
import { PackageOpen } from 'lucide-react';

export default function CardGrid({ items, onCardClick }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <PackageOpen size={36} />
        </div>
        <h3>No cards found</h3>
        <p>We couldn't find any cards matching your search. Try different keywords or clear your filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid" id="product-grid">
      {items.map((item) => (
        <CardTile key={item.id} item={item} onClick={() => onCardClick(item)} />
      ))}
    </div>
  );
}
