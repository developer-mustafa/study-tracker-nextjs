/**
 * Browser Notification Utility for FocusStudy
 * Triggers "Time to take a break" alert when a focus session finishes
 */

import { toBengaliNumber } from './formatters';

export type NotificationSupportStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function getBrowserNotificationStatus(): NotificationSupportStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationSupportStatus> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Failed to request notification permission:', err);
    return Notification.permission || 'unsupported';
  }
}

export interface BreakNotificationPayload {
  title: string;
  body: string;
  tag: string;
  icon?: string;
}

export function buildBreakNotificationPayload(
  durationMinutes?: number,
  subjectName?: string
): BreakNotificationPayload {
  const title = 'বিরতি নেওয়ার সময় হয়েছে! ☕';
  let body = 'আপনার ফোকাস সেশনের সময় শেষ হয়েছে। এখন একটু হালকা বিরতি নিয়ে রিফ্রেশ হয়ে নিন!';

  const formattedMins = durationMinutes ? toBengaliNumber(durationMinutes) : '';

  if (subjectName && durationMinutes) {
    body = `${subjectName} বিষয়ে ${formattedMins} মিনিট পড়ার সেশন সমাপ্ত হয়েছে। ৫ মিনিটের ছোট বিরতি নিন ও পানি পান করুন।`;
  } else if (subjectName) {
    body = `${subjectName} বিষয়ে পড়ার সেশন সমাপ্ত হয়েছে। এখন একটু বিশ্রাম নিন।`;
  } else if (durationMinutes) {
    body = `${formattedMins} মিনিটের ফোকাস সেশন সফলভাবে সম্পন্ন হয়েছে। এখন বিরতির সময়।`;
  }

  return {
    title,
    body,
    tag: 'focusstudy-break-alert',
  };
}

export function triggerBreakNotification(
  durationMinutes?: number,
  subjectName?: string
): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  if (Notification.permission !== 'granted') {
    return null;
  }

  const payload = buildBreakNotificationPayload(durationMinutes, subjectName);

  try {
    const notif = new Notification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      silent: false,
    } as NotificationOptions);

    notif.onclick = () => {
      window.focus();
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn('Unable to trigger native browser notification:', err);
    return null;
  }
}
