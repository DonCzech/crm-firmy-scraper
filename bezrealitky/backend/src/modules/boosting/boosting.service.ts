import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BoostType } from '@prisma/client';
import Stripe from 'stripe';

const BOOST_PRICES: Record<BoostType, { amount: number; days: number }> = {
  TOP: { amount: 29900, days: 7 },
  EXTEND: { amount: 19900, days: 30 },
  HIGHLIGHT: { amount: 14900, days: 14 },
};

@Injectable()
export class BoostingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY', ''), { apiVersion: '2023-10-16' });
  }

  async purchaseBoost(userId: string, listingId: string, type: BoostType) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const { amount, days } = BOOST_PRICES[type];

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'czk',
            unit_amount: amount,
            product_data: { name: `Boost inzerátu: ${type}` },
          },
          quantity: 1,
        },
      ],
      success_url: `${this.config.get('APP_URL')}/inzerat/${listingId}?boost=success`,
      cancel_url: `${this.config.get('APP_URL')}/inzerat/${listingId}`,
      metadata: { userId, listingId, boostType: type, days: String(days) },
    });

    return { checkoutUrl: session.url };
  }

  async activateBoost(listingId: string, userId: string, type: BoostType, days: number, paymentId: string) {
    const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000);
    return this.prisma.boost.create({
      data: { listingId, userId, type, stripePaymentId: paymentId, expiresAt },
    });
  }
}
