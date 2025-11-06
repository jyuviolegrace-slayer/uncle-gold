import { Scene } from 'phaser';
import { Coordinate } from '../models/common';
import { EventDetails } from '../models/events';
import { DataManager, DataManagerStoreKeys } from '../services/DataManager';
import { dataLoader } from '../data/DataLoader';

export interface EventZoneConfig {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  eventData: EventDetails;
}

export class EventZoneManager {
  private scene: Scene;
  private eventZones: Record<string, Phaser.GameObjects.Zone> = {};
  private debugEventZoneObjects: Record<string, Phaser.GameObjects.Rectangle> = {};
  private rectangleForOverlapCheck1: Phaser.Geom.Rectangle;
  private rectangleForOverlapCheck2: Phaser.Geom.Rectangle;
  private rectangleOverlapResult: Phaser.Geom.Rectangle;
  private gfx?: Phaser.GameObjects.Graphics;
  private debugEnabled: boolean;

  constructor(scene: Scene, debugEnabled: boolean = false) {
    this.scene = scene;
    this.debugEnabled = debugEnabled;
    this.rectangleForOverlapCheck1 = new Phaser.Geom.Rectangle();
    this.rectangleForOverlapCheck2 = new Phaser.Geom.Rectangle();
    this.rectangleOverlapResult = new Phaser.Geom.Rectangle();

    if (this.debugEnabled) {
      this.gfx = this.scene.add.graphics({ lineStyle: { width: 4, color: 0x00ffff } });
    }
  }

  createEventZone(config: EventZoneConfig): void {
    const eventZone = this.scene.add
      .zone(config.x, config.y, config.width, config.height)
      .setOrigin(0)
      .setName(config.id);
    
    this.eventZones[config.id] = eventZone;

    if (this.debugEnabled) {
      const debugZoneRectangle = this.scene.add
        .rectangle(eventZone.x, eventZone.y, eventZone.width, eventZone.height, 0xff0000, 0.5)
        .setOrigin(0);
      this.debugEventZoneObjects[config.id] = debugZoneRectangle;
    }
  }

  checkPlayerOverlap(playerPosition: Coordinate): string | null {
    const playerBounds = new Phaser.Geom.Rectangle(
      playerPosition.x,
      playerPosition.y,
      64, // Assuming 64x64 tile size for player bounds
      64
    );

    for (const [zoneId, zone] of Object.entries(this.eventZones)) {
      // Get the bounds of the player and zone for checking for overlap
      const zoneBounds = zone.getBounds(this.rectangleForOverlapCheck2);

      // Reset rectangle overlap size, needed since method below will
      // return the original rectangle unmodified if a previous match was found
      this.rectangleOverlapResult.setSize(0, 0);
      Phaser.Geom.Intersects.GetRectangleIntersection(
        playerBounds,
        zoneBounds,
        this.rectangleOverlapResult
      );

      if (this.debugEnabled && this.gfx) {
        // For debugging the overlap checks for the events
        this.gfx.clear();
        this.gfx.strokeRectShape(this.rectangleOverlapResult);
      }

      const isOverlapping =
        this.rectangleOverlapResult.width >= 54 && this.rectangleOverlapResult.height >= 54; // TILE_SIZE - 10

      if (isOverlapping) {
        const eventId = parseInt(zone.name, 10);
        const eventData = dataLoader.getEventData(eventId.toString());
        if (!eventData) {
          continue;
        }

        const dataManager = this.scene.registry.get('dataManager') as DataManager;
        const currentGameFlags = dataManager.getFlags();
        const eventRequirementsMet = eventData.requires.every((flag) => {
          return currentGameFlags.has(flag);
        });

        if (eventRequirementsMet) {
          return zoneId;
        }
      }
    }

    return null;
  }

  removeEventZone(zoneId: string): void {
    const zone = this.eventZones[zoneId];
    if (zone) {
      zone.destroy();
      delete this.eventZones[zoneId];
    }

    if (this.debugEnabled) {
      const debugZone = this.debugEventZoneObjects[zoneId];
      if (debugZone) {
        debugZone.destroy();
        delete this.debugEventZoneObjects[zoneId];
      }
      if (this.gfx) {
        this.gfx.clear();
      }
    }
  }

  markEventAsViewed(eventId: string): void {
    const dataManager = this.scene.registry.get('dataManager') as DataManager;
    dataManager.viewedEvent(parseInt(eventId, 10));
  }

  update(): void {
    // This method can be used for any per-frame updates needed for event zones
    // Currently, overlap checks are done on-demand
  }

  destroy(): void {
    // Clean up all event zones
    Object.values(this.eventZones).forEach(zone => zone.destroy());
    this.eventZones = {};

    // Clean up debug objects
    Object.values(this.debugEventZoneObjects).forEach(obj => obj.destroy());
    this.debugEventZoneObjects = {};

    if (this.gfx) {
      this.gfx.destroy();
    }
  }
}