import { FormEvent, useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BfInterpreter from './bf'



function App() {
  const interpreter = useRef<BfInterpreter>(new BfInterpreter(8));
  const [code, setCode] = useState("");
  const [memory, setMemory] = useState<number[]>(interpreter.current.memory);
  let timerId: number | undefined = undefined;

  function runCode() {
    try {
      interpreter.current.setProgram(code);
    }
    catch (e) {
      console.error("Scanning failed: ", e);
      return;
    }
    
    try {
      interpreter.current.runProgram();
      setMemory([...interpreter.current.memory]);
    }
    catch (e) {
      console.error("Running failed: ", e);
    }
  }

  async function runCodeSlowly() {
    try {
      interpreter.current.setProgram(code);
    }
    catch (e) {
      console.error("Scanning failed: ", e);
      return;
    }

    await interpreter.current.runProgramAsync(() => setMemory([...interpreter.current.memory]));
    console.log("done!");
  }

  return (
    <>
        <div>
        <textarea value={code} onChange={(event) => setCode(event.target.value)}></textarea> <br/>
        <button onClick={runCode}>Run</button>
        <button onClick={runCodeSlowly}>Run Slow</button>
        </div>

        <div>
          <table>
            <tr>
              {memory.map((value, index) => <th className={index === interpreter.current.memoryIndex ? "highlight" : ""}>{index}</th>)}
            </tr>
            <tr>
              {memory.map((value, index) => <td className={index === interpreter.current.memoryIndex ? "highlight" : ""}>{value}</td>)}
            </tr>
          </table>
        </div>
    </>
  )
}

export default App