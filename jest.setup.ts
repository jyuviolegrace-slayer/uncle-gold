/**
 * Jest Setup File
 * Global mocks for Phaser and browser APIs
 */

// Mock navigator for Phaser
if (typeof navigator === 'undefined') {
  (global as any).navigator = {
    userAgent: 'node.js',
    platform: 'node',
    language: 'en-US',
    languages: ['en-US', 'en'],
    onLine: true,
  };
}

// Mock document for Phaser
if (typeof document === 'undefined') {
  (global as any).document = {
    createElement: jest.fn(() => ({
      getContext: jest.fn(() => ({
        fillStyle: '',
        strokeStyle: '',
        globalAlpha: 1,
        globalCompositeOperation: 'source-over',
        fillRect: jest.fn(),
        clearRect: jest.fn(),
        getImageData: jest.fn(() => ({ data: [] })),
        putImageData: jest.fn(),
        createImageData: jest.fn(),
        setTransform: jest.fn(),
        drawImage: jest.fn(),
        save: jest.fn(),
        fillText: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        closePath: jest.fn(),
        stroke: jest.fn(),
        translate: jest.fn(),
        scale: jest.fn(),
        rotate: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        measureText: jest.fn(() => ({ width: 0 })),
        transform: jest.fn(),
        rect: jest.fn(),
        clip: jest.fn(),
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      width: 0,
      height: 0,
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
    documentElement: {
      ontouchstart: undefined,
    },
  };
}

// Mock window for Phaser
if (typeof window === 'undefined') {
  (global as any).window = {
    ...(global as any),
    innerWidth: 1024,
    innerHeight: 768,
    devicePixelRatio: 1,
    location: {
      href: 'http://localhost',
    },
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    ontouchstart: undefined,
  };
} else if (typeof (window as any).ontouchstart === 'undefined') {
  (window as any).ontouchstart = undefined;
}

// Mock Image for Phaser
if (typeof Image === 'undefined') {
  (global as any).Image = class Image {
    onload?: () => void;
    onerror?: () => void;
    src?: string;
    width: number = 0;
    height: number = 0;
  };
}

// Mock HTMLCanvasElement for Phaser (only if not already defined)
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillStyle: '',
    strokeStyle: '',
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  })) as any;
} else {
  // Define HTMLCanvasElement in Node environment
  (global as any).HTMLCanvasElement = class HTMLCanvasElement {
    getContext = jest.fn(() => ({
      fillStyle: '',
      strokeStyle: '',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(),
      putImageData: jest.fn(),
      createImageData: jest.fn(),
      setTransform: jest.fn(),
      drawImage: jest.fn(),
      save: jest.fn(),
      fillText: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      closePath: jest.fn(),
      stroke: jest.fn(),
      translate: jest.fn(),
      scale: jest.fn(),
      rotate: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      transform: jest.fn(),
      rect: jest.fn(),
      clip: jest.fn(),
    }));
  };
}

// Mock Phaser global namespace
(global as any).Phaser = {
  Math: {
    Between: jest.fn((min: number, max: number) => (min + max) / 2),
  },
  Input: {
    Keyboard: {
      KeyCodes: {
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        F: 70,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        SHIFT: 16,
        W: 87,
        A: 65,
        S: 83,
        D: 68,
      },
      JustDown: jest.fn((key: any) => key?.justDown || false),
    },
  },
  Scale: {
    FIT: 1,
    CENTER_BOTH: 1,
  },
  Scenes: {
    Events: {
      SHUTDOWN: 'shutdown',
      CREATE: 'create',
      UPDATE: 'update',
    },
  },
  AUTO: 0,
  CANVAS: 1,
  WEBGL: 2,
} as any;
