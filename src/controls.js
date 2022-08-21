import { useEffect, useState } from "react"

import Wheel from "./wheel"

function Controls(props) {

  return (
    <div id='controls'>
      <input type="range" defaultValue='1' min="1" max = "6" onChange={(e) => props.passQuantity(e.target.value)}/>
      <input type="range"  defaultValue="0.5" min="0" max="1" step='.01' onChange={(e) => props.passRange(e.target.value)}/>
    </div>
  )
}
export default Controls