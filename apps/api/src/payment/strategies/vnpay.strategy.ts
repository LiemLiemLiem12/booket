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
  private expireAmount: number;

  constructor(data: VnpayPayment) {
    this.apiUrl = data.apiUrl;
    this.secretKey = data.secretKey;
    this.apiVersion = data.apiVersion;
    this.command = data.command;
    this.tmnCode = data.tmnCode;
    this.locale = data.locale;
    this.currencyCode = data.currencyCode;
    this.returnUrl = data.returnUrl;
    this.expireAmount = data.expireAmount;
  }

  createPayment(
    orderId: string,
    amount: number,
    bankCode: string,
    ipAddress: string,
    transactionId: string,
  ) {
    let startDateObj = new Date();
    const expireDateObj = new Date();
    expireDateObj.setMinutes(
      expireDateObj.getMinutes() + Number(this.expireAmount),
    );
    const createDate = formatDate(startDateObj);
    const endDate = formatDate(expireDateObj);
    let vnp_Params: any = {};

    if (
      this.apiUrl === undefined ||
      this.secretKey === undefined ||
      this.apiVersion === undefined ||
      this.command === undefined ||
      this.tmnCode === undefined ||
      this.locale === undefined ||
      this.currencyCode === undefined ||
      this.returnUrl === undefined ||
      this.expireAmount === undefined
    ) {
      throw new Error('Missing VNPAY configuration');
    }

    vnp_Params['vnp_Version'] = this.apiVersion;
    vnp_Params['vnp_Command'] = this.command;
    vnp_Params['vnp_TmnCode'] = this.tmnCode;
    vnp_Params['vnp_Locale'] = this.locale;
    vnp_Params['vnp_CurrCode'] = this.currencyCode;
    vnp_Params['vnp_TxnRef'] = transactionId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = this.returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddress;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = endDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    hmac.update(signData);
    const signed = hmac.digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    const url =
      this.apiUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

    return url;
  }

  verifyWebhook(query: any): boolean {
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

    const secureHash = query['vnp_SecureHash'];
    if (!secureHash) return false;

    let vnp_Params = { ...query };
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    hmac.update(signData);
    const signed = hmac.digest('hex');

    return signed.toLowerCase() === secureHash.toLowerCase();
  }
}
