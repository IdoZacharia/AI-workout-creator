import json
import os

REPO_FOLDER = "free-exercise-db" 
DATA_FILE = os.path.join(REPO_FOLDER, "dist", "exercises.json")


class WorkoutFilter:
    def __init__(self, data_file):
        with open(data_file, 'r', encoding='utf-8') as f:
            self.exercises = json.load(f)

    def _is_equipment_valid(self, exercise_eq, user_eq_list):
        # If the equipment required for the exercise is "body weight" or None -> Return True
        if exercise_eq is None or exercise_eq.lower() == "body weight":
            return True
        # If the user has the equipment that required for the exercise -> Return True
        if exercise_eq.lower() in [eq.lower() for eq in user_eq_list]:
            return True
        return False

    def get_valid_exercises(self, target_muscle, user_equipment_list):
        # This function should return a list of full exercises the user can perform regarding the target muscle and equipment.
        valid_list = []
        for muscle in target_muscle:
            for ex in self.exercises:
                if muscle.lower() not in ex.get('primaryMuscles'):
                    continue
                if self._is_equipment_valid(ex.get('equipment'), user_equipment_list):
                    valid_list.append(ex)        
        return valid_list

