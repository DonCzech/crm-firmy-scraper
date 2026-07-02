import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = 'CZK') {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const OFFER_TYPE_LABELS: Record<string, string> = {
  SALE: 'Prodej',
  RENT: 'Pronájem',
};

export const ESTATE_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Byt',
  HOUSE: 'Dům',
  LAND: 'Pozemek',
  COMMERCIAL: 'Komerční',
  GARAGE: 'Garáž',
  OTHER: 'Ostatní',
};
