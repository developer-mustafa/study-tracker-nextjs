import test from 'node:test';
import assert from 'node:assert/strict';
import { buildBreakNotificationPayload } from './notifications';

test('buildBreakNotificationPayload generates default message when arguments are missing', () => {
  const payload = buildBreakNotificationPayload();
  assert.equal(payload.title, 'বিরতি নেওয়ার সময় হয়েছে! ☕');
  assert.match(payload.body, /হালকা বিরতি/);
  assert.equal(payload.tag, 'focusstudy-break-alert');
});

test('buildBreakNotificationPayload includes subject and duration when provided', () => {
  const payload = buildBreakNotificationPayload(25, 'উচ্চতর গণিত');
  assert.equal(payload.title, 'বিরতি নেওয়ার সময় হয়েছে! ☕');
  assert.match(payload.body, /উচ্চতর গণিত/);
  assert.match(payload.body, /২৫ মিনিট/);
});

test('buildBreakNotificationPayload includes subject name if duration is not provided', () => {
  const payload = buildBreakNotificationPayload(undefined, 'পদার্থবিজ্ঞান');
  assert.match(payload.body, /পদার্থবিজ্ঞান/);
});
