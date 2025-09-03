import seedrandom from "seedrandom";
import { countElements, countSculptures, countMurals } from "../taincan/taincanAPI.js";


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
    return getDailyArtIndex(n, "Clássico");
};

export const getTodaysMuralArt = async () => {
    const n = await countMurals();
    return getDailyArtIndex(n, "Mural");
};

export const getTodaysSculptureArt = async () => {
    const n = await countSculptures();
    return getDailyArtIndex(n, "Escultura");
};

//exemplo de uso das funções
//remover em breve!!
getTodaysClassicArt().then(index => {
    console.log("Today's classic art index:", index);
});
getTodaysMuralArt().then(index => {
    console.log("Today's mural art index:", index);
});
getTodaysSculptureArt().then(index => {
    console.log("Today's sculpture art index:", index);
});

export default getDailyArtIndex;