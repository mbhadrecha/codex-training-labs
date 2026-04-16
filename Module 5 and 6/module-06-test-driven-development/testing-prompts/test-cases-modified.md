# Test Cases for Todo App

This document defines project-specific test cases for the Todo App located at:

`C:\Users\1000060437\codex-training\Day03\codex-training-labs\Module 5 and 6\module-06-test-driven-development\todo-app`

The test cases below are aligned to the current application behavior:

- Backend: Node/Express API in `backend/src/index.js`
- Frontend: React + Vite app in `frontend/src/App.jsx`
- Backend default port: `4033`
- Frontend dev server port: `5133`
- Data persistence: in-memory only; restarting the backend clears tasks

## 1. Test Environment Details

- Application under test: Todo App
- Frontend technology: React
- Frontend dev server: Vite
- Frontend default URL: `http://localhost:5133`
- Backend technology: Node.js + Express
- Backend default URL: `http://localhost:4033`
- API base configuration: `VITE_API_BASE`, defaulting to `http://localhost:4033`
- Data store: In-memory `tasks` array
- Main API endpoints:
  - `GET /tasks`
  - `POST /tasks`
  - `PATCH /tasks/:id/complete`
- Required field: `title`
- Optional fields: `due`, `notes`
- Automation stack currently available:
  - Backend: Node test runner + `c8`
  - Frontend: Vitest + Testing Library
- Suggested browsers for manual validation:
  - Chrome latest
  - Edge latest
- Suggested OS for execution:
  - Windows 10/11
- Test data convention: Use unique titles such as `Todo QA <timestamp>`

## 2. Unit Test Cases

### TC-UNIT-001: Validate required title rejection

- Objective: Verify that empty, missing, or whitespace-only titles are rejected by backend validation logic.
- Precondition: Backend validation path is reachable through `POST /tasks`.
- Test Data: `{}`, `{ "title": "" }`, `{ "title": "   " }`
- Steps:
  1. Send a create-task request with each invalid payload.
  2. Observe the response for each request.
- Expected Result: Each request returns `400` with error message `Task title is required.`
- Priority: High

### TC-UNIT-002: Validate task creation defaults

- Objective: Verify that a newly created task is assigned default values correctly.
- Precondition: Backend service is running.
- Test Data: `{ "title": "Prepare notes" }`
- Steps:
  1. Send `POST /tasks` with only a valid title.
  2. Inspect the created response body.
- Expected Result: The created task contains `completed: false`, `due: null`, `notes: ""`, non-empty `id`, and valid `createdAt`.
- Priority: High

### TC-UNIT-003: Validate title and notes trimming

- Objective: Verify that title and notes are trimmed before persistence.
- Precondition: Backend service is running.
- Test Data: `{ "title": "  Review release  ", "notes": "  Bring checklist  " }`
- Steps:
  1. Send `POST /tasks` with leading and trailing spaces.
  2. Inspect the returned task object.
- Expected Result: Stored `title` is `Review release` and stored `notes` is `Bring checklist`.
- Priority: Medium

### TC-UNIT-004: Validate completion toggle behavior

- Objective: Verify that toggling a task flips the `completed` flag from false to true and back.
- Precondition: A task exists in backend memory.
- Test Data: Created task ID from a valid `POST /tasks`.
- Steps:
  1. Create a task.
  2. Call `PATCH /tasks/:id/complete`.
  3. Call the same endpoint again.
- Expected Result: First toggle returns `completed: true`; second toggle returns `completed: false`.
- Priority: High

## 3. Integration Test Cases

### TC-INT-001: Create task and retrieve via list API

- Objective: Verify that a task created through `POST /tasks` is returned by `GET /tasks`.
- Precondition: Backend service is running.
- Test Data: `{ "title": "Integration task", "notes": "Created through API integration" }`
- Steps:
  1. Send `POST /tasks`.
  2. Capture the returned task ID.
  3. Send `GET /tasks`.
  4. Search the list for the created ID.
- Expected Result: The created task appears in the returned array with correct values.
- Priority: High

### TC-INT-002: Create task and toggle from incomplete to complete

- Objective: Verify that the create and complete endpoints work together in sequence.
- Precondition: Backend service is running.
- Test Data: `{ "title": "Integration toggle task" }`
- Steps:
  1. Create a task using `POST /tasks`.
  2. Call `PATCH /tasks/:id/complete`.
  3. Retrieve the tasks list.
- Expected Result: The toggled task appears with `completed: true` in the API response flow.
- Priority: High

### TC-INT-003: Frontend load action reads backend tasks successfully

- Objective: Verify that the frontend initial load can consume the backend `GET /tasks` response.
- Precondition:
  - Backend is running on `4033`
  - Frontend is running on `5133`
  - At least one task exists in backend memory
- Test Data: Existing backend task
- Steps:
  1. Start backend and create one task.
  2. Open the frontend.
  3. Observe the task list section.
- Expected Result: The frontend renders the existing backend task and item count matches backend data.
- Priority: High

## 4. End-to-End Test Cases

### TC-E2E-001: Create a task through the UI

- Objective: Verify the full user journey of creating a task through the React form.
- Precondition:
  - Backend and frontend are running
  - Frontend points to backend URL
- Test Data:
  - Title: `E2E create task`
  - Due: valid future date
  - Notes: `Created from browser flow`
- Steps:
  1. Open the frontend in the browser.
  2. Enter title, due date, and notes.
  3. Click `Save task to backend`.
  4. Observe the list after submission.
- Expected Result: Success message appears, form clears, and the task appears in the task list.
- Priority: Critical

### TC-E2E-002: Toggle task completion through the UI

- Objective: Verify the full user journey of marking a task complete and then incomplete.
- Precondition:
  - Backend and frontend are running
  - At least one task is visible in the frontend
- Test Data: Existing task from UI
- Steps:
  1. Click `Mark complete`.
  2. Verify the task updates visually.
  3. Click `Mark undone`.
  4. Verify the task returns to incomplete state.
- Expected Result: The same task toggles between complete and incomplete without page reload.
- Priority: Critical

### TC-E2E-003: Recover from backend outage during submission

- Objective: Verify user-facing behavior when backend becomes unavailable during task save.
- Precondition:
  - Frontend is running
  - Backend is stopped after page load
- Test Data:
  - Title: `Backend outage task`
- Steps:
  1. Open the frontend.
  2. Stop the backend service.
  3. Enter a valid title.
  4. Submit the form.
- Expected Result: An error message is shown, the app does not crash, and the user can retry after backend recovery.
- Priority: High

## 5. Frontend Test Cases

### TC-FE-001: Required title field blocks empty submission

- Objective: Verify the frontend does not allow empty task submission.
- Precondition: Frontend is loaded in browser.
- Test Data: Empty title
- Steps:
  1. Leave the title field blank.
  2. Click `Save task to backend`.
- Expected Result: Browser validation prevents form submission and no task is posted.
- Priority: High

### TC-FE-002: Loading state appears during initial fetch

- Objective: Verify the frontend shows a loading message while tasks are being fetched.
- Precondition:
  - Frontend is opened
  - Backend response is delayed or network throttling is applied
- Test Data: Delayed `GET /tasks` response
- Steps:
  1. Start frontend.
  2. Delay the backend list response.
  3. Observe the list panel.
- Expected Result: `Loading saved tasks` is displayed until the response completes.
- Priority: Medium

### TC-FE-003: Empty state appears when no tasks exist

- Objective: Verify the frontend displays an empty-state message when the backend list is empty.
- Precondition:
  - Backend is running
  - No tasks exist in memory
- Test Data: Empty backend task list
- Steps:
  1. Start backend with no existing tasks.
  2. Open the frontend.
- Expected Result: `No tasks yet. Submit one above.` is displayed.
- Priority: Medium

### TC-FE-004: Form resets after successful task creation

- Objective: Verify the title, due date, and notes fields are cleared after a successful save.
- Precondition:
  - Backend and frontend are running
  - Backend is reachable
- Test Data:
  - Title: `Reset form task`
  - Due: valid date
  - Notes: `Verify reset`
- Steps:
  1. Fill all fields.
  2. Submit the form.
  3. Observe input fields after success.
- Expected Result: All form fields are cleared and success status is shown.
- Priority: High

## 6. API Test Cases

### TC-API-001: GET tasks returns JSON array

- Objective: Verify the list endpoint returns a JSON array.
- Precondition: Backend service is running.
- Test Data: None
- Steps:
  1. Send `GET /tasks`.
  2. Inspect status code and response type.
- Expected Result: Status is `200` and response body is a JSON array.
- Priority: Critical

### TC-API-002: POST task creates a valid task object

- Objective: Verify task creation returns the expected schema.
- Precondition: Backend service is running.
- Test Data: `{ "title": "API schema task", "due": "2026-05-01", "notes": "API validation" }`
- Steps:
  1. Send `POST /tasks`.
  2. Inspect the response payload.
- Expected Result: Response status is `201` and payload includes `id`, `title`, `due`, `notes`, `completed`, and `createdAt`.
- Priority: High

### TC-API-003: PATCH unknown task returns 404

- Objective: Verify the completion endpoint handles unknown IDs safely.
- Precondition: Backend service is running.
- Test Data: `missing-task-id`
- Steps:
  1. Send `PATCH /tasks/missing-task-id/complete`.
  2. Inspect the response.
- Expected Result: Status is `404` and payload contains `Task not found.`
- Priority: High

### TC-API-004: Invalid JSON is handled gracefully

- Objective: Verify malformed JSON does not crash the API.
- Precondition: Backend service is running.
- Test Data: Invalid JSON body such as `{"title":`
- Steps:
  1. Send `POST /tasks` with malformed JSON and header `Content-Type: application/json`.
  2. Inspect response and server status.
  3. Send `GET /tasks` afterward.
- Expected Result: API returns controlled error response and remains available for subsequent requests.
- Priority: High

## 7. Performance Test Cases

### TC-PERF-001: GET tasks list responds within local performance threshold

- Objective: Verify the read endpoint stays responsive under normal local load.
- Precondition: Backend service is running.
- Test Data: 100 repeated `GET /tasks` requests
- Steps:
  1. Send 100 requests to `GET /tasks`.
  2. Capture average response time and 95th percentile.
- Expected Result: Error rate is 0%, average response time is below 150 ms, and 95th percentile is below 300 ms in local environment.
- Priority: Medium

### TC-PERF-002: Repeated create requests do not destabilize the service

- Objective: Verify the API remains responsive after multiple valid creates.
- Precondition: Backend service is running.
- Test Data: 50 unique valid task payloads
- Steps:
  1. Submit 50 `POST /tasks` requests sequentially or concurrently.
  2. Record response status and timing.
  3. Send `GET /tasks` after execution.
- Expected Result: All requests succeed, no server crash occurs, and created tasks are visible in the list.
- Priority: Medium

## 8. Security Test Cases

### TC-SEC-001: Script-like title input is rendered safely

- Objective: Verify script-like content does not execute in the browser when displayed as task title.
- Precondition:
  - Backend and frontend are running
  - Frontend renders tasks returned by backend
- Test Data: `<script>alert('xss')</script>`
- Steps:
  1. Create a task with the script-like title.
  2. Open or refresh the frontend.
  3. Observe browser behavior.
- Expected Result: Title appears as text, no script executes, and no alert is triggered.
- Priority: High

### TC-SEC-002: Whitespace-only payload is rejected

- Objective: Verify the API blocks whitespace-only input to prevent meaningless records.
- Precondition: Backend service is running.
- Test Data: `{ "title": "    " }`
- Steps:
  1. Send `POST /tasks` with whitespace-only title.
  2. Inspect response and task list afterward.
- Expected Result: Response is `400`, error is returned, and no task is created.
- Priority: High

### TC-SEC-003: Large notes payload does not crash the system

- Objective: Verify that unusually large but syntactically valid input is handled safely.
- Precondition: Backend service is running.
- Test Data: Valid title with notes field containing several thousand characters
- Steps:
  1. Send a large valid task payload.
  2. Observe the response.
  3. Call `GET /tasks` after submission.
- Expected Result: The server stays available and returns a controlled response.
- Priority: Medium

## 9. Regression Test Cases

### TC-REG-001: Core create-list-toggle flow still works after code changes

- Objective: Verify the primary feature flow remains intact after any refactor or enhancement.
- Precondition:
  - Latest frontend and backend changes are deployed locally
  - Backend and frontend are running
- Test Data: Valid task title, optional due date, optional notes
- Steps:
  1. Create a task.
  2. Confirm it appears in the list.
  3. Mark it complete.
  4. Mark it incomplete again.
- Expected Result: All steps work with no functional regression.
- Priority: Critical

### TC-REG-002: Validation messaging remains unchanged

- Objective: Verify required-field validation still returns understandable error feedback.
- Precondition: Backend service is running.
- Test Data:
  - Missing title
  - Empty title
  - Whitespace-only title
- Steps:
  1. Submit each invalid payload to `POST /tasks`.
  2. Inspect response codes and error messages.
- Expected Result: All invalid requests return `400` with clear validation feedback.
- Priority: High

### TC-REG-003: In-memory reset behavior remains consistent after restart

- Objective: Verify backend restart clears tasks as expected for this implementation.
- Precondition: Backend service is running and at least one task exists.
- Test Data: Existing created task
- Steps:
  1. Create one or more tasks.
  2. Confirm they appear in `GET /tasks`.
  3. Restart the backend.
  4. Call `GET /tasks` again.
- Expected Result: Task list is empty after restart because persistence is in-memory only.
- Priority: Medium

## 10. Smoke Test Cases

### TC-SMOKE-001: Backend starts and responds

- Objective: Verify backend startup before deeper testing begins.
- Precondition: Backend dependencies are installed.
- Test Data: None
- Steps:
  1. Start backend using `npm start`.
  2. Send `GET /tasks`.
- Expected Result: Backend starts successfully and `GET /tasks` returns `200`.
- Priority: Critical

### TC-SMOKE-002: Frontend loads main page successfully

- Objective: Verify frontend startup and basic page rendering.
- Precondition: Frontend dependencies are installed.
- Test Data: None
- Steps:
  1. Start frontend using `npm run dev`.
  2. Open `http://localhost:5133`.
- Expected Result: Main page loads, form is visible, and no blocking error is shown.
- Priority: Critical

### TC-SMOKE-003: Basic task submission works

- Objective: Verify the most important app action works in a minimal validation pass.
- Precondition:
  - Backend and frontend are running
  - Frontend can reach backend
- Test Data: `{ "title": "Smoke task" }`
- Steps:
  1. Enter task title in the UI.
  2. Click `Save task to backend`.
- Expected Result: Task is created and displayed in the list.
- Priority: Critical

## 11. Acceptance Test Cases

### TC-ACC-001: User can create and manage a task end-to-end

- Objective: Validate the main user story for basic task tracking.
- Precondition:
  - Backend and frontend are running
  - User can access the frontend in browser
- Test Data:
  - Title: `Acceptance task`
  - Due: valid date
  - Notes: `Created for acceptance`
- Steps:
  1. Open the frontend.
  2. Enter title, due date, and notes.
  3. Save the task.
  4. Verify it appears in the list.
  5. Mark it complete.
  6. Mark it incomplete again.
- Expected Result: User completes the full task lifecycle successfully without page refresh or crash.
- Priority: Critical

### TC-ACC-002: User receives clear feedback for invalid submission

- Objective: Validate that the user is guided when required information is missing.
- Precondition: Frontend is running.
- Test Data: Empty title
- Steps:
  1. Open the Todo form.
  2. Leave title blank.
  3. Attempt to submit.
- Expected Result: Submission is blocked, invalid task is not created, and the user can correct the form.
- Priority: High

### TC-ACC-003: User can understand backend outage state

- Objective: Validate that the application gives understandable feedback when backend connectivity fails.
- Precondition:
  - Frontend is running
  - Backend is unavailable
- Test Data: Valid title entered in UI
- Steps:
  1. Open the frontend while backend is down or stop backend before save.
  2. Enter a valid task title.
  3. Attempt submission.
- Expected Result: The UI shows an error message, does not crash, and allows the user to retry later.
- Priority: High
