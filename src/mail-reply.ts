// mail-reply.ts
// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore

function id(d: any[]): any { return d[0]; }

const whitespace = { test: (x: any) => x.type === "SPACE" }; // Ensure this matches lexer token
const word = { test: (x: any) => x.type === "WORD" };
const punctuation = { test: (x: any) => x.type === "PUNCTUATION" };

const remove_leading_whitespaces = (array: any[]) => {
    let i = 0;
    while (i < array.length && array[i].type === "SPACE") {
        i++;
    }
    return array.slice(i);
};

const wordOrNumber = { test: (x: any) => x.type === "WORD" || x.type === "NUMBER" };

// Output object formatting
const out = (d: any[]) => {
    console.log("Processing d array:", d);
    
    const name = d[0] && d[0].value ? d[0].value : null;
    const body = Array.isArray(d) && d.length >= 3 && Array.isArray(d[2])
        ? remove_leading_whitespaces(d[2])
        : [];

    console.log("Name:", name);
    console.log("Body:", body);

    return {
        name,
        body,
    };
};

interface NearleyToken {
  value: any;
  [key: string]: any;
}

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
}

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
}

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
}

// Updated grammar
const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {
      name: "Mail_Reply",
      symbols: [wordOrNumber, whitespace, "body"],
      postprocess: out
    },
    {
      name: "body",
      symbols: [{ test: (x: any) => true }],
      postprocess: (d: any[]) => remove_leading_whitespaces(d),
    },
    {
      name: "start",
      symbols: ["Mail_Reply"],
      postprocess: id
    },
    { name: "whitespace", symbols: [{ test: (x: any) => x.type === "SPACE" }], postprocess: id },
    { name: "word", symbols: [{ test: (x: any) => x.type === "WORD" }], postprocess: id },
    { name: "number", symbols: [{ test: (x: any) => x.type === "NUMBER" }], postprocess: id },
    {
      name: "sentence",
      symbols: ["word", "whitespace", "word"],
      postprocess: (data) => data.join(" ")
    },
    {
      name: "start",
      symbols: ["sentence", punctuation],
      postprocess: (data) => data.join(" ")
    },
  ],
  ParserStart: "start",
};
export default grammar;
