import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';

const SculptureGame = ({ loadingArt }) => {

  useEffect(() => {
    loadingArt.then(setSculptureArt)
  }, [])

  const [sculptureArt, setSculptureArt] = useState();
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const navigate = useNavigate();

  // Números aleatórios para os placeholders
  const randomPlayers = Math.floor(Math.random() * 1000) + 100;
  const yesterdaySculpture = "Escultura " + (Math.floor(Math.random() * 10) + 1);

  const [showTutorial, setShowTutorial] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim() && sculptureArt) {
      const isCorrect = guess.toLowerCase() === sculptureArt.title.toLowerCase();
      
      if (isCorrect) {
        setHasWon(true);
      } else {
        setAttempts([guess, ...attempts]);
        setGuess('');
      }
    }
  };

  const handleGuessLocation = () => {
    navigate('/map', { state: { sculpture: sculptureArt } });
  };

  return (
    <div className="game-page">
      {/* Logo com link para home - com efeito de hover */}
      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)', cursor: 'pointer' }}>
          <h1>Acervodle</h1>
        </div>
      </Link>

      {/* Ícones dos modos de jogo - com efeito de hover */}
      <div className="modes-icons">
        <Link to="/classic" className="mode-icon-link">
          <div className="icon-circle">
            <FaPalette className="mode-icon" />
          </div>
        </Link>
        <Link to="/mural" className="mode-icon-link">
          <div className="icon-circle">
            <FaPaintBrush className="mode-icon" />
          </div>
        </Link>
        <Link to="/sculpture" className="mode-icon-link">
          <div className="icon-circle active">
            <FaMonument className="mode-icon" />
          </div>
        </Link>
      </div>

      {/* Ícones de estatísticas e tutorial - com efeito de hover */}
      <div className="utility-icons">
        <div className="utility-icon" style={{ cursor: 'pointer' }}>
          <FaChartBar />
          <span className="tooltip">Estatísticas</span>
        </div>
        <div className="utility-icon" style={{ cursor: 'pointer' }} onClick={() => setShowTutorial(true)}>
          <FaQuestion />
          <span className="tooltip">Como jogar?</span>
        </div>
      </div>

      {/* Área da imagem da escultura */}
      <div className="mural-container">
        <h3 className="mural-question">Qual é o nome desta escultura?</h3>
        <div className="image-wrapper">
          <img 
            src={sculptureArt?.thumbnail?.full[0] || ''} 
            alt="Escultura para adivinhar" 
            className="mural-image"
          />
        </div>
        
        {/* Exibe o nome da escultura para testes - REMOVER DEPOIS */}
        {sculptureArt && (
          <div style={{
            marginTop: '10px',
            padding: '5px',
            backgroundColor: '#f0f0f0',
            borderRadius: '5px',
            fontSize: '0.8rem',
            color: '#666'
          }}>
            TESTE: A escultura sorteada é: {sculptureArt.title}
          </div>
        )}
      </div>

      {/* Texto de estatísticas - FORA do mural-container */}
      <p className="stats-text">{randomPlayers} pessoas já acertaram esta escultura!</p>

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

      {/* Mensagem de sucesso quando o usuário acerta - com efeito de pop-up */}
      {hasWon && (
        <div>
          <div className="success-message">
            <FaCheck className="success-icon" />
            Parabéns! Você acertou a escultura: {sculptureArt.title}

            {/* contador de pessoas também na tentativa correta */}
            <div className="attempt-count">
              <span className="people-icon">👥</span>
              {Math.floor(Math.random() * 500) + 1}
              <div className="attempt-count-tooltip">
                O número de jogadores que também acertaram com essa tentativa!
              </div>
            </div>
          </div>
          
          {/* Botão para adivinhar localização - só aparece após acertar */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              onClick={handleGuessLocation}
              style={{
                padding: '0.8rem 1.5rem',
                backgroundColor: '#5D4037',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: "'Cinzel', serif",
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto'
              }}
            >
              <FaMapMarkerAlt /> Adivinhar Localização
            </button>
          </div>
        </div>
      )}

      {/* Lista de tentativas erradas - com efeito de hover */}
      <div className="attempts-list">
        {attempts.map((attempt, index) => (
          <div key={index} className="wrong-attempt" style={{ cursor: 'pointer', position: 'relative' }}>
            {attempt}
            <div className="attempt-count">
              <span className="people-icon">👥</span>
              {/* por enquanto é um número aleatório */}
              {Math.floor(Math.random() * 500) + 1}
              <div className="attempt-count-tooltip">
                O número de jogadores que também tentaram essa tentativa!
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informação sobre a escultura de ontem */}
      <p className="yesterday-text">A escultura de ontem foi: {yesterdaySculpture}</p>

      {/* Modal de Tutorial para o Modo Escultura */}
      {showTutorial && (
        <div className="tutorial-modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tutorial-close" onClick={() => setShowTutorial(false)}>X</button>
            
            <h2 className="tutorial-title">Como jogar?</h2>
            <hr className="tutorial-divider" />
            
            <p className="tutorial-text">
              No modo Escultura, seu desafio é identificar a escultura do dia a partir de sua <strong>imagem em silhueta</strong>.
            </p>
            
            <p className="tutorial-text">
              A escultura é mostrada como uma <strong>silhueta escura</strong> em uma fotografia. Você precisa 
              reconhecer a obra pela sua <strong>forma, contorno e características estruturais</strong>.
            </p>
            
            <h3 className="tutorial-subtitle">Fase Bônus: Localização</h3>
            <hr className="tutorial-divider" />
            
            <p className="tutorial-text">
              Após acertar a escultura, você desbloqueia uma <strong>fase bônus</strong>: adivinhar a 
              localização da escultura dentro do campus da UFSM!
            </p>
            
            <p className="tutorial-text">
              Nesta fase adicional, você verá um <strong>mapa do campus</strong> com várias marcações. Sua missão 
              é clicar no local correto onde a escultura está instalada.
            </p>
            
            
          </div>
        </div>
      )}
    </div>
  );
};

export default SculptureGame;