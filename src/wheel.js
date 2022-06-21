import { cloneElement, useEffect, useState } from "react"

function Wheel(props) {

  return (
    <div id="wheel-container">
      <div id="wheel" className={props.mode}/>
      <div id="filter" className={props.mode}/>
    </div>
  )
}

export default Wheel