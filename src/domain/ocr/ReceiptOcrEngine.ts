/**
 * Motor de Extracción y Validación OCR de Comprobantes Bancarios (EARS-O-02 / RF-29 / US-17)
 * Diseñado específicamente para el sistema bancario dominicano (BPD, BHD, Banreservas, etc.)
 * Funciona como lógica de dominio pura sin dependencias de UI.
 */

export type DominicanBank =
  | 'banco_popular'
  | 'banco_bhd'
  | 'banreservas'
  | 'banco_santa_cruz'
  | 'qik_banco_digital'
  | 'scotiabank'
  | 'otro';

export interface ReceiptOcrResult {
  bank: DominicanBank;
  bankDisplayName: string;
  referenceNumber: string;
  amount: number;
  currency: 'DOP' | 'USD';
  transferDate?: string;
  senderAccount?: string;
  recipientAccount?: string;
  beneficiaryName?: string;
  confidenceScore: number; // 0.0 a 1.0
  rawExtractedText: string;
}

export interface ReceiptValidationStatus {
  isValid: boolean;
  isAmountMatching: boolean;
  differenceAmount: number;
  message: string;
  status: 'aprobado_exacto' | 'aprobado_excedente' | 'monto_insuficiente' | 'requiere_revision_manual';
}

export class ReceiptOcrEngine {
  private static readonly BANK_PATTERNS: Array<{
    bank: DominicanBank;
    name: string;
    keywords: RegExp[];
  }> = [
    {
      bank: 'banco_popular',
      name: 'Banco Popular Dominicano',
      keywords: [/popular/i, /bpd/i, /app popular/i, /banco popular dominicano/i],
    },
    {
      bank: 'banco_bhd',
      name: 'Banco BHD',
      keywords: [/bhd/i, /bhd leon/i, /banco bhd/i, /app móvil bhd/i],
    },
    {
      bank: 'banreservas',
      name: 'Banreservas',
      keywords: [/reservas/i, /banreservas/i, /banco de reservas/i, /app banreservas/i],
    },
    {
      bank: 'banco_santa_cruz',
      name: 'Banco Santa Cruz',
      keywords: [/santa cruz/i, /banco santa cruz/i, /bsc móvil/i],
    },
    {
      bank: 'qik_banco_digital',
      name: 'Qik Banco Digital',
      keywords: [/qik/i, /banco digital qik/i, /qik dominicana/i],
    },
    {
      bank: 'scotiabank',
      name: 'Scotiabank República Dominicana',
      keywords: [/scotia/i, /scotiabank/i],
    },
  ];

  /**
   * Extrae la información estructurada de un comprobante a partir del texto OCR procesado.
   */
  public static parseReceiptText(rawText: string): ReceiptOcrResult {
    if (!rawText || rawText.trim().length === 0) {
      return {
        bank: 'otro',
        bankDisplayName: 'Desconocido / Otro Banco',
        referenceNumber: '',
        amount: 0,
        currency: 'DOP',
        confidenceScore: 0,
        rawExtractedText: '',
      };
    }

    const cleanText = rawText.replace(/\r\n/g, '\n');

    // 1. Identificar Banco
    let detectedBank: DominicanBank = 'otro';
    let bankDisplayName = 'Banco Dominicano';
    for (const item of this.BANK_PATTERNS) {
      if (item.keywords.some((kw) => kw.test(cleanText))) {
        detectedBank = item.bank;
        bankDisplayName = item.name;
        break;
      }
    }

    // 2. Extraer Número de Referencia o Transacción
    const referenceNumber = this.extractReferenceNumber(cleanText);

    // 3. Extraer Monto
    const { amount, currency } = this.extractAmount(cleanText);

    // 4. Extraer Fecha / Hora
    const transferDate = this.extractDate(cleanText);

    // 5. Extraer Cuentas
    const { senderAccount, recipientAccount, beneficiaryName } = this.extractAccounts(cleanText);

    // 6. Calcular puntaje de confianza
    let score = 0.2;
    if (detectedBank !== 'otro') score += 0.25;
    if (referenceNumber) score += 0.3;
    if (amount > 0) score += 0.25;

    return {
      bank: detectedBank,
      bankDisplayName,
      referenceNumber,
      amount,
      currency,
      transferDate,
      senderAccount,
      recipientAccount,
      beneficiaryName,
      confidenceScore: Math.min(1.0, Number(score.toFixed(2))),
      rawExtractedText: cleanText,
    };
  }

  /**
   * Extrae el número de referencia con patrones bancarios típicos.
   */
  private static extractReferenceNumber(text: string): string {
    const patterns = [
      /(?:no\.?\s*de?\s*referencia|n[uú]mero\s*de\s*transacci[oó]n|no\.?\s*de?\s*transacci[oó]n|referencia|ref|autorizaci[oó]n|num\.\s*de\s*aprobaci[oó]n|c[oó]digo\s*de\s*seguridad)[:\s#]*([A-Z0-9-]{4,25})/i,
      /((?:TRF|BPD|BHD|RES|APROB)-?[0-9A-Z]{4,20})/i,
      /([0-9]{8,14})/, // Secuencia numérica larga si no hay etiqueta previa
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  /**
   * Extrae el monto de la transferencia y la divisa.
   */
  private static extractAmount(text: string): { amount: number; currency: 'DOP' | 'USD' } {
    let currency: 'DOP' | 'USD' = 'DOP';
    if (/USD|\$US|D[oó]lares/i.test(text)) {
      currency = 'USD';
    }

    // Patrones de montos (ej: RD$ 48,990.00, $5,000.00, 39,990.00, RD$15000)
    const amountPatterns = [
      /(?:monto|total|importe|valor|debitado|transferido)[:\s]*(?:RD\$|\$|DOP)?\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]+)/i,
      /(?:RD\$|\$|DOP)\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]+)/i,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const rawNum = match[1].replace(/,/g, '');
        const parsed = parseFloat(rawNum);
        if (!isNaN(parsed) && parsed > 0) {
          return { amount: parsed, currency };
        }
      }
    }

    return { amount: 0, currency };
  }

  /**
   * Extrae la fecha de la transacción.
   */
  private static extractDate(text: string): string | undefined {
    const dateMatch = text.match(/([0-3]?[0-9][\/-][0-1]?[0-9][\/-](?:20)?[0-9]{2,4}(?:\s+[0-2]?[0-9]:[0-5][0-9](?::[0-5][0-9])?)?)/);
    if (dateMatch) {
      return dateMatch[1].trim();
    }
    return undefined;
  }

  /**
   * Extrae cuentas y beneficiario si están presentes.
   */
  private static extractAccounts(text: string): {
    senderAccount?: string;
    recipientAccount?: string;
    beneficiaryName?: string;
  } {
    const res: { senderAccount?: string; recipientAccount?: string; beneficiaryName?: string } = {};

    const beneficiaryMatch = text.match(/(?:beneficiario|a\s+favor\s+de|destinatario|nombre)[:\s]+([^\n\r]+)/i);
    if (beneficiaryMatch) {
      res.beneficiaryName = beneficiaryMatch[1].trim();
    }

    const accountMatch = text.match(/(?:cuenta\s+destino|cuenta)[:\s]+([0-9*X-]{6,20})/i);
    if (accountMatch) {
      res.recipientAccount = accountMatch[1].trim();
    }

    return res;
  }

  /**
   * Valida el comprobante extraído contra el monto esperado de una orden o depósito.
   */
  public static validateReceiptAgainstExpected(
    extractedResult: ReceiptOcrResult,
    expectedAmount: number,
    isDepositOnly: boolean = false
  ): ReceiptValidationStatus {
    if (extractedResult.amount <= 0 || !extractedResult.referenceNumber) {
      return {
        isValid: false,
        isAmountMatching: false,
        differenceAmount: expectedAmount,
        message: 'No se pudo detectar un monto o número de referencia válido en el comprobante.',
        status: 'requiere_revision_manual',
      };
    }

    const diff = extractedResult.amount - expectedAmount;

    if (Math.abs(diff) < 1.0) {
      return {
        isValid: true,
        isAmountMatching: true,
        differenceAmount: 0,
        message: isDepositOnly
          ? `Depósito de seguridad de $${extractedResult.amount.toLocaleString()} ${extractedResult.currency} validado con éxito.`
          : `Pago total de $${extractedResult.amount.toLocaleString()} ${extractedResult.currency} validado y concordante.`,
        status: 'aprobado_exacto',
      };
    }

    if (diff > 0) {
      return {
        isValid: true,
        isAmountMatching: false,
        differenceAmount: diff,
        message: `El comprobante cubre el monto requerido con un excedente de $${diff.toLocaleString()} ${extractedResult.currency}.`,
        status: 'aprobado_excedente',
      };
    }

    return {
      isValid: false,
      isAmountMatching: false,
      differenceAmount: Math.abs(diff),
      message: `Monto insuficiente: comprobante por $${extractedResult.amount.toLocaleString()} vs requerido $${expectedAmount.toLocaleString()} (Faltante: $${Math.abs(diff).toLocaleString()}).`,
      status: 'monto_insuficiente',
    };
  }

  /**
   * Generador de texto de prueba para simular comprobantes de bancos dominicanos.
   */
  public static getSampleVoucherText(bank: DominicanBank, amount: number, refNum: string): string {
    const today = new Date().toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    switch (bank) {
      case 'banco_popular':
        return `BANCO POPULAR DOMINICANO\nComprobante de Transferencia ACH\nNo. de Referencia: ${refNum}\nFecha: ${today} 14:22:05\nCuenta Origen: ****4829\nCuenta Destino: ****1092\nBeneficiario: BARVERSUIT RETAIL SRL\nMonto: RD$ ${amount.toLocaleString()}.00\nEstado: Aplicada con Éxito`;
      case 'banco_bhd':
        return `BANCO BHD\nTransferencia entre Cuentas / Pagos\nNúmero de Transacción: ${refNum}\nFecha de Proceso: ${today}\nA Favor de: BARVERSUIT RETAIL\nMonto Transferido: $${amount.toLocaleString()}.00 DOP\nComisión: $0.00`;
      case 'banreservas':
        return `BANRESERVAS - El banco de todos los dominicanos\nConfirmación de Transferencia Directa\nReferencia: ${refNum}\nFecha: ${today}\nDestinatario: BARVERSUIT RETAIL HUB\nImporte: RD$ ${amount.toLocaleString()}`;
      default:
        return `COMPROBANTE DE PAGO BANCARIO\nREF: ${refNum}\nFecha: ${today}\nMonto: RD$ ${amount.toLocaleString()}\nBeneficiario: BarverSuit`;
    }
  }
}
