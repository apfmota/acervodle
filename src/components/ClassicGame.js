import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaLightbulb } from 'react-icons/fa';

const ClassicGame = ({ classicArt }) => {
  const [characteristics, setCharacteristics] = useState({
    artista: '',
    material: '',
    designacao: '',
    periodo: ''
  });
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);
  const [hintsUnlocked, setHintsUnlocked] = useState([false, false, false]);
  const [correctAnswers, setCorrectAnswers] = useState({
    artista: false,
    material: false,
    designacao: false,
    periodo: false
  });

  const normalize = (v) =>
    (v ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const checkCorrect = (field, value) => {
    const meta = classicArt?.metadata?.[field]?.value;
    if (!meta) return false;
    if (Array.isArray(meta)) return meta.map(normalize).includes(normalize(value));
    return normalize(meta) === normalize(value);
  };

  const handleInputChange = (e, field) => {
    setCharacteristics({ ...characteristics, [field]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!classicArt) return;

    const newCorrectAnswers = {
      artista: checkCorrect('artista', characteristics.artista),
      material: checkCorrect('material', characteristics.material),
      designacao: checkCorrect('designacao', characteristics.designacao),
      periodo: checkCorrect('periodo', characteristics.periodo),
    };

    setCorrectAnswers(newCorrectAnswers);

    if (Object.values(newCorrectAnswers).every(Boolean)) {
      setHasWon(true);
    } else {
      setAttempts([{ ...characteristics }, ...attempts]);

      // liberar dicas
      const newHints = [...hintsUnlocked];
      if (attempts.length + 1 >= 3) newHints[0] = true;
      if (attempts.length + 1 >= 6) newHints[1] = true;
      if (attempts.length + 1 >= 9) newHints[2] = true;
      setHintsUnlocked(newHints);

      // limpar só os errados
      setCharacteristics({
        artista: newCorrectAnswers.artista ? characteristics.artista : '',
        material: newCorrectAnswers.material ? characteristics.material : '',
        designacao: newCorrectAnswers.designacao ? characteristics.designacao : '',
        periodo: newCorrectAnswers.periodo ? characteristics.periodo : '',
      });
    }
  };

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

      {/* Imagem */}
      {classicArt && (
        <div className="mural-container" style={{ maxWidth: '500px' }}>
          <img src={classicArt.thumbnail?.full[0] || ''} alt="Obra" className="mural-image" style={{ maxHeight: '300px' }} />
        </div>
      )}

      {/* Inputs */}
      <form onSubmit={handleSubmit} className="characteristics-form">
        <div className="characteristics-grid">
          {['artista', 'material', 'designacao', 'periodo'].map((field) => (
            <div key={field} className="characteristic-input">
              <label>{field[0].toUpperCase() + field.slice(1)}</label>
              <input
                type="text"
                value={characteristics[field]}
                onChange={(e) => handleInputChange(e, field)}
                placeholder={`Digite o ${field}...`}
                disabled={correctAnswers[field] || hasWon}
                className={correctAnswers[field] ? 'correct-answer' : ''}
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
          {['Artista', 'Material', 'Designação', 'Período'].map((t) => (
            <div key={t} className="col-title">
              <div className="col-title-text">{t}</div>
              <div className="col-underline" />
            </div>
          ))}
        </div>

        {attempts.map((attempt, idx) => (
          <div key={idx} className="attempt-row">
            {['artista', 'material', 'designacao', 'periodo'].map((field) => {
              const value = attempt[field] || '';
              const correct = checkCorrect(field, value);
              return (
                <div key={field} className={`attempt-square ${correct ? 'correct' : 'wrong'}`} title={`${field}: ${value}`}>
                  {value || '-'}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* >>>>>>>>>>>>> NÃO ESTÁ CARREGANDO AS INFORMAÇÕES <<<<<<<<<<< */}
      {classicArt && (
        <div className="mural-container" style={{ maxWidth: '500px', marginTop: '1rem', fontSize: '0.9rem', background: '#eee' }}>
          <h4>Respostas corretas (teste):</h4>
          <p><strong>Artista:</strong> {classicArt.metadata?.artista?.value || '---'}</p>
          <p><strong>Material:</strong> {classicArt.metadata?.material?.value || '---'}</p>
          <p><strong>Designação:</strong> {classicArt.metadata?.designacao?.value || '---'}</p>
          <p><strong>Período:</strong> {classicArt.metadata?.periodo?.value || '---'}</p>
        </div>
      )}
    </div>
  );
};

export default ClassicGame;
