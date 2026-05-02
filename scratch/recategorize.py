import json
import re

def categorize_product(product):
    name = product.get('name', '').lower()
    desc = product.get('short_description', '').lower()
    text = f"{name} {desc}".lower()

    # 1. Weather gear (High confidence)
    if any(k in name for k in ['umbrella', 'poncho', 'raincoat']):
        return 'Weather gear'
    
    # 2. In-flight comfort
    if any(k in name for k in ['pillow', 'blanket', 'eye mask', 'sleep mask', 'footrest', 'earplug', 'foot hammock', 'foot sling']):
        return 'In-flight comfort'

    # 3. Security
    if any(k in name for k in [' lock', 'locks', 'tsa lock', 'money belt', 'hidden pocket', 'rfid']):
        if 'wallet' not in name and 'passport' not in name:
            return 'Security'

    # 4. Books
    if any(k in name for k in ['guidebook', 'lonely planet', 'activity book', 'quiz book', 'travels with charley', 'ultimate travel', 'best of the world', 'atlas', 'experience japan', 'dream trips']):
        return 'Books'

    # 5. Documents and money
    if any(k in name for k in ['passport', 'map', 'travel wallet', 'boarding pass', 'document organizer', 'id card holder']):
        return 'Documents and money'

    # 6. Travel tech
    if any(k in name for k in ['adapter', 'charger', 'power bank', 'cable', 'usb', 'scale', 'electronics organizer', 'steamer', 'shoe dryer', 'tablet holder', 'phone holder', 'phone mount', 'headphone', 'earbud']):
        return 'Travel tech'

    # 7. Packing organisers
    if any(k in name for k in ['packing cube', 'organizer', 'organiser', 'pouch', 'toiletry bag', 'laundry bag', 'compression bag', 'vacuum bag', 'luggage cover', 'makeup bag', 'cosmetic bag']):
        if 'electronics' not in name and 'tech' not in name:
            return 'Packing organisers'

    # 8. Health and hygiene
    if any(k in name for k in ['soap', 'shampoo', 'toiletries', 'bottle', 'water bottle', 'first aid', 'medicine', 'insulin', 'hygiene', 'makeup mirror', 'brush', 'toothpaste', 'towel', 'clothesline', 'cutlery', 'mug', 'tumbler', 'skin &', 'skincare', 'avanti brew']):
        return 'Health and hygiene'

    # 9. Backpacks
    if any(k in name for k in ['backpack', 'daypack', 'rucksack']):
        return 'Backpacks'

    # 10. Luggage
    if any(k in name for k in ['suitcase', 'spinner', 'hardside', 'duffel', 'duffle', 'weekender', 'trolley', 'wheeled bag', 'rolling']):
        return 'Luggage'

    # Fallbacks
    if 'lonely planet' in desc or 'guidebook' in desc: return 'Books'
    if 'umbrella' in desc: return 'Weather gear'
    if 'passport' in desc: return 'Documents and money'
    if 'adapter' in desc or 'charger' in desc: return 'Travel tech'
    if 'packing cube' in desc: return 'Packing organisers'
    
    if 'bag' in name or 'tote' in name or 'case' in name:
        if any(k in name for k in ['carry on', 'travel']):
            return 'Luggage'
        return 'Packing organisers'

    return product.get('category', 'Luggage')

    return product.get('category', 'Luggage')

def main():
    with open('tripkit_catalogue_starter.json', 'r', encoding='utf-8') as f:
        products = json.load(f)

    for p in products:
        new_cat = categorize_product(p)
        p['category'] = new_cat
        # Also update recommendation_context to match
        if 'product_page_copy' in p and 'recommendation_context' in p['product_page_copy']:
             p['product_page_copy']['recommendation_context'] = f"A great choice for {new_cat.lower()}."

    with open('tripkit_catalogue_starter.json', 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2)

    # Print summary
    cats = {}
    for p in products:
        cat = p['category']
        cats[cat] = cats.get(cat, 0) + 1
    
    for cat, count in sorted(cats.items()):
        print(f"{cat}: {count}")

if __name__ == "__main__":
    main()
