// jest.setup.js

// Mock du module 'canvas' pour éviter l'erreur "Cannot find module '../build/Release/canvas.node'"
jest.mock('canvas', () => {
  return {
    createCanvas: () => ({
      getContext: () => ({}), // Retourne un objet vide pour éviter les erreurs
    }),
    loadImage: () => Promise.resolve({}), // Mock de loadImage
  };
});
