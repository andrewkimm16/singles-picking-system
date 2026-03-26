import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar" id="search-bar">
      <Search size={18} className="search-bar-icon" />
      <input
        type="text"
        placeholder='Search for cards (e.g. Lightning Bolt, Pikachu…)'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id="search-input"
      />
    </div>
  );
}
