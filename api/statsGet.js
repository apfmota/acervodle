import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Método ${req.method} Não Permitido`);
  }

  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Parâmetro "date" é obrigatório' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("daily_stats");
    const statsDocument = await collection.findOne({ _id: date });

    res.status(200).json(statsDocument);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao conectar ou buscar no banco de dados' });
  }
}