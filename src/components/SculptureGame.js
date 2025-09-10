import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SculptureGame = ({ sculptureArt }) => {

  const navigate = useNavigate();

  const handleGuessLocation = () => {
    navigate('/map', { state: { sculpture: sculptureArt } });
  };

  return (
    <div className="game-page">
      <Link to="/" className="back-button">← Voltar</Link>
      
      <div className="game-content">
        <h2>Modo Escultura</h2>
        
        {sculptureArt != null ? (
          <div className="art-info">
            <p>Obra sorteada para o modo escultura: {sculptureArt.metadata['numero-de-registro'].value}</p>

            <button onClick={handleGuessLocation}>
              Adivinhar Localização
            </button>

          </div>
        ) : (
          <p>Carregando obra do dia...</p>
        )}
      </div>
    </div>
  );
};

export default SculptureGame;