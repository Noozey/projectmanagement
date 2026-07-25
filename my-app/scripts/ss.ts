// scripts/ss.ts
import { chromium } from "@playwright/test";
import { readFileSync, mkdirSync } from "fs";

// Paste your token here
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmdWxsTmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAZ21haWwuY29tIiwiYXZhdGFyIjpudWxsLCJ1aWQiOiI2ZTc3N2ExZi1kYzYyLTQxYzctYTBjZi1lZjk1YjNiNjU4NmUiLCJpYXQiOjE3NzY4MDkzMjMsImV4cCI6MTc3NjgxMjkyM30.0Y1a5Vai_GKdA8wR86KifDqXIRHyUbzhri51K7hI2W4";

const routeTreeSrc = readFileSync("./src/routeTree.gen.ts", "utf-8");
const pathMatches = routeTreeSrc.matchAll(/path:\s*['"]([^'"]+)['"]/g);
const routes = [
  ...new Set(
    [...pathMatches]
      .map((m) => m[1])
      .filter((p) => !p.includes("$") && !p.includes("*")),
  ),
];

console.log("Routes found:", routes);

mkdirSync("./screenshots", { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Navigate once to set localStorage (domain must match)
await page.goto("http://localhost:3000");
await page.evaluate((token) => {
  localStorage.setItem("token", token);
}, AUTH_TOKEN);

for (const route of routes) {
  await page.goto(`http://localhost:3000${route}`);
  await page.waitForLoadState("networkidle");

  await new Promise((r) => setTimeout(r, 2000)); // wait 1s for renders/animations

  const filename = route.replace(/\//g, "_").replace(/^_/, "") || "index";
  await page.screenshot({
    path: `./screenshots/${filename}.png`,
    fullPage: true,
  });
  console.log(`✓ ${route}`);
}

await browser.close();
