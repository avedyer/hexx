import { useEffect, useState } from "react"

import domtoimage from 'dom-to-image';

function Wheel(props) {

  const [rgb, setRGB] = useState([])
  const [lightness, setLightness] = useState('100%')
  const [tracking, setTracking] = useState(false)
  const [handleCoords, setHandleCoords] = useState()

  const wheelEl = 'html-wheel';

  useEffect(() => {
    if (handleCoords) {
      rotateDroppers(handleCoords)
    }
  }, [props.quantity, props.range, lightness])

  useEffect(() => {
    if (!handleCoords) {
      const wheelNode = document.getElementById(wheelEl);
      if (wheelNode) {
        const size = wheelNode.offsetWidth / 2;
        const x = size, y = 0
        setHandleCoords(boundCoordinates({x: x, y: y}))
      }
    }
  })

  function getCoords(e, node) {
      // Returns coordinates of an event within an element.
      let rect = node.getBoundingClientRect();
      let eX = e.clientX - rect.left;
      let eY = e.clientY - rect.top;
      return({x: eX, y: eY})
  }

  function getPixelColor(coordArray, node) {
    //Sets RGB state value to color of a pixel at event location.
    domtoimage.toPixelData(node)
      .then((pixels) => {
        let rect = node.getBoundingClientRect();

        
        let newArray = []

        coordArray.forEach((coords) => {

          //pixel data was black at right boundary of color circle. this patches it. don't know why.

          let adjX = coords.x + rect.x
          if (adjX >= node.scrollWidth) {
            adjX = node.scrollWidth - 1
          }

          const pixelAtXYOffset = (4 * (coords.y + rect.y) * node.scrollHeight) + (4 * adjX);
          const pixelData = pixels.slice(pixelAtXYOffset, pixelAtXYOffset + 3);

          const newRGB = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`

          newArray.push(newRGB)

        })

        setRGB(newArray)
    });    
  }   

  function moveHandle(e) {

    if (!tracking && e.type !== 'click') {
      return
    }

    const wheelNode = document.getElementById(wheelEl)

    let coords = getCoords(e, wheelNode);
    coords = boundCoordinates(coords)

    const handle = document.getElementById('handle')
    handle.style.top = `${coords.y - 10}px` //10 px adjustment centers mouse within the dropper
    handle.style.left = `${coords.x - 10}px`

    if (props.quantity > 1) {
      rotateDroppers(coords)
    }

    else {
      getPixelColor([coords], wheelNode)
    }

    setHandleCoords(coords)
  }

  function rotateDroppers(coords) {

    const wheelNode = document.getElementById(wheelEl)

    const size = wheelNode.offsetWidth / 2
    const sides =  {x: coords.x - size, y: -coords.y + size};
    const hypotenuse = Math.sqrt((sides.x**2) + (sides.y**2));

    const maxRange = props.quantity == 2 ? 1 : 1 / props.quantity

    let radAdjustment

    if (sides.x > 0) {
      if (sides.y >= 0) {
        radAdjustment = Math.atan(sides.x / sides.y)
      }
      else {
        radAdjustment = Math.atan(sides.x / sides.y) + Math.PI
      }
    }
    else {
      if (sides.y >= 0) {
        radAdjustment = Math.atan(sides.x / sides.y) + 2 * Math.PI
      }
      else {
        radAdjustment = Math.atan(sides.x / sides.y) + Math.PI
      }
    }

    const radAngle = Math.PI * 2 * (props.range * maxRange)

    let coordArray = [coords]

    document.querySelectorAll('.eyedropper').forEach((eyedropper, index) => {
      const step = props.quantity - index - 1
      const ratio = {x: Math.sin((radAngle * step) + radAdjustment), y: Math.cos((radAngle  * step) + radAdjustment)}
      let newCoords = ({x: Math.floor((hypotenuse * ratio.x) + size), y: Math.floor(Math.abs((hypotenuse * ratio.y) - size))})
      coordArray.push(newCoords)
      eyedropper.style.left = `${newCoords.x - 10}px`
      eyedropper.style.top = `${newCoords.y - 10}px`
    })

    getPixelColor(coordArray, wheelNode)
  }

  function boundCoordinates(coords) {

    const wheelNode = document.getElementById(wheelEl)
    const size = wheelNode.offsetWidth / 2
    const sides =  {x: coords.x - size, y: -coords.y + size};
    const hypotenuse = Math.sqrt((sides.x**2) + (sides.y**2));

    if (hypotenuse > size) {
      return
    }

    const margin = hypotenuse + 21 - size // overspill from edge of color wheel, accounting for size of dropper

    if (margin > 0) {

      //Gradually adjust position of dropper to avoid spilling over edge

      const radAngle = Math.abs(Math.atan(sides.x / sides.y))
      const ratio = radAngle * 2 / Math.PI

      sides.x > 0 ? coords.x = coords.x - (ratio * margin / 2) : coords.x = coords.x + (ratio * margin / 2)
      sides.y > 0 ? coords.y = coords.y + ((1 - ratio) * margin / 2) : coords.y = coords.y - ((1 - ratio) * margin / 2);

      coords.x = Math.floor(coords.x);
      coords.y = Math.floor(coords.y);
    }

    return coords
  }

  return (
    <div>
      <div id="wheel-container" onMouseLeave={() => setTracking(false)}>
        <div id={wheelEl}>
          <canvas id="wheel" />
          <canvas id="filter" style={{
            backgroundImage: `radial-gradient(hsl(0, 0%, ${lightness}) 0%, transparent 70%)`,
          }}/>
        </div>
        <div id="color-selector" 
          onMouseDown={() => setTracking(true)} 
            onMouseMove={(e) => moveHandle(e)} 
            onMouseUp={() => setTracking(false)}
            onClick={(e) => moveHandle(e)}
          >
          <div id="handle" style={{top: '0', left: 'calc(50% - 10px)'}}/>
          {Array.from(Array(props.quantity - 1)).map(() => 
            (<div className="eyedropper"/>)
          )}
        </div>
      </div>
      <div id='pallette'>
        {Array.from('x'.repeat(props.quantity)).map((item, index) => 
          <div className="color-display" key={`color${index}`} id={`color${index}`} style={{width: "48px", height: "48px", backgroundColor: rgb[index]}} />
        )}
      </div>
      <div className="slidecontainer">
        <input type="range" 
          defaultValue="100" min="1" max="100" className="slider" id="slider" 
          onChange={(e) => setLightness(`${e.target.value}%`)} //Controls lightness setting of filter
        />
      </div>
    </div>
  )
}

export default Wheel