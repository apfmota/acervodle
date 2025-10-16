import seedrandom from "seedrandom";
import { countElements, countSculptures, countMurals, getArtData, MURALS_METAQUERY, SCULPTURES_METAQUERY, NO_TITLE_FILTER_METAQUERY } from "../taincan/taincanAPI.js";


//retorna o indice da obra de hoje a partir do número de obras totais
const getDailyArtIndex = (artsNumber, gameMode, date) => {
    date.setHours(0, 0, 0, 0);
    const seed = date.getTime() + gameMode;
    const getRandom = seedrandom(seed)
    return parseInt(getRandom() * Math.pow(10, parseInt(Math.log10(artsNumber) + 1))) % artsNumber; 
}

export const getClassicArtByDate = async (date) => {
    const n = await countElements(date);
    const artIndex = getDailyArtIndex(n, "Clássico", date);
    const artData = await getArtData(artIndex);
    return artData;
};

export const getTodaysClassicArt = async () => {
    return await getClassicArtByDate(new Date());
}

export const getMuralArtByDate = async (date) => {
    const n = await countMurals(date);
    const artIndex = getDailyArtIndex(n, "Mural", date);
    return await getArtData(artIndex, MURALS_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY)
};

export const getTodaysMuralArt = async () => {
    return await getMuralArtByDate(new Date());
}

export const getSculptureArtByDate = async (date) => {
    const n = await countSculptures(date);
    const artIndex = getDailyArtIndex(n, "Escultura", date);
    return await getArtData(artIndex, SCULPTURES_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY)
};

export const getTodaysSculptureArt = async () => {
    return await getSculptureArtByDate(new Date())
}

export default getDailyArtIndex;