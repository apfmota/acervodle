const API_URL = "https://tainacan.ufsm.br/acervo-artistico/wp-json/tainacan/v2";

export const countElements = async (metaqueryParams = "") => {
    let count = 0;
    let page = 1;
    const perpage = 100;
    let itemsCurrentPage = 0;
    do {
        const request = await fetch(API_URL + `/collection/2174/items?perpage=${perpage}&view_mode=cards&paged=${page}&${metaqueryParams}`);
        itemsCurrentPage = (await request.json()).items.length;
        count += itemsCurrentPage;
        page += 1;
    } while (itemsCurrentPage != 0);
    return count;
}

export const countMurals = async () => {
    return await countElements("metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.MUR.");
}

export const countEsculptures = async () => {
    return await countElements("metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.ESC.");
}