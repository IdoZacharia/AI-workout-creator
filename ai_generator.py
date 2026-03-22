from logic_engine import WorkoutFilter
import google.generativeai as genai
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
        weights_as_dict = self.user_request.model_dump()["weights_inventory"]
        prompt = f"""
        Role: Elite Fitness Coach.
        Task: Create a complete {self.user_request.preferences.time_available}-minute workout for {self.user_request.preferences.days_per_week} days a week.
        Split Style: {self.user_request.preferences.split_strategy} (If 'Recommended', choose the best for the user's goal and days/week)

        --- USER PROFILE ---
        Stats: {self.user_request.gender}, {self.user_request.age} years old, {self.user_request.weight}kg and {self.user_request.height}cm.
        FitnessLevel: {self.user_request.fitness_level}
        Goal: {self.user_request.goal}
        Focus Muscles: {self.user_request.target_muscles} <-- CRITICAL: Focus ONLY on these.

       --- EXERCISES INVENTORY ---
        {inventory}

        --- EQUIPMENT AVAILABLE ---
        {", ".join(self.user_request.equipment)}

        WEIGHT INVENTORY (for exercises that require plates/dumbbells):
        {json.dumps(weights_as_dict, indent=2)}

        --- INSTRUCTIONS ---
        1. if you can - use exercises from the Inventory, if you can't find a perfect match or you think you have a better one, choose by yourself that fits the criterias.
        2. If the exercise require also weight plates or dumbbells use the exercise only if the user have them available.
        3. Create a logical flow (Compound -> Isolation).
        4. Assign sets/reps based on {self.user_request.goal}.

        --- QUANTITY RULES ---
        1. You MUST provide at least 6 exercises per workout day.
        2. Ensure the variety covers different angles of the target muscles.
        3. If the user has limited equipment, use creative variations (e.g., tempo changes, pause reps) to fill the routine.

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
