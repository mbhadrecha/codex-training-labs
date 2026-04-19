# Frontend Code Coverage Report

## Scope

Application under test:

- `src/App.jsx`
- `src/main.jsx`

Test files:

- `src/App.test.jsx`
- `src/main.test.jsx`

## Commands

Install dependencies:

```powershell
npm install
```

Run tests:

```powershell
npm test
```

Run coverage:

```powershell
npm run coverage
```

## Coverage results

Latest measured coverage from `coverage/coverage-summary.json`:

- Statements: `100%`
- Branches: `96.55%`
- Functions: `100%`
- Lines: `100%`

## Covered behaviors

The frontend coverage suite exercises:

- initial task load success
- initial task load failure
- loading-state rendering while fetch is pending
- successful task submission and form reset
- failed task submission and error messaging
- completion toggle success path
- completion toggle failure path
- error fallback when a failed response has no JSON body
- React bootstrap through `main.jsx`

## Notes

- The tests run in `jsdom` with Vitest and Testing Library.
- Coverage artifacts are generated in `frontend/coverage/`.
- Vite prints deprecation warnings during the run about internal `esbuild` options from the React plugin stack. The tests and coverage still complete successfully.
