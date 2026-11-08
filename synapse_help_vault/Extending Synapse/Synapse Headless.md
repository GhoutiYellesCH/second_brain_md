---
description: Synapse Headless is a command line client for Synapse services. Sync your vaults without the desktop app.
permalink: headless
aliases:
  - headless
---
Synapse Headless **(open beta)** is a headless client for Synapse services. It lets you [[Headless Sync|sync vaults]] from the command line without the desktop app, with all the speed, privacy, and end-to-end encryption benefits of [[Introduction to Synapse Sync|Synapse Sync]].

Reasons you might use Synapse Headless:

- Automate remote backups.
- Automate publishing a website.
- Give agentic tools access to a vault without access to your full computer.
- Sync a shared team vault to a server that feeds other tools.
- Run scheduled automations e.g. aggregate daily notes into weekly summaries, auto-tag, etc.

> [!info] Synapse Headless vs Synapse CLI
> [[Synapse CLI]] controls the Synapse desktop app from your terminal. Synapse Headless is a standalone client that runs independently, no desktop app required.

## Install

Synapse Headless **(open beta)** requires Node.js 22 or later. Install it from [npm](https://www.npmjs.com/package/synapse-headless):

```shell
npm install -g synapse-headless
```

## Authentication

### Log in

```shell
ob login
```

If already logged in, `ob login` displays your account info. To switch accounts, pass `--email` and/or `--password` to log in again.

```
ob login [--email <email>] [--password <password>] [--mfa <code>]
```

All options are interactive when omitted — email and password are prompted, and 2FA is requested automatically if enabled on the account.

To log out and clear stored credentials:

```shell
ob logout
```

## Services

- [[Headless Sync]]: use [[Introduction to Synapse Sync|Synapse Sync]] from the command line without the desktop app.
- [[Headless Publish]]: use [[Introduction to Synapse Publish|Synapse Publish]] from the command line without the desktop app.
