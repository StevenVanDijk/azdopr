## Security audit result for `johncwaters/azdopr`

### Verdict

**CONDITIONAL** (not a hard reject, but not ready for unrestricted enterprise approval without fixes).

### Risk summary

- **Critical:** 0
- **High:** 1
- **Medium:** 2
- **Low:** 3

### Top findings

1. **High — Trusted markdown on untrusted PR comment content**
  - The extension processes externally sourced comment text with trusted markdown behavior.
  - Risk: clickable malicious links (especially command-style URI patterns) can cross trust boundaries and enable social-engineering-assisted local actions.
2. **Medium —** `openExternal` **trust boundary is too broad**
  - URL open paths do not appear to enforce a strict allowlist for scheme/host.
  - Risk: phishing or unsafe protocol handling if crafted links are passed through.
3. **Medium — CI/release integrity controls are weak/missing in current repo state**
  - Current repository state lacks workflow files in `.github/workflows` for enforcing least privilege, action pinning, and required security gates.
  - Risk: weaker supply-chain and release assurance.
4. **Low — PAT handling guidance in release docs**
  - Release docs include PAT usage directly in CLI arguments.
  - Risk: token leakage via shell history/process inspection.
5. **Low — No explicit log redaction policy**
  - Logging utility can serialize arbitrary values.
  - Risk: future accidental leakage if tokens/headers are logged.

### What looked good

- No obvious malicious code indicators.
- No direct shell/process execution primitives were found in source during static review.
- No hardcoded real secrets or private keys detected.
- Uses Microsoft auth patterns (`vscode.authentication` + MSAL dependency).

### Priority remediation plan

1. **Immediate:** disable trusted markdown for external PR comment content, or strictly sanitize and block `command:`/`vscode:` URIs.
2. **Immediate:** centralize URL validation and only allow `https` + approved Azure DevOps hosts before any external open.
3. **Short-term:** reintroduce secure CI workflows:

  - minimal `permissions`
  - pinned third-party actions by commit SHA
  - mandatory lint/test/security checks before release
4. **Short-term:** remove PAT-in-command examples; prefer secure credential storage/login flow.
5. **Short-term:** add logger redaction for token-like keys/patterns.
6. **Validation:** run authenticated SCA (Mend or equivalent) and gate merges/releases on High/Critical findings.

### Residual risk after fixes

If the high/medium items are addressed and dependency scanning is enforced, residual risk should drop to **low-to-moderate** for this extension class.

## Updated checklist

- ✅ Gather repository metadata
- ✅ Inspect source for risky patterns
- ✅ Review workflows and supply chain
- ✅ Assess auth, secrets, and permissions
- ✅ Produce risk rating and recommendations

I completed a full static security audit of `https://github.com/johncwaters/azdopr.git`, produced a conditional verdict, prioritized findings by severity, and provided a remediation plan to reach enterprise-ready posture.
