import Notification from '../models/Notification';

export async function createNotification({
  userId,
  title,
  body,
  type,
  link,
}: {
  userId: string;
  title: string;
  body: string;
  type: string;
  link?: string;
}) {
  try {
    await Notification.create({
      user:  userId,
      title,
      body,
      type,
      link,
    });
  } catch (err) {
    console.error('Notification error:', err);
  }
}