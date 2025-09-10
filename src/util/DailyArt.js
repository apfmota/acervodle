import seedrandom from "seedrandom";
import { countElements, countSculptures, countMurals, getArtData, MURALS_METAQUERY, SCULPTURES_METAQUERY } from "../taincan/taincanAPI.js";


//retorna o indice da obra de hoje a partir do número de obras totais
const getDailyArtIndex = (artsNumber, gameMode) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const seed = (today.getTime() / 1000 / 60 / 60 / 24) + gameMode;
    const getRandom = seedrandom(seed)
    return parseInt(getRandom() * Math.pow(10, parseInt(Math.log10(artsNumber) + 1))) % artsNumber; 
}

export const getTodaysClassicArt = async () => {
    const n = await countElements();
    const artIndex = getDailyArtIndex(n, "Clássico");
    const artData = await getArtData(artIndex);
    console.log("Today's classic art data:", artData);
    return artData;
};

export const getTodaysMuralArt = async () => {
    const n = await countMurals();
    const artIndex = getDailyArtIndex(n, "Mural");
    return await getArtData(artIndex, MURALS_METAQUERY)
};

export const getTodaysSculptureArt = async () => {
    const n = await countSculptures();
    const artIndex = getDailyArtIndex(n, "Escultura");
    return await getArtData(artIndex, SCULPTURES_METAQUERY)
};
export default getDailyArtIndex;