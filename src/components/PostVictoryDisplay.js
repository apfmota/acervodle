import React, { useState } from 'react'; // 1. Importar useState
import { FaMapMarkerAlt, FaTrophy, FaShareAlt } from 'react-icons/fa'; // 2. Importar FaShareAlt

const PostVictoryDisplay = ({ 
  gameType, 
  artworkTitle, 
  onGuessLocation, 
  onShowStats, 
  isLocationGame = false,
  onCopy
}) => {
  
  const [copied, setCopied] = useState(false); // 4. Adicionar estado de "copiado"
  const isBonusGame = gameType === 'mural' || gameType === 'sculpture';

  const handleCopyClick = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

        {onCopy && (
          <button 
            className={`post-victory-btn stats ${copied ? 'copied' : ''}`}
            onClick={handleCopyClick}
            style={copied ? { backgroundColor: '#4CAF50', color: 'white' } : {}}
          >
            <FaShareAlt /> {copied ? 'Resultado Copiado!' : 'Compartilhar!'}
          </button>
        )}

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