import { Controller, Post, Headers, Req, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@Controller('webhooks')
export class BillingController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Post('stripe')
  async stripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    return this.subscriptionsService.handleWebhook(req.rawBody, sig);
  }
}
