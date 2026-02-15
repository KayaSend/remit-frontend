import { useMemo } from 'react';
import type { Remittance, RecipientBalance, PaymentRequest, Category } from '@/types/remittance';

export function useMockRemittances(): Remittance[] {
  return useMemo(() => [
    {
      id: '1',
      recipientPhone: '+254712345678',
      recipientName: 'Mary Wanjiku',
      totalAmount: 500,
      remainingBalance: 320,
      allocations: [
        { category: 'electricity' as Category, allocated: 100, spent: 45, dailyLimit: 15 },
        { category: 'water' as Category, allocated: 50, spent: 20, dailyLimit: 10 },
        { category: 'rent' as Category, allocated: 200, spent: 0, isOneTime: true },
        { category: 'education' as Category, allocated: 100, spent: 100 },
        { category: 'food' as Category, allocated: 50, spent: 15, dailyLimit: 10 },
      ],
      status: 'active',
      createdAt: new Date('2024-01-15'),
      expiresAt: new Date('2024-04-15'),
    },
    {
      id: '2',
      recipientPhone: '+254723456789',
      recipientName: 'John Kamau',
      totalAmount: 300,
      remainingBalance: 180,
      allocations: [
        { category: 'electricity' as Category, allocated: 80, spent: 40, dailyLimit: 10 },
        { category: 'food' as Category, allocated: 120, spent: 80, dailyLimit: 20 },
        { category: 'education' as Category, allocated: 100, spent: 0 },
      ],
      status: 'active',
      createdAt: new Date('2024-01-20'),
      expiresAt: new Date('2024-04-20'),
    },
  ], []);
}

export function useMockRecipientBalances(): RecipientBalance[] {
  return useMemo(() => [
    {
      category: 'electricity' as Category,
      availableKES: 8432,
      availableUSD: 55,
      dailyLimitKES: 2300,
      dailySpentKES: 500,
      isActive: true,
    },
    {
      category: 'water' as Category,
      availableKES: 4602,
      availableUSD: 30,
      dailyLimitKES: 1535,
      dailySpentKES: 0,
      isActive: true,
    },
    {
      category: 'rent' as Category,
      availableKES: 30700,
      availableUSD: 200,
      dailySpentKES: 0,
      isActive: true,
    },
    {
      category: 'food' as Category,
      availableKES: 5372,
      availableUSD: 35,
      dailyLimitKES: 1535,
      dailySpentKES: 768,
      isActive: true,
    },
  ], []);
}

export function useMockPaymentHistory(): PaymentRequest[] {
  return useMemo(() => [
    {
      id: '1',
      remittanceId: '1',
      category: 'electricity' as Category,
      amountKES: 1500,
      amountUSD: 9.77,
      accountNumber: '12345678901',
      status: 'completed',
      createdAt: new Date('2024-01-25'),
      mpesaConfirmation: 'RKH4XYZ123',
    },
    {
      id: '2',
      remittanceId: '1',
      category: 'food' as Category,
      amountKES: 2300,
      amountUSD: 14.98,
      accountNumber: 'NAIVAS-001',
      status: 'completed',
      createdAt: new Date('2024-01-24'),
      mpesaConfirmation: 'RKH3ABC456',
    },
    {
      id: '3',
      remittanceId: '1',
      category: 'water' as Category,
      amountKES: 800,
      amountUSD: 5.21,
      accountNumber: '987654321',
      status: 'pending',
      createdAt: new Date('2024-01-26'),
    },
  ], []);
}
