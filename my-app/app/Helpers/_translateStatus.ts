export const translateStatus = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return "EN TRAITEMENT";
    case "PAYED":
      return "PAYÉ";
    case "TRANSFER_TO_DELIVERY_COMPANY":
      return "TRANSFÉRÉ À LA SOCIÉTÉ DE LIVRAISON";

    case "REFUNDED":
      return "REMBOURSER";
    case "BACK":
      return "RETOUR";
    case "EXCHANGE":
      return "ÉCHANGE";
    case "CANCELLED":
      return "ANNULÉ";
    default:
      return status;
  }
};
