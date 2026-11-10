import { Schema, model } from 'mongoose';

export const TIPOS_SESION = ['kinesiologia', 'musculacion', 'funcional'] as const;
export type TipoSesion = (typeof TIPOS_SESION)[number];

// Forma de los datos de una sesión (sin _id ni fechas automáticas)
export interface SesionData {
  tipo: TipoSesion;
  profesional: string;
  sala: string;
  fecha: string; // "YYYY-MM-DD"
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  cupo: number;
}

const sesionSchema = new Schema<SesionData>(
  {
    tipo: { type: String, required: true, enum: TIPOS_SESION },
    profesional: { type: String, required: true, trim: true },
    sala: { type: String, required: true, trim: true },
    fecha: { type: String, required: true },
    horaInicio: { type: String, required: true },
    horaFin: { type: String, required: true },
    cupo: { type: Number, required: true },
  },
  { timestamps: true } // agrega createdAt y updatedAt
);

// El tercer parámetro es el nombre de la colección en Mongo
export const SesionModel = model<SesionData>('Sesion', sesionSchema, 'sesiones');
