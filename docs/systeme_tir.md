# Le système de tir

Ce document décrit le tir tel qu'il est écrit sur la branche `feature/logique_tir` : ce qui marche, comment l'utiliser, ce qui reste à brancher. Il est dans un fichier à part parce que la branche n'est pas encore à jour avec `main` (le journal et le GDD y sont en retard : leurs entrées seront ajoutées après la fusion).

## Ce qui est fait

Le code est dans `src/systems/fonctionTir.js`. Il ne contient que la **vie d'une balle** : il ne lit aucune touche (c'est le rôle de `InputManager`) et ne crée aucun groupe (la scène lui en donne un).

| Fonction | Rôle |
|---|---|
| `createBulletAnimations(scene)` | Crée les animations de la balle (vol, explosion). Sans effet si elles existent déjà |
| `shoot(scene, bullets, player, direction)` | Crée une balle devant le joueur et l'envoie dans une direction : `'up'`, `'down'`, `'left'` ou `'right'` |
| `explodeBullet(bullet)` | Arrête la balle, joue son explosion, puis la détruit. Sans effet si elle a déjà explosé |
| `hitTarget(bullet, target)` | Une balle touche une cible : la balle explose, la cible perd une vie, détruite à 0 |
| `addTargetCollision(scene, bullets, targets)` | Branche la collision entre le groupe de balles et un groupe de cibles |

**La vie d'une balle :** elle apparaît à `BULLET.START_OFFSET` pixels devant le joueur (pas sur lui), vole à `BULLET.SPEED` pixels par seconde en jouant son animation en boucle, puis explose quand elle touche un mur ou une cible. Si elle ne touche rien, elle explose toute seule après `BULLET.LIFETIME_MS` : une balle ne reste jamais en mémoire indéfiniment.

**Dans `HubScene`** (le seul monde sur cette branche) :
- `balle.png` est chargée comme un spritesheet, puis `createBulletAnimations` et le groupe `this.bullets` sont créés **une seule fois** dans `create`.
- La scène retient la direction regardée (`this.facing`) : à l'arrêt, le joueur tire donc dans la dernière direction où il a marché.
- Une collision entre les balles et le calque `walls` appelle `explodeBullet`.
- L'action `shoot` de l'`InputManager` (touche `A` pour le joueur 1, `Espace` pour le joueur 2, **provisoires**) appelle `shoot`.

## Les valeurs réglables

Toutes dans `src/utils/constants.js`, dans `BULLET` et `DIRECTION_VECTORS` :

| Valeur | Rôle |
|---|---|
| `BULLET.SPEED` | Vitesse de la balle, en pixels par seconde (600) |
| `BULLET.START_OFFSET` | Distance entre le joueur et l'apparition de la balle (24 px) |
| `BULLET.LIFETIME_MS` | Durée de vie maximale (1200 ms, soit environ 720 px de portée) |
| `BULLET.FLY_ANIM`, `BULLET.HIT_ANIM` | Images et vitesse des animations de vol et d'explosion |

## L'image de la balle

`assets/images/sprites/balle.png` n'est **pas une image seule** : c'est une bande de 33 images de 16 x 16 pixels (528 x 16).

| Images | Contenu | Utilisé |
|---|---|---|
| 0 à 5 | Le projectile en vol, dessiné vers la droite, avec une traînée | Oui (vol) |
| 6 à 15 | Une explosion en losange | Oui (impact) |
| 16 à 32 | Un rayon qui grandit puis s'efface | Non |

Pour tirer dans les autres directions, la balle est tournée par un quart de tour (`setRotation`), à partir de l'image dessinée vers la droite. Les images 16 à 32 pourraient servir pour une arme à rayon.

## Les cibles

Une cible est n'importe quel objet Phaser avec un corps physique. Elle peut avoir une propriété **`hitPoints`** (son nombre de vies ; 1 si elle n'en a pas). Chaque balle qui la touche lui retire une vie, et elle est détruite à zéro.

La **création** des cibles (image, place, nombre de vies) n'est pas dans ce fichier : elle revient au monde qui en a besoin (le monde 4, les boîtes), par exemple avec des objets posés dans Tiled comme les étoiles. La collision, elle, se branche en une ligne :

```js
// Dans le monde qui a des cibles, une seule fois, après avoir créé le groupe de cibles
addTargetCollision(this, this.bullets, this.targets);
```

**Pour la branche `feature/cibles`** (`fonctionCibles.js`) : la propriété doit s'appeler `hitPoints` (et non `pointsVie`, les noms de code sont en anglais), et sa propre fonction `hit` peut être supprimée : `hitTarget` fait déjà ce travail.

## Ce qui reste à faire

- **Fusionner `main`** dans la branche. Ensuite, déplacer les ajouts de `HubScene.js` dans `WorldScene` (chargement de la balle, groupe, collision avec les murs, tir), pour que tous les mondes tirent.
- **Le bouton de tir en arcade** : `O` est prévu. À ajouter dans la partie « arcade » de `BINDINGS` après la fusion avec les modes de contrôle ; en mode pc, `A`.
- **Où peut-on tirer ?** Pour l'instant dans tous les mondes, pour tester. Le GDD ne prévoit le tir que pour les mondes 2 et 4 : à décider, et à limiter si besoin.
- **Le monde 4** : placer les cibles (boîtes), choisir laquelle cache l'étoile.
- **Une animation de destruction** des cibles (pour l'instant elles disparaissent simplement).
- **Les ennemis du monde 2** : les balles devront aussi pouvoir les toucher. `hitTarget` devrait s'y appliquer tel quel.
- Une balle qui sort de l'écran n'explose qu'à la fin de sa durée de vie : si besoin, ajouter un test de position.

## Ce qui a été corrigé par rapport au premier fichier

Le premier `fonctionTir.js` venait d'un jeu de plateforme et plantait dès qu'on l'importait. Corrigé :
- du code écrit hors de toute fonction (`this.load.image(...)`, `if (cursors.left.isDown)`), avec des variables qui n'existent pas ;
- un mauvais chemin d'image, et `balle.png` chargée comme une image seule alors que c'est une bande de 33 images ;
- seulement deux directions (gauche et droite) au lieu de quatre, avec des animations et vitesses d'un jeu de plateforme ;
- une touche (`A`) écrite en dur, au lieu d'une action de l'`InputManager` ;
- un groupe de balles et une touche recréés à chaque tir ;
- aucune destruction des balles : elles restaient en mémoire.

## Comment tester

1. Lancer le jeu, marcher dans une direction (`Z` `Q` `S` `D`), puis appuyer sur `A` : une balle part dans cette direction.
2. Tirer contre un mur : la balle explose en un losange bleu puis disparaît.
3. Pour essayer une cible, créer temporairement un objet avec un corps physique et une propriété `hitPoints` dans un groupe, puis appeler `addTargetCollision`.
