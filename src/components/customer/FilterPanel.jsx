import { GAMES, CONDITIONS, FINISHES } from '../../utils/constants.js';

export default function FilterPanel({ filters, onFilterChange, onClear }) {
  const { game, condition, finish, priceMin, priceMax } = filters;

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ [key]: next });
  };

  const hasFilters = game?.length || condition?.length || finish?.length || priceMin || priceMax;

  return (
    <div className="filter-panel" id="filter-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700 }}>Filters</h3>
        {hasFilters && (
          <button className="filter-clear-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      {/* Game Filter */}
      <div className="filter-section">
        <h4>Game</h4>
        <div className="filter-chips">
          {GAMES.map((g) => (
            <button
              key={g.id}
              className={`filter-chip ${game?.includes(g.id) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('game', g.id)}
            >
              {g.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div className="filter-section">
        <h4>Condition</h4>
        <div className="filter-chips">
          {CONDITIONS.map((c) => (
            <button
              key={c.id}
              className={`filter-chip ${condition?.includes(c.id) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('condition', c.id)}
            >
              {c.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Finish Filter */}
      <div className="filter-section">
        <h4>Finish</h4>
        <div className="filter-chips">
          {FINISHES.map((f) => (
            <button
              key={f.id}
              className={`filter-chip ${finish?.includes(f.id) ? 'active' : ''}`}
              onClick={() => toggleArrayFilter('finish', f.id)}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
          <input
            type="number"
            className="form-input"
            placeholder="Min"
            value={priceMin || ''}
            onChange={(e) => onFilterChange({ priceMin: e.target.value ? Number(e.target.value) : null })}
            min="0"
            step="0.01"
            style={{ width: '100%' }}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>–</span>
          <input
            type="number"
            className="form-input"
            placeholder="Max"
            value={priceMax || ''}
            onChange={(e) => onFilterChange({ priceMax: e.target.value ? Number(e.target.value) : null })}
            min="0"
            step="0.01"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
