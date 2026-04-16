# Stack Trace Playground Answer Key

This answer key maps each practice trace to the likely issue and the smallest safe patch a reviewer or debugging assistant should suggest.

## Trace 1: React render TypeError

**Issue**

`Dashboard.render` crashes at `src/components/Dashboard.jsx:42` because code is reading `items` from an undefined object.

**Likely root cause**

The component assumes a prop or fetched payload is always present, but the first render happens before data is loaded, or the caller forgot to pass the expected object.

**Smallest safe patch**

Guard the access and provide a safe default so the component can render before data arrives.

```diff
- const itemCount = data.items.length;
+ const itemCount = data?.items?.length ?? 0;
```

If the component receives props directly, an equally safe fix is:

```diff
- function Dashboard({ data }) {
+ function Dashboard({ data = { items: [] } }) {
```

**Why this patch**

It removes the immediate crash without changing the surrounding render flow.

## Trace 2: Hook dependency warning

**Issue**

`src/hooks/useCounter.ts:24` is using `countRef.current` as if it were reactive derived state.

**Likely root cause**

A mutable ref is being read inside logic that expects tracked values. Updating a ref does not trigger re-renders or behave like state, so effects and derived data can drift out of sync.

**Smallest safe patch**

Use state or a memoized value derived from state instead of computing from `countRef.current`.

```diff
- const doubled = countRef.current * 2;
+ const doubled = count * 2;
```

If an effect depends on the count, depend on state instead of the ref field:

```diff
- useEffect(() => {
-   syncCount(countRef.current);
- }, [countRef.current]);
+ useEffect(() => {
+   syncCount(count);
+ }, [count]);
```

**Why this patch**

It aligns the hook with React's reactive model and removes a class of stale-value bugs.

## Trace 3: Backend route crash

**Issue**

`src/routes/auth.js:18` tries to destructure `email` from `req.body`, but `req.body` is `undefined`.

**Likely root cause**

The Express app is missing JSON body parsing middleware, or the route is receiving a non-JSON request without validation.

**Smallest safe patch**

Register `express.json()` before the route and add a defensive fallback in the handler.

```diff
// src/server.js
+ app.use(express.json());
```

```diff
- const { email, password } = req.body;
+ const { email, password } = req.body ?? {};
+ if (!email || !password) {
+   return res.status(400).json({ error: "Email and password are required." });
+ }
```

**Why this patch**

It fixes the root setup problem and prevents the route from throwing if the client sends a bad payload.

## Trace 4: Missing module during startup

**Issue**

Startup fails because `src/server.js:6` requires `./controllers/userController`, but Node cannot resolve that module.

**Likely root cause**

The import path is wrong, the file was renamed, or the controller was never created/exported at the expected location.

**Smallest safe patch**

Point the import at the real file path, or create the missing file with the expected export.

```diff
- const userController = require("./controllers/userController");
+ const userController = require("./controllers/usersController");
```

If the file is actually missing, add it:

```js
// src/controllers/userController.js
function getUser(req, res) {
  res.json({ ok: true });
}

module.exports = { getUser };
```

**Why this patch**

Module resolution errors are usually path or file-name mismatches, so the safest fix is to align the import with the real filesystem layout.

## Trace 5: Port already in use

**Issue**

`src/server.js:38` fails on `listen` because port `4000` is already occupied.

**Likely root cause**

Another dev server is still running, or a previous crash left the process alive.

**Smallest safe patch**

Stop the existing process first. If the app should support configurable ports, make the port override explicit.

```diff
- const PORT = 4000;
+ const PORT = process.env.PORT || 4000;
```

On Windows, the operational fix is typically:

```powershell
netstat -ano | findstr :4000
Stop-Process -Id <PID>
```

**Why this patch**

The code change makes local collisions easier to work around, while stopping the existing process resolves the immediate failure.

## Summary

- Trace 1 is a null-safety problem in React rendering.
- Trace 2 is a misuse of `ref.current` where state should drive derived values or effects.
- Trace 3 is a missing request-body guard, usually paired with missing `express.json()` middleware.
- Trace 4 is a bad import path or a missing controller file.
- Trace 5 is an environment/runtime conflict, with an optional port-config patch to improve developer experience.
