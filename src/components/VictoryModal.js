import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaPalette, 
  FaPaintRoller, // Corrigido (em vez de FaPaintBrush)
  FaChartBar, 
  FaMapMarkerAlt, 
  FaShareAlt // Adicionado
} from 'react-icons/fa';
import { GiStoneBust } from 'react-icons/gi'; // Corrigido (em vez de FaMonument)

const VictoryModal = ({ 
  isOpen, 
  onClose, 
  artworkTitle, 
  artworkImage, 
  attemptsCount, 
  gameType,
  alreadyWon,
  onGuessLocation,
  isLocationVictory = false,
  onCopy // 1. Prop de cópia adicionada
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [copied, setCopied] = useState(false); // 2. Estado de "copiado"

  // Gera um número aleatório estável para a estatística
  const randomPlayerNumber = useMemo(() => Math.floor(Math.random() * 200) + 50, [artworkTitle]);

  // Lógica para o temporizador de contagem regressiva
  const calculateTimeRemaining = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    // Define o valor inicial imediatamente
    setTimeRemaining(calculateTimeRemaining());

    // Atualiza a cada segundo
    const timerId = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    // Limpa o intervalo quando o componente é desmontado ou fechado
    return () => clearInterval(timerId);
  }, [isOpen]);

  // Retorna nulo se não estiver aberto
  if (!isOpen) return null;

  // Determina o nome do tipo de jogo para o texto
  const gameName = gameType === 'classic' ? 'obra' : (gameType === 'mural' ? 'mural' : 'escultura');

  const handleLocationClick = () => {
    if (onGuessLocation) {
      onGuessLocation();
    }
    onClose();
  };

  // 3. Função para lidar com o clique de copiar
  const handleCopyClick = () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reseta o botão
    }
  };


  return (
    <div className="victory-modal-overlay" onClick={onClose}>
      <div className="victory-modal" onClick={(e) => e.stopPropagation()}>
        <button className="victory-modal-close" onClick={onClose}>
          X
        </button>

        <h2 className="victory-modal-title">
          {isLocationVictory ? 'Localização Correta!' : (alreadyWon ? 'Você já acertou essa obra' : 'Você acertou!')}
        </h2>
        <p className="victory-modal-subtitle">
          {isLocationVictory ? 'Você encontrou a obra:' : `A ${gameName} era`} <strong>{artworkTitle}</strong>
        </p>

        <img src={artworkImage} alt={artworkTitle} className="victory-modal-image" />

        {!alreadyWon && (
          <div className="victory-modal-stats-container">
            <p className="victory-modal-stats">
              Você é a <strong>{randomPlayerNumber}º</strong> pessoa a acertar hoje!
            </p>
            <p className="victory-modal-stats">
              Número de tentativas: <strong>{attemptsCount}</strong>
            </p>
          </div>
        )}
        
        {/* 4. GRUPO DE BOTÕES ATUALIZADO */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          
          {/* Botão Estatísticas */}
          <button className="victory-stats-button">
            <FaChartBar /> Estatísticas
          </button>

          {/* Botão Compartilhar */}
          {onCopy && (
            <button 
              className="victory-stats-button" // Usa a mesma classe para o estilo azul
              onClick={handleCopyClick}
              style={copied ? { backgroundColor: '#4CAF50', color: 'white' } : {}}
            >
              <FaShareAlt /> {copied ? 'Copiado!' : 'Compartilhar'}
            </button>
          )}

          {/* Botão Adivinhar Localização (Condicional) */}
          {(gameType === 'mural' || gameType === 'sculpture') && !isLocationVictory && !alreadyWon && (
            <button 
              className="victory-stats-button" 
              onClick={handleLocationClick} 
              style={{ backgroundColor: '#EE7D00' }} // Cor laranja para diferenciar
            >
              <FaMapMarkerAlt /> Adivinhar Localização
            </button>
          )}
        </div>


        <div className="victory-timer-container">
          <p className="victory-timer-text">Próxima {gameName} em:</p>
          <div className="victory-timer">{timeRemaining}</div>
        </div>

        {/* 5. ÍCONES DE NAVEGAÇÃO CORRIGIDOS */}
        <div className="victory-modal-modes">
          <Link to="/classic" className="mode-icon-link" onClick={onClose}>
            <div className={`icon-circle ${gameType === 'classic' ? 'active' : ''}`}>
              <FaPalette className="mode-icon" />
            </div>
          </Link>
          <Link to="/mural" className="mode-icon-link" onClick={onClose}>
            <div className={`icon-circle ${gameType === 'mural' ? 'active' : ''}`}>
              <FaPaintRoller className="mode-icon" />
            </div>
          </Link>
          <Link to="/sculpture" className="mode-icon-link" onClick={onClose}>
            <div className={`icon-circle ${gameType === 'sculpture' ? 'active' : ''}`}>
              <GiStoneBust className="mode-icon" style={{ transform: 'scale(1.2)' }} />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VictoryModal;