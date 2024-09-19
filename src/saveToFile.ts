import * as fs from 'fs';
import * as path from 'path';

function saveToFile(filePath: string, content: any): void {
  // Ensure the directory exists
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Convert content to string if it's not already
  if (typeof content !== 'string' && !(content instanceof Uint8Array)) {
    content = JSON.stringify(content);
  }

  // Write the content
  fs.writeFileSync(filePath, content, 'utf-8');
}

export { saveToFile };
