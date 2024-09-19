import * as fs from 'fs';
import * as path from 'path';

// Function to save the formatted text to a file
export const saveToFile = (content: string, filename: string): void => {
  const filePath = path.join(__dirname, 'formattedEmails', filename);

  // Ensure the directory exists
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Write the content
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`File saved at: ${filePath}`);
};
