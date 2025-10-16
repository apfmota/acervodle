import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaLightbulb, FaSpinner } from 'react-icons/fa';
import Select from 'react-select';
import { fillPossibleValues, getAllPossibleValues, getArtProperties } from '../util/ClassicModeDataFetch.js';
import obraExemplo from '../assets/obra_exemplo.jpg';

const ClassicGame = ({ loadingArt }) => {
  const [classicArt, setClassicArt] = useState();
  const [lockedProperties, setLockedProperties] = useState({});
  const [currentValues, setCurrentValues] = useState({});
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState([false, false, false]);
  const [answer, setAnswer] = useState({});
  const [showTutorial, setShowTutorial] = useState(false);

  const randomPlayers = Math.floor(Math.random() * 1000) + 100;

  const [activeHint, setActiveHint] = useState(null);

  useEffect(() => {
    fillPossibleValues().then(() => setOptionsLoaded(true));
    loadingArt.then((art) => {
      setClassicArt(art);
      const answerProperties = getArtProperties(art);
      setAnswer(answerProperties);
      
      // Inicializar propriedades bloqueadas para características faltantes
      const initialLocked = {};
      Object.keys(answerProperties).forEach(prop => {
        if (answerProperties[prop].length === 0) {
          initialLocked[prop] = true;
        }
      });
      setLockedProperties(initialLocked);
    }); 
  }, [])

  const properties = [
    {label: 'Técnica', property: 'tecnica-3'},
    {label: 'Material', property: 'material'},
    {label: 'Moldura', property: 'moldura'},
    {label: 'Suporte', property: 'suporte'},
    {label: 'Década', property: 'data-da-obra-2'},
    {label: 'Temática', property: 'tematica'},
  ]

  const checkCorrect = (property, value) => {
    if (value == undefined) {
      value = [];
    }
    return answer[property].length == value.length && answer[property].every(v => value.includes(v));
  };

  const checkPartiallyCorrect = (property, value) => {
    if (value == undefined) {
      value = [];
    }
    return answer[property].some(v => value.includes(v));
  }

  const partiallyCorrectTips = (property, value) => {
    if (value == undefined) {
      value = [];
    }
    return answer[property].filter(v => value.includes(v)).length + "/" + answer[property].length 
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!classicArt) return;
    
    // Verificar e bloquear propriedades acertadas
    const newLocked = {...lockedProperties};
    Object.keys(answer).forEach(prop => {
      if (checkCorrect(prop, currentValues[prop])) {
        newLocked[prop] = true;
      }
    });
    setLockedProperties(newLocked);

    setAttempts([{ ...currentValues }, ...attempts]);
    
    if (Object.keys(answer).every(p => checkCorrect(p, currentValues[p]))) {
      setHasWon(true);
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
    switch (hintIndex) {
      case 0: // Primeira dica: Década e Técnica
        return [
          { label: 'Década', property: 'data-da-obra-2', value: answer['data-da-obra-2'] },
          { label: 'Técnica', property: 'tecnica-3', value: answer['tecnica-3'] }
        ];
      case 1: // Segunda dica: Moldura e Suporte
        return [
          { label: 'Moldura', property: 'moldura', value: answer['moldura'] },
          { label: 'Suporte', property: 'suporte', value: answer['suporte'] }
        ];
      case 2: // Terceira dica: Material e Temática
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
    if (answer[property.length <= 1]) {
      return currentValue[0];
    }
    return currentValue;
  }

  const setCurrentPropertyValue = (property, value) => {
    // Não permitir alterar propriedades bloqueadas
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

  return (
    <div className="game-page">
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
            <FaPalette className="mode-icon" />
          </div>
        </Link>
        <Link to="/mural" className="mode-icon-link">
          <div className="icon-circle">
            <FaPaintBrush className="mode-icon" />
          </div>
        </Link>
        <Link to="/sculpture" className="mode-icon-link">
          <div className="icon-circle">
            <FaMonument className="mode-icon" />
          </div>
        </Link>
      </div>

      {/* Estatísticas / tutorial */}
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

      {/* Dicas*/}
      <div className="mural-container hints-container-wrapper" style={{ marginBottom: '2rem' }}>
        <h3 className="mural-question hints-title">Acerte as características da obra do dia</h3>
        
        {/* Container dos ícones de dica */}
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

        {/* Container único para a dica ativa - centralizado abaixo dos ícones */}
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

      {/* Imagem - Aumentar espaçamento */}
      {classicArt && (
        <div className="mural-container" style={{ maxWidth: '500px', marginBottom: '2rem' }}>
          <img src={classicArt.thumbnail?.full[0] || ''} alt="Obra" className="mural-image" />
        </div>
      )}

      {/* Estatísticas - acima dos inputs */}
      <p className="stats-text" style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        {randomPlayers} pessoas já acertaram todas as características da obra de hoje!
      </p>

      {/* Inputs - Grid mais espaçada e alinhada */}
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
                isMulti={answer[field.property]?.length > 1}
                onChange={(selected) => setCurrentPropertyValue(field.property, selected)}
                options={getAllPossibleValues(field.property)}
                isDisabled={lockedProperties[field.property]}
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
        <button type="submit" className="guess-button classic-enter-button" disabled={hasWon}>
          ENTER
        </button>
      </form>

      {/* Tentativas - Grid alinhada com os inputs */}
      <div className="attempts-grid" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="attempts-header" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '1.5rem',
          marginBottom: '0.5rem',
          padding: '0 0.5rem'
        }}>
          {properties.map((t) => (
            <div key={t.property} className="col-title" style={{ textAlign: 'center' }}>
              <div className="col-title-text" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t.label}</div>
              <div className="col-underline" />
            </div>
          ))}
        </div>

        {attempts.map((attempt, idx) => (
          <div key={idx} className="attempt-row" style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '1.5rem',
            marginBottom: '0.5rem',
            padding: '0 0.5rem'
          }}>
            {properties.map((field) => {
              const value = attempt[field.property] || '';
              const valueAsString = (!value || (Array.isArray(value) && value.length === 0)) ? '-' : value.join(", ");
              const correct = checkCorrect(field.property, value);
              const partiallyCorrect = checkPartiallyCorrect(field.property, value);
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
                    wordBreak: 'break-word'
                  }}
                  title={`${field.label}: ${valueAsString}`}>
                  <div style={{
                    width: '70%',
                    wordBreak: 'break-word',
                    overflowY: 'scroll',
                    whiteSpace: 'normal',
                    maxHeight: '50px'
                  }}>
                    {valueAsString}
                  </div>
                  {(!correct && partiallyCorrect) && (
                    <div style={{
                      fontWeight: 'bold',
                      margin: '10px',
                      backgroundColor: '#ff8800ff',
                      padding: '5px',
                      borderRadius: '3px',
                      color: '#000000ff'
                    }}>{partiallyCorrectTips(field.property, value)}</div>
                  )}
                  {field.property == "data-da-obra-2" && (
                    <div>
                      {value[0] > answer[field.property][0] && (
                        <span style={{ marginLeft: '6px', color: '#2196f3', fontSize: '1.2em' }}>&darr;</span>
                      )}
                      {value[0] < answer[field.property][0] && (
                        <span style={{ marginLeft: '6px', color: '#2196f3', fontSize: '1.2em' }}>&uarr;</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Modal de Tutorial */}
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