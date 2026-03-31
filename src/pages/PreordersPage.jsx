import { Link } from 'react-router-dom';
import { Calendar, Package, Clock } from 'lucide-react';
import { usePreorders } from '../context/PreorderContext.jsx';
import { PREORDER_STATUSES } from '../utils/constants.js';

export default function PreordersPage() {
  const { preorders } = usePreorders();

  const live = preorders.filter(p => p.status === PREORDER_STATUSES.LIVE);
  const upcoming = preorders.filter(p => p.status === PREORDER_STATUSES.UPCOMING);
  const past = preorders.filter(p => [PREORDER_STATUSES.SOLD_OUT, PREORDER_STATUSES.CLOSED].includes(p.status));

  const DropCard = ({ event }) => {
    const isLive = event.status === PREORDER_STATUSES.LIVE;
    const isUpcoming = event.status === PREORDER_STATUSES.UPCOMING;
    
    return (
      <Link to={`/preorders/${event.id}`} className="card product-tile" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
        <div className="product-tile-image" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))' }}>
          {isLive && (
            <span className="product-tile-game-badge" style={{ background: 'var(--color-error)', color: 'white', letterSpacing: '0.1em' }}>
              LIVE NOW
            </span>
          )}
          {isUpcoming && <span className="product-tile-game-badge" style={{ background: 'var(--color-accent-pink)' }}>UPCOMING</span>}
          {event.status === PREORDER_STATUSES.SOLD_OUT && <span className="product-tile-game-badge" style={{ background: 'var(--color-text-muted)', color: 'white' }}>SOLD OUT</span>}
          
          <div className="product-tile-image-label" style={{ color: 'white', fontSize: 'var(--font-size-md)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {event.title}
          </div>
        </div>
        
        <div className="product-tile-info">
          <h3 className="product-tile-name">{event.title}</h3>
          
          <div className="product-tile-meta" style={{ flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <span>
              <Calendar size={12} style={{ marginRight: 4 }} />
              Opens: {new Date(event.start_time).toLocaleString()}
            </span>
            <span>
              <Package size={12} style={{ marginRight: 4 }} />
              Limit {event.max_per_user} per person
            </span>
            <span>
              <Clock size={12} style={{ marginRight: 4 }} />
              {event.claim_window_minutes} Min Claim Window
            </span>
          </div>

          <div className="product-tile-bottom" style={{ marginTop: 'auto' }}>
            <span className="product-tile-price">${event.price.toFixed(2)}</span>
            
            {isLive && (
              <span style={{ fontWeight: 800, color: 'var(--color-error)' }}>Join Queue &rarr;</span>
            )}
            {isUpcoming && (
              <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>Details &rarr;</span>
            )}
            {event.status === PREORDER_STATUSES.SOLD_OUT && (
              <span style={{ fontWeight: 700, color: 'var(--color-text-muted)' }}>View Drop</span>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="page-wrapper" id="preorders-page">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--spacing-3xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>Special Drops & Preorders</h1>
        <p>Join the digital queue. Secure your loot. No bots allowed.</p>
      </div>

      {live.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', color: 'var(--color-error)' }}>
            <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: 'var(--color-error)', animation: 'pulse 2s infinite' }} />
            Live Drops
          </h2>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {live.map((p) => <DropCard key={p.id} event={p} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h2>Upcoming Drops</h2>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {upcoming.map((p) => <DropCard key={p.id} event={p} />)}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 style={{ color: 'var(--color-text-muted)' }}>Past Drops</h2>
          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', opacity: 0.7 }}>
            {past.map((p) => <DropCard key={p.id} event={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
