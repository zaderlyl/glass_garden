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
// =====================================================================================

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
