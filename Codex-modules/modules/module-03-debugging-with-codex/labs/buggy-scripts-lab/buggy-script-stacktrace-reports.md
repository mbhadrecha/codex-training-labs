# Buggy Script Stacktrace Reports

This report captures the raw failure from each original buggy script, the root cause, the fix applied in the corresponding `-mod` clone, and the verification output after the fix.

## 1. `calculateBonus.js`

**Command run**

```powershell
node scripts/calculateBonus.js
```

**Raw error**

```text
c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\calculateBonus.js:16
  return amount * BONUS_RATES[level];
                  ^

ReferenceError: Cannot access 'BONUS_RATES' before initialization
    at calculateBonus (c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\calculateBonus.js:16:19)
    at Object.<anonymous> (c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\calculateBonus.js:6:16)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.14.0
```

**Root cause**

`calculateBonus()` is called before the `BONUS_RATES` constant is initialized, so the function hits the temporal dead zone when it reads `BONUS_RATES[level]`.

**Fix in `calculateBonus-mod.js`**

Move `BONUS_RATES` above the first `calculateBonus()` call and add a fallback to the `medium` rate if an unknown performance level is provided.

**Verification**

```powershell
node scripts/calculateBonus-mod.js
```

```text
Calculated bonus for medium performance: 4000
```

## 2. `validateUser.js`

**Command run**

```powershell
node scripts/validateUser.js
```

**Raw error**

```text
c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\validateUser.js:5
  return u.roles.map((role) => role.toUpperCase()).join(", ");
           ^

TypeError: Cannot read properties of undefined (reading 'roles')
    at describeAccess (c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\validateUser.js:5:12)
    at Object.<anonymous> (c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\validateUser.js:8:29)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.14.0
```

**Root cause**

The script allows `user` to be `undefined`, then immediately reads `u.roles` without checking whether a user object or a roles array exists.

**Fix in `validateUser-mod.js`**

Parse the input safely, fall back to an empty object on missing or invalid JSON, verify that `roles` is an array, and return a friendly message when no roles are assigned.

**Verification**

Default run:

```powershell
node scripts/validateUser-mod.js
```

```text
User access: No roles assigned
```

Happy-path run with valid JSON payload:

```text
User access: ADMIN, EDITOR
```

## 3. `emailScheduler.js`

**Command run**

```powershell
node scripts/emailScheduler.js
```

**Raw error**

```text
c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\emailScheduler.js:7
  await sendEmail(message);
  ^^^^^

SyntaxError: await is only valid in async functions and the top level bodies of modules
    at wrapSafe (node:internal/modules/cjs/loader:1486:18)
    at Module._compile (node:internal/modules/cjs/loader:1528:20)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.14.0
```

**Root cause**

`await` is used inside `scheduleEmail()`, but that function is not declared `async`.

**Fix in `emailScheduler-mod.js`**

Declare `scheduleEmail()` as `async`, await `sendEmail()` legally, and attach a `.catch(...)` handler to surface any future async errors cleanly.

**Verification**

```powershell
node scripts/emailScheduler-mod.js
```

```text
Queueing message: Weekly stand-up reminder
Sending "Weekly stand-up reminder" to the mailing list...
Email sent successfully.
```

## 4. `configMerge.js`

**Command run**

```powershell
node scripts/configMerge.js
```

**Raw error**

```text
c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\configMerge.js:7
const consolidated = { ...defaults, ...overrides };
                                       ^

ReferenceError: overrides is not defined
    at Object.<anonymous> (c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\configMerge.js:7:40)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.14.0
```

**Root cause**

The script spreads `overrides` into the merged config, but no `overrides` variable is ever declared.

**Fix in `configMerge-mod.js`**

Parse an optional JSON overrides argument, default to `{}` when the argument is missing or invalid, and merge the result with `defaults`.

**Verification**

Default run:

```powershell
node scripts/configMerge-mod.js
```

```text
Merged configuration: { host: 'api.example.com', retries: 3, timeout: 5000 }
```

Happy-path run with overrides:

```text
Merged configuration: {
  host: 'api.example.com',
  retries: 3,
  timeout: 10000,
  region: 'us-east-1'
}
```

## 5. `retryHandler.js`

**Command run**

```powershell
node scripts/retryHandler.js
```

**Raw error**

```text
c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\retryHandler.js:2
const windows = new Array(maxRetries).fill(1000);
                ^

RangeError: Invalid array length
    at Object.<anonymous> (c:\Users\1000060437.CORP\Github-Repo-Clone\codex-training-labs\Codex-modules\modules\module-03-debugging-with-codex\labs\buggy-scripts-lab\scripts\retryHandler.js:2:17)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
    at Object..js (node:internal/modules/cjs/loader:1706:10)
    at Module.load (node:internal/modules/cjs/loader:1289:32)
    at Function._load (node:internal/modules/cjs/loader:1108:12)
    at TracingChannel.traceSync (node:diagnostics_channel:322:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:220:24)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:170:5)
    at node:internal/main/run_main_module:36:49

Node.js v22.14.0
```

**Root cause**

The default value for `maxRetries` is `-2`, and `new Array(-2)` throws `RangeError: Invalid array length`.

**Fix in `retryHandler-mod.js`**

Validate the CLI value before using it, default to `3` retries when no value is supplied, and fall back to `0` when the provided value is not a non-negative integer.

**Verification**

Default run:

```powershell
node scripts/retryHandler-mod.js
```

```text
Retry windows: [ 1000, 1000, 1000 ]
```

Happy-path run with a positive retry count:

```text
Retry windows: [ 1000, 1000, 1000, 1000 ]
```
