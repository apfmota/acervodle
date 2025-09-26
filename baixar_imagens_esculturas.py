import os
import requests

API_URL = "https://tainacan.ufsm.br/acervo-artistico/wp-json/tainacan/v2"
COLLECTION_ID = "2174"
SCULPTURES_METAQUERY = "metaquery[0][key]=2200&metaquery[0][compare]=LIKE&metaquery[0][value]=.ESC."
PER_PAGE = 100

PASTA_DESTINO = "acervo_imgs"
os.makedirs(PASTA_DESTINO, exist_ok=True)

def get_all_sculptures():
    elementos = []
    page = 1
    while True:
        url = f"{API_URL}/collection/{COLLECTION_ID}/items?perpage={PER_PAGE}&paged={page}&{SCULPTURES_METAQUERY}&fetch_only=thumbnail,title"
        resp = requests.get(url)
        data = resp.json()
        items = data.get("items", [])
        if not items:
            break
        elementos.extend(items)
        page += 1
    return elementos

def baixar_imagem(url, nome_arquivo):
    try:
        resp = requests.get(url, stream=True)
        if resp.status_code == 200:
            with open(nome_arquivo, "wb") as f:
                for chunk in resp.iter_content(1024):
                    f.write(chunk)
            print(f"Baixou: {nome_arquivo}")
        else:
            print(f"Falha ao baixar {url}")
    except Exception as e:
        print(f"Erro ao baixar {url}: {e}")

def main():
    esculturas = get_all_sculptures()
    print(f"Total de esculturas: {len(esculturas)}")
    for escultura in esculturas:
        titulo = escultura.get("title", "escultura")
        thumb = escultura.get("thumbnail", {})
        url_img = None
        if "full" in thumb and thumb["full"]:
            url_img = thumb["full"][0]
        if url_img:
            nome_arquivo = os.path.join(PASTA_DESTINO, f"{titulo.replace(' ', '_')}.jpg")
            baixar_imagem(url_img, nome_arquivo)
        else:
            print(f"Escultura sem imagem: {titulo}")

if __name__ == "__main__":
    main()
