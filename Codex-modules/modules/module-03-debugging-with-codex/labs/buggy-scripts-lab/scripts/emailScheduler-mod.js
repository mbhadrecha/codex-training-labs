#!/usr/bin/env node

const sendEmail = async (message) => {
  console.log(`Sending "${message}" to the mailing list...`);
};

async function scheduleEmail(message) {
  console.log("Queueing message:", message);
  await sendEmail(message);
  console.log("Email sent successfully.");
}

scheduleEmail("Weekly stand-up reminder").catch((error) => {
  console.error("Failed to schedule email:", error);
  process.exitCode = 1;
});
