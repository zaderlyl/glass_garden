// =====================================================================================
// * PROGRESS SYSTEM : CE QUE LE JOUEUR A DÉBLOQUÉ
// =====================================================================================
//
// Le tir et le dash sont VERROUILLÉS au début de la partie : le joueur les gagne en avançant (voir PROGRESS dans constants.js).
// L'état vit dans ce fichier, chargé une seule fois pour toute la partie (une scène est recréée à chaque visite d'un monde).
// Il repart à zéro quand on recharge la page (nouvelle partie).
//
// * COMMENT L'UTILISER
//   import { ABILITIES, isUnlocked, unlock, notifyLocked } from '../systems/ProgressSystem.js';
//
//   if (isUnlocked(ABILITIES.SHOOT)) shoot(...);
//   else notifyLocked(this, ABILITIES.SHOOT);   // l'interface affiche « Tir pas encore débloqué »
//   unlock(ABILITIES.SHOOT);                    // le joueur vient de gagner le tir
//   unlockForStar('world_1');                   // l'étoile du monde 1 vient d'être ramassée : renvoie ce qu'elle débloque
// =====================================================================================

import { PROGRESS } from '../utils/constants.js';

export const ABILITIES = { SHOOT: 'shoot', DASH: 'dash' };

// * L'événement envoyé quand le joueur appuie sur une action encore verrouillée (l'interface l'écoute, voir UIScene)
export const ABILITY_LOCKED_EVENT = 'ability-locked';

const unlocked = new Set();

/** Cette capacité est-elle débloquée ? */
export const isUnlocked = (ability) => unlocked.has(ability);

/** Débloque une capacité. */
export const unlock = (ability) => unlocked.add(ability);

/** Remet tout en place : à appeler au début d'une nouvelle partie. */
export const resetProgress = () => unlocked.clear();

/** Prévient l'interface que le joueur a essayé une action verrouillée (elle affiche un message bref). */
export const notifyLocked = (scene, ability) => scene.game.events.emit(ABILITY_LOCKED_EVENT, ability);

/**
 * Appelée quand l'étoile d'un monde est ramassée : débloque ce que ce monde donne (voir PROGRESS.STAR_UNLOCKS).
 * @param {string} world  Le nom du monde (ex. « world_1 »)
 * @returns {string[]} les capacités qui viennent d'être débloquées (vide si l'étoile ne donne rien, ou si elles l'étaient déjà)
 */
export function unlockForStar(world) {
  const gained = (PROGRESS.STAR_UNLOCKS[world] ?? []).filter((ability) => !isUnlocked(ability));
  gained.forEach(unlock);
  return gained;
}
