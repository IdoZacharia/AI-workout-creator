import json
import os

# --- CONFIGURATION (Crucial!) ---
# Check your actual folder name. GitHub zips usually end in "-main"
REPO_FOLDER = "free-exercise-db" 
# If you renamed the folder, change the line above!

DATA_FILE = os.path.join(REPO_FOLDER, "dist", "exercises.json")
IMAGES_FOLDER = os.path.join(REPO_FOLDER, "exercises")

def inspect():
    # 1. Safety Check: Does the folder exist?
    if not os.path.exists(REPO_FOLDER):
        print(f"❌ Error: I can't find the folder '{REPO_FOLDER}'")
        print("👉 Tip: Look at your folder list. Did you rename it? Is it just 'free-exercise-db'?")
        return

    # 2. Load the JSON
    print(f"🔄 Reading data from: {DATA_FILE}")
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: Found the folder, but not 'dist/exercises.json'.")
        return

    print(f"✅ Success! Loaded {len(data)} exercises.")

    # 3. Print the "Keys" (We need this for the AI logic)
    first_item = data[0]
    print("\n--- 🔎 The New Data Structure ---")
    print(f"Name: {first_item.get('name')}")
    print(f"Target Muscle Key: {first_item.get('primaryMuscles')}") # Likely 'primaryMuscles'
    print(f"Equipment Key: {first_item.get('equipment')}")          # Likely 'equipment'
    
    # 4. Check Images
    print("\n--- 🖼️ Image Check ---")
    # This DB uses a list of images, e.g., ["image1.jpg", "image2.jpg"]
    img_list = first_item.get('images', [])
    
    if img_list:
        test_img = img_list[0] # Take the first image name
        # The images are often in subfolders named after the exercise
        # But let's just check if the main folder exists for now
        if os.path.exists(IMAGES_FOLDER):
             print(f"✅ Image folder found. Example image listed: {test_img}")
        else:
             print("⚠️ Image folder missing.")
    else:
        print("⚠️ No images listed for this exercise.")

if __name__ == "__main__":
    inspect()