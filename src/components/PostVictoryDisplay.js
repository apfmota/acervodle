import React from 'react';
import { FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';

const PostVictoryDisplay = ({ 
  gameType, 
  artworkTitle, 
  onGuessLocation, 
  onShowStats, 
  isLocationGame = false
}) => {
  
  const isBonusGame = gameType === 'mural' || gameType === 'sculpture';

  let titleContent;
  if (isLocationGame) {
    titleContent = (
      <h3 className="post-victory-title">
        🎉 Você encontrou: <strong>{artworkTitle}</strong>
      </h3>
    );
  } else if (isBonusGame) {
    titleContent = (
      <h3 className="post-victory-title">
        Você acertou: <strong>{artworkTitle}</strong>
      </h3>
    );
  } else {
    titleContent = (
      <h3 className="post-victory-title">
        Parabéns! Você acertou todas as características.
      </h3>
    );
  }

  return (
    <div className="post-victory-container">
      {titleContent}

      <div className="post-victory-btn-group">
        {/* Botão para reabrir o modal de estatísticas */}
        <button className="post-victory-btn stats" onClick={onShowStats}>
          <FaTrophy /> Parabéns
        </button>

        {isBonusGame && !isLocationGame && (
          <button className="post-victory-btn location" onClick={onGuessLocation}>
            <FaMapMarkerAlt /> Adivinhar Localização
          </button>
        )}
      </div>
    </div>
  );
};

export default PostVictoryDisplay;