import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext.jsx';
import { Store, ArrowRight } from 'lucide-react';
import { ROLES } from '../utils/constants.js';

const AVATAR_COLORS = [
  'linear-gradient(135deg, #FEC5E5, #D0BFFF)',
  'linear-gradient(135deg, #A5D8FF, #D0BFFF)',
  'linear-gradient(135deg, #B2F2BB, #A5D8FF)',
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleDemoLogin = (account) => {
    login(account);
    navigate('/');
  };

  const handleCustomLogin = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    login({ name: name.trim(), email: email.trim(), role: ROLES.CUSTOMER });
    navigate('/');
  };

  return (
    <div className="login-page" id="login-page">
      <div className="login-card">
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <Store size={32} style={{ color: 'var(--color-accent-pink)', marginBottom: 'var(--spacing-sm)' }} />
        </div>
        <h1><span>New Kawaii</span> Vault</h1>
        <p>Sign in to access TCG Singles and Exclusive Drops</p>

        {/* Demo Accounts */}
        <div className="login-demo-accounts">
          {DEMO_ACCOUNTS.map((account, i) => (
            <button
              key={account.userId}
              className="login-demo-btn"
              onClick={() => handleDemoLogin(account)}
              id={`demo-login-${account.role}`}
            >
              <div className="login-demo-avatar" style={{ background: AVATAR_COLORS[i] }}>
                {account.name.charAt(0)}
              </div>
              <div className="login-demo-info">
                <div className="login-demo-name">{account.name}</div>
                <div className="login-demo-role">{account.role}</div>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          ))}
        </div>

        <div className="login-divider">or sign in with email</div>

        {/* Custom Login Form */}
        <form className="login-form" onSubmit={handleCustomLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-name">Name</label>
            <input
              id="login-name"
              className="form-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 'var(--spacing-sm)' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          In production, this will redirect to your Shopify store SSO
        </p>
      </div>
    </div>
  );
}
