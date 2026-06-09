import formatDate from '../utils/formatDate';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { VnpayPayment } from '../types/vnpay.type';
import sortObject from '../utils/sortObject';
import * as querystring from 'qs';
import * as crypto from 'crypto';

export default class VnpayStrategy implements IPaymentStrategy {
  private apiUrl: string;
  private secretKey: string;
  private apiVersion: string;
  private command: string;
  private tmnCode: string;
  private locale: string;
  private currencyCode: string;
  private returnUrl: string;

  constructor(data: VnpayPayment) {
    this.apiUrl = data.apiUrl;
    this.secretKey = data.secretKey;
    this.apiVersion = data.apiVersion;
    this.command = data.command;
    this.tmnCode = data.tmnCode;
    this.locale = data.locale;
    this.currencyCode = data.currencyCode;
    this.returnUrl = data.returnUrl;
  }

  createPayment(
    orderId: string,
    amount: number,
    bankCode: string,
    ipAddress: string,
  ) {
    let date = new Date();
    const createDate = formatDate(date);
    let vnp_Params: any = {};

    if (
      this.apiUrl === undefined ||
      this.secretKey === undefined ||
      this.apiVersion === undefined ||
      this.command === undefined ||
      this.tmnCode === undefined ||
      this.locale === undefined ||
      this.currencyCode === undefined ||
      this.returnUrl === undefined
    ) {
      throw new Error('Missing VNPAY configuration');
    }

    vnp_Params['vnp_Version'] = this.apiVersion;
    vnp_Params['vnp_Command'] = this.command;
    vnp_Params['vnp_TmnCode'] = this.tmnCode;
    vnp_Params['vnp_Locale'] = this.locale;
    vnp_Params['vnp_CurrCode'] = this.currencyCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = this.returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddress;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    hmac.update(signData);
    const signed = hmac.digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    this.apiUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return vnp_Params;
  }

  verifyWebhook(data: any) {
    if (
      this.apiUrl === undefined ||
      this.secretKey === undefined ||
      this.apiVersion === undefined ||
      this.command === undefined ||
      this.tmnCode === undefined ||
      this.locale === undefined ||
      this.currencyCode === undefined ||
      this.returnUrl === undefined
    ) {
      throw new Error('Missing VNPAY configuration');
    }

    console.log('Received webhook data:', data);
    throw new Error('Method not implemented.');
  }
}
