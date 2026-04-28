import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { getStripe } from './stripeClient.js';
import { logger } from '../lib/logger.js';

async function resolveRetentionUserId(tx: Prisma.TransactionClient, excludeUserId: string): Promise<string> {
  const configured = env.ACCOUNT_TRANSFER_USER_ID?.trim();
  if (configured && configured !== excludeUserId) {
    const u = await tx.user.findUnique({ where: { id: configured } });
    if (u) return u.id;
  }

  const head = await tx.user.findFirst({
    where: { role: 'head_admin', NOT: { id: excludeUserId } },
    select: { id: true },
  });
  if (head) return head.id;

  const admin = await tx.user.findFirst({
    where: { role: 'admin', NOT: { id: excludeUserId } },
    select: { id: true },
  });
  if (admin) return admin.id;

  const any = await tx.user.findFirst({
    where: { NOT: { id: excludeUserId } },
    select: { id: true },
  });
  if (!any) {
    throw new AppError(
      'Cannot delete the last account in the database from this endpoint. Contact support.',
      503,
      'NO_TRANSFER_TARGET'
    );
  }
  return any.id;
}

export async function deleteUserAccount(opts: {
  userId: string;
  password?: string;
  /** Required literal confirmation */
  confirmation: string;
}): Promise<void> {
  if (opts.confirmation !== 'DELETE MY ACCOUNT') {
    throw new AppError('Confirmation phrase does not match', 400, 'BAD_CONFIRMATION');
  }

  const user = await prisma.user.findUnique({ where: { id: opts.userId } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

  if (user.passwordHash) {
    if (!opts.password) throw new AppError('Password required for this account', 400, 'PASSWORD_REQUIRED');
    const ok = await bcrypt.compare(opts.password, user.passwordHash);
    if (!ok) throw new AppError('Invalid password', 401, 'INVALID_PASSWORD');
  }

  const stripe = getStripe();
  if (stripe && user.stripeCustomerId) {
    try {
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.cancel(user.stripeSubscriptionId);
      }
      await stripe.customers.del(user.stripeCustomerId);
    } catch (e) {
      logger.warn({ err: e, userId: user.id }, 'stripe_cleanup_failed_nonfatal');
    }
  }

  await prisma.$transaction(async (tx) => {
    const retentionId = await resolveRetentionUserId(tx, user.id);

    await tx.faction.updateMany({
      where: { createdById: user.id },
      data: { createdById: retentionId },
    });

    await tx.user.delete({ where: { id: user.id } });
  });
}
