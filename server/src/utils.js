import crypto from 'crypto';
import Community from './models/Community.js';
import Notification from './models/Notification.js';

export const inviteCode = () => crypto.randomBytes(4).toString('hex').toUpperCase();
export async function isMember(userId, communityId) {
  return Community.exists({ _id: communityId, 'members.user': userId });
}
export async function notify(recipient, type, message, transaction) {
  return Notification.create({ recipient, type, message, transaction });
}
export const publicUser = 'name avatarUrl bio rating completedBorrows communities';
