import { cloneElement, useEffect, useState } from "react"
import { createContext } from "react";
import { useRef } from "react";

import domtoimage from 'dom-to-image';

function Wheel(props) {

  const [rgba, setRgba] = useState()

  const wheelEl = 'html-wheel', wheelImg = 'wheel-image';

  useEffect(() => {

    //Convert rendered color wheel to png and load it into an image element overlay

    domtoimage.toPng(document.getElementById(wheelEl))
      .then (function (dataUrl) {
          let img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = dataUrl;

          document.getElementById(wheelImg).src = img.src
      })
      .catch(function (error) {
          console.error('oops, something went wrong!', error);
      });
  });

  function getCoords(e) {
      // Returns coordinates of an event within an element
      let rect = e.target.getBoundingClientRect();
      let eX = e.clientX - rect.left;
      let eY = e.clientY - rect.top;
      return({x: eX, y: eY})
  }

  function getPixelColor(e, element) {

    //Returns color of a pixel at event location in specified element, in RGBA format.
    
    const coords = getCoords(e)

    let img = document.getElementById(element);
    let canvas = document.createElement('canvas');

    canvas.width = img.width;
    canvas.height = img.height;

    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

    let pixelData = canvas.getContext('2d').getImageData(coords.x, coords.y, 1, 1).data;


    return `rgba(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3] / 255})`
  }

  return (
    <div>
      <div id="wheel-container">
        <div id={wheelEl}>
          <canvas id="wheel"/>
          <canvas id="filter" style={{
            backgroundImage: `radial-gradient(hsl(0, 0%, ${props.lightness}) 0%, transparent 70%)`
          }}/>
        </div>
        <img id={wheelImg} onClick={(e) => setRgba(getPixelColor(e, wheelImg))}/>
      </div>
      <div id="color-display" style={{width: "48px", height: "48px", backgroundColor: rgba}} />
    </div>
  )
}

export default Wheel