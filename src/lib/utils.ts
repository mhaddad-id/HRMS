import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_MAP: Record<string, string> = {
  'EURO': 'EUR',
  'TL': 'TRY',
};

function normalizeCurrency(currency: string): string {
  const upper = currency.toUpperCase();
  return CURRENCY_MAP[upper] || upper;
}

export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount));
}

export function formatMoney(amount: number | string, currency: string = 'USD') {
  const normalizedCurrency = normalizeCurrency(currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalizedCurrency,
  }).format(Number(amount));
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}
