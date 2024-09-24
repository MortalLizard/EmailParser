
---

# Email Processing Pipeline Overview

This document outlines the custom email processing pipeline used to format and simplify emails, particularly from Zendesk, for local ChatGPT processing. The service is designed to streamline email content by extracting key information and formatting it into a structured output for further analysis.

## Table of Contents
1. [Introduction](#introduction)
2. [Dataflow Overview](#dataflow-overview)
    - [Input](#1-input)
    - [Tokenization](#2-tokenization)
    - [Parsing](#3-parsing)
    - [Rendering & Output](#4-rendering--output)
3. [Streaming Data](#streaming-data)
4. [Components](#components)
    - [Transformers](#transformers)
    - [Parsers](#parsers)
5. [Usage Examples](#usage-examples)
6. [Conclusion](#conclusion)

---

## Introduction
The email processing pipeline is designed to handle email formatting and extract specific elements from the content. This service plays a key role in simplifying Zendesk emails before processing them with a local ChatGPT instance.

---

## Dataflow Overview
The email processing pipeline operates in distinct stages, turning raw email input into structured outputs.

### 1. Input
The process starts with a raw email string, which may contain important details alongside unnecessary content. Below is an example of a typical email:

```
Banana Joe, 31. aug. 2024 13.52 
Hejsa
jeg har købt et
# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid
ved jer og det lader ikke rigtig op...
Ordrenummer: 1413105
Ordredato: 22/08 2024
Mvh *firstname
```

### 2. Tokenization
The input string is passed to a custom lexer, which breaks it down into specific patterns the system is designed to recognize. Each token represents a meaningful chunk, such as names, dates, or order information. Here's an example of tokenized output based on the patterns defined in the lexer:

```json
[
    { "type": "name", "value": "Banana Joe", "text": "Banana Joe" },
    { "type": "date", "value": "31. aug. 2024", "text": "31. aug. 2024" },
    { "type": "greeting", "value": "Hejsa", "text": "Hejsa" },
    { "type": "product", "value": "Sirius Sille Bloklys", "text": "# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid" },
    { "type": "order_number", "value": "1413105", "text": "Ordrenummer: 1413105" },
    { "type": "order_date", "value": "22/08 2024", "text": "Ordredato: 22/08 2024" },
    { "type": "signature", "value": "*firstname", "text": "Mvh *firstname" }
]
```

### 3. Parsing
The parser extracts key data such as names, dates, and order details from the token stream. Here's an example of parsed output based on your existing parser logic:

**Parsed Output:**
```json
{
    "name": "Banana Joe",
    "date": "31. aug. 2024",
    "greeting": "Hejsa",
    "product": "Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid",
    "order_number": "1413105",
    "order_date": "22/08 2024",
    "signature": "Mvh *firstname"
}
```

### 4. Rendering & Output
Currently, the system outputs the parsed data in a JSON-like structure. There is no detailed rendering (like HTML or styled formatting) built into the system at this stage. The output is intended for further processing or analysis in downstream systems, such as ChatGPT.

**Output Example:**
```json
{
    "name": "Banana Joe",
    "greeting": "Hejsa",
    "product": "Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid",
    "order_number": "1413105",
    "order_date": "22/08 2024"
}
```

---

## Streaming Data
The current implementation processes emails as single complete inputs and does not yet support continuous or incremental processing.

---

## Components
### Transformers
Transformers convert raw email content into token streams. The lexer currently handles elements like names, dates, product details, and order numbers.

### Parsers
The parser structures the tokenized data into a simplified format, focusing on extracting key elements like customer names, product information, and order details.

---

## Usage Examples
Here’s an example of how to use the email processing pipeline:

```typescript
const lexer = moo.compile({
  greeting: /Hejsa/,
  name: /[A-Za-z]+\s[A-Za-z]+/,
  date: /\d{2}\.\s\w+\.\s\d{4}/,
  product: /#\s[A-Za-z\s]+/,
  order_number: /Ordrenummer:\s\d+/,
  order_date: /Ordredato:\s\d{2}\/\d{2}\s\d{4}/,
  signature: /Mvh\s\*firstname/,
  message: /[A-Za-z0-9\s.,?!]+/
});

const emailString = `
Banana Joe, 31. aug. 2024 13.52 
Hejsa
jeg har købt et
# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid
ved jer og det lader ikke rigtig op...
Ordrenummer: 1413105
Ordredato: 22/08 2024
Mvh *firstname
`;

const tokenStream = lexer.reset(emailString);
const parsedResult = parser.feed(tokenStream).finish();

console.log(parsedResult);
```

---

## Conclusion
The email processing pipeline simplifies emails by extracting key information such as names, dates, and order details. It converts raw, unstructured emails into a more structured format suitable for further analysis and processing in systems like ChatGPT.

---