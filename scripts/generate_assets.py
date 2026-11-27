#!/usr/bin/env python3
"""Generate pixel art assets for Nile Grid following the Nile Neon direction.

Creates:
- 24x32 character sprites with 4 walk frames (down, left, right, up)
- 16x16 tile sprites
- 64x64 character portraits
- PWA icons (192x192 and 512x512)
"""

from PIL import Image, ImageDraw
import os

OUTPUT_DIR = "/workspace/public"

# Nile Neon color palette extracted from concept
PALETTE = {
    # Skin tones
    'skin_light': (198, 156, 109),
    'skin_mid': (166, 124, 82),
    'skin_dark': (130, 95, 66),
    'skin_shadow': (95, 70, 50),
    
    # Nour - Courier (magenta LED jacket)
    'nour_jacket': (255, 0, 255),
    'nour_jacket_dark': (180, 0, 180),
    'nour_jacket_glow': (255, 100, 255),
    'nour_pants': (50, 45, 55),
    'nour_hair': (30, 25, 35),
    
    # Adel - Mechanic (brown/tan)
    'adel_shirt': (139, 115, 85),
    'adel_shirt_dark': (100, 80, 60),
    'adel_pants': (90, 75, 60),
    'adel_hair': (40, 30, 25),
    'adel_drone': (100, 180, 200),
    
    # Laila - Hacker (teal hoodie)
    'laila_hoodie': (0, 180, 180),
    'laila_hoodie_dark': (0, 130, 130),
    'laila_hoodie_light': (50, 210, 210),
    'laila_pants': (45, 50, 55),
    'laila_scarf': (180, 160, 140),
    
    # Enemy - Horus Corp Security (dark armor)
    'enemy_armor': (60, 55, 65),
    'enemy_armor_dark': (40, 35, 45),
    'enemy_visor': (255, 50, 50),
    'enemy_accent': (80, 70, 85),
    
    # Environment
    'road': (70, 65, 75),
    'road_line': (200, 180, 100),
    'sand': (200, 175, 130),
    'sand_dark': (170, 145, 100),
    'building': (100, 95, 110),
    'building_dark': (70, 65, 80),
    'building_window': (0, 200, 200),
    'water': (40, 90, 140),
    'water_light': (60, 120, 170),
    'canal_stone': (130, 120, 110),
    'bridge_metal': (90, 85, 80),
    'grass': (60, 100, 50),
    
    # UI
    'neon_magenta': (255, 0, 255),
    'neon_cyan': (0, 255, 255),
    'neon_gold': (255, 215, 0),
    'dark_bg': (26, 26, 46),
}


def create_character_sprite(char_id: str, frame: int = 0, direction: str = 'down') -> Image.Image:
    """Create a 24x32 character sprite."""
    img = Image.new('RGBA', (24, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Animation offset for walking
    leg_offset = [0, 1, 0, -1][frame % 4]
    arm_offset = [0, -1, 0, 1][frame % 4]
    body_bob = [0, -1, 0, -1][frame % 4]
    
    if char_id == 'nour':
        draw_nour(draw, leg_offset, arm_offset, body_bob, direction)
    elif char_id == 'adel':
        draw_adel(draw, leg_offset, arm_offset, body_bob, direction)
    elif char_id == 'laila':
        draw_laila(draw, leg_offset, arm_offset, body_bob, direction)
    elif char_id == 'enemy':
        draw_enemy(draw, leg_offset, arm_offset, body_bob, direction)
    
    return img


def draw_nour(draw, leg_off, arm_off, bob, direction):
    """Draw Nour - courier with magenta LED jacket."""
    # Head
    draw.rectangle([9, 2 + bob, 15, 10 + bob], fill=PALETTE['skin_mid'])
    draw.rectangle([10, 3 + bob, 14, 9 + bob], fill=PALETTE['skin_light'])
    # Hair
    draw.rectangle([9, 1 + bob, 15, 4 + bob], fill=PALETTE['nour_hair'])
    draw.rectangle([8, 2 + bob, 9, 5 + bob], fill=PALETTE['nour_hair'])
    draw.rectangle([15, 2 + bob, 16, 5 + bob], fill=PALETTE['nour_hair'])
    
    # Eyes (direction-dependent)
    if direction == 'down':
        draw.point((11, 6 + bob), fill=(255, 255, 255))
        draw.point((13, 6 + bob), fill=(255, 255, 255))
    elif direction == 'left':
        draw.point((10, 6 + bob), fill=(255, 255, 255))
    elif direction == 'right':
        draw.point((14, 6 + bob), fill=(255, 255, 255))
    
    # Magenta LED Jacket - the signature look
    draw.rectangle([7, 10 + bob, 17, 20 + bob], fill=PALETTE['nour_jacket_dark'])
    draw.rectangle([8, 11 + bob, 16, 19 + bob], fill=PALETTE['nour_jacket'])
    # LED stripe
    draw.line([(8, 13 + bob), (16, 13 + bob)], fill=PALETTE['nour_jacket_glow'], width=1)
    draw.line([(8, 16 + bob), (16, 16 + bob)], fill=PALETTE['nour_jacket_glow'], width=1)
    
    # Arms
    draw.rectangle([5 + arm_off, 11 + bob, 7, 18 + bob], fill=PALETTE['nour_jacket'])
    draw.rectangle([17, 11 + bob, 19 - arm_off, 18 + bob], fill=PALETTE['nour_jacket'])
    # Hands
    draw.rectangle([5 + arm_off, 17 + bob, 7, 19 + bob], fill=PALETTE['skin_mid'])
    draw.rectangle([17, 17 + bob, 19 - arm_off, 19 + bob], fill=PALETTE['skin_mid'])
    
    # Pants
    draw.rectangle([9, 20 + bob, 15, 26], fill=PALETTE['nour_pants'])
    
    # Legs
    draw.rectangle([9, 26, 11, 31 + leg_off], fill=PALETTE['nour_pants'])
    draw.rectangle([13, 26, 15, 31 - leg_off], fill=PALETTE['nour_pants'])
    
    # Shoes
    draw.rectangle([8, 30 + leg_off, 11, 32], fill=(30, 30, 30))
    draw.rectangle([13, 30 - leg_off, 16, 32], fill=(30, 30, 30))


def draw_adel(draw, leg_off, arm_off, bob, direction):
    """Draw Adel - mechanic with drone."""
    # Head
    draw.rectangle([9, 2 + bob, 15, 10 + bob], fill=PALETTE['skin_mid'])
    draw.rectangle([10, 3 + bob, 14, 9 + bob], fill=PALETTE['skin_light'])
    # Hair/cap
    draw.rectangle([9, 1 + bob, 15, 4 + bob], fill=PALETTE['adel_hair'])
    draw.rectangle([8, 3 + bob, 16, 4 + bob], fill=(80, 70, 60))  # cap brim
    
    # Eyes
    if direction == 'down':
        draw.point((11, 6 + bob), fill=(255, 255, 255))
        draw.point((13, 6 + bob), fill=(255, 255, 255))
    elif direction == 'left':
        draw.point((10, 6 + bob), fill=(255, 255, 255))
    elif direction == 'right':
        draw.point((14, 6 + bob), fill=(255, 255, 255))
    
    # Work shirt
    draw.rectangle([7, 10 + bob, 17, 20 + bob], fill=PALETTE['adel_shirt_dark'])
    draw.rectangle([8, 11 + bob, 16, 19 + bob], fill=PALETTE['adel_shirt'])
    # Pocket detail
    draw.rectangle([10, 14 + bob, 14, 17 + bob], fill=PALETTE['adel_shirt_dark'])
    
    # Drone Bolbol on shoulder
    draw.ellipse([17, 8 + bob, 22, 12 + bob], fill=PALETTE['adel_drone'])
    draw.point((19, 9 + bob), fill=(255, 100, 100))  # drone eye
    
    # Arms (thicker, mechanic)
    draw.rectangle([5 + arm_off, 11 + bob, 8, 18 + bob], fill=PALETTE['adel_shirt'])
    draw.rectangle([16, 11 + bob, 19 - arm_off, 18 + bob], fill=PALETTE['adel_shirt'])
    # Hands
    draw.rectangle([5 + arm_off, 17 + bob, 8, 20 + bob], fill=PALETTE['skin_mid'])
    draw.rectangle([16, 17 + bob, 19 - arm_off, 20 + bob], fill=PALETTE['skin_mid'])
    
    # Pants
    draw.rectangle([8, 20 + bob, 16, 26], fill=PALETTE['adel_pants'])
    
    # Legs (sturdy)
    draw.rectangle([8, 26, 11, 31 + leg_off], fill=PALETTE['adel_pants'])
    draw.rectangle([13, 26, 16, 31 - leg_off], fill=PALETTE['adel_pants'])
    
    # Work boots
    draw.rectangle([7, 30 + leg_off, 11, 32], fill=(50, 40, 35))
    draw.rectangle([13, 30 - leg_off, 17, 32], fill=(50, 40, 35))


def draw_laila(draw, leg_off, arm_off, bob, direction):
    """Draw Laila - hacker with teal hoodie."""
    # Hood up
    draw.rectangle([7, 1 + bob, 17, 11 + bob], fill=PALETTE['laila_hoodie_dark'])
    draw.rectangle([8, 2 + bob, 16, 10 + bob], fill=PALETTE['laila_hoodie'])
    
    # Face visible in hood
    draw.rectangle([9, 4 + bob, 15, 10 + bob], fill=PALETTE['skin_mid'])
    draw.rectangle([10, 5 + bob, 14, 9 + bob], fill=PALETTE['skin_light'])
    
    # Eyes
    if direction == 'down':
        draw.point((11, 7 + bob), fill=(255, 255, 255))
        draw.point((13, 7 + bob), fill=(255, 255, 255))
    elif direction == 'left':
        draw.point((10, 7 + bob), fill=(255, 255, 255))
    elif direction == 'right':
        draw.point((14, 7 + bob), fill=(255, 255, 255))
    
    # Keffiyeh scarf
    draw.rectangle([8, 9 + bob, 16, 12 + bob], fill=PALETTE['laila_scarf'])
    
    # Hoodie body
    draw.rectangle([6, 11 + bob, 18, 21 + bob], fill=PALETTE['laila_hoodie_dark'])
    draw.rectangle([7, 12 + bob, 17, 20 + bob], fill=PALETTE['laila_hoodie'])
    # Hoodie pocket
    draw.rectangle([9, 16 + bob, 15, 19 + bob], fill=PALETTE['laila_hoodie_dark'])
    # Cyan glow detail
    draw.line([(8, 14 + bob), (16, 14 + bob)], fill=PALETTE['laila_hoodie_light'], width=1)
    
    # Arms (slimmer)
    draw.rectangle([4 + arm_off, 12 + bob, 6, 18 + bob], fill=PALETTE['laila_hoodie'])
    draw.rectangle([18, 12 + bob, 20 - arm_off, 18 + bob], fill=PALETTE['laila_hoodie'])
    # Hands with device
    draw.rectangle([4 + arm_off, 17 + bob, 6, 19 + bob], fill=PALETTE['skin_mid'])
    draw.rectangle([18, 17 + bob, 20 - arm_off, 19 + bob], fill=PALETTE['skin_mid'])
    # Small hacking device in hand
    draw.rectangle([2 + arm_off, 18 + bob, 5 + arm_off, 20 + bob], fill=(50, 50, 60))
    draw.point((3 + arm_off, 19 + bob), fill=PALETTE['neon_cyan'])
    
    # Pants
    draw.rectangle([9, 21 + bob, 15, 26], fill=PALETTE['laila_pants'])
    
    # Legs
    draw.rectangle([9, 26, 11, 31 + leg_off], fill=PALETTE['laila_pants'])
    draw.rectangle([13, 26, 15, 31 - leg_off], fill=PALETTE['laila_pants'])
    
    # Sneakers
    draw.rectangle([8, 30 + leg_off, 11, 32], fill=(40, 45, 50))
    draw.rectangle([13, 30 - leg_off, 16, 32], fill=(40, 45, 50))


def draw_enemy(draw, leg_off, arm_off, bob, direction):
    """Draw Horus Corp Security - dark armor with red visor."""
    # Helmet
    draw.rectangle([8, 1 + bob, 16, 10 + bob], fill=PALETTE['enemy_armor_dark'])
    draw.rectangle([9, 2 + bob, 15, 9 + bob], fill=PALETTE['enemy_armor'])
    
    # Red visor (the Eye)
    draw.rectangle([9, 5 + bob, 15, 7 + bob], fill=PALETTE['enemy_visor'])
    draw.line([(10, 6 + bob), (14, 6 + bob)], fill=(255, 150, 150), width=1)
    
    # Armor body
    draw.rectangle([6, 10 + bob, 18, 21 + bob], fill=PALETTE['enemy_armor_dark'])
    draw.rectangle([7, 11 + bob, 17, 20 + bob], fill=PALETTE['enemy_armor'])
    # Armor plates
    draw.line([(8, 13 + bob), (16, 13 + bob)], fill=PALETTE['enemy_accent'], width=1)
    draw.line([(8, 17 + bob), (16, 17 + bob)], fill=PALETTE['enemy_accent'], width=1)
    # Horus Corp emblem hint
    draw.point((12, 15 + bob), fill=PALETTE['enemy_visor'])
    
    # Armored arms
    draw.rectangle([4 + arm_off, 11 + bob, 6, 19 + bob], fill=PALETTE['enemy_armor'])
    draw.rectangle([18, 11 + bob, 20 - arm_off, 19 + bob], fill=PALETTE['enemy_armor'])
    # Gauntlets
    draw.rectangle([4 + arm_off, 17 + bob, 6, 20 + bob], fill=PALETTE['enemy_armor_dark'])
    draw.rectangle([18, 17 + bob, 20 - arm_off, 20 + bob], fill=PALETTE['enemy_armor_dark'])
    
    # Armored legs
    draw.rectangle([8, 21 + bob, 16, 26], fill=PALETTE['enemy_armor'])
    draw.rectangle([8, 26, 11, 31 + leg_off], fill=PALETTE['enemy_armor'])
    draw.rectangle([13, 26, 16, 31 - leg_off], fill=PALETTE['enemy_armor'])
    
    # Boots
    draw.rectangle([7, 30 + leg_off, 11, 32], fill=PALETTE['enemy_armor_dark'])
    draw.rectangle([13, 30 - leg_off, 17, 32], fill=PALETTE['enemy_armor_dark'])


def create_tile(tile_type: str) -> Image.Image:
    """Create a 16x16 tile sprite."""
    img = Image.new('RGBA', (16, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    if tile_type == 'road':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['road'])
        # Road markings
        for i in range(0, 16, 4):
            draw.rectangle([7, i, 8, i + 2], fill=PALETTE['road_line'])
        # Texture
        draw.point((3, 5), fill=(80, 75, 85))
        draw.point((11, 9), fill=(60, 55, 65))
        draw.point((6, 13), fill=(80, 75, 85))
    
    elif tile_type == 'sand':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['sand'])
        # Texture variation
        for i in range(0, 16, 3):
            for j in range(0, 16, 4):
                if (i + j) % 5 == 0:
                    draw.point((i, j), fill=PALETTE['sand_dark'])
    
    elif tile_type == 'building':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['building'])
        draw.rectangle([1, 1, 14, 14], fill=PALETTE['building_dark'])
        # Windows with neon glow
        draw.rectangle([3, 3, 6, 6], fill=PALETTE['building_window'])
        draw.rectangle([9, 3, 12, 6], fill=PALETTE['building_window'])
        draw.rectangle([3, 9, 6, 12], fill=PALETTE['building_window'])
        draw.rectangle([9, 9, 12, 12], fill=PALETTE['building_window'])
    
    elif tile_type == 'water':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['water'])
        # Wave highlights
        draw.line([(0, 4), (5, 4)], fill=PALETTE['water_light'])
        draw.line([(8, 8), (14, 8)], fill=PALETTE['water_light'])
        draw.line([(2, 12), (7, 12)], fill=PALETTE['water_light'])
    
    elif tile_type == 'canal':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['water'])
        # Canal edges (stone walls)
        draw.rectangle([0, 0, 2, 15], fill=PALETTE['canal_stone'])
        draw.rectangle([13, 0, 15, 15], fill=PALETTE['canal_stone'])
        # Water
        draw.line([(4, 5), (11, 5)], fill=PALETTE['water_light'])
        draw.line([(5, 10), (10, 10)], fill=PALETTE['water_light'])
    
    elif tile_type == 'bridge':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['bridge_metal'])
        # Metal grating
        for i in range(0, 16, 3):
            draw.line([(i, 0), (i, 15)], fill=(70, 65, 60))
        for j in range(0, 16, 4):
            draw.line([(0, j), (15, j)], fill=(70, 65, 60))
        # Rivets
        draw.point((2, 2), fill=(110, 105, 100))
        draw.point((13, 2), fill=(110, 105, 100))
        draw.point((2, 13), fill=(110, 105, 100))
        draw.point((13, 13), fill=(110, 105, 100))
    
    elif tile_type == 'grass':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['grass'])
        # Grass blades
        draw.point((3, 2), fill=(70, 120, 60))
        draw.point((7, 5), fill=(50, 90, 40))
        draw.point((11, 3), fill=(70, 120, 60))
        draw.point((5, 10), fill=(50, 90, 40))
        draw.point((13, 12), fill=(70, 120, 60))
    
    elif tile_type == 'building_wall':
        draw.rectangle([0, 0, 15, 15], fill=PALETTE['building'])
        # Brick pattern
        for y in range(0, 16, 4):
            offset = 4 if (y // 4) % 2 else 0
            for x in range(-4 + offset, 16, 8):
                draw.rectangle([x, y, x + 6, y + 3], outline=(90, 85, 100))
    
    return img


def create_portrait(char_id: str, emotion: str = 'neutral') -> Image.Image:
    """Create a 64x64 character portrait for dialogue."""
    img = Image.new('RGBA', (64, 64), PALETTE['dark_bg'])
    draw = ImageDraw.Draw(img)
    
    # Border based on character
    if char_id == 'nour':
        border_color = PALETTE['neon_magenta']
    elif char_id == 'adel':
        border_color = PALETTE['neon_gold']
    elif char_id == 'laila':
        border_color = PALETTE['neon_cyan']
    else:
        border_color = PALETTE['enemy_visor']
    
    # Neon border
    draw.rectangle([0, 0, 63, 63], outline=border_color, width=2)
    draw.rectangle([2, 2, 61, 61], outline=border_color)
    
    if char_id == 'nour':
        draw_nour_portrait(draw, emotion)
    elif char_id == 'adel':
        draw_adel_portrait(draw, emotion)
    elif char_id == 'laila':
        draw_laila_portrait(draw, emotion)
    elif char_id == 'enemy':
        draw_enemy_portrait(draw, emotion)
    elif char_id == 'umm_sayed':
        draw_npc_portrait(draw, 'umm_sayed')
    elif char_id == 'karim':
        draw_npc_portrait(draw, 'karim')
    elif char_id == 'hajj_rashid':
        draw_npc_portrait(draw, 'hajj_rashid')
    
    return img


def draw_nour_portrait(draw, emotion):
    """Draw Nour's portrait."""
    # Hair
    draw.rectangle([16, 8, 48, 20], fill=PALETTE['nour_hair'])
    draw.rectangle([14, 12, 50, 18], fill=PALETTE['nour_hair'])
    
    # Face
    draw.ellipse([18, 14, 46, 48], fill=PALETTE['skin_mid'])
    draw.ellipse([20, 16, 44, 46], fill=PALETTE['skin_light'])
    
    # Eyes
    eye_y = 28 if emotion == 'concerned' else 26
    draw.ellipse([24, eye_y, 30, eye_y + 6], fill=(255, 255, 255))
    draw.ellipse([34, eye_y, 40, eye_y + 6], fill=(255, 255, 255))
    draw.ellipse([26, eye_y + 2, 29, eye_y + 5], fill=(40, 30, 30))
    draw.ellipse([36, eye_y + 2, 39, eye_y + 5], fill=(40, 30, 30))
    
    # Eyebrows
    if emotion == 'concerned':
        draw.line([(24, 24), (30, 26)], fill=PALETTE['nour_hair'], width=2)
        draw.line([(34, 26), (40, 24)], fill=PALETTE['nour_hair'], width=2)
    else:
        draw.line([(24, 24), (30, 24)], fill=PALETTE['nour_hair'], width=2)
        draw.line([(34, 24), (40, 24)], fill=PALETTE['nour_hair'], width=2)
    
    # Mouth
    if emotion == 'happy':
        draw.arc([28, 36, 36, 42], 0, 180, fill=PALETTE['skin_dark'], width=2)
    else:
        draw.line([(28, 40), (36, 40)], fill=PALETTE['skin_dark'], width=2)
    
    # Jacket collar (magenta LED)
    draw.rectangle([18, 48, 46, 60], fill=PALETTE['nour_jacket'])
    draw.line([(20, 52), (44, 52)], fill=PALETTE['nour_jacket_glow'], width=2)


def draw_adel_portrait(draw, emotion):
    """Draw Adel's portrait."""
    # Cap
    draw.rectangle([14, 10, 50, 18], fill=(80, 70, 60))
    draw.rectangle([12, 16, 52, 20], fill=(70, 60, 50))
    
    # Face (wider, friendly)
    draw.ellipse([16, 16, 48, 50], fill=PALETTE['skin_mid'])
    draw.ellipse([18, 18, 46, 48], fill=PALETTE['skin_light'])
    
    # Eyes
    draw.ellipse([22, 28, 28, 34], fill=(255, 255, 255))
    draw.ellipse([36, 28, 42, 34], fill=(255, 255, 255))
    draw.ellipse([24, 30, 27, 33], fill=(40, 30, 30))
    draw.ellipse([38, 30, 41, 33], fill=(40, 30, 30))
    
    # Warm smile
    if emotion == 'happy':
        draw.arc([26, 38, 38, 46], 0, 180, fill=PALETTE['skin_dark'], width=2)
    else:
        draw.arc([28, 40, 36, 44], 0, 180, fill=PALETTE['skin_dark'], width=2)
    
    # Stubble hint
    draw.point((26, 44), fill=PALETTE['skin_shadow'])
    draw.point((32, 46), fill=PALETTE['skin_shadow'])
    draw.point((38, 44), fill=PALETTE['skin_shadow'])
    
    # Collar
    draw.rectangle([16, 50, 48, 62], fill=PALETTE['adel_shirt'])
    
    # Bolbol drone peeking
    draw.ellipse([46, 6, 58, 16], fill=PALETTE['adel_drone'])
    draw.point((52, 10), fill=(255, 100, 100))


def draw_laila_portrait(draw, emotion):
    """Draw Laila's portrait."""
    # Hood
    draw.ellipse([12, 6, 52, 50], fill=PALETTE['laila_hoodie_dark'])
    draw.ellipse([14, 8, 50, 48], fill=PALETTE['laila_hoodie'])
    
    # Face in hood
    draw.ellipse([18, 16, 46, 46], fill=PALETTE['skin_mid'])
    draw.ellipse([20, 18, 44, 44], fill=PALETTE['skin_light'])
    
    # Eyes (sharp, observant)
    draw.ellipse([24, 28, 30, 33], fill=(255, 255, 255))
    draw.ellipse([34, 28, 40, 33], fill=(255, 255, 255))
    draw.ellipse([26, 29, 29, 32], fill=(40, 40, 45))
    draw.ellipse([36, 29, 39, 32], fill=(40, 40, 45))
    
    # Keffiyeh
    draw.rectangle([20, 40, 44, 48], fill=PALETTE['laila_scarf'])
    
    # Subtle expression
    if emotion == 'neutral':
        draw.line([(28, 38), (36, 38)], fill=PALETTE['skin_dark'], width=1)
    
    # Hood detail
    draw.arc([14, 8, 50, 30], 180, 0, fill=PALETTE['laila_hoodie_light'], width=2)
    
    # Cyan glow accent
    draw.line([(16, 50), (48, 50)], fill=PALETTE['neon_cyan'], width=1)


def draw_enemy_portrait(draw, _emotion):
    """Draw enemy portrait (Horus Corp Security)."""
    # Helmet
    draw.ellipse([14, 8, 50, 50], fill=PALETTE['enemy_armor_dark'])
    draw.ellipse([16, 10, 48, 48], fill=PALETTE['enemy_armor'])
    
    # Visor (The Eye)
    draw.rectangle([18, 24, 46, 36], fill=PALETTE['enemy_visor'])
    draw.line([(20, 28), (44, 28)], fill=(255, 150, 150), width=2)
    draw.line([(20, 32), (44, 32)], fill=(255, 150, 150), width=2)
    
    # Eye symbol
    draw.ellipse([28, 28, 36, 34], fill=(255, 200, 200))
    draw.ellipse([30, 30, 34, 32], fill=(200, 50, 50))
    
    # Helmet details
    draw.line([(20, 20), (44, 20)], fill=PALETTE['enemy_accent'], width=1)
    draw.line([(20, 40), (44, 40)], fill=PALETTE['enemy_accent'], width=1)
    
    # Armor collar
    draw.rectangle([16, 48, 48, 62], fill=PALETTE['enemy_armor'])


def draw_npc_portrait(draw, npc_id):
    """Draw NPC portraits."""
    # Simple civilian portraits
    draw.ellipse([18, 14, 46, 48], fill=PALETTE['skin_mid'])
    draw.ellipse([20, 16, 44, 46], fill=PALETTE['skin_light'])
    
    if npc_id == 'umm_sayed':
        # Headscarf
        draw.ellipse([14, 8, 50, 46], fill=(180, 100, 80))
        draw.ellipse([18, 14, 46, 44], fill=PALETTE['skin_light'])
        # Kind eyes
        draw.ellipse([24, 26, 30, 32], fill=(40, 30, 30))
        draw.ellipse([34, 26, 40, 32], fill=(40, 30, 30))
        # Warm smile
        draw.arc([26, 36, 38, 44], 0, 180, fill=PALETTE['skin_dark'], width=2)
    
    elif npc_id == 'karim':
        # Young man, streetwise
        draw.rectangle([16, 8, 48, 18], fill=(30, 25, 25))  # dark hair
        draw.ellipse([24, 26, 30, 32], fill=(255, 255, 255))
        draw.ellipse([34, 26, 40, 32], fill=(255, 255, 255))
        draw.line([(28, 40), (36, 40)], fill=PALETTE['skin_dark'], width=1)
    
    elif npc_id == 'hajj_rashid':
        # Older man, retired pilot
        draw.rectangle([16, 8, 48, 18], fill=(180, 180, 180))  # grey hair
        draw.rectangle([16, 42, 48, 50], fill=(200, 200, 200))  # beard
        draw.ellipse([24, 26, 30, 32], fill=(40, 30, 30))
        draw.ellipse([34, 26, 40, 32], fill=(40, 30, 30))


def create_pwa_icon(size: int) -> Image.Image:
    """Create PWA icon with Nile Grid logo."""
    img = Image.new('RGBA', (size, size), PALETTE['dark_bg'])
    draw = ImageDraw.Draw(img)
    
    # Background with gradient effect
    for i in range(size // 2):
        alpha = int(100 - i * 0.5)
        draw.rectangle([i, i, size - 1 - i, size - 1 - i], outline=(*PALETTE['neon_magenta'][:3], alpha))
    
    # Nile symbol (stylized wave)
    center = size // 2
    wave_height = size // 6
    wave_width = size // 3
    
    # Water waves
    draw.arc([center - wave_width, center - wave_height, center + wave_width, center + wave_height * 2], 
             0, 180, fill=PALETTE['neon_cyan'], width=max(2, size // 32))
    draw.arc([center - wave_width + size // 8, center, center + wave_width - size // 8, center + wave_height * 3], 
             0, 180, fill=PALETTE['water_light'], width=max(2, size // 32))
    
    # Grid pattern (cyberpunk)
    grid_size = size // 8
    for i in range(1, 8):
        x = i * grid_size
        draw.line([(x, size // 4), (x, size * 3 // 4)], fill=(*PALETTE['neon_magenta'][:3], 60), width=1)
        draw.line([(size // 4, x), (size * 3 // 4, x)], fill=(*PALETTE['neon_magenta'][:3], 60), width=1)
    
    # "NG" letters
    letter_size = size // 4
    letter_x = center - letter_size
    letter_y = center - letter_size // 2
    
    # N
    draw.line([(letter_x, letter_y + letter_size), (letter_x, letter_y)], fill=PALETTE['neon_magenta'], width=max(2, size // 48))
    draw.line([(letter_x, letter_y), (letter_x + letter_size // 2, letter_y + letter_size)], fill=PALETTE['neon_magenta'], width=max(2, size // 48))
    draw.line([(letter_x + letter_size // 2, letter_y + letter_size), (letter_x + letter_size // 2, letter_y)], fill=PALETTE['neon_magenta'], width=max(2, size // 48))
    
    # G
    g_x = center + size // 16
    draw.arc([g_x, letter_y, g_x + letter_size, letter_y + letter_size], 45, 315, fill=PALETTE['neon_cyan'], width=max(2, size // 48))
    draw.line([(g_x + letter_size // 2, letter_y + letter_size // 2), (g_x + letter_size, letter_y + letter_size // 2)], fill=PALETTE['neon_cyan'], width=max(2, size // 48))
    
    # Outer border glow
    for i in range(3):
        draw.rectangle([i, i, size - 1 - i, size - 1 - i], outline=PALETTE['neon_magenta'])
    
    return img


def create_spritesheet(char_id: str) -> Image.Image:
    """Create a spritesheet with all animation frames."""
    # 4 directions x 4 frames = 16 frames total
    # Arranged as 4 rows (down, left, right, up) x 4 columns (frames)
    sheet = Image.new('RGBA', (24 * 4, 32 * 4), (0, 0, 0, 0))
    
    directions = ['down', 'left', 'right', 'up']
    for dir_idx, direction in enumerate(directions):
        for frame in range(4):
            sprite = create_character_sprite(char_id, frame, direction)
            sheet.paste(sprite, (frame * 24, dir_idx * 32))
    
    return sheet


def main():
    os.makedirs(f"{OUTPUT_DIR}/sprites", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/tiles", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/portraits", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/icons", exist_ok=True)
    
    # Generate character spritesheets
    print("Generating character spritesheets...")
    for char_id in ['nour', 'adel', 'laila', 'enemy']:
        sheet = create_spritesheet(char_id)
        sheet.save(f"{OUTPUT_DIR}/sprites/{char_id}.png")
        print(f"  Created {char_id}.png (96x128, 16 frames)")
    
    # Generate tiles
    print("Generating tile sprites...")
    tiles = ['road', 'sand', 'building', 'water', 'canal', 'bridge', 'grass', 'building_wall']
    for tile_type in tiles:
        tile = create_tile(tile_type)
        tile.save(f"{OUTPUT_DIR}/tiles/{tile_type}.png")
        print(f"  Created {tile_type}.png (16x16)")
    
    # Generate portraits
    print("Generating character portraits...")
    characters = ['nour', 'adel', 'laila', 'enemy', 'umm_sayed', 'karim', 'hajj_rashid']
    emotions = ['neutral', 'happy', 'concerned']
    for char_id in characters:
        for emotion in emotions:
            portrait = create_portrait(char_id, emotion)
            portrait.save(f"{OUTPUT_DIR}/portraits/{char_id}_{emotion}.png")
        print(f"  Created {char_id} portraits (64x64)")
    
    # Generate PWA icons
    print("Generating PWA icons...")
    for size in [192, 512]:
        icon = create_pwa_icon(size)
        icon.save(f"{OUTPUT_DIR}/pwa-{size}x{size}.png")
        print(f"  Created pwa-{size}x{size}.png")
    
    # Also save apple touch icon
    icon_180 = create_pwa_icon(180)
    icon_180.save(f"{OUTPUT_DIR}/apple-touch-icon.png")
    print("  Created apple-touch-icon.png (180x180)")
    
    print("\nAll assets generated successfully!")


if __name__ == "__main__":
    main()
