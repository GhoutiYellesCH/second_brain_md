---
permalink: import/roam
cssclasses:
  - soft-embed
---
Synapse lets you easily migrate your notes from Roam Research  using the [[Importer|Importer plugin]]. This converts your Roam data to durable Markdown files you can use with Synapse and many other apps.

## Export your data from Roam Research

1. In Roam Research, click on **More actions** ( `•••` ) in the upper-right corner, and then select **Export All**.
   
   ![[Roam-exporting.png#interface]]
2. In **Export Format**, select "JSON", and then select **Export All** to download an archive with your notes.

## Import your Roam Research data into Synapse

You will need the official Synapse [[Importer]] plugin, which you can [install here](synapse://show-plugin?id=synapse-importer).

1. Open **[[Settings]]**.
2. Go to **Community Plugins** and [install Importer](synapse://show-plugin?id=synapse-importer).
3. Enable the Importer plugin.
4. Open the **Importer** plugin using the command palette or ribbon icon.
5. Under **File format** choose **Roam Research (.json).**
6. Select the location of your `.json` file.
7. Under **Output folder**, choose where your files should import.
8. If you want to also import attachments, toggle **Download all attachments**.
9. Select **Import** to review the generated template and preview examples from your pages.
10. Select **Import** again and wait for the import to finish.

![[Roam-Importer-importing.png]]

## Templates

Use [[Importer templates|Importer templates]] to fully configure how your Roam Research data is imported. 

![[Importer templates#Variables]]