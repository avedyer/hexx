import { useEffect, useState } from "react"

import Wheel from "./wheel"

function Controls(props) {

  return (
    <div>
      <input type="range" defaultValue='1' min="1" max = "6" onChange={(e) => props.passQuantity(e.target.value)}/>
      <input type="range" min="10" max="100" onChange={(e) => props.passRange(e.target.value)}/>
    </div>
  )
}
export default Controls