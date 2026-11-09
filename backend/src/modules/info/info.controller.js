import { EVENT_INFO, EJES_TEMATICOS, RUTA_INTERNACIONAL, PUBLICO_OBJETIVO, BENEFICIOS, formatWhatsAppUrl } from '@mcdl/shared';

export class InfoController {
  static getEventInfo(req, res) {
    return res.json({
      success: true,
      data: {
        info: EVENT_INFO,
        ejes: EJES_TEMATICOS,
        ruta: RUTA_INTERNACIONAL,
        publico: PUBLICO_OBJETIVO,
        beneficios: BENEFICIOS
      }
    });
  }

  static getWhatsAppLink(req, res) {
    const { mensaje } = req.query;
    const url = formatWhatsAppUrl(EVENT_INFO.whatsapp.number, mensaje);
    return res.json({
      success: true,
      data: {
        number: EVENT_INFO.whatsapp.number,
        formatted: EVENT_INFO.whatsapp.formatted,
        url
      }
    });
  }
}

