interface ProgramOutputViewerProps {
    targets?: number[]
    memoryIndex: number,
    memory: number[],
    programOutput?: string
}

function ProgramOutputViewer(props: ProgramOutputViewerProps) {
    return (
        <div>
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
                {props.memory.map((value, index) => <td key={index} className={index === props.memoryIndex ? "highlight" : ""}>{value}</td>)}
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