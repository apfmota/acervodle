import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaPaintRoller, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaLightbulb, FaSpinner, FaCalendarAlt, FaFire, FaArrowDown, FaArrowUp, FaSearchMinus, FaSearchPlus } from 'react-icons/fa';
import { GiStoneBust } from 'react-icons/gi';
import Select from 'react-select';
import { fillPossibleValues, getAllPossibleValues, getArtProperties } from '../util/ClassicModeDataFetch.js';
import obraExemplo from '../assets/obra_exemplo.jpg';
import { getClassicArtByDate } from '../util/DailyArt.js';
import { todayMidnight } from './DatePicker.js'; 
import CalendarModal from './CalendarModal.js'; 
import VictoryAnimation from './VictoryAnimation'; 
import VictoryModal from './VictoryModal'; 
import PostVictoryDisplay from './PostVictoryDisplay'; 
import { getStatsByDate, recordGameHit } from '../util/Statistics';
import StreakManager from '../util/StreakManager.js';
import StatsModal from './StatsModal';

const ClassicGame = ({ loadingArt, loadingOptions }) => {
  const [classicArt, setClassicArt] = useState();
  const [lockedProperties, setLockedProperties] = useState({});
  const [currentValues, setCurrentValues] = useState({});
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState([false, false, false]);
  const [answer, setAnswer] = useState({});
  const [showTutorial, setShowTutorial] = useState(false);
  const [alreadyWon, setAlreadyWon] = useState(false);
  
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false); 
  const [currentDate, setCurrentDate] = useState(todayMidnight());

  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const [todayHits, setTodayHits] = useState(0);
  const [yesterdayClassicArt, setYesterdayClassicArt] = useState(null);
  const [activeHint, setActiveHint] = useState(null);
  const [isZoomedOut, setIsZoomedOut] = useState(false);

  useEffect(() => {
    loadingOptions.then(() => {
      setOptionsLoaded(true);
    })

    loadingArt.then((art) => {
      
      if (art) {
        setClassicArt(art);
        const answerProperties = getArtProperties(art);
        setAnswer(answerProperties);
        const dateAlreadyWon = StreakManager.isDateWon(currentDate, "Clássico");
        setAlreadyWon(dateAlreadyWon);
        setShowVictoryModal(dateAlreadyWon);
        const initialLocked = {};
        Object.keys(answerProperties).forEach(prop => {
          if (answerProperties[prop].length === 0) {
            initialLocked[prop] = true;
          }
        });
        setLockedProperties(initialLocked);
      } else {
        setClassicArt(null);
        setAnswer({});
        setLockedProperties({});
      }
    }); 
  }, [loadingArt]) 

  useEffect(() => {
    if (hasWon) {
      setShowVictoryAnimation(true);
      setShowVictoryModal(true);
    }
  }, [hasWon]);

  const changeDate = (date) => {
    getClassicArtByDate(date).then(art => {

      if (art) {
        setClassicArt(art);
        const answerProperties = getArtProperties(art);
        setAnswer(answerProperties);

        const initialLocked = {};
        Object.keys(answerProperties).forEach(prop => {
          if (answerProperties[prop].length === 0) {
            initialLocked[prop] = true;
          }
        });
        setLockedProperties(initialLocked);
        setCurrentValues({});
        setAttempts([]);
        setHintsUnlocked([false, false, false]);
        const dateAlreadyWon = StreakManager.isDateWon(date, "Clássico");
        setAlreadyWon(dateAlreadyWon);
        setShowVictoryModal(dateAlreadyWon);
        setHasWon(false);
        setShowVictoryAnimation(false); 
      } else {
        setClassicArt(null);
        setAnswer({});
        setLockedProperties({});
        setCurrentValues({});
        setAttempts([]);
        setHintsUnlocked([false, false, false]);
        setHasWon(false);
        setShowVictoryAnimation(false);
        setShowVictoryModal(false);
      }
    });
    setCurrentDate(date); 
    setShowCalendar(false); 
    setTodayHits(0);
  }

  useEffect(() => {
    const fetchStats = async () => {
      if (!currentDate) return;
      
      const dateString = currentDate.toISOString().split('T')[0];
      try {
        const statsDoc = await getStatsByDate(dateString);
        
        if (statsDoc && statsDoc.classicGame) {
          setTodayHits(statsDoc.classicGame.hits);
        } else {
          console.debug("Nenhum hit registrado para este dia");
          setTodayHits(0);
        }
      } catch (error) {
        console.error("Falha ao buscar estatísticas:", error);
        setTodayHits(0);
      }
    };

    const fetchYesterdayArt = () => {
      const yesterday = new Date(currentDate.getTime());
      yesterday.setDate(yesterday.getDate() - 1);

      getClassicArtByDate(yesterday)
        .then((art) => {
          if (art) {
            setYesterdayClassicArt(art.title);
          } else {
            setYesterdayClassicArt(null);
          }
        })
        .catch((err) => {
          console.error('Erro ao buscar arte de ontem:', err);
          setYesterdayClassicArt(null);
        });
    };

    fetchStats();
    fetchYesterdayArt();

  }, [currentDate]);

  const properties = [
    {label: 'Técnica', property: 'tecnica-3'},
    {label: 'Material', property: 'material'},
    {label: 'Moldura', property: 'moldura'},
    {label: 'Suporte', property: 'suporte'},
    {label: 'Década', property: 'data-da-obra-2'},
    {label: 'Temática', property: 'tematica'},
  ]

  // Função para obter opções filtradas (remove valores já tentados incorretamente)
  const getFilteredOptions = useMemo(() => {
    return (property) => {
      const allOptions = getAllPossibleValues(property);
      
      // Coletar todos os valores já tentados para esta propriedade que estão COMPLETAMENTE errados
      const triedValues = new Set();
      attempts.forEach(attempt => {
        const attemptValue = attempt[property];
        
        if (attemptValue) {
          // Se é array, verificar cada valor individualmente
          if (Array.isArray(attemptValue)) {
            attemptValue.forEach(v => {
              // Só adiciona se o valor NÃO está na resposta correta
              if (!answer[property] || !answer[property].includes(v)) {
                triedValues.add(v);
              }
            });
          } else {
            // Se não é array, verificar se o valor não está na resposta
            if (!answer[property] || !answer[property].includes(attemptValue)) {
              triedValues.add(attemptValue);
            }
          }
        }
      });
      
      // Filtrar as opções removendo os valores já tentados incorretamente
      return allOptions.filter(option => 
        option.value === 'Nenhum' || !triedValues.has(option.value)
      );
    };
  }, [attempts, answer]);

  const checkCorrect = (property, value) => {
    if (value == undefined) {
      value = [];
    }
    return answer[property] && answer[property].length == value.length && answer[property].every(v => value.includes(v));
  };

  const checkPartiallyCorrect = (property, value) => {
    if (value == undefined) {
      value = [];
    }
    return answer[property] && answer[property].some(v => value.includes(v));
  }

  const partiallyCorrectTips = (property, value) => {
    if (value == undefined) {
      value = [];
    }
    return answer[property] ? answer[property].filter(v => value.includes(v)).length + "/" + answer[property].length : "0/0";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classicArt) return; 
    
    const newLocked = {...lockedProperties};
    Object.keys(answer).forEach(prop => {
      if (checkCorrect(prop, currentValues[prop])) {
        newLocked[prop] = true;
      }
    });
    setLockedProperties(newLocked);

    setAttempts([{ ...currentValues }, ...attempts]);
    
    // Limpar campos não-bloqueados após submeter
    const newValues = {...currentValues};
    Object.keys(newValues).forEach(prop => {
      if (!newLocked[prop]) {
        newValues[prop] = [];
      }
    });
    setCurrentValues(newValues);
    
    if (Object.keys(answer).every(p => checkCorrect(p, currentValues[p]))) {
      StreakManager.addWin(currentDate, "Clássico", attempts.length + 1);
      setHasWon(true);

      try {
        const dateString = currentDate.toISOString().split('T')[0];
        
        setTodayHits(prevHits => prevHits + 1);

        await recordGameHit({
          date: dateString,
          gameMode: 'classicGame', 
          artname: classicArt.title
        });

      } catch (error) {
        console.error("Erro ao registrar o hit:", error);
      }

    } else {
      const newHints = [...hintsUnlocked];
      if (attempts.length + 1 >= 3) newHints[0] = true;
      if (attempts.length + 1 >= 6) newHints[1] = true;
      if (attempts.length + 1 >= 9) newHints[2] = true;
      setHintsUnlocked(newHints);
    }
  };

  const handleHintClick = (hintIndex) => {
    if (hintsUnlocked[hintIndex]) {
      setActiveHint(activeHint === hintIndex ? null : hintIndex);
    }
  };

  const getHintProperties = (hintIndex) => {
    if (!answer) return []; 

    switch (hintIndex) {
      case 0:
        return [
          { label: 'Década', property: 'data-da-obra-2', value: answer['data-da-obra-2'] },
          { label: 'Técnica', property: 'tecnica-3', value: answer['tecnica-3'] }
        ];
      case 1:
        return [
          { label: 'Moldura', property: 'moldura', value: answer['moldura'] },
          { label: 'Suporte', property: 'suporte', value: answer['suporte'] }
        ];
      case 2:
        return [
          { label: 'Material', property: 'material', value: answer['material'] },
          { label: 'Temática', property: 'tematica', value: answer['tematica'] }
        ];
      default:
        return [];
    }
  };

  const currentValueToSelectValue = (property) => {
    let currentValue = []
    if (currentValues[property] && currentValues[property].length > 0) {
      currentValue = currentValues[property].map(p => { return { label: p, value: p} })
    } else {
      currentValue = [{ label: 'Nenhum', value: 'Nenhum'}]
    }
    if (answer && answer[property.length <= 1]) {
      return currentValue[0];
    }
    return currentValue;
  }

  const setCurrentPropertyValue = (property, value) => {
    if (lockedProperties[property]) return;
    
    let newValue;
    if (value != null) {
      newValue = (Array.isArray(value) ? value : [value]).map((v) => v.value);
      if (newValue.every(v => (v == "Nenhum"))) {
        newValue = [];
      }
    } else {
      newValue = [];
    }
    newValue = newValue.filter(v => v !== "Nenhum");
    setCurrentValues(prev => ({
      ...prev,
      [property]: newValue
    }));
  }

  const handleCopyClassic = () => {
  const dateStr = currentDate.toLocaleDateString('pt-BR');
  const attemptsNum = attempts.length; // Número de linhas no grid
  let text = `Acervodle #${dateStr} - Modo Clássico\n`;
  text += `Acertei a obra em ${attemptsNum} ${attemptsNum === 1 ? 'tentativa' : 'tentativas'}!\n\n`;

  // Gerar o grid de emojis (invertido, para mostrar do primeiro ao último)
  const emojiGrid = attempts.map(attempt => {
      return properties.map(field => {
        const value = attempt[field.property] || '';
        const correct = checkCorrect(field.property, value);
        const partially = checkPartiallyCorrect(field.property, value);

        if (correct) return '🟩';
        if (partially) return '🟧'; // Laranja
        return '🟥';
      }).join('');
    }).reverse().join('\n'); // .reverse() para mostrar a 1ª tentativa no topo

    text += emojiGrid + '\n\n';
    text += 'https://acervodle.vercel.app/'; // Mude para o seu link!

    navigator.clipboard.writeText(text).catch(err => {
      console.error('Falha ao copiar:', err);
    });
  };

  return (
    <div className="game-page">

      {/* COMPONENTES DE VITÓRIA */}
      {showVictoryAnimation && <VictoryAnimation onComplete={() => setShowVictoryAnimation(false)} />}
      
      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        artworkTitle={classicArt?.title}
        artworkImage={classicArt?.thumbnail?.full[0]}
        attemptsCount={attempts.length + 1}
        todayHits={todayHits}
        gameType="classic"
        alreadyWon={alreadyWon}
        onShowStats={() => {
          setShowVictoryModal(false);
          setShowStatsModal(true);
        }}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        mode="Clássico"
        onCopy={handleCopyClassic}
      />

      {/* Logo */}
      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)', cursor: 'pointer' }}>
          <h1>Acervodle</h1>
        </div>
      </Link>

      {/* Modos */}
      <div className="modes-icons">
        <Link to="/classic" className="mode-icon-link">
          <div className="icon-circle active">
            {/* Ícone Clássico: Paleta (mantido ou trocado por FaImage) */}
            <FaPalette className="mode-icon" />
          </div>
        </Link>
        <Link to="/mural" className="mode-icon-link">
          <div className="icon-circle">
            {/* Ícone Mural: Rolo de Pintura (NOVO) */}
            <FaPaintRoller className="mode-icon" />
          </div>
        </Link>
        <Link to="/sculpture" className="mode-icon-link">
          <div className="icon-circle">
            {/* Ícone Escultura: Busto de Pedra (NOVO) */}
            <GiStoneBust className="mode-icon" style={{ transform: 'scale(1.2)' }} />
          </div>
        </Link>
      </div>

      {/* Estatísticas / tutorial */}
      <div className="utility-icons">
        <div 
          className="utility-icon" 
          style={{ cursor: 'pointer' }}
          onClick={() => setShowStatsModal(true)}
        >
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
            <FaFire/>{StreakManager.currentStreak("Clássico")}
          </span>
          <span className='tooltip'>Sequência atual</span>
        </div>
        <div className="utility-icon" style={{ cursor: 'pointer' }} onClick={() => setShowTutorial(true)}>
          <FaQuestion />
          <span className="tooltip">Como jogar?</span>
        </div>
      </div>

      {/* Dicas*/}
      <div className="mural-container hints-container-wrapper" style={{ marginBottom: '2rem' }}>
        <h3 className="mural-question hints-title">Acerte as características da obra do dia</h3>
        
        <div className="hints-container">
          {['Primeira', 'Segunda', 'Terceira'].map((hint, i) => (
            <div 
              key={i} 
              className="hint-item"
            >
              <div 
                className={`hint-icon ${hintsUnlocked[i] ? 'available' : 'locked'} ${activeHint === i ? 'active' : ''}`}
                onClick={() => handleHintClick(i)}
                style={{ cursor: hintsUnlocked[i] ? 'pointer' : 'default' }}
              >
                <FaLightbulb />
                <div className="hint-tooltip">
                  <div>{hint} Dica</div>
                  {!hintsUnlocked[i] && <div>Disponível em {3 * (i + 1) - attempts.length} tentativas</div>}
                  {hintsUnlocked[i] && activeHint !== i && <div>Clique para revelar</div>}
                  {hintsUnlocked[i] && activeHint === i && <div>Clique para ocultar</div>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeHint !== null && (
          <div className="hint-revealed-global-container">
            <div className={`hint-revealed-box hint-${activeHint}`}>
              <div className="hint-revealed-header">
                {['Primeira', 'Segunda', 'Terceira'][activeHint]} Dica Revelada
              </div>
              <div className="hint-revealed-content">
                {getHintProperties(activeHint).map((prop, propIndex) => (
                  <div key={propIndex} className="hint-revealed-property">
                    <span className="property-label">{prop.label}:</span>
                    <span className="property-value">
                      {prop.value && prop.value.length > 0 ? prop.value.join(', ') : 'Desconhecida'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!classicArt && optionsLoaded && ( 
          <div className="mural-container" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
            <h3 className="mural-question" style={{ color: '#AE1917' }}>
              Não há obra de arte disponível para o dia selecionado.
            </h3>
            <p className="stats-text" style={{margin: '1rem 0 0 0'}}>
              Por favor, escolha outra data no calendário.
            </p>
          </div>
      )}

      {classicArt && ( 
        <div className="mural-container" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
          <img src={classicArt.thumbnail?.full[0] || ''} alt="Obra" className="mural-image" />
        </div>
      )}

      {classicArt && (!hasWon && !alreadyWon) && (
        <p className="stats-text" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          {todayHits} pessoas já acertaram todas as características da obra de hoje!
        </p>
      )}

      {!optionsLoaded && (
        <div>
          <FaSpinner className='spinner'/>
          Carregando opções de valores 
        </div>
      )}
      <form onSubmit={handleSubmit} className="characteristics-form">
        <div className="characteristics-grid" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          {properties.map((field) => (
            <div key={field.property} className="characteristic-input" style={{ minWidth: '180px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>{field.label}</label>
              <Select
                value={currentValueToSelectValue(field.property)}
                isClearable
                isMulti={answer && answer[field.property]?.length > 1} 
                onChange={(selected) => setCurrentPropertyValue(field.property, selected)}
                options={getFilteredOptions(field.property)}
                isDisabled={lockedProperties[field.property] || !classicArt || hasWon || alreadyWon}
                className={lockedProperties[field.property] ? 'locked-select' : ''}
                isLoading={!optionsLoaded}
                styles={{
                  container: (base) => ({
                    ...base,
                    width: '100%',
                    minWidth: '150px'
                  })
                }}
              />
            </div>
          ))}
        </div>
        <button type="submit" className="guess-button classic-enter-button" disabled={hasWon || alreadyWon || !classicArt}> 
          ENTER
        </button>
      </form>

      {/* PAINEL PÓS-VITÓRIA */}
      {(hasWon || alreadyWon) && (
        <PostVictoryDisplay
          gameType="classic"
          artworkTitle={classicArt?.title}
          onShowStats={() => setShowVictoryModal(true)}
          onCopy={handleCopyClassic}
        />
      )}

      {/* Botão de Zoom - FORA do container de scroll, fixo no centro */}
      {attempts.length > 0 && (
        <div className="zoom-toggle-container" style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1rem',
          marginTop: '1rem'
        }}>
          <button
            className="zoom-toggle-button"
            onClick={() => setIsZoomedOut(!isZoomedOut)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#005285',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {isZoomedOut ? <FaSearchPlus /> : <FaSearchMinus />}
            <span>{isZoomedOut ? 'Zoom In' : 'Zoom Out'}</span>
          </button>
        </div>
      )}

      {attempts.length > 0 && (
        <div className={`attempts-grid ${isZoomedOut ? 'zoomed-out' : ''}`} style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

        <div className="attempts-header" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: isZoomedOut ? '0.15rem' : '1.5rem',
          marginBottom: '0.5rem',
          padding: isZoomedOut ? '0' : '0 0.5rem'
        }}>
        {properties.map((t) => (
        <div key={t.property} className="col-title" style={{ textAlign: 'center' }}>
            <div className="col-title-text" style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#000' }}>{t.label}</div>
            <div 
              className="col-underline" />
            </div>
          ))}
        </div>

          {/* As Linhas de Tentativa Anteriores */}
          {attempts.map((attempt, idx) => (
            <div key={idx} className="attempt-row" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: isZoomedOut ? '0.1rem' : '1.5rem',
              marginBottom: '0.5rem',
              padding: isZoomedOut ? '0' : '0 0.5rem'
            }}>
              {properties.map((field) => {
                const value = attempt[field.property] || '';
                const valueAsString = (!value || (Array.isArray(value) && value.length === 0)) ? '-' : value.join(", ");
                  const correct = checkCorrect(field.property, value);
                const partiallyCorrect = checkPartiallyCorrect(field.property, value);
                
                // Verifica se precisa mostrar seta de década
                const isDecadeField = field.property === "data-da-obra-2";
                const showArrow = isDecadeField && answer && answer[field.property] && !correct && value && value.length > 0;
                const arrowDirection = showArrow && value[0] > answer[field.property][0] ? 'down' : 'up';
                
                // Verifica se tem múltiplos valores corretos (mostra badge mesmo quando acerta)
                const hasMultipleValues = answer && answer[field.property] && answer[field.property].length > 1;
                const showBadge = hasMultipleValues && partiallyCorrect;
                
                return (
                  <div key={field.property} className={`attempt-square ${correct ? 'correct' : (partiallyCorrect ? 'partially' : 'wrong')}`}
                    style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderRadius: '4px',
                      minHeight: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      wordBreak: 'break-word',
                      position: 'relative',
                      flexDirection: 'row',
                      gap: '0.5rem'
                    }}
                    title={`${field.label}: ${valueAsString}`}>
                    
                    {/* Badge de acerto parcial - posicionado no topo direito */}
                    {showBadge && (
                      <div className="partial-match-badge" style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        fontWeight: 'bold',
                        backgroundColor: correct ? '#4caf50' : '#ff8800ff',
                        padding: '3px 6px',
                        borderRadius: '3px',
                        color: correct ? '#fff' : '#000000ff',
                        fontSize: '0.75rem',
                        lineHeight: '1',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}>{partiallyCorrectTips(field.property, value)}</div>
                    )}
                    
                    <div className="attempt-text-content" style={{
                      flex: 1,
                      wordBreak: 'break-word',
                      overflowY: 'auto',
                      whiteSpace: 'normal',
                      maxHeight: '50px',
                      textAlign: 'center',
                      paddingRight: showBadge ? '35px' : '0'
                    }}>
                      {valueAsString}
                    </div>
                    
                    {/* Seta de década - ao lado do texto */}
                    {showArrow && (
                      <div className="decade-arrow" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {arrowDirection === 'down' ? (
                          <FaArrowDown style={{ 
                            color: '#ff9800', 
                            fontSize: '20px',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                          }} />
                        ) : (
                          <FaArrowUp style={{ 
                            color: '#ff9800', 
                            fontSize: '20px',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                          }} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
        </div>
      )}

      <p className="yesterday-text">
        A obra de ontem foi: {yesterdayClassicArt}
      </p>

      <CalendarModal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        onDateSelect={changeDate}
        currentDate={currentDate}
        mode="Clássico"
      />

      {showTutorial && (
      <div className="tutorial-modal-overlay" onClick={() => setShowTutorial(false)}>
        <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
          <button className="tutorial-close" onClick={() => setShowTutorial(false)}>X</button>
          
          <h2 className="tutorial-title">Como jogar?</h2>
          <hr className="tutorial-divider" />
          
          <p className="tutorial-text" style={{ textAlign: 'left'}}>
            Adivinhe as características da obra do Acervo Artístico da UFSM do dia de hoje.
            A obra sorteada do banco de dados do acordo muda a cada 24 horas.
          </p>
          
          <p className="tutorial-text" style={{ textAlign: 'left'}}>
            Escolha as características da obra para revelar suas caracterísiticas.
            A cor dos quadrados indica se você acertou ou não a caracterísitica.
          </p>
          
          <div className="tutorial-colors">
            <div className="color-example">
              <div className="color-box correct-example"></div>
              <span className="color-text" style={{color: '#4caf50'}}>Verde: acertou exatamente a caracterísitica.</span>
            </div>
            <div className="color-example">
              <div className="color-box partially-example"></div>
              <span className="color-text" style={{color: '#EE7D00'}}>Laranja: acertou parcialmente a caracterísitica.</span>
            </div>
            <div className="color-example">
              <div className="color-box wrong-example"></div>
              <span className="color-text" style={{color: '#c62828'}}>Vermelho: errou completamente a caracterísitica.</span>
            </div>
          </div>
          
          <h3 className="tutorial-subtitle">Propriedades</h3>
          <hr className="tutorial-divider" />
          
          <div className="properties-list" style={{ textAlign: 'left' }}>
            <div className="property-item">
              <span style={{ color: '#005285', fontWeight: 'bold' }}>Material:</span> Tipo de material utilizado para confecção da obra.
            </div>
            <div className="property-item">
              <span style={{ color: '#005285', fontWeight: 'bold' }}>Técnica:</span> Método ou processo utilizado na criação da obra.
            </div>
            <div className="property-item">
              <span style={{ color: '#005285', fontWeight: 'bold' }}>Moldura:</span> Tipo de moldura que envolve a obra, se aplicável.
            </div>
            <div className="property-item">
              <span style={{ color: '#005285', fontWeight: 'bold' }}>Suporte:</span> Superfície ou base sobre a qual a obra foi executada.
            </div>
            <div className="property-item">
              <span style={{ color: '#005285', fontWeight: 'bold' }}>Década:</span> Período de dez anos em que a obra foi criada.
            </div>
            <div className="property-item">
              <span style={{ color: '#005285', fontWeight: 'bold' }}>Temática:</span> Assunto ou tema principal representado na obra.
            </div>
          </div>
          
          <p className="tutorial-note" style={{ textAlign: 'left', fontStyle: 'italic', marginTop: '1rem' }}>
            <span style={{ fontWeight: 'bold' }}>  Há algumas características desconhecidas de algumas obras, portanto elas serão desde o princípio consideradas acertadas pelo usuário. </span>
          </p>
          
          <h3 className="tutorial-subtitle">Dicas</h3>
          <hr className="tutorial-divider" />
          
          <p className="tutorial-text" style={{ textAlign: 'left'}}>
            Recebe-se uma dica a cada 3 tentativas incorretas. 
            Cada dica revela caracterísiticas específicas da obra.
          </p>
          
          <h3 className="tutorial-subtitle">Exemplo</h3>
          <hr className="tutorial-divider" />
          
          <p className="tutorial-text" style={{ textAlign: 'left'}}>
            Nesse exemplo, o jogador acertou duas caracterísiticas (Técnica e Moldura), errou outras duas (Material e Suporte),
            e acertou parcialmente a característica Temática - a obra em questão possui duas temáticas. A característica Década é desconhecida, então é considerada como acertada.
          </p>

          <div className="example-image-container">
            <img src={obraExemplo} alt="Obra de exemplo" className="example-image" />
          </div>
          
          <div className="tutorial-example">
            <div className="example-grid">
              <div className="example-header">
                <div className="example-column">Técnica</div>
                <div className="example-column">Material</div>
                <div className="example-column">Moldura</div>
                <div className="example-column">Suporte</div>
                <div className="example-column">Década</div>
                <div className="example-column">Temática</div>
              </div>
              <div className="example-row">
                <div className="example-cell correct">Pintura</div>
                <div className="example-cell wrong">Madeira</div>
                <div className="example-cell correct">Dourada</div>
                <div className="example-cell wrong">Tela</div>
                <div className="example-cell correct">Desonhecida</div>
                <div className="example-cell partially">Autorretrato</div>
              </div>
            </div>
            
            <div className="example-explanation">
              <div className="explanation-item">
                <span className="color-dot correct"></span>
                <span> Acertou a caracterísitica</span>
              </div>
              <div className="explanation-item">
                <span className="color-dot wrong"></span>
                <span> Errou a caracterísitica</span>
              </div>
              <div className="explanation-item">
                <span className="color-dot partially"></span>
                <span> Acertou parcialmente a caracterísitica - a obra possui duas temáticas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default ClassicGame;