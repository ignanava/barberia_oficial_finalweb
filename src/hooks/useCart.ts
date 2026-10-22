import { useEffect, useState } from 'react';
import { CART_EVENT, cartRepository } from '../repositories/cartRepository';

export function useCart() {
  const [cart, setCart] = useState(cartRepository.list);
  useEffect(() => {
    const sync = () => setCart(cartRepository.list());
    window.addEventListener('storage', sync);
    window.addEventListener(CART_EVENT, sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener(CART_EVENT, sync);
    };
  }, []);
  return cart;
}
