"""
Logique commune de la forêt en quinconce (utilisée par arbres.py et foret.py).

La forêt est faite d'arbres posés sur un quadrillage : l'origine d'un arbre (son coin haut-gauche, en cases) est (tx, ty)
avec tx et ty de même parité, ce qui donne une période de 2 cases en largeur, 1 en hauteur, une rangée sur deux
décalée d'une case. Chaque arbre fait 3 x 3 cases. Les arbres des rangées du bas passent devant ceux du haut.

Une case de la carte n'est touchée que par 5 arbres au plus : son contenu ne dépend que de LEUR PRÉSENCE (un petit
nombre binaire) et de la parité de ses coordonnées. On calcule donc une table (parité, présence) -> tuile, commune
aux 5 mondes (même table, donc même carte pour tous les mondes : on change seulement la feuille).
"""
import hashlib
from PIL import Image

T = 32
LARGEUR_BLOC = 7          # largeur, en tuiles, du bloc de tuiles rangé dans la feuille


def decalages(px, py):
    """Les arbres qui touchent une case (X, Y) de parités (px, py), en décalages (dx, dy) de leur origine par rapport
    à la case, dans l'ordre de dessin (rangée du haut d'abord)."""
    res = []
    for dy in (-2, -1, 0):
        for dx in (-2, -1, 0):
            if (px + dx - ((py + dy) % 2)) % 2 == 0:
                res.append((dx, dy))
    return res


def tuile_pour(arbre, px, py, masque):
    """Le contenu de la tuile quand seuls les arbres du masque sont présents (arbre : image 96 x 96 d'un monde)."""
    im = Image.new('RGBA', (T, T), (0, 0, 0, 0))
    for i, (dx, dy) in enumerate(decalages(px, py)):
        if masque >> i & 1:
            im.alpha_composite(arbre.crop((-dx * T, -dy * T, -dx * T + T, -dy * T + T)))
    return im


def table(arbres):
    """Construit la table commune à tous les mondes. arbres : {monde: image 96 x 96}.
    Renvoie (cles, index) : cles = liste ordonnée des (px, py, masque) qui ont une tuile (une par signature distincte),
    index = {(px, py, masque): numéro de tuile ou None si la case est vide dans tous les mondes}."""
    signatures, cles, index = {}, [], {}
    candidats = []
    for py in (0, 1):
        for px in (0, 1):
            for masque in range(1 << len(decalages(px, py))):
                candidats.append((bin(masque).count('1'), px, py, masque))
    for _, px, py, masque in sorted(candidats):
        sig = tuple(hashlib.md5(tuile_pour(a, px, py, masque).tobytes()).hexdigest() for _, a in sorted(arbres.items()))
        vide = all(tuile_pour(a, px, py, masque).getchannel('A').getbbox() is None for a in arbres.values())
        if vide:
            index[(px, py, masque)] = None
        elif sig in signatures:
            index[(px, py, masque)] = signatures[sig]
        else:
            signatures[sig] = len(cles)
            index[(px, py, masque)] = len(cles)
            cles.append((px, py, masque))
    return cles, index


def bloc(arbre, cles):
    """Le bloc de tuiles d'un monde : une tuile par entrée de `cles`, rangées sur LARGEUR_BLOC colonnes."""
    n = len(cles)
    im = Image.new('RGBA', (LARGEUR_BLOC * T, ((n + LARGEUR_BLOC - 1) // LARGEUR_BLOC) * T), (0, 0, 0, 0))
    for k, (px, py, masque) in enumerate(cles):
        im.alpha_composite(tuile_pour(arbre, px, py, masque), ((k % LARGEUR_BLOC) * T, (k // LARGEUR_BLOC) * T))
    return im


def arbres_presents(zone, largeur, hauteur):
    """Quels arbres existent ? Un arbre d'origine (tx, ty) existe si la case centrale de son empreinte, (tx+1, ty+1),
    est dans la zone dessinée. Hors de la carte, on prolonge le bord (clamp) : la forêt continue au-delà de la carte."""
    def peinte(cx, cy):
        return (min(max(cx, 0), largeur - 1), min(max(cy, 0), hauteur - 1)) in zone
    return lambda tx, ty: (tx - (ty % 2)) % 2 == 0 and peinte(tx + 1, ty + 1)


def couche(zone, largeur, hauteur, index):
    """Pour chaque case de la carte, le numéro de tuile du bloc (ou None si vide)."""
    existe = arbres_presents(zone, largeur, hauteur)
    sortie = [[None] * largeur for _ in range(hauteur)]
    for Y in range(hauteur):
        for X in range(largeur):
            px, py = X % 2, Y % 2
            masque = 0
            for i, (dx, dy) in enumerate(decalages(px, py)):
                if existe(X + dx, Y + dy):
                    masque |= 1 << i
            sortie[Y][X] = index.get((px, py, masque))
    return sortie
