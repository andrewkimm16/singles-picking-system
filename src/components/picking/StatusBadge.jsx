import { STATUS_INFO } from '../../utils/constants.js';

export default function StatusBadge({ status }) {
  const info = STATUS_INFO[status] || { label: status, color: '#E8E8E8' };

  return (
    <span
      className="status-badge"
      style={{
        background: `${info.color}33`,
        color: info.color === '#B2F2BB' ? '#2b8a3e' :
               info.color === '#A5D8FF' ? '#1971c2' :
               info.color === '#FEC5E5' ? '#c2255c' :
               info.color === '#D0BFFF' ? '#6741d9' :
               info.color === '#FFD8A8' ? '#e67700' :
               info.color === '#FFC9C9' ? '#e03131' : '#555',
        borderLeft: `3px solid ${info.color}`,
      }}
    >
      {info.label}
    </span>
  );
}
