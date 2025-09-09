import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion, FaCheck } from 'react-icons/fa';
import muralPlaceholder from '../assets/Painel7.jpg';

const MuralGame = ({ muralArt }) => {
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [hasWon, setHasWon] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim() && muralArt) {
      const isCorrect = guess.toLowerCase() === muralArt.title.toLowerCase(); // pegando o .title
      
      if (isCorrect) {
        setHasWon(true);
      } else {
        // Adiciona a tentativa no início do array para que as mais recentes fiquem no topo
        setAttempts([guess, ...attempts]);
        setGuess('');
      }
    }
  };

  return (
    <div className="game-page">
      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)' }}>
          <h1>Acervodle</h1>
        </div>
      </Link>

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

      {/* Ícones de estatísticas e tutorial com fundo */}
      <div className="utility-icons">
        <div className="utility-icon">
          <FaChartBar />
        </div>
        <div className="utility-icon">
          <FaQuestion />
        </div>
      </div>

      {/* Área da imagem do mural com fundo */}
      <div className="mural-container">
        <h3 className="mural-question">A que mural pertence a fotografia?</h3>
        <div className="image-wrapper">
          <img 
            src={muralPlaceholder} 
            alt="Mural para adivinhar" 
            className="mural-image"
          />
        </div>
        <p className="mural-hint">A cada tentativa expande um pouco</p>
        
        {/* Exibe o nome do mural para testes - REMOVER DEPOIS NA VERSÃO FINAL */}
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

      {/* Mensagem de sucesso quando o usuário acerta */}
      {hasWon && (
        <div className="success-message">
          <FaCheck className="success-icon" />
          Parabéns! Você acertou o mural: {muralArt.title}
        </div>
      )}

      {/* Lista de tentativas erradas */}
      <div className="attempts-list">
        {attempts.map((attempt, index) => (
          <div key={index} className="wrong-attempt">
            {attempt}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MuralGame;