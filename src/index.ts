import nearley from "nearley";
import moo, { Token } from "moo";
import * as readline from "readline";
import { cleanAndFormatText } from './formatterService';

/** Renders the output of a parser. */
export class Renderer<T = any> {
    constructor(private parser: nearley.Parser) {}

    feed(tokens: Token[]) {
        try {
            this.parser.feed(tokens as any);
        } catch (error) {
            console.error("Error feeding tokens:", error);
            throw new Error("Failed to feed tokens to parser");
        }
        return this;
    }

    get result() {
        const results = this.parser.results;
        if (!results || results.length < 1) {
            throw new Error("No parse results found");
        }
        if (results.length > 1) {
            console.warn("Ambiguous parse result:", results);
            throw new Error("Ambiguous parse found, check your grammar");
        }
        return results[0] as T;
    }
}

// Define lexer
export const lexers = {
    simple: moo.compile({
        WORD: /[a-zA-ZæøåÆØÅ0-9]+/,  // Word token, includes numbers
        PUNCTUATION: /[.,!?;:]/,    // Common punctuation
        SPECIAL: /[#&%'"¤]/,        // Added more special characters
        PARENTHESIS: /[()]/,        // Handle parentheses
        SPACE: { match: /\s+/, lineBreaks: true },  // Spaces
        NEWLINE: { match: /\n/, lineBreaks: true }, // Newlines
        OTHER: { match: /[^\s]+/, error: true }     // Catch unmatched characters as errors
    })
};

// Define transformer
export class StringToTokenTransformer {
    constructor(private lexer: moo.Lexer) {}

    transform(text: string): Token[] {
        this.lexer.reset(text);
        let tokens: Token[] = [];
        let token;
        while (token = this.lexer.next()) {
            if (!token || !token.type) {
                console.error("Invalid token encountered:", token);
                throw new Error("Invalid token encountered during lexing");
            }
            console.log('Token:', token); // Log each token for debugging
            tokens.push(token);
        }
        return tokens;
    }
}

// Define renderers
import mailReplyGrammar from "./mail-reply";

export const renderers = {
    get mail_reply() {
        const grammar = nearley.Grammar.fromCompiled(mailReplyGrammar);
        return new Renderer<{ greeting: string, name: string, body: Token[] }>(new nearley.Parser(grammar));
    }
};

// Main function to process input
async function processInput(emailContent: string) {
    try {
        const transformer = new StringToTokenTransformer(lexers.simple);
        const tokens = transformer.transform(emailContent);

        const renderer = renderers.mail_reply;
        const result = renderer.feed(tokens).result;

        console.log("Parsed result:", result);
    } catch (error) {
        console.error("Error processing email content. Falling back to cleanAndFormatText.");
        const fallbackResult = cleanAndFormatText(emailContent);
        console.log("Fallback result:", fallbackResult);
    }
}

// Read UTF-8 input from stdin
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

console.log("Please provide the email content (UTF-8 encoded):");

// Capture the input from the user
rl.question('', async (input) => {
    await processInput(input);
    rl.close();
});
