"""
Cat Profiles Module - Manage our adorable café cats
"""

class Cat:
    """Represents a cat in our café"""
    
    def __init__(self, name, breed, age, personality, adoption_status="available"):
        self.name = name
        self.breed = breed
        self.age = age
        self.personality = personality
        self.adoption_status = adoption_status
        self.favorite_toy = None
        self.special_needs = []
        self.customer_ratings = []
    
    def __str__(self):
        return f"{self.name} ({self.breed}, {self.age} years old)"
    
    def add_rating(self, rating, comment=""):
        """Add a customer rating for this cat"""
        self.customer_ratings.append({
            'rating': rating,
            'comment': comment,
            'date': '2024-01-01'  # In real app, use datetime.now()
        })
    
    def get_average_rating(self):
        """Calculate average customer rating"""
        if not self.customer_ratings:
            return 0
        return sum(r['rating'] for r in self.customer_ratings) / len(self.customer_ratings)
    
    def is_available_for_adoption(self):
        """Check if cat is available for adoption"""
        return self.adoption_status == "available"
    
    def meow(self):
        """Each cat has their own meow!"""
        meows = {
            'playful': "Meow meow! *pounces*",
            'lazy': "Mrow... *yawn*",
            'cuddly': "Purrrr... *nuzzles*",
            'independent': "Meow. *walks away*",
            'vocal': "MEOOOOOW! MEOW! MEOW!",
            'shy': "*quiet mew*"
        }
        return meows.get(self.personality, "Meow!")

# Sample cats for the café
SAMPLE_CATS = [
    Cat("Whiskers", "Maine Coon", 3, "playful"),
    Cat("Shadow", "Russian Blue", 5, "independent"),
    Cat("Buttercup", "Persian", 2, "cuddly"),
    Cat("Ginger", "Orange Tabby", 4, "vocal"),
    Cat("Midnight", "Black Shorthair", 1, "shy"),
    Cat("Patches", "Calico", 6, "lazy"),
]

def get_all_cats():
    """Return all cats in the café"""
    return SAMPLE_CATS

def get_available_cats():
    """Return only cats available for adoption"""
    return [cat for cat in SAMPLE_CATS if cat.is_available_for_adoption()]

def find_cat_by_name(name):
    """Find a cat by name"""
    for cat in SAMPLE_CATS:
        if cat.name.lower() == name.lower():
            return cat
    return None

def get_cats_by_personality(personality):
    """Get cats with a specific personality"""
    return [cat for cat in SAMPLE_CATS if cat.personality == personality]

if __name__ == "__main__":
    # Test the cat profiles
    print("🐱 Welcome to the Cat Café! 🐱")
    print("\nOur adorable cats:")
    
    for cat in get_all_cats():
        print(f"- {cat}: {cat.personality}")
        print(f"  Says: {cat.meow()}")
        print()
    
    print(f"We have {len(get_available_cats())} cats available for adoption!")