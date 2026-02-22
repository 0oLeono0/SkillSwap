# Create UI Test Helpers

Test utility structure for the `Create` page:

- `index.ts`: single import entry point for tests.
- `createPageTestMocks.ts`: mocks (`useAuth`, `useFiltersBaseData`, navigate) and `setup*` helpers.
- `createPageTestHelpers.ts`: grouped helpers `createPageQueries`, `createPageActions`, `createPageAssertions`.
- `createPageTestHarness.ts`: render harness for common test scenarios.
- `createPageTestTypes.ts`: shared test types (`ShortcutModifier`, `ShortcutTarget`, `UserEventInstance`).
- `uiMocks.tsx`: UI mocks (for example, `Select`) used by unit/integration tests.
