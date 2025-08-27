/**
 * Test Runner for QR Code and Menu Access Prevention Tests
 * Run this script to execute all tests that help prevent QR/menu access issues
 */

import { execSync } from "child_process";

const testSuites = [
  {
    name: "Menu Utilities",
    path: "__tests__/utils/menu.test.ts",
    description: "Core menu validation and utilities",
  },
  {
    name: "Public Menu API",
    path: "__tests__/api/public/menus.test.ts",
    description: "Slug vs UUID menu lookup logic",
  },
  {
    name: "QR Tracking API",
    path: "__tests__/api/public/track-qr-scan.test.ts",
    description: "QR code scan tracking with menu resolution",
  },
  {
    name: "Slug Generation",
    path: "__tests__/database/slug-generation.test.ts",
    description: "Database slug generation rules and edge cases",
  },
  {
    name: "QR Workflow Integration",
    path: "__tests__/integration/qr-menu-workflow.test.ts",
    description: "End-to-end QR code to menu access workflow",
  },
];

console.log("🧪 Running QR Code and Menu Access Prevention Tests\n");

let totalPassed = 0;
let totalFailed = 0;

testSuites.forEach(({ name, path, description }) => {
  console.log(`📋 Running: ${name}`);
  console.log(`   ${description}`);

  try {
    const output = execSync(`npm test -- ${path} --verbose`, {
      encoding: "utf-8",
      stdio: "pipe",
    });

    // Parse Jest output for pass/fail counts
    const passMatch = output.match(/(\d+) passed/);
    const failMatch = output.match(/(\d+) failed/);

    const passed = passMatch ? parseInt(passMatch[1]) : 0;
    const failed = failMatch ? parseInt(failMatch[1]) : 0;

    totalPassed += passed;
    totalFailed += failed;

    if (failed === 0) {
      console.log(`   ✅ ${passed} tests passed\n`);
    } else {
      console.log(`   ❌ ${failed} tests failed, ${passed} tests passed\n`);
    }
  } catch (error) {
    console.log(`   ❌ Test suite failed to run\n`);
    totalFailed++;
  }
});

console.log("📊 Summary:");
console.log(`   ✅ ${totalPassed} tests passed`);
console.log(`   ❌ ${totalFailed} tests failed`);

if (totalFailed === 0) {
  console.log("\n🎉 All QR Code and Menu Access prevention tests passed!");
  console.log("Your changes are protected against similar issues.");
} else {
  console.log("\n⚠️  Some tests failed. Please review and fix the issues.");
  process.exit(1);
}
