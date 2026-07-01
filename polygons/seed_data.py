"""
SVG polygon paths per section (positional order on the floor plan).

Index 0 → first apartment on the floor (sorted by Profitbase number).
Index 1 → second apartment, etc.

Use SECTION_FLOOR_OVERRIDES for floors with a different layout (e.g. penthouse).
Use SECTION_FLOOR_PATHS_FROM when all floors from N upward share one layout.
"""

SECTION_POLYGON_PATHS: dict[str, list[str]] = {
    # Section 1 — floors 3–23, seven apartments per floor
    "1": [
        "M2578 1151.5H2385.5V1333H2143.5V1717.5H2619V1254.5H2578V1151.5Z",
        "M3174 1000H2602.5V1240.5H2633V1719H3174V1000Z",
        "M3174 281.5H2378.5V762H2437.5V781.5H2631V980.5H3174V281.5Z",
        "M1647 774H1869.5V746H2366V226H1948V283H1647V774Z",
        "M1423 1064.5H1626V274H1088.5V1109H1423V1064.5Z",
        "M1457 1089H1624V1719H1092V1135.5H1457V1089Z",
        "M1645.5 1249.5H1868V1324H2120.5V1708.5H1645.5V1249.5Z",
    ],
    # Section 2 — floors 3–12, five apartments per floor
    "2": [
        "M3157.5 242.5H2474.5V970.5H2626V1209H3157.5V242.5Z",
        "M3165.5 1232V1731L2252.5 1753V986H2595.5V1232H3165.5Z",
        "M2229 989H1694V1770.5L2229 1755V989Z",
        "M1670 1765.55L1660.5 985.969H1492V844H969L1192.5 1779L1670 1765.55Z",
        "M1749.5 236H831.5L968.5 813H1500V761.5H1749.5V236Z",
    ],
}

# Exact floor → paths (overrides SECTION_POLYGON_PATHS for that floor only)
SECTION_FLOOR_OVERRIDES: dict[str, dict[int, list[str]]] = {
    "1": {
        # Section 1, floor 24 — three apartments, full-floor layout
        24: [
            "M2371.5 1340.5H2131V1719.5H3181.5V272.5H2916.5V681H2634V998.5H2602V1154.5H2371.5V1340.5Z",
            "M2104.5 1722V1331.5H1850V1139H1602V267.5H1064V1722H2104.5Z",
            "M2611 654.5V775H2369.5V742H1849.5V775H1624.5V266.5H2904V654.5H2611Z",
        ],
    },
    "2": {
        # Section 2, floor 13 — two apartments per floor
        13: [
            "M2252.5 1760V990H2292.5V776.5H2475V234.5H3159V1734L2252.5 1760Z",
            "M2021.5 976V790.5H1748V237.5H830L1189 1788.5L2232.5 1748.5V976H2021.5Z",
        ],
    },
}

# From floor N (inclusive) to top — overrides default paths
SECTION_FLOOR_PATHS_FROM: dict[str, dict[int, list[str]]] = {}

FIRST_FLOOR = 3


def paths_for_floor(section: str, floor: int) -> list[str] | None:
    """Return SVG paths for section/floor, or None if section has no paths."""
    overrides = SECTION_FLOOR_OVERRIDES.get(section, {})
    if floor in overrides:
        return overrides[floor]

    from_map = SECTION_FLOOR_PATHS_FROM.get(section, {})
    for start_floor in sorted(from_map.keys(), reverse=True):
        if floor >= start_floor:
            return from_map[start_floor]

    return SECTION_POLYGON_PATHS.get(section)
