import React, { useState } from 'react';
import StreakManager from '../util/StreakManager';
import { FaTimes, FaShareSquare } from 'react-icons/fa';

const StatsModal = ({ isOpen, onClose, mode }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gameStats = {
    played: StreakManager.getGamesPlayed(mode),
    avgGuesses: StreakManager.getAverageGuesses(mode),
    firstTryWins: StreakManager.getWinsOnFirstTry(mode),
    currentStreak: StreakManager.currentStreak(mode),
    distribution: StreakManager.getGuessDistributionData(mode),
    history: StreakManager.getAttemptsHistory(mode),
  };

  const formatGraphDate = (dateString) => {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  };

  const generateShareText = () => {
    let text = `Acervodle - ${mode}\n\n`;
    
    text += `⚔️ Jogos: ${gameStats.played}\n`;
    text += `🤓 Média: ${gameStats.avgGuesses}\n`;
    text += `🥇 1ª Tent.: ${gameStats.firstTryWins}\n`;
    text += `🔥 Sequência: ${gameStats.currentStreak}\n\n`;
    return text;
  };

  const handleShare = () => {
    const textToCopy = generateShareText();

    try {
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'absolute';
      textArea.style.left = '-9999px';

      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar estatísticas:', err);
    }
  };

  // Componente interno para o Gráfico de Histórico
  const HistoryChart = ({ title, data, color = '#005285' }) => {
    const maxAtt = Math.max(1, ...data.map(d => d.attempts));

    return (
      <>
        <h3 className="stats-subtitle">{title}</h3>
        <div className="stats-chart">
          {data.length > 0 ? (
            <div className="chart-scroll-container">
              {data.map(item => {
                const barHeight = Math.max(8, (item.attempts / maxAtt) * 100);
                return (
                  <div
                    key={item.date}
                    className="history-bar-item"
                    title={`Data: ${formatGraphDate(item.date)}\nTentativas: ${item.attempts}`}
                  >
                    <div className="history-bar-value">{item.attempts}</div>
                    <div
                      className="history-bar"
                      style={{ height: `${barHeight}%`, backgroundColor: color }}
                    ></div>
                    <div className="history-bar-label">{formatGraphDate(item.date)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="chart-empty">Nenhum jogo ganho ainda.</p>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <style>{`
        .stats-grid {
          display: grid;
          /* 4 colunas */
          grid-template-columns: repeat(4, 1fr); 
          gap: 1rem; /* Gap maior */
          margin: 1.5rem 0;
          padding: 0 1rem; 
          text-align: center;
        }
        .stats-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .stats-item strong {
          /* Fonte maior */
          font-size: 2rem; 
          color: #005285;
        }
        .stats-item span {
          font-size: 0.8rem; /* Label maior */
          text-transform: uppercase;
          color: #555;
          white-space: nowrap; 
        }

        /* Responsividade para telas menores */
        @media (max-width: 600px) {
          .stats-grid {
             /* 2 colunas */
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
            padding: 0 1rem;
          }
          .stats-item strong {
             font-size: 2rem;
          }
           .stats-item span {
             font-size: 0.8rem;
             white-space: normal; 
          }
        }

        /* Estilos do Gráfico e Modal */
        .stats-subtitle {
          text-align: center;
          color: #333;
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .stats-chart {
          width: 100%;
          height: 150px; 
          padding: 0 1rem;
          box-sizing: border-box;
        }
        .chart-empty {
          text-align: center;
          color: #777;
          padding: 1rem;
        }
        .chart-scroll-container {
            display: flex;
            gap: 8px;
            overflow-x: auto; 
            padding: 10px 0;
            height: 100%;
        }
        .history-bar-item {
          flex: 0 0 40px; 
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end; 
        }
        .history-bar-value {
          font-size: 0.8rem;
          font-weight: bold;
          color: #333;
        }
        .history-bar {
          width: 25px; 
          background-color: #005285;
          border-radius: 4px 4px 0 0;
          transition: height 0.3s ease-out;
        }
        .history-bar-label {
          font-size: 0.75rem;
          color: #555;
          margin-top: 4px;
          white-space: nowrap; 
        }
      `}</style>

      <div className="victory-modal-overlay" onClick={onClose}>
        <div className="victory-modal" onClick={(e) => e.stopPropagation()}>
          <button className="victory-modal-close" onClick={onClose}>
            <FaTimes />
          </button>

          <h2 className="victory-modal-title">Estatísticas ({mode})</h2>

          <div className="stats-grid">
            <div className="stats-item">
              <strong>{gameStats.played}</strong>
              <span>Jogos ganhos</span>
            </div>
            <div className="stats-item">
              <strong>{gameStats.avgGuesses}</strong>
              <span>Média de Tentativas</span>
            </div>
            <div className="stats-item">
              <strong>{gameStats.firstTryWins}</strong>
              <span>Acertos 1ª Tentativa</span>
            </div>
            <div className="stats-item">
              <strong>{gameStats.currentStreak}</strong>
              <span>Streak Atual</span>
            </div>
          </div>

          {/* Gráfico de Histórico */}
          <HistoryChart
            title="Histórico de Tentativas"
            data={gameStats.history}
            color="#005285"
          />

          {/* Botão de Copiar */}
          <button
            className="victory-stats-button"
            onClick={handleShare}
            style={{ width: '80%', margin: '2rem auto 1.5rem auto' }}
          >
            <FaShareSquare /> {copied ? 'Copiado!' : 'Copiar Estatísticas'}
          </button>
        </div>
      </div>
    </>
  );
};

export default StatsModal;