import Stripe from 'stripe';
import { env } from '../config/env.js';

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!stripe) {
    stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
  }
  return stripe;
}
