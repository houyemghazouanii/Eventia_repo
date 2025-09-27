// setupTests.js
import '@testing-library/jest-dom/extend-expect';

// Mock pour canvas utilisé par chart.js ou fabric
Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
  value: () => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => []),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    arc: jest.fn(),
    beginPath: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arcTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    isPointInPath: jest.fn(),
  }),
});
