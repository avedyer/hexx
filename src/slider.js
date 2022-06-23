import { useState, useEffect } from "react"

export default function Slider(props) {

  const [value, setValue] = useState(100)

  function handleChange(e) {
    console.log(e.type);
    props.passValue(`${e.target.value}%`)
  }

  return (
    <div class="slidecontainer">
      <input type="range" defaultValue="100" min="1" max="100" className="slider" id="myRange" onMouseUp={handleChange}/>
    </div>
  )
}