import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { getTodaysClassicArt, getTodaysMuralArt, getTodaysSculptureArt } from './util/DailyArt';
import Home from './components/Home';
import ClassicGame from './components/ClassicGame';
import MuralGame from './components/MuralGame';
import SculptureGame from './components/SculptureGame';
import GuessLocation from './components/GuessLocation'; 
import backgroundImage from './assets/background_image.png';
import { fillPossibleValues } from './util/ClassicModeDataFetch';
function App() {
  const [classicArt, setClassicArt] = useState(getTodaysClassicArt());
  const [muralArt, setMuralArt] = useState(getTodaysMuralArt());
  const [sculptureArt, setSculptureArt] = useState(getTodaysSculptureArt());

  return (
    <Router>
      <div className="App">
        {/* Adicione estilo inline com a imagem importada???? */}
        <div
          className="background-overlay"
          style={{
            backgroundImage: `url(${backgroundImage})`
          }}
        ></div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classic" element={<ClassicGame loadingArt={classicArt} />} />
          <Route path="/mural" element={<MuralGame loadingArt={muralArt} />} />
          <Route path="/sculpture" element={<SculptureGame loadingArt={sculptureArt} />} />
          <Route path="/map" element={<GuessLocation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;