import { processEmail } from './formatterService';
import { saveToFile } from './fileService';
import { sendToChatGPT } from './chatGPTService';

// Main function for handling incoming emails
export const handleIncomingEmail = async (rawEmailText: string) => {
  try {
    // Process and format the email text, which returns an object
    const formattedEmail = processEmail(rawEmailText);

    // Convert the formattedEmail object to a JSON string to save it correctly
    const formattedText = JSON.stringify(formattedEmail, null, 2);

    // Define the filename
    const filename = `formatted_email_${Date.now()}.txt`;

    // Save the formatted text to a .txt file
    await saveToFile(formattedText, filename); 

    // Send the file to ChatGPT for processing
    await sendToChatGPT(filename);

    console.log(`Processed email saved as ${filename} and sent to GPT.`);
  } catch (error) {
    console.error('Error processing email:', error);
  }
};
