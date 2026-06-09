import { PrismaClient, PlanTier } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Ay Amor database...')

  // Upsert planes
  const planes = [
    {
      id: PlanTier.GRATUITO,
      nombre: 'Gratuito',
      tagline: 'Prueba el amor sin compromiso',
      descripcion: 'Acceso a sorpresas básicas para que conozcas la plataforma.',
      precioCOP: 0,
      precioUSD: 0,
      stripePriceId: 'price_free',
      beneficios: ['1 sorpresa mensual', 'Mensajes de amor', 'Acceso básico'],
      sorpresasMensuales: 1,
      colorAccent: '#94a3b8',
      isActive: true,
      orden: 1,
    },
    {
      id: PlanTier.ROMANTICO,
      nombre: 'Romántico',
      tagline: 'Para los que creen en el amor',
      descripcion: 'El plan ideal para comenzar a sorprender a tu pareja cada mes.',
      precioCOP: 39900,
      precioUSD: 10,
      stripePriceId: process.env.STRIPE_PRICE_ROMANTICO ?? 'price_romantico_test',
      beneficios: [
        '3 sorpresas mensuales',
        'Mensajes personalizados',
        'Actividades en pareja',
        'Recordatorios de fechas especiales',
      ],
      sorpresasMensuales: 3,
      colorAccent: '#f43f5e',
      isActive: true,
      orden: 2,
    },
    {
      id: PlanTier.APASIONADO,
      nombre: 'Apasionado',
      tagline: 'Ama con intensidad',
      descripcion: 'Más sorpresas, más magia y experiencias exclusivas cada mes.',
      precioCOP: 79900,
      precioUSD: 20,
      stripePriceId: process.env.STRIPE_PRICE_APASIONADO ?? 'price_apasionado_test',
      beneficios: [
        '6 sorpresas mensuales',
        'Retos de pareja exclusivos',
        'Playlists románticas curadas',
        'Contenido digital premium',
        'Prioridad en nuevos lanzamientos',
      ],
      sorpresasMensuales: 6,
      colorAccent: '#ec4899',
      isActive: true,
      orden: 3,
    },
    {
      id: PlanTier.ETERNO,
      nombre: 'Eterno',
      tagline: 'El amor no tiene límites',
      descripcion: 'La experiencia completa. Sorpresas ilimitadas y acceso total.',
      precioCOP: 129900,
      precioUSD: 32,
      stripePriceId: process.env.STRIPE_PRICE_ETERNO ?? 'price_eterno_test',
      beneficios: [
        'Sorpresas ilimitadas',
        'Acceso anticipado a nuevas sorpresas',
        'Sorpresas de temporada (San Valentín, Navidad, Aniversarios)',
        'Soporte prioritario',
        'Insignia de pareja eterna',
      ],
      sorpresasMensuales: 999,
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
    console.log(`  ✅ Plan ${plan.nombre} creado/actualizado`)
  }

  // Seed sorpresas de ejemplo
  const sorpresas = [
    {
      titulo: 'Carta de amor infinita',
      teaser: 'Palabras que llegan directo al corazón ❤️',
      descripcion: 'Una carta de amor personalizable con frases románticas para enviarle a tu pareja.',
      tipo: 'mensaje',
      contenido: 'Mi amor,\n\nCada día a tu lado es un regalo que el universo me ha dado. Tu sonrisa es la primera cosa que quiero ver cada mañana y tu voz la última que quiero escuchar cada noche.\n\nNo existe distancia ni tiempo que pueda apagar lo que siento por ti.\n\nTuyo/a para siempre. 💕',
      planMinimo: PlanTier.GRATUITO,
      etiquetas: ['amor', 'mensaje', 'romantico'],
      temporada: 'todo_el_año',
      isActive: true,
    },
    {
      titulo: 'Noche de estrellas en casa',
      teaser: 'Crea una galaxia de amor en tu habitación 🌟',
      descripcion: 'Guía paso a paso para transformar tu habitación en un planetario romántico usando solo materiales caseros.',
      tipo: 'actividad',
      contenido: '**Lo que necesitas:**\n- Luces LED o fairy lights\n- Proyector de estrellas (o la app Star Walk)\n- Manta y cojines en el suelo\n- Tu película favorita en pareja\n- Snacks y bebidas\n\n**Cómo hacerlo:**\n1. Oscurece completamente la habitación\n2. Coloca las luces de manera creativa\n3. Prepara un nido acogedor en el suelo\n4. Elige una película que los dos amen\n5. Desconecten los teléfonos por 2 horas\n\n✨ Tiempo estimado: 2-3 horas de pura magia.',
      planMinimo: PlanTier.GRATUITO,
      etiquetas: ['actividad', 'casa', 'romantico', 'peliculas'],
      temporada: 'todo_el_año',
      isActive: true,
    },
    {
      titulo: 'Playlist: Canciones que nos definen',
      teaser: 'Una selección musical hecha para los dos 🎵',
      descripcion: 'Curar juntos una playlist con las canciones que marcan su historia es uno de los regalos más íntimos.',
      tipo: 'playlist',
      contenido: '**Tu misión:**\nCrea una playlist en Spotify o YouTube Music con estas categorías:\n\n🎵 **La canción de su primer encuentro**\n🎵 **La que suena cuando se abrazan**\n🎵 **La que canta uno de los dos en la ducha**\n🎵 **La que pusieron en su primera cita**\n🎵 **La que los hace llorar juntos**\n🎵 **Su himno como pareja**\n\nCompártela con tu pareja con una nota que diga por qué elegiste cada canción.',
      planMinimo: PlanTier.ROMANTICO,
      etiquetas: ['musica', 'playlist', 'regalo_digital'],
      temporada: 'todo_el_año',
      isActive: true,
    },
    {
      titulo: 'Reto 7 días de amor',
      teaser: 'Un reto diferente cada día durante una semana 💝',
      descripcion: 'Siete días, siete acciones de amor concretas para fortalecer su conexión.',
      tipo: 'reto_pareja',
      contenido: '**Día 1 - Palabras:** Escríbele 10 cosas que amas de él/ella\n**Día 2 - Toque:** Dales un masaje de espalda de 15 minutos sin pedir nada a cambio\n**Día 3 - Tiempo:** Cocinen juntos una receta nueva\n**Día 4 - Recuerdo:** Compartan 3 fotos favoritas de ustedes y cuenten la historia detrás\n**Día 5 - Desafío:** Aprendan juntos 10 frases en un idioma nuevo\n**Día 6 - Sorpresa:** Deja una nota escrita a mano donde saben que la va a encontrar\n**Día 7 - Celebración:** Tengan una cita en casa: vino/jugo, música y baile sin vergüenza\n\n🏆 Al final del reto: tómense una foto juntos y guárdenla.',
      planMinimo: PlanTier.ROMANTICO,
      etiquetas: ['reto', 'actividad', 'conexion', 'semana'],
      temporada: 'todo_el_año',
      isActive: true,
    },
    {
      titulo: 'Carta al futuro: Sus promesas en 1 año',
      teaser: 'Escriban juntos una carta que abrirán en un año 📬',
      descripcion: 'Un ejercicio íntimo y poderoso: escribir promesas, sueños y compromisos para leer juntos en el futuro.',
      tipo: 'regalo_digital',
      contenido: '**Instrucciones:**\n\n1. Cada uno escribe por separado durante 20 minutos respondiendo:\n   - ¿Qué quiero que sepas de mí que aún no sabes?\n   - ¿Cuál es mi sueño más grande para nosotros en 1 año?\n   - ¿Qué promesa quiero hacerte hoy?\n   - ¿Qué es lo que más valoro de nuestra relación?\n\n2. Guarden las cartas selladas con la fecha en que las deben abrir\n\n3. Pongan en su calendario la fecha de apertura\n\n4. Cuando llegue el día: ábrelas juntos con champán/jugo y celebren cuánto han crecido\n\n💌 Opción digital: usen futureme.email para enviársela por correo en la fecha que elijan.',
      planMinimo: PlanTier.APASIONADO,
      etiquetas: ['reflexion', 'futuro', 'promesas', 'especial'],
      temporada: 'aniversarios',
      isActive: true,
    },
    {
      titulo: 'San Valentín: La experiencia completa',
      teaser: 'Todo lo que necesitas para el día más romántico del año 🌹',
      descripcion: 'Guía definitiva para vivir un San Valentín memorable sin salir de casa.',
      tipo: 'actividad',
      contenido: '**La experiencia en 5 actos:**\n\n🌅 **Mañana:** Despertarlos con desayuno en cama. Receta: french toast con fresas y miel.\n\n🌸 **Tarde:** Spa en casa. Mascarillas, música relajante, hidratación. Turno para cada uno.\n\n🎁 **La sorpresa:** Prepara un sobre con 10 vales de experiencias (un deseo cumplido, una cena especial, un día de aventura...).\n\n🕯️ **Noche:** Cena romántica. Apaga las luces, pon velas, cocinen juntos algo sencillo pero especial.\n\n💃 **Cierre:** Bailen juntos su canción. Sin teléfonos. Solo ustedes dos.',
      planMinimo: PlanTier.ETERNO,
      etiquetas: ['san_valentin', 'especial', 'guia_completa'],
      temporada: 'san_valentin',
      isActive: true,
    },
  ]

  for (const sorpresa of sorpresas) {
    await prisma.sorpresa.create({ data: sorpresa })
    console.log(`  🎁 Sorpresa "${sorpresa.titulo}" creada`)
  }

  console.log('\n✨ Seed completado exitosamente!')
  console.log('   Planes creados: 4 (GRATUITO, ROMANTICO, APASIONADO, ETERNO)')
  console.log('   Sorpresas creadas: 6')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
