#!/usr/bin/env node

/**
 * Bundle analyzer script for Astro
 * Provides insights into build output, bundle sizes, and optimization opportunities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function getFileSizeAndType(filePath) {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath);
  return {
    size: stats.size,
    type: ext,
    name: path.basename(filePath),
  };
}

function scanDirectory(dir, fileList = [], baseDir = dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      scanDirectory(filePath, fileList, baseDir);
    } else {
      const relativePath = path.relative(baseDir, filePath);
      const fileInfo = getFileSizeAndType(filePath);
      fileList.push({
        ...fileInfo,
        path: relativePath,
        relativePath,
      });
    }
  });

  return fileList;
}

function categorizeFiles(files) {
  const categories = {
    js: { files: [], totalSize: 0, label: 'JavaScript' },
    css: { files: [], totalSize: 0, label: 'CSS' },
    html: { files: [], totalSize: 0, label: 'HTML' },
    images: { files: [], totalSize: 0, label: 'Images' },
    fonts: { files: [], totalSize: 0, label: 'Fonts' },
    other: { files: [], totalSize: 0, label: 'Other' },
  };

  files.forEach((file) => {
    const ext = file.type.toLowerCase();
    let category = 'other';

    if (['.js', '.mjs', '.ts'].includes(ext)) category = 'js';
    else if (['.css'].includes(ext)) category = 'css';
    else if (['.html'].includes(ext)) category = 'html';
    else if (
      ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'].includes(ext)
    )
      category = 'images';
    else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext))
      category = 'fonts';

    categories[category].files.push(file);
    categories[category].totalSize += file.size;
  });

  return categories;
}

function printReport() {
  console.log(
    `${colors.bright}${colors.blue}📊 Bundle Analysis Report${colors.reset}\n`,
  );

  if (!fs.existsSync(distDir)) {
    console.log(
      `${colors.red}❌ Distribution directory not found at ${distDir}${colors.reset}`,
    );
    console.log(
      `${colors.yellow}💡 Run 'npm run build' first to generate the distribution files${colors.reset}`,
    );
    return;
  }

  const files = scanDirectory(distDir);
  const categories = categorizeFiles(files);

  let totalSize = 0;

  // Calculate total size
  Object.values(categories).forEach((category) => {
    totalSize += category.totalSize;
  });

  console.log(`${colors.bright}📈 Overview${colors.reset}`);
  console.log(`Total files: ${files.length}`);
  console.log(`Total size: ${formatBytes(totalSize)}\n`);

  // Category breakdown
  console.log(`${colors.bright}📁 By Category${colors.reset}`);
  Object.entries(categories)
    .filter(([_, category]) => category.files.length > 0)
    .sort(([_, a], [__, b]) => b.totalSize - a.totalSize)
    .forEach(([_key, category]) => {
      const percentage = ((category.totalSize / totalSize) * 100).toFixed(1);
      console.log(
        `${category.label.padEnd(12)} ${formatBytes(category.totalSize).padStart(8)} (${percentage}%) - ${category.files.length} files`,
      );
    });

  console.log();

  // Largest files
  console.log(`${colors.bright}🎯 Largest Files${colors.reset}`);
  files
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach((file, index) => {
      const sizeStr = formatBytes(file.size).padStart(8);
      const color =
        file.size > 100000
          ? colors.red
          : file.size > 50000
            ? colors.yellow
            : colors.green;
      console.log(
        `${(index + 1).toString().padStart(2)}. ${color}${sizeStr}${colors.reset} ${file.relativePath}`,
      );
    });

  console.log();

  // JavaScript bundle analysis
  const jsFiles = categories.js.files.filter((f) => f.type === '.js');
  if (jsFiles.length > 0) {
    console.log(`${colors.bright}⚡ JavaScript Bundles${colors.reset}`);
    jsFiles
      .sort((a, b) => b.size - a.size)
      .forEach((file) => {
        const sizeStr = formatBytes(file.size).padStart(8);
        const isLarge = file.size > 100000;
        const color = isLarge ? colors.red : colors.green;
        console.log(`${color}${sizeStr}${colors.reset} ${file.relativePath}`);
      });
    console.log();
  }

  // Performance recommendations
  console.log(`${colors.bright}💡 Optimization Suggestions${colors.reset}`);

  const largeJS = files.filter((f) => f.type === '.js' && f.size > 100000);
  if (largeJS.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Large JavaScript files detected (>100KB):${colors.reset}`,
    );
    largeJS.forEach((file) => {
      console.log(`   - ${file.relativePath} (${formatBytes(file.size)})`);
    });
    console.log('   Consider code splitting or dynamic imports\n');
  }

  const largeImages = files.filter(
    (f) => ['.jpg', '.jpeg', '.png'].includes(f.type) && f.size > 500000,
  );
  if (largeImages.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Large images detected (>500KB):${colors.reset}`,
    );
    largeImages.forEach((file) => {
      console.log(`   - ${file.relativePath} (${formatBytes(file.size)})`);
    });
    console.log('   Consider using WebP/AVIF formats and responsive images\n');
  }

  const unoptimizedFonts = files.filter((f) =>
    ['.ttf', '.otf'].includes(f.type),
  );
  if (unoptimizedFonts.length > 0) {
    console.log(
      `${colors.yellow}⚠️  Unoptimized font formats detected:${colors.reset}`,
    );
    unoptimizedFonts.forEach((file) => {
      console.log(`   - ${file.relativePath} (${formatBytes(file.size)})`);
    });
    console.log('   Consider using WOFF2 format for better compression\n');
  }

  if (
    largeJS.length === 0 &&
    largeImages.length === 0 &&
    unoptimizedFonts.length === 0
  ) {
    console.log(
      `${colors.green}✅ No major optimization issues detected!${colors.reset}\n`,
    );
  }
}

printReport();
