export const getInitials = (name: string | null | undefined) => {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num);
};
