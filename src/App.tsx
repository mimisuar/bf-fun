import { useState, useRef, useEffect } from 'react'
import './App.css'
import BfInterpreter from './bf'
import Instructions from './components/Instructions'
import ProgramOutputViewer from './components/ProgramOutputViewer'
import ProgramInputForm from './components/ProgramInputForm'
import {StatusCard, StatusType} from './components/StatusCard'


function App() {
  const interpreter = useRef<BfInterpreter>(new BfInterpreter({memorySize: 32, disableIO: false}));
  
  const [memory, setMemory] = useState<number[]>(interpreter.current.memory);
  const [targets, setTargets] = useState<number[]>([]);
  const [programRunning, setProgramRunning] = useState(false);
  const [programOutput, setProgramOutput] = useState("");

  // for the status card
  const [statusType, setStatusType] = useState<StatusType | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState("");
  const [correctProgramLength, setCorrectProgramLength] = useState(0);

  useEffect(() => {
    let tmpTargets = [];
    for (let i = 0; i < interpreter.current.size; i++) {
      tmpTargets[i] = 0;
    }

    setTargets(tmpTargets);
  }, [])

  async function runCodeAsync(code: string, programInput: string, timePerStep: number) {
    try {
      interpreter.current.setProgram(code);
    }
    catch (e) {
      //setStatusMessage({type: "error", message: })
      setStatusMessage("Scanning failed: " + e);
      setStatusType("error");
      return;
    }

    let input: number[] = [];
    for (let i = programInput.length - 1; i >= 0; i--) {
      input.push(programInput.charCodeAt(i));
    }

    setProgramRunning(true);
    setStatusMessage("");
    setStatusType(undefined);

    await interpreter.current.runProgramAsync(timePerStep, () => {
      setMemory([...interpreter.current.memory])
      setProgramOutput(String.fromCharCode(...interpreter.current.output));
    }, input);
    setProgramRunning(false);

    // compare the input output
    for (let i = 0; i < interpreter.current.size; i++) {
      if (interpreter.current.memory[i] !== targets[i]) {
        //setStatusMessage({type: "error", message: "Memory state is incorrect"});
        setStatusType("error");
        setStatusMessage("Memory state is incorrect");
        return;
      }
    }

    setStatusMessage("Correct!");
    setStatusType("success");
    setCorrectProgramLength(code.length);
  }

  function breakProgram() {
    interpreter.current.stopProgram();
  }

  

  return (
    <>
        <h1>BF Golf</h1>
        <p>The bottom row represents the memory state of the your interpreter. <br/>Write a program to match the top and bottom rows in as few characters as possible!</p>

        <Instructions></Instructions>        

        <ProgramInputForm onRunProgram={runCodeAsync} onBreakProgram={breakProgram} programRunning={programRunning}></ProgramInputForm>        

        <ProgramOutputViewer targets={targets} memoryIndex={interpreter.current.memoryIndex} memory={memory} programOutput={programOutput}></ProgramOutputViewer>
        
        <StatusCard message={statusMessage} type={statusType} programLength={correctProgramLength}></StatusCard>
    </>
  )
}

export default App
