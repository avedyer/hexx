import { useEffect, useState } from 'react';

export default function Wheel() {

  const [initialized, setInitialized] = useState(false) //True when canvas element is placed
  const [radius, setRadius] = useState() //Radius of color wheel
  const [rendered, setRendered] = useState(false) //True when color wheel is rendered to canvas

  const [lightness ,setLightness] = useState(1) //Lightness value at center of wheel
  const [quantity, setQuantity] = useState(1) //Number of eyedroppers
  const [range, setRange] = useState(0.5) //Percentage of the wheel's circumfrence encompassed by full set of eyedroppers

  const [tracking, setTracking] = useState(false) //True when handle is following the mouse
  const [handleCoords, setHandleCoords] = useState()
  const [colors, setColors] = useState([]) //Colors selected by eyedroppers in HSL format
  const [colorLabels, setColorLabels] = useState([]) //Pallette labels based on selected model
  const [model, setModel] = useState('hsl')

  const handleRadius = 8

  useEffect(() => {
    if (!initialized) {
      if (document.getElementById('wheel') && radius) {
        renderWheel()
        setInitialized(true)
        setHandleCoords({x: radius, y: handleRadius})
      }
    }
    if (colors.length === 0 && rendered) {
      setColors([getPixelColor(handleCoords)])
    }
    if (!radius && document.getElementById('controls')) {
      const smallSide = Math.min(document.getElementById('controls').offsetHeight, document.getElementById('controls').offsetWidth)
      setRadius(Math.floor(smallSide / 2) - 80)
    }
  })

  useEffect(() => {
    if (initialized) {
      renderWheel()
    }
    if (handleCoords) {
      rotateDroppers(handleCoords)
    }
  }, [lightness])

  useEffect(() => {
    if (handleCoords) {
      rotateDroppers(handleCoords)
    }
  }, [quantity, range])

  useEffect(() => {
    if(model !== 'rgb') {
      //convert RGB string to array of values
      let rgbArray = colors.map((color) => {
        return color.substring(4, color.length-1)
        .replace(/ /g, '')
        .split(',')
      })

      //convert each value from string to integer
      rgbArray.forEach((set, index) => {
        set.forEach((value, index) => {
          set[index] = parseInt(value)
        })
        rgbArray[index] = [...set]
      })
      
      if (model === 'hex') {
        setColorLabels(rgbArray.map((set) => RGBtoHEX(set[0], set[1], set[2])))
      }

      else {
        setColorLabels(rgbArray.map((set) => RGBtoHSL(set[0], set[1], set[2])))
      }
    }
    else {
      setColorLabels([...colors])
    }
  }, [colors, model])

  function renderWheel() {
    let canvas = document.getElementById('wheel')
    let ctx = canvas.getContext('2d')
    let image = ctx.createImageData(2 * radius, 2 * radius)
    let data = image.data

    const rowLength = 2 * radius
    const pixelWidth = 4 // each pixel requires 4 slots in the data array

    for (let x = -radius; x < radius; x++) {
      for (let y = -radius; y < radius; y++) {

        let distance = Math.sqrt(x ** 2 + y ** 2)
        
        if (distance > radius) {
          // skip all coordinates outside the circle
          continue;
        }

        let radian = Math.atan2(y, x)
        let degree = radianToDegree(radian)

        let saturation = distance / radius
        let value = 1 - ((1 - lightness) * (1 - saturation))
        
        const [r, g, b] = HSVtoRGB(degree, saturation, value)

        let adjustedX = x + radius // convert x from [-50, 50] to [0, 100] (the coordinates of the image data array)
        let adjustedY = y + radius // convert y from [-50, 50] to [0, 100] (the coordinates of the image data array)

        // Figure out the starting index of this pixel in the image data array.
        let index = (adjustedX + (adjustedY * rowLength)) * pixelWidth
        data[index] = r
        data[index+1] = g
        data[index+2] = b
        data[index+3] = 255
      }
    }

    ctx.putImageData(image, 0, 0)

    setRendered(true)
  }

  function radianToDegree(rad) {
    return ((rad + Math.PI) / (2 * Math.PI)) * 360
  }

  function HSVtoRGB(hue, saturation, value) {
    let chroma = value * saturation
    let hue1 = hue / 60
    let x = chroma * (1- Math.abs((hue1 % 2) - 1))
    let r1, g1, b1
    if (hue1 >= 0 && hue1 <= 1) {
      ([r1, g1, b1] = [chroma, x, 0])
    } else if (hue1 >= 1 && hue1 <= 2) {
      ([r1, g1, b1] = [x, chroma, 0])
    } else if (hue1 >= 2 && hue1 <= 3) {
      ([r1, g1, b1] = [0, chroma, x])
    } else if (hue1 >= 3 && hue1 <= 4) {
      ([r1, g1, b1] = [0, x, chroma])
    } else if (hue1 >= 4 && hue1 <= 5) {
      ([r1, g1, b1] = [x, 0, chroma])
    } else if (hue1 >= 5 && hue1 <= 6) {
      ([r1, g1, b1] = [chroma, 0, x])
    }
    
    let m = value - chroma;
    let [r,g,b] = [r1+m, g1+m, b1+m]
    
    // Change r,g,b values from [0,1] to [0,255]
    return [255*r,255*g,255*b]
  }

  function RGBtoHEX(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  function RGBtoHSL(r, g, b) {
    r /= 255
    g /= 255
    b /= 255
    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0
    const arr = [
      Math.round(60 * h < 0 ? 60 * h + 360 : 60 * h),
      Math.round(100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0)),
      Math.round((100 * (2 * l - s)) / 2)
    ];

    return `hsl(${arr[0]}, ${arr[1]}, ${arr[2]})`
  };

  function getCoords(e, node) {
    // Returns coordinates of an event within an element.
    let rect = node.getBoundingClientRect();
    let eX = e.clientX - rect.left
    let eY = e.clientY - rect.top
    return({x: eX, y: eY})
  } 

  function boundCoordinates(coords) {

    //Adjusts coordinate values to account for size of dropper element, and ensure it is not rendered outside bounds of wheel.

    const sides =  {x: coords.x - radius, y: -coords.y + radius}
    const hypotenuse = Math.sqrt((sides.x**2) + (sides.y**2))

    if (hypotenuse > radius) {
      return
    }

    const overspill = hypotenuse + (2 * handleRadius) + 1 - radius //Overspill from edge of color wheel.

    if (overspill > 0) {

      //Gradually adjust position of dropper based on overspill value

      const radAngle = Math.abs(Math.atan(sides.x / sides.y))
      const ratio = radAngle * 2 / Math.PI //ratio of overspill in x direction over y direction

      sides.x > 0 ? coords.x = coords.x - (ratio * overspill / 2) : coords.x = coords.x + (ratio * overspill / 2)
      sides.y > 0 ? coords.y = coords.y + ((1 - ratio) * overspill / 2) : coords.y = coords.y - ((1 - ratio) * overspill / 2)

      coords.x = Math.floor(coords.x)
      coords.y = Math.floor(coords.y)
    }

    return coords
  }

  function getPixelColor(coords) {

    let canvas = document.getElementById('wheel')
    let ctx = canvas.getContext('2d')
    const pixel = ctx.getImageData(coords.x, coords.y, 1, 1)

    const data = pixel.data

    return`rgb(${data[0]}, ${data[1]}, ${data[2]})`
  }

  function moveHandle(e) {

    //Move primary handle dropper based on event location.

    if (!tracking && e.type !== 'click') {
      return
    }

    const wheelNode = document.getElementById('wheel')

    let coords = getCoords(e, wheelNode)
    coords = boundCoordinates(coords)

    const handle = document.getElementById('handle')
    handle.style.top = `${coords.y - handleRadius}px`
    handle.style.left = `${coords.x - handleRadius}px`

    setHandleCoords(coords)

    if (quantity > 1) {
      rotateDroppers(coords, e)
    }

    else {
      setColors([getPixelColor(coords)])
    }
  }

  function rotateDroppers(coords) {

    const sides =  {x: coords.x - radius, y: -coords.y + radius}
    const hypotenuse = Math.sqrt((sides.x**2) + (sides.y**2))

    const maxRange = quantity == 2 ? 1 : 1 / quantity  //Maximum fraction of the circle around which the dropper can rotate. One dropper can rotate fully.

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

    const dropperRotation = Math.PI * 2 * (range * maxRange) //Baseline rotation for each dropper.

    let coordArray = []

    document.querySelectorAll('.eyedropper').forEach((eyedropper, index) => {
      const step = quantity - index - 1

      //Ratio based on angle of rotation, multiplied with hypotenuse to find x and y coordincates 
      const ratio = {x: Math.sin((dropperRotation * step) + handleRotation), y: Math.cos((dropperRotation * step) + handleRotation)} 

      //Rounding coordinate value is necessary for finding pixel color.
      let newCoords = ({x: Math.floor((hypotenuse * ratio.x) + radius), y: Math.floor(Math.abs((hypotenuse * ratio.y) - radius))})

      coordArray.push(newCoords)

      eyedropper.style.left = `${newCoords.x - handleRadius}px`
      eyedropper.style.top = `${newCoords.y - handleRadius}px`
    })

    coordArray.push(coords)

    const newColors = coordArray.map(value => getPixelColor(value))
    setColors(newColors)
  }

  return (
    <div id='wheel-app'>
      <div id='controls'>
        <div id='wheel-container' style={{width: `${radius * 2}px`, height: `${radius * 2}px`}}>
          <canvas id='wheel' width={radius * 2} height={radius * 2}/>
          <div id='color-selector' 
            style={{width: `${radius * 2}px`, height: `${radius * 2}px`}}
            onMouseDown={() => setTracking(true)} 
              onMouseMove={(e) => moveHandle(e)} 
              onMouseUp={() => setTracking(false)}  //Tracking state keeps handle from being sticky.
              onClick={(e) => moveHandle(e)}
            >
            <div id='handle' style={{top: '0', left: `calc(50% - ${handleRadius}px)`}}/>
            {Array.from(Array(quantity - 1)).map(() => 
              (<div className='eyedropper'/>)
            )}
          </div>
        </div>
        <div id='wheel-settings' className='options' style={{width: `${radius * 2}px`}}>
          <div id='lightness-slider'>
            <input type='range' 
              defaultValue='1' min='0' max='1' step={0.02}
              onChange={(e) => setLightness(e.target.value)} //Controls lightness setting of filter
            />
          </div>
          <div id='dropper-settings'>
            <div className='slider-container'>
              <input id='quantity-selector' type='range' defaultValue='1' min='1' max = '6' onChange={(e) => setQuantity(e.target.value)}/>
              <label for='quantity-selector'>Pallette Size</label>
            </div>
            <div className='slider-container'>
              <input id='range-selector' type='range'  defaultValue='0.5' min='0' max='1' step='.01' onChange={(e) => setRange(e.target.value)}/>
              <label for='range-selector'>Spread</label>
            </div>
          </div>
        </div>
      </div>
      <div id='color-info'>
        <div id='pallette' style={{height: `${(radius * 2) + 16}px`}}>
          {Array.from(  'x'.repeat(quantity)).map((item, index) => 
            <div className='swatch-container'>
              <div className='swatch' key={`color${index}`} id={`color${index}`} style={{backgroundColor: colors[index]}} />
              <span className='label'>{colorLabels[index]}</span>
            </div>
          )}
        </div>
        <div id='model-selector' className='options'>
          <span className={model === 'hex' ? 'selected' : ''} onClick={() => setModel('hex')}>HEX</span>
          <span className={model === 'rgb' ? 'selected' : ''} onClick={() => setModel('rgb')}>RGB</span>
          <span className={model === 'hsl' ? 'selected' : ''} onClick={() => setModel('hsl')}>HSL</span>
        </div>
      </div>
    </div>
  )
}