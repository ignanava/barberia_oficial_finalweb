export const services = [
  {
    "name": "Corte clásico",
    "description": "Corte clásico adaptado a tu estilo, con un acabado preciso.",
    "price": 50,
    "image": "https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?auto=format&fit=crop&w=900&q=85"
  },
  {
    "name": "Afeitado de barba",
    "description": "Afeitado profesional con un acabado limpio y cuidado de la piel.",
    "price": 35,
    "image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85"
  },
  {
    "name": "Perfilado de barba",
    "description": "Diseño, recorte y definición profesional de la barba.",
    "price": 40,
    "image": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85"
  },
  {
    "name": "Peinado",
    "description": "Estilizado profesional para eventos o para el día a día.",
    "price": 30,
    "image": "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=85"
  },
  {
    "name": "Tratamiento capilar",
    "description": "Hidratación y cuidado para cabello y cuero cabelludo.",
    "price": 60,
    "image": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=85"
  },
  {
    "name": "Servicio Alfa",
    "description": "Corte clásico, perfilado de barba, lavado y peinado en una sola sesión.",
    "price": 95,
    "image": "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=85"
  }
];

export const prices = [
  {
    "name": "Peinado",
    "description": "20 - 30 minutos",
    "duration": 30,
    "price": 30
  },
  {
    "name": "Corte clásico",
    "description": "30 - 40 minutos",
    "duration": 40,
    "price": 50
  },
  {
    "name": "Degradado / Fade",
    "duration": 50,
    "description": "40 - 50 minutos",
    "price": 60
  },
  {
    "name": "Afeitado de barba",
    "description": "20 - 30 minutos",
    "duration": 30,
    "price": 35
  },
  {
    "name": "Perfilado de barba",
    "description": "25 - 35 minutos",
    "duration": 35,
    "price": 40
  },
  {
    "name": "Tratamiento capilar",
    "description": "30 - 45 minutos",
    "duration": 45,
    "price": 60
  },
  {
    "name": "Servicio Alfa",
    "description": "Corte clásico + perfilado + lavado + peinado · 120 minutos",
    "duration": 120,
    "price": 95
  }
];

export const products = [
  {
    "name": "Pomada Matte Alfa",
    "description": "Fijación media y acabado mate.",
    "price": 75,
    "image": "/images/pomada.svg"
  },
  {
    "name": "Aceite para barba",
    "description": "Hidrata y suaviza la barba.",
    "price": 65,
    "image": "/images/aceite.svg"
  },
  {
    "name": "Shampoo fortalecedor",
    "description": "Limpieza y cuidado diario.",
    "price": 55,
    "image": "/images/shampoo.svg"
  },
  {
    "name": "Cera Strong Hold",
    "description": "Fijación fuerte para estilos definidos.",
    "price": 70,
    "image": "/images/cera.svg"
  }
];

export const bookingTimes = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

export const combos = [
  {
    id: 'corte-barba', name: 'Combo Corte & Barba', title: 'Corte & Barba',
    description: 'Un corte clásico y un perfilado para cuidar tu estilo de principio a fin.',
    includes: ['Corte clásico', 'Perfilado de barba'], price: 75, duration: 90,
    tag: 'EL ESENCIAL',
  },
  {
    id: 'fade-barba', name: 'Combo Fade & Barba', title: 'Fade & Barba',
    description: 'Degradado y líneas definidas para un acabado completo y preciso.',
    includes: ['Degradado / Fade', 'Perfilado de barba'], price: 90, duration: 90,
    tag: 'ESTILO DEFINIDO',
  },
  {
    id: 'corte-cuidado', name: 'Combo Corte & Cuidado', title: 'Corte & Cuidado',
    description: 'Renueva tu corte y acompáñalo con hidratación y cuidado capilar.',
    includes: ['Corte clásico', 'Tratamiento capilar'], price: 95, duration: 90,
    tag: 'CUIDADO CAPILAR',
  },
];

export const comboRegularPrice = (combo: typeof combos[number]) => combo.includes.reduce((sum, name) => sum + (prices.find(service => service.name === name)?.price ?? 0), 0);
export const bookingServices = [...prices, ...combos.map(combo => ({ name: combo.name, description: combo.includes.join(' + '), price: combo.price, duration: combo.duration }))];
export const serviceDuration = (name: string) => bookingServices.find(service => service.name === name)?.duration ?? 60;
