# Backend Code Coverage Report

## Scope

Application under test:

- `src/index.js`

Test file:

- `tests/api.test.js`

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
- Branches: `100%`
- Functions: `100%`
- Lines: `100%`

## Covered behaviors

The backend coverage suite exercises:

- `GET /tasks` on a clean boot
- default-port startup behavior when `PORT` is unset
- valid task creation with trimming and defaults
- task creation without optional `due` and `notes`
- invalid task payload rejection
- completion toggle success path
- completion toggle missing-task path
- malformed JSON handling through the Express error middleware

## Notes

- The tests boot the existing Express app without modifying application code.
- Coverage artifacts are generated in `backend/coverage/`.
- During malformed JSON testing, the backend intentionally logs the parsing error through its existing error middleware. That log is expected.
