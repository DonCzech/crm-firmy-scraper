interface NumberingConfig {
  invoice_number_year_format: string; // 'full' | 'short' | 'none'
  invoice_number_month: boolean;
  invoice_number_position: string;   // 'start' | 'end'
  invoice_number_volume: number;     // 100 | 1000 | 10000 | 100000 | 1000000
  invoice_number_separator: string;  // '-' | ''
  invoice_prefix: string;            // custom prefix like 'FA'
  invoice_next: number;
}

function padWidth(volume: number): number {
  if (volume <= 100) return 2;
  if (volume <= 1000) return 3;
  if (volume <= 10000) return 4;
  if (volume <= 100000) return 5;
  return 7;
}

export function generateInvoiceNumber(cfg: NumberingConfig, date: Date = new Date()): string {
  const sep = cfg.invoice_number_separator ?? '-';
  const prefix = cfg.invoice_prefix ?? '';

  const yearFull = String(date.getFullYear());
  const yearShort = yearFull.slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const yearPart =
    cfg.invoice_number_year_format === 'full' ? yearFull :
    cfg.invoice_number_year_format === 'short' ? yearShort : '';

  const monthPart = cfg.invoice_number_month && yearPart ? month : '';

  const datePart = [yearPart, monthPart].filter(Boolean).join(sep);

  const seqPad = padWidth(cfg.invoice_number_volume ?? 10000);
  const seq = String(cfg.invoice_next ?? 1).padStart(seqPad, '0');

  const parts: string[] = [];
  if (prefix) parts.push(prefix);

  if (cfg.invoice_number_position === 'start') {
    parts.push(seq);
    if (datePart) parts.push(datePart);
  } else {
    if (datePart) parts.push(datePart);
    parts.push(seq);
  }

  return parts.join(sep);
}

export function previewNumbers(cfg: Omit<NumberingConfig, 'invoice_next'>): string[] {
  return [
    generateInvoiceNumber({ ...cfg, invoice_next: 1 }),
    generateInvoiceNumber({ ...cfg, invoice_next: 2 }),
    generateInvoiceNumber({ ...cfg, invoice_next: 9999 }),
  ];
}
