export default function ShoppingCartIcon({ className = '' }: { className?: string }) {
  return <svg className={`shopping-cart-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M2.5 3.5h2l2.3 11.2a2 2 0 0 0 2 1.6h9.1a2 2 0 0 0 1.9-1.5l1.7-7.3H5.4" />
    <path d="M9 11.5h8" />
    <circle cx="9" cy="20" r="1.25" />
    <circle cx="18" cy="20" r="1.25" />
  </svg>;
}
