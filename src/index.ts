import nearley from "nearley";
import moo, { Token as MooToken } from "moo";
import { cleanAndFormatText } from './formatterService';

/** Renders the output of a parser. */
export class Renderer<T = any> {
    constructor(private parser: nearley.Parser) {}

    feed(tokens: MooToken[]) { // Ensure using MooToken type
        try {
            // Log the tokens being fed to the parser
            console.log("Feeding tokens to parser:", tokens);

            // Feed the array of tokens directly into the parser
            this.parser.feed(tokens as any); // Cast to 'any' to avoid type issues
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error.";
            console.error("Error feeding tokens:", message);

            // Check if states is defined before accessing it
            const states = (this.parser as any).states || []; // Use 'any' to bypass TypeScript check

            // Log the parser state for debugging
            console.log("Parser state at error:", {
                results: this.parser.results,
                expected: states.map((state: any) => ({
                    expected: state.expected,
                    position: state.position
                })),
                currentPosition: this.parser.current
            });

            throw new Error(`Failed to feed tokens to parser: ${message}`);
        }
        return this;
    }

    get result() {
        const results = this.parser.results;
        if (!results || results.length !== 1) {
            const message = results.length > 1 ? "Ambiguous parse result." : "No parse results found.";
            console.warn(message, results);
            throw new Error(message);
        }
        return results[0] as T;
    }
}

// Define lexer
export const lexers = {
    simple: moo.compile({
        WORD: /[a-zA-ZæøåÆØÅ]+/,
        NUMBER: /[0-9]+/,
        PUNCTUATION: /[.,!?;:]/,
        SPECIAL: /[#&%'"¤]/,
        PARENTHESIS: /[()]/,
        SPACE: { match: /\s+/, lineBreaks: true },
        NEWLINE: { match: /\n/, lineBreaks: true },
        OTHER: { match: /[^\s]+/, error: true },
    }),
};

// Define transformer
// Define transformer
// Define transformer
export class StringToTokenTransformer {
    constructor(private lexer: moo.Lexer) {}

    transform(text: string): MooToken[] {
        this.lexer.reset(text);
        const tokens: MooToken[] = [];
        let token;
        while (token = this.lexer.next()) {
            // Skip certain types if they are not relevant to your grammar
            if (!token?.type || token.type === 'NUMBER' || token.type === 'PUNCTUATION' || token.type === 'SPACE') {
                continue; 
            }
            console.log('Token:', token); // Debugging
            tokens.push(token);
        }
        console.log("Generated tokens:", tokens); // Log generated tokens for debugging
        return tokens;
    }
    
}


// Define renderers
import mailReplyGrammar from "./mail-reply";

export const renderers = {
    mail_reply: new Renderer<{ name: string, body: MooToken[] }>(new nearley.Parser(nearley.Grammar.fromCompiled(mailReplyGrammar))),
};

// EmailParser class
export class EmailParser {
    private renderer: Renderer<{ name: string, body: MooToken[] }>;

    constructor() {
        this.renderer = renderers.mail_reply;
    }

    public process(tokens: MooToken[]) { // Ensure using MooToken type
        try {
            const result = this.renderer.feed(tokens).result;
            console.log("Parsed result:", result);
        } catch {
            console.error("Error processing email content. Falling back to cleanAndFormatText.");
            const fallbackResult = cleanAndFormatText(tokens.map(token => token.value).join(' ')); // Use token.value
            console.log("Fallback result:", fallbackResult);
        }
    }
}
