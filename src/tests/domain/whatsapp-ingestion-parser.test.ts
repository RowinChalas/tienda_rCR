import { describe, it, expect } from 'vitest';
import { WhatsAppIngestionParser } from '../../domain/ingestion/WhatsAppIngestionParser';

describe('WhatsAppIngestionParser — Ingesta Automática de Productos (EARS-E-03 / RF-01 / US-01)', () => {
  it('debería_parsear_correctamente_un_mensaje_de_taller_con_costo_medidas_y_nombre', () => {
    // Arrange
    const caption = 'Mesa de Centro Nogal y Travertino\nCosto: RD$ 11,000\nMedidas: 110x45x65 cm\nMadera de nogal dominicano tratada';

    // Act
    const draft = WhatsAppIngestionParser.parse(caption, 0.35, 0.18);

    // Assert
    expect(draft.name).toContain('Mesa de Centro Nogal');
    expect(draft.category).toBe('Mesas de Centro');
    expect(draft.baseCost).toBe(11000);
    expect(draft.suggestedPrice).toBeGreaterThan(11000);
    expect(draft.floorPrice).toBe(Math.round(11000 * 1.18));
    expect(draft.dimensions.widthCm).toBe(110);
    expect(draft.dimensions.heightCm).toBe(45);
    expect(draft.dimensions.depthCm).toBe(65);
    expect(draft.confidenceScore).toBeGreaterThan(0.7);
  });

  it('debería_clasificar_categoria_comedores_a_partir_de_palabras_clave', () => {
    // Arrange
    const caption = 'Juego de Comedor Imperial 8 puestos en Roble Macizo\nBase 35000\n220x78x105 cm';

    // Act
    const draft = WhatsAppIngestionParser.parse(caption);

    // Assert
    expect(draft.category).toBe('Comedores');
    expect(draft.baseCost).toBe(35000);
    expect(draft.material).toBe('Roble');
  });

  it('debería_manejar_formato_de_costo_con_k_y_medidas_en_metros', () => {
    // Arrange
    const caption = 'Sofá Cloud Modular 3 Cuerpos\nCosto: 29k\nDimensiones: 2.40 x 0.85 x 1.10 m';

    // Act
    const draft = WhatsAppIngestionParser.parse(caption);

    // Assert
    expect(draft.category).toBe('Salas y Sofás');
    expect(draft.baseCost).toBe(29000);
    expect(draft.dimensions.widthCm).toBe(240);
    expect(draft.dimensions.heightCm).toBe(85);
    expect(draft.dimensions.depthCm).toBe(110);
  });
});
