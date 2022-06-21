import { useEffect, useState } from "react"

import Wheel from "./wheel"

function Controls() {

  const [mode, setMode] = useState('lightness')

  return (
    <Wheel mode={mode}/>
  )
}
export default Controls