const API_GET_URL = '/api/statsGet';
const API_POST_URL = '/api/statsPost';

export async function getStatsByDate(date) {
  if (!date) throw new Error("A data é obrigatória para buscar estatísticas.");
  
  try {
    const response = await fetch(`${API_GET_URL}?date=${date}`);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar estatísticas: ${response.statusText}`);
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Erro em getStatsByDate:", error);
    throw error;
  }
}

export async function recordGameHit({ date, gameMode, artname }) {
  if (!date || !gameMode || !artname) {
    throw new Error("date, gameMode, e artname são obrigatórios para registrar um hit.");
  }

  try {
    const response = await fetch(API_POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date, gameMode, artname }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Falha ao registrar o hit: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Erro em recordGameHit:", error);
    throw error;
  }
}
