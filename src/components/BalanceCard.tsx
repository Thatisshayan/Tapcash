"use client";

import { CreditCard, Gift, Bitcoin, Banknote } from 'lucide-react';

interface WithdrawMethod {
  id: string;
  label: string;
  iconColor: string;
}

interface BalanceCardProps {
  balance: number;
  growthPercent: number;
  pointsToWithdraw: number;
  currentAmount: number;
  targetAmount: number;
  withdrawMethods?: WithdrawMethod[];
}

export default function BalanceCard({ 
  balance, 
  growthPercent, 
  pointsToWithdraw, 
  currentAmount, 
  targetAmount,
  withdrawMethods = [
    { id: 'paypal', label: 'PayPal', iconColor: '#31F06F' },
    { id: 'giftcard', label: 'Gift Card', iconColor: '#18D9FF' },
    { id: 'crypto', label: 'Crypto', iconColor: '#FFC442' },
    { id: 'bank', label: 'Bank', iconColor: '#7C3DFF' }
  ]
}: BalanceCardProps) {
  const progress = (currentAmount / targetAmount) * 100;
  
  const icons = {
    paypal: CreditCard,
    giftcard: Gift,
    crypto: Bitcoin,
    bank: Banknote
  };

  return (
    <div className="model-u-card">
      <span className="uppercase text-[#B9C5DF] text-[13px] font-extrabold">YOUR BALANCE</span>
      <strong className="block text-[44px] my-2">${balance.toFixed(2)}</strong>
      <em className="text-[#31F06F] font-extrabold not-italic">+{growthPercent}% today</em>
      
      <div className="relative model-u-progress-bar my-4">
        <i 
          className="model-u-progress-fill" 
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <small className="text-[#C1C9DD]">Pts. {pointsToWithdraw} to withdraw</small>
        <small className="text-white font-bold">${currentAmount.toFixed(2)} / ${targetAmount.toFixed(2)}</small>
      </div>
      
      <div className="flex gap-3">
        {withdrawMethods.map((method) => {
          const Icon = icons[method.id as keyof typeof icons] || CreditCard;
          return (
            <div 
              key={method.id}
              className="flex-1 h-12 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--model-u-line)] flex items-center justify-center"
              title={method.label}
            >
              <Icon size={18} style={{ color: method.iconColor }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Made with Bob
