export const translateStatus = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return "EN TRAITEMENT";
    case "PAYED_NOT_DELIVERED":
      return "PAYÉ MAIS NON LIVRÉ";
    case "PAYED_AND_DELIVERED":
      return "PAYÉ ET LIVRÉ";
    case "TRANSFER_TO_DELIVERY_COMPANY":
      return "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON";
    case "REFUNDED":
      return "REMBOURSER";
    case "BACK":
      return "RETOUR";
    case "CONFIRMED":
      return "COMMANDE CONFIRMÉ";
    case "CANCELLED":
      return "ANNULÉ";
    default:
      return status;
  }
};

export const translatePaymentMethodStatus = (status: string) => {
  switch (status) {
    case "CASH_ON_DELIVERY":
      return "Paiement à la livraison";
    case "CREDIT_CARD":
      return "Payé par carte de crédit";
    default:
      return status;
  }
};
