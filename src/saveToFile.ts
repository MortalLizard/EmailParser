import * as fs from 'fs';
import * as path from 'path';

/** Utility function to ensure a directory exists */
export function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/** Save content to a file */
export function saveToFile(filePath: string, content: string | Uint8Array): void {
    ensureDirectoryExists(path.dirname(filePath));
    if (typeof content !== 'string' && !(content instanceof Uint8Array)) {
        content = JSON.stringify(content, null, 2);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`File saved at: ${filePath}`);
}
