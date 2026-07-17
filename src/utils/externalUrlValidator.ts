import * as vscode from "vscode";
import { Logger } from "./logger";

const logger = Logger.getInstance();

/**
 * Restrict external URL navigation to Azure DevOps HTTPS hosts only.
 */
export function isAllowedAzureDevOpsUrl(rawUrl: string): boolean {
	const parsed = tryParseUrl(rawUrl);
	if (!parsed) {
		return false;
	}

	if (parsed.protocol.toLowerCase() !== "https:") {
		return false;
	}

	const host = parsed.hostname.toLowerCase();
	return host === "dev.azure.com" || host.endsWith(".visualstudio.com");
}

/**
 * Open an external URL only when it passes the Azure DevOps allowlist.
 */
export async function openTrustedExternalUrl(rawUrl: string, source: string): Promise<boolean> {
	if (!isAllowedAzureDevOpsUrl(rawUrl)) {
		logger.warn(`[Security] Blocked external URL from ${source}: ${rawUrl}`);
		await vscode.window.showWarningMessage(
			"Blocked unsafe external link. Only HTTPS Azure DevOps URLs are allowed.",
		);
		return false;
	}

	await vscode.env.openExternal(vscode.Uri.parse(rawUrl));
	return true;
}

function tryParseUrl(rawUrl: string): URL | null {
	try {
		return new URL(rawUrl);
	} catch {
		return null;
	}
}
