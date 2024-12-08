import { useState, useRef, useEffect } from 'react'
import './App.css'
import BfInterpreter from './bf'

function App() {
  const interpreter = useRef<BfInterpreter>(new BfInterpreter(8));
  const [code, setCode] = useState("");
  const [memory, setMemory] = useState<number[]>(interpreter.current.memory);
  const [targets, setTargets] = useState<number[]>([]);
  const [programRunning, setProgramRunning] = useState(false);
  const [timePerStep, setTimePerStep] = useState(500);

  useEffect(() => {
    let tmpTargets: number[] = [];
    for (let i = 0; i < interpreter.current.size; i++) {
      tmpTargets[i] = Math.floor(Math.random() * 100 - 50);
    }

    setTargets(tmpTargets);
  }, [])

  async function runCodeAsync() {
    try {
      interpreter.current.setProgram(code);
    }
    catch (e) {
      console.error("Scanning failed: ", e);
      return;
    }

    setProgramRunning(true);
    await interpreter.current.runProgramAsync(timePerStep, () => setMemory([...interpreter.current.memory]));
    setProgramRunning(false);

    // compare the input output
    for (let i = 0; i < interpreter.current.size; i++) {
      if (interpreter.current.memory[i] !== targets[i]) {
        console.error("OUTPUT IS INCORRECT");
        return;
      }
    }

    console.log("CORRECT");
  }

  function breakProgram() {
    interpreter.current.stopProgram();
  }

  return (
    <>
        <h1>BF Golf</h1>
        <p>The bottom row represents the memory state of the your interpreter. <br/>Write a program to match the top and bottom rows in as few characters as possible!</p>
        <div>
          <textarea rows={4} cols={64} value={code} onChange={(event) => setCode(event.target.value)}></textarea> <br/>
          <label>Time per step (ms): </label> <br/>
          <input type="number" min={5} max={1000} step={1} value={timePerStep} onChange={event => setTimePerStep(event.target.valueAsNumber)}/>
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
        </div>
    </>
  )
}

export default App
