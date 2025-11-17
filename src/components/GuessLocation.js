import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getAllSculptures, getAllMurals } from '../taincan/taincanAPI'; 

import { FaPalette, FaPaintRoller, FaPaintBrush, FaMonument, FaChartBar, FaQuestion } from 'react-icons/fa';
import { GiStoneBust } from 'react-icons/gi';

import VictoryAnimation from './VictoryAnimation';
import VictoryModal from './VictoryModal';
import PostVictoryDisplay from './PostVictoryDisplay';
import { getStatsByDate, recordGameHit } from '../util/Statistics';
import StatsModal from './StatsModal';
import StreakManager from '../util/StreakManager.js';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon.Default();

const GuessLocationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { artObject, artType, dateOfArt, previousAttempts} = location.state || {};  
  const [artClusters, setArtClusters] = useState([]);
  const [allArt, setAllArt] = useState([]);
  const [mapCenter, setMapCenter] = useState([-29.715188239233512, -53.71606336080405]);
  const [loading, setLoading] = useState(true);
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [isCorrectGuess, setIsCorrectGuess] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false); 

  const [showVictoryAnimation, setShowVictoryAnimation] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  
  const [todayLocationHits, setTodayLocationHits] = useState(0);
  const locationGameMode =  artType === 'sculpture' ? 'locationSculpture' : 'locationMural';
  const gameMode =  artType === 'sculpture' ? 'Adivinhar Localização Escultura' : 'Adivinhar Localização Mural';
  
  const dateString = dateOfArt
    ? new Date(dateOfArt).toISOString().split('T')[0]
    : null;

  const [victoryAttemptCount, setVictoryAttemptCount] = useState(0);

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

        const boundsPadding = 1.0;
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


  useEffect(() => {
    if (!dateString) {
      console.warn('dateOfArt não foi fornecida, estatísticas não serão carregadas.');
      return;
    }

    const fetchStats = async () => {
      try {
        const statsDoc = await getStatsByDate(dateString);
        if (statsDoc && statsDoc[locationGameMode]) {
          setTodayLocationHits(statsDoc[locationGameMode].hits);
        } else {
          setTodayLocationHits(0);
        }
      } catch (error) {
        console.error('Falha ao buscar estatísticas de localização:', error);
        setTodayLocationHits(0);
      }
    };

    fetchStats();
  }, [dateString, locationGameMode]);

  const handleGuess = async (artItemsInCluster) => {
    if (isCorrectGuess || showVictoryModal) return;

    const idsInCluster = artItemsInCluster.map(item => item.metadata['numero-de-registro'].value);

    if (idsInCluster.includes(correctId)) {

      const attemptCount = wrongGuesses.size + 1;
      setIsCorrectGuess(true);
      setShowVictoryAnimation(true);
      setShowVictoryModal(true);
      setVictoryAttemptCount(attemptCount);
      setWrongGuesses(new Set());
      setTodayLocationHits((prev) => prev + 1);

      if (dateOfArt) {
        StreakManager.addWin(dateOfArt, gameMode, attemptCount);
      }

      if (dateString && artObject) {
        try {
          await recordGameHit({
            date: dateString,
            gameMode: locationGameMode,
            artname: artObject.title,
          });
        } catch (error) {
          console.error('Erro ao registrar acerto de localização:', error);
        }
      }

    } else {
      setWrongGuesses(prev => new Set([...prev, ...idsInCluster]));
    }
  };

  const handleCopyLocation = () => {
    const dateStr = new Date().toLocaleDateString('pt-BR');
    const gameName = artType === 'mural' ? 'Mural' : 'Escultura';
    const mainGameAttempts = previousAttempts || 0; // Pega o N° de tentativas do jogo principal
    const locationAttempts = victoryAttemptCount; // N° de tentativas da fase de localização

    let text = `Acervodle #${dateStr} - ${gameName}\n`;
    text += `Descobri a obra em ${mainGameAttempts} ${mainGameAttempts === 1 ? 'tentativa' : 'tentativas'}!\n`;
    text += `➕ Localização: Acerto em ${locationAttempts} ${locationAttempts === 1 ? 'tentativa' : 'tentativas'}!\n\n`;

    text += 'https://acervodle.vercel.app/';

    navigator.clipboard.writeText(text).catch(err => {
      console.error('Falha ao copiar:', err);
    });
  };

  if (!artObject) {
    navigate('/');
    return null;
  }

  if (loading) return <p>Carregando mapa...</p>;

  return (
    <div className="game-page">
      {showVictoryAnimation && <VictoryAnimation onComplete={() => setShowVictoryAnimation(false)} />}
      
      <VictoryModal
        isOpen={showVictoryModal}
        onClose={() => setShowVictoryModal(false)}
        artworkTitle={artObject?.title}
        artworkImage={artObject?.thumbnail?.full[0]}
        attemptsCount={victoryAttemptCount}
        todayHits={todayLocationHits} 
        gameType={artType}
        isLocationVictory={true}
        onShowStats={() => {
          setShowVictoryModal(false);
          setShowStatsModal(true);
        }}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        mode={gameMode}
        onCopy={handleCopyLocation}
      />

      <Link to="/" className="logo-link">
        <div className="title-box" style={{ transform: 'scale(0.8)', cursor: 'pointer' }}>
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
          <div className="icon-circle">
            <FaPaintRoller className="mode-icon" />
          </div>
        </Link>
        <Link to="/sculpture" className="mode-icon-link">
          <div className="icon-circle">
            <GiStoneBust className="mode-icon" style={{ transform: 'scale(1.2)' }} />
          </div>
        </Link>
      </div>

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
          onClick={() => setShowTutorial(true)}
        >
          <FaQuestion />
          <span className="tooltip">Como jogar?</span>
        </div>
      </div>

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
                border: '3px solid #005285',
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
            border: '2px solid #005285'
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

              const isThisClusterCorrect = cluster.items.some(
                item => item.metadata['numero-de-registro'].value === correctId
              );

              return (
                <Marker
                  key={clusterKey}
                  position={[cluster.center.lat, cluster.center.lng]}
                  
                  icon={(isCorrectGuess && isThisClusterCorrect) ? redIcon : defaultIcon} 
                  
                  eventHandlers={{
                    click: (isCorrectGuess || showVictoryModal) ? null : () => handleGuess(cluster.items),
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
          <PostVictoryDisplay
            gameType={artType}
            artworkTitle={artObject?.title}
            isLocationGame={true}
            onShowStats={() => setShowVictoryModal(true)}
            onCopy={handleCopyLocation}
          />
        )}
      </div>

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