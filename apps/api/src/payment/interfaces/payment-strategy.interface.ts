export interface IPaymentStrategy {
  createPayment(
    orderId: string,
    amount: number,
    bankCode: string,
    ipAddress: string,
  );
  verifyWebhook(data: any);
}
