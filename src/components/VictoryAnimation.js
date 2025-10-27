import React, { useEffect } from 'react';

// Quantidade de partículas
const PARTICLE_COUNT = 70;
// Duração da animação em milissegundos
const ANIMATION_DURATION = 3000; 
// Emojis que serão usados
const EMOJIS = ['🎉', '💖', '⭐', '😊', '🏆', '✨'];

const VictoryAnimation = ({ onComplete }) => {
  
  useEffect(() => {
    // Define um timer para remover o componente após a animação
    const timer = setTimeout(() => {
      onComplete();
    }, ANIMATION_DURATION);

    // Limpa o timer se o componente for desmontado
    return () => clearTimeout(timer);
  }, [onComplete]);

  // Gera as partículas
  const particles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
    const isLeft = Math.random() > 0.5;
    // Posição inicial (fora da tela)
    const startX = isLeft ? `${Math.random() * -10}vw` : `${90 + Math.random() * 10}vw`;
    // Posição vertical inicial (espalhado pela altura da tela)
    const startY = `${Math.random() * 70 + 15}vh`; 
    
    const style = {
        left: startX,
        top: startY,
        animationDuration: '1.8s', // velocidade fixa e rápida
        animationDelay: `${Math.random() * 1}s`, // ainda com início em tempos diferentes
        animationName: isLeft ? 'flyLeftToCenter' : 'flyRightToCenter',
    };
    
    // Escolhe um emoji aleatório
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    return (
      <span key={i} className="confetti" style={style}>
        {emoji}
      </span>
    );
  });

  return (
    <div className="victory-overlay">
      {particles}
    </div>
  );
};

export default VictoryAnimation;