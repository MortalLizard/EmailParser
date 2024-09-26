import { Token } from "moo"; // Import only Token from moo
import { lexers, StringToTokenTransformer, renderers } from "./index";

/**
 * Processes the given email text to extract the sender's name, date, and email body content.
 *
 * @param {string} text - The raw email text to be processed.
 * @returns {{ sender: string; date: string; emails: { mainEmail: string; subsequentEmails: string[] }; }} 
 * An object containing the sender's name, the date found, and the main and subsequent email contents.
 */
export const processEmail = (text: string): { sender: string; date: string; emails: { mainEmail: string; subsequentEmails: string[] }; } => {
    const dateRegex = /\b(\d{1,2}[\.\-/]?\s?(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)[a-z]*[\.\-/]?\s?\d{4})\s*(kl\.)?\s*(\d{1,2}[:.]\d{2})?\b/gi;
    const matches = [...text.matchAll(dateRegex)]; // Find all date matches in the text

    if (matches.length === 0) {
        return {
            sender: "Unknown Sender",
            date: "No dates found",
            emails: { mainEmail: "", subsequentEmails: [] },
        };
    }

    // Get the first date match and its index
    const firstDate = matches[0][0];
    const firstDateIndex = matches[0].index!;
    const preDateText = text.substring(0, firstDateIndex).trim(); // Text before the first date
    const senderName = detectSenderName(preDateText); // Detect the sender's name
    let mainEmailText = "";
    let subsequentEmailsText = "";

    // Determine main email content and any subsequent emails
    if (matches.length > 1) {
        const secondDateIndex = matches[1].index!;
        mainEmailText = text.substring(firstDateIndex + firstDate.length, secondDateIndex).trim();
        subsequentEmailsText = text.substring(secondDateIndex).trim();
    } else {
        mainEmailText = text.substring(firstDateIndex + firstDate.length).trim();
    }

    const cleanMainEmail = parseAndFormatText(mainEmailText); 
    const subsequentEmails: string[] = [];

    // Process any subsequent emails
    if (subsequentEmailsText) {
        const subsequentMatches = [...subsequentEmailsText.matchAll(dateRegex)];
        let startIndex = 0;

        subsequentMatches.forEach((match, index) => {
            const endIndex = subsequentMatches[index + 1]?.index ?? subsequentEmailsText.length;
            const emailSegment = subsequentEmailsText.substring(startIndex, endIndex).trim();

            if (emailSegment) {
                subsequentEmails.push(parseAndFormatText(emailSegment));
            }
            startIndex = endIndex; 
        });
    }

    return {
        sender: senderName,
        date: firstDate,
        emails: {
            mainEmail: cleanMainEmail,
            subsequentEmails,
        },
    };
};

/**
 * Detects the sender's name from the provided text.
 *
 * @param {string} text - The text from which to extract the sender's name.
 * @returns {string} - The detected sender's name or "Unknown Sender" if none is found.
 */
const detectSenderName = (text: string): string => {
    const capitalizedPattern = /((?:\b[A-ZÆØÅ][a-zæøå]+\s?){2,})/g;
    const matches = [...text.matchAll(capitalizedPattern)];

    // Return the longest match found, if any
    if (matches.length > 0) {
        const longestMatch = matches.reduce((prev, curr) => curr[0].length > prev[0].length ? curr : prev)[0];
        return longestMatch.trim();
    }

    return "Unknown Sender"; 
};

/**
 * Parses and formats the given text into a more readable format using a lexer and parser.
 *
 * @param {string} text - The text to be parsed and formatted.
 * @returns {string} - A formatted string representing the parsed content.
 */
const parseAndFormatText = (text: string): string => {
    const lexer = lexers.simple; 
    const transformer = new StringToTokenTransformer(lexer); 
    let tokens: Token[]; 

    try {
        tokens = transformer.transform(text); 
        if (!tokens.length) throw new Error("No tokens generated"); 
        console.log("Tokens:", tokens);
    } catch (error) {
        console.error("Error transforming text to tokens:", error);
        return cleanAndFormatText(text); 
    }

    const parser = renderers.mail_reply; // Use the mail reply renderer
    try {
        parser.feed(tokens); // Feed tokens to the parser
        const parsedResult = parser.getResult(); // Retrieve the parsing result

        // Ensure parsedResult has the expected structure
        if (parsedResult && 'body' in parsedResult) {
            return formatParsedResult(parsedResult); 
        } else {
            console.warn("Parsed result structure is not as expected. Falling back.");
            return cleanAndFormatText(text); // Fall back if the structure is not as expected
        }
    } catch (error) {
        console.warn("Ignoring parsing errors and falling back.");
        return cleanAndFormatText(text); // Fall back on parsing errors
    }
};

/**
 * Formats the parsed result into a human-readable string.
 *
 * @param {{ body: Token[] }} result - The parsed result containing an array of tokens.
 * @returns {string} - A formatted string that concatenates the values of the tokens in the body.
 */
function formatParsedResult(result: { body: Token[] }) {
    let formatted = "Body:\n";
    result.body.forEach((token) => {
        formatted += `${token.value} `;
    });

    return formatted.trim();
}

/**
 * Cleans and formats the given text by removing HTML tags, links, and special characters.
 *
 * @param {string} text - The text to be cleaned and formatted.
 * @returns {string} - A cleaned string with extraneous characters removed and whitespace normalized.
 */
export const cleanAndFormatText = (text: string): string => {
    const withoutHTML = text.replace(/<\/?[^>]+(>|$)/g, ""); 
    const withoutLinks = withoutHTML.replace(/https?:\/\/[^\s]+/g, ""); 
    const withoutSpecialChars = withoutLinks.replace(/[^\w\s,.!?;:'"(){}[\]æøåÆØÅ]+/gu, ""); 
    return withoutSpecialChars.replace(/\s+/g, " ").trim(); 
};
