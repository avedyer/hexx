import { useEffect, useState } from "react"

import domtoimage from 'dom-to-image';

function Wheel(props) {

  const [rgb, setRGB] = useState([])
  const [lightness, setLightness] = useState('100%')
  const [tracking, setTracking] = useState(false)
  const [handleCoords, setHandleCoords] = useState()

  const wheelEl = 'wheel';
  const containerSize = 384
  const radius = 320

  useEffect(() => {
    //Adjust droppers when settings are changed outside of handle movement
    if (handleCoords) {
      rotateDroppers(handleCoords)
    }
  }, [props.quantity, props.range, lightness])


  useEffect(() => {
    //Sets default handle coordinates for proper rendering of new droppers.
    if (!handleCoords) {
      const wheelNode = document.getElementById(wheelEl);
      if (wheelNode) {
        const x = radius, y = 0
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

    //Sets RGB state value based on array of coordinates

    domtoimage.toPixelData(node)
      .then((pixels) => {

        let rect = node.getBoundingClientRect();

        let newArray = []

        coordArray.forEach((coords) => {

          if (coords.x > 320) {
            coords.x = 320 + (256 * ((coords.x - 320) / 320))
          }

          const pixelAtXYOffset = (4 * Math.floor(coords.y + 64) * node.scrollHeight) + (4 * Math.floor(coords.x + 64));
          const pixelData = pixels.slice(pixelAtXYOffset, pixelAtXYOffset + 3);

          const newRGB = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`

          newArray.push(newRGB)
        })

        setRGB([...newArray]) 

        })

  }   

  function moveHandle(e) {

    //Move primary handle dropper based on event location.

    if (!tracking && e.type !== 'click') {
      return
    }

    const wheelNode = document.getElementById(wheelEl)

    let coords = getCoords(e, wheelNode);
    coords = boundCoordinates(coords)

    const handle = document.getElementById('handle')
    handle.style.top = `${coords.y - 10}px` //10px adjustment centers mouse within the dropper
    handle.style.left = `${coords.x - 10}px`

    if (props.quantity > 1) {
      rotateDroppers(coords, e)
    }

    else {
      getPixelColor([{x: coords.x - 10, y: coords.y - 10}], wheelNode, e)
    }

    setHandleCoords(coords)
  }

  function rotateDroppers(coords, e) {

    const wheelNode = document.getElementById(wheelEl)
    const sides =  {x: coords.x - radius, y: -coords.y + radius};
    const hypotenuse = Math.sqrt((sides.x**2) + (sides.y**2));

    const maxRange = props.quantity == 2 ? 1 : 1 / props.quantity  //Maximum fraction of the circle around which the dropper can rotate. One dropper can rotate freely.

    let handleRotation  //Degree of rotation of handle. Applied as adjustment to each dropper.

    if (sides.x > 0) {
      if (sides.y >= 0) {
        handleRotation = Math.atan(sides.x / sides.y)
      }
      else {
        handleRotation = Math.atan(sides.x / sides.y) + Math.PI
      }
    }
    else {
      if (sides.y >= 0) {
        handleRotation = Math.atan(sides.x / sides.y) + 2 * Math.PI
      }
      else {
        handleRotation = Math.atan(sides.x / sides.y) + Math.PI
      }
    }

    const dropperRotation = Math.PI * 2 * (props.range * maxRange) //Baseline rotation for each dropper.

    let coordArray = [coords]

    document.querySelectorAll('.eyedropper').forEach((eyedropper, index) => {
      const step = props.quantity - index - 1

      //Ratio based on angle of rotation, multiplied with hypotenuse to find x and y coordincates 
      const ratio = {x: Math.sin((dropperRotation * step) + handleRotation), y: Math.cos((dropperRotation  * step) + handleRotation)} 

      //Rouding coordinate value is necessary for finding pixel color.
      let newCoords = ({x: Math.floor((hypotenuse * ratio.x) + radius), y: Math.floor(Math.abs((hypotenuse * ratio.y) - radius))})
      coordArray = insert(coordArray, 1, boundCoordinates({x: newCoords.x - 10, y: newCoords.y - 10}))

      eyedropper.style.left = `${newCoords.x - 10}px`
      eyedropper.style.top = `${newCoords.y - 10}px`
    })

    getPixelColor(coordArray, wheelNode)
  }

  function boundCoordinates(coords) {

    //Adjusts coordinate values to account for size of dropper element, and ensure it is not rendered outside bounds of wheel.

    const sides =  {x: coords.x - radius, y: -coords.y + radius};
    const hypotenuse = Math.sqrt((sides.x**2) + (sides.y**2));

    if (hypotenuse > radius) {
      return
    }

    const margin = hypotenuse + 21 - radius //Overspill from edge of color wheel. Dropper radius of 10 is implied but is actually defined in CSS.

    if (margin > 0) {

      //Gradually adjust position of dropper

      const radAngle = Math.abs(Math.atan(sides.x / sides.y))
      const ratio = radAngle * 2 / Math.PI

      sides.x > 0 ? coords.x = coords.x - (ratio * margin / 2) : coords.x = coords.x + (ratio * margin / 2)
      sides.y > 0 ? coords.y = coords.y + ((1 - ratio) * margin / 2) : coords.y = coords.y - ((1 - ratio) * margin / 2);

      coords.x = Math.floor(coords.x);
      coords.y = Math.floor(coords.y);
    }

    return coords
  }

  const insert = (arr, index, ...newItems) => [
    // part of the array before the specified index
    ...arr.slice(0, index),
    // inserted items
    ...newItems,
    // part of the array after the specified index
    ...arr.slice(index)
  ]

  return (
    <div id='wheel-app'>
      <div id="wheel-container" style={{width: `${containerSize * 2}px`, height: `${containerSize * 2}px`}} onMouseLeave={() => setTracking(false)}>
        <div id={wheelEl}>
          <canvas id="hue" />
          <canvas id="shade" style={{
            backgroundImage: `radial-gradient(hsl(0, 0%, ${lightness}) 0%, transparent 70%)`,
          }}/>
        </div>
        <div id="color-selector" 
          onMouseDown={() => setTracking(true)} 
            onMouseMove={(e) => moveHandle(e)} 
            onMouseUp={() => setTracking(false)}  //Tracking state keeps handle from being sticky.
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
      <div className="slidecontainer" style={{width: `${radius * 2}px`}}>
        <input type="range" 
          defaultValue="100" min="1" max="100" className="slider" id="slider" 
          onChange={(e) => setLightness(`${e.target.value}%`)} //Controls lightness setting of filter
        />
      </div>
    </div>
  )
}

export default Wheel