const defaults = {
  host: "api.example.com",
  retries: 3,
  timeout: 5000
};

const overridesPayload = process.argv[2];

let overrides = {};
try {
  overrides = overridesPayload ? JSON.parse(overridesPayload) : {};
} catch {
  console.error("Invalid overrides JSON payload");
  process.exit(1);
}

const consolidated = { ...defaults, ...overrides };
console.log("Merged configuration:", consolidated);
