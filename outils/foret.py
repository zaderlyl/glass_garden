#!/usr/bin/env python3
"""
Plante la forêt dense d'une carte à partir d'une ZONE dessinée dans Tiled.

Dans Tiled, crée deux calques de TUILES dans ta carte :
    foret_zone   où tu dessines la zone de forêt : n'importe quelle tuile, n'importe quelle forme (le calque sert
                 seulement de masque ; tu peux le masquer ou le garder)
    foret        celui que le script remplit avec les bonnes tuiles de forêt (ne le dessine pas à la main)
Place le calque « foret » au-dessus des autres calques de sol, et mets-le dans le calque qui bloque le joueur si
la forêt sert de limite de carte.

Puis lance :
    python3 outils/foret.py assets/maps/ma_carte.json [--monde jardin] [--apercu apercu.png]
Le script remplit le calque « foret » (le fichier .tmx ou .json). Retouche la zone, relance : la forêt se recalcule.
Pense à fermer la carte dans Tiled avant de lancer le script (sinon Tiled écrasera son résultat), puis rouvre-la.

Comment la zone devient des arbres :
  * les arbres sont posés sur un quadrillage en quinconce (2 cases de période en largeur, 1 en hauteur, une rangée sur
    deux décalée d'une case, 3 x 3 cases chacun) ;
  * un arbre est planté quand la case CENTRALE de son empreinte est dans la zone : la forêt déborde donc d'environ
    une case autour de la zone dessinée ;
  * au bord de la carte, la zone est PROLONGÉE vers l'extérieur : une forêt dessinée contre le bord continue au-delà
    (c'est ce qu'il faut pour une limite de carte) ;
  * un arbre isolé : une seule case dessinée (ou deux) suffit à en planter un.
Les tuiles viennent de l'autotuile de forêt (34 tuiles, assets/tilesets/foret.json), la même pour les 5 mondes :
--monde choisit seulement de quelle section de la feuille on prend les tuiles.
"""
import argparse, json, os, re, sys
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import foret_logique as FL

MANIFESTE = os.path.join(RACINE, 'assets', 'tilesets', 'deco.json')
TABLE = os.path.join(RACINE, 'assets', 'tilesets', 'foret.json')


def charger_table():
    with open(TABLE, encoding='utf-8') as f:
        d = json.load(f)
    return {(px, py, mq): k for px, py, mq, k in d['index']}


def bloc_du_monde(monde):
    with open(MANIFESTE, encoding='utf-8') as f:
        m = json.load(f)
    nom = f'arbre_{monde}_foret_auto'
    e = next((e for e in m['elements'] if e['nom'] == nom and 'rect' in e), None)
    if e is None:
        sys.exit(f"Pas de bloc de forêt pour le monde « {monde} » dans le manifeste. Lance d'abord : "
                 f"python3 outils/arbres.py generer puis python3 outils/tileset.py reconstruire --appliquer")
    return e['rect'][0], e['rect'][1], m['colonnes']


def lire_carte(chemin):
    """Renvoie (largeur, hauteur, zone, firstgid, colonnes) ; zone = ensemble des cases dessinées dans foret_zone."""
    with open(chemin, encoding='utf-8') as f:
        texte = f.read()
    if chemin.endswith('.json'):
        m = json.loads(texte)
        l, h = m['width'], m['height']
        couches = {c['name']: c for c in m['layers'] if c['type'] == 'tilelayer'}
        deco = next((t for t in m['tilesets'] if 'tileset_deco' in t['image']), None)
        if deco is None: sys.exit('Cette carte n\'utilise pas tileset_deco.png.')
        if 'foret' not in couches or 'foret_zone' not in couches:
            manque(couches)
        data = couches['foret_zone']['data']
        return l, h, {(i % l, i // l) for i, g in enumerate(data) if g & 0x1FFFFFFF}, deco['firstgid'], deco['columns']
    l = int(re.search(r'<map [^>]*\bwidth="(\d+)"', texte).group(1)); h = int(re.search(r'<map [^>]*\bheight="(\d+)"', texte).group(1))
    deco = re.search(r'<tileset firstgid="(\d+)" name="tileset_deco"[^>]*columns="(\d+)"', texte)
    if deco is None: sys.exit('Cette carte n\'utilise pas tileset_deco.png.')
    noms = re.findall(r'<layer id="\d+" name="([^"]+)"', texte)
    if 'foret' not in noms or 'foret_zone' not in noms:
        manque(noms)
    bloc = re.search(r'<layer id="\d+" name="foret_zone"[^>]*>\s*<data encoding="csv">(.*?)</data>', texte, re.S).group(1)
    nombres = [int(x) for x in re.findall(r'\d+', bloc)]
    return l, h, {(i % l, i // l) for i, g in enumerate(nombres) if g & 0x1FFFFFFF}, int(deco.group(1)), int(deco.group(2))


def manque(presentes):
    sys.exit('Il faut deux calques de tuiles dans la carte : « foret_zone » (la zone que tu dessines) et « foret » '
             '(que le script remplit). Calques trouvés : ' + ', '.join(sorted(presentes)))


def ecrire_couche(chemin, grille, largeur):
    nombres = [g for ligne in grille for g in ligne]
    with open(chemin, encoding='utf-8') as f:
        texte = f.read()
    if chemin.endswith('.json'):
        nv, n = re.subn(r'("data":\s*\[)[^\]]*(\],\s*"height":\s*\d+,\s*"id":\s*\d+,\s*"name":\s*"foret")',
                        lambda mo: mo.group(1) + ', '.join(map(str, nombres)) + mo.group(2), texte)
    else:
        lignes = ',\n'.join(','.join(str(g) for g in nombres[i:i + largeur]) for i in range(0, len(nombres), largeur))
        nv, n = re.subn(r'(<layer id="\d+" name="foret"[^>]*>\s*<data encoding="csv">)(.*?)(</data>)',
                        lambda mo: mo.group(1) + '\n' + lignes + '\n' + mo.group(3), texte, flags=re.S)
    if n != 1:
        sys.exit('Impossible de réécrire le calque « foret » (format inattendu). Rien n\'a été modifié.')
    with open(chemin, 'w', encoding='utf-8') as f:
        f.write(nv)


def planter(chemin, monde, ecrire=True):
    largeur, hauteur, zone, premier, colonnes = lire_carte(chemin)
    index = charger_table()
    c0, l0, colonnes_feuille = bloc_du_monde(monde)
    if colonnes != colonnes_feuille:
        sys.exit(f'La carte décrit tileset_deco avec {colonnes} colonnes, la feuille en a {colonnes_feuille} : '
                 f'rouvre la carte dans Tiled ou lance outils/tileset.py reconstruire --appliquer.')
    slots = FL.couche(zone, largeur, hauteur, index)
    grille = [[0 if k is None else premier + (l0 + k // FL.LARGEUR_BLOC) * colonnes + (c0 + k % FL.LARGEUR_BLOC)
               for k in ligne] for ligne in slots]
    if ecrire:
        ecrire_couche(chemin, grille, largeur)
    return largeur, hauteur, slots, (c0, l0)


def apercu(slots, origine, sortie):
    with open(MANIFESTE, encoding='utf-8') as f:
        m = json.load(f)
    feuille = Image.open(os.path.join(RACINE, m['image'])).convert('RGBA')
    herbe = Image.open(os.path.join(RACINE, 'assets', 'images', 'tilesets', 'tileset_garden.png')).convert('RGBA').crop((128, 32, 160, 64))
    h, l = len(slots), len(slots[0])
    im = Image.new('RGBA', (l * 32, h * 32))
    for y in range(h):
        for x in range(l): im.alpha_composite(herbe, (x * 32, y * 32))
    for y, ligne in enumerate(slots):
        for x, k in enumerate(ligne):
            if k is not None:
                c, r = origine[0] + k % FL.LARGEUR_BLOC, origine[1] + k // FL.LARGEUR_BLOC
                im.alpha_composite(feuille.crop((c * 32, r * 32, c * 32 + 32, r * 32 + 32)), (x * 32, y * 32))
    im.save(sortie)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('carte', help='la carte .json ou .tmx')
    p.add_argument('--monde', default='jardin', help='section de la feuille d\'où viennent les tuiles (défaut : jardin)')
    p.add_argument('--apercu', help='écrit aussi une image de la forêt obtenue')
    a = p.parse_args()
    largeur, hauteur, slots, origine = planter(a.carte, a.monde)
    n = sum(1 for ligne in slots for k in ligne if k is not None)
    print(f'Forêt plantée : {n} cases remplies sur {largeur * hauteur} dans le calque « foret » de {os.path.basename(a.carte)}.')
    if a.apercu:
        apercu(slots, origine, a.apercu); print('Aperçu :', a.apercu)


if __name__ == '__main__':
    main()
