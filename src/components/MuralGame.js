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
  FaCalendarAlt, 
  FaFire
} from 'react-icons/fa';
import { titleSet, fillTitles } from '../util/ClassicModeDataFetch';
import Select from 'react-select';
import { getMuralArtByDate } from '../util/DailyArt';
import { todayMidnight } from './DatePicker';
import CalendarModal from './CalendarModal';
import VictoryAnimation from './VictoryAnimation';
import VictoryModal from './VictoryModal';
import PostVictoryDisplay from './PostVictoryDisplay';
import { getStatsByDate, recordGameHit } from '../util/Statistics';
import StreakManager from '../util/StreakManager.js';

const MuralGame = ({ loadingArt }) => {
  const [muralArt, setMuralArt] = useState();
  const [allMuralTitles, setAllMuralTitles] = useState([]);
  const navigate = useNavigate();

  const [xPosition, setXPosition] = useState((Math.random() * 100) % 100);
  const [yPosition, setYPosition] = useState((Math.random() * 100) % 100);
  const [zoom, setZoom] = useState(800);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [alreadyWon, setAlreadyWon] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(todayMidnight());

  // Estados de vitória
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [todayHits, setTodayHits] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    loadingArt.then((art) => {
      setMuralArt(art);
      const dateAlreadyWon = StreakManager.isDateWon(currentDate, "Mural");
      setAlreadyWon(dateAlreadyWon);
      setShowVictoryModal(dateAlreadyWon);
      if (dateAlreadyWon) {
        setZoom(100);
      }
    });

    const loadTitles = async () => {
      const titles = await fillTitles('mural');
      setAllMuralTitles(titles);
    };

    loadTitles();
  }, [loadingArt]);

  useEffect(() => {
    if (hasWon) {
      setShowVictoryAnimation(true);
      setShowVictoryModal(true);
    }
  }, [hasWon]);

  const changeDate = (date) => {
    getMuralArtByDate(date).then((art) => {
      setMuralArt(art);
      setGuess('');
      setAttempts([]);
      setZoom(800);
      setXPosition((Math.random() * 100) % 100);
      setYPosition((Math.random() * 100) % 100);
      setHasWon(false);

      const dateAlreadyWon = StreakManager.isDateWon(date, "Mural");

      setAlreadyWon(dateAlreadyWon);
      setShowVictoryModal(dateAlreadyWon);
      if (dateAlreadyWon) {
        setZoom(100);
      }
      setShowVictoryAnimation(false);
    });

    setCurrentDate(date);
    setShowCalendar(false);
    setTodayHits(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guess.trim() && muralArt && !hasWon) {
      const isCorrect = guess.toLowerCase() === muralArt.title.toLowerCase();

      if (isCorrect) {

        StreakManager.addDate(currentDate, "Mural");
        setHasWon(true); // Isso vai disparar o useEffect de vitória
        setZoom(100);

        try {
          const dateString = currentDate.toISOString().split('T')[0];

          await recordGameHit({
            date: dateString,
            gameMode: 'muralGame',
            artname: muralArt.title,
          });

          setTodayHits((prevHits) => prevHits + 1);
        } catch (error) {
          console.error('Erro ao registrar o hit:', error);
        }
      } else {
        setZoom(Math.max(100, zoom - 80));
        setAttempts([guess, ...attempts]);
        setGuess('');
      }
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentDate) return;

      const dateString = currentDate.toISOString().split('T')[0];
      try {
        const statsDoc = await getStatsByDate(dateString);

        if (statsDoc && statsDoc.muralGame) {
          setTodayHits(statsDoc.muralGame.hits);
        } else {
          console.debug('Nenhum hit registrado para este dia');
          setTodayHits(0);
        }
      } catch (error) {
        console.error('Falha ao buscar estatísticas:', error);
        setTodayHits(0);
      }
    };

    fetchStats();
  }, [currentDate]);

  const selectOptions = useMemo(
    () =>
      allMuralTitles
        .filter((title) => !attempts.includes(title)) // Remove tentativas já feitas
        .map((title) => ({
          value: title,
          label: title,
        })),
    [allMuralTitles, attempts]
  );

  const filterOptionByPrefix = (option, inputValue) => {
    // Se não digitou nada, mostra todas as opções
    if (inputValue === '') {
      return true;
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
      {/* Componentes de vitória */}
      {showVictoryAnimation && (
        <VictoryAnimation onComplete={() => setShowVictoryAnimation(false)} />
      )}

      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        artworkTitle={muralArt?.title}
        artworkImage={muralArt?.thumbnail?.full[0]}
        attemptsCount={attempts.length + 1}
        gameType="mural"
        onGuessLocation={handleGuessLocation}
        alreadyWon={alreadyWon}
      />

      {/* Logo */}
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
          onClick={() => setShowCalendar(true)}
        >
          <FaCalendarAlt />
          <span className="tooltip">Calendário</span>
        </div>
        <div className='utility-icon'>
          <span style={{ whiteSpace: 'nowrap'}}>
            <FaFire/>{StreakManager.currentStreak("Mural")}
          </span>
          <span className='tooltip'>Sequência atual</span>
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
      </div>

      {/* Estatísticas */}
      <p className="stats-text">{todayHits} pessoas já acertaram este mural!</p>

      {/* LÓGICA DE EXIBIÇÃO ATUALIZADA */}
      {(!hasWon && !alreadyWon) ? (
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
            isDisabled={hasWon || alreadyWon}
            isClearable
          />
          <button type="submit" className="guess-button" disabled={hasWon || alreadyWon}>
            ENTER
          </button>
        </form>
      ) : (
        <PostVictoryDisplay
          gameType="mural"
          artworkTitle={muralArt?.title}
          onGuessLocation={handleGuessLocation}
          onShowStats={() => setShowVictoryModal(true)}
        />
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

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={changeDate}
        currentDate={currentDate}
        mode="Mural"
      />

      {/* Modal de Tutorial */}
      {showTutorial && (
        <div className="tutorial-modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tutorial-close" onClick={() => setShowTutorial(false)}>
              X
            </button>
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
