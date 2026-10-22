import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { prices, products, services } from '../../data/catalog';
import { cartCount, cartRepository, cartTotal } from '../../repositories/cartRepository';
import { useCart } from '../../hooks/useCart';
import SectionHeading from './SectionHeading';
import CombosSection from './CombosSection';

function ProductCard({ product, onAdd }: { product: typeof products[number]; onAdd: (name: string) => boolean }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function add() {
    if (!onAdd(product.name)) return;
    setAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 900);
  }
  return <article className="product-card">
    <img src={product.image} alt={product.name} loading="lazy" />
    <div className="product-info"><h3>{product.name}</h3><p>{product.description}</p>
      <div className="product-bottom"><strong>Bs {product.price}</strong><button className="product-btn" type="button" onClick={add} aria-label={`Agregar ${product.name}`}><span aria-live="polite">{added ? 'Agregado ✓' : 'Agregar'}</span></button></div>
    </div>
  </article>;
}

export default function CatalogSections({ onSelectService }: { onSelectService: (service: string) => void }) {
  const cart = useCart();
  const [error, setError] = useState('');
  function add(name: string) {
    try { cartRepository.add(name); setError(''); return true; }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar el carrito.'); return false; }
  }
  return <>
    <section className="section" id="servicios"><div className="container">
      <SectionHeading kicker="NUESTRO TRABAJO" title="Servicios que brindamos" description="Elige el servicio que mejor se adapte a tu estilo." />
      <div className="section-shortcuts"><a href="#precios">Ver todos los precios</a><a href="#preguntas">Preguntas frecuentes</a></div>
      <div className="services-grid">{services.map(service => <article className="service-card" key={service.name}>
        <img src={service.image} alt={service.name} loading="lazy" /><div className="service-body"><h3>{service.name}</h3><p>{service.description}</p><div className="service-actions"><strong>Bs {service.price}</strong><button className="btn btn-small" type="button" onClick={() => onSelectService(service.name)} aria-label={`Reservar ${service.name}`}>Reservar</button></div></div>
      </article>)}</div>
    </div></section>
    <section className="prices-section" id="precios"><div className="container">
      <SectionHeading kicker="PRECIOS CLAROS" title="Precios y servicios" description="Conoce nuestros precios antes de realizar tu reserva." light />
      <div className="price-list">{prices.map(price => <div className={`price-row${price.name === 'Servicio Alfa' ? ' featured' : ''}`} key={price.name}><div><h3>{price.name}</h3><p>{price.description}</p></div><div className="price-actions"><strong>Bs {price.price}</strong><button type="button" className="text-button" onClick={() => onSelectService(price.name)} aria-label={`Reservar ${price.name} por Bs ${price.price}`}>Reservar →</button></div></div>)}</div>
    </div></section>
    <CombosSection onSelect={onSelectService} />
    <section className="section products-section" id="productos"><div className="container">
      <SectionHeading kicker="TIENDA MACHO ALFA" title="Productos" description="Productos para mantener tu cabello y barba con el mejor aspecto." />
      <div className="products-grid">{products.map(product => <ProductCard key={product.name} product={product} onAdd={add} />)}</div>
      <div className="cart-box"><div aria-live="polite"><small>TU CARRITO</small><strong>{cartCount(cart)} {cartCount(cart) === 1 ? 'unidad' : 'unidades'} · Bs {cartTotal(cart)}</strong></div><p>Recoge y paga en la barbería.</p><Link className="btn btn-small" to="/carrito">Ver carrito →</Link></div>
      {error && <p className="lookup-error" role="alert">{error}</p>}
    </div></section>
  </>;
}
