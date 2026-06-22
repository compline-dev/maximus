"""
Test script: explore Profitbase REST API v4 for floor plan polygon coordinates.
Run: python test_profitbase_api.py
"""
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


def dump(label, data, max_keys=None):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    if isinstance(data, dict) and max_keys:
        for i, (k, v) in enumerate(data.items()):
            if i >= max_keys:
                print(f"  ... ({len(data) - max_keys} more keys)")
                break
            val_preview = json.dumps(v, ensure_ascii=False, default=str)[:200]
            print(f"  {k}: {val_preview}")
    else:
        print(json.dumps(data, indent=2, ensure_ascii=False, default=str)[:3000])


def main():
    token = get_token()
    print(f"Token: {token[:20]}...")

    # 1. Get projects
    projects = api_get("projects", token)
    if isinstance(projects, dict):
        projects = projects.get("data", projects)
    print(f"\nProjects: {len(projects)}")
    for p in projects[:3]:
        print(f"  id={p.get('id')} title={p.get('title')}")

    if not projects:
        print("No projects found!")
        return

    project_id = projects[0]["id"]

    # 2. Get houses
    houses = api_get(f"projects/{project_id}/houses", token)
    if isinstance(houses, dict):
        houses = houses.get("data", houses)
    print(f"\nHouses for project {project_id}: {len(houses)}")
    for h in houses[:5]:
        print(f"  id={h.get('id')} title={h.get('title')} floors={h.get('floorsTotal')}")

    if not houses:
        return

    house_id = houses[0]["id"]

    # 3. Get board (chess view) - this might have floor plan data
    print(f"\n--- BOARD for house {house_id} ---")
    board = api_get("board", token, houseId=house_id)
    if isinstance(board, dict) and "data" in board:
        board = board["data"]
    dump("Board top-level keys", board, max_keys=20)

    # Check if board has floor plan images or polygon data
    if isinstance(board, dict):
        for key in board:
            val = board[key]
            s = json.dumps(val, ensure_ascii=False, default=str)
            if any(w in s.lower() for w in ["polygon", "coord", "point", "svg", "plan", "genplan", "floor_plan"]):
                print(f"\n  *** FOUND potential polygon data in board['{key}'] ***")
                print(f"  Preview: {s[:500]}")

    # 4. Try genplan endpoint
    print("\n--- Trying genplan endpoints ---")
    for endpoint in [
        f"genplan-polygon/list?houseId={house_id}",
        f"genplan/list?houseId={house_id}",
        f"plan/list?houseId={house_id}",
        f"floor-plan?houseId={house_id}",
        f"property-on-plan?houseId={house_id}",
    ]:
        try:
            data = api_get(endpoint, token)
            print(f"  {endpoint}: OK")
            preview = json.dumps(data, ensure_ascii=False, default=str)[:500]
            print(f"    {preview}")
        except requests.HTTPError as e:
            print(f"  {endpoint}: {e.response.status_code}")
        except Exception as e:
            print(f"  {endpoint}: ERROR {e}")

    # 5. Get a single property with full=true and inspect all fields
    print("\n--- Single property (full) ---")
    props = api_get("property", token, houseId=house_id, full="true", limit=1)
    if isinstance(props, dict):
        props = props.get("data", props)
    if props and isinstance(props, list):
        prop = props[0]
        print(f"Property keys: {sorted(prop.keys())}")
        # Look for any plan/polygon fields
        for k, v in prop.items():
            s = json.dumps(v, ensure_ascii=False, default=str) if not isinstance(v, str) else v
            if any(w in k.lower() for w in ["plan", "polygon", "coord", "svg", "image", "photo", "genplan"]):
                print(f"\n  Key '{k}':")
                print(f"    {s[:500]}")

    # 6. Try floor-plan-polygon specific endpoints (Profitbase v4 docs)
    print("\n--- Floor plan polygon endpoints ---")
    for floor in [3, 10]:
        for endpoint in [
            f"floor/{floor}/plan?houseId={house_id}",
            f"genplan-polygon/list?houseId={house_id}&floor={floor}",
        ]:
            try:
                data = api_get(endpoint, token)
                print(f"  {endpoint}: OK")
                preview = json.dumps(data, ensure_ascii=False, default=str)[:800]
                print(f"    {preview}")
            except requests.HTTPError as e:
                print(f"  {endpoint}: {e.response.status_code}")
            except Exception as e:
                print(f"  {endpoint}: ERROR {e}")

    # 7. Check house detail for plan images
    print(f"\n--- House detail {house_id} ---")
    try:
        house_detail = api_get(f"house/{house_id}", token)
        if isinstance(house_detail, dict) and "data" in house_detail:
            house_detail = house_detail["data"]
        dump("House detail keys", house_detail, max_keys=30)
    except requests.HTTPError as e:
        print(f"  house/{house_id}: {e.response.status_code}")

    print("\nDone.")


if __name__ == "__main__":
    main()
