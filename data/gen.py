import json
import csv
import sys
from pathlib import Path


def load_json(filepath: str) -> dict:
    with open(filepath, "r") as f:
        return json.load(f)


def load_csv(filepath: str) -> dict:
    sector_weights = {}
    with open(filepath, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            sector = row["Holding Type"].strip().strip('"')
            # Get the latest date column (last column)
            dates = [col for col in row.keys() if col != "Holding Type"]
            latest_date = dates[-1]
            sector_weights[sector] = float(row[latest_date])
    return sector_weights


def build_unified_json(json_filepath: str, csv_filepath: str) -> dict:
    raw = load_json(json_filepath)
    sector_weights = load_csv(csv_filepath)

    allocations = raw.get("data", {}).get("currentAllocation", [])

    constituents = []
    for item in allocations:
        constituents.append({
            "ticker": item.get("ticker"),
            "title": item.get("title"),
            "type":  item.get("type"),
            "weight": item.get("latest"),
        })

    unified = {
        "constituents": constituents,
        "sectorWeights": sector_weights,
    }

    return unified


def main():
    if len(sys.argv) != 3:
        print("Usage: python merge_fund_data.py <api_response.json> <sectoral_weights.csv>")
        sys.exit(1)

    json_file = sys.argv[1]
    csv_file  = sys.argv[2]

    for path in (json_file, csv_file):
        if not Path(path).exists():
            print(f"Error: file not found — {path}")
            sys.exit(1)

    unified = build_unified_json(json_file, csv_file)

    out_path = "unified_fund_data.json"
    with open(out_path, "w") as f:
        json.dump(unified, f, indent=2)

    print(f"Done! Written to {out_path}")
    print(f"  Constituents : {len(unified['constituents'])}")
    print(f"  Sectors      : {len(unified['sectorWeights'])}")


if __name__ == "__main__":
    main()