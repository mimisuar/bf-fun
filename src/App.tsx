import { useState, useRef, useEffect } from 'react'
import './App.css'
import BfInterpreter from './bf'
import Instructions from './components/Instructions'
import ProgramOutputViewer from './components/ProgramOutputViewer'
import ProgramInputForm from './components/ProgramInputForm'
import {StatusCard, StatusType} from './components/StatusCard'
import * as Tone from "tone";


function App() {
  const interpreter = useRef<BfInterpreter>(new BfInterpreter({memorySize: 32, disableIO: false}));
  const synth = useRef<Tone.MonoSynth | null>(null);
  
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

    interpreter.current.stepCallback = () => setMemory([...interpreter.current.memory]);
    interpreter.current.outputCallback = value => {
      let freq = Tone.Frequency(value, "midi");
      synth.current?.triggerAttackRelease(freq.toNote(), "1n");
    }
  }, [])

  async function runCodeAsync(code: string, programInput: string, timePerStep: number) {
    if (Tone.getContext().state !== "running") {
      Tone.start();
      synth.current = new Tone.MonoSynth({
        filterEnvelope: {
          attack: 0
        },
        envelope: {
          attack: 0
        }
      });
      synth.current.toDestination();
    }

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

    await interpreter.current.runProgramAsync(timePerStep, input);
    setProgramRunning(false);
    synth.current?.triggerRelease();

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
