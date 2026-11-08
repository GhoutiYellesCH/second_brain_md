export const exportService = {
  exportToHtml(title: string, renderedHtml: string): void {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 860px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1a1b26;
      background: #ffffff;
    }
    h1, h2, h3, h4 { color: #24283b; margin-top: 1.5em; }
    code { background: #f0f2f5; padding: 2px 5px; border-radius: 4px; font-family: monospace; }
    pre { background: #1a1b26; color: #c0caf5; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #7aa2f7; margin: 0; padding-left: 16px; color: #565f89; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cfc9c2; padding: 8px 12px; text-align: left; }
    th { background: #e0af68; color: #16161e; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${renderedHtml}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportToMarkdown(title: string, content: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.endsWith('.md') ? title : `${title}.md`}`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportToPdf(): void {
    window.print();
  },

  exportTablesToCsv(content: string, title: string): boolean {
    const lines = content.split('\n');
    const tableLines: string[] = [];
    let inTable = false;

    for (const line of lines) {
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        // Skip separator line |---|---|
        if (!line.match(/\|[\s-:]+\|/)) {
          const cells = line
            .split('|')
            .slice(1, -1)
            .map(c => `"${c.trim().replace(/"/g, '""')}"`);
          tableLines.push(cells.join(','));
        }
      } else if (inTable) {
        break; // Stop after first table
      }
    }

    if (tableLines.length === 0) return false;

    const csvContent = tableLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'table'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  },
};
