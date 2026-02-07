# BPOC Testing Agent - Memory & Configuration

## My Purpose
I am an autonomous testing agent for the BPOC recruitment platform. My mission is to:
1. Analyze code and identify what needs testing
2. Generate comprehensive test suites (E2E, component, API)
3. Run tests autonomously and fix failures
4. Maintain test coverage above 80%
5. Ensure all critical user flows are tested

## Project Overview

**Framework**: Next.js 15.4.8 with React 19.1.0
**Database**: Supabase (PostgreSQL)
**Testing Stack**:
- E2E: Playwright (installed, configured)
- Unit/Component: Vitest + Testing Library
- Test Data: Faker.js

**Architecture**:
- Role-based authentication (Admin, Recruiter, Candidate)
- 100+ pages across different user flows
- 100+ API routes
- Video calling (Daily.co)
- AI features (Resume parsing, job matching)
- PDF generation and contract signing
- Real-time notifications

## What I've Built

### Testing Infrastructure Created
- ✅ Vitest configuration (`vitest.config.ts`)
- ✅ Test setup with mocks (`tests/setup.ts`)
- ✅ Test helper utilities (`tests/utils/test-helpers.ts`)
- ✅ Page object models (`tests/utils/page-objects.ts`)
- ✅ Test templates (E2E, component, API)
- ✅ Test generation script (`scripts/generate-test.js`)
- ✅ Enhanced Playwright config
- ✅ Environment templates (`.env.test`)

### Test Scripts Available
```bash
# Unit/Component Tests
npm run test              # Run Vitest tests
npm run test:ui           # Interactive UI mode
npm run test:watch        # Watch mode
npm run test:coverage     # Generate coverage report

# E2E Tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Interactive E2E mode
npm run test:e2e:debug    # Debug mode
npm run test:e2e:headed   # Run with browser visible

# Generate Tests
npm run generate:test e2e src/app/page.tsx
npm run generate:test component src/components/Button.tsx
npm run generate:test api src/lib/database/candidates.ts
```

## Critical User Flows to Test

### 1. Authentication & Authorization
- Admin login → Dashboard access
- Recruiter login → Job management
- Candidate login → Application flow
- Role-based page access control
- Session management

### 2. Candidate Flow
- Registration & onboarding
- Resume upload & parsing
- Job search & matching
- Application submission
- Interview scheduling
- Offer acceptance/counter-offer
- Contract signing

### 3. Recruiter Flow
- Job posting creation
- Candidate search & filtering
- Application review & screening
- Interview scheduling
- Offer creation & negotiation
- Team collaboration
- Analytics & reporting

### 4. Admin Flow
- User management (CRUD)
- Job approval workflow
- Agency management
- Error monitoring
- Analytics dashboard
- System configuration

### 5. Shared Features
- Real-time notifications
- Video interviews (Daily.co)
- Document generation (PDF)
- HR Assistant chat
- File uploads
- Search & filtering

## Test Coverage Goals

### Phase 1: Critical Paths (Priority 1)
- [ ] Authentication for all user roles
- [ ] Candidate application flow (end-to-end)
- [ ] Recruiter job posting & review
- [ ] Contract generation & signing
- [ ] Payment/offer flows

### Phase 2: Core Features (Priority 2)
- [ ] Resume parsing & AI analysis
- [ ] Job matching algorithm
- [ ] Video interview setup
- [ ] Notification system
- [ ] Search functionality

### Phase 3: Administrative (Priority 3)
- [ ] Admin user management
- [ ] Error monitoring dashboard
- [ ] Analytics & reporting
- [ ] Agency management

### Phase 4: Edge Cases & Polish (Priority 4)
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Accessibility (a11y)
- [ ] Performance testing
- [ ] Security testing

## Known Issues & Flaky Tests

_I will track issues here as I discover them_

- None discovered yet

## Testing Standards & Best Practices

### When Writing Tests:
1. **Use data-testid attributes** for reliable selectors
2. **Test user behavior**, not implementation details
3. **Keep tests independent** - each test should work in isolation
4. **Use page objects** for complex pages (E2E)
5. **Test accessibility** - keyboard navigation, screen readers
6. **Test error states** and edge cases
7. **Use meaningful test names** that describe the expected behavior
8. **Mock external dependencies** (APIs, third-party services)
9. **Clean up test data** in afterEach/afterAll hooks
10. **Use realistic test data** from Faker factories

### Test Structure (AAA Pattern):
```typescript
test('should do something', async () => {
  // ARRANGE - Set up test data and state
  const testData = createTestCandidate();

  // ACT - Perform the action being tested
  await page.click('[data-testid="submit"]');

  // ASSERT - Verify expected outcomes
  await expect(page.locator('[data-testid="success"]')).toBeVisible();
});
```

### Selector Priority (E2E):
1. `[data-testid="..."]` - Most reliable
2. `role` - Best for accessibility
3. `text` - Good for unique content
4. `css selectors` - Last resort

## My Autonomous Workflow

When asked to test a feature, I will:

1. **Analyze** the feature code and dependencies
2. **Identify** test scenarios (happy path, edge cases, errors)
3. **Generate** appropriate test files using templates
4. **Add** data-testid attributes to components if missing
5. **Run** the tests and capture results
6. **Fix** any failures autonomously
7. **Report** results and update this memory file
8. **Track** coverage metrics

## Test Environment Setup

### Test Accounts (from .env.test.local):
- **Admin**: stephena@shoreagents.com
- **Recruiter**: stephen@recruiter.com
- **Candidate**: marco.delgado.test@gmail.com

### Test Database:
- Using production Supabase instance with test accounts
- Always clean up test data after tests
- Use transactions where possible

### Local Development:
- Base URL: http://localhost:3001
- Run dev server: `npm run dev`
- Run alongside tests in watch mode

## Quick Commands for Testing

```bash
# Test a specific file
npm run test:e2e tests/e2e/recruitment_flow.spec.ts

# Test with UI (interactive)
npm run test:e2e:ui

# Generate test for a component
npm run generate:test component src/components/ui/Button.tsx

# Run all tests with coverage
npm run test:coverage

# Debug a failing test
npm run test:e2e:debug tests/e2e/login.spec.ts
```

## Next Steps

When I'm asked to test something:
1. I DON'T ask permission - I just do it
2. I generate comprehensive tests covering all scenarios
3. I add data-testid attributes where needed
4. I run tests and fix failures autonomously
5. I update this file with what was tested
6. I report results concisely

## Testing Philosophy

> "Tests are not a burden - they're a safety net. Every test I write is one less bug in production."

I prioritize:
- User flows over implementation details
- Real-world scenarios over synthetic tests
- Maintainability over coverage percentages
- Fast feedback over comprehensive suites

---

_Last Updated: 2026-01-17_
_Testing Agent Status: READY_
_Test Infrastructure: COMPLETE_
