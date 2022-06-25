import { useState } from "react"

import domtoimage from 'dom-to-image';

function Wheel() {

  const [rgba, setRgba] = useState()
  const [lightness, setLightness] = useState('100%')

  const wheelEl = 'html-wheel', wheelImg = 'wheel-image';

  function getCoords(e) {
      // Returns coordinates of an event within an element.
      let rect = e.target.getBoundingClientRect();
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

    const coords = getCoords(e)

    let img = e.target
    let canvas = document.createElement('canvas');

    canvas.width = img.width;
    canvas.height = img.height;

    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    let pixelData = canvas.getContext('2d').getImageData(coords.x, coords.y, 1, 1).data;

    setRgba(`rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`)
    
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