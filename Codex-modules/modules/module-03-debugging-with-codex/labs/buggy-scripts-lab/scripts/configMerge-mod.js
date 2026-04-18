#!/usr/bin/env node

const defaults = {
  host: "api.example.com",
  retries: 3,
  timeout: 5000
};

function parseOverrides(rawOverrides) {
  if (!rawOverrides) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawOverrides);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.warn("Invalid overrides payload supplied. Using defaults.");
    return {};
  }
}

const overrides = parseOverrides(process.argv[2]);
const consolidated = { ...defaults, ...overrides };

console.log("Merged configuration:", consolidated);
