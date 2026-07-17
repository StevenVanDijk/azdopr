import * as assert from "node:assert";
import { setup, suite, teardown, test } from "mocha";
import * as sinon from "sinon";
import * as vscode from "vscode";
import { LogLevel, Logger } from "../../../utils/logger";

suite("logger", () => {
	let appendLineStub: sinon.SinonStub;
	let mockOutputChannel: vscode.LogOutputChannel;

	setup(() => {
		appendLineStub = sinon.stub();
		mockOutputChannel = {
			appendLine: appendLineStub,
			append: sinon.stub(),
			clear: sinon.stub(),
			show: sinon.stub(),
			hide: sinon.stub(),
			dispose: sinon.stub(),
			trace: sinon.stub(),
			debug: sinon.stub(),
			info: sinon.stub(),
			warn: sinon.stub(),
			error: sinon.stub(),
			logLevel: vscode.LogLevel.Info,
			onDidChangeLogLevel: sinon.stub() as unknown as vscode.Event<vscode.LogLevel>,
			name: "Test",
			replace: sinon.stub(),
		} as unknown as vscode.LogOutputChannel;

		sinon.stub(vscode.window, "createOutputChannel").returns(mockOutputChannel);
		(Logger as unknown as { _instance: Logger | undefined })._instance = undefined;
	});

	teardown(() => {
		sinon.restore();
		(Logger as unknown as { _instance: Logger | undefined })._instance = undefined;
	});

	test("redacts sensitive keys in structured args", () => {
		const logger = Logger.getInstance();
		logger.setLogLevel(LogLevel.DEBUG);
		logger.debug("Auth payload", {
			authorization: "Bearer super-secret-token",
			accessToken: "abc123",
			password: "pw123",
			nested: { apiKey: "k-123", safeValue: "ok" },
		});

		const logLine = appendLineStub.firstCall?.args[0] as string;
		assert.ok(logLine.includes("\"authorization\":\"[REDACTED]\""));
		assert.ok(logLine.includes("\"accessToken\":\"[REDACTED]\""));
		assert.ok(logLine.includes("\"password\":\"[REDACTED]\""));
		assert.ok(logLine.includes("\"apiKey\":\"[REDACTED]\""));
		assert.ok(logLine.includes("\"safeValue\":\"ok\""));
	});

	test("redacts bearer tokens in plain text", () => {
		const logger = Logger.getInstance();
		logger.setLogLevel(LogLevel.INFO);
		logger.info("Authorization: Bearer this-should-not-appear");

		const logLine = appendLineStub.firstCall?.args[0] as string;
		assert.ok(logLine.includes("Bearer [REDACTED]"));
		assert.ok(!logLine.includes("this-should-not-appear"));
	});
});
