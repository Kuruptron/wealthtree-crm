export const lightTheme = {
  burgundy: '#480A1E',
  orange: '#E57311',
  nero: '#0A0A0A',
  slate: '#1E1E1E',
  smoke: '#F0F0F0',
  fog: '#E2E2E2',
  steel: '#6B6B6B',
  graphite: '#3D3D3D',
  white: '#FFFFFF',
  success: '#047857',
  warning: '#D97706',
  error: '#DC2626',
  info: '#0369A1',
  pageBg: '#F4F4F4',
  isDark: false,
};

export const darkTheme = {
  burgundy: '#E57214',
  orange: '#F0853A',
  nero: '#EBEBEB',
  slate: '#C8C8C8',
  smoke: '#1E1E1E',
  fog: '#2D2D2D',
  steel: '#848484',
  graphite: '#AAAAAA',
  white: '#171717',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#FC8181',
  info: '#63B3ED',
  pageBg: '#111111',
  isDark: true,
};

// Keep for utility functions only
export const theme = lightTheme;

export const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatNumber = (num) =>
  num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
