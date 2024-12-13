import { useState } from "react";
import { Frequency } from "tone"

interface ProgramOutputViewerProps {
    targets?: number[]
    memoryIndex: number,
    memory: number[],
    programOutput?: string
}

function ProgramOutputViewer(props: ProgramOutputViewerProps) {
    const [showAsNumber, setShowAsNumber] = useState<boolean>(false);

    const getDisplayValue = (value: number): string | number => showAsNumber ? value : Frequency(value, "midi").toNote() as string;

    return (
        <div>
          <label>Show memory as numbers: </label>
          <input type="checkbox" checked={showAsNumber} onChange={event => setShowAsNumber(event.target.checked)} />
          <table>
            <tbody>
              { !props.targets ? <></> :
              <tr>
                <td>Target</td>
                {props.targets.map((targetValue, index) => <th key={index} className={index === props.memoryIndex ? "highlight" : ""}>{targetValue}</th>)}
              </tr>
              }
              <tr>
                <td>Memory</td>
                {props.memory.map((value, index) => <td key={index} className={index === props.memoryIndex ? "highlight" : ""}>{getDisplayValue(value)}</td>)}
              </tr>
            </tbody>
          </table>

          {
            !props.programOutput ? <></> : 
          <div>
            <label>Program Output: </label> <br/>
            <textarea readOnly={true} rows={1} cols={64} value={props.programOutput}></textarea>
          </div>
          }
        </div>
    );
}

export default ProgramOutputViewer