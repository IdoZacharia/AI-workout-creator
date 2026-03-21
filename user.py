from enum import Enum

class User:
    def __init__(self, gender, age, height, weight, fitness_level, goal, schedule, health_issues, day_type, focus_muscles, time_available, equipment):
        self.Gender = gender
        self.Age = age
        self.Height = height
        self.Weight = weight
        self.FitnessLevel = fitness_level
        self.Goal = goal
        self.Schedule = schedule
        self.HealthIssues = health_issues
        self.DayType = day_type
        self.MusclesToFocus = focus_muscles
        self.Time = time_available
        self.Equipment = equipment
        
        
    # Optional: A helper to print the user nicely
    def __repr__(self):
        return f"User({self.Age}y/o, Goal: {self.Goal}, Focus: {self.MusclesToFocus})"

    # TODO: a function that pass through all the muscles the user want to focus on and calculate the exercises he can do with the equipment he has (using logic_engine.py)