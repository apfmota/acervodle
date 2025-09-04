import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="content">
      <header className="header">
        <div className="title-box">
          <h1>Acervodle</h1>
        </div>
        <p className="subtitle">Adivinhe a obra do dia!</p>
      </header>

      <div className="modes-container">
        <Link to="/classic" className="mode-link">
          <div className="mode-card">
            <h2>Modo Clássico</h2>
            <p>Adivinhe as caracterísitcas de uma obra do Acervo artístico da UFSM</p>
          </div>
        </Link>

        <Link to="/mural" className="mode-link">
          <div className="mode-card">
            <h2>Modo Mural</h2>
            <p>Desubra qual o mural pela foto. A cada tentativa o zoom é reduzido.</p>
          </div>
        </Link>

        <Link to="/sculpture" className="mode-link">
          <div className="mode-card">
            <h2>Modo Escultura</h2>
            <p>Adivinhe qual a escultura do dia a partir da sua silhueta.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;