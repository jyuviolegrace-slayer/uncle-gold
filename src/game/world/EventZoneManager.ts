import { Scene, GameObjects, Geom } from 'phaser';
import { Coordinate } from './GridUtils';
import { EventBus } from '../EventBus';

export interface EventZoneConfig {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'entrance' | 'event' | 'warp' | 'interaction';
  data?: Record<string, any>;
}

/**
 * Manages event zones on the map (entrances, events, warps, etc.)
 */
export class EventZoneManager {
  private scene: Scene;
  private zones: Map<string, { config: EventZoneConfig; zone: GameObjects.Zone }> = new Map();
  private playerInZones: Set<string> = new Set();
  private debugGraphics?: GameObjects.Graphics;
  private enableDebug: boolean = false;

  constructor(scene: Scene, enableDebug: boolean = false) {
    this.scene = scene;
    this.enableDebug = enableDebug;

    if (enableDebug) {
      this.debugGraphics = this.scene.add.graphics({
        lineStyle: { width: 2, color: 0x00ff00 },
      });
    }
  }

  /**
   * Add an event zone
   */
  addZone(config: EventZoneConfig): void {
    const zone = this.scene.add.zone(
      config.x + config.width / 2,
      config.y + config.height / 2,
      config.width,
      config.height
    );

    zone.setData('zoneId', config.id);
    zone.setData('zoneName', config.name);
    zone.setData('zoneType', config.type);
    zone.setData('zoneData', config.data);

    this.zones.set(config.id, { config, zone });

    if (this.enableDebug && this.debugGraphics) {
      const rect = new Geom.Rectangle(config.x, config.y, config.width, config.height);
      this.debugGraphics.strokeRectShape(rect);
    }
  }

  /**
   * Check zone overlap with player
   */
  checkPlayerInZone(playerPos: Coordinate, playerRadius: number = 16): void {
    const currentZones = new Set<string>();

    for (const [zoneId, { config }] of this.zones.entries()) {
      const zoneRect = new Geom.Rectangle(config.x, config.y, config.width, config.height);
      const playerCircle = new Geom.Circle(playerPos.x, playerPos.y, playerRadius);

      if (Geom.Intersects.CircleToRectangle(playerCircle, zoneRect)) {
        currentZones.add(zoneId);

        // First time entering zone
        if (!this.playerInZones.has(zoneId)) {
          this.handleZoneEnter(zoneId);
        }
      }
    }

    // Check for zones we left
    for (const zoneId of this.playerInZones) {
      if (!currentZones.has(zoneId)) {
        this.handleZoneExit(zoneId);
      }
    }

    this.playerInZones = currentZones;
  }

  /**
   * Handle zone entry
   */
  private handleZoneEnter(zoneId: string): void {
    const zoneData = this.zones.get(zoneId);
    if (!zoneData) return;

    const { config } = zoneData;

    switch (config.type) {
      case 'entrance':
        EventBus.emit('zone:entrance-enter', {
          zoneId: config.id,
          zoneName: config.name,
          data: config.data,
        });
        break;
      case 'event':
        EventBus.emit('zone:event-trigger', {
          zoneId: config.id,
          zoneName: config.name,
          data: config.data,
        });
        break;
      case 'warp':
        EventBus.emit('zone:warp-trigger', {
          zoneId: config.id,
          zoneName: config.name,
          data: config.data,
        });
        break;
      case 'interaction':
        EventBus.emit('zone:interaction-enter', {
          zoneId: config.id,
          zoneName: config.name,
          data: config.data,
        });
        break;
    }
  }

  /**
   * Handle zone exit
   */
  private handleZoneExit(zoneId: string): void {
    const zoneData = this.zones.get(zoneId);
    if (!zoneData) return;

    const { config } = zoneData;

    EventBus.emit('zone:exit', {
      zoneId: config.id,
      zoneName: config.name,
    });
  }

  /**
   * Get zone by ID
   */
  getZone(zoneId: string): EventZoneConfig | undefined {
    return this.zones.get(zoneId)?.config;
  }

  /**
   * Get all zones
   */
  getAllZones(): EventZoneConfig[] {
    return Array.from(this.zones.values()).map(z => z.config);
  }

  /**
   * Remove zone
   */
  removeZone(zoneId: string): void {
    const zoneData = this.zones.get(zoneId);
    if (zoneData) {
      zoneData.zone.destroy();
      this.zones.delete(zoneId);
    }
  }

  /**
   * Clear all zones
   */
  clear(): void {
    for (const [, { zone }] of this.zones.entries()) {
      zone.destroy();
    }
    this.zones.clear();
    this.playerInZones.clear();
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.clear();
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
  }
}
