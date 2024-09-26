import nearley from "nearley";
import moo, { Token as MooToken } from "moo";
import { cleanAndFormatText } from './formatterService';

/** Renders the output of a parser. */
export class Renderer<T = any> {
    constructor(private parser: nearley.Parser) {}

    feed(tokens: MooToken[]) {
        try {
            console.log("Feeding tokens to parser:", tokens);
            this.parser.feed(tokens as any);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error.";
            console.error("Error feeding tokens:", message);
            console.warn("Ignoring unrecognized input and continuing with fallback.");
        }
        return this;  // Allows method chaining
    }

    getResult(): T | undefined {
        return this.parser.results.length > 0 ? this.parser.results[0] : undefined;
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
import { handleIncomingEmail } from "./emailProcessor";
import { saveToFile } from "./fileService";

export const renderers = {
    mail_reply: new Renderer<{ name: string, body: MooToken[] }>(new nearley.Parser(nearley.Grammar.fromCompiled(mailReplyGrammar))),
};

// EmailParser class
export class EmailParser {
    incomingEmail(rawEmailText: string) {
        throw new Error('Method not implemented.');
    }
    private renderer: Renderer<{ name: string, body: MooToken[] }>;

    constructor() {
        this.renderer = renderers.mail_reply;
    }

    public process(tokens: MooToken[]) {
        try {
            this.renderer.feed(tokens);
            const result = this.renderer.getResult(); // Retrieve the result
            console.log("Parsed result:", result);
        } catch {
            console.error("Error processing email content. Falling back to cleanAndFormatText.");
            const fallbackResult = cleanAndFormatText(tokens.map(token => token.value).join(' '));
            console.log("Fallback result:", fallbackResult);
        }
    }
    
    
}

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

const emailObject = handleIncomingEmail(rawEmailText);

saveToFile('path/to/your/file.json', JSON.stringify(emailObject));