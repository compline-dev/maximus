"""Explore board data structure in detail."""
import json
import requests

BASE = "https://pb6620.profitbase.ru"
AUTH_URL = f"{BASE}/api/v4/json/authentication"
API_KEY = "app-68ebaa880db86"


def get_token():
    r = requests.post(AUTH_URL, json={
        "type": "api-app",
        "credentials": {"pb_api_key": API_KEY},
    }, timeout=10)
    r.raise_for_status()
    return r.json()["access_token"]


def api_get(path, token, **params):
    params["access_token"] = token
    r = requests.get(f"{BASE}/api/v4/json/{path}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()


token = get_token()

# Board for house 158512 (Корпус 1)
board = api_get("board", token, houseId=158512)
if isinstance(board, dict) and "data" in board:
    board = board["data"]

print("Board keys:", list(board.keys()) if isinstance(board, dict) else type(board))
print(f"\nSection names: {board.get('sectionNames')}")

floors = board.get("floors", [])
print(f"\nFloors count: {len(floors)}")

# Show floor 10 in detail
for f in floors:
    if f["number"] == 10:
        print(f"\n=== Floor 10 ===")
        print(json.dumps(f, indent=2, ensure_ascii=False, default=str)[:2000])
        break

# Show all floors summary
print("\n=== All floors summary ===")
for f in sorted(floors, key=lambda x: x["number"]):
    sections = f.get("sections", [])
    cells_info = []
    for s in sections:
        total = len(s.get("cells", []))
        filled = sum(1 for c in s.get("cells", []) if c.get("propertyId"))
        cells_info.append(f"sec{s['number']}:{filled}/{total}")
    print(f"  Floor {f['number']:2d}: {', '.join(cells_info)}")

# Also check property planImages for a floor plan (not preset plan)
print("\n=== Property images check ===")
props = api_get("property", token, houseId=158512, full="true", limit=5)
if isinstance(props, dict):
    props = props.get("data", props)
for p in props[:5]:
    pid = p.get("id")
    num = p.get("number")
    floor = p.get("floor")
    images = p.get("planImages", [])
    print(f"  Property {pid} (#{num}, floor {floor}): {len(images)} plan images")
    for img in images[:2]:
        print(f"    {img}")

# Check if there are separate floor plan images in house/project
print("\n=== Try more endpoints ===")
for ep in [
    "genplan?projectId=57252",
    "genplan?houseId=158512",
    "projects/57252/genplan",
    "projects/57252/floor-plans",
]:
    try:
        data = api_get(ep, token)
        print(f"  {ep}: OK -> {json.dumps(data, ensure_ascii=False)[:300]}")
    except requests.HTTPError as e:
        print(f"  {ep}: {e.response.status_code}")
