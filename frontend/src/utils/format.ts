export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLeadDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function slugId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function parseList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function formatLeadStatusLabel(value: string) {
  switch (value) {
    case 'new':
      return 'Nova';
    case 'contacted':
      return 'Em contato';
    case 'proposal':
      return 'Proposta';
    case 'closed':
      return 'Fechada';
    default:
      return value;
  }
}

export function formatExperienceLevelLabel(value: string) {
  switch (value) {
    case 'PRO':
      return 'Nivel PRO';
    case 'Intermediario':
      return 'Nivel Intermediario';
    case 'Iniciante':
      return 'Nivel Iniciante';
    default:
      return value;
  }
}
