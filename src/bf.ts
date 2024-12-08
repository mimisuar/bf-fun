const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

class BfInterpreter {
    memory: number[] = [];
    jumpPoints: number[] = [];
    size: number;
    memoryIndex: number = 0;
    program: string = "";
    programCounter: number = 0;
    output: number[] = [];
    input: number[] = [];

    constructor(size: number) {
        this.size = size;
        this.resetMemory();
    }

    resetMemory(): void {
        this.memory = [];
        for (let i = 0; i < this.size; i++) {
            this.memory[i] = 0;
        }
    }

    setProgram(program: string): void {
        this.program = program;
        this.resetMemory();
        this.scanForLoopPoints();
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

    runProgram(input: number[] = []): void {
        this.resetProgramState(input);

        while (this.programCounter < this.program.length) {
            this.interpretCode();
        }
    }

    async runProgramAsync(stepCallback: () => void, input: number[] = []) {
        this.resetProgramState(input);

        while (this.programCounter < this.program.length) {
            let character = this.program[this.programCounter];
            this.interpretCode();
            stepCallback();

            if (character === "[" || character === "]") {
                continue;
            }
            await delay(500);
        }
    }

    resetProgramState(input: number[] = []): void {
        this.programCounter = 0;
        this.input = input;
        this.output = [];
        this.memoryIndex = 0;
    }

    // this function returns the next program counter
    interpretCode(): void {
        let character: string = this.program[this.programCounter];
        switch (character) {
            case ">":
                this.moveMemoryIndexRight();
                break;

            case "<":
                this.moveMemoryIndexLeft();
                break;

            case "+":
                this.incrementMemory();
                break;
            
            case "-":
                this.decrementMemory();
                break;

            case ".":
                this.pushToOutput();
                break;

            case ",":
                this.pullFromInput();
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
    }

    decrementMemory(): void {
        this.memory[this.memoryIndex] -= 1;
    }

    pushToOutput(): void {
        this.output.push(this.memory[this.memoryIndex]);
    }

    pullFromInput(): void {
        let num = this.input.pop();
        if (num === undefined) {
            throw "Insufficient input.";
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