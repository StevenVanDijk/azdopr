import * as assert from "node:assert";
import { describe, it } from "mocha";
import { isAllowedAzureDevOpsUrl } from "../../../utils/externalUrlValidator";

describe("externalUrlValidator", () => {
	it("allows https://dev.azure.com URLs", () => {
		assert.strictEqual(
			isAllowedAzureDevOpsUrl("https://dev.azure.com/myorg/myproject/_git/myrepo"),
			true,
		);
	});

	it("allows https subdomains of visualstudio.com", () => {
		assert.strictEqual(
			isAllowedAzureDevOpsUrl("https://myorg.visualstudio.com/myproject/_git/myrepo"),
			true,
		);
	});

	it("blocks non-https schemes", () => {
		assert.strictEqual(
			isAllowedAzureDevOpsUrl("http://dev.azure.com/myorg/myproject/_git/myrepo"),
			false,
		);
		assert.strictEqual(isAllowedAzureDevOpsUrl("file:///C:/temp/test.txt"), false);
		assert.strictEqual(isAllowedAzureDevOpsUrl("command:workbench.action.openSettings"), false);
	});

	it("blocks non-Azure DevOps hosts", () => {
		assert.strictEqual(isAllowedAzureDevOpsUrl("https://example.com"), false);
		assert.strictEqual(isAllowedAzureDevOpsUrl("https://github.com/johncwaters/azdopr"), false);
	});

	it("blocks malformed URLs", () => {
		assert.strictEqual(isAllowedAzureDevOpsUrl("not-a-url"), false);
		assert.strictEqual(isAllowedAzureDevOpsUrl(""), false);
	});
});
