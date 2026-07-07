import { prisma } from '../../server';
import crypto from 'crypto';

export async function createAuditLog(
  userId: string,
  event: string,
  category: string,
  details: any
) {
  const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
  const dataToHash = JSON.stringify({ userId, event, category, details: detailsStr, timestamp: Date.now() });
  const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

  return prisma.auditLog.create({
    data: {
      userId,
      event,
      category,
      details: detailsStr,
      hash
    }
  });
}
