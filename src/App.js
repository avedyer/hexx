import './App.css';
import Wheel from './wheel';
import Controls from './controls';

import { useState } from 'react';

function App() {

  const [quantity, setQuantity] = useState(1)
  const [range, setRange] = useState(0)

  return (
    <div className="App">
      <Wheel quantity={quantity} range={range}/>
      <Controls passQuantity={setQuantity} passRange={setRange}/>
    </div>
  );
}

export default App;
