export const formatNumber = (v, d = 1) =>
  Number(v).toLocaleString('pt-BR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
