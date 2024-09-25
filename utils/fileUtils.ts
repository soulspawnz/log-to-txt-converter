import * as fs from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';

export function ensureConvertedDirExists() {
  const convertedDir = path.join(process.cwd(), 'public', 'converted');
  if (!existsSync(convertedDir)) {
    mkdirSync(convertedDir, { recursive: true });
  }
}

export function emptyConvertedDir() {
  const convertedDir = path.join(process.cwd(), 'public', 'converted');
  if (fs.existsSync(convertedDir)) {
    const files = fs.readdirSync(convertedDir);
    for (const file of files) {
      if (file.endsWith('.txt')) {
        fs.unlinkSync(path.join(convertedDir, file));
      }
    }
  }
}
