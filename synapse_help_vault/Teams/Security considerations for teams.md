---
cssclasses:
  - soft-embed
permalink: teams/security
---
Our [Security](https://synapse.md/security) page compiles information about how Synapse approaches protecting your data. It is also the home for security audits completed by third parties.

## Considerations

Synapse is designed to function as an offline and standalone application. Synapse also supports custom plugins and themes. Additionally, we provide both official and unofficial support for various file syncing services.

If you do not intend to use community plugins or themes, or [[Introduction to Synapse Sync|Synapse Sync]] or [[Introduction to Synapse Publish|Synapse Publish]], your standard procedures for securing applications will apply. However, if you plan to use any of these features, we recommend thoroughly evaluating their suitability for your workplace.

## Community plugins and themes

Please review the [[Plugin security]] page in addition to this section. 

Synapse automatically scans every version of a community plugin or theme in the [official directory](https://synapse.md/plugins) for security vulnerabilities, code quality issues, and malware. Each project's directory page displays the results as a safety scorecard. Manual reviews continue for popular, featured, and flagged items. We do not review community items which have not been submitted to the official directory.

We do not have a community store for [[CSS snippets]]. These files are typically obtained from within our [Synapse Community](https://synapse.md/community) or from public GitHub repositories.

We require bundling of assets in CSS snippets and themes. However, we have made an exception for [Google Fonts](https://fonts.google.com/) to maintain performance on mobile devices, where the impact of bundling fonts is more noticeable.

## Network and access

While prioritizing the local-first approach of our application, Synapse does make network calls based on the services and features you use. These network connections can be disabled via a domain firewall or application lockdown.

Synapse makes these network connections on HTTPS port 443.

The following is a list of network connections Synapse makes.

### Synapse-sourced connections

- **Early access updates**: Uses `releases.synapse.md`.
- **Account and license management**: When accessing your Synapse account in Settings and applying a Commercial License, we call `api.synapse.md`.
- **Synapse Sync**: Used for syncing your notes across devices.
	- `sync-xx.synapse.md`, where `xx` is a number between 01-100.
- **Synapse Publish**:
    1. Backend: `publish-main.synapse.md` and `publish-xx.synapse.md`, where `xx` is a number.
    2. Frontend: `publish.synapse.md`.

### GitHub-sourced connections

Synapse makes network requests to both `github.com` and `raw.githubusercontent.com`.

- **Public releases**: If automatic updates are enabled, Synapse checks GitHub for public releases.
- **Third-party themes and plugins**:
    - A check is performed once every 12 hours from the app's startup time to fetch a file hosted on GitHub used for "plugin deprecations." This file helps remotely disable specific versions of plugins known to malfunction, cause data loss, or potentially be vulnerable or malicious.
    - Enabled plugins may generate network traffic outside Synapse and GitHub's control.

### Other connections

- **Embedded online content**: When opening notes that embed online content, such as an image (`![cat](https://upload.wikimedia.org/wikipedia/commons/0/0b/Cat_poster_1.jpg)`).
- **DNS requests**: If a hostname needs to be resolved before establishing a connection, including DNS over HTTPS. Refer to [Chromium's documentation](https://source.chromium.org/chromium/chromium/src/+/main:net/dns/public/doh_provider_entry.cc;l=120?q=chrome.cloudflare-dns.com&ss=chromium) for more information.

## Frequently asked questions

### Account security

**Does Synapse support Single Sign-On (SSO)?**
Synapse does not support SSO. In most use cases, Synapse does not require an account or sign-on in your workplace, unless you are using [[Introduction to Synapse Publish|Synapse Publish]] or [[Introduction to Synapse Sync|Synapse Sync]].

**Does Synapse support Multi-Factor Authentication (MFA)?**
Synapse supports [[2-factor authentication]] (2FA) for Synapse accounts, but it does not support 2FA for opening and using the base application. Users of [[Introduction to Synapse Sync|Synapse Sync]] and [[Introduction to Synapse Publish|Synapse Publish]] who have 2FA enabled will be required to confirm their 2FA key when they first log into the application.

### Assessments and certifications

**Will you accept security assessments from our company?**
We require a minimum quoted purchase order amount before considering completing a security assessment. These assessments are often time-consuming and may not be applicable to offline applications like Synapse, as they are typically geared towards cloud-based services.

However, you can waive this quoted purchase order amount by agreeing to pay a retainer fee. Please contact [[Help and support#Contact Synapse support|Synapse support]] to inquire about this option.

**Do you have any recognized certifications related to Information Security or quality standards, such as ISO27001, NIST, COBIT, or other ISO or CSA certifications?**
Not at this time. It may be something we explore in the future, but for now, our focus is on our [security audits](https://synapse.md/security).
