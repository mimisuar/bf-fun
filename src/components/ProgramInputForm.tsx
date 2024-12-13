import { useState, useEffect } from "react";

interface ProgramInputFormProps {
    programRunning: boolean
    onRunProgram: (code: string, programInput: string, timePerStep: number) => void
    onBreakProgram: () => void
}

function ProgramInputForm(props: ProgramInputFormProps) {
    const [code, setCode] = useState("");
    const [timePerStep, setTimePerStep] = useState(66);
    const [programInput, setProgramInput] = useState("");

    useEffect(() => {
      setCode(",[>,]<[.<]\n\nwrite text in the box below, then hit run!\nThen try modifying this program with your own BF code")
      setProgramInput("Hello, world!")
    }, [])

    return (
        <div>
          <label htmlFor="program">Program:</label> <br/>
          <textarea name="program" rows={8} cols={64} value={code} onChange={(event) => setCode(event.target.value)}></textarea> <br/>

          <div>
            <label>Program Input (ASCII Encoded): </label> <br/>
            <textarea name="programinput" rows={1} cols={64} value={programInput} onChange={event => setProgramInput(event.target.value)}></textarea> <br/>
          </div>

          <div>
            <label>Time per step (ms): </label> <br/>
            <input type="number" min={5} max={1000} step={1} value={timePerStep} onChange={event => setTimePerStep(event.target.valueAsNumber)}/> <br/>
          </div>
          
          <div style={{ paddingTop: 10 }}>
            
            {props.programRunning === false ? 
            <button onClick={() => props.onRunProgram(code, programInput, timePerStep)}>Run</button> 
            : <button onClick={props.onBreakProgram}>Break</button>}
          </div>
        </div>
    )
}

export default ProgramInputForm