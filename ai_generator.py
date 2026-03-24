from logic_engine import WorkoutFilter
from google import genai
import os
from user import User
import json


gemini_api_key = os.getenv("GEMINI_API_KEY")
# --- The Planner Class ---
class WorkoutPlanner:
    def __init__(self, user_request, possible_exercises, api_key):
        self.user_request = user_request
        self.possible_exercises = possible_exercises
        self.client = genai.Client(api_key=api_key) 

    def gather_inventory(self):
        ex_prompt = ""
        for ex in self.possible_exercises:
            ex_prompt += f"- {ex['name']} (Target: {ex.get('primaryMuscles', [])}, Type: {ex.get('mechanic', 'N/A')})\n"
        return ex_prompt

    def generate_weekly_plan(self):
        inventory = self.gather_inventory()
        weights_inventory = self.user_request.weights_inventory
        db_list = [f"{i.count}x{i.weight}kg" for i in weights_inventory.dumbbells] if weights_inventory.dumbbells else []
        plates_list = [f"{i.count}x{i.weight}kg" for i in weights_inventory.weight_plates] if weights_inventory.weight_plates else []
        kb_list = [f"{i.count}x{i.weight}kg" for i in weights_inventory.kettlebell] if weights_inventory.kettlebell else []

        db_str = ", ".join(db_list) if db_list else "None"
        plates_str = ", ".join(plates_list) if plates_list else "None"
        kb_str = ", ".join(kb_list) if kb_list else "None"


        prompt = f"""
        Role: Elite Fitness Coach.
        Task: Create a complete {self.user_request.preferences.time_available}-minute workout for {self.user_request.preferences.days_per_week} days a week.
        Split Style: {self.user_request.preferences.split_strategy} (If 'Recommended', choose the best for the user's goal and days/week)

        --- USER PROFILE ---
        Stats: {self.user_request.gender}, {self.user_request.age} years old, {self.user_request.weight}kg and {self.user_request.height}cm.
        FitnessLevel: {self.user_request.fitness_level}
        Goal: {self.user_request.goal}
        Focus Muscles: {self.user_request.target_muscles} <-- CRITICAL: Focus ONLY on these.
        Health Constraints: {self.user_request.health_issues if self.user_request.health_issues else 'None'}

       --- EXERCISES INVENTORY ---
        {inventory}

        --- EQUIPMENT AVAILABLE ---
        {", ".join(self.user_request.equipment)}

        WEIGHT INVENTORY (Use ONLY these weights and for exercises that require plates/dumbbells):
        - Dumbbells: {db_str}
        - Weight Plates: {plates_str}
        - Kettlebells: {kb_str}

        --- INSTRUCTIONS ---
        1. if you can - use exercises from the Inventory, if you can't find a perfect match or you think you have a better one, choose by yourself that fits the criterias.
        2. If the exercise require also weight plates or dumbbells use the exercise only if the user have them available.
        3. Make sure the user health constraints are respected (e.g., avoid high-impact exercises for joint issues).
        4. If a user has "1x20kg" dumbbell, you CANNOT suggest a "2-arm dumbbell press" with 20kg. 
           You must suggest a "Single-arm press" or use a weight they have 2 of.
        5. For Barbell exercises, calculate total weight: 20kg (bar) + sum of plates used.
        6. Create a logical flow (Compound -> Isolation).
        7. Assign sets/reps based on {self.user_request.goal}.

        --- QUANTITY RULES ---
        1. Ensure the variety covers different angles of the target muscles.

        --- OUTPUT FORMAT (JSON) ---
        {{
            "split_name": "...",
            "weekly_routine": [
                {{
                    "day_name": "...",
                    "exercises": [
                        {{ 
                            "name": "...", 
                            "sets": 3, 
                            "reps": "10-12", 
                            "recommended_weight": "Use your 20kg dumbbells", 
                            "coaching_tip": "Focus on the eccentric phase" 
                            "recovery_time": "60 seconds"
                        }}
                    ]
                }}
            ]
        }}
        """
        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash", 
                contents=prompt,
                config={'response_mime_type': 'application/json'}
            )
            return response.text
        except Exception as e:
            raise Exception(f"AI Generation failed: {str(e)}")
