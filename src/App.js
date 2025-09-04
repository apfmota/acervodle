import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { getTodaysClassicArt, getTodaysMuralArt, getTodaysSculptureArt } from './util/DailyArt';
import Home from './components/Home';
import ClassicGame from './components/ClassicGame';
import MuralGame from './components/MuralGame';
import SculptureGame from './components/SculptureGame';
import backgroundImage from './assets/background_image.png';

function App() {
  const [classicArt, setClassicArt] = useState();
  const [muralArt, setMuralArt] = useState();
  const [sculptureArt, setSculptureArt] = useState();

  useEffect(() => {
    getTodaysClassicArt().then(setClassicArt);
    getTodaysMuralArt().then(setMuralArt);
    getTodaysSculptureArt().then(setSculptureArt);
  }, []);

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
          <Route path="/classic" element={<ClassicGame classicArt={classicArt} />} />
          <Route path="/mural" element={<MuralGame muralArt={muralArt} />} />
          <Route path="/sculpture" element={<SculptureGame sculptureArt={sculptureArt} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;