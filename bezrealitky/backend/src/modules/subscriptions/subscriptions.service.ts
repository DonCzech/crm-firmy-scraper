import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService, private config: ConfigService) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY', ''), { apiVersion: '2023-10-16' });
  }

  async mySubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async startSubscription(userId: string, tier: SubscriptionTier) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    let sub = await this.prisma.subscription.findUnique({ where: { userId } });

    // Get or create Stripe customer
    let customerId = sub?.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    const priceId = tier === SubscriptionTier.PREMIUM
      ? this.config.get('STRIPE_PRICE_PREMIUM')
      : this.config.get('STRIPE_PRICE_STANDARD');

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${this.config.get('APP_URL')}/ucet?checkout=success`,
      cancel_url: `${this.config.get('APP_URL')}/cenik`,
      metadata: { userId, tier },
    });

    await this.prisma.subscription.upsert({
      where: { userId },
      create: { userId, stripeCustomerId: customerId, tier: SubscriptionTier.FREE, status: 'TRIALING' },
      update: { stripeCustomerId: customerId },
    });

    return { checkoutUrl: session.url };
  }

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeSubscriptionId) return false;

    await this.stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });
    return true;
  }

  async handleWebhook(payload: Buffer, sig: string) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } catch {
      throw new Error('Invalid webhook signature');
    }

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.userId;
        if (!userId) break;
        const tier = (stripeSub.metadata?.tier as SubscriptionTier) ?? SubscriptionTier.STANDARD;
        await this.prisma.subscription.update({
          where: { userId },
          data: {
            tier,
            status: stripeSub.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
            stripeSubscriptionId: stripeSub.id,
            currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
          },
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const stripeSub = event.data.object as Stripe.Subscription;
        const userId = stripeSub.metadata?.userId;
        if (!userId) break;
        await this.prisma.subscription.update({
          where: { userId },
          data: { tier: SubscriptionTier.FREE, status: 'CANCELED', stripeSubscriptionId: null },
        });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const sub = await this.prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
        if (sub) {
          await this.prisma.invoice.create({
            data: {
              userId: sub.userId,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid,
              currency: invoice.currency.toUpperCase(),
              status: 'paid',
              pdfUrl: invoice.invoice_pdf,
            },
          });
        }
        break;
      }
    }
    return { received: true };
  }
}
