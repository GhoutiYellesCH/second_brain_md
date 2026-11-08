import fs from 'node:fs';
import path from 'node:path';

const CACHE_URL = 'https://publish-01.obsidian.md/cache/f786db9fac45774fa4f0d8112e232d67';
const ACCESS_BASE = 'https://publish-01.obsidian.md/access/f786db9fac45774fa4f0d8112e232d67';
const TARGET_DIR = path.resolve(process.cwd(), 'synapse_help_vault');

async function main() {
  console.log('📡 Fetching Obsidian Help manifest from Publish cache...');
  const cacheRes = await fetch(CACHE_URL);
  if (!cacheRes.ok) {
    throw new Error(`Failed to fetch cache: ${cacheRes.statusText}`);
  }
  const fileCache = await cacheRes.json();
  const allFiles = Object.keys(fileCache);

  console.log(`🔍 Found ${allFiles.length} total items in official Obsidian Help.`);

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  // Filter notes and attachments
  const markdownFiles = allFiles.filter((f) => f.endsWith('.md') || !f.includes('.'));
  const assetFiles = allFiles.filter((f) =>
    /\.(png|jpg|jpeg|gif|svg|webp|pdf|ogg|mp3)$/i.test(f)
  );

  console.log(`📄 Markdown Notes to extract: ${markdownFiles.length}`);
  console.log(`📎 Assets to extract: ${assetFiles.length}`);

  let completed = 0;
  const filesToDownload = [...markdownFiles, ...assetFiles];

  // Concurrency pool
  const CONCURRENCY = 8;
  let index = 0;

  async function worker() {
    while (index < filesToDownload.length) {
      const currentIdx = index++;
      const relPath = filesToDownload[currentIdx];
      const normalizedPath = relPath.endsWith('.md') || relPath.includes('.') ? relPath : `${relPath}.md`;
      const localFilePath = path.join(TARGET_DIR, normalizedPath);
      const parentDir = path.dirname(localFilePath);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      const encodedUrl = `${ACCESS_BASE}/${encodeURI(relPath)}`;
      try {
        const res = await fetch(encodedUrl);
        if (res.ok) {
          const isText = relPath.endsWith('.md') || !relPath.includes('.');
          if (isText) {
            const text = await res.text();
            fs.writeFileSync(localFilePath, text, 'utf-8');
          } else {
            const buffer = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(localFilePath, buffer);
          }
          completed++;
          if (completed % 20 === 0 || completed === filesToDownload.length) {
            process.stdout.write(`⏳ Extracted ${completed}/${filesToDownload.length} files...\r`);
          }
        }
      } catch (err) {
        console.error(`\n❌ Failed to download ${relPath}: ${err.message}`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\n\n✅ Successfully extracted ${completed} files into:`);
  console.log(`   ${TARGET_DIR}`);
}

main().catch((err) => {
  console.error('Fatal error extracting Obsidian Help:', err);
  process.exit(1);
});
