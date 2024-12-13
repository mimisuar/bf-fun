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
  const [programRunning, setProgramRunning] = useState(false);

  // for the status card
  const [statusType, setStatusType] = useState<StatusType | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {

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

    setStatusType(undefined);
  }

  function breakProgram() {
    interpreter.current.stopProgram();
  }

  

  return (
    <>
        <h1>BF Tone</h1>
        <p>Control a synth with the BF language</p>

        <Instructions></Instructions>        

        <ProgramInputForm onRunProgram={runCodeAsync} onBreakProgram={breakProgram} programRunning={programRunning}></ProgramInputForm>        

        <ProgramOutputViewer memoryIndex={interpreter.current.memoryIndex} memory={memory}></ProgramOutputViewer>
        
        <StatusCard message={statusMessage} type={statusType}></StatusCard>
    </>
  )
}

export default App
