import { describe, it, expect } from 'vitest';
import { MapProjection, ismailiaProjection, ismailiaLevelBounds } from './MapProjection';

describe('MapProjection', () => {
  describe('coordinate conversion', () => {
    it('should convert origin coordinates to zero meters', () => {
      const origin = { lat: 30.59193, lon: 32.28185 };
      const meters = ismailiaProjection.geoToMeters(origin);
      
      expect(meters.x).toBeCloseTo(0, 0);
      expect(meters.y).toBeCloseTo(0, 0);
    });

    it('should convert east of origin to positive x', () => {
      const eastPoint = { lat: 30.59193, lon: 32.29 };
      const meters = ismailiaProjection.geoToMeters(eastPoint);
      
      expect(meters.x).toBeGreaterThan(0);
      expect(meters.y).toBeCloseTo(0, 0);
    });

    it('should convert south of origin to positive y', () => {
      const southPoint = { lat: 30.58, lon: 32.28185 };
      const meters = ismailiaProjection.geoToMeters(southPoint);
      
      expect(meters.x).toBeCloseTo(0, 0);
      expect(meters.y).toBeGreaterThan(0);
    });

    it('should convert railway station to correct approximate position', () => {
      const railwayStation = { lat: 30.59337, lon: 32.27008 };
      const meters = ismailiaProjection.geoToMeters(railwayStation);
      
      expect(meters.x).toBeCloseTo(-1128, 0);
      expect(meters.y).toBeCloseTo(-159, 0);
    });
  });

  describe('tile conversion', () => {
    it('should convert meters to tiles at ~3.5m/tile', () => {
      const meters = { x: 35, y: 35 };
      const tile = ismailiaProjection.metersToTile(meters);
      
      expect(tile.x).toBe(10);
      expect(tile.y).toBe(10);
    });

    it('should convert tiles to pixels at 16px/tile', () => {
      const tile = { x: 10, y: 10 };
      const pixels = ismailiaProjection.tileToPixels(tile);
      
      expect(pixels.x).toBe(160);
      expect(pixels.y).toBe(160);
    });
  });

  describe('map size calculation', () => {
    it('should calculate Ismailia map size correctly', () => {
      const size = ismailiaProjection.getMapSize(ismailiaLevelBounds);
      
      expect(size.tiles.w).toBeGreaterThan(1400);
      expect(size.tiles.w).toBeLessThan(1600);
      
      expect(size.tiles.h).toBeGreaterThan(700);
      expect(size.tiles.h).toBeLessThan(900);
    });

    it('should respect the ~5 minute crossing time requirement', () => {
      const size = ismailiaProjection.getMapSize(ismailiaLevelBounds);
      const tilesPerSecond = 5;
      const crossingTimeSeconds = size.tiles.w / tilesPerSecond;
      const crossingTimeMinutes = crossingTimeSeconds / 60;
      
      expect(crossingTimeMinutes).toBeGreaterThan(4);
      expect(crossingTimeMinutes).toBeLessThan(6);
    });
  });

  describe('custom projection', () => {
    it('should work with different meters per tile', () => {
      const customProjection = new MapProjection({
        origin: { lat: 30.59193, lon: 32.28185 },
        metersPerTile: 10,
        tileSize: 16
      });

      const meters = { x: 100, y: 100 };
      const tile = customProjection.metersToTile(meters);
      
      expect(tile.x).toBe(10);
      expect(tile.y).toBe(10);
    });
  });
});
