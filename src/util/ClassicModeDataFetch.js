import { getAllArts, getAllMurals, getAllSculptures } from "../taincan/taincanAPI.js"

const propertiesOfInterest = {
    'material' : new Set(),
    'moldura': new Set(),
    'suporte':  new Set(),
    'tecnica-3': new Set(),
    'data-da-obra-2': new Set(),
    'tematica': new Set()
}

export const fillTitles = async (type) => {
  const localTitles = new Set();
  let allArts = [];
  if(type == 'sculpture') 
  {
    allArts = await getAllSculptures();
  }
  else if(type == 'mural')
  {
    allArts = await getAllMurals();
  }

  for (const art of allArts) {
    if (art.title && typeof art.title === "string" && art.title.trim().length > 0) {
      localTitles.add(toTitleCase(art.title.trim()));
    }
  }
  return Array.from(localTitles);
}

export const fillPossibleValues = async () => {
    const allArts = await getAllArts();
    for (const art of allArts) {
        const artValues = getArtProperties(art);
        for (const property in artValues) {
            const values = artValues[property];
            values.forEach(v => propertiesOfInterest[property].add(v))
        }
    }
}

const getPropertyValues = (art, property) => {
    if (art.metadata[property] != undefined) {
        if (Array.isArray(art.metadata[property].value)) {
            return art.metadata[property].value.map(v => v.name);
        } else if (art.metadata[property]?.value_as_string) {
            return [art.metadata[property].value_as_string.split(">")[0].trim()];
        } else {
            return [art.metadata[property].value];
        }
     }
    return null;
}

export const getArtProperties = (art) => {
    const values = {}
    for (const property in propertiesOfInterest) {
        let propertyValues = getPropertyValues(art, property).filter(validValue).map(toTitleCase);
        if (property == "data-da-obra-2") {
            propertyValues = propertyValues.map(getDecade)
        }
        values[property] = propertyValues;
    }
    return values;
}

const getDecade = (text) => {
    const year = text.match(/\d{4}/);
    return parseInt(year / 10) * 10;
}

export const getAllPossibleValues = (property) => {
    return [
        {value: 'Nenhum', label: 'Nenhum'}, 
        ...[...propertiesOfInterest[property]].map(v => { return { label: v, value: v}}).sort((a, b) => compare(a.value, b.value))
    ];
}

const compare = (a, b) => {
    if (!isNaN(a) && !isNaN(b)) {
        return Number(a) - Number(b);
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

const validValue = (value) => {
    return typeof value == "string" && value.trim().length > 0 && value.trim() != "-" && value.toLowerCase() != "sem data"
}

const toTitleCase = (str) => {
    return str.replace(/([^\s]+)/g, (txt) =>
        txt.charAt(0).toLocaleUpperCase('pt-BR') + txt.slice(1).toLocaleLowerCase('pt-BR')
    );
}