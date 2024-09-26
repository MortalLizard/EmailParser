import nearley from "nearley"; 
import moo, { Token as MooToken } from "moo"; 
import { cleanAndFormatText } from './formatterService'; 
import mailReplyGrammar from "./mail-reply"; 
import { handleIncomingEmail } from "./emailProcessor"; 
import { saveToFile } from "./fileService"; 


export class Renderer<T = any> {
    constructor(private parser: nearley.Parser) {}

    /**
     * Feeds tokens into the parser for processing.
     *
     * @param {MooToken[]} tokens - An array of tokens to be fed into the parser.
     * @returns {Renderer} - The Renderer instance for method chaining.
     */
    feed(tokens: MooToken[]) {
        try {
            console.log("Feeding tokens to parser:", tokens); // Log tokens being fed
            this.parser.feed(tokens as any); // Feed tokens into the parser
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error.";
            console.error("Error feeding tokens:", message); 
            console.warn("Ignoring unrecognized input and continuing with fallback.");
        }
        return this;  
    }
    getResult(): T | undefined {
        return this.parser.results.length > 0 ? this.parser.results[0] : undefined; 
    }
}

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

export class StringToTokenTransformer {
    constructor(private lexer: moo.Lexer) {}

    /**
     * Transforms input text into an array of tokens using the lexer.
     *
     * @param {string} text - The text to be tokenized.
     * @returns {MooToken[]} - An array of generated tokens.
     */
    transform(text: string): MooToken[] {
        this.lexer.reset(text); 
        const tokens: MooToken[] = []; // Initialize an array to hold the tokens
        let token;

        // Loop through the text and collect tokens
        while (token = this.lexer.next()) {
            // Skip certain token types if they are not relevant to your grammar
            if (!token?.type || token.type === 'NUMBER' || token.type === 'PUNCTUATION' || token.type === 'SPACE') {
                continue; 
            }
            console.log('Token:', token); // Debugging log for each token
            tokens.push(token); // Add the token to the array
        }
        console.log("Generated tokens:", tokens); // Log generated tokens for debugging
        return tokens; 
    }
}

// Create an instance of the Renderer with the mail reply grammar
export const renderers = {
    mail_reply: new Renderer<{ name: string, body: MooToken[] }>(new nearley.Parser(nearley.Grammar.fromCompiled(mailReplyGrammar))),
};

export class EmailParser {
    private renderer: Renderer<{ name: string, body: MooToken[] }>; 

    constructor() {
        this.renderer = renderers.mail_reply; 
    }

    /**
     * Processes an array of tokens and retrieves the parsed result.
     *
     * @param {MooToken[]} tokens - The tokens to be processed.
     */
    public process(tokens: MooToken[]) {
        try {
            this.renderer.feed(tokens); // Feed tokens into the renderer
            const result = this.renderer.getResult(); // Retrieve the parsing result
            console.log("Parsed result:", result); // Log the parsed result
        } catch {
            console.error("Error processing email content. Falling back to cleanAndFormatText.");
            const fallbackResult = cleanAndFormatText(tokens.map(token => token.value).join(' ')); // Fallback to cleaning text on error
            console.log("Fallback result:", fallbackResult); // Log the fallback result
        }
    }
}

// Sample email text for testing
const rawEmailText =  `
Denne besked er sendt fra Peter Plass Jensen, 31. aug. 2024 13.52
Hejsa
jeg har købt et
# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid
ved jer og det lader ikke rigtig op tror jeg den bliver ikke grøn med kun orange der er et billede af

Mvh *firstname

Den tors. 22. aug. 2024 kl. 10.35 skrev WWW.HJEM.DK ApS :
> ![WWW.HJEM.DK ApS](https://sw12669.sfstatic.io/upload_dir/pics/NytLogo2.png)
>
> # Ordrebekræftelse (Nr. 1413105)

*email@gmail.com
Mobil xx xx xx xx

> Den mandag. 26. jun. 2024 kl. 14.21 skrev WWW.HJEM.DK ApS :
> ![WWW.HJEM.DK ApS](https://sw12669.sfstatic.io/upload_dir/pics/NytLogo2.png)
>
> # Ordrebekræftelse (Nr. 1413105)
>
> Hej *firstname *lastname,
>

> Den tors. 17. jan. 2024 kl. 10.35 skrev WWW.HJEM.DK ApS :
> ![WWW.HJEM.DK ApS](https://sw12669.sfstatic.io/upload_dir/pics/NytLogo2.png)
>
> # Ordrebekræftelse (Nr. 1413105)
>
`;

// Handle the incoming email and save it to a file
const emailObject = handleIncomingEmail(rawEmailText); 
saveToFile('path/to/your/file.json', JSON.stringify(emailObject)); 
