import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getAllSculptures } from '../taincan/taincanAPI';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const GuessLocation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sculpture = location.state?.sculpture;

  const [allSculptures, setAllSculptures] = useState([]);
  const [mapCenter, setMapCenter] = useState([-29.715188239233512, -53.71606336080405]);
  const [loading, setLoading] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);
  const [wrongGuesses, setWrongGuesses] = useState(new Set());
  const [isCorrectGuess, setIsCorrectGuess] = useState(false); 

  const correctId = sculpture?.metadata['numero-de-registro'].value;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sculptures = await getAllSculptures();

        const sculpturesWithLocation = sculptures.filter((s) => {
          const coordString = s.metadata?.georeferenciamento?.value;
          return coordString && coordString.includes(',');
        });

        setAllSculptures(sculpturesWithLocation);

        if (sculpturesWithLocation.length > 0) {
          const coords = sculpturesWithLocation.map((s) => {
            const [latStr, lngStr] = s.metadata.georeferenciamento.value.split(',');
            return {
              lat: parseFloat(latStr),
              lng: parseFloat(lngStr),
            };
          });

          const totalLat = coords.reduce((sum, coord) => sum + coord.lat, 0);
          const totalLng = coords.reduce((sum, coord) => sum + coord.lng, 0);
          const avgLat = totalLat / coords.length;
          const avgLng = totalLng / coords.length;

          const boundsPadding = 0.5;
          const lat = mapCenter[0];
          const lng = mapCenter[1];

          const southWest = L.latLng(lat - boundsPadding, lng - boundsPadding);
          const northEast = L.latLng(lat + boundsPadding, lng + boundsPadding);
          const bounds = L.latLngBounds(southWest, northEast);
          // no momento o centro está hardcoded
          setMapBounds(bounds);
          setMapCenter([lat, lng]);
        }
      } catch (error) {
        console.error('Erro ao buscar esculturas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGuess = (id) => {

    if (isCorrectGuess) return;

    if (id === correctId) {
      setIsCorrectGuess(true);
    } else {
      setWrongGuesses(prev => new Set(prev).add(id));
    }
  };

  if (!sculpture) {
    navigate('/');
    return null;
  }

  if (loading) return <p>Carregando mapa...</p>;
  
  return (
    <div>
      <h2>Onde está localizada esta escultura?</h2>

      <MapContainer
        center={mapCenter}
        maxBounds={mapBounds}
        minZoom={11}
        zoom={14}
        style={{ height: '400px', width: '600px', margin: '0 auto', display: 'block' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {allSculptures
          .filter(s => !wrongGuesses.has(s.metadata['numero-de-registro'].value))
          .map((s) => {
            const coordString = s.metadata.georeferenciamento.value;
            const [latStr, lngStr] = coordString.split(',');
            const lat = parseFloat(latStr);
            const lng = parseFloat(lngStr);
            const reg = s.metadata['numero-de-registro'].value;

            return (
              <Marker
                key={reg}
                position={[lat, lng]}

                eventHandlers={{ click: isCorrectGuess ? null : () => handleGuess(reg) }}
              >
                <Popup>{s.nome || 'Escultura'}</Popup>
              </Marker>
            );
          })}
      </MapContainer>
      
      {isCorrectGuess && (
        <div style={{ textAlign: 'center', marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e9', border: '1px solid #4caf50', borderRadius: '5px' }}>
          <h3 style={{ color: '#2e7d32' }}>🎉 Parabéns, você acertou!</h3>
          <p>Esta é a escultura "{sculpture.nome}".</p>
        </div>
      )}

      <button onClick={() => navigate('/')}>Voltar ao Início</button>
    </div>
  );
};

export default GuessLocation;