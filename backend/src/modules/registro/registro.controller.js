import { validateRegistrationData } from '@mcdl/shared';
import { RegistroService } from './registro.service.js';

export class RegistroController {
  static async register(req, res, next) {
    try {
      const validation = validateRegistrationData(req.body);

      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Por favor complete correctamente los campos del formulario.',
          errors: validation.errors
        });
      }

      const record = RegistroService.create(validation.sanitized);
      await RegistroService.syncToGoogleSheets(record);

      return res.status(201).json({
        success: true,
        message: '¡Tu cupo ha sido reservado con éxito! Confirmaremos tu inscripción por correo y WhatsApp.',
        data: {
          id: record.id,
          nombre: record.nombre,
          apellido: record.apellido,
          cargo: record.cargo
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req, res, next) {
    try {
      const stats = RegistroService.getStats();
      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

