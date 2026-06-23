"""
SVG polygon paths per section (positional order on the floor plan).

Index 0 → first apartment on the floor (sorted by Profitbase number).
Index 1 → second apartment, etc.
"""

SECTION_POLYGON_PATHS: dict[str, list[str]] = {
    "1": [
        "M2578 1151.5H2385.5V1333H2143.5V1717.5H2619V1254.5H2578V1151.5Z",
        "M3174 1000H2602.5V1240.5H2633V1719H3174V1000Z",
        "M3174 281.5H2378.5V762H2437.5V781.5H2631V980.5H3174V281.5Z",
        "M1647 774H1869.5V746H2366V226H1948V283H1647V774Z",
        "M1423 1064.5H1626V274H1088.5V1109H1423V1064.5Z",
        "M1457 1089H1624V1719H1092V1135.5H1457V1089Z",
        "M1645.5 1249.5H1868V1324H2120.5V1708.5H1645.5V1249.5Z",
    ],
    # Section 2 — add paths here when ready
    "2": [],
}

FIRST_FLOOR = 3
