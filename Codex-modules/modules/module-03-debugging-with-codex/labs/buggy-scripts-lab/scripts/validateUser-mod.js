#!/usr/bin/env node

function parseUserPayload(rawPayload) {
  if (!rawPayload) {
    return {};
  }

  try {
    return JSON.parse(rawPayload);
  } catch (error) {
    console.warn("Invalid user payload supplied. Falling back to an empty user.");
    return {};
  }
}

function describeAccess(user) {
  const roles = Array.isArray(user.roles) ? user.roles : [];

  if (roles.length === 0) {
    return "No roles assigned";
  }

  return roles.map((role) => String(role).toUpperCase()).join(", ");
}

const user = parseUserPayload(process.argv[2]);
console.log("User access:", describeAccess(user));
