import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  const { username, password } = req.body;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    // Add OnlyFans login automation steps here
    await browser.close();

    res.status(200).json({ success: true, message: "Login successful!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Login failed", error: err.message });
  }
}