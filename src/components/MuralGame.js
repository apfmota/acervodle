import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPalette,
  FaPaintBrush,
  FaMonument,
  FaChartBar,
  FaQuestion,
  FaCheck,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { titleSet, fillTitles } from '../util/ClassicModeDataFetch';
import Select from 'react-select';

const MuralGame = ({ loadingArt }) => {
  const [muralArt, setMuralArt] = useState();
  const [allMuralTitles, setAllMuralTitles] = useState([]);
  const navigate = useNavigate();

  const [xPosition] = useState((Math.random() * 100) % 100);
  const [yPosition] = useState((Math.random() * 100) % 100);
  const [zoom, setZoom] = useState(800);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);

  // Números aleatórios para os placeholders
  const randomPlayers = Math.floor(Math.random() * 1000) + 100;
  const yesterdayMural = 'Painel ' + (Math.floor(Math.random() * 10) + 1);

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadingArt.then(setMuralArt);

    const loadTitles = async () => {
      const titles = await fillTitles('mural');
      setAllMuralTitles(titles);
    };

    loadTitles();
  }, []);

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

  const selectOptions = useMemo(
    () =>
      allMuralTitles.map((title) => ({
        value: title,
        label: title,
      })),
    [allMuralTitles]
  );

  const filterOptionByPrefix = (option, inputValue) => {
    if (inputValue === '') {
      return false;
    }
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  const handleGuessLocation = () => {
    if (muralArt) {
      navigate('/map', { state: { artObject: muralArt, artType: 'mural' } });
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

      {/* Ícones de estatísticas e tutorial */}
      <div className="utility-icons">
        <div className="utility-icon" style={{ cursor: 'pointer' }}>
          <FaChartBar />
          <span className="tooltip">Estatísticas</span>
        </div>
        <div
          className="utility-icon"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowTutorial(true)}
        >
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
            backgroundSize: zoom + '%',
            backgroundPositionX: xPosition + '%',
            backgroundPositionY: yPosition + '%',
          }}
        ></div>
        <p className="mural-hint">A cada tentativa expande um pouco</p>

        {/* Exibe o nome do mural para testes - REMOVER DEPOIS */}
        {muralArt && (
          <div
            style={{
              marginTop: '10px',
              padding: '5px',
              backgroundColor: '#f0f0f0',
              borderRadius: '5px',
              fontSize: '0.8rem',
              color: '#666',
            }}
          >
            TESTE: O mural sorteado é: {muralArt.title}
          </div>
        )}
      </div>

      {/* Texto de estatísticas */}
      <p className="stats-text">{randomPlayers} pessoas já acertaram este mural!</p>

      {/* Campo de palpite */}
      <form onSubmit={handleSubmit} className="guess-form">
        <Select
          options={selectOptions}
          value={selectOptions.find((option) => option.value === guess)}
          onChange={(selectedOption) => setGuess(selectedOption ? selectedOption.value : '')}
          placeholder="Digite sua tentativa..."
          className="guess-input-select"
          classNamePrefix="react-select"
          filterOption={filterOptionByPrefix}
          noOptionsMessage={() => null}
          isDisabled={hasWon}
          isClearable
        />

        <button type="submit" className="guess-button" disabled={hasWon}>
          ENTER
        </button>
      </form>

      {/* Mensagem de sucesso */}
      {hasWon && (
        <div>
          <div className="success-message" style={{ position: 'relative' }}>
            <FaCheck className="success-icon" />
            Parabéns! Você acertou o mural: {muralArt.title}
            <div className="attempt-count">
              <span className="people-icon">👥</span>
              {Math.floor(Math.random() * 500) + 1}
              <div className="attempt-count-tooltip">
                O número de jogadores que também acertaram com essa tentativa!
              </div>
            </div>
          </div>

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
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '0 auto',
              }}
            >
              <FaMapMarkerAlt /> Adivinhar Localização
            </button>
          </div>
        </div>
      )}

      {/* Tentativas erradas */}
      <div className="attempts-list">
        {attempts.map((attempt, index) => (
          <div
            key={index}
            className="wrong-attempt"
            style={{ cursor: 'pointer', position: 'relative' }}
          >
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

      {/* Modal de Tutorial */}
      {showTutorial && (
        <div className="tutorial-modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tutorial-close" onClick={() => setShowTutorial(false)}>X</button>
            <h2 className="tutorial-title">Como jogar? (Modo Mural)</h2>
            <hr className="tutorial-divider" />
            <p className="tutorial-text">
              No modo Mural, seu desafio é identificar qual mural está representado na imagem mostrada e
              acertar o seu nome.
            </p>
            <p className="tutorial-text">
              A imagem começa com um <strong>zoom muito alto</strong>, mostrando apenas uma pequena parte
              do mural. A cada tentativa incorreta, o zoom será{' '}
              <strong>gradualmente reduzido</strong>, revelando mais partes do mural.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuralGame;
