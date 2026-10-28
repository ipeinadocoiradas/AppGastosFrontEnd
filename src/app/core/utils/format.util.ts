const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
export const formatEuro = (value: number): string => euro.format(value);
