import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';
import { titleSet, fillTitles } from '../util/ClassicModeDataFetch';
import Select from 'react-select';
import { getSculptureArtByDate } from '../util/DailyArt';
import DatePicker from './DatePicker';

const SculptureGame = ({ loadingArt }) => {
  const [sculptureArt, setSculptureArt] = useState();
  const [allSculptureTitles, setAllSculptureTitles] = useState([]);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = useNavigate();

  // Números aleatórios para os placeholders
  const randomPlayers = Math.floor(Math.random() * 1000) + 100;
  const yesterdaySculpture = 'Escultura ' + (Math.floor(Math.random() * 10) + 1);

  useEffect(() => {
    loadingArt.then(setSculptureArt);

    const loadTitles = async () => {
      const titles = await fillTitles('sculpture');
      setAllSculptureTitles(titles);
    };

    loadTitles();
  }, []);

  const changeDate = (date) => {
    getSculptureArtByDate(date).then(art => {
      setSculptureArt(art);
      setAttempts([]);
      setGuess("");
      setHasWon(false);
    })
  }

  const selectOptions = useMemo(
    () =>
      allSculptureTitles.map((title) => ({
        value: title,
        label: title,
      })),
    [allSculptureTitles]
  );

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
    navigate('/map', { state: { artObject: sculptureArt, artType: 'sculpture' } });
  };

  const filterOptionByPrefix = (option, inputValue) => {
    if (inputValue === '') {
      return false;
    }
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
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

      {/* Ícones utilitários */}
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

      <DatePicker onClick={changeDate}/>

      {/* Área da imagem */}
      <div className="mural-container">
        <h3 className="mural-question">Qual é o nome desta escultura?</h3>
        <div className="image-wrapper">
          {sculptureArt && (
            <img 
              src={hasWon 
                ? `/acervo_imgs/${sculptureArt.title.replace(/\s+/g, '_')}.jpg` 
                : `/acervo_imgs/${sculptureArt.title.replace(/\s+/g, '_')}-mask.jpg`
              }
              alt={hasWon ? "Escultura revelada" : "Silhueta da escultura"}
              className="mural-image"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
          )}
          
        </div>
      </div>

      {/* Estatísticas */}
      <p className="stats-text">{randomPlayers} pessoas já acertaram esta escultura!</p>

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

      {/* Mensagem de acerto */}
      {hasWon && (
        <div>
          <div className="success-message">
            <FaCheck className="success-icon" />
            Parabéns! Você acertou a escultura: {sculptureArt.title}
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
                backgroundColor: '#005285',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: "'Cinzel', serif",
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

      {/* Escultura de ontem */}
      <p className="yesterday-text">A escultura de ontem foi: {yesterdaySculpture}</p>

      {/* Tutorial */}
      {showTutorial && (
        <div className="tutorial-modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tutorial-close" onClick={() => setShowTutorial(false)}>
              X
            </button>
            <h2 className="tutorial-title">Como jogar?</h2>
            <hr className="tutorial-divider" />
            <p className="tutorial-text">
              No modo Escultura, seu desafio é identificar a escultura do dia a partir de sua{' '}
              <strong>imagem em silhueta</strong>.
            </p>
            <p className="tutorial-text">
              A escultura é mostrada como uma <strong>silhueta escura</strong> em uma fotografia. Você
              precisa reconhecer a obra pela sua <strong>forma, contorno e características</strong>.
            </p>
            <h3 className="tutorial-subtitle">Fase Bônus: Localização</h3>
            <hr className="tutorial-divider" />
            <p className="tutorial-text">
              Após acertar a escultura, você desbloqueia uma <strong>fase bônus</strong>: adivinhar a
              localização dentro do campus da UFSM!
            </p>
            <p className="tutorial-text">
              Nesta fase, você verá um <strong>mapa do campus</strong> com várias marcações. Sua missão
              é clicar no local correto onde a escultura está instalada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SculptureGame;
