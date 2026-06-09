import { Router } from 'express'
import { ordenesService } from './ordenes.service.js'
import { EstadoOrden } from '@prisma/client'

const router = Router()

// GET /ordenes — listar con filtros opcionales
// Query params: estado, desde (ISO), hasta (ISO)
router.get('/', async (req, res) => {
  const { estado, desde, hasta } = req.query

  const filtros = {
    ...(estado && { estado: estado as EstadoOrden }),
    ...(desde && { desde: new Date(desde as string) }),
    ...(hasta && { hasta: new Date(hasta as string) }),
  }

  const ordenes = await ordenesService.listarOrdenes(
    Object.keys(filtros).length ? filtros : undefined
  )
  res.json({ ordenes })
})

// GET /ordenes/proxima-semana — ciclo de corte operativo
router.get('/proxima-semana', async (_req, res) => {
  const ordenes = await ordenesService.ordenesProximaSemana()
  res.json({ ordenes })
})

// GET /ordenes/resumen-mes?año=2026&mes=6
router.get('/resumen-mes', async (req, res) => {
  const año = parseInt(req.query.año as string) || new Date().getFullYear()
  const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1
  const resumen = await ordenesService.resumenMes(año, mes)
  res.json({ resumen, año, mes })
})

// PATCH /ordenes/:id/estado — actualizar estado
router.patch('/:id/estado', async (req, res) => {
  const { id } = req.params
  const { estado, codigoGuia, operadorLogistico, fechaDespacho, fechaEntrega, motivoFallo, proveedorId } = req.body

  if (!estado) {
    res.status(400).json({ error: 'El campo estado es requerido' })
    return
  }

  const orden = await ordenesService.actualizarEstado(id, estado as EstadoOrden, {
    codigoGuia,
    operadorLogistico,
    fechaDespacho: fechaDespacho ? new Date(fechaDespacho) : undefined,
    fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : undefined,
    motivoFallo,
    proveedorId,
  })

  res.json({ orden })
})

export default router
