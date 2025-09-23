import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaLightbulb } from 'react-icons/fa';
import Select from 'react-select';
import { fillPossibleValues, getAllPossibleValues, getArtProperties } from '../util/ClassicModeDataFetch.js';

const ClassicGame = ({ loadingArt }) => {

  const [classicArt, setClassicArt] = useState();

  useEffect(() => {
    fillPossibleValues().then(() => setOptionsLoaded(true));
    loadingArt.then((art) => {
      setClassicArt(art);
      setAnswer(getArtProperties(art));
      console.log(getArtProperties(art));
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

  const [currentValues, setCurrentValues] = useState({});
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState([false, false, false]);
  const [answer, setAnswer] = useState({})

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

  const handleSubmit = (e) => {
    console.log(Object.keys(answer));

    e.preventDefault();
    if (!classicArt) return;
    setAttempts([{ ...currentValues }, ...attempts]);
    if (Object.keys(answer).every(p => checkCorrect(p, currentValues[p]))) {
      setHasWon(true);
    } else {

      // liberar dicas
      const newHints = [...hintsUnlocked];
      if (attempts.length + 1 >= 3) newHints[0] = true;
      if (attempts.length + 1 >= 6) newHints[1] = true;
      if (attempts.length + 1 >= 9) newHints[2] = true;
      setHintsUnlocked(newHints);
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
    let newValue;
    if (value != null) {
      newValue = (Array.isArray(value) ? value : [value]).map((v) => v.value);
      if (newValue.every(v => (v == "Nenhum"))) {
        newValue = [];
      }
    } else {
      newValue = [];
    }
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
        <div className="utility-icon"><FaChartBar /><span className="tooltip">Estatísticas</span></div>
        <div className="utility-icon"><FaQuestion /><span className="tooltip">Como jogar?</span></div>
      </div>

      {/* Dicas */}
      <div className="mural-container hints-container-wrapper">
        <h3 className="mural-question hints-title">Acerte as características da obra do dia</h3>
        <div className="hints-container">
          {['Tipo de Obra', 'Artista', 'Período'].map((hint, i) => (
            <div key={i} className={`hint-icon ${hintsUnlocked[i] ? 'available' : 'locked'}`}>
              <FaLightbulb />
              <div className="hint-tooltip">
                <div>Dica de {hint}</div>
                {!hintsUnlocked[i] && <div>Disponível em {3 * (i + 1) - attempts.length} tentativas</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      /* Imagem */
        {classicArt && (
          <div className="mural-container" style={{ maxWidth: '500px' }}>
            <img src={classicArt.thumbnail?.full[0] || ''} alt="Obra" className="mural-image" style={{ maxHeight: '300px' }} />
          </div>
        )}

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="characteristics-form">
          <div className="characteristics-grid">
            {properties.map((field) => (
          <div key={field.property} className="characteristic-input">
            <label>{field.label}</label>
            <Select
              value={currentValueToSelectValue(field.property)}
              isClearable
              isMulti={answer[field.property]?.length > 1}
              onChange={(selected) => setCurrentPropertyValue(field.property, selected)}
              options={getAllPossibleValues(field.property)}
            />
          </div>
            ))}
          </div>
          <button type="submit" className="guess-button classic-enter-button" disabled={hasWon}>
            ENTER
          </button>
        </form>

        {/* Tentativas */}
      <div className="attempts-grid">
        <div className="attempts-header">
          {properties.map((t) => (
            <div key={t.property} className="col-title">
              <div className="col-title-text">{t.label}</div>
              <div className="col-underline" />
            </div>
          ))}
        </div>

        {attempts.map((attempt, idx) => (
          <div key={idx} className="attempt-row">
            {properties.map((field) => {
              const value = attempt[field.property] || '';
              const valueAsString = (!value || (Array.isArray(value) && value.length === 0)) ? '-' : value.join(", ");
              const correct = checkCorrect(field.property, value);
              const partiallyCorrect = checkPartiallyCorrect(field.property, value);
              return (
                <div key={field.property} className={`attempt-square ${correct ? 'correct' : (partiallyCorrect ? 'partially' : 'wrong')}`} title={`${field.label}: ${valueAsString}`}>
                  {valueAsString}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassicGame;
