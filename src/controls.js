import { useEffect, useState } from "react"

import Wheel from "./wheel"
import Slider from "./slider"

function Controls() {

  const [lightness, setLightness] = useState('100%')

  return (
    <div>
      <Wheel lightness={lightness}/>
      <Slider passValue={setLightness}/>
    </div>
  )
}
export default Controls