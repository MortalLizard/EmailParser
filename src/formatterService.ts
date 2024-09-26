import { Token } from "moo"; // Import only Token from moo
import { lexers, StringToTokenTransformer, renderers } from "./index";

// Processes the given email text to extract the sender's name, date, and email body content.
export const processEmail = (text: string): { sender: string; date: string; emails: { mainEmail: string; subsequentEmails: string[] }; } => {
    const dateRegex = /\b(\d{1,2}[\.\-/]?\s?(jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)[a-z]*[\.\-/]?\s?\d{4})\s*(kl\.)?\s*(\d{1,2}[:.]\d{2})?\b/gi;
    const matches = [...text.matchAll(dateRegex)];

    if (matches.length === 0) {
        return {
            sender: "Unknown Sender",
            date: "No dates found",
            emails: { mainEmail: "", subsequentEmails: [] },
        };
    }

    const firstDate = matches[0][0];
    const firstDateIndex = matches[0].index!;
    const preDateText = text.substring(0, firstDateIndex).trim();
    const senderName = detectSenderName(preDateText);
    let mainEmailText = "";
    let subsequentEmailsText = "";

    if (matches.length > 1) {
        const secondDateIndex = matches[1].index!;
        mainEmailText = text.substring(firstDateIndex + firstDate.length, secondDateIndex).trim();
        subsequentEmailsText = text.substring(secondDateIndex).trim();
    } else {
        mainEmailText = text.substring(firstDateIndex + firstDate.length).trim();
    }

    const cleanMainEmail = parseAndFormatText(mainEmailText);
    const subsequentEmails: string[] = [];

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

const detectSenderName = (text: string): string => {
    const capitalizedPattern = /((?:\b[A-ZÆØÅ][a-zæøå]+\s?){2,})/g;
    const matches = [...text.matchAll(capitalizedPattern)];

    if (matches.length > 0) {
        const longestMatch = matches.reduce((prev, curr) => curr[0].length > prev[0].length ? curr : prev)[0];
        return longestMatch.trim();
    }

    return "Unknown Sender";
};

const parseAndFormatText = (text: string): string => {
    const lexer = lexers.simple;
    const transformer = new StringToTokenTransformer(lexer);
    let tokens: Token[]; // Use Token here

    try {
        tokens = transformer.transform(text);
        if (!tokens.length) throw new Error("No tokens generated");
        console.log("Tokens:", tokens);
    } catch (error) {
        console.error("Error transforming text to tokens:", error);
        return cleanAndFormatText(text);
    }

    const parser = renderers.mail_reply;
    try {
        parser.feed(tokens);
        const parsedResult = parser.getResult(); // Use getResult method here

        // Ensure parsedResult has the expected structure before passing to formatParsedResult
        if (parsedResult && 'body' in parsedResult) {
            return formatParsedResult(parsedResult);
        } else {
            console.warn("Parsed result structure is not as expected. Falling back.");
            return cleanAndFormatText(text);
        }
    } catch (error) {
        console.warn("Ignoring parsing errors and falling back.");
        return cleanAndFormatText(text);
    }
};

function formatParsedResult(result: { body: Token[] }) { // Use Token[] here
    let formatted = "Body:\n";
    result.body.forEach((token) => {
        formatted += `${token.value} `;
    });

    return formatted.trim();
}

export const cleanAndFormatText = (text: string): string => {
    const withoutHTML = text.replace(/<\/?[^>]+(>|$)/g, "");
    const withoutLinks = withoutHTML.replace(/https?:\/\/[^\s]+/g, "");
    const withoutSpecialChars = withoutLinks.replace(/[^\w\s,.!?;:'"(){}[\]æøåÆØÅ]+/gu, "");
    return withoutSpecialChars.replace(/\s+/g, " ").trim();
};
