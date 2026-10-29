# War of Kings - Map and Resource Structure
import random

class Territory:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.resource_type = random.choice(['Timber', 'Wheat', 'Cattle', 'Stone'])
        self.owner = None

class Map:
    def __init__(self, width, height):
        self.grid = [[Territory(x, y) for y in range(height)] for x in range(width)]

class Game:
    def __init__(self):
        self.map = Map(10, 10) # Example 10x10 map
        self.resources = {'Timber': 0, 'Wheat': 0, 'Cattle': 0, 'Stone': 0}

print("Basic Map generated with randomized resources.")
