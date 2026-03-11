export const WALK_HISTORY = [
  { id: 'w1', date: '24 feb 2026', duration: '28 min', distance: '2.1 km', waste: 2, points: 40, shared: false },
  { id: 'w2', date: '22 feb 2026', duration: '35 min', distance: '2.8 km', waste: 1, points: 30, shared: true },
  { id: 'w3', date: '21 feb 2026', duration: '20 min', distance: '1.4 km', waste: 0, points: 10, shared: false },
  { id: 'w4', date: '18 feb 2026', duration: '42 min', distance: '3.2 km', waste: 3, points: 60, shared: true },
]

export const MOCK_FEED = [
  { id: 1, user: 'Catalina_Provi', avatar: 'https://i.pravatar.cc/80?u=cata', img: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600', caption: 'Mañana perfecta en Parque Bicentenario 🐾☀️ Da gusto ver el pasto limpio.', loc: 'Vitacura', time: 'hace 10 min', likes: 245, liked: false },
  { id: 2, user: 'Seba_Paseos', avatar: 'https://i.pravatar.cc/80?u=seba', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600', caption: '¡Récord semanal con Max! 12km este mes 💪 Igual recordad las bolsitas!', loc: 'Providencia', time: 'hace 1h', likes: 189, liked: false },
  { id: 3, user: 'Rocco_ñuñoa', avatar: 'https://i.pravatar.cc/80?u=rocco', img: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600', caption: 'Encontramos contenedor nuevo en plaza Egaña 🌱 ¡Buena vecindad!', loc: 'Ñuñoa', time: 'hace 3h', likes: 91, liked: false },
]

export const MOCK_LOST = [
  { id: 'l1', name: 'Theo', breed: 'Golden Retriever', color: 'Dorado', age: '3 años', zone: 'Las Condes', lastSeen: 'Av. Apoquindo 4500', date: '22 feb 2026', phone: '+56 9 8765 4321', reward: 'Sí', img: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', status: 'perdido' },
  { id: 'l2', name: 'Luna', breed: 'Border Collie', color: 'Blanco y negro', age: '5 años', zone: 'Ñuñoa', lastSeen: 'Parque Inés de Suárez', date: '23 feb 2026', phone: '+56 9 7654 3210', reward: 'No', img: 'https://images.unsplash.com/photo-1588022274522-2e3f0057c61f?w=400', status: 'perdido' },
  { id: 'l3', name: 'Coco', breed: 'Quiltro', color: 'Café', age: '2 años', zone: 'Providencia', lastSeen: 'Av. Irarrázaval 2300', date: '20 feb 2026', phone: '+56 9 6543 2109', reward: 'Sí', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400', status: 'encontrado' },
  { id: 'l4', name: 'Negra', breed: 'Mestiza', color: 'Negra con blanco', age: '4 años', zone: 'Recoleta', lastSeen: 'Plaza de Armas de Recoleta', date: '8 mar 2026', phone: '+56 9 5544 3322', reward: 'No', img: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400', status: 'avistamiento' },
]

export const MOCK_ADOPTION = [
  { id: 'a1', name: 'Pelusa', breed: 'Mestizo', age: '4 meses', sex: 'Hembra', desc: 'Cachorrita juguetona y cariñosa. Tiene vacunas y chip. Busca familia con jardín.', img: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400', org: 'Rescate Ñuñoa', status: 'disponible', phone: '+56988776655' },
  { id: 'a2', name: 'Bruno', breed: 'Labrador', age: '2 años', sex: 'Macho', desc: 'Perro tranquilo y entrenado. Convive con niños y gatos. Esterilizado.', img: 'https://images.unsplash.com/photo-1582456891925-a53280e17499?w=400', org: 'SOS Animal Chile', status: 'disponible', phone: '+56977665544' },
  { id: 'a3', name: 'Nala', breed: 'Pitbull Mestizo', age: '1 año', sex: 'Hembra', desc: 'Cariñosa y enérgica. Necesita dueño con experiencia. Totalmente vacunada.', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', org: 'Patitas Felices', status: 'reservado', phone: '+56966554433' },
  { id: 'a4', name: 'Rex', breed: 'Pastor Alemán', age: '5 años', sex: 'Macho', desc: 'Perro senior ideal para hogar tranquilo. Muy obediente y leal.', img: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', org: 'Rescate Santiago', status: 'disponible', phone: '+56955443322' },
]

export const MOCK_RANKING = [
  { rank: 1, user: 'Catalina_Provi', avatar: 'https://i.pravatar.cc/80?u=cata', points: 1840, walks: 42, waste: 98, zone: 'Vitacura' },
  { rank: 2, user: 'Seba_Paseos', avatar: 'https://i.pravatar.cc/80?u=seba', points: 1650, walks: 38, waste: 85, zone: 'Providencia' },
  { rank: 3, user: 'Rocco_ñuñoa', avatar: 'https://i.pravatar.cc/80?u=rocco', points: 1420, walks: 31, waste: 72, zone: 'Ñuñoa' },
  { rank: 4, user: 'PedroVetLife', avatar: 'https://i.pravatar.cc/80?u=pedro', points: 1200, walks: 27, waste: 61, zone: 'Las Condes' },
  { rank: 5, user: 'AnaPatitas', avatar: 'https://i.pravatar.cc/80?u=ana', points: 980, walks: 22, waste: 48, zone: 'Ñuñoa' },
  { rank: 6, user: 'JuanBici', avatar: 'https://i.pravatar.cc/80?u=juan', points: 870, walks: 19, waste: 41, zone: 'Recoleta' },
  { rank: 7, user: 'MaríaFeliz', avatar: 'https://i.pravatar.cc/80?u=maria', points: 740, walks: 16, waste: 34, zone: 'Providencia' },
]

export const MOCK_CONVS = [
  { id: 'cata', user: 'Catalina_Provi', photo: 'https://i.pravatar.cc/80?u=cata', lastMsg: '¡Sipo! Nos vemos en el canil a las 6.', time: '10:30', unread: 2, messages: [{ id: '1', from: 'me', text: 'Hola Cata, ¿vas a sacar a tu perro hoy?', ts: Date.now() - 100000 }, { id: '2', from: 'cata', text: '¡Hola! Sí, pensaba ir más tarde.', ts: Date.now() - 90000 }, { id: '3', from: 'cata', text: '¡Sipo! Nos vemos en el canil a las 6.', ts: Date.now() - 80000 }] },
  { id: 'seba', user: 'Seba_Paseos', photo: 'https://i.pravatar.cc/80?u=seba', lastMsg: 'Gracias por el dato de las bolsas 🙌', time: 'Ayer', unread: 0, messages: [{ id: '1', from: 'seba', text: 'Oye, ¿dónde compraste esas bolsas verdes?', ts: Date.now() - 86400000 }, { id: '2', from: 'me', text: 'En la tienda de Barrio Italia, tienen oferta.', ts: Date.now() - 86000000 }, { id: '3', from: 'seba', text: 'Gracias por el dato de las bolsas 🙌', ts: Date.now() - 85000000 }] },
]

export const MOCK_VET_ENTRIES = [
  { id: 1, date: '2026-02-10', type: 'Vacuna', title: 'Antirrábica + Polivalente', vet: 'Dra. Molina', notes: 'Todo OK. Próximo refuerzo en 12 meses.', icon: 'vaccines', color: 'bg-blue-100 text-blue-700', nextDue: '2027-02-10' },
  { id: 2, date: '2026-01-22', type: 'Control', title: 'Revisión general anual', vet: 'Dr. Herrera', notes: 'Peso: 28kg. Dientes limpios. Recomienda más actividad.', icon: 'monitor_heart', color: 'bg-green-100 text-green-700', nextDue: null },
  { id: 3, date: '2025-12-05', type: 'Desparasitación', title: 'Bravecto 20-40kg', vet: 'FarmaPets', notes: 'Efectivo por 3 meses.', icon: 'medication', color: 'bg-amber-100 text-amber-700', nextDue: '2026-03-05' },
]

export const MOCK_MARKET = {
  banner: { title: 'Consulta preventiva', subtitle: '30% dcto. para miembros Firulais', img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80', sponsor: 'Clínica VetLife' },
  cats: ['Todos', 'Veterinarias', 'Alimentos', 'Accesorios', 'Peluquería', 'Hoteles', 'Paseadores', 'Seguros'],
  items: [
    { id: 'm1', cat: 'Veterinarias', name: 'VetLife Clínica', desc: 'Atención 24/7 · Urgencias · Cirugía', price: 'Desde $12.000', priceTag: 'Consulta', sponsored: true, rating: 4.9, reviews: 312, img: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300', badge: 'Patrocinado', phone: '+56 2 2345 6789' },
    { id: 'm2', cat: 'Veterinarias', name: 'PetSalud Las Condes', desc: 'Especialistas · Dermatología · Oncología', price: 'Desde $18.000', priceTag: 'Consulta', sponsored: false, rating: 4.7, reviews: 198, img: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=300', phone: '+56 2 9876 5432' },
    { id: 'm3', cat: 'Alimentos', name: 'Royal Canin Medium Adult', desc: '15 kg · Alto en proteína · Digestion+', price: '$78.990', priceTag: 'Saco', sponsored: true, rating: 4.8, reviews: 540, img: 'https://images.unsplash.com/photo-1589924691106-073b69a59b8b?w=300', badge: 'Patrocinado', phone: '+56 9 4455 6677' },
    { id: 'm4', cat: 'Accesorios', name: 'Collar GPS PetTrack Pro', desc: 'Rastreo en tiempo real · 3 días batería', price: '$89.990', priceTag: 'Unidad', sponsored: true, rating: 4.5, reviews: 88, img: 'https://images.unsplash.com/photo-1601758175246-ac43fb8b6aed?w=300', badge: 'Nuevo', phone: '+56 9 2233 4455' },
    { id: 'm5', cat: 'Peluquería', name: 'CanineSpa Providencia', desc: 'Baño + corte + perfume · A domicilio', price: 'Desde $25.000', priceTag: 'Sesión', sponsored: false, rating: 4.9, reviews: 156, img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300', phone: '+56 9 1122 3344' },
    { id: 'm6', cat: 'Seguros', name: 'Seguro Mascota BICE', desc: 'Cobertura vet hasta $500.000/año', price: '$5.990/mes', priceTag: 'Plan básico', sponsored: true, rating: 4.4, reviews: 72, img: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=300', badge: 'Patrocinado', phone: '+56 2 600 222 3333' },
    { id: 'm7', cat: 'Hoteles', name: 'Hotel Patitas Felices', desc: 'Estadía con cuidado personalizado, paseos incluidos y reporte diario.', price: 'Desde $18.000/noche', priceTag: 'Por mascota', sponsored: false, rating: 4.8, reviews: 94, img: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300', phone: '+56 9 3344 5566' },
    { id: 'm8', cat: 'Paseadores', name: 'WalkDog Pro', desc: 'Paseadores certificados · GPS en tiempo real · Fotos del paseo', price: 'Desde $9.990/paseo', priceTag: '45 min', sponsored: false, rating: 4.7, reviews: 131, img: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=300', phone: '+56 9 5566 7788' },
  ],
}

export const ETOLOGY_TIPS = [
  { icon: '🐾', cat: 'Comportamiento', title: 'Lenguaje corporal', text: 'Cola alta y orejas adelante: alerta o dominio. Cola entre las patas: sumisión o miedo. Gruñido con pelo erizado: señal de advertencia clara.' },
  { icon: '🦷', cat: 'Alimentación',   title: 'Nutrición por etapa', text: 'Cachorros < 1 año: alimento de crecimiento con DHA. Adultos: 2 comidas/día. Seniors +7: bajo en fósforo. Siempre agua fresca disponible.' },
  { icon: '🏃', cat: 'Salud',          title: 'Ejercicio diario', text: 'Razas medianas: 45–60 min diarios. Border Collie/Husky: 2h+. Bulldogs: máx. 30 min. Adaptar al clima y edad de la mascota.' },
  { icon: '🧠', cat: 'Comportamiento', title: 'Estimulación mental', text: 'Kong relleno y puzzles de comida reducen la ansiedad y destructividad. El juego diario fortalece el vínculo y la obediencia.' },
  { icon: '💧', cat: 'Alimentación',   title: 'Hidratación', text: 'Un perro de 25kg necesita ~600ml/día. En verano y tras ejercicio puede triplicarse. Cambiar el agua al menos una vez al día.' },
  { icon: '🌡️', cat: 'Salud',          title: 'Señales de alerta', text: 'Vómitos > 2 veces, letargia, hinchazón abdominal o dificultad para respirar: ir al veterinario de inmediato.' },
  { icon: '✂️', cat: 'Salud',          title: 'Higiene y grooming', text: 'Cepillado frecuente reduce la caída de pelo. Limpieza de oídos mensual y corte de uñas cada 3–4 semanas según la raza.' },
  { icon: '🛌', cat: 'Comportamiento', title: 'Descanso', text: 'Los perros adultos duermen entre 12 y 14 horas. Los cachorros pueden dormir hasta 18h. Un espacio propio y tranquilo es fundamental.' },
  { icon: '🤝', cat: 'Comportamiento', title: 'Socialización', text: 'La ventana de socialización es de las 3 a las 14 semanas. Exposición positiva a personas, sonidos y entornos reduce miedos futuros.' },
  { icon: '🧴', cat: 'Salud',          title: 'Desparasitación', text: 'Desparasitación interna cada 3–6 meses. Externa mensual en zonas con pulgas o garrapatas. Consultar al veterinario según zona y hábitos.' },
  { icon: '🗑️', cat: 'Desechos y convivencia', title: 'Disposición de desechos', text: 'Recoger los desechos de tu mascota en la vía pública es un deber cívico y una obligación en la mayoría de las comunas. Usa bolsas y deposítalas en papeleros o contenedores habilitados.' },
  { icon: '🏘️', cat: 'Desechos y convivencia', title: 'Convivencia en el barrio', text: 'Mantener tu perro con correa en espacios públicos y evitar que moleste a vecinos son señales de tenencia responsable. Un perro bien socializado y controlado convive mejor con todos.' },
  { icon: '🏘️', cat: 'Convivencia responsable', title: 'Desechos en espacios públicos', text: 'Recoger los desechos de tu mascota es una obligación legal y un acto de respeto hacia el barrio. Usa bolsas biodegradables y deposítalas en contenedores. Nunca los dejes en veredas, plazas ni entradas de edificios.' },
  { icon: '🔇', cat: 'Convivencia responsable', title: 'Ladridos y ruido', text: 'Los ladridos excesivos afectan la convivencia vecinal. El adiestramiento básico y el ejercicio diario son las mejores herramientas. Si el problema persiste, consulta con un especialista en comportamiento animal.' },
  { icon: '🤝', cat: 'Convivencia responsable', title: 'Encuentros con vecinos sin mascotas', text: 'No todos los vecinos se sienten cómodos con mascotas. Mantén a tu mascota con correa en espacios comunes, pide permiso antes de acercarte, y respeta el espacio de quienes prefieren no interactuar.' },
]
