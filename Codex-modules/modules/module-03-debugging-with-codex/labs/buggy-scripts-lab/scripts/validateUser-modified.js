const userPayload = process.argv[2];

let user;
try {
  user = userPayload ? JSON.parse(userPayload) : undefined;
} catch {
  console.error("Invalid user JSON payload");
  process.exit(1);
}

function describeAccess(u) {
  if (!u || !Array.isArray(u.roles)) {
    return "No roles assigned";
  }

  return u.roles.map((role) => String(role).toUpperCase()).join(", ");
}

console.log("User access:", describeAccess(user));
