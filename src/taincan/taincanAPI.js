const API_URL = "https://tainacan.ufsm.br/acervo-artistico/wp-json/tainacan/v2";
const COLLECTION_URL = API_URL + "/collection/2174"

export const MURALS_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.MUR.";
export const SCULPTURES_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.ESC.";

export const NO_TITLE_FILTER_METAQUERY = "metaquery[1][key]=2177&metaquery[1][compare]=!=&metaquery[1][value]=Sem Título"

export const ORDER_PARAMS = "order=DESC&orderby=date";

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
export const countElements = async (limitDate, metaqueryParams = "") => {
    limitDate.setHours(23, 59, 59, 999);
    const cacheKey = limitDate.getTime() + "_" + metaqueryParams;
    if (countCache[cacheKey]) {
        return countCache[cacheKey];
    }
    let count = 0;
    let page = 1;
    let lastPage = false;
    let total;
    const PER_PAGE = 20;
    const PAGES_BATCH_SIZE = 3;
    do {
        lastPage = false;
        const promises = [];
        for (let i = 0; i < PAGES_BATCH_SIZE; i++) {
            const fetchPage = async (currentPage) => {
                const request = await fetch(COLLECTION_URL + `/items?perpage=${PER_PAGE}&paged=${currentPage}&${metaqueryParams}&fetch_only=status,creation_date&${ORDER_PARAMS}`);
                if (total == null && request.headers.get("X-WP-Total") != 0) {
                    total = request.headers.get("X-WP-Total");
                }
                const items = (await request.json()).items;
                if (items.length > 0) {
                    for (const item of items) {
                        const itemCreationDate = new Date(item.creation_date);
                        if (itemCreationDate > limitDate.getTime()) {
                            count++;
                        } else {
                            lastPage = true;
                            break;
                        }
                    }
                } else {
                    lastPage = true;
                }
            }
            promises.push(fetchPage(page));
            page++;
        }
        await Promise.all(promises);
    } while (!lastPage);
    countCache[cacheKey] = count;
    return total - count;
}

export const countMurals = async (limitDate) => {
    return await countElements(limitDate, MURALS_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
}

export const countSculptures = async (limitDate) => {
    return await countElements(limitDate, SCULPTURES_METAQUERY + "&" + NO_TITLE_FILTER_METAQUERY);
}

const promisesCache = {};
export const getElements = async (metaqueryParams = "") => {
    if (promisesCache[metaqueryParams]) {
        return await promisesCache[metaqueryParams];
    } else {
        const newRun = async () => {
            let elements = [];
            let page = 1;
            let lastPage = false;
            const PAGES_BATCH_SIZE = 10;
            const PER_PAGE = 50;
            do {
                lastPage = false;
                const promises = [];
                for (let i = 0; i < PAGES_BATCH_SIZE; i++) {
                    const fetchPage = async (currentPage) => {
                        const request = await fetch(COLLECTION_URL + `/items?perpage=${PER_PAGE}&paged=${currentPage}&${metaqueryParams}&${await getFetchParameters()}`);
                        const json = await request.json();
                        if (json.items.length > 0) {
                            json.items.forEach(element => elements.push(element));
                        } else {
                            lastPage = true;
                        }
                    }
                    promises.push(fetchPage(page));
                    page++;
                }
                await Promise.all(promises);
            } while (!lastPage);
            return elements;
        }
        const currentPromise = newRun();
        promisesCache[metaqueryParams] = currentPromise;
        return await currentPromise;
    }
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
        const url = `${API_URL}/collection/2174/items?perpage=1&paged=${index + 1}&${metaquery}&${await getFetchParameters()}&${ORDER_PARAMS}`;
        const response = await fetch(url);
        const data = await response.json();
        const item = data.items[0];
        artDataCache[cacheKey] = item;
        return item;
    } catch {
        return null;
    }
}
