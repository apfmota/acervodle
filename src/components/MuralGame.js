// src/components/MuralGame.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaCheck } from 'react-icons/fa';

const MuralGame = ({ loadingArt }) => {

  useEffect(() => {
    loadingArt.then(setMuralArt)
  }, [])

  const [muralArt, setMuralArt] = useState();

  const [xPosition] = useState((Math.random() * 100) % 100);
  const [yPosition] = useState((Math.random() * 100) % 100);
  const [zoom, setZoom] = useState(800);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);

  // Números aleatórios para os placeholders
  const randomPlayers = Math.floor(Math.random() * 1000) + 100;
  const yesterdayMural = "Painel " + (Math.floor(Math.random() * 10) + 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim() && muralArt) {
      const isCorrect = guess.toLowerCase() === muralArt.title.toLowerCase();

      if (isCorrect) {
        setHasWon(true);
        setZoom(100);
      } else {
        setZoom(Math.max(100, zoom - 80));
        setAttempts([guess, ...attempts]);
        setGuess('');
      }
    }
  };

  return (
    <div className="game-page">
      {/* Logo com link para home */}
      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)', cursor: 'pointer' }}>
          <h1>Acervodle</h1>
        </div>
      </Link>

      {/* Ícones dos modos de jogo */}
      <div className="modes-icons">
        <Link to="/classic" className="mode-icon-link">
          <div className="icon-circle">
            <FaPalette className="mode-icon" />
          </div>
        </Link>
        <Link to="/mural" className="mode-icon-link">
          <div className="icon-circle active">
            <FaPaintBrush className="mode-icon" />
          </div>
        </Link>
        <Link to="/sculpture" className="mode-icon-link">
          <div className="icon-circle">
            <FaMonument className="mode-icon" />
          </div>
        </Link>
      </div>

      {/* Ícones de estatísticas e tutorial com tooltip */}
      <div className="utility-icons">
        <div className="utility-icon" style={{ cursor: 'pointer' }}>
          <FaChartBar />
          <span className="tooltip">Estatísticas</span>
        </div>
        <div className="utility-icon" style={{ cursor: 'pointer' }}>
          <FaQuestion />
          <span className="tooltip">Como jogar?</span>
        </div>
      </div>

      {/* Área da imagem do mural */}
      <div className="mural-container">
        <h3 className="mural-question">A que mural pertence a fotografia?</h3>
        <div
          className="image-wrapper"
          style={{
            height: '300px',
            backgroundImage: `url(${muralArt?.thumbnail?.full[0]})`,
            backgroundSize: zoom + "%",
            backgroundPositionX: xPosition + "%",
            backgroundPositionY: yPosition + "%"
          }}
        ></div>
        <p className="mural-hint">A cada tentativa expande um pouco</p>

        {/* Exibe o nome do mural para testes - REMOVER DEPOIS */}
        {muralArt && (
          <div style={{
            marginTop: '10px',
            padding: '5px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px',
            fontSize: '0.8rem',
            color: '#666'
          }}>
            TESTE: O mural sorteado é: {muralArt.title}
          </div>
        )}
      </div>

      {/* Texto de estatísticas */}
      <p className="stats-text">{randomPlayers} pessoas já acertaram este mural!</p>

      {/* Formulário para tentativas */}
      <form onSubmit={handleSubmit} className="guess-form">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Digite sua tentativa..."
          className="guess-input"
          disabled={hasWon}
        />
        <button type="submit" className="guess-button" disabled={hasWon}>
          ENTER
        </button>
      </form>

      {/* Mensagem de sucesso quando o usuário acerta (agora com contador) */}
      {hasWon && (
        <div>
          <div className="success-message" style={{ position: 'relative' }}>
            <FaCheck className="success-icon" />
            Parabéns! Você acertou o mural: {muralArt.title}

            {/* contador de pessoas também na tentativa correta */}
            <div className="attempt-count">
              <span className="people-icon">👥</span>
              {Math.floor(Math.random() * 500) + 1}
              <div className="attempt-count-tooltip">
                O número de jogadores que também acertaram com essa tentativa!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de tentativas erradas - com contador em cada tentativa */}
      <div className="attempts-list">
        {attempts.map((attempt, index) => (
          <div key={index} className="wrong-attempt" style={{ cursor: 'pointer', position: 'relative' }}>
            {attempt}
            <div className="attempt-count">
              <span className="people-icon">👥</span>
              {Math.floor(Math.random() * 500) + 1}
              <div className="attempt-count-tooltip">
                O número de jogadores que também tentaram essa tentativa!
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informação sobre o mural de ontem */}
      <p className="yesterday-text">O mural de ontem foi: {yesterdayMural}</p>
    </div>
  );
};

export default MuralGame;
