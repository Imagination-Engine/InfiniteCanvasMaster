# 07 — Security, Permissions, and Sandboxing

## Principle

OpenClaw Blocks must be designed like managed operating-system capabilities, not casual UI widgets.

An agent with file, shell, browser, messaging, calendar, wallet, or credential access can cause real-world harm. Therefore, every OpenClaw Block must have explicit permissions, sandbox boundaries, approval gates, logs, and kill switches.

## Default Policy

The default OpenClaw Block policy must be restrictive.

Default should be:

```txt
sandboxMode: strict
shell: denied unless explicitly enabled
filesystem write: approval required
external messaging: approval required
calendar modification: approval required
email send: approval required
browser credential flows: approval required
payments/purchases: approval required
skill installation: denied unless explicitly approved
cloud model routing for sensitive data: approval required
identity/wallet/provenance operations: approval required
```

## Permission Categories

### Filesystem

Controls read paths, write paths, delete paths, edit paths, and upload paths.

Rules:

- deny broad home-directory access by default
- never expose secrets in UI
- writing/deleting requires approval unless explicitly scoped

### Shell / Process

Controls command allowlist, command denylist, environment variables, process spawn, network access, timeout, and output capture.

Rules:

- shell execution is high risk
- approval required by default
- secrets must be masked
- long-running shell tasks require stop/kill

### Browser

Controls allowed domains, credential access, forms, downloads, payments, and automation level.

Rules:

- browser automation involving login, checkout, financial, identity, or external communication requires approval

### Messaging

Controls allowed channels, allowed recipients, draft-only vs send, and approval before send.

Rules:

- external sends require explicit approval
- user must see final message before send

### Skills

Controls allowed skills, denied skills, trusted sources, registry use, manual review, version pinning, and hash verification where possible.

Rules:

- third-party skill installation must not be automatic in production
- skill risk level must be shown
- untrusted skills should run in strict sandbox or not at all

### Memory

Controls memory scope, sensitive memory access, write-back, forgetting/revocation, and data leaving local boundary.

Rules:

- memory access must be scoped
- sensitive memory routed to cloud requires approval

### Identity / Wallet / AURA / PLOG

Controls credential visibility, transactions, signing, wallet operations, provenance writes, and revocation.

Rules:

- never expose private keys/secrets
- signing/transaction operations require explicit approval
- provenance logs should record sensitive state transitions without leaking secrets

## Security Policy Contract

```ts
export interface OpenClawSecurityPolicy {
  blockId: string;
  sandboxMode:
    | "strict"
    | "workspace"
    | "device"
    | "edge"
    | "cloud"
    | "disabled";

  filesystem: {
    allowReadPaths: string[];
    allowWritePaths: string[];
    denyPaths: string[];
    requireApprovalForWrite: boolean;
    requireApprovalForDelete: boolean;
  };

  shell: {
    enabled: boolean;
    allowCommands: string[];
    denyCommands: string[];
    requireApproval: boolean;
    maxRuntimeMs: number;
  };

  browser: {
    enabled: boolean;
    allowedDomains: string[];
    requireApprovalForLogin: boolean;
    requireApprovalForPayment: boolean;
    requireApprovalForDownload: boolean;
  };

  messaging: {
    enabled: boolean;
    allowedChannels: string[];
    draftOnlyByDefault: boolean;
    requireApprovalBeforeSend: boolean;
  };

  skills: {
    allowRegistryInstall: boolean;
    allowedSkillIds: string[];
    deniedSkillIds: string[];
    requireApprovalForNewSkill: boolean;
    requireTrustedSource: boolean;
  };

  models: {
    allowCloud: boolean;
    requireApprovalForSensitiveCloudUse: boolean;
    allowedProviders: string[];
    deniedProviders: string[];
  };

  budget: {
    maxSpendCredits?: number;
    maxRuntimeMs?: number;
    maxToolCalls?: number;
  };

  killSwitch: {
    enabled: boolean;
    allowUserStop: boolean;
    allowSystemStopOnPolicyViolation: boolean;
  };
}
```

## Approval Request Contract

```ts
export interface OpenClawApprovalRequest {
  requestId: string;
  blockId: string;
  taskId?: string;
  actionType:
    | "shell"
    | "file_write"
    | "file_delete"
    | "external_message"
    | "calendar_modify"
    | "email_send"
    | "browser_login"
    | "purchase"
    | "skill_install"
    | "cloud_model_sensitive"
    | "identity_wallet"
    | "provenance_write"
    | "other";

  title: string;
  summary: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  requestedBy: "openclaw" | "mastra" | "user" | "system";
  rawDetails?: unknown;
  redactedDetails?: unknown;
  createdAt: string;
  expiresAt?: string;
}
```

## UI Requirements

Every OpenClaw Block inspector must include:

- Security Panel
- Enabled tools
- Enabled skills
- Sandbox mode
- Memory scope
- Model/cloud routing permission
- Approval queue
- Recent sensitive actions
- Stop/pause/revoke controls

## Security Acceptance Criteria

- No host-level execution by default.
- Shell actions are approval-gated.
- External sends are approval-gated.
- File writes/deletes are approval-gated.
- Skill installation is restricted.
- Sensitive cloud routing is approval-gated.
- Runtime events are logged.
- Every running task can be stopped.
- Sensitive compact UI is redacted.
- Policy violations produce visible block state.
