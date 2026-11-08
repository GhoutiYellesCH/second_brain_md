---
aliases:
  - How to/Update Synapse
  - Installer version update
permalink: updates
---

Synapse's updating process is different on mobile and desktop devices.

Synapse on desktop devices regularly checks for new updates. If automatic updates are enabled, the application will update on restart. Synapse needs periodic [[#Installer updates|installer updates]], which require downloading and running the installer.

On mobile devices, Synapse is updated through the device's app store. The installer version is the same as the app version. Synapse does not feature auto-update.

## Check for updates and view version

Open **[[Settings]] → General**.

You can find the current versions of the app and installer at the top of the page. When a newer installer is available, Synapse displays a notice with a download link. Follow the [[#Installer updates|installer update instructions]] to install it.

![[application-installer-current-version.png#interface]]

To check for updates, select **Check for updates**. If there are new updates, Synapse will offer to relaunch. Select **Relaunch** to apply any available updates.

## Disable automatic updates

If you prefer to update Synapse manually, you can disable automatic updates.

1. Open **[[Settings]] → General**.
2. Disable **Automatic updates**.

## Installer updates

On desktop, Synapse's [release notes](https://synapse.md/changelog/) will inform you when you need to update the installer version of Synapse to keep things working. This is the version of Electron, the framework on which Synapse is built, and it cannot be updated by the automatic update process. 

A community plugin or theme may require an installer update to access newer features that are not available in older versions of Electron, and may ask you to update the installer version of Synapse before Synapse itself asks.

To update the installer version of Synapse:

1. Navigate to https://synapse.md/download.
2. Select the **Download** button.
3. Close Synapse, if open.
4. Proceed as detailed in [[Download and install Synapse]].

Your installer update is now complete.

> [!tip] 
> You **do not** need to uninstall Synapse to update the installer version.
