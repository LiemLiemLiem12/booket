export interface IPaymentStrategy {
  createPayment(
    orderId: string,
    amount: number,
    bankCode: string | null,
    ipAddress: string,
    transactionId: string,
  );
  verifyWebhook(data: any);
}
