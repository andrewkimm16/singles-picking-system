import { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext.jsx';
import { createSearchEngine, searchItems } from '../data/searchEngine.js';
import SearchBar from '../components/customer/SearchBar.jsx';
import FilterPanel from '../components/customer/FilterPanel.jsx';
import CardGrid from '../components/customer/CardGrid.jsx';
import CardDetailModal from '../components/customer/CardDetailModal.jsx';

const DEFAULT_FILTERS = {
  game: [],
  condition: [],
  finish: [],
  priceMin: null,
  priceMax: null,
};

export default function ShopPage() {
  const { items } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedCard, setSelectedCard] = useState(null);

  // Build search engine from inventory
  const fuse = useMemo(() => createSearchEngine(items), [items]);

  // Apply search + filters
  const filteredItems = useMemo(() => {
    // Start with search results or all items
    let result = searchItems(fuse, searchQuery) || items;

    // Apply filters
    if (filters.game?.length) {
      result = result.filter((i) => filters.game.includes(i.game));
    }
    if (filters.condition?.length) {
      result = result.filter((i) => filters.condition.includes(i.condition));
    }
    if (filters.finish?.length) {
      result = result.filter((i) => filters.finish.includes(i.finish));
    }
    if (filters.priceMin != null) {
      result = result.filter((i) => i.price >= filters.priceMin);
    }
    if (filters.priceMax != null) {
      result = result.filter((i) => i.price <= filters.priceMax);
    }

    return result;
  }, [items, fuse, searchQuery, filters]);

  const handleFilterChange = (updates) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const resultCountText = searchQuery
    ? `${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${searchQuery}"`
    : `${filteredItems.length} card${filteredItems.length !== 1 ? 's' : ''}`;

  return (
    <div className="page-wrapper" id="shop-page">
      <div className="page-header">
        <h1>Find your next favorite card</h1>
        <p>Browse our collection of MTG and Pokémon singles</p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="page-split">
        <aside className="page-sidebar">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </aside>

        <main className="page-content">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-md)',
          }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {resultCountText}
            </span>
          </div>

          <CardGrid items={filteredItems} onCardClick={setSelectedCard} />
        </main>
      </div>

      {selectedCard && (
        <CardDetailModal item={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}
