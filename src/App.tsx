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
function shuffleThreeD(shapes: TwoDSet|null): ThreeDSet {
  let twoDArray = [TwoD.circle, TwoD.triangle, TwoD.square, TwoD.circle, TwoD.triangle, TwoD.square];
  for (let i = twoDArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [twoDArray[i], twoDArray[j]] = [twoDArray[j], twoDArray[i]];
  }
  const newThreeD: ThreeDSet = [
    threeDFromTwoD(twoDArray[0], twoDArray[1]),
    threeDFromTwoD(twoDArray[2], twoDArray[3]),
    threeDFromTwoD(twoDArray[4], twoDArray[5]),
  ];
  if (shapes != null && determineIsCorrect(shapes, newThreeD)) {
    return shuffleThreeD(shapes);
  }
  return newThreeD;
}

function renderMainControls(
  onReset: () => void,
  onResetAndRandomize: () => void,
) {
  return <div className="ControlPanel">
    <button className="ControlPanelButton" onClick={onReset}>Reset</button>
    <button className="ControlPanelButton" onClick={onResetAndRandomize}>Reset & Randomize</button>
  </div>
}

function renderCurrentShapes(shapes: TwoDSet) {
  return <>
    <h2 className={"CurrentVolumesTitle"}>Shape Callouts</h2>
    <div className="CurrentVolumes CurrentShapes">
      <div className="ImageBackground CurrentShapeA">
        <img src={TwoDImages[shapes[0]]} alt="CurrentShapeA" className="CurrentVolumeImage"/>
      </div>
      <div className="ImageBackground CurrentShapeB">
        <img src={TwoDImages[shapes[1]]} alt="CurrentShapeB" className="CurrentVolumeImage"/>
      </div>
      <div className="ImageBackground CurrentShapeC">
        <img src={TwoDImages[shapes[2]]} alt="CurrentShapeC" className="CurrentVolumeImage"/>
      </div>
    </div>
  </>;
}

function renderCurrentVolumes(
  volumes: ThreeDSet,
  shapes: TwoDSet,
  held: TwoD|null,
  dissected: [number, TwoD]|null,
  dissect: (index: number) => void,
) {

  const dissectAvailable: boolean[] = volumes.map((volume, i) => {
    if (held === null || (dissected !== null && dissected[0] === i)) {
      return false;
    }
    // Volumes are a sum of two shapes, both of which must be powers of 2
    return Math.log2(volume - held) % 1 === 0;
  });

  const volumeImages = volumes.map((volume, i) => {
    return <div className="ImageBackground CurrentVolumeA">
      <img src={ThreeDImages[volume]} alt="CurrentVolumeA" className="CurrentVolumeImage"/>
      <button disabled={!dissectAvailable[i]} onClick={() => dissect(i)}>Dissect</button>
    </div>
  });

  const isCorrect = determineIsCorrect(shapes, volumes);

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

function renderShapesDropped(shapes: [number, TwoD][], isHeld: boolean, pickUp: (index: number) => void) {

  const renderedShapes = shapes.map((shape, i) => {
    return <div className="ImageBackground DroppedShape">
      <img src={TwoDImages[shape[1]]} alt="CurrentShapeA" className="CurrentVolumeImage"/>
      <button onClick={() => pickUp(i)} disabled={isHeld}>Pick Up</button>
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
  killKnight: () => void,
  killOgres: () => void,
) {
  return <div className="LowerControls">
    <button className="ControlPanelButton" disabled={!shapesNotDropped.length} onClick={killKnight}>Kill Knight</button>
    <button className="ControlPanelButton" disabled={!!shapesNotDropped.length} onClick={killOgres}>Kill Ogres</button>
  </div>;
}

function determineIsCorrect(shapes: TwoDSet, volumes: ThreeDSet) {
  return volumes.every((volume, i) => {
    return Math.log2(volume - shapes[i]) % 1 !== 0;
  });
}

function App() {
  const [shapes, setShapes] = useState<TwoDSet>(shuffleTwoD());
  const [initialVolumes, setInitialVolumes] = useState<ThreeDSet>(shuffleThreeD(shapes));
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
              const newVolumes = shuffleThreeD(newShapes);
              setInitialVolumes(newVolumes);
              setVolumes(newVolumes);
              setShapes(newShapes);
              softReset();
            })}
          <div className="Readouts"></div>
          {renderCurrentShapes(shapes)}
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
            }
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
            }
          )}
          {renderKnightControls(
            shapesNotDropped,
            () => {
              const newShapesNotDropped = shapesNotDropped;
              const newShapeDropped = newShapesNotDropped.pop() || TwoD.circle;
              console.log('alpha10', newShapesNotDropped, newShapeDropped);
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
