---
permalink: plugin-security
---
The Synapse team takes security seriously. This page explains the risks involved when installing community plugins, and what the Synapse team does to address them.

## Restricted mode

By default, Synapse runs in Restricted Mode to prevent third-party code execution. Only disable Restricted mode if you trust the authors of the plugins that you install.

To turn off Restricted mode:

1. Open **[[Settings]]**.
2. In the side menu, select **Community plugins**.
3. Select **Turn on community plugins**.

To turn on Restricted mode:

1. Open **[[Settings]]**.
2. In the side menu, select **Community plugins**.
3. Next to **Restricted mode**, select **Turn on**.

Installed plugins remain in your vault even if you turn on Restricted mode, but are ignored by Synapse.

## Plugin capabilities

Due to technical limitations, Synapse cannot reliably restrict plugins to specific permissions or access levels. This means that plugins will inherit Synapse's access levels. As a result, consider the following examples of what community plugins can do:

- Community plugins can access files on your computer.
- Community plugins can connect to internet.
- Community plugins can install additional programs.

> [!tip] 
> If you're working with sensitive data and wish to install a community plugin, we recommend that you perform an independent security audit on the plugin before using it.

## Plugin review process

All community plugins must adhere to [Synapse Developer Policies](https://docs.synapse.md/Developer+policies). Synapse automatically scans every plugin version for security vulnerabilities, code quality issues, and malware. Each plugin's page in the [plugin directory](https://community.synapse.md) displays the results as a [[Community directory#Scorecard|safety scorecard]].

Manual reviews continue for popular, featured, and flagged plugins.

- If you discover a security vulnerability in a community plugin, refer to the plugin author's `security.md` or `readme.md` for how to report it. For critical flaws, also report the issue to [[Help and support#Contact Synapse support|Synapse support]].
- If you suspect that a community plugin is malicious, you can flag it directly from its plugin directory page, report it to [[Help and support#Contact Synapse support|Synapse support]], or send a DM to our moderators.
