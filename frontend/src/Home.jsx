import { split } from 'postcss/lib/list';
import { useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize';

import app from './App';
import { useNavigate } from 'react-router-dom';



const MUSCLE_MAP = {
    "chest": ['Upper Chest', 'Lower Chest'],
    "back": ["lats", "middle back", "lower back", "traps"],
    "legs": ["quadriceps", "hamstrings", "glutes", "calves"],
    "shoulders": ["front delts", "side delts", "rear delts"],
    "arms": ["biceps", "triceps", "forearms"],
    "abs": ["abdominals"]
}

const fileNames = [
  "seated plates rowing machine.jpg", "bend.jpg", "launge machine.jpg", 
  "pushups bar.jpg", "trx.jpg", "weight plate.jpg", "ab roller.jpg",
  "gym weight ball.jpg", "jumping rope.jpg", "bike machine.jpg",
  "cables rowing machine.jpg", "gym rings.jpg", "shoulder press machine.jpg",
  "leg extenstion.png", "Plate Loaded Hack Squat.jpg", "abs bench.jpg",
  "harmstring leg curl.jpg", "lateral raise machine.jpg", "one cable machine.jpg",
  "crossover machine.jpg", "Rowing machine.jpg", "standing cycle machine.jpg",
  "Leg press machine.jpg", "Leg extension machine.jpg", "smith machine.jpg",
  "gym step.jpg", "Leg abduction machine.jpg", "butterfly.jpg",
  "lat pulldown machine.jpg", "bench.jpg", "Plate Loaded chest press machine.jpg",
  "stairs machine.jpg", "treadmill.jpg", "dumbbells.jpg", "punching bag.jpg",
  "bench press.jpg", "Preacher bench.jpg", "Dip bar.jpg", "Pull up bar.jpg",
  "Push up bars.jpg", "assisted pull up tower.jpg", "butt bluster machine.jpg",
  "Standard barbell.jpg", "kettlebell.jpg", "curl bar.jpg",
  "triceps bar.jpg", "Glute ham developer.jpg", "Hyper extension bench.jpg",
  "Seated calf machine.jpg", "Leg curl machine.jpg", "Standing calf machine.jpg",
  "Pec deck machine.jpg", "Chest press machine.jpg", "Ab crunch machine.jpg"
];


const EQUIPMENT_DATA = fileNames.map(fileName => {
  const readableName = fileName
    .substring(0, fileName.lastIndexOf('.'))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return {
    id: fileName.substring(0, fileName.lastIndexOf('.')).toLowerCase(),
    name: readableName,
    img: `${import.meta.env.BASE_URL}equipment-images/${fileName}`
  };
});

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState(null); // To store the result from the AI
  const [validationError, setValidationError] = useState('');
  // 1. Create the 'memory' boxes for our data
  const [age, setAge] = useState();
  const [weight, setWeight] = useState();
  const [height, setHeight] = useState();
  const [gender, setGender] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [goals, setGoals] = useState([]);
  const [splitStrategy, setSplitStrategy] = useState('Recommended');
  const [daysPerWeek, setDaysPerWeek] = useState();
  const [timeAvailable, setTimeAvailable] = useState(60);
  const [customSplit, setCustomSplit] = useState('A/B');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [healthIssues, setHealthIssues] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [dumbbellInventory, setDumbbellInventory] = useState([]);
  const [plateWeightInventory, setPlateWeightInventory] = useState([]);
  const [kettlebellInventory, setKettlebellInventory] = useState([]);
  const [plateInputWeight, setPlateInputWeight] = useState(1);
  const [plateInputCount, setPlateInputCount] = useState(1);
  const [dumbbellInputWeight, setDumbbellInputWeight] = useState(1);
  const [dumbbellInputCount, setDumbbellInputCount] = useState(1);
  const [kettlebellInputWeight, setKettlebellInputWeight] = useState(1);
  const [kettlebellInputCount, setKettlebellInputCount] = useState(1);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setValidationError('');

    if(age < 16 || age > 120){
      setValidationError('Sorry, only users aged 16-120 can use this workout generator.');
      return;
    }

    if(weight <= 40){
      setValidationError('Please enter a valid weight greater than 40 kg.');
      return;
    }

    if(height <= 50){
      setValidationError('Please enter a valid height greater than 50 cm.');
      return;
    }

    if(!gender || gender === 'Select your gender'){
      setValidationError('Please select your gender or non-binary identity.');
      return;
    }

    if(!fitnessLevel || fitnessLevel === 'Select your fitness level'){
      setValidationError('Please select your fitness level.');
      return;
    }

    if(daysPerWeek < 1 || daysPerWeek > 7){
      setValidationError('Please enter a valid number of workout days per week (1-7).');
      return;
    }

    if(timeAvailable < 10 || timeAvailable > 180){
      setValidationError('The time available must be between 10 minutes and 180 minutes.');
      return;
    }
      if (goals.length === 0) {
      setValidationError('Please choose one goal before generating your workout.');
      return;
    }

    if (splitStrategy === 'Custom') {
      const selectedGroups = Object.entries(MUSCLE_MAP).filter(([, specifics]) =>
        specifics.some((m) => selectedMuscles.includes(m))
      ).length;

      let requiredGroups = 0;
      if (customSplit === 'A') requiredGroups = 1;
      else if (customSplit === 'A/B') requiredGroups = 2;
      else if (customSplit === 'A/B/C') requiredGroups = 3;

      if (selectedGroups < requiredGroups) {
        setValidationError(`For ${customSplit}, choose at least ${requiredGroups} muscle group${requiredGroups > 1 ? 's' : ''}.`);
        return;
      }
    }

    setIsLoading(true);
    
    // 1. Prepare the data object
    const userData = {
      gender: gender,
      age: parseInt(age),
      height: parseInt(height),
      weight: parseFloat(weight),
      fitness_level: fitnessLevel,
      goal: goals[0],
      health_issues: healthIssues,
      equipment: equipment,
      // We only send inventory for items the user actually selected

      weights_inventory: {
        dumbbells: equipment.includes('dumbbells') ? dumbbellInventory : undefined,
        "weight plate": equipment.includes('weight plate') ? plateWeightInventory : undefined,
        kettlebell: equipment.includes('kettlebell') ? kettlebellInventory : undefined
      },

      preferences: {
        time_available: timeAvailable,
        days_per_week: daysPerWeek,
        split_strategy: splitStrategy === 'Custom' ? `${splitStrategy} (${customSplit})` : splitStrategy
      },
      target_muscles: splitStrategy === 'Custom' ? selectedMuscles : undefined,


    };

    try {
      // Send to FastAPI backend
      const response = await fetch('https://ai-workout-creator.onrender.com/generate_weekly_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Backend failed to respond');

      const result = await response.json();
      navigate('/results', { state: { workoutPlan: result } }); // Navigate to results page
      
      // Scroll to the result
      // window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      
    } catch (error) {
      console.error("Error generating workout:", error);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  
  const inventoryMap = {
    dumbbells: { list: dumbbellInventory, setter: setDumbbellInventory, weightInput: dumbbellInputWeight, countInput: dumbbellInputCount, setWeight: setDumbbellInputWeight, setCount: setDumbbellInputCount },
    "weight plate": { list: plateWeightInventory, setter: setPlateWeightInventory, weightInput: plateInputWeight, countInput: plateInputCount, setWeight: setPlateInputWeight, setCount: setPlateInputCount },
    kettlebell: { list: kettlebellInventory, setter: setKettlebellInventory, weightInput: kettlebellInputWeight, countInput: kettlebellInputCount, setWeight: setKettlebellInputWeight, setCount: setKettlebellInputCount }
  };


  const addWeight = (weight, count, type) => {
    const w = parseFloat(weight);
    const c = parseInt(count);
    if (isNaN(w) || w <= 0 || isNaN(c) || c <= 0) {
      setValidationError('Please enter valid weight and count values.');
      return;
    }

    const { list, setter } = inventoryMap[type];
    const existingItem = list.find(item => item.weight === w);

    if (existingItem) {
      const updatedList = list.map(item => 
        item.weight === w ? { ...item, count: item.count + c } : item
      );
      setter(updatedList);
    } else {
      const newList = [...list, { weight: w, count: c }];
      setter(newList.sort((a, b) => a.weight - b.weight));
    }
  };

  const removeWeight = (weight, type) => {
    const {list, setter} = inventoryMap[type];
    const updatedList = list.filter(item => item.weight !== weight);
    setter(updatedList);
  };


  const toggleCategory = (category, specifics) => {
    // Check if ALL specifics are already selected
    const allSelected = specifics.every(m => selectedMuscles.includes(m));

    if (allSelected) {
      // If all are selected, remove them all (Deselect Category)
      setSelectedMuscles(selectedMuscles.filter(m => !specifics.includes(m)));
    } else {
      // Otherwise, add all of them, but avoid duplicates using Set
      setSelectedMuscles([...new Set([...selectedMuscles, ...specifics])]);
    }
  };
  
  console.log("Currently selected equipment IDs:", equipment);
  return (
    // The main background container
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
      
      <h1 className="text-3xl font-bold mb-8 text-blue-400">AI Workout Architect</h1>

      {/* 2. The User Card */}
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-semibold mb-6 border-b border-slate-700 pb-2">Biometrics</h2>
        {/*container for age, weight and height inputs*/}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Age Input */}
          <div className="w-full sm:flex-1 flex flex-col gap-2">
            <label className="block text-sm font-medium mb-2">Age</label>
            <input 
              max={120}
              min={16}
              type="number" 
              value={age}
              // This 'onChange' captures what you type and saves it to 'age'
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Weight Input */}
          <div className="w-full sm:flex-1 flex flex-col gap-2">
            <label className="block text-sm font-medium mb-2">Weight (kg)</label>
            <input 
              type="number"
              step ="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Height Input */}
          <div className="w-full sm:flex-1 flex flex-col gap-2">
            <label className="block text-sm font-medium mb-2">Height (cm)</label>
            <input 
              min={100}
              max={230}
              type="number" 
              step ="0.1"
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              onBlur={ () => {
                let val = parseFloat(height);
                if (val < 100) setHeight(100);
                else if (val > 230) setHeight(230); 
              }
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        
        {/* Gender Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Gender</label>
          <select 
            name='Gender'
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Health Issues Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Health Issues (won't be saved in our system)</label>
          <TextareaAutosize
            maxLength={1000}
            value={healthIssues}
            onChange={(e) => setHealthIssues(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=''
          />
        </div>

        {/* Fitness level Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Fitness Level</label>
          <select 
            name='Fitness Level'
            value={fitnessLevel}
            onChange={(e) => setFitnessLevel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your fitness level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        {/*day maps input*/}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Workout Days per Week (between 1 to 7)</label>
          <input 
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(parseInt(e.target.value, 10))}
            onBlur={ () => {
                let val = parseInt(daysPerWeek, 10);
                if (val > 7 || val < 1) setDaysPerWeek(3);
              }
            }
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/*time available per day input*/}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Time Available per Day (minutes)</label>
          <input 
            type="number"
            min={1}
            value={timeAvailable}
            onChange={(e) => setTimeAvailable(parseInt(e.target.value, 10))}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Goals Selection Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Goal</label>
          <div className="grid grid-cols-2 gap-3">
            {['Weight Loss', 'Hypertrophy', 'Endurance', 'Strength'].map((goal) => (
              <label
                key={goal}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                  goals[0] === goal
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="goal"
                  className="mr-2"
                  checked={goals[0] === goal}
                  onChange={() => {
                    setGoals([goal]);
                  }}
                />
                {goal}
              </label>
            ))}
          </div>
        </div>
        
        {/* Split Strategy Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 mt-4">Split Strategy</label>
          <div className="grid grid-cols-2 gap-3">
            {['Recommended', 'Full Body', 'Custom'].map((split) => (
              <button
                key={split}
                onClick={() => setSplitStrategy(split)}
                className={`w-full p-3 rounded-lg border text-center transition-all ${
                  splitStrategy === split
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {split}
              </button>
            ))}
          </div>
        </div>
        
        {/* Specific Split Strategy Selection (If Custom Split is selected)*/}
        {splitStrategy === 'Custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Custom Split</label>
            <div className="grid grid-cols-2 gap-3">
              {['A', 'A/B', 'A/B/C'].map((specificSplit) => (
                <button
                  key={specificSplit}
                  onClick={() => setCustomSplit(specificSplit)}
                  className={`w-full p-3 rounded-lg border text-center transition-all ${
                    customSplit === specificSplit
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  {specificSplit}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Muscle group selection (show If Custom Split is selected)*/}
        {splitStrategy === 'Custom' && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Muscles to focus on</label>
            <div className="flex flex-col gap-8-cols-2 gap-3">
              {Object.entries(MUSCLE_MAP).map(([category, specifics]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-blue-400">{category}</h3>
                    <button 
                      type="button"
                      onClick={() => toggleCategory(category, specifics)}
                      className="text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded"
                    >
                      {specifics.every(m => selectedMuscles.includes(m)) ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {specifics.map((muscle) => (
                      <label 
                        key={muscle}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedMuscles.includes(muscle)
                            ? 'bg-blue-600/20 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          className="mr-2"
                          checked={selectedMuscles.includes(muscle)}
                          onChange={() => {
                            if (selectedMuscles.includes(muscle)) {
                              setSelectedMuscles(selectedMuscles.filter(m => m !== muscle));
                            } else {
                              setSelectedMuscles([...selectedMuscles, muscle]);
                            }
                          }}
                        />
                        {muscle}
                      </label>  
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment Selection Section */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 text-blue-400">
            Available Equipment ({EQUIPMENT_DATA.length})
          </h2>
          <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar border border-slate-800 rounded-2xl p-4 bg-slate-900/30">    
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EQUIPMENT_DATA.map((item) => {
                const isSelected = equipment.includes(item.id);
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setEquipment(equipment.filter(e => e !== item.id));
                        if (item.id === 'dumbbells' || item.id === 'weight plate' || item.id === 'kettlebell') {
                          const { setter } = inventoryMap[item.id];
                          setter([]);
                        }
                      } else {
                        setEquipment([...equipment, item.id]);
                      }
                    }}
                    className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all duration-300 group
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/20' 
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'}`}
                  >
                    {/* Machine Image */}
                    <div className="w-full aspect-square mb-2 overflow-hidden rounded-lg bg-white p-1">
                      <img 
                        src={item.img} 
                        alt={item.name} 
                        className={`w-full h-full object-contain transition-all duration-300
                          ${isSelected ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}
                      />
                    </div>

                    {/* Machine Name */}
                    <span className={`text-[11px] font-bold uppercase text-center leading-tight
                      ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                      {item.name}
                    </span>

                    {/* Selection Checkmark */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Weight Inventory - Appears only if specific equipment is selected */}
        {(equipment.includes('dumbbells') || equipment.includes('weight plate') || equipment.includes('kettlebell')) && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-2">
              Weight Inventory (kg)
            </h3>


            {['dumbbells', 'weight plate', 'kettlebell'].map((id) => {

              const { list, setter, weightInput, countInput, setWeight, setCount } = inventoryMap[id];

              // Only show the input for the item if it's selected in the grid
              return equipment.includes(id) && (
                  <div key={id} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
                    <label className="block text-sm font-medium mb-3 capitalize">
                      {id.replace('-', ' ')} Available
                    </label>
                    
                  {/* Pair Input Row */}
                  <div className="flex flex-wrap items-end gap-3 mb-6">
                    <div className="flex-1 min-w-[100px]">
                      <p className="text-[10px] text-white mb-1 uppercase">Weight (kg)</p>
                      <input
                        type="number"
                        min={1}
                        value={weightInput}
                        onChange={(e) => setWeight(parseFloat(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div className="w-24">
                      <p className="text-[10px] text-white mb-1 uppercase">How many?</p>
                      <input
                        type="number"
                        min={1}
                        value={countInput}
                        onChange={(e) => setCount(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        addWeight(weightInput, countInput, id);
                      }}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl transition-all active:scale-95"
                    >
                      Add
                    </button>
                  </div>

                  {/* List of Pair "Pills" */}
                  <div className="flex flex-wrap gap-3">
                    {(list ?? []).map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-3 bg-slate-800 border border-slate-600 pl-4 pr-2 py-2 rounded-2xl group transition-all hover:border-blue-500"
                      >
                        <div className="flex flex-col">
                          <span className="text-white font-bold leading-none">{item.weight}kg</span>
                          <span className="text-[10px] text-blue-400 uppercase font-bold">Qty: {item.count}</span>
                        </div>
                        <button 
                          onClick={() => {
                            removeWeight(item.weight, id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  </div>
                );
            })}
          </div>
        )}

        <div className="mt-12 pb-20">
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-95
              ${isLoading 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Architecting your plan...
              </div>
            ) : (
              "Generate My AI Workout"
            )}
          </button>
          {validationError && (
            <div className="mt-3 text-sm text-red-300 bg-red-900/20 border border-red-600 rounded-lg p-2">
              {validationError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home