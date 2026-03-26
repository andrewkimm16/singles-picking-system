export default function Footer() {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} <strong>New Kawaii</strong> — Singles Shopping System
        <br />
        <span style={{ fontSize: '0.75rem' }}>
          Payment integration coming soon (Shopify)
        </span>
      </p>
    </footer>
  );
}
