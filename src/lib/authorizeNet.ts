export type AcceptOpaqueData = {
  dataDescriptor: string;
  dataValue: string;
};

type AcceptResponse = {
  messages: {
    resultCode: string;
    message: Array<{ code?: string; text: string }>;
  };
  opaqueData?: AcceptOpaqueData;
};

type AcceptJS = {
  dispatchData: (
    secureData: unknown,
    callback: (response: AcceptResponse) => void
  ) => void;
};

type CardData = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
};

declare global {
  interface Window {
    Accept?: AcceptJS;
  }
}

export function getToken(cardData: CardData): Promise<AcceptOpaqueData> {
  return new Promise((resolve, reject) => {
    if (!window.Accept) {
      return reject("Accept.js not loaded");
    }

    const authData = {
      clientKey: process.env.NEXT_PUBLIC_AUTHNET_CLIENT_KEY,
      apiLoginID: process.env.NEXT_PUBLIC_AUTHNET_LOGIN_ID,
    };

    const card = {
      cardNumber: cardData.cardNumber,
      month: cardData.expiryMonth,
      year: cardData.expiryYear,
      cardCode: cardData.cvv,
    };

    const secureData = {
      authData,
      cardData: card,
    };

    window.Accept.dispatchData(secureData, (response) => {
      if (response.messages.resultCode === "Error") {
        return reject(response.messages.message[0].text);
      }

      resolve(response.opaqueData as AcceptOpaqueData);
    });
  });
}
