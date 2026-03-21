import json
import os

REPO_FOLDER = "free-exercise-db" 
DATA_FILE = os.path.join(REPO_FOLDER, "dist", "exercises.json")

class WorkoutFilter:
    def __init__(self, data_file):
        with open(data_file, 'r', encoding='utf-8') as f:
            self.exercises = json.load(f)
        # TODO: Open the JSON file and load the data into self.exercises
        # Hint: use json.load()

    def get_all_eq(self):
        # This function should return a list of full exercise objects.
        eq_list = []
        for ex in self.exercises:
            if ex.get('equipment') not in eq_list:
                eq_list.append(ex.get('equipment'))
        return eq_list

# --- TEST AREA (To verify your code works) ---
if __name__ == "__main__":
    # Create the filter
    my_filter = WorkoutFilter(DATA_FILE)
    
    # Run
    result = my_filter.get_all_eq()
    
    print(f"Found {len(result)} equipments in total.")
    # Print the first 3 names to check
    for eq in result:
        print(f"- {eq}")