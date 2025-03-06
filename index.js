"use strict";
import 'dotenv/config';
import Librus from "librus-api";
import cron from "node-cron";
import axios from "axios";
import https from "https";
import fs from "fs";

const { LOGIN, PASSWORD, CERT_PATH, API_URL } = process.env;

if (!LOGIN || !PASSWORD || !CERT_PATH || !API_URL) {
  console.error("Missing environment variables. Check .env file.");
  process.exit(1);
}

async function sendLuckyNumber() {
  let agent;
  try {
    const customCert = fs.readFileSync(CERT_PATH);
    agent = new https.Agent({ ca: customCert });
  } catch (error) {
    return;
  }

  try {
    const client = new Librus();
    await client.authorize(LOGIN, PASSWORD);

    const luckyNumber = await client.info.getLuckyNumber();
    

    await axios.post(`${API_URL}/api/librus/luckynumber`, {
      number: luckyNumber,
    }, { httpsAgent: agent });

  } catch (error) {
    console.error("Error sending lucky number:", error.message);
  }
}

(async () => {
  await sendLuckyNumber();
})();

cron.schedule("0 7 * * 1-6", async () => {
  console.log("Running scheduled task: Sending lucky number...");
  await sendLuckyNumber();
  console.log("Task completed.");
}, {
  scheduled: true,
  timezone: "Europe/Warsaw"
});