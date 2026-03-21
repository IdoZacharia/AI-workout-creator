import json
import os

INPUT_FILE = 'cleaned_exercises.json'
OUTPUT_FILE = 'fixed_exercises.json'

def fix_machines():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: Could not find '{INPUT_FILE}'")
        return

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        exercises = json.load(f)

    print(f"🔍 Scanning {len(exercises)} exercises...")
    fixed_count = 0

    # Rules map: "Keyword in Name" -> "Specific Equipment"
    name_rules = {
        "treadmill": "treadmill",
        "elliptical": "elliptical machine",
        "stairmaster": "stairmaster",
        "step mill": "stepmill",
        "rowing": "rowing machine",
        "bike": "stationary bike",
        "bicycling": "stationary bike",
        "ab crunch": "ab crunch machine",
        "calf": "calf machine",
        "abductor": "abductor machine",
        "adductor": "adductor machine",
        "dip machine": "dip machine",
        "glute ham": "glute ham raise bench",
        "t-bar": "t-bar row",
        "squat": "squat machine",  # Covers "Lying Machine Squat"
        "chair": "chair"
    }

    for ex in exercises:
        # We only care about exercises labeled as generic "machine"
        if ex.get('equipment') == 'machine':
            
            name = ex.get('name', '').lower()
            instructions = " ".join(ex.get('instructions', [])).lower()
            
            found_match = False

            # Priority 1: Check Instructions for hidden gems (like Smith Machine)
            if "smith machine" in instructions:
                ex['equipment'] = "smith machine"
                found_match = True
            
            # Priority 2: Check Name against our rules
            if not found_match:
                for keyword, new_eq in name_rules.items():
                    if keyword in name:
                        ex['equipment'] = new_eq
                        found_match = True
                        break
            
            # Priority 3: Last Resort checks in instructions
            if not found_match:
                if "cable" in instructions or "pulley" in instructions:
                    ex['equipment'] = "cable"
                    found_match = True

            if found_match:
                fixed_count += 1
                print(f"✅ Fixed: '{ex['name']}' -> {ex['equipment']}")

    # Save the polished file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(exercises, f, indent=4)

    print(f"\n🎉 Done! Fixed {fixed_count} exercises.")
    print(f"💾 Saved to '{OUTPUT_FILE}'. Use this file for your app.")

if __name__ == "__main__":
    fix_machines()