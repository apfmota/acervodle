import React from 'react';
import { Link } from 'react-router-dom';

const MuralGame = ({ muralArt }) => {
  return (
    <div className="game-page">
      <Link to="/" className="back-button">← Voltar</Link>
      
      <div className="game-content">
        <h2>Modo Mural</h2>
        
        {muralArt != null ? (
          <div className="art-info">
            <p>Obra sorteada para o modo mural: {muralArt.metadata['numero-de-registro'].value}</p>
          </div>
        ) : (
          <p>Carregando obra do dia...</p>
        )}
      </div>
    </div>
  );
};

export default MuralGame;