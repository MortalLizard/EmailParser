import { Readable } from "stream";

class StringStream extends Readable {
    index = 0;

    constructor(public str: string) {
        super();
    }

    _read(size: number) {
        if (this.index >= this.str.length) {
            this.push(null);
        } else {
            const chunk = this.str.slice(this.index, this.index + size);
            this.push(chunk);
            this.index += size;
        }
    }
}

export function getInputStream(input: string | Iterable<any>) {
    return typeof input === "string" ? new StringStream(input) : Readable.from(input);
}

export async function readStream(stream: Readable): Promise<any[]> {
    const result: any[] = [];
    for await (const chunk of stream) {
        result.push(chunk);
    }
    return result;
}
