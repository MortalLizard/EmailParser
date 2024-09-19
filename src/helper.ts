
import { Readable } from "stream";



class StringStream extends Readable {
    index = 0;
    constructor(public str: string, options = {}) {
        super(options);
    }

    _read() {
        if(this.index >= this.str.length) {
            this.push(null);
        } else { 
            const chunk_size = 1;
            const chunk = this.str.slice(this.index, this.index + chunk_size);
            this.push(chunk);
            this.index += chunk_size;
        }
    }
}


export function get_input_stream<T = any>(input: Iterable<T>) {

    if(typeof input === "string") {
    
        const s = new StringStream(input, {encoding: "utf8"});

        return new ReadableStream<T>({
            start(controller) {
                s.on("data", chunk => {
                    controller.enqueue(chunk);
                })
                s.on("end", () => {
                    controller.close();
                })
            }
        })

    } else {
        return new ReadableStream<T>({
            start(controller) {
                for(const chunk of input) {
                    controller.enqueue(chunk);
                }
                controller.close();
            }
        })
    }

}


export async function stream_promise(input: ReadableStream<any>) {
    const reader = input.getReader();
    let result = [] as any[];
    while(true) {
        const {value, done} = await reader.read();
        if(done) break;
        result.push(value);
    }
    return result;
}