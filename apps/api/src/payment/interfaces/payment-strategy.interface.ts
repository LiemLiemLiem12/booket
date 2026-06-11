export interface IPaymentStrategy {
  createPayment(
    orderId: string,
    amount: number,
    bankCode: string | null,
    ipAddress: string,
  );
  verifyWebhook(data: any);
}
