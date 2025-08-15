#!/usr/bin/env node

import { copyFile, mkdir, readdir, stat } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths work with both direct files and git submodule structure
const OBSIDIAN_NOTES_DIR = join(__dirname, '../src/content/notes');
const PUBLIC_ASSETS_DIR = join(__dirname, '../public/notes/assets');

async function ensureDirectoryExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function getFileStats(filePath) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

async function findAssetDirectories(dir, assetDirs = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'assets') {
          assetDirs.push(fullPath);
        } else {
          // Recursively search in subdirectories
          await findAssetDirectories(fullPath, assetDirs);
        }
      }
    }
  } catch (error) {
    // Ignore errors (like permission denied)
  }

  return assetDirs;
}

async function findImagesRecursively(dir, imageExtensions, imageFiles = []) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively search in subdirectories
        await findImagesRecursively(fullPath, imageExtensions, imageFiles);
      } else if (entry.isFile()) {
        // Check if it's an image file
        if (
          imageExtensions.some((ext) => entry.name.toLowerCase().endsWith(ext))
        ) {
          imageFiles.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Ignore errors (like permission denied)
  }

  return imageFiles;
}

async function syncObsidianImages() {
  try {
    console.log('🔄 Syncing Obsidian images...');

    // Ensure public assets directory exists
    await ensureDirectoryExists(PUBLIC_ASSETS_DIR);

    // Check if source directory exists
    const sourceStats = await getFileStats(OBSIDIAN_NOTES_DIR);
    if (!sourceStats || !sourceStats.isDirectory()) {
      console.log('📁 No Obsidian notes directory found, skipping sync.');
      return;
    }

    // Find all assets directories recursively
    const assetDirectories = await findAssetDirectories(OBSIDIAN_NOTES_DIR);

    if (assetDirectories.length === 0) {
      console.log('📁 No assets directories found, skipping sync.');
      return;
    }

    console.log(`📂 Found ${assetDirectories.length} assets directories`);

    const imageExtensions = [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.webp',
      '.svg',
      '.avif',
    ];

    let syncedCount = 0;
    let skippedCount = 0;

    // Process each assets directory recursively
    for (const assetDir of assetDirectories) {
      console.log(`📂 Processing: ${assetDir}`);

      try {
        const imageFiles = await findImagesRecursively(
          assetDir,
          imageExtensions,
        );

        for (const sourcePath of imageFiles) {
          // Preserve directory structure relative to the assets directory
          const relativePath = sourcePath.replace(assetDir + '/', '');
          const destPath = join(PUBLIC_ASSETS_DIR, relativePath);

          // Ensure destination directory exists
          await ensureDirectoryExists(dirname(destPath));

          // Check if destination file exists and is newer
          const sourceStats = await getFileStats(sourcePath);
          const destStats = await getFileStats(destPath);

          if (destStats && destStats.mtime >= sourceStats.mtime) {
            console.log(`⏭️  Skipping ${relativePath} (up to date)`);
            skippedCount++;
            continue;
          }

          try {
            await copyFile(sourcePath, destPath);
            console.log(`✅ Synced: ${relativePath}`);
            syncedCount++;
          } catch (error) {
            console.error(`❌ Failed to sync ${relativePath}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing ${assetDir}:`, error.message);
      }
    }

    console.log(`\n🎉 Sync complete!`);
    console.log(`   📷 ${syncedCount} images synced`);
    console.log(`   ⏭️  ${skippedCount} images skipped (up to date)`);
  } catch (error) {
    console.error('❌ Error syncing Obsidian images:', error);
    process.exit(1);
  }
}

// Handle script execution
if (process.argv[1].endsWith('sync-obsidian-images.js')) {
  syncObsidianImages();
}

export { syncObsidianImages };
