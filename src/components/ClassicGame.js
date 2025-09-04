import React from 'react';
import { Link } from 'react-router-dom';

const ClassicGame = ({ classicArt }) => {
  return (
    <div className="game-page">
      <Link to="/" className="back-button">← Voltar</Link>
      
      <div className="game-content">
        <h2>Modo Clássico</h2>
        
        {classicArt != null ? (
          <div className="art-info">
            <p>Obra sorteada para o modo clássico: {classicArt.metadata['numero-de-registro'].value}</p>
          </div>
        ) : (
          <p>Carregando obra do dia...</p>
        )}
      </div>
    </div>
  );
};

export default ClassicGame;