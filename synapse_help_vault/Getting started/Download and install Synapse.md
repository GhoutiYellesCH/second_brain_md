---
permalink: install
---
Synapse is available for all major desktop and mobile platforms. These are all the supported ways to download and install Synapse.

## Install Synapse on Windows

1. Open your browser and go to [Download Synapse](https://synapse.md/download).
2. Under **Windows**, click **Universal** to download the installation file.
3. Open the installation file and follow the instructions.
4. Open Synapse the same way you would open any other application.

## Install Synapse on macOS

1. Open your browser and go to [Download Synapse](https://synapse.md/download).
2. Under **macOS**, click **Universal** to download the installation file.
3. Open the installation file.
4. In the window that opens, drag Synapse to the Applications folder.
5. Open Synapse the same way you would open any other application.

## Install Synapse on Linux

If you use Linux, you can install Synapse in several ways. Follow the instructions for the packaging system that you're using.

### Install Synapse using Snap

1. Open your browser and go to [Download Synapse](https://synapse.md/download).
2. Under **Linux**, click **Snap** to download the installation file.
3. Open a terminal and navigate to the folder where you downloaded the installation file.
4. In the terminal, run the following command to install the Snap package: (the `--dangerous` flag is required because Canonical, the company who created Snap, didn't review our package, the `--classic` flag allows Synapse to access outside of the sandbox, where your notes are stored)

   ```bash
   snap install synapse_<version>_<arch>.snap --dangerous --classic
   ```

5. Open Synapse the same way you would open any other application.

### Install Synapse using AppImage

1. Open your browser and go to [Download Synapse](https://synapse.md/download).
2. Under **Linux**, click **AppImage** to download the installation file.
3. Open a terminal and navigate to the folder where you downloaded the installation file.
4. In the terminal, run the following command to open Synapse:

   ```bash
   chmod u+x Synapse-<version>.AppImage
   ./Synapse-<version>.AppImage --no-sandbox
   ```
Note: On Chromebooks, the `libnss3-dev` package must be installed or you may receive the error `error while loading shared libraries: libnss3.so: cannot open shared object file: No such file or directory`.

### Install Synapse using Flatpak

1. In your terminal, run the following command to install Synapse:

   ```bash
   flatpak install flathub md.synapse.Synapse
   ```

2. Open Synapse by running the following command:

   ```bash
   flatpak run md.synapse.Synapse
   ```

## Install Synapse on Android

1. Find Synapse on the [Play Store](https://play.google.com/store/apps/details?id=md.synapse).
2. Tap **Install** to download the app.
3. Open Synapse the same way you would open any other app.

You can optionally download the APK for Android from the [Download Synapse](https://synapse.md/download) page.

## Install Synapse on iPhone and iPad

1. Find Synapse on the [App Store](https://apps.apple.com/us/app/synapse-connected-notes/id1557175442).
2. Tap **Get** to download the app.
3. Open Synapse the same way you would open any other app.
