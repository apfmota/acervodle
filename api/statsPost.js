import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Método ${req.method} Não Permitido`);
    }

    let body;
    try {
        if (typeof req.body === 'string') {
            body = JSON.parse(req.body);
        } else {
            body = req.body;
        }
    } catch (error) {
        return res.status(400).json({ error: 'JSON inválido' });
    }
    
    const { date, gameMode, artname } = body;

    if (!date || !gameMode || !artname) {
        return res.status(400).json({ error: 'date, gameMode, e artname são obrigatórios' });
    }

    try {
        
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DBNAME || "Acervodle");
        const collection = db.collection("Acervodle_daily_statistics");

        const filter = { "_id": date };
        
        const hitsField = `${gameMode}.hits`; 
        const artnameField = `${gameMode}.artname`; 

        const defaultHits = {
            "classicGame.hits": 0,
            "muralGame.hits": 0,
            "sculptureGame.hits": 0,
            "guessLocationMural.hits": 0,
            "guessLocationSculpture.hits": 0
        };

        delete defaultHits[hitsField];

        const defaultArt_names = {
            "classicGame.artname": null,
            "muralGame.artname": null,
            "sculptureGame.artname": null,
            "guessLocationMural.artname": null,
            "guessLocationSculpture.artname": null
        };

        delete defaultArt_names[artnameField]; 

        const updateOperation = {
            $inc: {
                [hitsField]: 1 
            },
            $set: {
                [artnameField]: artname
            },
            $setOnInsert: {
                _id: date,
                ...defaultHits, 
                ...defaultArt_names
            }
        };

        const options = { "upsert": true };

        const results = await collection.updateOne(filter, updateOperation, options); 

        if (results.upsertedCount > 0) {
            console.log(`[${date}] Novo documento criado. ${gameMode} +1`);
        } else {
            console.log(`[${date}] Estatística +1 atualizada para: ${gameMode}`);
        }

        res.status(200).json({ success: true, message: `Estatística atualizada para ${gameMode} em ${date}` });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao conectar ou atualizar o banco de dados' });
    }
}