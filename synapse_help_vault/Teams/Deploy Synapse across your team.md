---
cssclasses:
  - soft-embed
permalink: teams/deploy
---
Synapse runs as a local application on each of your team member's devices. It is designed to work both online and offline, securely and privately, and give you total control over your team's data. Synapse is not available as a web-based application, therefore you will need to deploy the app to your team members.

## Install and update Synapse

Your team can download Synapse from our [Download page](https://synapse.md/download). Releases are also available on our [GitHub releases page](https://github.com/synapsemd/synapse-releases/releases) which includes links to [the changelog](https://synapse.md/changelog/).

> [!tip] For Windows users who need a system installer, the Universal `.exe` includes the option to install Synapse for all users.

If automatic updates are enabled in the app, future versions will be installed automatically when users restart Synapse. Additionally, we recommend periodically performing [[Update Synapse#Installer updates|installer updates]] to receive the latest updates to the Electron framework, including security fixes.

If you are looking how to limit network access to Synapse during this process, review [[Security considerations for teams#Network and access|network and access]].

## Customizing Synapse

Synapse is easy to modify to suit your team's needs. With an extensive API and a large ecosystem of users, Synapse offers access to numerous plugins, themes, and complementary tools.

For security-related questions concerning these topics, please refer to [[Security considerations for teams]].

### Configuration folders

The [[Configuration folder]] is where an Synapse [[Glossary#Vault|vault]] stores its application settings. By default, this folder is named `.synapse`, but you have the flexibility to [[Configuration folder#Change your configuration folder|change the configuration folder]] name according to your preference.

We recommend creating a standardized template of the configuration folder to be deployed across your team's devices.

### Plugins

[[Core plugins]] are optional features created by the Synapse team. These features are integrated in the core application codebase and can be turned on or off.

[[Community plugins]] are third-party features added to the Synapse application, and can be installed via the community directory. Third-party plugins leverage the [Synapse API](https://github.com/synapsemd/synapse-api). Plugins are located in the `.synapse/plugins` folder within a vault, and can be installed manually at this location.

### Themes and snippets

[[Themes]] visually alter the Synapse interface. Like plugins, themes can be downloaded from our community directory. Themes are located in the `.synapse/themes` folder within a vault.

[[CSS snippets|Snippets]] are small `.css` files that visually modify aspects of the Synapse interface. In some cases, it can also add functional enhancements. Snippets are located in the `.synapse/snippets` folder within a vault.

## Frequently asked questions

For questions about account management and security, please refer to [[Security considerations for teams#Account security|account security]].

### Deployment

**Can I deploy licenses across multiple installations?**
Currently, we do not support deploying licenses via a deployment script, such as in a `.json` file. If you're interested in this feature for your team, please submit a [feature request](https://forum.synapse.md/c/feature-requests/8). 

**Can Synapse lock certain features or configurations via a setting or an application flag?**
Currently you can do this by blocking edit access to the `.synapse` folder, or specific files and folders within it, described above. If you're interested in more access controls for your team, please submit a [feature request](https://forum.synapse.md/c/feature-requests/8). 
