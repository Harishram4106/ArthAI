export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  const absAmount = Math.abs(amount);
  if (absAmount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`;
  }
  if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatINRFull(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}
