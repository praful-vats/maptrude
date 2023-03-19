import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from 'mapbox-gl-geocoder';
// import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';
import * as BABYLON from 'babylonjs';


mapboxgl.accessToken = 'pk.eyJ1IjoiaXNodTAxIiwiYSI6ImNsZmRsaHE2ajNsZnYzcHIwcGc1ZnBoZ2YifQ.CtnsJf-sOu07OlGQjIe0Aw';

const Map = () => {
  const [map, setMap] = useState(null);
  const [textureUrl, setTextureUrl] = useState(null);
  const [shape, setShape] = useState("box");
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  document.body.style.zoom = "100%";

  useEffect(() => {
    const initializeMap = ({ setMap, mapContainer }) => {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-74.5, 40],
        zoom: 12,
      });

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      });

      map.addControl(geocoder);

      map.on('load', () => {
        setMap(map);
        map.resize();
      });
    };

    if (!map) initializeMap({ setMap, mapContainer: mapContainerRef });
  }, [map]);

  const mapContainerRef = useRef(null);

  const handleCaptureClick = () => {
    if (map) {
      const canvas = map.getCanvas();
      canvas.width = map.getCanvasContainer().clientWidth;
      canvas.height = map.getCanvasContainer().clientHeight;
      map.once('idle', () => {
        const dataUrl = canvas.toDataURL();
        console.log('dataUrl:', dataUrl);
        setTextureUrl(dataUrl);
        const center = map.getCenter();
        setCoordinates({ lat: center.lat, lng: center.lng });
      });
    //   map.resize();
    }
  };
  const handleChangeShape = (newShape) => {
    setShape(newShape);
  };
  const handleChangeMapStyle = (style) => {
    if (map) {
      map.setStyle(`mapbox://styles/mapbox/${style}-v12`);
    }
  };
  
  return (
    <div className="container">
        <div className="bar-container one">
            <div id='geocoder-container mapboxgl-ctrl-geocoder'></div>
            <button className='font' onClick={handleCaptureClick}>🧊 CAPTURE</button>
            <div className='font style'>
              <button onClick={() => handleChangeMapStyle('satellite')}>Satellite </button>&nbsp;&nbsp;&nbsp;&nbsp;
              <button onClick={() => handleChangeMapStyle('streets')}>Streets </button>&nbsp;&nbsp;&nbsp;&nbsp;  
              <button onClick={() => handleChangeMapStyle('outdoors')}>Outdoors </button>&nbsp;&nbsp;&nbsp;&nbsp;
              <button onClick={() => handleChangeMapStyle('dark')}>Dark </button>&nbsp;&nbsp;&nbsp;&nbsp;
              <button onClick={() => handleChangeMapStyle('light')}>Light</button>
            </div>
            <div className="coordinates font">
               {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
        </div>
        <div className="map-container two" ref={mapContainerRef}>
        </div>
        <div className="cuboid-container three">
            { <BabylonScene textureUrl={textureUrl} shape={shape} />}
        <div className="shape-buttons font">
            <button onClick={() => handleChangeShape('box')}>Cube</button><br></br>
            <button onClick={() => handleChangeShape('sphere')}>Sphere</button><br></br>
            <button onClick={() => handleChangeShape('cylinder')}>Cylinder</button><br></br>
            <button onClick={() => handleChangeShape('cone')}>Cone</button><br></br>
            <button onClick={() => handleChangeShape('torus')}>Torus</button><br></br>
        </div>
        </div>
    </div>
  );
  
};

const BabylonScene = ({ textureUrl, shape }) => {
    const canvasRef = useRef(null);
  
    useEffect(() => {
      const createScene = (engine, canvas, textureUrl, shape) => {
        const scene = new BABYLON.Scene(engine);
  
        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 5, new BABYLON.Vector3(0, 0, 0), scene);
        camera.setPosition(new BABYLON.Vector3(0, 0, -10));
        camera.attachControl(canvas, true);
  
        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 0, 0), scene);
  
        const material = new BABYLON.StandardMaterial('material', scene);
        material.diffuseTexture = new BABYLON.Texture(textureUrl, scene);

        if (textureUrl) {
            material.diffuseTexture = new BABYLON.Texture(textureUrl, scene);
          } else {
            material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            material.diffuseTexture = null;
          }
  
        let mesh;
        switch (shape) {
          case 'box':
            mesh = BABYLON.MeshBuilder.CreateBox('box', { size: 5 }, scene);
            break;
          case 'sphere':
            mesh = BABYLON.MeshBuilder.CreateSphere('sphere', { diameter: 7 }, scene);
            break;
          case 'cylinder':
            mesh = BABYLON.MeshBuilder.CreateCylinder('cylinder', { height: 5, diameter: 5 }, scene);
            break;
          case 'cone':
            mesh = BABYLON.MeshBuilder.CreateCylinder('cone', { height: 5, diameterBottom: 0, diameterTop: 5 }, scene);
            break;
          case 'torus':
            mesh = BABYLON.MeshBuilder.CreateTorus('torus', { diameter: 7, thickness: 2 }, scene);
            break;
          default:
            mesh = BABYLON.MeshBuilder.CreateBox('box', { size: 5 }, scene);
        }
  
        mesh.material = material;
        scene.clearColor = new BABYLON.Color4(1, 1, 1, 1);
  
        return scene;
      };
  
      const canvas = canvasRef.current;
      const engine = new BABYLON.Engine(canvas, true);
      const scene = createScene(engine, canvas, textureUrl, shape);
  
      engine.runRenderLoop(() => {
        scene.render();
      });
  
      window.addEventListener('resize', () => {
        engine.resize();
      });
  
      return () => {
        scene.dispose();
        engine.dispose();
      };
    }, [textureUrl, shape]);
  
    console.log('textureUrl:', textureUrl, 'shape:', shape);
  
    return <canvas ref={canvasRef} style={{ width: '400px', height: '300px' }}/>;
  };
  

export default Map;