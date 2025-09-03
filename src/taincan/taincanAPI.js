const API_URL = "https://tainacan.ufsm.br/acervo-artistico/wp-json/tainacan/v2";

export const MURALS_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.MUR.";
export const SCULPTURES_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.ESC.";

export const countElements = async (metaqueryParams = "") => {
    let count = 0;
    let page = 1;
    const perpage = 100;
    let itemsCurrentPage = 0;
    do {
        const request = await fetch(API_URL + `/collection/2174/items?perpage=${perpage}&paged=${page}&${metaqueryParams}`);
        itemsCurrentPage = (await request.json()).items.length;
        count += itemsCurrentPage;
        page += 1;
    } while (itemsCurrentPage != 0);
    return count;
}

export const countMurals = async () => {
    return await countElements(MURALS_METAQUERY);
}

export const countSculptures = async () => {
    return await countElements(SCULPTURES_METAQUERY);
}

export const getArtData = async (index, metaquery = "") => {
    try {
        const url = `${API_URL}/collection/2174/items?perpage=1&paged=${index + 1}&${metaquery}`;
        const response = await fetch(url);
        const data = await response.json();
        return data.items[0];
    } catch {
        return null;
    }
}