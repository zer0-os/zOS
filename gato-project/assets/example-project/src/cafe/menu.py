"""
Café Menu Module - Delicious treats for humans and cats
"""

class MenuItem:
    """Represents an item on the café menu"""
    
    def __init__(self, name, price, category, description, cat_friendly=False):
        self.name = name
        self.price = price
        self.category = category
        self.description = description
        self.cat_friendly = cat_friendly
        self.ingredients = []
        self.allergens = []
    
    def __str__(self):
        cat_indicator = "🐱" if self.cat_friendly else ""
        return f"{self.name} ${self.price:.2f} {cat_indicator}"
    
    def add_ingredient(self, ingredient):
        """Add an ingredient to the menu item"""
        self.ingredients.append(ingredient)
    
    def add_allergen(self, allergen):
        """Add an allergen warning"""
        self.allergens.append(allergen)

# Sample menu items
MENU_ITEMS = [
    # Human drinks
    MenuItem("Purr-fect Latte", 4.50, "drinks", "Smooth coffee with cat latte art"),
    MenuItem("Meow-cha Green Tea", 3.25, "drinks", "Calming green tea blend"),
    MenuItem("Catnip Hot Chocolate", 4.00, "drinks", "Rich chocolate with marshmallows"),
    MenuItem("Whiskers Cold Brew", 3.75, "drinks", "Smooth cold brew coffee"),
    
    # Human food
    MenuItem("Tuna Melt Sandwich", 8.50, "food", "Classic tuna melt on sourdough"),
    MenuItem("Cat-sui Sushi Bowl", 12.00, "food", "Fresh sushi bowl with salmon"),
    MenuItem("Paw-sta Carbonara", 11.50, "food", "Creamy pasta with bacon"),
    MenuItem("Mouse-aka Burger", 9.75, "food", "Beef burger with special sauce"),
    
    # Cat treats
    MenuItem("Kitty Treats", 2.00, "cat_treats", "Healthy treats for our café cats", cat_friendly=True),
    MenuItem("Catnip Cookies", 1.50, "cat_treats", "Special catnip-infused cookies", cat_friendly=True),
    MenuItem("Salmon Bites", 3.00, "cat_treats", "Fresh salmon treats", cat_friendly=True),
    
    # Desserts
    MenuItem("Cat-amel Cheesecake", 6.50, "desserts", "Rich cheesecake with caramel"),
    MenuItem("Purr-fect Tiramisu", 7.00, "desserts", "Classic Italian dessert"),
    MenuItem("Meow-arons", 3.50, "desserts", "Colorful French macarons"),
]

def get_menu_by_category(category):
    """Get menu items by category"""
    return [item for item in MENU_ITEMS if item.category == category]

def get_cat_friendly_items():
    """Get items that cats can enjoy too"""
    return [item for item in MENU_ITEMS if item.cat_friendly]

def find_item_by_name(name):
    """Find a menu item by name"""
    for item in MENU_ITEMS:
        if item.name.lower() == name.lower():
            return item
    return None

def get_items_under_price(max_price):
    """Get menu items under a certain price"""
    return [item for item in MENU_ITEMS if item.price <= max_price]

def print_menu():
    """Print the full menu in a nice format"""
    categories = {
        "drinks": "☕ BEVERAGES",
        "food": "🍽️ MAIN DISHES", 
        "desserts": "🍰 DESSERTS",
        "cat_treats": "🐱 FOR OUR FELINE FRIENDS"
    }
    
    print("🐱 ═══════════════════════════════════════ 🐱")
    print("           CAT CAFÉ MENU")
    print("🐱 ═══════════════════════════════════════ 🐱")
    
    for category, title in categories.items():
        items = get_menu_by_category(category)
        if items:
            print(f"\n{title}")
            print("-" * len(title))
            for item in items:
                print(f"{item.name:.<25} ${item.price:.2f}")
                if item.cat_friendly:
                    print("  🐱 Cat-approved!")
                print(f"  {item.description}")
                print()

if __name__ == "__main__":
    # Test the menu
    print_menu()
    
    print("\n🐱 Special cat-friendly items:")
    for item in get_cat_friendly_items():
        print(f"- {item}")
    
    print(f"\n💰 Items under $5:")
    for item in get_items_under_price(5.00):
        print(f"- {item}")