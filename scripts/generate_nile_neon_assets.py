#!/usr/bin/env python3
"""Generate Nile Neon pixel art assets matching the approved references.

Based on:
- concepts/05-nile-neon.png: Character style (magenta jacket Nour, tan mechanic Adel, teal hoodie Laila, dark armor guards)
- maps/ismailia/mockups/ismailia-2d-topdown.png: Night-time city with dark blue water, colonial buildings, neon signs, palm trees

Output:
- 24x32 character spritesheets (4 directions x 4 walk frames = 16 frames per character)
- 16x16 environment tiles with proper edges/transitions
- 64x64 character portraits with expressions
"""

from PIL import Image, ImageDraw
import os
from pathlib import Path

OUTPUT_DIR = Path("/workspace/public")

# Nile Neon palette - derived from the concept and map mockup
PALETTE = {
    # Base colors
    'black': (10, 10, 20),
    'dark_blue': (20, 30, 50),
    'night_sky': (25, 35, 55),
    
    # Water colors (from map mockup)
    'water_deep': (25, 55, 95),
    'water_mid': (35, 75, 120),
    'water_highlight': (55, 100, 150),
    'water_shimmer': (80, 140, 180),
    
    # Ground/terrain
    'sand_dark': (140, 115, 80),
    'sand_mid': (175, 145, 100),
    'sand_light': (200, 170, 120),
    'road_dark': (45, 45, 55),
    'road_mid': (65, 65, 75),
    'road_light': (85, 85, 95),
    'road_curb': (100, 100, 110),
    'grass_dark': (30, 60, 35),
    'grass_mid': (45, 80, 50),
    'grass_light': (60, 100, 65),
    
    # Buildings (colonial style from mockup)
    'roof_dark': (120, 55, 40),
    'roof_mid': (155, 75, 55),
    'roof_light': (180, 95, 70),
    'wall_dark': (80, 75, 70),
    'wall_mid': (120, 115, 105),
    'wall_light': (160, 150, 140),
    'window_dark': (20, 35, 55),
    'window_lit': (180, 160, 100),
    
    # Quay/pier
    'quay_dark': (60, 55, 50),
    'quay_mid': (90, 85, 75),
    'quay_light': (120, 110, 100),
    
    # Palm tree
    'trunk_dark': (70, 50, 35),
    'trunk_light': (100, 75, 50),
    'palm_dark': (25, 55, 30),
    'palm_mid': (40, 80, 45),
    'palm_light': (60, 100, 60),
    
    # Neon signs (key Nile Neon accents)
    'neon_magenta': (255, 50, 150),
    'neon_magenta_glow': (255, 100, 180),
    'neon_cyan': (50, 220, 255),
    'neon_cyan_glow': (100, 240, 255),
    'neon_purple': (180, 80, 255),
    'neon_orange': (255, 150, 50),
    
    # Street lamps (warm light)
    'lamp_glow': (255, 220, 150),
    'lamp_core': (255, 240, 200),
    
    # Character: Nour (magenta jacket courier)
    'nour_skin': (165, 120, 90),
    'nour_skin_shadow': (130, 90, 65),
    'nour_hair': (30, 25, 20),
    'nour_jacket': (200, 50, 120),
    'nour_jacket_dark': (150, 30, 90),
    'nour_jacket_light': (255, 80, 160),
    'nour_pants': (50, 50, 60),
    'nour_shoes': (40, 35, 35),
    
    # Character: Adel (mechanic, tan clothes)
    'adel_skin': (155, 115, 85),
    'adel_skin_shadow': (120, 85, 60),
    'adel_hair': (35, 30, 25),
    'adel_shirt': (160, 130, 90),
    'adel_shirt_dark': (130, 100, 70),
    'adel_shirt_light': (190, 160, 115),
    'adel_pants': (100, 85, 70),
    'adel_shoes': (60, 50, 40),
    
    # Drone Bulbul
    'drone_body': (80, 90, 100),
    'drone_light': (100, 200, 220),
    'drone_accent': (50, 180, 200),
    
    # Character: Laila (teal hoodie hacker)
    'laila_skin': (160, 120, 90),
    'laila_skin_shadow': (125, 90, 65),
    'laila_hair': (25, 20, 20),
    'laila_hoodie': (50, 140, 140),
    'laila_hoodie_dark': (35, 100, 100),
    'laila_hoodie_light': (70, 170, 170),
    'laila_pants': (45, 45, 55),
    'laila_shoes': (35, 35, 40),
    
    # Enemy guards (dark armor, orange visor)
    'enemy_armor': (40, 40, 50),
    'enemy_armor_dark': (25, 25, 35),
    'enemy_armor_light': (60, 60, 70),
    'enemy_visor': (255, 140, 50),
    'enemy_visor_glow': (255, 180, 100),
    
    # Railway
    'rail_dark': (50, 45, 45),
    'rail_light': (80, 75, 70),
    'rail_tie': (60, 50, 40),
    
    # Boats
    'boat_hull': (70, 55, 45),
    'boat_deck': (100, 85, 70),
}

def create_character_sprite(char_id: str, colors: dict) -> Image.Image:
    """Create a 24x32 character spritesheet with 4 directions x 4 walk frames.
    
    Layout: 4 columns (frames) x 4 rows (down, left, right, up)
    Total size: 96x128 pixels
    """
    sheet_width = 24 * 4  # 4 frames
    sheet_height = 32 * 4  # 4 directions
    sheet = Image.new('RGBA', (sheet_width, sheet_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    
    # Direction offsets for walk animation
    walk_offsets = [0, -1, 0, 1]  # Subtle bob
    leg_offsets = [0, 1, 0, -1]  # Leg movement
    
    for dir_idx, direction in enumerate(['down', 'left', 'right', 'up']):
        for frame_idx in range(4):
            x_base = frame_idx * 24
            y_base = dir_idx * 32
            
            walk_y = walk_offsets[frame_idx]
            leg_x = leg_offsets[frame_idx]
            
            draw_character_frame(draw, x_base, y_base, direction, frame_idx, 
                               colors, walk_y, leg_x, char_id)
    
    return sheet


def draw_character_frame(draw: ImageDraw.Draw, x: int, y: int, direction: str, 
                         frame: int, colors: dict, walk_y: int, leg_x: int, char_id: str):
    """Draw a single character frame at position (x, y)."""
    
    # Character dimensions in the 24x32 frame
    # Head: ~8x8, centered at top
    # Body: ~12x10
    # Legs: ~10x8
    
    skin = colors['skin']
    skin_shadow = colors['skin_shadow']
    hair = colors['hair']
    main = colors['main']
    main_dark = colors['main_dark']
    main_light = colors['main_light']
    pants = colors['pants']
    shoes = colors['shoes']
    
    # Adjust y for walk bob
    y = y + walk_y
    
    if direction == 'down':
        # Facing camera - full front view
        # Head (8x8 centered)
        draw.rectangle([x+8, y+2, x+15, y+9], fill=skin)
        draw.rectangle([x+8, y+2, x+15, y+4], fill=hair)  # Hair top
        draw.rectangle([x+9, y+5, x+10, y+6], fill=colors.get('eyes', (30, 30, 40)))  # Left eye
        draw.rectangle([x+13, y+5, x+14, y+6], fill=colors.get('eyes', (30, 30, 40)))  # Right eye
        
        # Body/jacket (12x10)
        draw.rectangle([x+6, y+10, x+17, y+19], fill=main)
        draw.rectangle([x+6, y+10, x+8, y+19], fill=main_dark)  # Left shadow
        draw.rectangle([x+15, y+10, x+17, y+19], fill=main_dark)  # Right shadow
        draw.rectangle([x+9, y+12, x+14, y+14], fill=main_light)  # Chest highlight
        
        # Arms
        draw.rectangle([x+4, y+10, x+6, y+17], fill=main_dark)  # Left arm
        draw.rectangle([x+17, y+10, x+19, y+17], fill=main_dark)  # Right arm
        draw.rectangle([x+4, y+17, x+6, y+18], fill=skin_shadow)  # Left hand
        draw.rectangle([x+17, y+17, x+19, y+18], fill=skin_shadow)  # Right hand
        
        # Legs/pants
        left_leg_x = x + 7 + (leg_x if frame % 2 == 0 else -leg_x)
        right_leg_x = x + 12 + (-leg_x if frame % 2 == 0 else leg_x)
        draw.rectangle([left_leg_x, y+20, left_leg_x+4, y+28], fill=pants)
        draw.rectangle([right_leg_x, y+20, right_leg_x+4, y+28], fill=pants)
        
        # Shoes
        draw.rectangle([left_leg_x, y+28, left_leg_x+4, y+31], fill=shoes)
        draw.rectangle([right_leg_x, y+28, right_leg_x+4, y+31], fill=shoes)
        
    elif direction == 'up':
        # Back view
        # Head (8x8 centered) - all hair visible
        draw.rectangle([x+8, y+2, x+15, y+9], fill=hair)
        draw.rectangle([x+9, y+8, x+14, y+9], fill=skin_shadow)  # Neck
        
        # Body/jacket back
        draw.rectangle([x+6, y+10, x+17, y+19], fill=main)
        draw.rectangle([x+10, y+10, x+13, y+19], fill=main_dark)  # Back crease
        
        # Arms
        draw.rectangle([x+4, y+10, x+6, y+17], fill=main_dark)
        draw.rectangle([x+17, y+10, x+19, y+17], fill=main_dark)
        
        # Legs - same as front
        left_leg_x = x + 7 + (leg_x if frame % 2 == 0 else -leg_x)
        right_leg_x = x + 12 + (-leg_x if frame % 2 == 0 else leg_x)
        draw.rectangle([left_leg_x, y+20, left_leg_x+4, y+28], fill=pants)
        draw.rectangle([right_leg_x, y+20, right_leg_x+4, y+28], fill=pants)
        draw.rectangle([left_leg_x, y+28, left_leg_x+4, y+31], fill=shoes)
        draw.rectangle([right_leg_x, y+28, right_leg_x+4, y+31], fill=shoes)
        
    elif direction == 'left':
        # Side view facing left
        # Head (6x8)
        draw.rectangle([x+7, y+2, x+13, y+9], fill=skin)
        draw.rectangle([x+7, y+2, x+13, y+4], fill=hair)
        draw.rectangle([x+7, y+5, x+8, y+6], fill=(30, 30, 40))  # Eye
        
        # Body
        draw.rectangle([x+8, y+10, x+15, y+19], fill=main)
        draw.rectangle([x+8, y+10, x+10, y+19], fill=main_dark)  # Shadow side
        
        # Far arm (behind)
        draw.rectangle([x+13, y+11, x+15, y+17], fill=main_dark)
        # Near arm (in front, moves with walk)
        arm_swing = leg_x * 2
        draw.rectangle([x+6, y+11+arm_swing, x+8, y+17+arm_swing], fill=main)
        draw.rectangle([x+6, y+17+arm_swing, x+8, y+18+arm_swing], fill=skin)
        
        # Legs - side view with walk
        front_leg_offset = leg_x * 2 if frame % 2 == 0 else -leg_x * 2
        back_leg_offset = -leg_x * 2 if frame % 2 == 0 else leg_x * 2
        
        # Back leg
        draw.rectangle([x+10, y+20+back_leg_offset, x+13, y+28], fill=pants)
        draw.rectangle([x+10, y+28, x+13, y+31], fill=shoes)
        # Front leg
        draw.rectangle([x+8, y+20+front_leg_offset, x+11, y+28], fill=pants)
        draw.rectangle([x+7, y+28, x+11, y+31], fill=shoes)
        
    elif direction == 'right':
        # Side view facing right (mirror of left)
        # Head
        draw.rectangle([x+10, y+2, x+16, y+9], fill=skin)
        draw.rectangle([x+10, y+2, x+16, y+4], fill=hair)
        draw.rectangle([x+15, y+5, x+16, y+6], fill=(30, 30, 40))  # Eye
        
        # Body
        draw.rectangle([x+8, y+10, x+15, y+19], fill=main)
        draw.rectangle([x+13, y+10, x+15, y+19], fill=main_dark)
        
        # Far arm (behind)
        draw.rectangle([x+8, y+11, x+10, y+17], fill=main_dark)
        # Near arm
        arm_swing = leg_x * 2
        draw.rectangle([x+15, y+11+arm_swing, x+17, y+17+arm_swing], fill=main)
        draw.rectangle([x+15, y+17+arm_swing, x+17, y+18+arm_swing], fill=skin)
        
        # Legs
        front_leg_offset = leg_x * 2 if frame % 2 == 0 else -leg_x * 2
        back_leg_offset = -leg_x * 2 if frame % 2 == 0 else leg_x * 2
        
        draw.rectangle([x+10, y+20+back_leg_offset, x+13, y+28], fill=pants)
        draw.rectangle([x+10, y+28, x+13, y+31], fill=shoes)
        draw.rectangle([x+12, y+20+front_leg_offset, x+15, y+28], fill=pants)
        draw.rectangle([x+12, y+28, x+16, y+31], fill=shoes)


def create_nour_sprite() -> Image.Image:
    colors = {
        'skin': PALETTE['nour_skin'],
        'skin_shadow': PALETTE['nour_skin_shadow'],
        'hair': PALETTE['nour_hair'],
        'main': PALETTE['nour_jacket'],
        'main_dark': PALETTE['nour_jacket_dark'],
        'main_light': PALETTE['nour_jacket_light'],
        'pants': PALETTE['nour_pants'],
        'shoes': PALETTE['nour_shoes'],
    }
    return create_character_sprite('nour', colors)


def create_adel_sprite() -> Image.Image:
    colors = {
        'skin': PALETTE['adel_skin'],
        'skin_shadow': PALETTE['adel_skin_shadow'],
        'hair': PALETTE['adel_hair'],
        'main': PALETTE['adel_shirt'],
        'main_dark': PALETTE['adel_shirt_dark'],
        'main_light': PALETTE['adel_shirt_light'],
        'pants': PALETTE['adel_pants'],
        'shoes': PALETTE['adel_shoes'],
    }
    return create_character_sprite('adel', colors)


def create_laila_sprite() -> Image.Image:
    colors = {
        'skin': PALETTE['laila_skin'],
        'skin_shadow': PALETTE['laila_skin_shadow'],
        'hair': PALETTE['laila_hair'],
        'main': PALETTE['laila_hoodie'],
        'main_dark': PALETTE['laila_hoodie_dark'],
        'main_light': PALETTE['laila_hoodie_light'],
        'pants': PALETTE['laila_pants'],
        'shoes': PALETTE['laila_shoes'],
    }
    return create_character_sprite('laila', colors)


def create_enemy_sprite() -> Image.Image:
    colors = {
        'skin': PALETTE['enemy_visor'],  # Visor visible instead of face
        'skin_shadow': PALETTE['enemy_visor_glow'],
        'hair': PALETTE['enemy_armor_dark'],  # Helmet
        'main': PALETTE['enemy_armor'],
        'main_dark': PALETTE['enemy_armor_dark'],
        'main_light': PALETTE['enemy_armor_light'],
        'pants': PALETTE['enemy_armor_dark'],
        'shoes': PALETTE['enemy_armor_dark'],
        'eyes': PALETTE['enemy_visor'],
    }
    return create_character_sprite('enemy', colors)


def create_drone_sprite() -> Image.Image:
    """Create Bulbul drone sprite (16x16 or 24x24)."""
    size = 16
    sheet = Image.new('RGBA', (size * 4, size * 2), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    
    for frame in range(4):
        x = frame * size
        y = 0
        
        # Hover offset
        hover = [0, -1, 0, 1][frame]
        
        # Main body (oval)
        draw.ellipse([x+3, y+5+hover, x+12, y+11+hover], fill=PALETTE['drone_body'])
        # Light/eye
        draw.ellipse([x+6, y+6+hover, x+9, y+9+hover], fill=PALETTE['drone_light'])
        # Propeller hints
        prop_offset = frame % 2
        draw.rectangle([x+1, y+4+hover-prop_offset, x+4, y+5+hover-prop_offset], 
                      fill=PALETTE['drone_accent'])
        draw.rectangle([x+11, y+4+hover+prop_offset, x+14, y+5+hover+prop_offset], 
                      fill=PALETTE['drone_accent'])
    
    return sheet


def create_tile(draw_func, size=16) -> Image.Image:
    """Create a single 16x16 tile."""
    tile = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(tile)
    draw_func(draw, 0, 0, size)
    return tile


def draw_water_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Dark blue water with subtle highlights."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['water_deep'])
    # Subtle wave highlights
    draw.line([x+2, y+4, x+6, y+4], fill=PALETTE['water_mid'])
    draw.line([x+8, y+8, x+13, y+8], fill=PALETTE['water_highlight'])
    draw.line([x+3, y+12, x+7, y+12], fill=PALETTE['water_mid'])


def draw_water_highlight_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Water with lamp reflection."""
    draw_water_tile(draw, x, y, size)
    # Add bright reflection
    draw.rectangle([x+6, y+6, x+9, y+9], fill=PALETTE['water_shimmer'])
    draw.rectangle([x+7, y+7, x+8, y+8], fill=PALETTE['lamp_glow'])


def draw_sand_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Sandy ground."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['sand_mid'])
    # Texture
    draw.point((x+3, y+5), fill=PALETTE['sand_light'])
    draw.point((x+10, y+3), fill=PALETTE['sand_dark'])
    draw.point((x+7, y+11), fill=PALETTE['sand_light'])
    draw.point((x+12, y+8), fill=PALETTE['sand_dark'])


def draw_road_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Road with subtle texture."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['road_mid'])
    # Subtle texture
    for i in range(0, size, 4):
        draw.point((x+i+1, y+2), fill=PALETTE['road_dark'])
        draw.point((x+i+3, y+10), fill=PALETTE['road_light'])


def draw_road_curb_top(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Road with curb on top edge."""
    draw_road_tile(draw, x, y, size)
    draw.rectangle([x, y, x+size-1, y+1], fill=PALETTE['road_curb'])


def draw_road_curb_bottom(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Road with curb on bottom edge."""
    draw_road_tile(draw, x, y, size)
    draw.rectangle([x, y+size-2, x+size-1, y+size-1], fill=PALETTE['road_curb'])


def draw_grass_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Dark grass for night scene."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['grass_dark'])
    # Grass texture
    for i in range(3):
        gx = x + (i * 5) + 2
        draw.line([gx, y+12, gx, y+8], fill=PALETTE['grass_mid'])
        draw.point((gx, y+7), fill=PALETTE['grass_light'])


def draw_quay_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Stone quay/pier."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['quay_mid'])
    # Stone blocks
    draw.line([x, y+7, x+size-1, y+7], fill=PALETTE['quay_dark'])
    draw.line([x+7, y, x+7, y+7], fill=PALETTE['quay_dark'])
    draw.line([x+3, y+8, x+3, y+size-1], fill=PALETTE['quay_dark'])
    draw.line([x+11, y+8, x+11, y+size-1], fill=PALETTE['quay_dark'])


def draw_quay_edge_bottom(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Quay with water edge at bottom."""
    draw_quay_tile(draw, x, y, size)
    # Water edge
    draw.rectangle([x, y+size-3, x+size-1, y+size-1], fill=PALETTE['quay_dark'])
    draw.rectangle([x, y+size-1, x+size-1, y+size-1], fill=PALETTE['water_mid'])


def draw_building_roof(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Colonial red tile roof (top part of building)."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['roof_mid'])
    # Tile rows
    for row in range(0, size, 3):
        draw.line([x, y+row, x+size-1, y+row], fill=PALETTE['roof_dark'])
        offset = (row // 3) % 2 * 4
        for col in range(offset, size, 8):
            draw.line([x+col, y+row, x+col, y+row+2], fill=PALETTE['roof_dark'])


def draw_building_wall(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Building wall with window."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['wall_mid'])
    # Shadow on left
    draw.rectangle([x, y, x+1, y+size-1], fill=PALETTE['wall_dark'])
    # Window
    draw.rectangle([x+4, y+3, x+11, y+10], fill=PALETTE['window_dark'])
    draw.rectangle([x+5, y+4, x+10, y+9], fill=PALETTE['window_lit'])
    # Window cross
    draw.line([x+4, y+6, x+11, y+6], fill=PALETTE['wall_dark'])
    draw.line([x+7, y+3, x+7, y+10], fill=PALETTE['wall_dark'])


def draw_building_wall_dark(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Building wall without window (shadowed)."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['wall_dark'])
    # Slight texture
    draw.point((x+4, y+6), fill=PALETTE['wall_mid'])
    draw.point((x+10, y+10), fill=PALETTE['wall_mid'])


def draw_palm_tree(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Palm tree top (fronds)."""
    # Transparent base
    draw.rectangle([x, y, x+size-1, y+size-1], fill=(0, 0, 0, 0))
    # Trunk bottom
    draw.rectangle([x+6, y+10, x+9, y+15], fill=PALETTE['trunk_dark'])
    draw.rectangle([x+7, y+10, x+8, y+15], fill=PALETTE['trunk_light'])
    # Fronds spreading out
    # Center frond up
    draw.polygon([(x+7, y+2), (x+8, y+2), (x+9, y+10), (x+6, y+10)], fill=PALETTE['palm_mid'])
    # Left fronds
    draw.polygon([(x+1, y+5), (x+3, y+4), (x+7, y+10), (x+6, y+10)], fill=PALETTE['palm_dark'])
    draw.polygon([(x+2, y+8), (x+4, y+7), (x+7, y+11), (x+6, y+11)], fill=PALETTE['palm_mid'])
    # Right fronds
    draw.polygon([(x+14, y+5), (x+12, y+4), (x+8, y+10), (x+9, y+10)], fill=PALETTE['palm_dark'])
    draw.polygon([(x+13, y+8), (x+11, y+7), (x+8, y+11), (x+9, y+11)], fill=PALETTE['palm_mid'])


def draw_neon_sign_magenta(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Neon sign (magenta glow)."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['wall_dark'])
    # Neon glow background
    draw.rectangle([x+2, y+3, x+13, y+12], fill=PALETTE['neon_magenta_glow'])
    # Bright center
    draw.rectangle([x+3, y+4, x+12, y+11], fill=PALETTE['neon_magenta'])
    # Simple shape (like Arabic letter or symbol)
    draw.rectangle([x+5, y+5, x+10, y+6], fill=PALETTE['wall_dark'])
    draw.rectangle([x+5, y+9, x+10, y+10], fill=PALETTE['wall_dark'])
    draw.rectangle([x+5, y+6, x+6, y+9], fill=PALETTE['wall_dark'])


def draw_neon_sign_cyan(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Neon sign (cyan glow)."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['wall_dark'])
    draw.rectangle([x+2, y+3, x+13, y+12], fill=PALETTE['neon_cyan_glow'])
    draw.rectangle([x+3, y+4, x+12, y+11], fill=PALETTE['neon_cyan'])
    # Different shape
    draw.ellipse([x+5, y+5, x+10, y+10], fill=PALETTE['wall_dark'])


def draw_street_lamp(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Street lamp with warm glow."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=(0, 0, 0, 0))
    # Pole
    draw.rectangle([x+7, y+6, x+8, y+15], fill=PALETTE['rail_dark'])
    # Lamp head
    draw.rectangle([x+5, y+3, x+10, y+6], fill=PALETTE['rail_light'])
    # Glow
    draw.ellipse([x+4, y+0, x+11, y+5], fill=PALETTE['lamp_glow'])
    draw.ellipse([x+5, y+1, x+10, y+4], fill=PALETTE['lamp_core'])


def draw_railway_track(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Railway tracks (horizontal)."""
    draw.rectangle([x, y, x+size-1, y+size-1], fill=PALETTE['sand_dark'])
    # Rails
    draw.rectangle([x, y+4, x+size-1, y+5], fill=PALETTE['rail_light'])
    draw.rectangle([x, y+10, x+size-1, y+11], fill=PALETTE['rail_light'])
    # Ties
    for i in range(0, size, 4):
        draw.rectangle([x+i+1, y+3, x+i+2, y+12], fill=PALETTE['rail_tie'])


def draw_bridge_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Bridge over water."""
    # Water underneath
    draw_water_tile(draw, x, y, size)
    # Bridge planks
    draw.rectangle([x+2, y, x+13, y+size-1], fill=PALETTE['quay_mid'])
    draw.line([x+5, y, x+5, y+size-1], fill=PALETTE['quay_dark'])
    draw.line([x+10, y, x+10, y+size-1], fill=PALETTE['quay_dark'])
    # Railings
    draw.rectangle([x+1, y, x+2, y+size-1], fill=PALETTE['rail_dark'])
    draw.rectangle([x+13, y, x+14, y+size-1], fill=PALETTE['rail_dark'])


def draw_boat_tile(draw: ImageDraw.Draw, x: int, y: int, size: int):
    """Small boat on water."""
    draw_water_tile(draw, x, y, size)
    # Boat hull
    draw.polygon([(x+2, y+10), (x+13, y+10), (x+11, y+14), (x+4, y+14)], 
                fill=PALETTE['boat_hull'])
    # Deck
    draw.rectangle([x+4, y+8, x+11, y+10], fill=PALETTE['boat_deck'])


def create_portrait(char_id: str, colors: dict, expression: str = 'neutral') -> Image.Image:
    """Create a 64x64 character portrait."""
    portrait = Image.new('RGBA', (64, 64), PALETTE['dark_blue'])
    draw = ImageDraw.Draw(portrait)
    
    skin = colors['skin']
    skin_shadow = colors['skin_shadow']
    hair = colors['hair']
    main = colors['main']
    main_dark = colors['main_dark']
    
    # Face (larger, more detailed)
    # Head shape
    draw.ellipse([16, 8, 48, 44], fill=skin)
    
    # Hair
    draw.ellipse([14, 4, 50, 28], fill=hair)
    draw.rectangle([14, 20, 50, 28], fill=skin)  # Clear lower part
    
    # Face shadows
    draw.ellipse([16, 10, 24, 44], fill=skin_shadow)
    draw.ellipse([40, 10, 48, 44], fill=skin_shadow)
    
    # Eyes
    eye_y = 22
    if expression == 'concerned':
        # Worried eyes (narrowed)
        draw.ellipse([22, eye_y, 28, eye_y+5], fill=(255, 255, 255))
        draw.ellipse([36, eye_y, 42, eye_y+5], fill=(255, 255, 255))
        draw.ellipse([24, eye_y+1, 27, eye_y+4], fill=(30, 30, 40))
        draw.ellipse([37, eye_y+1, 40, eye_y+4], fill=(30, 30, 40))
        # Furrowed brow
        draw.line([20, eye_y-2, 28, eye_y-4], fill=hair, width=2)
        draw.line([44, eye_y-2, 36, eye_y-4], fill=hair, width=2)
    elif expression == 'happy':
        # Happy eyes (curved up)
        draw.arc([22, eye_y, 28, eye_y+8], 180, 360, fill=(30, 30, 40), width=2)
        draw.arc([36, eye_y, 42, eye_y+8], 180, 360, fill=(30, 30, 40), width=2)
    else:  # neutral
        draw.ellipse([22, eye_y, 28, eye_y+6], fill=(255, 255, 255))
        draw.ellipse([36, eye_y, 42, eye_y+6], fill=(255, 255, 255))
        draw.ellipse([24, eye_y+1, 27, eye_y+5], fill=(30, 30, 40))
        draw.ellipse([37, eye_y+1, 40, eye_y+5], fill=(30, 30, 40))
        draw.point((25, eye_y+2), fill=(255, 255, 255))
        draw.point((38, eye_y+2), fill=(255, 255, 255))
    
    # Nose
    draw.line([32, 28, 32, 34], fill=skin_shadow)
    draw.line([30, 34, 34, 34], fill=skin_shadow)
    
    # Mouth
    mouth_y = 38
    if expression == 'happy':
        draw.arc([26, mouth_y-2, 38, mouth_y+4], 0, 180, fill=(120, 60, 60), width=2)
    elif expression == 'concerned':
        draw.arc([26, mouth_y, 38, mouth_y+6], 180, 360, fill=(120, 60, 60), width=2)
    else:
        draw.line([28, mouth_y, 36, mouth_y], fill=(120, 60, 60), width=2)
    
    # Clothing (collar/shoulders)
    draw.rectangle([8, 46, 56, 63], fill=main)
    draw.rectangle([8, 46, 20, 63], fill=main_dark)
    draw.rectangle([44, 46, 56, 63], fill=main_dark)
    # Collar
    draw.polygon([(28, 44), (36, 44), (38, 52), (32, 56), (26, 52)], fill=main_dark)
    
    # Neck
    draw.rectangle([28, 42, 36, 48], fill=skin_shadow)
    
    return portrait


def create_all_portraits(char_id: str, colors: dict) -> dict:
    """Create all expression variants for a character."""
    expressions = ['neutral', 'happy', 'concerned']
    return {expr: create_portrait(char_id, colors, expr) for expr in expressions}


def save_tileset():
    """Create and save the complete tileset."""
    tiles_dir = OUTPUT_DIR / "tiles"
    tiles_dir.mkdir(parents=True, exist_ok=True)
    
    tile_defs = {
        'water': draw_water_tile,
        'water_highlight': draw_water_highlight_tile,
        'sand': draw_sand_tile,
        'road': draw_road_tile,
        'road_curb_top': draw_road_curb_top,
        'road_curb_bottom': draw_road_curb_bottom,
        'grass': draw_grass_tile,
        'quay': draw_quay_tile,
        'quay_edge': draw_quay_edge_bottom,
        'building_roof': draw_building_roof,
        'building_wall': draw_building_wall,
        'building_wall_dark': draw_building_wall_dark,
        'palm': draw_palm_tree,
        'neon_magenta': draw_neon_sign_magenta,
        'neon_cyan': draw_neon_sign_cyan,
        'lamp': draw_street_lamp,
        'railway': draw_railway_track,
        'bridge': draw_bridge_tile,
        'boat': draw_boat_tile,
    }
    
    for name, draw_func in tile_defs.items():
        tile = create_tile(draw_func)
        tile.save(tiles_dir / f"{name}.png")
        print(f"  Saved tile: {name}.png")


def save_characters():
    """Create and save character sprites."""
    sprites_dir = OUTPUT_DIR / "sprites"
    sprites_dir.mkdir(parents=True, exist_ok=True)
    
    # Main characters
    nour = create_nour_sprite()
    nour.save(sprites_dir / "nour.png")
    print("  Saved sprite: nour.png (96x128, 4 directions x 4 frames)")
    
    adel = create_adel_sprite()
    adel.save(sprites_dir / "adel.png")
    print("  Saved sprite: adel.png")
    
    laila = create_laila_sprite()
    laila.save(sprites_dir / "laila.png")
    print("  Saved sprite: laila.png")
    
    enemy = create_enemy_sprite()
    enemy.save(sprites_dir / "enemy.png")
    print("  Saved sprite: enemy.png")
    
    # Drone
    drone = create_drone_sprite()
    drone.save(sprites_dir / "bulbul.png")
    print("  Saved sprite: bulbul.png (Adel's drone)")


def save_portraits():
    """Create and save character portraits."""
    portraits_dir = OUTPUT_DIR / "portraits"
    portraits_dir.mkdir(parents=True, exist_ok=True)
    
    char_colors = {
        'nour': {
            'skin': PALETTE['nour_skin'],
            'skin_shadow': PALETTE['nour_skin_shadow'],
            'hair': PALETTE['nour_hair'],
            'main': PALETTE['nour_jacket'],
            'main_dark': PALETTE['nour_jacket_dark'],
        },
        'adel': {
            'skin': PALETTE['adel_skin'],
            'skin_shadow': PALETTE['adel_skin_shadow'],
            'hair': PALETTE['adel_hair'],
            'main': PALETTE['adel_shirt'],
            'main_dark': PALETTE['adel_shirt_dark'],
        },
        'laila': {
            'skin': PALETTE['laila_skin'],
            'skin_shadow': PALETTE['laila_skin_shadow'],
            'hair': PALETTE['laila_hair'],
            'main': PALETTE['laila_hoodie'],
            'main_dark': PALETTE['laila_hoodie_dark'],
        },
        'enemy': {
            'skin': PALETTE['enemy_visor'],
            'skin_shadow': PALETTE['enemy_visor_glow'],
            'hair': PALETTE['enemy_armor_dark'],
            'main': PALETTE['enemy_armor'],
            'main_dark': PALETTE['enemy_armor_dark'],
        },
    }
    
    # Also add NPC portraits
    npc_colors = {
        'umm_sayed': {
            'skin': (150, 115, 85),
            'skin_shadow': (120, 90, 65),
            'hair': (40, 35, 30),
            'main': (100, 70, 60),  # Brown headscarf
            'main_dark': (70, 50, 45),
        },
        'karim': {
            'skin': (160, 120, 90),
            'skin_shadow': (130, 95, 70),
            'hair': (30, 25, 20),
            'main': (80, 80, 90),  # Grey shirt
            'main_dark': (60, 60, 70),
        },
        'hajj_rashid': {
            'skin': (145, 110, 80),
            'skin_shadow': (115, 85, 60),
            'hair': (200, 200, 200),  # Grey/white hair
            'main': (90, 85, 80),  # Beige robe
            'main_dark': (70, 65, 60),
        },
    }
    char_colors.update(npc_colors)
    
    for char_id, colors in char_colors.items():
        portraits = create_all_portraits(char_id, colors)
        for expr, portrait in portraits.items():
            portrait.save(portraits_dir / f"{char_id}_{expr}.png")
        print(f"  Saved portraits: {char_id}_*.png (3 expressions)")


def save_pwa_icons():
    """Create PWA icons."""
    icons_dir = OUTPUT_DIR
    
    # Create a simple icon with the Nile Neon look
    for size in [192, 512]:
        icon = Image.new('RGBA', (size, size), PALETTE['dark_blue'])
        draw = ImageDraw.Draw(icon)
        
        # Background gradient effect
        for y in range(size):
            alpha = int(255 * (1 - y / size * 0.3))
            draw.line([0, y, size, y], fill=(*PALETTE['night_sky'], alpha))
        
        # Simple pyramid/grid symbol
        margin = size // 8
        center = size // 2
        
        # Neon grid lines
        for i in range(5):
            y = margin + i * (size - 2*margin) // 4
            draw.line([margin, y, size-margin, y], fill=PALETTE['neon_cyan'], width=max(1, size//64))
        
        # Pyramid shape
        draw.polygon([
            (center, margin),
            (size - margin, size - margin),
            (margin, size - margin)
        ], outline=PALETTE['neon_magenta'], width=max(2, size//32))
        
        # "NG" text would go here, but keeping it simple
        
        icon.save(icons_dir / f"pwa-{size}x{size}.png")
        print(f"  Saved icon: pwa-{size}x{size}.png")
    
    # Apple touch icon
    icon_192 = Image.open(icons_dir / "pwa-192x192.png")
    icon_180 = icon_192.resize((180, 180), Image.Resampling.NEAREST)
    icon_180.save(icons_dir / "apple-touch-icon.png")
    print("  Saved icon: apple-touch-icon.png")


def main():
    print("Generating Nile Neon assets...")
    print(f"Output directory: {OUTPUT_DIR}")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / "tiles").mkdir(exist_ok=True)
    (OUTPUT_DIR / "sprites").mkdir(exist_ok=True)
    (OUTPUT_DIR / "portraits").mkdir(exist_ok=True)
    
    print("\nCreating tiles...")
    save_tileset()
    
    print("\nCreating character sprites...")
    save_characters()
    
    print("\nCreating portraits...")
    save_portraits()
    
    print("\nCreating PWA icons...")
    save_pwa_icons()
    
    print("\nDone! Assets saved to", OUTPUT_DIR)


if __name__ == "__main__":
    main()
