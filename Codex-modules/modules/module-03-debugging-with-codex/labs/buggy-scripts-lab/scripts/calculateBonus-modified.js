#!/usr/bin/env node

const BONUS_RATES = {
  high: 0.15,
  medium: 0.08,
  low: 0.04
};

const salary = Number(process.argv[2] || 50000);
const performance = process.argv[3] || "medium";

const payout = calculateBonus(salary, performance);
console.log(`Calculated bonus for ${performance} performance: ${payout}`);

function calculateBonus(amount, level) {
  const rate = BONUS_RATES[level];

  if (typeof rate !== "number") {
    console.error(`Unknown performance level: ${level}`);
    process.exit(1);
  }

  return amount * rate;
}
