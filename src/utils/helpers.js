// * Petites fonctions utilitaires, sans lien avec Phaser.

// Ajoute un zéro devant les nombres à un chiffre : 5 -> « 05 »
function pad(number) {
  return String(number).padStart(2, '0');
}

/**
 * Transforme une durée en texte « mm:ss.d » (minutes, secondes, dixièmes de seconde).
 * Exemple : 83400 ms -> « 01:23.4 »
 * @param {number} milliseconds
 * @returns {string}
 */
export function formatTime(milliseconds) {
  const totalTenths = Math.floor(milliseconds / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${pad(minutes)}:${pad(seconds)}.${tenths}`;
}
