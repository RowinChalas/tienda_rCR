import { describe, it, expect } from 'vitest';
import { ReceiptOcrEngine } from '../../domain/ocr/ReceiptOcrEngine';

describe('ReceiptOcrEngine — Extracción y Validación de Comprobantes Bancarios (EARS-O-02 / RF-29 / US-17)', () => {
  it('debería_extraer_datos_correctamente_de_un_comprobante_del_Banco_Popular_Dominicano', () => {
    // Arrange
    const sampleText = `
      BANCO POPULAR DOMINICANO
      Transferencia ACH Exitosa
      No. de Referencia: BPD-98472910
      Fecha: 30/08/2026 15:40:12
      Cuenta Origen: ****9102
      Beneficiario: BARVERSUIT RETAIL SRL
      Monto: RD$ 48,990.00
      Estado: Procesada
    `;

    // Act
    const result = ReceiptOcrEngine.parseReceiptText(sampleText);

    // Assert
    expect(result.bank).toBe('banco_popular');
    expect(result.referenceNumber).toBe('BPD-98472910');
    expect(result.amount).toBe(48990);
    expect(result.currency).toBe('DOP');
    expect(result.confidenceScore).toBeGreaterThan(0.7);
  });

  it('debería_extraer_datos_correctamente_de_un_comprobante_del_Banco_BHD', () => {
    // Arrange
    const sampleText = `
      BANCO BHD
      Comprobante de Transferencia entre Cuentas
      Número de Transacción: TRF-5542019
      Fecha de Proceso: 29/08/2026
      A Favor de: BARVERSUIT SRL
      Monto Transferido: $5,000.00 DOP
    `;

    // Act
    const result = ReceiptOcrEngine.parseReceiptText(sampleText);

    // Assert
    expect(result.bank).toBe('banco_bhd');
    expect(result.referenceNumber).toBe('TRF-5542019');
    expect(result.amount).toBe(5000);
    expect(result.currency).toBe('DOP');
  });

  it('debería_extraer_datos_correctamente_de_un_comprobante_de_Banreservas', () => {
    // Arrange
    const sampleText = `
      BANRESERVAS
      Transferencia Inmediata LBTR
      Referencia: RES-8839201
      Destinatario: BARVERSUIT RETAIL HUB
      Importe: RD$ 22,490
    `;

    // Act
    const result = ReceiptOcrEngine.parseReceiptText(sampleText);

    // Assert
    expect(result.bank).toBe('banreservas');
    expect(result.referenceNumber).toBe('RES-8839201');
    expect(result.amount).toBe(22490);
  });

  it('debería_validar_exactitud_del_monto_esperado_para_depósito_de_seguridad', () => {
    // Arrange
    const extracted = ReceiptOcrEngine.parseReceiptText(`
      BANCO POPULAR DOMINICANO
      No. de Referencia: BPD-112233
      Monto: RD$ 5,000.00
    `);

    // Act
    const validation = ReceiptOcrEngine.validateReceiptAgainstExpected(extracted, 5000, true);

    // Assert
    expect(validation.isValid).toBe(true);
    expect(validation.isAmountMatching).toBe(true);
    expect(validation.status).toBe('aprobado_exacto');
  });

  it('debería_marcar_monto_insuficiente_cuando_el_comprobante_es_menor_al_requerido', () => {
    // Arrange
    const extracted = ReceiptOcrEngine.parseReceiptText(`
      BANCO BHD
      Número de Transacción: TRF-990011
      Monto Transferido: $3,000.00
    `);

    // Act
    const validation = ReceiptOcrEngine.validateReceiptAgainstExpected(extracted, 5000, true);

    // Assert
    expect(validation.isValid).toBe(false);
    expect(validation.status).toBe('monto_insuficiente');
    expect(validation.differenceAmount).toBe(2000);
  });
});
