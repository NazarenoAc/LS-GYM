import { SesionModel, SesionData } from './sesion.model';

// Capa de acceso a datos: solo habla con la base, sin reglas de negocio
export const sesionRepository = {
  findAll() {
    return SesionModel.find();
  },

  findById(id: string) {
    return SesionModel.findById(id);
  },

  findBySalaYFecha(sala: string, fecha: string) {
    return SesionModel.find({ sala, fecha });
  },

  create(data: SesionData) {
    return SesionModel.create(data);
  },

  update(id: string, data: SesionData) {
    return SesionModel.findByIdAndUpdate(id, data, {
      returnDocument: 'after', // devuelve la sesión ya actualizada
      runValidators: true,
    });
  },

  delete(id: string) {
    return SesionModel.findByIdAndDelete(id);
  },
};
