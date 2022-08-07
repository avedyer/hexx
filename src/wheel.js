import { useEffect, useState } from "react";

export default function Wheel(props) {

  const [lightness ,setLightness] = useState(1)
  const [tracking, setTracking] = useState(false)
  const [handleCoords, setHandleCoords] = useState()
  const [initialized, setInitialized] = useState(false)

  const radius = 320

  useEffect(() => {
    if (!initialized) {
      if (document.getElementById('wheel')) {
        renderWheel()
        setInitialized(true)
      }
    }
  })

  useEffect(() => {
    renderWheel()
  }, [lightness])

  function renderWheel() {
    let canvas = document.getElementById('wheel')
    let ctx = canvas.getContext("2d");
    let image = ctx.createImageData(2*radius, 2*radius);
    let data = image.data;

    for (let x = -radius; x < radius; x++) {
      for (let y = -radius; y < radius; y++) {

        let distance = Math.sqrt(x*x + y*y);
        
        if (distance > radius) {
          // skip all (x,y) coordinates that are outside of the circle
          continue;
        }

        let radian = Math.atan2(y, x);
        let degree = radianToDegree(radian)

        let saturation = distance / radius
        let value = 1 - ((1 - lightness) * (1 - saturation))
        
        const [r, g, b] = HSVtoRGB(degree, saturation, value)

        // Figure out the starting index of this pixel in the image data array.
        let rowLength = 2*radius;
        let adjustedX = x + radius; // convert x from [-50, 50] to [0, 100] (the coordinates of the image data array)
        let adjustedY = y + radius; // convert y from [-50, 50] to [0, 100] (the coordinates of the image data array)
        let pixelWidth = 4; // each pixel requires 4 slots in the data array
        let index = (adjustedX + (adjustedY * rowLength)) * pixelWidth;
        data[index] = r;
        data[index+1] = g;
        data[index+2] = b;
        data[index+3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
  }

  function radianToDegree(rad) {
    return ((rad + Math.PI) / (2 * Math.PI)) * 360;
  }

  function HSVtoRGB(hue, saturation, value) {
    let chroma = value * saturation;
    let hue1 = hue / 60;
    let x = chroma * (1- Math.abs((hue1 % 2) - 1));
    let r1, g1, b1;
    if (hue1 >= 0 && hue1 <= 1) {
      ([r1, g1, b1] = [chroma, x, 0]);
    } else if (hue1 >= 1 && hue1 <= 2) {
      ([r1, g1, b1] = [x, chroma, 0]);
    } else if (hue1 >= 2 && hue1 <= 3) {
      ([r1, g1, b1] = [0, chroma, x]);
    } else if (hue1 >= 3 && hue1 <= 4) {
      ([r1, g1, b1] = [0, x, chroma]);
    } else if (hue1 >= 4 && hue1 <= 5) {
      ([r1, g1, b1] = [x, 0, chroma]);
    } else if (hue1 >= 5 && hue1 <= 6) {
      ([r1, g1, b1] = [chroma, 0, x]);
    }
    
    let m = value - chroma;
    let [r,g,b] = [r1+m, g1+m, b1+m];
    
    // Change r,g,b values from [0,1] to [0,255]
    return [255*r,255*g,255*b];
  }

  function getCoords(e, node) {
    // Returns coordinates of an event within an element.
    let rect = node.getBoundingClientRect();
    let eX = e.clientX - rect.left;
    let eY = e.clientY - rect.top;
    return({x: eX, y: eY})
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

  function getPixelColor(coords) {
    let canvas = document.getElementById('wheel')
    let ctx = canvas.getContext("2d");
    const pixel = ctx.getImageData(coords.x, coords.y, 1, 1);

    const data = pixel.data;

    const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]})`;

    return rgba;
  }

  function moveHandle(e) {

    //Move primary handle dropper based on event location.

    if (!tracking && e.type !== 'click') {
      return
    }

    const wheelNode = document.getElementById('wheel')

    let coords = getCoords(e, wheelNode);
    coords = boundCoordinates(coords)

    const handle = document.getElementById('handle')
    handle.style.top = `${coords.y - 10}px` //10px adjustment centers mouse within the dropper
    handle.style.left = `${coords.x - 10}px`

    if (props.quantity > 1) {
      rotateDroppers(coords, e)
    }

    setHandleCoords(coords)

    console.log(getPixelColor(coords))
  }

  function rotateDroppers(coords) {

    const wheelNode = document.getElementById('wheel')
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
      //coordArray = insert(coordArray, 1, boundCoordinates({x: newCoords.x - 10, y: newCoords.y - 10}))

      eyedropper.style.left = `${newCoords.x - 10}px`
      eyedropper.style.top = `${newCoords.y - 10}px`
    })
  }

  return (
    <div id='wheel-app'>
      <canvas id='wheel' width={radius * 2} height={radius * 2}/>
      <div id="slider-container" style={{width: `${radius * 2}px`}}>
        <input type="range" 
          defaultValue="1" min="0" max="1" step={0.02} className="slider" id="slider" 
          onChange={(e) => setLightness(e.target.value)} //Controls lightness setting of filter
        />
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
  )
}