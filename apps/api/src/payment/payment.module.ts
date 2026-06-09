import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import VnpayStrategy from './strategies/vnpay.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: VnpayStrategy,
      useFactory: (configService: ConfigService) => {
        return new VnpayStrategy({
          apiUrl: configService.get<string>('VNPAY_API_URL', 'api-url'),
          secretKey: configService.get<string>(
            'VNPAY_SECRET_KEY',
            'secret-key',
          ),
          apiVersion: configService.get<string>(
            'VNPAY_API_VERSION',
            'api-version',
          ),
          command: configService.get<string>('VNPAY_COMMAND', 'command'),
          tmnCode: configService.get<string>('VNPAY_TMN_CODE', 'tmn-code'),
          locale: configService.get<string>('VNPAY_LOCALE', 'locale'),
          currencyCode: configService.get<string>(
            'VNPAY_CURRENCY_CODE',
            'currency-code',
          ),
          returnUrl: configService.get<string>(
            'VNPAY_RETURN_URL',
            'return-url',
          ),
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class PaymentModule {}
