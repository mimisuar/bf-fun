import { useState } from 'react'

const instructions: {char: string, instruction: string}[] = [
    {char: ">", instruction: "Move data pointer to the right"},
    {char: "<", instruction: "Move data pointer to the left"},
    {char: "+", instruction: "Increment the value at the data pointer by one"},
    {char: "-", instruction: "Decrement the value at the data pointer by one"},
    {char: "[", instruction: "If the value at the data pointer is 0, jump forward the matching ]"},
    {char: "]", instruction: "If the value at the data pointer is not 0, jump back to the matching ["},
    {char: ".", instruction: "Output value at the data pointer as an ASCII character"},
    {char: ",", instruction: "Read one ASCII character into the data pointer"}
  ];

function Instructions() {
    const [showInstructions, setShowInstructions] = useState(false);

    return (
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
                {instructions.map((value, index) => <tr key={index}><td className="highlight">{value.char}</td><td>{value.instruction}</td></tr>)}
              </tbody>
            </table>
            <button onClick={_ => setShowInstructions(false)}>Hide Instructions</button>
          </>
        : 
          <button onClick={_ => setShowInstructions(true)}>Show Instructions</button>
        }
        </div>
    );
}

export default Instructions