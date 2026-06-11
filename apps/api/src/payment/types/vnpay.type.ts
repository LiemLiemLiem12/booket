export type VnpayPayment = {
  apiUrl: string;
  secretKey: string;
  apiVersion: string;
  command: string;
  tmnCode: string;
  locale: string;
  currencyCode: string;
  returnUrl: string;
  expireAmount: number;
};
