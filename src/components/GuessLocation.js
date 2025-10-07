import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Adicionei Link
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getAllSculptures, getAllMurals } from '../taincan/taincanAPI'; 

// Adicionei os ícones
import { FaPalette, FaPaintBrush, FaMonument, FaChartBar, FaQuestion } from 'react-icons/fa';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const GuessLocationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { artObject, artType } = location.state || {};
  
  const [artClusters, setArtClusters] = useState([]);
  const [allArt, setAllArt] = useState([]);
  const [mapCenter, setMapCenter] = useState([-29.715188239233512, -53.71606336080405]);
  const [loading, setLoading] = useState(true);
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false); // Adicionei estado para tutorial

  const artTypeName = artType === 'sculpture' ? 'localizada esta escultura' : 'localizado este mural';
  const pageTitle = `Onde está ${artTypeName}?`;
  const correctId = artObject?.metadata['numero-de-registro'].value;

  useEffect(() => {
    const fetchData = async () => {
      try {
        let artData;

        if (artType === 'sculpture') {
          artData = await getAllSculptures();
        } else if (artType === 'mural') {
          artData = await getAllMurals();
        } else {
          navigate('/');
          return;
        }

        const artWithLocation = artData.filter((item) => {
          const coordString = item.metadata?.georeferenciamento?.value;
          return coordString && coordString.includes(',');
        });

        setAllArt(artWithLocation);

        const clusters = [];
        const clusterThreshold = 0.0005;

        artWithLocation.forEach(art => {
          const [lat, lng] = art.metadata.georeferenciamento.value.split(',').map(Number);
          let foundCluster = false;

          for (const cluster of clusters) {
            const distance = Math.sqrt(
              Math.pow(cluster.center.lat - lat, 2) + Math.pow(cluster.center.lng - lng, 2)
            );

            if (distance < clusterThreshold) {
              cluster.items.push(art);
              const totalLat = cluster.items.reduce(
                (sum, item) => sum + parseFloat(item.metadata.georeferenciamento.value.split(',')[0]), 0
              );
              const totalLng = cluster.items.reduce(
                (sum, item) => sum + parseFloat(item.metadata.georeferenciamento.value.split(',')[1]), 0
              );
              cluster.center.lat = totalLat / cluster.items.length;
              cluster.center.lng = totalLng / cluster.items.length;
              foundCluster = true;
              break;
            }
          }

          if (!foundCluster) {
            clusters.push({
              center: { lat, lng },
              items: [art],
            });
          }
        });

        setArtClusters(clusters);

        const boundsPadding = 0.05;
        const lat = mapCenter[0];
        const lng = mapCenter[1];

        const southWest = L.latLng(lat - boundsPadding, lng - boundsPadding);
        const northEast = L.latLng(lat + boundsPadding, lng + boundsPadding);
        const bounds = L.latLngBounds(southWest, northEast);
        setMapBounds(bounds);
        setMapCenter([lat, lng]);
      } catch (error) {
        console.error(`Erro ao buscar ${artType}s:`, error);
      } finally {
        setLoading(false);
      }
    };

    if (artType) {
      fetchData();
    }
  }, [artType, navigate]);

  const handleGuess = (artItemsInCluster) => {
    if (isCorrectGuess) return;

    const idsInCluster = artItemsInCluster.map(item => item.metadata['numero-de-registro'].value);

    if (idsInCluster.includes(correctId)) {
      setIsCorrectGuess(true);
    } else {
      setWrongGuesses(prev => new Set([...prev, ...idsInCluster]));
    }
  };

  if (!artObject) {
    navigate('/');
    return null;
  }

  if (loading) return <p>Carregando mapa...</p>;

  return (
    <div className="game-page">
      {/* Logo com link para home - IGUAL aos outros jogos */}
      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)', cursor: 'pointer' }}>
          <h1>Acervodle</h1>
        </div>
      </Link>

      {/* Ícones dos modos de jogo - IGUAL aos outros jogos */}
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
          <div className="icon-circle">
            <FaMonument className="mode-icon" />
          </div>
        </Link>
      </div>

      {/* Ícones de estatísticas e tutorial - IGUAL aos outros jogos */}
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

      {/* Container principal do jogo de localização */}
      <div className="mural-container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h3 className="mural-question">{pageTitle}</h3>

        {artObject?.thumbnail?.full[0] && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <img
              src={artObject.thumbnail.full[0]}
              alt={`Arte a ser encontrada: ${artObject.title}`}
              style={{
                maxHeight: '200px',
                borderRadius: '8px',
                border: '3px solid #5D4037',
              }}
            />
          </div>
        )}

        <MapContainer
          center={mapCenter}
          maxBounds={mapBounds}
          zoom={14}
          minZoom={11}
          style={{
            height: '400px',
            width: '100%',
            margin: '0 auto',
            display: 'block',
            borderRadius: '8px',
            border: '2px solid #5D4037'
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {artClusters
            .filter(cluster => !cluster.items.every(item => 
              wrongGuesses.has(item.metadata['numero-de-registro'].value)
            ))
            .map((cluster) => {
              const clusterKey = `${cluster.center.lat}-${cluster.center.lng}`;
              return (
                <Marker
                  key={clusterKey}
                  position={[cluster.center.lat, cluster.center.lng]}
                  eventHandlers={{
                    click: isCorrectGuess ? null : () => handleGuess(cluster.items),
                  }}
                >
                  <Popup>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      <strong>Obras neste local:</strong>
                      <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                        {cluster.items.map(item => (
                          <li key={item.metadata['numero-de-registro'].value}>
                            {item.title || 'Obra sem título'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>

        {isCorrectGuess && (
          <div
            style={{
              textAlign: 'center',
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#e8f5e9',
              border: '2px solid #4caf50',
              borderRadius: '8px',
              color: '#2e7d32',
              fontWeight: 'bold'
            }}
          >
            <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>🎉 Parabéns, você acertou!</h3>
            <p style={{ margin: 0 }}>
               "{artObject.title}".
            </p>
          </div>
        )}
      </div>

      {/* Modal de Tutorial - similar aos outros jogos */}
      {showTutorial && (
        <div className="tutorial-modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button className="tutorial-close" onClick={() => setShowTutorial(false)}>X</button>
            <h2 className="tutorial-title">Como jogar?</h2>
            <hr className="tutorial-divider" />
            <p className="tutorial-text">
              Nesta fase bônus, seu desafio é encontrar a localização correta da obra no mapa do campus da UFSM.
            </p>
            <p className="tutorial-text">
              O mapa mostra vários marcadores que representam a localização dessas obras espalhadas na UFSM. Clique no marcador que você acredita
              ser a localização correta da obra adivinhada.
            </p>
            <p className="tutorial-text">
              Se você clicar no local errado, o marcador correspondente desaparecerá.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuessLocationPage;