import random
import string

from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from user import User
from typing import Dict, List, Literal, Optional
from logic_engine import WorkoutFilter, DATA_FILE
from ai_generator import WorkoutPlanner
from enum import Enum
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json
import google.generativeai as genai
import os
from user_request import UserRequest, WeightPair, UserPreferences


gemini_api_key = os.getenv("GEMINI_API_KEY")
# Note: Ensure you have the latest SDK installed for 'from google import genai'
# Or use: import google.generativeai as genai (standard library)

origins = [
    "https://idozacharia.github.io"
    "https://idozacharia.github.io/ai-workouts-creator",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

muscles_list = ["chest", "lats", "middle back", "lower back", "traps", "quadriceps", "hamstrings", "glutes", "calves", "shoulders", "biceps", "triceps", "forearms", "abdominals"]

@app.post("/generate_weekly_plan")
def generate_weekly_plan_endpoint(request: UserRequest):
    try:
        print(f"🚀 Request: {request.preferences.split_strategy} ({request.preferences.days_per_week} days)")

        db_filter = WorkoutFilter("cleaned_exercises.json")
        master_inventory = []
        if request.preferences.split_strategy == "custom":
            target_muscles = request.target_muscles
        else: #request.preferences.split_strategy == "full_body" || "custome"
            target_muscles = muscles_list

        for muscle in target_muscles:
            valid = db_filter.get_valid_exercises(muscle, request.equipment)
            random.shuffle(valid) # Shuffle to add variety
            master_inventory.extend(valid[:15])

        if request.preferences.split_strategy == "recommended":
            target_muscles = ["recommended regard goal and days/week"]
            
        unique_inv = {v['id']: v for v in master_inventory}.values()
        
        master_inventory = list(unique_inv)
            
        planner = WorkoutPlanner(request, master_inventory, api_key=gemini_api_key)
        weekly_json = planner.generate_weekly_plan()
        
        return json.loads(weekly_json)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail="The coach is busy, try again later.")