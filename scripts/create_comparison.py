#!/usr/bin/env python3
"""Create a comparison image showing the reference mockup and in-game screenshot side by side."""

from PIL import Image, ImageDraw, ImageFont
import os

def create_comparison():
    # Load reference images
    ref_map = Image.open('/workspace/uploads/pixel-game/maps/ismailia/mockups/ismailia-2d-topdown.png')
    ref_concept = Image.open('/workspace/uploads/pixel-game/concepts/processed/05-nile-neon-grid.png')
    
    # Load some generated tiles to show
    tiles_dir = '/workspace/public/tiles'
    sprites_dir = '/workspace/public/sprites'
    
    # Create a sample of our generated tiles
    tile_names = ['water', 'sand', 'road', 'building_roof', 'building_wall', 'quay', 'palm', 'neon_magenta', 'lamp']
    tiles = []
    for name in tile_names:
        tile_path = os.path.join(tiles_dir, f'{name}.png')
        if os.path.exists(tile_path):
            tiles.append(Image.open(tile_path))
    
    # Load character sprites
    sprites = []
    for char in ['nour', 'adel', 'laila', 'enemy']:
        sprite_path = os.path.join(sprites_dir, f'{char}.png')
        if os.path.exists(sprite_path):
            sprites.append(Image.open(sprite_path))
    
    # Create comparison canvas
    # Layout: Reference mockup on left, our tiles/sprites on right
    canvas_width = 1200
    canvas_height = 800
    canvas = Image.new('RGB', (canvas_width, canvas_height), (26, 26, 46))
    draw = ImageDraw.Draw(canvas)
    
    # Title
    draw.text((canvas_width // 2, 10), "Nile Grid Art Comparison", fill=(255, 255, 255), anchor="mt")
    
    # Left side: Reference mockup (scaled)
    ref_scaled = ref_map.resize((500, 350), Image.Resampling.NEAREST)
    canvas.paste(ref_scaled, (30, 60))
    draw.text((280, 420), "Reference: ismailia-2d-topdown.png", fill=(200, 200, 200), anchor="mt")
    
    # Character concept below
    ref_concept_scaled = ref_concept.resize((320, 160), Image.Resampling.NEAREST)
    canvas.paste(ref_concept_scaled, (120, 450))
    draw.text((280, 620), "Reference: 05-nile-neon-grid.png", fill=(200, 200, 200), anchor="mt")
    
    # Right side: Our generated assets
    # Tiles grid
    tile_size = 48  # Display at 3x scale
    tile_start_x = 580
    tile_start_y = 60
    
    draw.text((tile_start_x + 150, tile_start_y - 20), "Generated Tiles (16x16, shown 3x)", fill=(200, 200, 200), anchor="mt")
    
    for i, tile in enumerate(tiles):
        row = i // 3
        col = i % 3
        scaled = tile.resize((tile_size, tile_size), Image.Resampling.NEAREST)
        x = tile_start_x + col * (tile_size + 10)
        y = tile_start_y + row * (tile_size + 10)
        canvas.paste(scaled, (x, y), scaled if scaled.mode == 'RGBA' else None)
    
    # Sprites
    sprite_start_y = 280
    draw.text((tile_start_x + 200, sprite_start_y - 20), "Generated Characters (24x32 spritesheets)", fill=(200, 200, 200), anchor="mt")
    
    sprite_x = tile_start_x
    for i, sprite in enumerate(sprites):
        # Show first 4 frames (down walk cycle)
        frame_width = 24
        frame_height = 32
        display_scale = 3
        
        # Extract first row (down direction)
        row_sprite = sprite.crop((0, 0, 96, 32))
        scaled = row_sprite.resize((96 * display_scale, 32 * display_scale), Image.Resampling.NEAREST)
        canvas.paste(scaled, (sprite_x, sprite_start_y), scaled if scaled.mode == 'RGBA' else None)
        
        # Character name
        names = ['Nour', 'Adel', 'Laila', 'Enemy']
        draw.text((sprite_x + 144, sprite_start_y + 100), names[i], fill=(200, 200, 200), anchor="mt")
        
        sprite_x += 96 * display_scale + 20
    
    # Style notes
    notes_y = 500
    draw.text((tile_start_x, notes_y), "Style Matching:", fill=(255, 100, 180))
    notes = [
        "• Night-time dark palette",
        "• Dark blue water with highlights",
        "• Colonial red-roof buildings (3/4 view)",
        "• Neon signs (magenta/cyan)",
        "• Palm trees and street lamps",
        "• 4-direction character walk cycles",
        "• Proper top-down perspective"
    ]
    for i, note in enumerate(notes):
        draw.text((tile_start_x, notes_y + 25 + i * 20), note, fill=(180, 180, 180))
    
    # Save
    output_path = '/opt/cursor/artifacts/nile-grid-art-comparison.png'
    canvas.save(output_path)
    print(f"Saved comparison to {output_path}")
    
    return output_path

if __name__ == "__main__":
    create_comparison()
