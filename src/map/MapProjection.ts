export interface GeoCoordinate {
  lat: number;
  lon: number;
}

export interface TileCoordinate {
  x: number;
  y: number;
}

export interface LevelBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapProjectionConfig {
  origin: GeoCoordinate;
  metersPerTile: number;
  tileSize: number;
}

export class MapProjection {
  private origin: GeoCoordinate;
  private metersPerTile: number;
  private tileSize: number;
  
  private cosLat: number;
  
  static readonly METERS_PER_DEGREE_LAT = 110574;
  static readonly METERS_PER_DEGREE_LON_EQUATOR = 111320;
  
  constructor(config: MapProjectionConfig) {
    this.origin = config.origin;
    this.metersPerTile = config.metersPerTile;
    this.tileSize = config.tileSize;
    this.cosLat = Math.cos(this.origin.lat * Math.PI / 180);
  }
  
  geoToMeters(coord: GeoCoordinate): { x: number; y: number } {
    const dLon = coord.lon - this.origin.lon;
    const dLat = coord.lat - this.origin.lat;
    
    const x = dLon * MapProjection.METERS_PER_DEGREE_LON_EQUATOR * this.cosLat;
    const y = -dLat * MapProjection.METERS_PER_DEGREE_LAT;
    
    return { x, y };
  }
  
  metersToTile(meters: { x: number; y: number }): TileCoordinate {
    return {
      x: Math.floor(meters.x / this.metersPerTile),
      y: Math.floor(meters.y / this.metersPerTile)
    };
  }
  
  geoToTile(coord: GeoCoordinate): TileCoordinate {
    const meters = this.geoToMeters(coord);
    return this.metersToTile(meters);
  }
  
  geoToPixels(coord: GeoCoordinate): { x: number; y: number } {
    const tile = this.geoToTile(coord);
    return {
      x: tile.x * this.tileSize,
      y: tile.y * this.tileSize
    };
  }
  
  metersToPixels(meters: { x: number; y: number }): { x: number; y: number } {
    return {
      x: (meters.x / this.metersPerTile) * this.tileSize,
      y: (meters.y / this.metersPerTile) * this.tileSize
    };
  }
  
  tileToPixels(tile: TileCoordinate): { x: number; y: number } {
    return {
      x: tile.x * this.tileSize,
      y: tile.y * this.tileSize
    };
  }
  
  pixelsToTile(pixels: { x: number; y: number }): TileCoordinate {
    return {
      x: Math.floor(pixels.x / this.tileSize),
      y: Math.floor(pixels.y / this.tileSize)
    };
  }
  
  boundsToPixels(bounds: LevelBounds): { 
    x: number; 
    y: number; 
    width: number; 
    height: number 
  } {
    const nw = this.geoToPixels({ lat: bounds.north, lon: bounds.west });
    const se = this.geoToPixels({ lat: bounds.south, lon: bounds.east });
    
    return {
      x: nw.x,
      y: nw.y,
      width: se.x - nw.x,
      height: se.y - nw.y
    };
  }
  
  getMapSize(bounds: LevelBounds): { tiles: { w: number; h: number }; pixels: { w: number; h: number } } {
    const widthMeters = (bounds.east - bounds.west) * MapProjection.METERS_PER_DEGREE_LON_EQUATOR * this.cosLat;
    const heightMeters = (bounds.north - bounds.south) * MapProjection.METERS_PER_DEGREE_LAT;
    
    const tilesW = Math.ceil(widthMeters / this.metersPerTile);
    const tilesH = Math.ceil(heightMeters / this.metersPerTile);
    
    return {
      tiles: { w: tilesW, h: tilesH },
      pixels: { w: tilesW * this.tileSize, h: tilesH * this.tileSize }
    };
  }
}

export const ismailiaProjection = new MapProjection({
  origin: { lat: 30.59193, lon: 32.28185 },
  metersPerTile: 3.5,
  tileSize: 16
});

export const ismailiaLevelBounds: LevelBounds = {
  north: 30.6035,
  south: 30.578,
  west: 32.262,
  east: 32.316
};
