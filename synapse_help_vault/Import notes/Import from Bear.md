---
permalink: import/bear
cssclasses:
  - soft-embed
---
Synapse lets you easily migrate your notes from Bear using the [[Importer|Importer plugin]]. This converts your Bear data to durable Markdown files you can use with Synapse and many other apps.

## Export your data from Bear

Synapse can uses Bear's backup formats `.bear2bk` or `ApplicationData.zip`.

### iOS

1. Open Bear.
2. Go to **Settings** → **Advanced** → **Share Application Data**.
3. Choose a location for your backup file.
4. You should now have one `ApplicationData.zip` file that contains all your notes.

### macOS

1. Open Bear.
2. Go to **File** → **Backup notes**.
3. Choose a location for your backup file.
4. Click **Export notes**.
5. You should now have one `.bear2bk` file that contains all your notes.

## Import your Bear data into Synapse

You will need the official Synapse [[Importer]] plugin, which you can [install here](synapse://show-plugin?id=synapse-importer).

1. Open **[[Settings]]**.
2. Go to **Community Plugins** and [install Importer](synapse://show-plugin?id=synapse-importer).
3. Enable the Importer plugin.
4. Open the **Importer** plugin using the command palette or ribbon icon.
5. Under **File format** choose **Bear (.bear2bk, .zip)**.
6. Select the location of your Bear backup file.
7. Select **Import** to review the generated template and preview examples from your notes.
8. Select **Import** again and wait for the import to finish.

## Templates

Use [[Importer templates|Importer templates]] to fully configure how your Bear data is imported. 

![[Importer templates#Variables]]
