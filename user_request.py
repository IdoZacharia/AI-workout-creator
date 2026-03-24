from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, List, Optional

# class Gender(str, Enum):
#     MALE = "Male"
#     FEMALE = "Female"
#     NON_BINARY = "Non-binary"

# class FitnessLevel(str, Enum):
#     BEGINNER = "Beginner"
#     INTERMEDIATE = "Intermediate"
#     ADVANCED = "Advanced"

# class GoalType(str, Enum):
#     HYPERTROPHY = "Hypertrophy"
#     STRENGTH = "Strength"
#     ENDURANCE = "Endurance"
#     WeightLoss = "Weight Loss"

# class SplitStrategy(str, Enum):
#     RECOMMENDED = "Recommended" # AI decides based on days/week
#     FULL_BODY = "Full Body"     # Force Full Body regardless of days
#     CUSTOM = "Custom (A/B/C)"   # User uses Checkboxes


class UserPreferences(BaseModel):
    time_available: int
    days_per_week: int
    split_strategy: str 

class WeightPair(BaseModel):
    weight: float
    count: int

class weights_Inventory(BaseModel):
    dumbbells: Optional[List[WeightPair]] = None
    weight_plates: Optional[List[WeightPair]] = Field(None, alias="weight plate")
    kettlebell: Optional[List[WeightPair]] = None
class UserRequest(BaseModel):
    gender: str
    age: int
    height: int
    weight: int
    fitness_level: str
    goal: str              
    health_issues: str           
    equipment: List[str]
    weights_inventory: weights_Inventory
    preferences: UserPreferences
    target_muscles: Optional[List[str]] = None
        