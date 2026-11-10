import { isValidObjectId } from 'mongoose';
import { AppError } from '../../utils/AppError';
import { SesionData, TIPOS_SESION } from './sesion.model';
import { sesionRepository } from './sesion.repository';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/; // 00:00 a 23:59
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

const validarId = (id: string) => {
  if (!isValidObjectId(id)) {
    throw new AppError('El id no tiene un formato válido', 400);
  }
};

// Reglas de negocio sobre los datos de una sesión
const validarDatos = (data: SesionData) => {
  const { tipo, profesional, sala, fecha, horaInicio, horaFin, cupo } = data;

  if (!tipo || !profesional || !sala || !fecha || !horaInicio || !horaFin || cupo === undefined) {
    throw new AppError(
      'Faltan campos obligatorios: tipo, profesional, sala, fecha, horaInicio, horaFin, cupo',
      400
    );
  }

  if (!TIPOS_SESION.includes(tipo)) {
    throw new AppError(`El tipo debe ser uno de: ${TIPOS_SESION.join(', ')}`, 400);
  }

  if (!FECHA_REGEX.test(fecha) || isNaN(Date.parse(fecha))) {
    throw new AppError('La fecha debe tener el formato YYYY-MM-DD', 400);
  }

  if (!HORA_REGEX.test(horaInicio) || !HORA_REGEX.test(horaFin)) {
    throw new AppError('Las horas deben tener el formato HH:mm', 400);
  }

  // Como son "HH:mm" con cero adelante, se pueden comparar como texto
  if (horaFin <= horaInicio) {
    throw new AppError('La hora de fin debe ser posterior a la hora de inicio', 400);
  }

  if (!Number.isInteger(cupo) || cupo < 1) {
    throw new AppError('El cupo debe ser un número entero mayor a 0', 400);
  }

  if (tipo === 'kinesiologia' && cupo !== 1) {
    throw new AppError('Las sesiones de kinesiología son individuales: el cupo debe ser 1', 400);
  }
};

// Dos sesiones en la misma sala y fecha no se pueden pisar
const validarSuperposicion = async (data: SesionData, idExcluido?: string) => {
  const sesiones = await sesionRepository.findBySalaYFecha(data.sala, data.fecha);

  const choca = sesiones.some(
    (s) =>
      s.id !== idExcluido && // en el PUT no compara la sesión consigo misma
      data.horaInicio < s.horaFin &&
      data.horaFin > s.horaInicio
  );

  if (choca) {
    throw new AppError(`La sala "${data.sala}" ya tiene una sesión en ese horario`, 400);
  }
};

export const sesionService = {
  async listar() {
    return sesionRepository.findAll();
  },

  async obtenerPorId(id: string) {
    validarId(id);
    const sesion = await sesionRepository.findById(id);
    if (!sesion) throw new AppError('Sesión no encontrada', 404);
    return sesion;
  },

  async crear(data: SesionData) {
    validarDatos(data);
    await validarSuperposicion(data);

    // Solo guarda los campos conocidos (ignora cualquier otro que venga en el body)
    const { tipo, profesional, sala, fecha, horaInicio, horaFin, cupo } = data;
    return sesionRepository.create({ tipo, profesional, sala, fecha, horaInicio, horaFin, cupo });
  },

  async actualizar(id: string, data: Partial<SesionData>) {
    validarId(id);
    const existente = await sesionRepository.findById(id);
    if (!existente) throw new AppError('Sesión no encontrada', 404);

    // Permite mandar solo los campos a cambiar: el resto se toma de la sesión guardada
    const datos: SesionData = {
      tipo: data.tipo ?? existente.tipo,
      profesional: data.profesional ?? existente.profesional,
      sala: data.sala ?? existente.sala,
      fecha: data.fecha ?? existente.fecha,
      horaInicio: data.horaInicio ?? existente.horaInicio,
      horaFin: data.horaFin ?? existente.horaFin,
      cupo: data.cupo ?? existente.cupo,
    };

    validarDatos(datos);
    await validarSuperposicion(datos, id);
    return sesionRepository.update(id, datos);
  },

  async eliminar(id: string) {
    validarId(id);
    const eliminada = await sesionRepository.delete(id);
    if (!eliminada) throw new AppError('Sesión no encontrada', 404);
    return eliminada;
  },
};
