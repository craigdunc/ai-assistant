import json
import sys

with open('tripkit_catalogue_starter.json', 'r', encoding='utf-8') as f:
    products = json.load(f)
for p in products:
    line = f"[{p['category']}] {p['brand']} - {p['name'][:50]}..."
    sys.stdout.buffer.write(line.encode('utf-8') + b'\n')
