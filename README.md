# async-execute [![](https://img.shields.io/npm/v/async-execute.svg)](https://www.npmjs.com/package/async-execute)

## 🦅 Execute command in a child process

```js
import { execute } from "async-execute";

const commit_message = await execute("git log -1 --pretty=%B"); // Committed some changes
```

## Options

### Pipe stdout and stderr (default: false)

```js
await execute("npm t", { pipe: true });
```

### Exit process with child's exit code (default: false)

```js
await execute("npm t", { pipe: true, exit: true });
```

### Check a script exits properly

```js
let code = 0;

try {
	const result = await execute("exit 2");
	code = result.code;
} catch (error) {
	code = error.code;
}

if (code > 0) {
	// something must have gone wrong
}
```

## Any [exec option](https://nodejs.org/api/child_process.html#child_processexeccommand-options-callback) can be passed

```js
await execute("echo $API_KEY", {
	env: { API_KEY: "vQQNJe7lnz4rTbYvr61VywR0wRlRzCyI" },
});

await execute("pwd", { cwd: "~/app" });
```
