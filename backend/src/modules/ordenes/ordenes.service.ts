import { PrismaClient, EstadoOrden } from '@prisma/client'

const prisma = new PrismaClient()

// ─────────────────────────────────────────
// Servicio de órdenes de envío
// Gestiona el ciclo operativo mensual:
// PENDIENTE → EN_PREPARACION → DESPACHADO → ENTREGADO
// ─────────────────────────────────────────

export const ordenesService = {
  /**
   * Crea una nueva orden de envío al activarse una suscripción
   */
  async crearOrden(data: {
    suscripcionId: string
    direccionId: string
    fechaProgramada: Date
    descripcionRegalo: string
    valorRegalo: number
    notaPersonal?: string
  }) {
    const valorEmpaque = 8000
    const valorDomicilio = 10000
    const valorTotal = data.valorRegalo + valorEmpaque + valorDomicilio

    return prisma.ordenEnvio.create({
      data: {
        ...data,
        valorEmpaque,
        valorDomicilio,
        valorTotal,
        estado: EstadoOrden.PENDIENTE,
      },
    })
  },

  /**
   * Listado de órdenes para el panel operativo
   * Filtro por estado y fecha programada
   */
  async listarOrdenes(filtros?: {
    estado?: EstadoOrden
    desde?: Date
    hasta?: Date
  }) {
    return prisma.ordenEnvio.findMany({
      where: {
        ...(filtros?.estado && { estado: filtros.estado }),
        ...(filtros?.desde || filtros?.hasta
          ? {
              fechaProgramada: {
                ...(filtros.desde && { gte: filtros.desde }),
                ...(filtros.hasta && { lte: filtros.hasta }),
              },
            }
          : {}),
      },
      include: {
        suscripcion: {
          include: { usuario: { select: { nombre: true, email: true } } },
        },
        direccion: true,
        proveedor: true,
      },
      orderBy: { fechaProgramada: 'asc' },
    })
  },

  /**
   * Actualiza el estado de una orden (flujo operativo)
   */
  async actualizarEstado(
    ordenId: string,
    estado: EstadoOrden,
    extras?: {
      codigoGuia?: string
      operadorLogistico?: string
      fechaDespacho?: Date
      fechaEntrega?: Date
      motivoFallo?: string
      proveedorId?: string
    }
  ) {
    return prisma.ordenEnvio.update({
      where: { id: ordenId },
      data: {
        estado,
        ...(extras?.codigoGuia && { codigoGuia: extras.codigoGuia }),
        ...(extras?.operadorLogistico && { operadorLogistico: extras.operadorLogistico }),
        ...(extras?.fechaDespacho && { fechaDespacho: extras.fechaDespacho }),
        ...(extras?.fechaEntrega && { fechaEntrega: extras.fechaEntrega }),
        ...(extras?.motivoFallo && { motivoFallo: extras.motivoFallo }),
        ...(extras?.proveedorId && { proveedorId: extras.proveedorId }),
      },
    })
  },

  /**
   * Resumen operativo del mes actual
   * Métricas para el panel de admin
   */
  async resumenMes(año: number, mes: number) {
    const inicio = new Date(año, mes - 1, 1)
    const fin = new Date(año, mes, 0, 23, 59, 59)

    const ordenes = await prisma.ordenEnvio.groupBy({
      by: ['estado'],
      where: {
        fechaProgramada: { gte: inicio, lte: fin },
      },
      _count: { id: true },
      _sum: { valorTotal: true },
    })

    return ordenes.map((o) => ({
      estado: o.estado,
      cantidad: o._count.id,
      valorTotal: o._sum.valorTotal ?? 0,
    }))
  },

  /**
   * Órdenes del ciclo de corte actual (próximos 7 días)
   * Útil para planear compras a proveedores
   */
  async ordenesProximaSemana() {
    const hoy = new Date()
    const en7dias = new Date()
    en7dias.setDate(hoy.getDate() + 7)

    return prisma.ordenEnvio.findMany({
      where: {
        estado: { in: [EstadoOrden.PENDIENTE, EstadoOrden.EN_PREPARACION] },
        fechaProgramada: { gte: hoy, lte: en7dias },
      },
      include: {
        direccion: true,
        proveedor: true,
        suscripcion: {
          include: { usuario: { select: { nombre: true, email: true } } },
        },
      },
      orderBy: { fechaProgramada: 'asc' },
    })
  },
}
