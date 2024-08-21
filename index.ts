import { exec } from "node:child_process";

type ExecOptions = Parameters<typeof exec>[1];

interface Options extends ExecOptions {
	pipe?: boolean;
	exit?: boolean;
}

export function execute(
	script: string,
	options: Options = {},
): Promise<string> {
	const { pipe, exit, ...rest } = options;
	return new Promise((resolve, reject) => {
		const child = exec(
			script,
			rest as ExecOptions as any,
			(error, stdout = new Buffer("")) => {
				if (error) {
					error.code = child.exitCode;
					reject(error);
					return;
				}
				resolve(stdout.toString().trim());
			},
		);

		pipe && child.stdout.on("data", (...args) => process.stdout.write(...args));
		pipe && child.stderr.on("data", (...args) => process.stderr.write(...args));
		exit && child.on("exit", (code: number) => process.exit(code));
	});
}
