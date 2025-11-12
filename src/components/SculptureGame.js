import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaCheck, FaMapMarkerAlt, FaCalendarAlt, FaFire } from 'react-icons/fa';
import { fillTitles } from '../util/ClassicModeDataFetch';
import Select from 'react-select';
import { getSculptureArtByDate } from '../util/DailyArt';
import { todayMidnight } from './DatePicker';
import CalendarModal from './CalendarModal';
import VictoryAnimation from './VictoryAnimation';
import VictoryModal from './VictoryModal';
import PostVictoryDisplay from './PostVictoryDisplay';
import { getStatsByDate, recordGameHit } from '../util/Statistics';
import StreakManager from '../util/StreakManager.js';

const SculptureGame = ({ loadingArt }) => {
  const [sculptureArt, setSculptureArt] = useState();
  const [allSculptureTitles, setAllSculptureTitles] = useState([]);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [alreadyWon, setAlreadyWon] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(todayMidnight());
  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [todayHits, setTodayHits] = useState(0);
  const [yesterdaySculpture, setYesterdaySculpture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadingArt.then((art) => {
      const dateAlreadyWon = StreakManager.isDateWon(currentDate, "Escultura");
      setAlreadyWon(dateAlreadyWon);
      setShowVictoryModal(dateAlreadyWon);
      setSculptureArt(art);
    });

    const loadTitles = async () => {
      const titles = await fillTitles('sculpture');
      setAllSculptureTitles(titles);
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
    getSculptureArtByDate(date).then((art) => {
      setSculptureArt(art);
      setAttempts([]);
      setGuess('');
      setHasWon(false);

      const dateAlreadyWon = StreakManager.isDateWon(date, "Escultura");

      setAlreadyWon(dateAlreadyWon);
      setShowVictoryModal(dateAlreadyWon);
      setShowVictoryAnimation(false);
    });

    setCurrentDate(date);
    setShowCalendar(false);
    setTodayHits(0);
  };

  const selectOptions = useMemo(
    () =>
      allSculptureTitles
        .filter((title) => !attempts.includes(title)) // Remove tentativas já feitas
        .map((title) => ({
          value: title,
          label: title,
        })),
    [allSculptureTitles, attempts]
  );

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentDate) return;

      const dateString = currentDate.toISOString().split('T')[0];
      try {
        const statsDoc = await getStatsByDate(dateString);

        if (statsDoc && statsDoc.sculptureGame) {
          setTodayHits(statsDoc.sculptureGame.hits);
        } else {
          setTodayHits(0);
        }
      } catch (error) {
        console.error('Falha ao buscar estatísticas:', error);
        setTodayHits(0);
      }
    };

    const fetchYesterdayArt = () => {
      const yesterday = new Date(currentDate.getTime());
      yesterday.setDate(yesterday.getDate() - 1);

      getSculptureArtByDate(yesterday)
        .then((art) => {
          if (art) setYesterdaySculpture(art.title);
        })
        .catch((err) => console.error('Erro ao buscar arte de ontem:', err));
    };

    fetchStats();
    fetchYesterdayArt();
  }, [currentDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (guess.trim() && sculptureArt && !hasWon) {
      const isCorrect = guess.toLowerCase() === sculptureArt.title.toLowerCase();

      if (isCorrect) {
        StreakManager.addDate(currentDate, "Escultura");
        setHasWon(true);
        try {
          const dateString = currentDate.toISOString().split('T')[0];
          recordGameHit({
            date: dateString,
            gameMode: 'sculptureGame',
            artname: sculptureArt.title,
          });
          setTodayHits((prevHits) => prevHits + 1);
        } catch (error) {
          console.error('Erro ao registrar o hit:', error);
        }
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
    // Se não digitou nada, mostra todas as opções
    if (inputValue === '') {
      return true;
    }
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  const victoryImage = sculptureArt
    ? `/acervo_imgs/${sculptureArt.title.replace(/\s+/g, '_')}.jpg`
    : '';

  return (
    <div className="game-page">
      {/* Componentes de vitória */}
      {showVictoryAnimation && (
        <VictoryAnimation onComplete={() => setShowVictoryAnimation(false)} />
      )}

      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        artworkTitle={sculptureArt?.title}
        artworkImage={victoryImage}
        attemptsCount={attempts.length + 1}
        gameType="sculpture"
        onGuessLocation={handleGuessLocation}
        alreadyWon={alreadyWon}
      />

      {/* Logo */}
      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)', cursor: 'pointer' }}>
          <h1>Acervodle</h1>
        </div>
      </Link>

      {/* Ícones dos modos */}
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
          onClick={() => setShowCalendar(true)}
        >
          <FaCalendarAlt />
          <span className="tooltip">Calendário</span>
        </div>
        <div className='utility-icon'>
          <span style={{ whiteSpace: 'nowrap'}}>
            <FaFire/>{StreakManager.currentStreak("Escultura")}
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

      {/* Imagem */}
      <div className="mural-container">
        <h3 className="mural-question">Qual é o nome desta escultura?</h3>
        <div className="image-wrapper">
          {sculptureArt && (
            <img 
              src={(hasWon || alreadyWon)
                ? victoryImage 
                : `/acervo_imgs/${sculptureArt.title.replace(/\s+/g, '_')}-mask.jpg`
              }
              alt={(hasWon || alreadyWon) ? "Escultura revelada" : "Silhueta da escultura"}
              className="mural-image"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: '2px solid #ddd',
                borderRadius: '8px',
              }}
            />
          )}
        </div>
      </div>

      <p className="stats-text">{todayHits} pessoas já acertaram esta escultura!</p>

      {/* LÓGICA DE EXIBIÇÃO ATUALIZADA */}
      {(!hasWon && !alreadyWon) ? (
        <form onSubmit={handleSubmit} className="guess-form">
          <Select
            options={selectOptions}
            value={selectOptions.find((option) => option.value === guess)}
            onChange={(selectedOption) =>
              setGuess(selectedOption ? selectedOption.value : '')
            }
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
          gameType="sculpture"
          artworkTitle={sculptureArt?.title}
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

      <p className="yesterday-text">
        A escultura de ontem foi: {yesterdaySculpture}
      </p>

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={changeDate}
        currentDate={currentDate}
        mode="Escultura"
      />

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
              No modo Escultura, seu desafio é identificar a escultura do dia a
              partir de sua <strong>imagem em silhueta</strong>.
            </p>
            <p className="tutorial-text">
              A escultura é mostrada como uma <strong>silhueta escura</strong> em
              uma fotografia. Você precisa reconhecer a obra pela sua{' '}
              <strong>forma, contorno e características</strong>.
            </p>
            <h3 className="tutorial-subtitle">Fase Bônus: Localização</h3>
            <hr className="tutorial-divider" />
            <p className="tutorial-text">
              Após acertar a escultura, você desbloqueia uma{' '}
              <strong>fase bônus</strong>: adivinhar a localização dentro do campus
              da UFSM!
            </p>
            <p className="tutorial-text">
              Nesta fase, você verá um <strong>mapa do campus</strong> com várias
              marcações. Sua missão é clicar no local correto onde a escultura está
              instalada.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SculptureGame;
