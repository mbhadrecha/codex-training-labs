const express = require("express");
const cors = require("cors");

const { loginUser } = require("./routes/auth");
const userController = require("./controllers/userController");

const app = express();
app.use(cors());
app.use(express.json());

const diagnostics = [
  {
    matcher: "Cannot read properties of undefined (reading 'items')",
    badLine: "const items = props.user.orders.items;",
    rootCause:
      "The component assumes `props.user.orders` exists before ensuring `props.user` is populated, so `orders` is undefined at render time.",
    fixSuggestion:
      "Guard against missing data paths and render a loader or empty state until `user.orders` is defined.",
    patchPreview: `--- src/components/Dashboard.jsx
+++ src/components/Dashboard.jsx
@@
-const items = props.user.orders.items;
+const items = props.user?.orders?.items ?? [];
`
  },
  {
    matcher: "Mutable values like 'countRef.current'",
    badLine: "useEffect(() => {\n  report(countRef.current);\n});",
    rootCause:
      "The hook derives effect behavior from `countRef.current`, which is mutable and does not belong in React's dependency model.",
    fixSuggestion:
      "Read the ref into a local snapshot inside the effect and depend only on stable values such as `report`.",
    patchPreview: `--- src/hooks/useCounter.ts
+++ src/hooks/useCounter.ts
@@
-  useEffect(() => {
-    report(countRef.current);
-  });
+  useEffect(() => {
+    const currentCount = countRef.current;
+    report(currentCount);
+  }, [report]);
`
  },
  {
    matcher: "Cannot destructure property 'email' of 'req.body' as it is undefined.",
    badLine: "const { email } = req.body;",
    rootCause:
      "The route assumes the request body exists, but the handler can run before a JSON payload is parsed or when no body was sent.",
    fixSuggestion:
      "Default `req.body` to an empty object before destructuring and keep `express.json()` enabled.",
    patchPreview: `--- src/routes/auth.js
+++ src/routes/auth.js
@@
-  const { email } = req.body;
+  const { email } = req.body || {};
`
  },
  {
    matcher: "Cannot find module './controllers/userController'",
    badLine: "const userController = require(\"./controllers/userController\");",
    rootCause:
      "The startup import points to a controller path that does not exist on disk, so Node fails during module resolution.",
    fixSuggestion:
      "Add the missing controller file or correct the import path so it matches the real module name.",
    patchPreview: `--- src/server.js
+++ src/server.js
@@
-const userController = require("./controllers/userController");
+const userController = require("./controllers/userController");
`
  },
  {
    matcher: "listen EADDRINUSE: address already in use :::4000",
    badLine: "app.listen(PORT, () => {",
    rootCause:
      "The server tries to bind to port 4000 while another process is already using it.",
    fixSuggestion:
      "Use a configurable port and avoid hard-coding the conflicting default.",
    patchPreview: `--- src/server.js
+++ src/server.js
@@
-const PORT = process.env.PORT || 4000;
+const PORT = process.env.PORT || 4001;
`
  }
];

function analyzeStackTrace(trace) {
  const normalizedTrace = trace ?? "";
  return (
    diagnostics.find((entry) => normalizedTrace.includes(entry.matcher)) || {
      badLine: "Unable to locate the bad line",
      rootCause:
        "Codex could not parse the supplied stack trace. Confirm the stack trace includes file names and line numbers.",
      fixSuggestion:
        "Re-run the scenario locally, copy the console stack trace, and resend it once it includes the throw site.",
      patchPreview: "No patch available."
    }
  );
}

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    controllerLoaded: typeof userController.getUserSummary === "function"
  });
});

app.get("/users/:id", userController.getUserSummary);
app.post("/login", loginUser);

app.post("/stack-trace", (req, res) => {
  const { stackTrace } = req.body || {};
  const payload = analyzeStackTrace(stackTrace);
  return res.json(payload);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Stack trace diagnostics listening on port ${PORT}`);
});
