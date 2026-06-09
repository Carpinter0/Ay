import { PrismaClient, PlanTier, TipoProveedor } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Ay Amor database...')
  console.log('   Modelo: suscripción digital + fulfillment físico (Colombia)\n')

  // ─────────────────────────────────────────
  // PLANES — precios ajustados para regalo físico
  // Costo mínimo por envío: regalo (~$35k) + empaque (~$8k) + domicilio (~$10k) = ~$53k
  // Margen objetivo: 30–40% sobre precio de venta
  // ─────────────────────────────────────────
  const planes = [
    {
      id: PlanTier.GRATUITO,
      nombre: 'Gratis',
      tagline: 'Descubre Ay Amor',
      descripcion: 'Accede a contenido digital gratuito: mensajes, actividades y guías de amor.',
      precioCOP: 0,
      precioUSD: 0,
      stripePriceId: 'price_free',
      beneficios: [
        'Mensajes de amor personalizados',
        'Guías de actividades en pareja',
        'Acceso a la plataforma',
      ],
      entregasMensuales: 0,
      colorAccent: '#94a3b8',
      isActive: true,
      orden: 1,
    },
    {
      id: PlanTier.ROMANTICO,
      nombre: 'Romántico',
      tagline: 'Un detalle que lo dice todo',
      descripcion:
        '1 envío físico mensual curado por nuestro equipo. Flores, detalles o regalos sorpresa entregados en la puerta.',
      precioCOP: 89900,
      precioUSD: 22,
      stripePriceId: process.env.STRIPE_PRICE_ROMANTICO ?? 'price_romantico_test',
      beneficios: [
        '1 envío físico mensual',
        'Regalo curado según perfil de gustos',
        'Empaque con marca Ay Amor',
        'Tarjeta personalizada incluida',
        'Recordatorio de fechas especiales',
      ],
      entregasMensuales: 1,
      colorAccent: '#f43f5e',
      isActive: true,
      orden: 2,
    },
    {
      id: PlanTier.APASIONADO,
      nombre: 'Apasionado',
      tagline: 'Sorpréndela dos veces al mes',
      descripcion:
        '2 envíos físicos mensuales con regalos de mayor valor y curación premium.',
      precioCOP: 159900,
      precioUSD: 39,
      stripePriceId: process.env.STRIPE_PRICE_APASIONADO ?? 'price_apasionado_test',
      beneficios: [
        '2 envíos físicos al mes',
        'Regalos de mayor valor ($50k–$80k c/u)',
        'Empaque premium',
        'Flores o detalle especial garantizados',
        'Acceso anticipado a colecciones de temporada',
        'Soporte prioritario',
      ],
      entregasMensuales: 2,
      colorAccent: '#ec4899',
      isActive: true,
      orden: 3,
    },
    {
      id: PlanTier.ETERNO,
      nombre: 'Eterno',
      tagline: 'El amor que no para',
      descripcion:
        '4 envíos físicos al mes. La experiencia completa para quienes viven enamorados.',
      precioCOP: 289900,
      precioUSD: 71,
      stripePriceId: process.env.STRIPE_PRICE_ETERNO ?? 'price_eterno_test',
      beneficios: [
        '4 envíos físicos al mes',
        'Regalos premium curados ($60k–$120k c/u)',
        'Caja Ay Amor edición especial',
        'Sorpresas de temporada (San Valentín, Aniversarios, Navidad)',
        'Línea directa de atención',
        'Insignia de pareja eterna',
      ],
      entregasMensuales: 4,
      colorAccent: '#a855f7',
      isActive: true,
      orden: 4,
    },
  ]

  for (const plan of planes) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    })
    console.log(`  ✅ Plan ${plan.nombre} — $${plan.precioCOP.toLocaleString('es-CO')} COP`)
  }

  // ─────────────────────────────────────────
  // PROVEEDORES — aliados curados MVP (Bogotá)
  // ─────────────────────────────────────────
  console.log('\n  🏪 Creando proveedores de referencia...')

  const proveedores = [
    {
      nombre: 'Floristería Ejemplo Bogotá',
      tipo: TipoProveedor.FLORES,
      ciudad: 'Bogotá',
      contactoNombre: 'Por definir',
      contactoTel: '+57 300 000 0001',
      slaDias: 1,
      costoBase: 30000,
      notas: 'Reemplazar con proveedor real. SLA 1 día hábil en Bogotá.',
      isActive: false, // inactivo hasta confirmar aliado real
    },
    {
      nombre: 'Regalos & Detalles Ejemplo',
      tipo: TipoProveedor.REGALOS,
      ciudad: 'Bogotá',
      contactoNombre: 'Por definir',
      contactoTel: '+57 300 000 0002',
      slaDias: 2,
      costoBase: 25000,
      notas: 'Reemplazar con proveedor real. Regalos entre $30k–$80k.',
      isActive: false,
    },
    {
      nombre: 'Cuadros Personalizados Ejemplo',
      tipo: TipoProveedor.CUADROS,
      ciudad: 'Bogotá',
      contactoNombre: 'Por definir',
      contactoTel: '+57 300 000 0003',
      slaDias: 5,
      costoBase: 50000,
      notas: 'Reemplazar con proveedor real. Tiempo de producción 3–5 días.',
      isActive: false,
    },
  ]

  for (const proveedor of proveedores) {
    await prisma.proveedor.create({ data: proveedor })
    console.log(`  🏪 Proveedor "${proveedor.nombre}" (${proveedor.tipo}) — placeholder`)
  }

  // ─────────────────────────────────────────
  // SORPRESAS — catálogo inicial
  // Tipos físicos + digitales para todos los planes
  // ─────────────────────────────────────────
  console.log('\n  🎁 Creando catálogo de sorpresas...')

  // Limpiar sorpresas anteriores para evitar duplicados
  await prisma.sorpresa.deleteMany({})

  const sorpresas = [
    // ── GRATUITO ──────────────────────────
    {
      titulo: 'Carta de amor infinita',
      teaser: 'Palabras que llegan directo al corazón ❤️',
      descripcion: 'Una carta de amor personalizable con frases románticas para enviarle a tu pareja junto con el paquete mensual.',
      tipo: 'mensaje',
      contenido:
        'Mi amor,\n\nCada día a tu lado es un regalo que el universo me ha dado. Tu sonrisa es la primera cosa que quiero ver cada mañana y tu voz la última que quiero escuchar cada noche.\n\nTuyo/a para siempre. 💕',
      planMinimo: PlanTier.GRATUITO,
      etiquetas: ['amor', 'mensaje', 'carta'],
      temporada: 'todo_el_año',
      precioReferencia: null,
      isActive: true,
    },
    {
      titulo: 'Guía: Noche de estrellas en casa',
      teaser: 'Transforma tu habitación en un planetario 🌟',
      descripcion: 'Guía paso a paso para crear una noche romántica especial sin salir de casa.',
      tipo: 'actividad',
      contenido:
        '**Lo que necesitas:**\n- Luces LED o fairy lights\n- Proyector de estrellas (o app Star Walk)\n- Manta y cojines\n- Tu película favorita\n- Snacks y bebidas\n\n**Cómo:**\n1. Oscurece la habitación\n2. Instala las luces y proyector\n3. Prepara un nido en el suelo\n4. Desconecten los teléfonos 2 horas',
      planMinimo: PlanTier.GRATUITO,
      etiquetas: ['actividad', 'casa', 'noche'],
      temporada: 'todo_el_año',
      precioReferencia: null,
      isActive: true,
    },
    // ── ROMÁNTICO — entregas físicas ──────
    {
      titulo: 'Ramo de rosas rojas',
      teaser: 'El clásico que nunca falla 🌹',
      descripcion: 'Ramo de 12 rosas rojas frescas con follaje verde, entregado en empaque Ay Amor con tarjeta personalizada.',
      tipo: 'flores',
      contenido:
        '**Incluye:**\n- 12 rosas rojas frescas de temporada\n- Follaje y decoración floral\n- Empaque kraft con cinta Ay Amor\n- Tarjeta con tu mensaje personal\n\n**Cuidados:** Cortar tallos en diagonal y cambiar agua cada 2 días para mayor duración.',
      planMinimo: PlanTier.ROMANTICO,
      etiquetas: ['flores', 'rosas', 'clasico'],
      temporada: 'todo_el_año',
      precioReferencia: 45000,
      isActive: true,
    },
    {
      titulo: 'Caja de chocolates artesanales',
      teaser: 'Dulce como tu amor 🍫',
      descripcion: 'Selección de 12 chocolates artesanales colombianos en caja Ay Amor con tarjeta.',
      tipo: 'regalo_fisico',
      contenido:
        '**Incluye:**\n- 12 bombones artesanales sabores variados\n- Caja presentación Ay Amor\n- Tarjeta con mensaje personalizado\n\n**Sabores incluidos:** Maracuyá, café colombiano, arándanos, caramelo salado y más.',
      planMinimo: PlanTier.ROMANTICO,
      etiquetas: ['chocolates', 'dulces', 'artesanal'],
      temporada: 'todo_el_año',
      precioReferencia: 38000,
      isActive: true,
    },
    {
      titulo: 'Vela aromática + nota manuscrita',
      teaser: 'Una llama que representa lo nuestro 🕯️',
      descripcion: 'Vela de soya aromática artesanal (lavanda o vainilla) con nota escrita a mano.',
      tipo: 'regalo_fisico',
      contenido:
        '**Incluye:**\n- Vela de soya 200g (aprox. 40 horas de duración)\n- Aroma: lavanda, vainilla o cedro\n- Nota manuscrita con mensaje del subscriber\n- Empaque minimalista Ay Amor\n\n**Ritual sugerido:** Encender juntos la primera vez con música de fondo.',
      planMinimo: PlanTier.ROMANTICO,
      etiquetas: ['vela', 'aromaterapia', 'detalle'],
      temporada: 'todo_el_año',
      precioReferencia: 35000,
      isActive: true,
    },
    // ── APASIONADO ────────────────────────
    {
      titulo: 'Bouquet premium + peluche',
      teaser: 'Más que flores, una experiencia 💐',
      descripcion: 'Bouquet de 20 flores mixtas (rosas, lisianthus, girasoles) más peluche mediano con tarjeta.',
      tipo: 'flores',
      contenido:
        '**Incluye:**\n- Bouquet 20 flores mixtas de temporada\n- Peluche mediano (oso o corazón)\n- Caja Ay Amor edición premium\n- Tarjeta personalizada\n\n**Nota:** Las flores varían según disponibilidad de temporada para garantizar la mayor frescura.',
      planMinimo: PlanTier.APASIONADO,
      etiquetas: ['flores', 'bouquet', 'peluche', 'premium'],
      temporada: 'todo_el_año',
      precioReferencia: 75000,
      isActive: true,
    },
    {
      titulo: 'Cuadro personalizado 20x25',
      teaser: 'Su historia convertida en arte 🖼️',
      descripcion: 'Cuadro personalizado estilo minimalista con una foto de la pareja o frase elegida. Listo para colgar.',
      tipo: 'cuadro',
      contenido:
        '**Cómo funciona:**\n1. Al suscribirte, compartes una foto o frase en tu perfil\n2. Nuestro equipo diseña el cuadro en 3 días hábiles\n3. Llega enmarcado y listo para colgar\n\n**Especificaciones:**\n- Tamaño: 20x25 cm\n- Marco de madera natural o negro\n- Impresión en papel fotográfico premium',
      planMinimo: PlanTier.APASIONADO,
      etiquetas: ['cuadro', 'personalizado', 'arte', 'foto'],
      temporada: 'todo_el_año',
      precioReferencia: 65000,
      isActive: true,
    },
    // ── ETERNO ────────────────────────────
    {
      titulo: 'Caja Ay Amor — Edición San Valentín',
      teaser: 'La caja más especial del año 💝',
      descripcion: 'Caja curada edición San Valentín: rosas, chocolates artesanales, vela, carta y detalle sorpresa.',
      tipo: 'regalo_fisico',
      contenido:
        '**Contenido de la caja:**\n- 12 rosas rojas en ramo\n- 6 chocolates artesanales seleccionados\n- Vela aromática de rosas\n- Carta escrita a mano\n- 1 detalle sorpresa exclusivo\n- Caja Ay Amor edición San Valentín\n\n**Disponible:** Solo para plan Eterno y suscriptores activos en febrero.',
      planMinimo: PlanTier.ETERNO,
      etiquetas: ['san_valentin', 'caja', 'especial', 'premium'],
      temporada: 'san_valentin',
      precioReferencia: 120000,
      isActive: true,
    },
    {
      titulo: 'Caja aniversario personalizada',
      teaser: 'Celebra cada año como el primero 🥂',
      descripcion: 'Caja especial de aniversario: flores, vino espumante, chocolates y cuadro personalizado.',
      tipo: 'regalo_fisico',
      contenido:
        '**Contenido:**\n- Bouquet de flores de temporada\n- Botella de espumante o jugo de uva premium\n- Caja de 9 trufas artesanales\n- Cuadro mini personalizado con la fecha de aniversario\n- Carta Ay Amor edición aniversario\n\n**Activación:** Se activa automáticamente si registras tu fecha de aniversario en el perfil.',
      planMinimo: PlanTier.ETERNO,
      etiquetas: ['aniversario', 'caja', 'celebracion', 'especial'],
      temporada: 'aniversarios',
      precioReferencia: 110000,
      isActive: true,
    },
  ]

  for (const sorpresa of sorpresas) {
    await prisma.sorpresa.create({ data: sorpresa })
    const precio = sorpresa.precioReferencia
      ? `$${sorpresa.precioReferencia.toLocaleString('es-CO')} COP`
      : 'digital'
    console.log(`  🎁 "${sorpresa.titulo}" (${sorpresa.tipo}) — ${precio}`)
  }

  console.log('\n✨ Seed completado exitosamente!')
  console.log('─────────────────────────────────────')
  console.log('  Planes:       4 (con precios físicos reales)')
  console.log('  Proveedores:  3 (placeholders — reemplazar con aliados reales)')
  console.log('  Sorpresas:    9 (5 físicas + 4 digitales)')
  console.log('─────────────────────────────────────')
  console.log('  ⚠️  Activar proveedores cuando confirmes aliados reales:')
  console.log('      UPDATE proveedores SET is_active = true WHERE nombre = \'...\';')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
