import { useState } from "react"

import domtoimage from 'dom-to-image';

function Wheel() {

  const [rgba, setRgba] = useState()
  const [lightness, setLightness] = useState('100%')
  const [rotation, setRotation] = useState('0deg')
  const [scale, setScale] = useState('100%');
  const [tracking, setTracking] = useState(false)

  const wheelEl = 'html-wheel', wheelImg = 'wheel-image';

  function getCoords(e, element) {
      // Returns coordinates of an event within an element.
      let rect = element.getBoundingClientRect();
      let eX = e.clientX - rect.left;
      let eY = e.clientY - rect.top;
      return({x: eX, y: eY})
  }

  async function renderImage() {
    //Loads image element over html color wheel for pixel analysis.
    domtoimage.toPng(document.getElementById(wheelEl))
      .then (function (dataUrl) {
          document.getElementById(wheelImg).src = dataUrl
      })
      .catch(function (error) {
          console.error('oops, something went wrong!', error);
      });
  }

  function getPixelColor(e) {
    //Sets RGBA state value to color of a pixel at event location.

    const coords = getCoords(e, e.target)

    let img = e.target
    let canvas = document.createElement('canvas');

    canvas.width = img.width;
    canvas.height = img.height;

    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    let pixelData = canvas.getContext('2d').getImageData(coords.x, coords.y, 1, 1).data;

    setRgba(`rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`)
    
  }


  function moveDropper(e) {
    if (!tracking) {
      return
    }

    const coords = getCoords(e, document.getElementById(wheelEl))
    const size = document.getElementById(wheelEl).offsetWidth / 2
    const sides =  {x: coords.x - size, y: -coords.y + size};

    const radAngle = Math.atan(sides.x / sides.y)
    let degAngle = (radAngle * 180) / Math.PI;

    if (sides.y < 0) {
      degAngle += 180
    }

    else if (sides.x < 0) {
      degAngle += 360
    }
    
    const hypotenuse = Math.sqrt(sides.x**2 + sides.y**2);
    const ratio = 50 -((hypotenuse / size) * 50);

    e.target.style.transform = `rotate(${degAngle}deg)`;


    document.querySelectorAll('.eyedropper').forEach((eyedropper) => eyedropper.style.top = `${ratio}%`)
  }

  return (
    <div>
      <div id="wheel-container">
        <div id={wheelEl}>
          <canvas id="wheel" />
          <canvas id="filter" style={{
            backgroundImage: `radial-gradient(hsl(0, 0%, ${lightness}) 0%, transparent 70%)`,
          }}/>
        </div>
        <img id={wheelImg} onClick={(e) => getPixelColor(e, wheelImg)}/>
        <div id="color-selector" onMouseDown={() => setTracking(true)} onMouseMove={(e) => moveDropper(e)} onMouseUp={() => setTracking(false)}>
          <div className="eyedropper" />
        </div>
      </div>
      <div id="color-display" style={{width: "48px", height: "48px", backgroundColor: rgba}} />
      <div className="slidecontainer">
        <input type="range" 
          defaultValue="100" min="1" max="100" className="slider" id="slider" 
          onChange={(e) => setLightness(`${e.target.value}%`)} //Controls lightness setting of filter
          onMouseDown={() => document.getElementById(wheelImg).src = ''} //Deletes image when slider is adjusted
          onMouseUp={renderImage} //Rerenders image when slider adjustment is complete.
        />
      </div>
    </div>
  )
}

export default Wheel