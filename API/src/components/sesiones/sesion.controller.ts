import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { sesionService } from './sesion.service';

// Responde según el tipo de error: los AppError traen su código, el resto es 500
const manejarError = (res: Response, error: unknown) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
};

export const sesionController = {
  async getAll(req: Request, res: Response) {
    try {
      const sesiones = await sesionService.listar();
      res.status(200).json(sesiones);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const sesion = await sesionService.obtenerPorId(req.params.id as string);
      res.status(200).json(sesion);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const sesion = await sesionService.crear(req.body ?? {});
      res.status(201).json(sesion);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const sesion = await sesionService.actualizar(req.params.id as string, req.body ?? {});
      res.status(200).json(sesion);
    } catch (error) {
      manejarError(res, error);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await sesionService.eliminar(req.params.id as string);
      res.status(200).json({ mensaje: 'Sesión eliminada correctamente' });
    } catch (error) {
      manejarError(res, error);
    }
  },
};
