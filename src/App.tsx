import logo from './logo.svg';
import './App.css';

import imageCircle from './shapes/circle.png'
import imageTriangle from './shapes/triangle.png'
import imageSquare from './shapes/square.png'

import imageSphere from './shapes/sphere.png';
import imageTetrahedron from './shapes/tetrahedron.png';
import imageCube from './shapes/cube.png';
import imageCone from './shapes/cone.png';
import imageCylinder from './shapes/cylinder.png';
import imagePrism from './shapes/prism.png';

import { useState } from 'react';
import React from 'react';
import Select from 'react-select';

enum Strategy {
  mixed,
  idealLeft,
  idealRight,
}

type StrategyOption = {
  value: Strategy,
  label: String,
}

enum TwoD {
  circle = 1,
  triangle = 2,
  square = 4,
}

const TwoDImages = {
  [TwoD.circle]: imageCircle,
  [TwoD.triangle]: imageTriangle,
  [TwoD.square]: imageSquare,
}

const TwoDLetters = {
  [TwoD.circle]: 'C',
  [TwoD.triangle]: 'T',
  [TwoD.square]: 'S',
}

type TwoDSet = [TwoD, TwoD, TwoD];

enum ThreeD {
  sphere = 2,
  tetrahedron = 4,
  cube = 8,
  cone = 3,
  cylinder = 5,
  prism = 6,
}

const ThreeDMap = {
  2: ThreeD.sphere,
  4: ThreeD.tetrahedron,
  8: ThreeD.cube,
  3: ThreeD.cone,
  5: ThreeD.cylinder,
  6: ThreeD.prism,
}

const ThreeDImages = {
  [ThreeD.sphere]: imageSphere,
  [ThreeD.tetrahedron]: imageTetrahedron,
  [ThreeD.cube]: imageCube,
  [ThreeD.cone]: imageCone,
  [ThreeD.cylinder]: imageCylinder,
  [ThreeD.prism]: imagePrism,
}

type ThreeDSet = [ThreeD, ThreeD, ThreeD];

function shuffleTwoD(): TwoDSet {
  let array: TwoDSet = [TwoD.circle, TwoD.triangle, TwoD.square];
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function threeDFromTwoD(a: TwoD, b: TwoD): ThreeD {
  let counter: number = a + b;
  return ThreeDMap[counter];
}

// Create a set of 3D objects that collectively contain 2 of each 2D object
function shuffleThreeD(shapes: TwoDSet|null, strategy: Strategy): ThreeDSet {
  let twoDArray = [TwoD.circle, TwoD.triangle, TwoD.square];
  for (let i = twoDArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [twoDArray[i], twoDArray[j]] = [twoDArray[j], twoDArray[i]];
  }
  const staticShapes = shapes || [TwoD.circle, TwoD.triangle, TwoD.square];
  const newThreeD: ThreeDSet = [
    threeDFromTwoD(twoDArray[0], staticShapes[0]),
    threeDFromTwoD(twoDArray[1], staticShapes[1]),
    threeDFromTwoD(twoDArray[2], staticShapes[2]),
  ];
  if (shapes != null && determineIsCorrect(shapes, newThreeD, strategy)) {
    return shuffleThreeD(shapes, strategy);
  }
  return newThreeD;
}

const strategyOptions: StrategyOption[] = [
  { value: Strategy.mixed, label: 'Mixed Shapes (Standard Method)' },
  { value: Strategy.idealLeft, label: 'Ideal Shapes, left shifted (Encounter Challenge)' },
  { value: Strategy.idealRight, label: 'Ideal Shapes, right shifted (Encounter Challenge)' },
];

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    background: '#fff',
    borderColor: '#9e9e9e',
    minHeight: '30px',
    height: '30px',
    boxShadow: state.isFocused ? null : null,
  }),

  valueContainer: (provided, state) => ({
    ...provided,
    height: '30px',
    padding: '0 6px 0 14px'
  }),

  input: (provided, state) => ({
    ...provided,
    margin: '0px',
  }),
  indicatorSeparator: state => ({
    display: 'none',
  }),
  indicatorsContainer: (provided, state) => ({
    ...provided,
    height: '30px',
  }),
};


function renderMainControls(
  onReset: () => void,
  onResetAndRandomize: () => void,
  isDisplayingLetters: boolean,
  toggleLetters: () => void,
  strategy: StrategyOption,
  setStrategy: (strategy: any) => void
) {
  return <div className="ControlPanel">
    <div className="Row">
      <button className="ControlPanelButton" onClick={onReset}>Reset</button>
      <button className="ControlPanelButton" onClick={onResetAndRandomize}>Reset & Randomize</button>
      <label htmlFor="lettersToggle">Use Letters:</label>
      <input id="lettersToggle" type="checkbox" checked={isDisplayingLetters} onChange={toggleLetters}/>
    </div>
    <div className="Row StrategyRow">
      <label>
        Strategy:
      </label>
      <Select
          defaultValue={strategy}
          onChange={setStrategy}
          options={strategyOptions as any}
          className={"SelectBox"}
          styles={customStyles}
        />
    </div>
  </div>
}

function renderCurrentShapes(shapes: TwoDSet, useLetters: boolean) {

  const shapeImages = shapes.map((shape) => {
    if (useLetters) {
      return <div className="ImageBackground LetterBackground">
      <p className="CalloutLetter">{TwoDLetters[shape]}</p>
    </div>;
    }
    return <div className="ImageBackground CurrentShapeA">
      <img src={TwoDImages[shape]} alt="CurrentShapeA" className="CurrentVolumeImage"/>
    </div>;
  });

  return <>
    <h2 className={"CurrentVolumesTitle"}>Shape Callouts</h2>
    <div className="CurrentVolumes CurrentShapes">
      {shapeImages}
    </div>
  </>;
}

function renderCurrentVolumes(
  volumes: ThreeDSet,
  shapes: TwoDSet,
  held: TwoD|null,
  dissected: [number, TwoD]|null,
  dissect: (index: number) => void,
  strategy: Strategy,
) {

  const dissectAvailable: boolean[] = volumes.map((volume, i) => {
    if (held === null || (dissected !== null && dissected[0] === i)) {
      return false;
    }
    // Volumes are a sum of two shapes, both of which must be powers of 2
    return Math.log2(volume - held) % 1 === 0;
  });

  const volumeImages = volumes.map((volume, i) => {
    return <div className={`ImageBackground CurrentVolumeA ${dissected !== null && dissected[0] === i ? 'Dissected' : ''}`}>
      <img src={ThreeDImages[volume]} alt="CurrentVolumeA" className="CurrentVolumeImage"/>
      <button disabled={!dissectAvailable[i]} onClick={() => dissect(i)}>Dissect</button>
    </div>
  });

  const isCorrect = determineIsCorrect(shapes, volumes, strategy);

  return <>
    <h2 className={"CurrentVolumesTitle"}>Held by Statues ({isCorrect ? 'Correct!' : 'Incorrect'})</h2>
    <div className="CurrentVolumes">
      {volumeImages}
    </div>
  </>;
}

function renderShapeHeld(shape: TwoD|null) {
  return <>
      <h2 className={"CurrentVolumesTitle"}>Shape Held</h2>
      <div className="DroppedShapes">
        {shape === null ? [] : <div className="ImageBackground DroppedShape"><img src={TwoDImages[shape]} alt="CurrentShapeA" className="CurrentVolumeImage"/></div>}
    </div>
  </>;
}

function renderShapesDropped(shapes: [number, TwoD][], isHeld: boolean, pickUp: (index: number) => void, letExpire: (index: number) => void) {

  const renderedShapes = shapes.map((shape, i) => {
    return <div className="ImageBackground DroppedShape">
      <img src={TwoDImages[shape[1]]} alt="CurrentShapeA" className="CurrentVolumeImage"/>
      <button onClick={() => pickUp(i)} disabled={isHeld}>Pick Up</button>
      <button style={{marginLeft: 5}} onClick={() => letExpire(i)}>×</button>
    </div>;
  });

  return <>
      <h2 className={"CurrentVolumesTitle"}>Shapes Dropped</h2>
      <div className="DroppedShapes">
      {renderedShapes}
    </div>
  </>
}

function renderKnightControls(
  shapesNotDropped: TwoD[],
  shapesDropped: [number, TwoD][],
  killKnight: (shape: TwoD) => void,
  killOgres: () => void,
) {
  return <div className="LowerControls">
    <button className="ControlPanelButton" disabled={!shapesNotDropped.includes(TwoD.circle)} onClick={() => killKnight(TwoD.circle)}>Kill Left Knight</button>
    <button className="ControlPanelButton" disabled={!shapesNotDropped.includes(TwoD.triangle)} onClick={() => killKnight(TwoD.triangle)}>Kill Middle Knight</button>
    <button className="ControlPanelButton" disabled={!shapesNotDropped.includes(TwoD.square)} onClick={() => killKnight(TwoD.square)}>Kill Right Knight</button>
    <button className="ControlPanelButton" disabled={!!shapesDropped.length || !!shapesNotDropped.length} onClick={killOgres}>Kill Ogres</button>
  </div>;
}

function determineIsCorrect(shapes: TwoDSet, volumes: ThreeDSet, strategy: Strategy) {
  if (strategy === Strategy.mixed) {
    return volumes.every((volume, i) => {
      return Math.log2(volume - shapes[i]) % 1 !== 0 && Math.log2(volume / 2) % 1 !== 0;
    });
  } else if (strategy === Strategy.idealLeft) {
    return volumes.every((volume, i) => {
      return volume === shapes[(i + 1) % 3] * 2;
    });
  } else if (strategy === Strategy.idealRight) {
    return volumes.every((volume, i) => {
      return volume === shapes[(i + 2) % 3] * 2;
    });
  }
}

function App() {
  const [useLetters, setUseLetters] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<StrategyOption>(strategyOptions[0]);

  const [shapes, setShapes] = useState<TwoDSet>(shuffleTwoD());
  const [initialVolumes, setInitialVolumes] = useState<ThreeDSet>(shuffleThreeD(shapes, strategy.value));
  const [volumes, setVolumes] = useState<ThreeDSet>(initialVolumes);
  const [currentlyHeld, setCurrentlyHeld] = useState<TwoD|null>(null);
  const [currentlyDissected, setCurrentlyDissected] = useState<[number, TwoD]|null>(null);
  const [shapesDropped, setShapesDropped] = useState<[number, TwoD][]>([]);
  const [shapesNotDropped, setShapesNotDropped] = useState<TwoD[]>(shuffleTwoD());

  const softReset = () => {
    setCurrentlyHeld(null);
    setCurrentlyDissected(null);
    setShapesDropped([]);
    setShapesNotDropped(shuffleTwoD());
  }

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <div className="Background">
        <div className="MainColumn">
          {renderMainControls(
            () => {
              setVolumes(initialVolumes);
              softReset();
            },
            () => {
              const newShapes = shuffleTwoD();
              const newVolumes = shuffleThreeD(newShapes, strategy.value);
              setInitialVolumes(newVolumes);
              setVolumes(newVolumes);
              setShapes(newShapes);
              softReset();
            },
            useLetters,
            () => setUseLetters(!useLetters),
            strategy,
            setStrategy,
          )}
          <div className="Readouts"></div>
          {renderCurrentShapes(shapes, useLetters)}
          {renderCurrentVolumes(
            volumes,
            shapes,
            currentlyHeld,
            currentlyDissected,
            (index: number) => {
              if (currentlyDissected === null) {
                setCurrentlyDissected([index, currentlyHeld || 0]);
                setCurrentlyHeld(null);
                return;
              }
              const newVolumes: ThreeDSet = [...volumes];
              const firstSwap = currentlyDissected[1];
              const secondSwap = currentlyHeld || 0;
              const firstVolumeIndex = currentlyDissected[0];
              const secondVolumeIndex = index;
              newVolumes[firstVolumeIndex] += secondSwap - firstSwap;
              newVolumes[secondVolumeIndex] += firstSwap - secondSwap;
              setVolumes(newVolumes);
              setCurrentlyDissected(null);
              setCurrentlyHeld(null);
            },
            strategy.value,
          )}
          {renderShapeHeld(currentlyHeld)}
          {renderShapesDropped(
            shapesDropped,
            currentlyHeld != null,
            (index: number) => {
              const newShapesDropped = [...shapesDropped];
              const [pickedUpShape] = newShapesDropped.splice(index, 1);
              setCurrentlyHeld(pickedUpShape[1]);
              setShapesDropped(newShapesDropped);
            },
            (index: number) => {
              const newShapesDropped = [...shapesDropped];
              newShapesDropped.splice(index, 1);
              setShapesDropped(newShapesDropped);
            }
          )}
          {renderKnightControls(
            shapesNotDropped,
            shapesDropped,
            (newShapeDropped: TwoD) => {
              let newShapesNotDropped = shapesNotDropped;
              newShapesNotDropped = newShapesNotDropped.filter((notDropped) => notDropped !== newShapeDropped);
              setShapesNotDropped(newShapesNotDropped);
              setShapesDropped([...shapesDropped, [Date.now(), newShapeDropped]])
            },
            () => {setShapesNotDropped(shuffleTwoD())},
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
