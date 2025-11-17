import React, { useState } from 'react'; // 1. Importar useState
import { FaMapMarkerAlt, FaTrophy, FaShareAlt } from 'react-icons/fa'; // 2. Importar FaShareAlt

const PostVictoryDisplay = ({ 
  gameType, 
  artworkTitle, 
  onGuessLocation, 
  onShowStats, 
  isLocationGame = false,
  onCopy // 3. Adicionar onCopy às props
}) => {
  
  const [copied, setCopied] = useState(false); // 4. Adicionar estado de "copiado"
  const isBonusGame = gameType === 'mural' || gameType === 'sculpture';

  // 5. Adicionar a função de clique
  const handleCopyClick = () => {
    if (onCopy) {
      onCopy(); // Chama a função de cópia vinda do pai
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reseta o botão após 2s
    }
  };

  // Lógica de título (já estava correta)
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
            className={`post-victory-btn stats ${copied ? 'copied' : ''}`} // <-- Mudei 'share' para 'stats'
            onClick={handleCopyClick}
            style={copied ? { backgroundColor: '#4CAF50', color: 'white' } : {}} // O 'style' só vai aplicar o verde quando copiado
          >
            <FaShareAlt /> {copied ? 'Resultado Copiado!' : 'Compartilhar!'}
          </button>
        )}

        {/* Lógica do botão de localização (já estava correta) */}
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