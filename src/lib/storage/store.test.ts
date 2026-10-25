import test from 'node:test';
import assert from 'node:assert/strict';
import { FocusStudyStore } from './store.js';

test('createTenant creates a tenant and sets active tenant', () => {
  const newTenant = FocusStudyStore.createTenant({
    name: 'মডেল টেস্ট একাডেমি',
    type: 'academy',
    description: 'এইচএসসি শিক্ষার্থীদের জন্য মডেল টেস্ট প্ল্যাটফর্ম',
    subscriptionPlanId: 'academy',
  });

  assert.ok(newTenant.id);
  assert.equal(newTenant.name, 'মডেল টেস্ট একাডেমি');
  assert.equal(newTenant.type, 'academy');
  assert.equal(FocusStudyStore.getActiveTenantId(), newTenant.id);

  const active = FocusStudyStore.getActiveTenant();
  assert.equal(active.id, newTenant.id);
});

test('blockUser and unblockUser toggle suspension state with reason', () => {
  const targetUid = 'user_tanvir_103';
  FocusStudyStore.blockUser(targetUid, 'পলিসি লঙ্ঘনের কারণে সাময়িক স্থগিত');

  let allUsers = FocusStudyStore.getAllUsers();
  let user = allUsers.find((u) => u.uid === targetUid);
  assert.ok(user);
  assert.equal(user?.isBlocked, true);
  assert.equal(user?.blockedReason, 'পলিসি লঙ্ঘনের কারণে সাময়িক স্থগিত');
  assert.ok(user?.blockedAt);

  // Unblock
  FocusStudyStore.unblockUser(targetUid);
  allUsers = FocusStudyStore.getAllUsers();
  user = allUsers.find((u) => u.uid === targetUid);
  assert.equal(user?.isBlocked, false);
  assert.equal(user?.blockedReason, undefined);
});

test('updatePaymentGateway updates gateway details for bKash, Nagad, Rocket', () => {
  FocusStudyStore.updatePaymentGateway('bkash', {
    accountNumber: '01700-112233',
    accountType: 'merchant',
    feePercentage: 1.8,
  });

  const gateways = FocusStudyStore.getPaymentGateways();
  const bkash = gateways.find((g) => g.id === 'bkash');
  assert.ok(bkash);
  assert.equal(bkash?.accountNumber, '01700-112233');
  assert.equal(bkash?.feePercentage, 1.8);
});

test('submitPaymentTransaction and approvePaymentTransaction flow', () => {
  const tx = FocusStudyStore.submitPaymentTransaction({
    gateway: 'bkash',
    senderNumber: '01711223344',
    trxId: 'TEST987BK',
    planId: 'pro',
    billingCycle: 'monthly',
    amount: 199,
  });

  assert.ok(tx.id);
  assert.equal(tx.status, 'pending');
  assert.equal(tx.trxId, 'TEST987BK');

  // Approve
  FocusStudyStore.approvePaymentTransaction(tx.id, 'mustafa.rahman.official@gmail.com');

  const txs = FocusStudyStore.getTransactions();
  const approved = txs.find((t) => t.id === tx.id);
  assert.ok(approved);
  assert.equal(approved?.status, 'approved');
  assert.equal(approved?.approvedBy, 'mustafa.rahman.official@gmail.com');
  assert.ok(approved?.approvedAt);
});

test('rejectPaymentTransaction updates status and rejection reason', () => {
  const tx = FocusStudyStore.submitPaymentTransaction({
    gateway: 'nagad',
    senderNumber: '01855667788',
    trxId: 'FAKETRX123',
    planId: 'premium',
    billingCycle: 'monthly',
    amount: 399,
  });

  FocusStudyStore.rejectPaymentTransaction(tx.id, 'অবৈধ ট্রানজেকশন আইডি', 'mustafa.rahman.official@gmail.com');

  const txs = FocusStudyStore.getTransactions();
  const rejected = txs.find((t) => t.id === tx.id);
  assert.ok(rejected);
  assert.equal(rejected?.status, 'rejected');
  assert.equal(rejected?.rejectionReason, 'অবৈধ ট্রানজেকশন আইডি');
});
