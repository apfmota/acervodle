const API_URL = "https://tainacan.ufsm.br/acervo-artistico/wp-json/tainacan/v2";
const COLLECTION_URL = API_URL + "/collection/2174"

export const MURALS_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.MUR.";
export const SCULPTURES_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.ESC.";

export const NO_TITLE_FILTER_METAQUERY = "metaquery[1][key]=2177&metaquery[1][compare]=!=&metaquery[1][value]=Sem Título"

var cachedMetadata = []
export const getCollectionMetadata = async () => {
    if (cachedMetadata.length == 0) {
        //não tem problema usar uma página com tamanho fixo porque são poucos metadados configurados e não devem aumentar
        const request = await fetch(COLLECTION_URL + "/metadata?perpage=20");
        cachedMetadata = await request.json();
    }
    return cachedMetadata;
}

export const getFetchParameters = async () => {
    return "fetch_only=thumbnail,status,title&fetch_only_meta=" + (await getCollectionMetadata()).map(metadata => metadata.id).join(",")
}

const countCache = {};
export const countElements = async (metaqueryParams = "") => {
    if (countCache[metaqueryParams]) {
        return countCache[metaqueryParams];
    }
    let count = 0;
    let page = 1;
    const perpage = 100;
    let itemsCurrentPage = 0;
    do {
        const request = await fetch(COLLECTION_URL + `/items?perpage=${perpage}&paged=${page}&${metaqueryParams}&fetch_only=status`);
        itemsCurrentPage = (await request.json()).items.length;
        count += itemsCurrentPage;
        page += 1;
    } while (itemsCurrentPage != 0);
    countCache[metaqueryParams] = count;
    return count;
}

export const countMurals = async () => {
    return await countElements(MURALS_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
}

export const countSculptures = async () => {
    return await countElements(SCULPTURES_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
}

const elementsCache = {};
export const getElements = async (metaqueryParams = "") => {
    if (elementsCache[metaqueryParams]) {
        return elementsCache[metaqueryParams];
    }
    let elements = [];
    let page = 1;
    const perpage = 100;
    let itemsCurrentPage = 0;
    do {
        const request = await fetch(COLLECTION_URL + `/items?perpage=${perpage}&paged=${page}&${metaqueryParams}&${await getFetchParameters()}`);
        const json = await request.json();
        json.items.forEach(element => elements.push(element));
        itemsCurrentPage = json.items.length;
        page += 1;
    } while (itemsCurrentPage != 0);
    elementsCache[metaqueryParams] = elements;
    return elements;
}

export const getAllArts = async () => {
    return await getElements();
}

export const getAllMurals = async () => {
    return await getElements(MURALS_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
}

export const getAllSculptures = async () => {
    return await getElements(SCULPTURES_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
}

const artDataCache = {};
export const getArtData = async (index, metaquery = "") => {
    const cacheKey = `${metaquery}|${index}`;
    if (artDataCache[cacheKey]) {
        return artDataCache[cacheKey];
    }
    try {
        const url = `${API_URL}/collection/2174/items?perpage=1&paged=${index + 1}&${metaquery}&${await getFetchParameters()}`;
        const response = await fetch(url);
        const data = await response.json();
        const item = data.items[0];
        artDataCache[cacheKey] = item;
        return item;
    } catch {
        return null;
    }
}