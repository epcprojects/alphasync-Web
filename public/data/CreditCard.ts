
export interface CardInfo {
  name: string;
  pattern: string;
  start_digits: string[];
  length: number[];
}

export interface CardData {
  cards: CardInfo[];
}

export const CardData: CardData = {
  cards: [
    {
      name: "Visa",
      pattern: "^4[0-9]{12}(?:[0-9]{3})?$",
      start_digits: ["4"],
      length: [16],
    },
    {
      name: "Mastercard",
      pattern: "^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)",
      start_digits: ["51", "52", "53", "54", "55", "2221-2720"],
      length: [16],
    },
    {
      name: "American",
      pattern: "^3[47]",
      start_digits: ["34", "37"],
      length: [15],
    },
    {
      name: "Discover",
      pattern: "^6(?:011|5|4[4-9])",
      start_digits: ["6011", "65", "644-649"],
      length: [16],
    },
    {
      name: "JCB",
      pattern: "^35[2-8]",
      start_digits: ["3528-3589"],
      length: [16],
    },
    {
      name: "Diners",
      pattern: "^(36|38|30[0-5])",
      start_digits: ["36", "38", "300-305"],
      length: [14],
    },
    {
      name: "RuPay",
      pattern: "^(60|65|81|82|508)",
      start_digits: ["60", "65", "81", "82", "508"],
      length: [16],
    },
    {
      name: "Maestro",
      pattern: "^(50|56|57|58|63|67)",
      start_digits: ["50", "56", "57", "58", "63", "67"],
      length: [12, 13, 14, 15, 16, 17, 18, 19],
    },
    {
      name: "UnionPay",
      pattern: "^62",
      start_digits: ["62"],
      length: [16],
    },
  ],
};
