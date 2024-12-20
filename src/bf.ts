import {delay} from "./util"

interface BfInterpreterOptions {
    memorySize?: number;
    disableIO?: boolean;
}

const defaultOptions: BfInterpreterOptions = {
    memorySize: 8,
    disableIO: false
};

type OutputCallback = (outputValue: number) => void;
type StepCallback = () => void;
type ShiftCallback = () => void;
type ValueChangeCallback = () => void;

class BfInterpreter {
    memory: number[] = [];
    jumpPoints: number[] = [];
    size: number;
    memoryIndex: number = 0;
    program: string = "";
    programCounter: number = 0;
    output: number[] = [];
    input: number[] = [];
    disableIO: boolean = false;

    public stepCallback?: StepCallback;
    public shiftRightCallback?: ShiftCallback;
    public shiftLeftCallback?: ShiftCallback;
    public incrementCallback?: ValueChangeCallback;
    public decrementCallback?: ValueChangeCallback;
    public outputCallback?: OutputCallback;

    constructor(options?: BfInterpreterOptions) {
        if (options === undefined) {
            options = defaultOptions;
        }

        this.size = options.memorySize !== undefined ? options.memorySize : defaultOptions.memorySize!;
        this.disableIO = options.disableIO !== undefined ? options.disableIO : defaultOptions.disableIO!;

        this.resetMemory();
    }

    resetMemory(): void {
        this.memory = [];
        for (let i = 0; i < this.size; i++) {
            this.memory[i] = 0;
        }
    }

    setProgram(program: string): void {
        this.program = this.stripProgram(program);
        console.log(this.program);
        this.resetMemory();
        this.scanForLoopPoints();
    }

    stripProgram(program: string): string {
        let final = "";
        for (let i = 0; i < program.length; i++) {
            if ("+-[]<>.,".includes(program[i])) {
                final += program[i];
            }
        }
        return final;
    }

    scanForLoopPoints(): void {
        this.jumpPoints = [];
        let starts = [];
        for (let i = 0; i < this.program.length; i++) {
            if (this.program[i] === "[") {
                starts.push(i);
            }
            else if (this.program[i] === "]") {
                if (starts.length === 0) {
                    throw "mismatched [";
                }

                let startPoint = starts.pop()!;
                this.jumpPoints[startPoint] = i;
                this.jumpPoints[i] = startPoint;
            }
        }

        if (starts.length > 0) {
            throw "mismatched ]";
        }
    }

    async runProgramAsync(timerPerStep: number, input: number[] = []) {
        this.resetProgramState(input);
        const actionCharacters: string = "+-><."; // these are the characters that alter machine state

        while (this.programCounter < this.program.length) {
            let character = this.program[this.programCounter];
            this.interpretCode();
            if (this.stepCallback) { 
                this.stepCallback(); 
            }

            if (!actionCharacters.includes(character)) {
                continue;
            }
            await delay(timerPerStep);
        }
    }

    stopProgram() {
        this.programCounter = this.program.length;
    }

    resetProgramState(input: number[] = []): void {
        this.programCounter = 0;
        this.input = input;
        this.output = [];
        this.memoryIndex = 0;
    }

    interpretCode(): void {
        let character: string = this.program[this.programCounter];
        switch (character) {
            case ">":
                this.moveMemoryIndexRight();
                if (this.shiftRightCallback) {
                    this.shiftRightCallback();
                }
                break;

            case "<":
                this.moveMemoryIndexLeft();
                if (this.shiftLeftCallback) {
                    this.shiftLeftCallback();
                }
                break;

            case "+":
                this.incrementMemory();
                if (this.incrementCallback) {
                    this.incrementCallback();
                }
                break;
            
            case "-":
                this.decrementMemory();
                if (this.decrementCallback) {
                    this.decrementCallback();
                }
                break;

            case ".":
                if (!this.disableIO) {
                    this.pushToOutput();
                    if (this.outputCallback) {
                        this.outputCallback(this.memory[this.memoryIndex]);
                    }
                }
                break;

            case ",":
                if (!this.disableIO) {
                    this.pullFromInput();
                }
                break;

            case "[":
                this.startLoop();
                break;

            case "]":
                this.endLoop();
                break;
        }

        this.programCounter += 1;
    }

    moveMemoryIndexRight(): void {
        this.memoryIndex += 1;
        if (this.memoryIndex >= this.size) {
            this.memoryIndex = 0;
        }
    }

    moveMemoryIndexLeft(): void {
        this.memoryIndex -= 1;
        if (this.memoryIndex < 0) {
            this.memoryIndex = this.size - 1;
        }
    }

    incrementMemory(): void {
        this.memory[this.memoryIndex] += 1;
        if (this.memory[this.memoryIndex] >= 256) {
            this.memory[this.memoryIndex] = 0;
        }
    }

    decrementMemory(): void {
        this.memory[this.memoryIndex] -= 1;
        if (this.memory[this.memoryIndex] < 0) {
            this.memory[this.memoryIndex] = 255;
        }
    }

    pushToOutput(): void {
        this.output.push(this.memory[this.memoryIndex]);
    }

    pullFromInput(): void {
        let num = this.input.pop();
        if (num === undefined) {
            this.memory[this.memoryIndex] = 0;
            return;
        }
        this.memory[this.memoryIndex] = num!;
    }

    startLoop(): void {
        if (this.memory[this.memoryIndex] === 0) {
            this.programCounter = this.jumpPoints[this.programCounter];
        }
    }

    endLoop(): void {
        if (this.memory[this.memoryIndex] !== 0) {
            this.programCounter = this.jumpPoints[this.programCounter];
        }
    }
}

export default BfInterpreter;