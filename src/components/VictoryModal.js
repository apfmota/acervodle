import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
// ADICIONADO FaMapMarkerAlt
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaMapMarkerAlt } from 'react-icons/fa';

const VictoryModal = ({ 
  isOpen, 
  onClose, 
  artworkTitle, 
  artworkImage, 
  attemptsCount, 
  gameType, 
  onGuessLocation // 1. ADICIONADA NOVA PROP
}) => {
  const [timeRemaining, setTimeRemaining] = useState('');

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

  // 2. FUNÇÃO PARA LIDAR COM O CLIQUE (FECHA O MODAL E NAVEGA)
  const handleLocationClick = () => {
    if (onGuessLocation) {
      onGuessLocation();
    }
    onClose();
  };


  return (
    <div className="victory-modal-overlay" onClick={onClose}>
      <div className="victory-modal" onClick={(e) => e.stopPropagation()}>
        <button className="victory-modal-close" onClick={onClose}>
          X
        </button>

        <h2 className="victory-modal-title">Você acertou!</h2>
        <p className="victory-modal-subtitle">A {gameName} era <strong>{artworkTitle}</strong></p>

        <img src={artworkImage} alt={artworkTitle} className="victory-modal-image" />

        <div className="victory-modal-stats-container">
          <p className="victory-modal-stats">
            Você é o <strong>{randomPlayerNumber}º</strong> a adivinhar o campeão de hoje!
          </p>
          <p className="victory-modal-stats">
            Número de tentativas: <strong>{attemptsCount}</strong>
          </p>
        </div>
        
        {/* 3. BOTÕES RENDERIZADOS EM UM CONTAINER FLEX */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button className="victory-stats-button">
            <FaChartBar /> Estatísticas
          </button>

          {/* 4. RENDERIZAÇÃO CONDICIONAL DO BOTÃO DE LOCALIZAÇÃO */}
          {(gameType === 'mural' || gameType === 'sculpture') && (
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

        {/* Ícones dos modos de jogo */}
        <div className="victory-modal-modes">
          <Link to="/classic" className="mode-icon-link" onClick={onClose}>
            <div className={`icon-circle ${gameType === 'classic' ? 'active' : ''}`}>
              <FaPalette className="mode-icon" />
            </div>
          </Link>
          <Link to="/mural" className="mode-icon-link" onClick={onClose}>
            <div className={`icon-circle ${gameType === 'mural' ? 'active' : ''}`}>
              <FaPaintBrush className="mode-icon" />
            </div>
          </Link>
          <Link to="/sculpture" className="mode-icon-link" onClick={onClose}>
            <div className={`icon-circle ${gameType === 'sculpture' ? 'active' : ''}`}>
              <FaMonument className="mode-icon" />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VictoryModal;