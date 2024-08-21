import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { execute } from "./index.ts";

describe("async-execute", () => {
	const { write: stdout } = process.stdout;
	const { write: stderr } = process.stderr;
	afterEach(() => {
		process.stdout.write = stdout;
		process.stderr.write = stderr;
	});

	it("Should return console output", async () =>
		assert.equal(await execute('echo "Hello"'), "Hello"));

	it("Should return multi line answers", async () =>
		assert.equal(await execute('echo "Hello\nthere"'), "Hello\nthere"));

	it("Should trim line breaks and white space from the edges", async () =>
		assert.equal(await execute('echo "\n\n    Hello		\n\n     	 "'), "Hello"));

	it("Should always return a string", async () =>
		assert.equal(typeof (await execute('echo "hello" > /dev/null')), "string"));

	it("Should pass the exit code on error", async () => {
		let code = 0;

		try {
			await execute("exit 14");
		} catch (error) {
			code = error.code;
		}

		assert.equal(code, 14);
	});

	it("Should pipe output", async () => {
		let called = 0;
		Object.defineProperty(process.stdout, "write", {
			value: function (...args) {
				++called;
				stdout.apply(this, args);
			},
			writable: true,
			configurable: true,
		});

		const code = `node -p "console.log('one'); setTimeout(console.log, 100, 'two'); console.log('end'); 'fin'"`;
		const result = await execute(code, { pipe: true });
		assert.equal(result, "one\nend\ntwo\nfin");
	});

	it("Should pipe stderr", async () => {
		let called = 0;
		let outputs = [];
		Object.defineProperty(process.stderr, "write", {
			value: function (...args) {
				outputs.push(...args);
				++called;
				stderr.apply(this, args);
			},
			writable: true,
			configurable: true,
		});

		const code = "node -p \"process.stderr.write('one'); 'end'\"";
		const result = await execute(code, { pipe: true });
		assert.equal(called, 1);
		assert.deepEqual(outputs, ["one"]);
		assert.equal(result, "end");
	});

	it("Should throw an error", async () => {
		let threw = false;
		let err;
		const cmd = 'echo "message content" >&2 ; exit 125';

		try {
			await execute(cmd);
		} catch (error) {
			err = error;
			threw = true;
		}

		assert.equal(err.code, 125);
		assert.equal(err.cmd, cmd);
		assert.match(err.message, /message content/);
		assert(threw, "Should have thrown an error");
	});

	it("Should pass on parameters to exec: env", async () => {
		assert.equal(
			await execute("echo $SOME_KEY", {
				env: { SOME_KEY: "Balue" },
			}),
			"Balue",
		);
	});
	it("Should pass on parameters to exec: cwd", async () => {
		assert.notEqual(process.cwd(), "/"); // test the test
		assert.equal(await execute("pwd"), process.cwd());
		assert.equal(await execute("pwd", { cwd: "/" }), "/");
	});
});
