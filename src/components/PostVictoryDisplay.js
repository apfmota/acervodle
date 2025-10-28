import React from 'react';
import { FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';

const PostVictoryDisplay = ({ gameType, artworkTitle, onGuessLocation, onShowStats }) => {
  
  const isBonusGame = gameType === 'mural' || gameType === 'sculpture';

  return (
    <div className="post-victory-container">
      {isBonusGame ? (
        <h3 className="post-victory-title">
          Você acertou: <strong>{artworkTitle}</strong>
        </h3>
      ) : (
        <h3 className="post-victory-title">
          Parabéns! Você acertou todas as características.
        </h3>
      )}

      <div className="post-victory-btn-group">
        {/* Botão para reabrir o modal de estatísticas */}
        <button className="post-victory-btn stats" onClick={onShowStats}>
          <FaTrophy /> Parabéns
        </button>

        {/* Botão condicional para jogo de localização */}
        {isBonusGame && (
          <button className="post-victory-btn location" onClick={onGuessLocation}>
            <FaMapMarkerAlt /> Adivinhar Localização
          </button>
        )}
      </div>
    </div>
  );
};

export default PostVictoryDisplay;