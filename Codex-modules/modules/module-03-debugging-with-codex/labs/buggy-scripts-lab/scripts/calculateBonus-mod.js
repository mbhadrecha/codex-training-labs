#!/usr/bin/env node

const salary = Number(process.argv[2] || 50000);
const performance = process.argv[3] || "medium";

const BONUS_RATES = {
  high: 0.15,
  medium: 0.08,
  low: 0.04
};

function calculateBonus(amount, level) {
  const rate = BONUS_RATES[level] ?? BONUS_RATES.medium;
  return amount * rate;
}

const payout = calculateBonus(salary, performance);
console.log(`Calculated bonus for ${performance} performance: ${payout}`);
