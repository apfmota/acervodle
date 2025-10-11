import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import { getTodaysClassicArt, getTodaysMuralArt, getTodaysSculptureArt } from './util/DailyArt';
import Home from './components/Home';
import ClassicGame from './components/ClassicGame';
import MuralGame from './components/MuralGame';
import SculptureGame from './components/SculptureGame';
import GuessLocation from './components/GuessLocation'; 
import backgroundImage from './assets/background_2.JPG';
import { fillPossibleValues } from './util/ClassicModeDataFetch';

function App() {
  const [classicArt, setClassicArt] = useState(getTodaysClassicArt());
  const [muralArt, setMuralArt] = useState(getTodaysMuralArt());
  const [sculptureArt, setSculptureArt] = useState(getTodaysSculptureArt());

  return (
    <Router>
      <div className="App">
        <div
          className="background-overlay"
          style={{
            backgroundImage: `url(${backgroundImage})`,
          }}
        ></div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/classic" element={<ClassicGame loadingArt={classicArt} />} />
          <Route path="/mural" element={<MuralGame loadingArt={muralArt} />} />
          <Route path="/sculpture" element={<SculptureGame loadingArt={sculptureArt} />} />
          <Route path="/map" element={<GuessLocation />} />
        </Routes>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-container">
            {/* Seção Sobre */}
            <div className="footer-section">
              <h3>Acervodle</h3>
              <p>Jogo educativo baseado no acervo artístico da Universidade Federal de Santa Maria.</p>
              <div className="social-links">
                <a href="https://www.instagram.com/acervoartisticoufsm/?hl=en" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://www.ufsm.br/pro-reitorias/pre/cca/divisao-de-museus-ufsm/acervo-artistico-ufsm" aria-label="Site Oficial">
                  <i className="fas fa-globe"></i>
                </a>
              </div>
            </div>

            {/* Seção Contato */}
            <div className="footer-section">
              <h4>Contato</h4>
              <ul>
                <li><i className="fas fa-envelope"></i> acervoartistico@ufsm.br</li>
                <li><i className="fas fa-phone"></i> (55) 3220-8000</li>
                <li><i className="fas fa-map-marker-alt"></i> UFSM - Santa Maria, RS</li>
              </ul>
            </div>

            {/* Seção Créditos */}
            <div className="footer-section">
              <h4>Créditos</h4>
              <p className="credits-text">
                Trabalho desenvolvido na disciplina de Projeto de Software II pelos alunos 
                Andriel Prieto Fernandes Mota, Augusto Kist Lunardi, Felipe Da Cas Becker, João Pedro Azenha Righi, sob orientação dos professores 
                Célio Trois e Andrea Charao em parceria com o Acervo Artístico UFSM.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-bottom">
            <p>&copy; 2025 Acervodle - UFSM. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;