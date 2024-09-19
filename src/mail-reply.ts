// mail-reply.ts
// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore

function id(d: any[]): any { return d[0]; }

const linebreak = { test: (x: any) => x.type === "linebreak" };
const whitespace = { test: (x: any) => x.type === "whitespace" };
const float = { test: (x: any) => x.type === "float" };
const integer = { test: (x: any) => x.type === "integer" };
const ordinal_number = { test: (x: any) => x.type === "ordinal_number" };
const punctuation = { test: (x: any) => x.type === "punctuation" };
const abbreviation = { test: (x: any) => x.type === "abbreviation" };
const word = { test: (x: any) => x.type === "word" };
const symbol = { test: (x: any) => x.type === "symbol" };
const greeting = { test: (x: any) => x.value.match(/hi|hello|hey|dear|hej|kære|godmorgen|godaften/i) };

// Remove leading whitespace tokens
const remove_leading_whitespaces = (array: any[]) => {
    let i = 0;
    while (i < array.length && array[i].type === "whitespace") {
        i++;
    }
    return array.slice(i);
}

// Output object formatting
const out = (d: any[]) => { 
    return {
        greeting: d[0].value,
        name: d[2],
        body: remove_leading_whitespaces(d[4]),
    }
};

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    { name: "Mail_Reply", symbols: [greeting, whitespace, word, whitespace, { test: (x: any) => true }], postprocess: out },
    { name: "whitespace", symbols: [whitespace], postprocess: (d: any[]) => d[0] },
    { name: "greeting", symbols: [greeting], postprocess: (d: any[]) => d[0] }
  ],
  ParserStart: "Mail_Reply",
};

export default grammar;
