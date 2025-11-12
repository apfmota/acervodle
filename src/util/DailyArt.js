import seedrandom from "seedrandom";
import { countElements, countSculptures, countMurals, getArtData, MURALS_METAQUERY, SCULPTURES_METAQUERY, NO_TITLE_FILTER_METAQUERY } from "../taincan/taincanAPI.js";


//retorna o indice da obra de hoje a partir do número de obras totais
const getDailyArtIndex = (artsNumber, gameMode, date, nTry) => {
    date.setHours(0, 0, 0, 0);
    const seed = date.getTime() + gameMode + (nTry > 1 ? nTry : '');
    const getRandom = seedrandom(seed)
    return parseInt(getRandom() * Math.pow(10, parseInt(Math.log10(artsNumber) + 1))) % artsNumber; 
}

export const getClassicArtByDate = async (date) => {
    let artData = {};
    let nTry = 1;
    do {
        const n = await countElements(date);
        const artIndex = getDailyArtIndex(n, "Clássico", date, nTry);
        artData = await getArtData(artIndex);
        nTry++;
    } while (!artData?.thumbnail_id);
    return artData;
};

export const getTodaysClassicArt = async () => {
    return await getClassicArtByDate(new Date());
}

export const getMuralArtByDate = async (date) => {
    let artData = {};
    let nTry = 1;
    do {
        const n = await countMurals(date);
        const artIndex = getDailyArtIndex(n, "Mural", date, nTry);
        artData = await getArtData(artIndex, MURALS_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
        console.log(artData)
        nTry++;
    } while (!artData?.thumbnail_id);
    return artData;
};

export const getTodaysMuralArt = async () => {
    return await getMuralArtByDate(new Date());
}

export const getSculptureArtByDate = async (date) => {
    let artData = {};
    let nTry = 1;
    do {
        const n = await countSculptures(date);
        const artIndex = getDailyArtIndex(n, "Escultura", date, nTry);
        artData = await getArtData(artIndex, SCULPTURES_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
        nTry++;
    } while (!artData?.thumbnail_id);
    return artData;
};

export const getTodaysSculptureArt = async () => {
    return await getSculptureArtByDate(new Date())
}

export default getDailyArtIndex;