import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  /* CÓDIGO COMENTADO - Disclaimer/Aviso Mobile (removido temporariamente)
   * Descomente caso queira reativar o pop-up de aviso para dispositivos móveis
   * 
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    // Verifica se é a primeira vez que o usuário acessa
    const hasSeenWarning = localStorage.getItem('hasSeenMobileWarning');
    
    if (!hasSeenWarning) {
      setShowMobileWarning(true);
      // Marca que o usuário já viu o aviso
      localStorage.setItem('hasSeenMobileWarning', 'true');
    }
  }, []);

  const handleCloseWarning = () => {
    setShowMobileWarning(false);
  };
  */

  return (
    <div className="content">
      {/* MODAL DE AVISO MOBILE - COMENTADO
      {showMobileWarning && (
        <div className="tutorial-modal-overlay">
          <div 
            className="tutorial-modal" 
            style={{ 
              maxWidth: '500px',
              textAlign: 'center'
            }}
          >
            <button 
              className="tutorial-close" 
              onClick={handleCloseWarning}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#E8F1F8',
                border: '2px solid #1A1A1A',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#1A1A1A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              X
            </button>
            
            <h2 className="tutorial-title" style={{ marginBottom: '1rem' }}>
              Aviso Importante
            </h2>
            
            <hr className="tutorial-divider" />
            
            <p className="tutorial-text" style={{ textAlign: 'left', marginBottom: '1rem' }}>
              Esta aplicação está em fase de desenvolvimento e ainda não foi totalmente otimizada 
              para dispositivos móveis.
            </p>
            
            <p className="tutorial-text" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              Para garantir a melhor experiência durante os testes, recomendamos o uso em 
              <strong> computador ou notebook</strong>. A versão mobile estará disponível em 
              breve com todos os recursos adaptados.
            </p>
            
            <p className="tutorial-text" style={{ 
              textAlign: 'center', 
              fontStyle: 'italic',
              color: '#E8F1F8',
              marginBottom: '0'
            }}>
              Obrigado pela compreensão!
            </p>

            <button
              onClick={handleCloseWarning}
              style={{
                marginTop: '1.5rem',
                padding: '0.8rem 2rem',
                backgroundColor: '#005285',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: "'Cinzel', serif",
                fontSize: '1rem'
              }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
      FIM DO MODAL DE AVISO MOBILE */}

      <header className="header">
        <div className="title-box">
          <h1>Acervodle</h1>
        </div>
        <p className="subtitle">Adivinhe a obra do dia!</p>
      </header>

      <div className="modes-container">
        <Link to="/classic" className="mode-link">
          <div className="mode-card">
            <h2>Modo Clássico</h2>
            <p>Adivinhe as caracterísiticas de uma obra do Acervo artístico da UFSM</p>
          </div>
        </Link>

        <Link to="/mural" className="mode-link">
          <div className="mode-card">
            <h2>Modo Mural</h2>
            <p>Desubra qual o nome do mural pela foto. A cada tentativa o zoom é reduzido.</p>
          </div>
        </Link>

        <Link to="/sculpture" className="mode-link">
          <div className="mode-card">
            <h2>Modo Escultura</h2>
            <p>Adivinhe qual o nome da escultura do dia a partir da sua silhueta.</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Home;
