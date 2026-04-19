#!/usr/bin/env node

function normalizeMaxRetries(rawValue) {
  if (rawValue === undefined) {
    return 3;
  }

  const parsed = Number(rawValue);

  if (!Number.isInteger(parsed) || parsed < 0) {
    console.warn("Invalid retry count supplied. Using 0 retries.");
    return 0;
  }

  return parsed;
}

const maxRetries = normalizeMaxRetries(process.argv[2]);
const windows = new Array(maxRetries).fill(1000);

console.log("Retry windows:", windows);
