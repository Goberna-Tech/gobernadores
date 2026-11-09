import { PONENTES } from '@mcdl/shared';

export class PonentesController {
  static getList(req, res) {
    return res.json({
      success: true,
      data: PONENTES
    });
  }

  static getById(req, res) {
    const { id } = req.params;
    const ponente = PONENTES.find(p => p.id === id);
    if (!ponente) {
      return res.status(404).json({
        success: false,
        message: 'Ponente no encontrado.'
      });
    }
    return res.json({
      success: true,
      data: ponente
    });
  }
}

