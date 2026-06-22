/* dati/porte.js — Porte (entrate negli edifici) dalle mappe Tiled
   Ogni chiave = valore di "destinazione" nell'evento porta del .tmj
   mappa: chiave nel registro MAPPE di map.js (= file TMJ da caricare)
   arrivo_x / arrivo_y: tile di arrivo nella mappa destinazione
   nome: etichetta dell'edificio (per il titolo)

   Per le destinazioni senza mappa TMJ (casa_personaggio_giocatore, casa_rivale)
   si usa l'InteriorScene di fallback.
*/

const DATI_PORTE = {

  'lab_professore': {
    mappa: 'lab_professore',
    arrivo_x: 6,
    arrivo_y: 10,
    nome: 'Laboratorio — Prof. Castagno',
  },

  'pokecenter': {
    mappa: 'pokecenter',
    arrivo_x: 5,
    arrivo_y: 8,
    nome: 'Centro Pokémon',
  },

  'casa_personaggio_giocatore': {
    mappa: null,
    nome: 'Casa tua',
  },

  'casa_rivale': {
    mappa: null,
    nome: 'Casa di Remo',
  },

};
