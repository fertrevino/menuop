# Testing Setup for Menuop

This directory contains the test suite for the Menuop application.

## Setup

The testing setup includes:

- **Jest** as the test runner
- **@testing-library/react** for component testing
- **@testing-library/jest-dom** for additional matchers
- **jsdom** environment for browser-like testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run QR Code and Menu Access prevention tests specifically
npm test -- __tests__/utils/uuid-slug-detection.test.ts  # UUID vs Slug logic
npm test -- __tests__/utils/qr-detection.test.ts         # QR parameter detection
npm test -- __tests__/utils/menu.test.ts                 # Menu validation
npm test -- __tests__/database/slug-generation.test.ts   # Database slug rules
npm test -- __tests__/developer-mode

# Run all prevention tests together
npm test -- __tests__/utils/ __tests__/database/

# Run integration tests
npm test -- __tests__/integration/
```

## Test Structure

Tests are organized in the `__tests__` directory with the following structure:

```
__tests__/
├── utils/
│   ├── menu.test.ts                    # Menu utility functions tests
│   ├── uuid-slug-detection.test.ts    # UUID vs Slug detection logic
│   └── qr-detection.test.ts           # QR parameter detection logic
├── database/
│   └── slug-generation.test.ts        # Database slug generation logic
├── services/                          # API service tests (coming soon)
├── hooks/                             # React hooks tests (coming soon)
└── components/                        # Component tests (coming soon)
```

## Current Test Coverage

### ✅ Menu Utilities (`lib/utils/menu.ts`)

- **validateMenu**: Tests menu validation logic
- **createEmptyMenu**: Tests empty menu creation with default structure
- **createEmptySection**: Tests empty section creation with default and custom names
- **createEmptyItem**: Tests empty menu item creation
- **hasUnsavedChanges**: Tests change detection
- **calculateMenuStats**: Tests menu statistics calculation

### ✅ UUID vs Slug Detection (`utils/uuid-slug-detection.test.ts`)

**Prevents QR Code Menu Access Issues** - Tests the critical identification logic:

- **UUID Detection**: Correctly identifies valid UUIDs vs slugs
- **Query Field Selection**: Ensures proper database field selection
- **Edge Cases**: Various UUID formats and slug patterns
- **Real-world Scenarios**: Based on actual problematic cases like "test-res-test"

### ✅ QR Code Detection (`utils/qr-detection.test.ts`)

**Prevents QR Tracking Issues** - Tests QR parameter detection:

- **QR Parameter Detection**: Tests ?qr=1, ?source=qr parameters
- **Direct Access Detection**: Empty referrer indicates QR scan
- **Edge Cases**: Malformed parameters, URL encoding, case sensitivity
- **Real-world Scenarios**: QR scanner apps, social media referrers

### ✅ Slug Generation Logic (`database/slug-generation.test.ts`)

**Prevents Slug Generation Issues** - Tests database slug creation:

- **Slug Formatting**: Various restaurant/menu name combinations
- **Special Character Handling**: Removes/normalizes special characters
- **Conflict Resolution**: Duplicate slug handling with counters
- **URL Safety**: Ensures generated slugs are URL-safe

### ✅ QR Workflow Integration (`integration/qr-menu-workflow.test.ts`)

**Prevents End-to-End Issues** - Tests the complete QR workflow:

- **Menu Access**: MenuService.getPublicMenuById with slugs/UUIDs
- **QR Detection**: Various QR parameter combinations
- **Error Recovery**: Graceful handling of network/server errors

## QR Code Issue Prevention

The test suite specifically prevents these issues that occurred:

### 🚫 **Issue: 404 on QR Code Access**

- **Problem**: QR codes generated URLs with slugs, but API only accepted UUIDs
- **Prevention**: `uuid-slug-detection.test.ts` verifies both UUID and slug detection
- **Quick Test**: `npm test -- __tests__/utils/uuid-slug-detection.test.ts`

### 🚫 **Issue: QR Parameter Not Detected**

- **Problem**: QR tracking failed when parameters were missing or malformed
- **Prevention**: `qr-detection.test.ts` tests all QR parameter scenarios
- **Quick Test**: `npm test -- __tests__/utils/qr-detection.test.ts`

### 🚫 **Issue: Invalid Slug Generation**

- **Problem**: Inconsistent slug generation caused lookup failures
- **Prevention**: `slug-generation.test.ts` validates slug creation rules
- **Quick Test**: `npm test -- __tests__/database/slug-generation.test.ts`

## Quick Prevention Commands

```bash
# Test the exact issue that occurred (UUID vs slug detection)
npm test -- __tests__/utils/uuid-slug-detection.test.ts

# Test QR parameter detection (?qr=1, ?source=qr, empty referrer)
npm test -- __tests__/utils/qr-detection.test.ts

# Test complete QR workflow (scan → menu access → tracking)
npm test -- __tests__/integration/qr-menu-workflow.test.ts

# Run all prevention tests at once (86 tests in ~1 second)
npm test -- __tests__/utils/ __tests__/database/

# Run services tests
npm test -- __tests__/services/
```

## Benefits for AI Development

These tests provide:

- ✅ **Immediate feedback** when AI agents make changes
- ✅ **Regression detection** to catch breaking changes
- ✅ **Documentation** of expected behavior
- ✅ **Confidence** in refactoring and extending code
- ✅ **Examples** of how functions should be used
