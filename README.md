# Email Processing Pipeline Overview

This document outlines the custom email processing pipeline used to format and simplify emails, particularly from Zendesk, for local ChatGPT processing. The service is designed to streamline email content by extracting key information, removing unnecessary data, and formatting the email content into a structured output suitable for further analysis.

## Table of Contents
1. [Introduction](#introduction)
2. [Dataflow Overview](#dataflow-overview)
    - [Input](#1-input)
    - [Tokenization](#2-tokenization)
    - [Parsing](#3-parsing)
    - [Rendering & Output](#4-rendering--output)
3. [Streaming Data](#streaming-data)
    - [Continuous Tokenization](#1-continuous-tokenization)
    - [Incremental Parsing](#2-incremental-parsing)
4. [Components](#components)
    - [Transformers](#transformers)
    - [Parsers](#parsers)
5. [Usage Examples](#usage-examples)
6. [Conclusion](#conclusion)

---

## Introduction
The email processing pipeline is designed to handle complex email formatting, extract meaningful components, and transform them into structured outputs. This service plays a critical role in simplifying Zendesk email content before it is processed by a local ChatGPT instance. By leveraging tokenization, parsing, and rendering techniques, the pipeline effectively turns messy, unstructured emails into readable, well-organized information.

---

## Dataflow Overview
The email processing pipeline operates in distinct stages, turning raw email input into well-structured and formatted outputs.

### 1. Input
The process starts with a raw email string. This email may contain unstructured or cluttered content, including unnecessary headers, signatures, and images. Below is an example of an unstructured email:

```
Banana Joe, 31. aug. 2024 13.52 
Hejsa
jeg har købt et
# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid
ved jer og det lader ikke rigtig op tror jeg den bliver ikke grøn med kun orange der er et billede af
det, det kan god tænde og slukke men har stået nu i 9 timer og bliver ikke grøn.
er det en bytter eller hvad ?
### Ordre
Ordrenummer: 1413105
Ordredato: 22/08 2024
De andre lys virker fint

Mvh *firstname
```

### 2. Tokenization
The input string is passed to the custom lexer, which breaks it down into individual tokens. Each token represents a unit of meaning, such as words, punctuation, dates, and abbreviations. Here’s an example of the tokenized output:

```json
[
    { "type": "name", "value": "Banana Joe", "text": "Banana Joe" },
    { "type": "date", "value": "31. aug. 2024", "text": "31. aug. 2024" },
    { "type": "greeting", "value": "Hejsa", "text": "Hejsa" },
    { "type": "message", "value": "jeg har købt et...", "text": "jeg har købt et..." },
    { "type": "product", "value": "Sirius Sille Bloklys", "text": "# Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid" },
    { "type": "order_number", "value": "1413105", "text": "Ordrenummer: 1413105" },
    { "type": "order_date", "value": "22/08 2024", "text": "Ordredato: 22/08 2024" },
    { "type": "signature", "value": "*firstname", "text": "Mvh *firstname" }
]
```

### 3. Parsing
Once the tokens are generated, the parser organizes them into meaningful structures. The parser identifies important email components such as product details, order numbers, and user messages.

**Parsed Output:**
```json
{
    "name": "Banana Joe",
    "date": "31. aug. 2024",
    "greeting": "Hejsa",
    "message": "jeg har købt et Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid ved jer og det lader ikke rigtig op. Tror jeg, den bliver ikke grøn med kun orange...",
    "product": "Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid",
    "order_number": "1413105",
    "order_date": "22/08 2024",
    "signature": "Mvh *firstname"
}
```

### 4. Rendering & Output
The renderer takes the parsed data and converts it into a readable format, suitable for further use in applications like customer support systems or automated email responses.

**Formatted Output (HTML):**
```html
<p>Hejsa Banana Joe,</p>
<p>Jeg har købt et <strong>Sirius Sille Bloklys Genopladelig H12,5 cm, Hvid</strong> ved jer, og det lader ikke rigtig op. Det bliver kun orange og aldrig grøn.</p>
<p>Ordrenummer: 1413105</p>
<p>Ordredato: 22/08 2024</p>
<p>De andre lys virker fint.</p>
<p>Mvh,<br>*firstname</p>
```

---

## Streaming Data
The pipeline supports processing email data in real-time, enabling it to handle large or incremental inputs. This is useful when working with emails that may arrive as streams or when dealing with large datasets.

### 1. Continuous Tokenization
The lexer processes incoming data as a continuous stream, generating tokens as data arrives. This allows for efficient processing of large or incomplete email inputs.

### 2. Incremental Parsing
The parser builds and updates its internal structure incrementally as tokens are generated. This ensures that the system can handle emails arriving in parts, and produce structured output as more tokens are processed.

---

## Components
### Transformers
Transformers are used to convert the raw email input into a stream of tokens. A default transformer handles various lexers for words, dates, and numbers.

### Parsers
The parser enforces grammatical and business rules to organize tokens into meaningful components. Custom grammars, defined using Nearley, enable the system to interpret complex email structures.

---

## Usage Examples
Here's an example of how to use the email processing pipeline with a real-world email:

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
The email processing pipeline efficiently simplifies unstructured emails from Zendesk into structured, well-organized outputs. By utilizing tokenization, parsing, and rendering techniques, it ensures that even the most chaotic email content can be transformed into a readable and actionable format.