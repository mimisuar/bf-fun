import { useState, useRef, useEffect } from 'react'
import './App.css'
import BfInterpreter from './bf'

interface StatusMessage {
  type?: "success" | "error",
  message: string
}

const instructions: {char: string, instruction: string}[] = [
  {char: ">", instruction: "Move data pointer to the right"},
  {char: "<", instruction: "Move data pointer to the left"},
  {char: "+", instruction: "Increment the value at the data pointer by one"},
  {char: "-", instruction: "Decrement the value at the data pointer by one"},
  {char: "[", instruction: "If the value at the data pointer is 0, jump forward the matching ]"},
  {char: "]", instruction: "If the value at the data pointer is not 0, jump back to the matching ["}
];

function App() {
  const interpreter = useRef<BfInterpreter>(new BfInterpreter({memorySize: 32, disableIO: false}));
  const [code, setCode] = useState("");
  const [memory, setMemory] = useState<number[]>(interpreter.current.memory);
  const [targets, setTargets] = useState<number[]>([]);
  const [programRunning, setProgramRunning] = useState(false);
  const [timePerStep, setTimePerStep] = useState(500);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({message: ""})
  const [correctProgramLength, setCorrectProgramLength] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [programInput, setProgramInput] = useState("");
  const [programOutput, setProgramOutput] = useState("");

  useEffect(() => {
    let tmpTargets = [];
    for (let i = 0; i < interpreter.current.size; i++) {
      tmpTargets[i] = 0;
    }

    setTargets(tmpTargets);
  }, [])

  async function runCodeAsync() {
    try {
      interpreter.current.setProgram(code);
    }
    catch (e) {
      setStatusMessage({type: "error", message: "Scanning failed: " + e})
      return;
    }

    let input: number[] = [];
    for (let i = 0; i < programInput.length; i++) {
      input.push(programInput.charCodeAt(i));
    }

    setProgramRunning(true);
    setStatusMessage({message: ""});
    await interpreter.current.runProgramAsync(timePerStep, () => {
      setMemory([...interpreter.current.memory])
      setProgramOutput(String.fromCharCode(...interpreter.current.output));
    }, input);
    setProgramRunning(false);

    // compare the input output
    for (let i = 0; i < interpreter.current.size; i++) {
      if (interpreter.current.memory[i] !== targets[i]) {
        setStatusMessage({type: "error", message: "Memory state is incorrect"});
        return;
      }
    }

    
    setStatusMessage({type: "success", message: "Correct!"})
    setCorrectProgramLength(code.length);
  }

  function breakProgram() {
    interpreter.current.stopProgram();
  }

  function getStatusCard() {
    if (statusMessage.type === undefined) {
      return <></>;
    }

    return (
      <div className={statusMessage.type === "success" ? "success-card" : "error-card"}>
        {<p>{statusMessage.message}</p>}
        {statusMessage.type === "success" ? <p>Your program is {correctProgramLength} characters long. Can you make it shorter?</p> : <></>}
      </div>
    );
  }

  return (
    <>
        <h1>BF Golf</h1>
        <p>The bottom row represents the memory state of the your interpreter. <br/>Write a program to match the top and bottom rows in as few characters as possible!</p>

        <div style={{padding: 10}}> 
        {showInstructions ? 
          <>
            <table>
              <thead>
                <tr>
                  <td>Character</td>
                  <td>Instruction</td>
                </tr>
              </thead>
              <tbody>
                {instructions.map(value => <tr><td className="highlight">{value.char}</td><td>{value.instruction}</td></tr>)}
              </tbody>
            </table>
            <button onClick={_ => setShowInstructions(false)}>Hide Instructions</button>
          </>
        : 
          <button onClick={_ => setShowInstructions(true)}>Show Instructions</button>
        }
        </div>

        <div>
          <label htmlFor="program">Program:</label> <br/>
          <textarea name="program" rows={8} cols={64} value={code} onChange={(event) => setCode(event.target.value)}></textarea> <br/>

          <div>
            <label>Time per step (ms): </label> <br/>
            <input type="number" min={5} max={1000} step={1} value={timePerStep} onChange={event => setTimePerStep(event.target.valueAsNumber)}/> <br/>
          </div>

          <div>
            <label>Program Input (ASCII Encoded): </label> <br/>
            <textarea name="programinput" rows={1} cols={64} value={programInput} onChange={event => setProgramInput(event.target.value)}></textarea> <br/>
          </div>
          
          <div style={{ paddingTop: 10 }}>
            
            {programRunning === false ? <button onClick={runCodeAsync}>Run</button> : <button onClick={breakProgram}>Break</button>}
          </div>
        </div>

        <div>
          <table>
            <tbody>
              <tr>
                <td>Target</td>
                {targets.map((targetValue, index) => <th key={index} className={index === interpreter.current.memoryIndex ? "highlight" : ""}>{targetValue}</th>)}
              </tr>
              <tr>
                <td>Values</td>
                {memory.map((value, index) => <td key={index} className={index === interpreter.current.memoryIndex ? "highlight" : ""}>{value}</td>)}
              </tr>
            </tbody>
          </table>

          <div>
            <label>Program Output: </label> <br/>
            <textarea readOnly={true} rows={1} cols={64} value={programOutput}></textarea>
          </div>
        </div>
        
        {getStatusCard()}
    </>
  )
}

export default App
