#!/usr/bin/env python3
"""Build Ismailia landmark data + schematic layout from OSM/Wikidata/Wikivoyage coords.

Inputs : maps/ismailia/raw/geom.json, bld.json (Overpass dumps, ODbL)
Outputs: maps/ismailia/landmarks.json, features.geojson, layout.png, layout-grid.png
Projection: local equirectangular around ORIGIN (fine at city scale, <0.1% error).
Game axes : x = east (+), y = south (+)  -> matches screen/Phaser coordinates.
"""
import json, math
from pathlib import Path
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon as MPoly

ROOT = Path("/workspace/pixel-game/maps/ismailia")
RAW = ROOT / "raw"
# Origin = Midan Abd el-Moneim Riad (between old town and Lake Timsah waterfront)
ORIGIN = (30.59193, 32.28185)
TILE_PX = 16
SCALES = {"compressed_20m": 20.0, "detailed_10m": 10.0}   # metres per tile
# Level 1 playable box (lat/lon): station in the west -> Suez Canal in the east
BBOX = dict(s=30.578, n=30.6035, w=32.262, e=32.316)

M_LAT = 110574.0
M_LON = 111320.0 * math.cos(math.radians(ORIGIN[0]))

def to_m(lat, lon):
    return ((lon - ORIGIN[1]) * M_LON, -(lat - ORIGIN[0]) * M_LAT)  # x east, y south

OSM = "https://www.openstreetmap.org/"
WV = "https://de.wikivoyage.org/wiki/Ismailia"
WD = "https://www.wikidata.org/wiki/"
L = [
 # id, name_en, name_ar, lat, lon, kind, source label, source url, role
 ("sca_guidance", "Suez Canal Authority - Ships' Guidance (Irshad) Building", "مبنى الإرشاد - هيئة قناة السويس", 30.58852, 32.28231, "building", "OSM way 97205818 + Wikivoyage(de)", OSM+"way/97205818", "hero landmark on Lake Timsah north shore"),
 ("lake_timsah", "Lake Timsah (centre)", "بحيرة التمساح", 30.57778, 32.28889, "water", "Wikidata Q1724581 / OSM relation 5809452", WD+"Q1724581", "big water body south/south-east of town"),
 ("suez_canal", "Suez Canal at Nemra 6 ferry", "قناة السويس - معدية نمرة 6", 30.59016, 32.30936, "water", "Wikivoyage(de) marker 'Autofähre Nimra Sitta'", WV, "eastern edge of the map"),
 ("forsan_island", "El-Forsan island (Mercure hotel)", "جزيرة الفرسان", 30.58582, 32.28802, "area", "Wikivoyage(de) + Wikidata Q111857805", WD+"Q111857805", "peninsula pushing into the lake, south-east of the Irshad building"),
 ("forsan_beach", "El-Forsan beach (Tolip hotel)", "شاطئ الفرسان", 30.58435, 32.29410, "beach", "OSM way 745998248 (natural=beach)", OSM+"way/745998248", "lake beach east of Forsan"),
 ("mallaha_park", "Mallaha Park", "حديقة الملاحة", 30.59124, 32.28357, "park", "Wikivoyage(de) marker", WV, "garden right behind (north of) the Irshad building"),
 ("ismailia_museum", "Ismailia (Archaeological) Museum", "متحف الإسماعيلية", 30.59299, 32.28364, "building", "OSM way 429911116 + Wikivoyage(de)", OSM+"way/429911116", "north edge of Mallaha park, Museum St."),
 ("abdel_moneim_riad_sq", "Abdel Moneim Riad Square (war memorial)", "ميدان عبد المنعم رياض", 30.59193, 32.28185, "square", "Wikivoyage(de) marker", WV, "map origin; between old town and waterfront"),
 ("lesseps_house", "Ferdinand de Lesseps House", "بيت ديليسبس", 30.58948, 32.27234, "building", "Wikivoyage(de) marker", WV, "on Salah Salem St (old Mohamed Ali quay), south of the old town, north of the Sweet-Water canal"),
 ("sca_admin_1920s", "SCA 'new' administration building (1920s, Paul Albert)", "مبنى إدارة هيئة القناة القديم", 30.58960, 32.27272, "building", "Wikivoyage(de) marker", WV, "right next to de Lesseps House"),
 ("suez_canal_museum", "Suez Canal Museum", "متحف قناة السويس", 30.59017, 32.27325, "building", "Wikidata Q137799678 / OSM way 690921437", WD+"Q137799678", "just north of de Lesseps House"),
 ("sca_exhibition", "SCA Historical Exhibition", "المعرض التاريخي لقناة السويس", 30.58622, 32.27257, "building", "OSM way 690921438", OSM+"way/690921438", "south of the Sweet-Water canal, near the lake shore"),
 ("sailing_club", "Sailing Club (lake shore)", "نادي الشراع", 30.58519, 32.27222, "building", "Wikivoyage(de) marker", WV, "western lake shore / beach strip"),
 ("sweet_water_canal", "Sweet-Water (Ismailia) Canal at Bridge 3", "ترعة الإسماعيلية (كوبري 3)", 30.58910, 32.27440, "water", "OSM way 'Bridge 3' + Ismailia Canal ways", OSM+"way/28621716", "east-west canal separating the old town from the lake-side strip"),
 ("abu_bakr_mosque", "Abu Bakr el-Siddiq Mosque", "مسجد أبو بكر الصديق", 30.59230, 32.27271, "building", "OSM way 473969623 + Wikivoyage(de)", OSM+"way/473969623", "old European quarter, 2 blocks east of the station"),
 ("st_mark_cathedral", "St. Mark Cathedral", "كاتدرائية مارمرقس", 30.59142, 32.27146, "building", "Wikivoyage(de) / Commons category coords", WV, "old European quarter, south-east of the station"),
 ("gumhuriya_sq", "Gumhuriya Square (ex Place Champollion)", "ميدان الجمهورية", 30.59162, 32.27330, "square", "Wikivoyage(de) marker", WV, "heart of the old European quarter (Hay el-Afrang)"),
 ("mustafa_kamel_sq", "Mustafa Kamel Square (ex Place Leibnitz)", "ميدان مصطفى كامل", 30.59320, 32.27859, "square", "Wikivoyage(de) marker", WV, "centre of the old Greek quarter"),
 ("railway_station", "Ismailia Railway Station", "محطة قطار الإسماعيلية", 30.59337, 32.27008, "building", "Wikidata Q135113619 / OSM way 97203257", WD+"Q135113619", "far west of the core; railway line splits old town (south) from new town (north)"),
 ("orabi_sq", "Orabi Square (station forecourt)", "ميدان عرابي", 30.59265, 32.27035, "square", "Wikivoyage(de) marker", WV, "in front of the station"),
 ("ismaily_mosque", "Al-Ismaily Mosque", "المسجد الإسماعيلي", 30.59672, 32.27120, "building", "OSM way 97203275", OSM+"way/97203275", "north of the railway"),
 ("ismailia_stadium", "Ismailia Stadium (Ismaily SC)", "ستاد الإسماعيلية", 30.60194, 32.27389, "building", "Wikidata Q779930 / OSM way 97203203", WD+"Q779930", "north of the railway, ~1 km north of the station"),
 ("sca_stadium", "Suez Canal Authority Stadium", "ستاد هيئة قناة السويس", 30.59270, 32.29250, "building", "Wikidata Q4118765 / OSM way 664459703", WD+"Q4118765", "east of Mallaha park, towards the canal"),
 ("battle_memorial", "Battle of Ismailia (1973) Memorial", "نصب معركة الإسماعيلية", 30.58155, 32.31034, "monument", "Wikivoyage(de/en) marker", WV, "on the canal bank south-east, where lake meets canal"),
 ("ferdan_bridge", "El-Ferdan Railway Swing Bridge (off-map)", "كوبري الفردان", 30.65714, 32.33396, "bridge", "Wikivoyage(de) marker / Wikidata Q610013", WD+"Q610013", "~8 km north-north-east of the core - separate zone / later map"),
]

def rings_from_ways(ways):
    """Join open ways into rings (very small helper)."""
    segs = [list(w) for w in ways]
    rings = []
    while segs:
        cur = segs.pop(0)
        changed = True
        while changed and cur[0] != cur[-1]:
            changed = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]: cur += s[1:]; segs.pop(i); changed = True; break
                if s[-1] == cur[-1]: cur += s[::-1][1:]; segs.pop(i); changed = True; break
        rings.append(cur)
    return rings

def main():
    geom = json.load(open(RAW / "geom.json"))
    feats = []
    def add(kind, coords, tags, closed=False):
        feats.append({"type": "Feature", "properties": {"kind": kind, **{k: tags.get(k) for k in ("name", "name:en") if tags.get(k)}},
                      "geometry": {"type": "Polygon" if closed else "LineString",
                                   "coordinates": [[[p[1], p[0]] for p in coords]] if closed else [[p[1], p[0]] for p in coords]}})
    lake_outer, lake_inner = [], []
    for e in geom["elements"]:
        t = e.get("tags", {})
        if e["type"] == "relation" and t.get("natural") == "water":
            for m in e["members"]:
                pts = [(p["lat"], p["lon"]) for p in m["geometry"]]
                (lake_outer if m["role"] == "outer" else lake_inner).append(pts)
            continue
        if e["type"] != "way": continue
        pts = [(p["lat"], p["lon"]) for p in e["geometry"]]
        closed = pts[0] == pts[-1]
        if t.get("natural") == "coastline": add("coastline", pts, t, False); add("land_island", pts, t, True) if closed else None
        elif t.get("natural") == "water" and closed: add("water", pts, t, True)
        elif t.get("waterway") == "canal": add("canal_" + ("suez" if "Suez" in t.get("name:en", "") else "fresh"), pts, t)
        elif t.get("railway") == "rail": add("railway", pts, t)
        elif "highway" in t: add("road_" + t["highway"].replace("_link", ""), pts, t)
        elif t.get("leisure") in ("park", "garden") or t.get("landuse") in ("grass", "recreation_ground"):
            if closed: add("park", pts, t, True)
        elif t.get("leisure") == "stadium" and closed: add("stadium", pts, t, True)
        elif t.get("natural") == "beach" and closed: add("beach", pts, t, True)
    for r in rings_from_ways(lake_outer): add("lake", r, {"name": "بحيرة التمساح", "name:en": "Lake Timsah"}, True)
    for r in rings_from_ways(lake_inner): add("land_island", r, {}, True)
    bld = json.load(open(RAW / "bld.json"))
    for e in bld["elements"]:
        pts = [(p["lat"], p["lon"]) for p in e["geometry"]]
        if pts[0] == pts[-1]: add("building", pts, e.get("tags", {}), True)
    json.dump({"type": "FeatureCollection", "features": feats}, open(ROOT / "features.geojson", "w"), ensure_ascii=False)

    # landmarks.json
    out = {"origin": {"lat": ORIGIN[0], "lon": ORIGIN[1], "name": "Abdel Moneim Riad Square"},
           "projection": "local equirectangular; x=east metres, y=south metres (screen axes)",
           "tile_px": TILE_PX, "scales_m_per_tile": SCALES, "level_bbox": BBOX, "landmarks": []}
    x0, y0 = to_m(BBOX["n"], BBOX["w"])
    x1, y1 = to_m(BBOX["s"], BBOX["e"])
    out["level_size"] = {k: {"tiles_w": round((x1 - x0) / s), "tiles_h": round((y1 - y0) / s),
                             "px_w": round((x1 - x0) / s) * TILE_PX, "px_h": round((y1 - y0) / s) * TILE_PX}
                         for k, s in SCALES.items()}
    out["level_size_m"] = {"w": round(x1 - x0), "h": round(y1 - y0)}
    for i, (lid, en, ar, la, lo, kind, src, url, note) in enumerate(L, 1):
        x, y = to_m(la, lo)
        inside = BBOX["s"] <= la <= BBOX["n"] and BBOX["w"] <= lo <= BBOX["e"]
        out["landmarks"].append({"n": i, "id": lid, "name_en": en, "name_ar": ar, "lat": la, "lon": lo, "kind": kind,
            "source": src, "source_url": url, "relative_note": note, "metres_from_origin": {"x": round(x), "y": round(y)},
            "in_level_1": inside,
            "tile": {k: {"x": round((x - x0) / s), "y": round((y - y0) / s)} for k, s in SCALES.items()}})
    json.dump(out, open(ROOT / "landmarks.json", "w"), ensure_ascii=False, indent=2)

    # ---- plot
    fig, ax = plt.subplots(figsize=(16, 9), dpi=110)
    ax.set_facecolor("#efe6d2")
    def P(coords):  # geojson lonlat -> metres
        return [to_m(c[1], c[0]) for c in coords]
    order = ["park", "stadium", "beach", "lake", "water", "land_island", "building"]
    style = {"park": ("#bfe3a6", None), "stadium": ("#9fd18a", "#5c8c4a"), "beach": ("#f6dfa0", None),
             "lake": ("#7fb6e0", "#3b78b0"), "water": ("#7fb6e0", None), "land_island": ("#efe6d2", "#3b78b0"),
             "building": ("#c9b79c", "#8d7a5f")}
    for kind in order:
        for f in feats:
            if f["properties"]["kind"] != kind: continue
            fc, ec = style[kind]
            ax.add_patch(MPoly(P(f["geometry"]["coordinates"][0]), closed=True, fc=fc, ec=ec or fc, lw=0.6, zorder=order.index(kind) + 1))
    for f in feats:
        k = f["properties"]["kind"]
        if f["geometry"]["type"] != "LineString": continue
        xs, ys = zip(*P(f["geometry"]["coordinates"]))
        if k == "canal_suez": ax.plot(xs, ys, color="#3b78b0", lw=14, solid_capstyle="round", zorder=2)
        elif k == "canal_fresh": ax.plot(xs, ys, color="#4f9bd6", lw=3, zorder=9)
        elif k == "coastline": ax.plot(xs, ys, color="#3b78b0", lw=0.8, zorder=9)
        elif k == "railway":
            ax.plot(xs, ys, color="#333", lw=2.2, zorder=11); ax.plot(xs, ys, color="white", lw=1.2, ls=(0, (4, 4)), zorder=12)
        elif k.startswith("road_"):
            w = {"road_motorway": 3, "road_trunk": 2.6, "road_primary": 2.2, "road_secondary": 1.6, "road_tertiary": 1.0}.get(k, 1)
            ax.plot(xs, ys, color="#ffffff", lw=w + 0.8, zorder=10); ax.plot(xs, ys, color="#e0a040" if w >= 2.2 else "#b0a898", lw=w, zorder=10.5)
    cols = {"building": "#d62e6b", "water": "#1d5fa8", "park": "#2e8b2e", "square": "#7a3db8", "area": "#c05a00", "beach": "#c05a00", "monument": "#444", "bridge": "#444"}
    for lm in out["landmarks"]:
        if not lm["in_level_1"]: continue
        x, y = lm["metres_from_origin"]["x"], lm["metres_from_origin"]["y"]
        ax.scatter([x], [y], s=150, c=cols.get(lm["kind"], "k"), edgecolors="white", linewidths=1.5, zorder=20)
        ax.text(x, y, str(lm["n"]), color="white", fontsize=7, ha="center", va="center", weight="bold", zorder=21)
        ax.annotate(lm["name_en"].replace(" (Archaeological)", "").split(" (")[0].replace("Suez Canal Authority - ", "SCA ").replace(" Building", ""),
                    (x, y), xytext=(6, 6), textcoords="offset points", fontsize=7.2, zorder=22,
                    bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.75))
    # level bbox + tile grid labels (compressed scale)
    ax.add_patch(MPoly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], closed=True, fill=False, ec="#d62e6b", lw=2, ls="--", zorder=30))
    s = SCALES["compressed_20m"]
    for tx in range(0, int((x1 - x0) / s) + 1, 25):
        ax.axvline(x0 + tx * s, color="#00000022", lw=0.6, zorder=29); ax.text(x0 + tx * s, y0 - 25, str(tx), fontsize=6, ha="center", color="#555")
    for ty in range(0, int((y1 - y0) / s) + 1, 25):
        ax.axhline(y0 + ty * s, color="#00000022", lw=0.6, zorder=29); ax.text(x0 - 30, y0 + ty * s, str(ty), fontsize=6, va="center", ha="right", color="#555")
    # scale bar + north
    bx, by = x1 - 1100, y1 - 120
    ax.plot([bx, bx + 1000], [by, by], color="k", lw=3, zorder=40); ax.text(bx + 500, by - 40, "1 km  (= 50 tiles @ 20 m/tile)", ha="center", fontsize=8, zorder=40)
    ax.annotate("N", xy=(x0 + 120, y0 + 120), xytext=(x0 + 120, y0 + 380), ha="center", fontsize=12, weight="bold",
                arrowprops=dict(arrowstyle="-|>", lw=2, color="k"), zorder=40)
    ax.set_xlim(x0 - 250, x1 + 150); ax.set_ylim(y1 + 300, y0 - 150)  # y south-down
    ax.set_aspect("equal"); ax.set_xticks([]); ax.set_yticks([])
    ax.set_title("Ismailia - Level 1 schematic (real OSM geometry). Grid labels = tile index @ 20 m/tile, 16 px tiles. Dashed box = level bounds", fontsize=10)
    fig.text(0.01, 0.01, "Map data © OpenStreetMap contributors (ODbL). Landmark coords: OSM, Wikidata, Wikivoyage(de).", fontsize=7)
    fig.tight_layout(); fig.savefig(ROOT / "layout.png")
    # zoom: the mockup zone (old town waterfront -> Irshad -> Forsan)
    zx0, zy0 = to_m(30.5950, 32.2665); zx1, zy1 = to_m(30.5815, 32.2985)
    ax.set_xlim(zx0, zx1); ax.set_ylim(zy1, zy0)
    ax.set_title("Mockup zone: Sweet-Water canal waterfront, Mallaha Park, SCA Irshad building, Lake Timsah, El-Forsan (real OSM geometry)", fontsize=10)
    fig.savefig(ROOT / "layout-mockup-zone.png")
    return
    ax.set_aspect("equal"); ax.set_xticks([]); ax.set_yticks([])
    ax.set_title("Ismailia - Level 1 schematic (real OSM geometry). Grid labels = tile index @ 20 m/tile, 16 px tiles. Dashed box = level bounds", fontsize=10)
    fig.text(0.01, 0.01, "Map data © OpenStreetMap contributors (ODbL). Landmark coords: OSM, Wikidata, Wikivoyage(de).", fontsize=7)
    fig.tight_layout(); fig.savefig(ROOT / "layout.png"); print("ok", out["level_size"], out["level_size_m"])

if __name__ == "__main__":
    main()
