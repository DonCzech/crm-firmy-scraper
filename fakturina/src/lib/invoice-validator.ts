/**
 * Validátor českých faktur
 *
 * Neplátce DPH — zákon č. 563/1991 Sb. § 11 (zákon o účetnictví):
 *   - druh a číselné označení dokladu
 *   - datum vystavení
 *   - datum uskutečnění účetního případu
 *   - označení dodavatele (název, adresa, IČO)
 *   - označení odběratele (název, adresa)
 *   - popis plnění (název položek, množství, cena)
 *
 * Plátce DPH — zákon č. 235/2004 Sb. § 29 (zákon o DPH):
 *   - vše výše +
 *   - DIČ dodavatele
 *   - DIČ odběratele (pokud je registrovaná osoba)
 *   - DUZP (datum uskutečnění zdanitelného plnění)
 *   - základ daně PER sazbu DPH
 *   - sazba DPH (0 / 12 / 21 %)
 *   - výše DPH PER sazbu DPH
 *
 * Identifikovaná osoba — § 6g–6i ZDPH:
 *   - stejné náležitosti jako plátce DPH (vč. DUZP)
 */

export interface InvoiceData {
  type: string;
  number?: string;
  variableSymbol?: string;
  issueDate?: string;
  dueDate?: string;
  taxableDate?: string;

  // Dodavatel
  supplierName?: string;
  supplierIco?: string;
  supplierDic?: string;
  supplierAddress?: string;
  supplierCity?: string;
  supplierBankAccount?: string;

  // Odběratel
  clientName?: string;
  clientAddress?: string;
  clientDic?: string;

  vatStatus?: string;
  invoicePrefix?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
  }>;
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export function validateInvoice(data: InvoiceData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const isVatPayer = data.vatStatus === "vat_payer";
  const isIdentifiedPerson = data.vatStatus === "identified_person";
  const needsVat = isVatPayer || isIdentifiedPerson;

  // ── Dodavatel ───────────────────────────────────────────────────
  if (!data.supplierName) errors.push("Chybí název dodavatele");
  if (!data.supplierIco)  errors.push("Chybí IČ dodavatele (§ 11 zákona o účetnictví)");
  if (!data.supplierAddress && !data.supplierCity)
    errors.push("Chybí adresa sídla dodavatele");

  if (needsVat && !data.supplierDic)
    errors.push("Chybí DIČ dodavatele — povinné pro plátce DPH (§ 29 odst. 1 písm. a ZDPH)");

  if (!data.supplierBankAccount)
    warnings.push("Chybí bankovní účet dodavatele — klient nebude vědět, kam platit");

  // ── Odběratel ───────────────────────────────────────────────────
  if (!data.clientName)    errors.push("Chybí název odběratele");
  if (!data.clientAddress) errors.push("Chybí adresa odběratele (§ 29 odst. 1 písm. b ZDPH)");

  if (needsVat && !data.clientDic)
    warnings.push("Chybí DIČ odběratele — doporučeno uvést, pokud je odběratel plátce DPH (§ 29 ZDPH)");

  // ── Číslování ───────────────────────────────────────────────────
  if (!data.number)        errors.push("Chybí číslo dokladu (§ 11 odst. 1 písm. b zákona o účetnictví)");
  if (!data.invoicePrefix) warnings.push("Faktura nemá definovanou číselnou řadu");
  if (!data.variableSymbol) warnings.push("Chybí variabilní symbol — klient ho potřebuje pro správné spárování platby");

  // ── Datumové náležitosti ─────────────────────────────────────────
  if (!data.issueDate)
    errors.push("Chybí datum vystavení (§ 11 odst. 1 písm. c zákona o účetnictví)");
  if (!data.dueDate)
    errors.push("Chybí datum splatnosti");

  if (needsVat && !data.taxableDate)
    errors.push("Chybí DUZP — datum uskutečnění zdanitelného plnění je povinné pro plátce DPH (§ 29 odst. 1 písm. f ZDPH)");

  if (!needsVat && !data.taxableDate && data.issueDate)
    warnings.push("Doporučujeme uvést datum uskutečnění účetního případu (§ 11 zákona o účetnictví) — může se lišit od data vystavení");

  // ── Položky ──────────────────────────────────────────────────────
  if (!data.items || data.items.length === 0) {
    errors.push("Faktura nemá žádné položky (§ 29 odst. 1 písm. e ZDPH)");
  } else {
    const vatRatesUsed = new Set<number>();

    data.items.forEach((item, i) => {
      const n = i + 1;
      if (!item.name?.trim())
        errors.push(`Položka ${n}: chybí název / předmět plnění`);
      if (item.quantity == null || item.quantity <= 0)
        warnings.push(`Položka ${n}: množství je nulové nebo nevyplněné`);
      if (item.unitPrice == null)
        errors.push(`Položka ${n}: chybí cena za měrnou jednotku (§ 29 odst. 2 písm. e ZDPH)`);

      if (needsVat) {
        if (item.vatRate == null)
          errors.push(`Položka ${n}: není vybrána sazba DPH (§ 29 odst. 1 písm. g ZDPH)`);
        else
          vatRatesUsed.add(item.vatRate);
      }
    });

    // Pro plátce DPH — rozpis základu a DPH per sazbu musí být na faktuře
    // Validator upozorní jen pokud jsou použity různé sazby najednou (audit)
    if (needsVat && vatRatesUsed.size > 1) {
      // Informační poznámka — fakticky faktura musí obsahovat základ + DPH per sazbu
      // (generátor PDF to zajišťuje automaticky)
      warnings.push(
        `Faktura obsahuje ${vatRatesUsed.size} různé sazby DPH — zákon vyžaduje samostatný řádek základu a DPH pro každou sazbu (§ 29 odst. 1 písm. g ZDPH). Fakturina toto automaticky splňuje.`
      );
    }
  }

  return {
    errors,
    warnings,
    isValid: errors.length === 0,
  };
}

export function generateReminderText(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (text, [key, val]) => text.replaceAll(`{{${key}}}`, val),
    template
  );
}

export const aiInvoiceAssistantService = {
  async validateInvoiceWithAI(_data: InvoiceData): Promise<string[]> {
    return [];
  },
  async generateReminderText(invoiceNumber: string, daysOverdue: number): Promise<string> {
    return `Upomínka k faktuře ${invoiceNumber} — po splatnosti ${daysOverdue} dní.`;
  },
  async summarizeReceivables(invoices: unknown[]): Promise<string> {
    return `Celkem ${invoices.length} pohledávek.`;
  },
};
