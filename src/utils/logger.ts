import * as vscode from "vscode";

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
}

export class Logger {
	private static _instance: Logger | undefined;
	private outputChannel: vscode.OutputChannel;
	private logLevel: LogLevel = LogLevel.INFO;
	private static readonly REDACTED = "[REDACTED]";
	private static readonly SENSITIVE_KEY_PATTERN =
		/(token|accessToken|refreshToken|authorization|password|secret|apiKey|pat)/i;
	private static readonly BEARER_PATTERN = /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi;

	private constructor() {
		this.outputChannel = vscode.window.createOutputChannel("Azure DevOps PR Viewer");
	}

	public static getInstance(): Logger {
		if (!Logger._instance) {
			Logger._instance = new Logger();
		}
		return Logger._instance;
	}

	public setLogLevel(level: LogLevel): void {
		this.logLevel = level;
	}

	public show(): void {
		this.outputChannel.show();
	}

	public debug(message: string, ...args: unknown[]): void {
		if (this.logLevel <= LogLevel.DEBUG) {
			this.log("DEBUG", message, ...args);
		}
	}

	public info(message: string, ...args: unknown[]): void {
		if (this.logLevel <= LogLevel.INFO) {
			this.log("INFO", message, ...args);
		}
	}

	public warn(message: string, ...args: unknown[]): void {
		if (this.logLevel <= LogLevel.WARN) {
			this.log("WARN", message, ...args);
		}
	}

	public error(message: string, error?: unknown): void {
		if (this.logLevel <= LogLevel.ERROR) {
			const errorDetails = this.sanitizeValue(error instanceof Error ? error.message : String(error));
			const stackTrace = error instanceof Error && error.stack ? `\n${error.stack}` : "";
			this.log("ERROR", `${this.sanitizeValue(message)}: ${errorDetails}${this.sanitizeValue(stackTrace)}`);
		}
	}

	private log(level: string, message: string, ...args: unknown[]): void {
		const timestamp = new Date().toISOString();
		const sanitizedMessage = this.sanitizeValue(message);
		const formattedArgs = args.length > 0 ? ` ${JSON.stringify(this.sanitizeArgs(args))}` : "";
		this.outputChannel.appendLine(`[${timestamp}] [${level}] ${sanitizedMessage}${formattedArgs}`);
	}

	private sanitizeArgs(args: unknown[]): unknown[] {
		return args.map((arg) => this.sanitizeObject(arg));
	}

	private sanitizeObject(value: unknown): unknown {
		if (typeof value === "string") {
			return this.sanitizeValue(value);
		}

		if (Array.isArray(value)) {
			return value.map((item) => this.sanitizeObject(item));
		}

		if (value && typeof value === "object") {
			const result: Record<string, unknown> = {};
			for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
				if (Logger.SENSITIVE_KEY_PATTERN.test(key)) {
					result[key] = Logger.REDACTED;
					continue;
				}

				result[key] = this.sanitizeObject(nestedValue);
			}
			return result;
		}

		return value;
	}

	private sanitizeValue(value: string): string {
		let sanitized = value;

		// Redact explicit key-value token-like fields in text logs.
		sanitized = sanitized.replace(
			/(token|accessToken|refreshToken|authorization|password|secret|apiKey|pat)\s*[:=]\s*[^\s,;]+/gi,
			(_match, key: string) => `${key}=${Logger.REDACTED}`,
		);

		// Redact bearer tokens.
		sanitized = sanitized.replace(Logger.BEARER_PATTERN, `Bearer ${Logger.REDACTED}`);

		return sanitized;
	}

	public clear(): void {
		this.outputChannel.clear();
	}

	public dispose(): void {
		this.outputChannel.dispose();
	}
}
