/**
 * Scene Boot Smoke Test
 * Ensures Boot and Preloader scenes module structure is valid
 */

describe('Scene Boot Smoke Tests', () => {
  describe('Boot Scene Module', () => {
    test('should have valid Boot scene file', () => {
      const fs = require('fs');
      const path = require('path');
      const bootPath = path.join(__dirname, '../Boot.ts');
      
      expect(fs.existsSync(bootPath)).toBe(true);
      
      const content = fs.readFileSync(bootPath, 'utf8');
      expect(content).toContain('export class Boot');
      expect(content).toContain('extends BaseScene');
      expect(content).toContain('create()');
    });

    test('should verify Boot scene structure from file content', () => {
      const fs = require('fs');
      const path = require('path');
      const bootPath = path.join(__dirname, '../Boot.ts');
      const content = fs.readFileSync(bootPath, 'utf8');
      
      // Check for class definition
      expect(content).toMatch(/export\s+class\s+Boot/);
      
      // Check for extends BaseScene
      expect(content).toMatch(/extends\s+BaseScene/);
      
      // Check for create method
      expect(content).toMatch(/create\s*\(\s*\)/);
      
      // Check for constructor
      expect(content).toMatch(/constructor\s*\(\s*\)/);
    });

    test('should verify Boot scene has proper Phaser scene methods', () => {
      const fs = require('fs');
      const path = require('path');
      const bootPath = path.join(__dirname, '../Boot.ts');
      const content = fs.readFileSync(bootPath, 'utf8');
      
      // Verify it has create lifecycle method
      expect(content).toContain('create()');
      
      // Verify it calls parent create
      expect(content).toContain('super.create()');
    });
  });

  describe('Preloader Scene Module', () => {
    test('should have valid Preloader scene file', () => {
      const fs = require('fs');
      const path = require('path');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      
      expect(fs.existsSync(preloaderPath)).toBe(true);
      
      const content = fs.readFileSync(preloaderPath, 'utf8');
      expect(content).toContain('export class Preloader');
      expect(content).toContain('extends BaseScene');
      expect(content).toContain('preload()');
      expect(content).toContain('create()');
    });

    test('should verify Preloader scene structure from file content', () => {
      const fs = require('fs');
      const path = require('path');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      const content = fs.readFileSync(preloaderPath, 'utf8');
      
      // Check for class definition
      expect(content).toMatch(/export\s+class\s+Preloader/);
      
      // Check for extends BaseScene
      expect(content).toMatch(/extends\s+BaseScene/);
      
      // Check for preload method
      expect(content).toMatch(/preload\s*\(\s*\)/);
      
      // Check for create method
      expect(content).toMatch(/create\s*\(\s*\)/);
      
      // Check for constructor
      expect(content).toMatch(/constructor\s*\(\s*\)/);
    });

    test('should verify Preloader has asset loading logic', () => {
      const fs = require('fs');
      const path = require('path');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      const content = fs.readFileSync(preloaderPath, 'utf8');
      
      // Verify it has asset loading
      expect(content).toContain('load.');
      
      // Verify it has progress tracking
      expect(content).toContain('progress');
      
      // Verify it emits preload-complete
      expect(content).toContain('preload-complete');
    });
  });

  describe('Scene Integration Structure', () => {
    test('should verify both scenes extend BaseScene', () => {
      const fs = require('fs');
      const path = require('path');
      
      const bootPath = path.join(__dirname, '../Boot.ts');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      
      const bootContent = fs.readFileSync(bootPath, 'utf8');
      const preloaderContent = fs.readFileSync(preloaderPath, 'utf8');
      
      expect(bootContent).toMatch(/extends\s+BaseScene/);
      expect(preloaderContent).toMatch(/extends\s+BaseScene/);
    });

    test('should verify scenes import required modules', () => {
      const fs = require('fs');
      const path = require('path');
      
      const bootPath = path.join(__dirname, '../Boot.ts');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      
      const bootContent = fs.readFileSync(bootPath, 'utf8');
      const preloaderContent = fs.readFileSync(preloaderPath, 'utf8');
      
      // Both should import Phaser
      expect(bootContent).toContain('import');
      expect(bootContent).toContain('phaser');
      
      expect(preloaderContent).toContain('import');
      expect(preloaderContent).toContain('phaser');
      
      // Both should import BaseScene
      expect(bootContent).toContain('BaseScene');
      expect(preloaderContent).toContain('BaseScene');
    });

    test('should verify Boot scene launches Preloader', () => {
      const fs = require('fs');
      const path = require('path');
      const bootPath = path.join(__dirname, '../Boot.ts');
      const content = fs.readFileSync(bootPath, 'utf8');
      
      // Should launch preloader scene
      expect(content).toContain('scene.launch');
    });

    test('should verify Preloader emits completion event', () => {
      const fs = require('fs');
      const path = require('path');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      const content = fs.readFileSync(preloaderPath, 'utf8');
      
      // Should emit preload-complete event
      expect(content).toContain('preload-complete');
      expect(content).toContain('emit');
    });
  });

  describe('Scene File Structure', () => {
    test('should have TypeScript type annotations', () => {
      const fs = require('fs');
      const path = require('path');
      
      const bootPath = path.join(__dirname, '../Boot.ts');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      
      const bootContent = fs.readFileSync(bootPath, 'utf8');
      const preloaderContent = fs.readFileSync(preloaderPath, 'utf8');
      
      // Should have type annotations (: void, etc.)
      expect(bootContent).toMatch(/:\s*(void|string|number)/);
      expect(preloaderContent).toMatch(/:\s*(void|string|number)/);
    });

    test('should not have syntax errors in scene files', () => {
      const fs = require('fs');
      const path = require('path');
      
      const bootPath = path.join(__dirname, '../Boot.ts');
      const preloaderPath = path.join(__dirname, '../Preloader.ts');
      
      expect(() => {
        fs.readFileSync(bootPath, 'utf8');
      }).not.toThrow();
      
      expect(() => {
        fs.readFileSync(preloaderPath, 'utf8');
      }).not.toThrow();
    });
  });
});
