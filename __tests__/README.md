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
```

## Test Structure

Tests are organized in the `__tests__` directory with the following structure:

```
__tests__/
├── utils/
│   └── menu.test.ts          # Menu utility functions tests
├── services/                 # API service tests (coming soon)
├── hooks/                    # React hooks tests (coming soon)
└── components/               # Component tests (coming soon)
```

## Current Test Coverage

### ✅ Menu Utilities (`lib/utils/menu.ts`)

- **validateMenu**: Tests menu validation logic

  - Valid menu validation
  - Missing required fields (name, restaurant_name)
  - Section validation (missing section names)
  - Item validation (missing names, invalid prices)
  - Multiple error collection

- **createEmptyMenu**: Tests empty menu creation with default structure

- **createEmptySection**: Tests empty section creation with default and custom names

- **createEmptyItem**: Tests empty menu item creation

- **hasUnsavedChanges**: Tests change detection

  - Identical menus (no changes)
  - Menu name changes
  - Section additions
  - Item price changes

- **calculateMenuStats**: Tests menu statistics calculation
  - Correct item/section counts
  - Average price calculation
  - Price range determination
  - Empty menu handling

## What's Tested

This first test suite covers the core menu utility functions that are critical for:

- ✅ Data validation before saving menus
- ✅ Form state management and change detection
- ✅ Menu statistics and calculations
- ✅ Creating default menu structures

## Next Steps

The following test suites should be added next:

1. **API Route Tests** (`app/api/**/*.ts`)
2. **Service Layer Tests** (`lib/services/*.ts`)
3. **React Hook Tests** (`hooks/*.tsx`)
4. **Component Tests** (`app/components/*.tsx`)
5. **Integration Tests** (full user workflows)

## Benefits for AI Development

These tests provide:

- ✅ **Immediate feedback** when AI agents make changes
- ✅ **Regression detection** to catch breaking changes
- ✅ **Documentation** of expected behavior
- ✅ **Confidence** in refactoring and extending code
- ✅ **Examples** of how functions should be used
