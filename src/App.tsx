import { FormEvent, useState, useRef, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import BfInterpreter from './bf'



function App() {
  const interpreter = useRef<BfInterpreter>(new BfInterpreter(8));
  const [code, setCode] = useState("");
  const [memory, setMemory] = useState<number[]>(interpreter.current.memory);
  const [programRunning, setProgramRunning] = useState(false);

  async function runCodeAsync() {
    try {
      interpreter.current.setProgram(code);
    }
    catch (e) {
      console.error("Scanning failed: ", e);
      return;
    }

    setProgramRunning(true);
    await interpreter.current.runProgramAsync(() => setMemory([...interpreter.current.memory]));
    setProgramRunning(false);
  }

  function breakProgram() {
    interpreter.current.stopProgram();
  }

  return (
    <>
        <div>
          <textarea value={code} onChange={(event) => setCode(event.target.value)}></textarea> <br/>
          <div style={{ paddingTop: 10 }}>
            {programRunning === false ? <button onClick={runCodeAsync}>Run</button> : <button onClick={breakProgram}>Break</button>}
          </div>
        </div>

        <div>
          <table>
            <tbody>
              <tr>
                {memory.map((_, index) => <th key={index} className={index === interpreter.current.memoryIndex ? "highlight" : ""}>{index}</th>)}
              </tr>
              <tr>
                {memory.map((value, index) => <td key={index} className={index === interpreter.current.memoryIndex ? "highlight" : ""}>{value}</td>)}
              </tr>
            </tbody>
          </table>
        </div>
    </>
  )
}

export default App
