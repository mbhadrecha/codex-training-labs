# Stack Trace Answer Key

| Error type | Failing file and line | Likely root cause | Smallest safe fix |
| --- | --- | --- | --- |
| `TypeError` | `src/components/Dashboard.jsx:42` | The render path assumes `user.orders.items` exists before the async/user data is populated, so reading `items` crashes on `undefined`. | Guard the nested access and fall back to an empty list: `const items = props.user?.orders?.items ?? [];` |
| `React hook warning` | `src/hooks/useCounter.ts:24` | The hook reads `countRef.current` as derived reactive input even though refs are mutable and not tracked as stable dependencies. | Snapshot the ref inside the effect and depend only on stable values: `useEffect(() => { const currentCount = countRef.current; report(currentCount); }, [report]);` |
| `TypeError` | `src/routes/auth.js:18` | The route destructures `email` from `req.body` when no parsed request body is present. | Default the body before destructuring: `const { email } = req.body || {};` |
| `Cannot find module` | `src/server.js:6` | Startup imports `./controllers/userController`, but that module path is missing or mismatched on disk. | Add or align the controller module so the import resolves, for example `const userController = require("./controllers/userController");` with a real `src/controllers/userController.js` file. |
| `EADDRINUSE` | `src/server.js:38` | The server tries to listen on port `4000` while another process is already using it. | Use a configurable non-conflicting default in code: `const PORT = process.env.PORT || 4001;` |
