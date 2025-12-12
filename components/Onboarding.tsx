import React, { useState } from 'react';
import { UserProfile, Gender, DietType, ActivityLevel } from '../types';
import Button from './Button';
import { Calendar, Ruler, Weight, Activity, Cigarette, Wine, Heart, Brain, Clock } from 'lucide-react';

interface OnboardingProps {
  initialData: Partial<UserProfile>;
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ initialData, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    ...initialData,
    smoker: false,
    drinker: false,
    diet: DietType.None,
    exerciseFrequency: ActivityLevel.Sedentary,
    isProfileComplete: true
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateBMI = (h: number, w: number) => {
    if (h && w) {
      const heightInM = h / 100;
      return parseFloat((w / (heightInM * heightInM)).toFixed(1));
    }
    return 0;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Final calculations
      const bmi = calculateBMI(formData.height || 0, formData.weight || 0);
      onComplete({ ...formData, bmi } as UserProfile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-sage-900 mb-2">Build Your Health Profile</h2>
        <p className="text-slate-600">Let's tailor your experience. Step {step} of 3.</p>
        <div className="w-full bg-sage-100 h-2 rounded-full mt-4">
          <div 
            className="bg-sage-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-sage-100 border border-sage-50 min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-sage-100 p-2 rounded-lg text-sage-700"><Ruler size={20} /></span>
              Basic Vitals
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="date"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 focus:border-transparent outline-none"
                    value={formData.birthDate || ''}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none bg-white"
                  value={formData.gender || ''}
                  onChange={(e) => handleChange('gender', e.target.value as Gender)}
                >
                  <option value="">Select...</option>
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="number"
                    placeholder="170"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none"
                    value={formData.height || ''}
                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="number"
                    placeholder="70"
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none"
                    value={formData.weight || ''}
                    onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-sage-100 p-2 rounded-lg text-sage-700"><Activity size={20} /></span>
              Lifestyle
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dietary Preference</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none bg-white"
                  value={formData.diet || DietType.None}
                  onChange={(e) => handleChange('diet', e.target.value as DietType)}
                >
                  {Object.values(DietType).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Exercise Frequency</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none bg-white"
                  value={formData.exerciseFrequency || ActivityLevel.Sedentary}
                  onChange={(e) => handleChange('exerciseFrequency', e.target.value as ActivityLevel)}
                >
                  {Object.values(ActivityLevel).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="flex gap-6 pt-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl hover:bg-slate-50 transition w-1/2">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 text-sage-600 rounded focus:ring-sage-500"
                    checked={formData.smoker}
                    onChange={(e) => handleChange('smoker', e.target.checked)}
                  />
                  <Cigarette className="text-slate-400" />
                  <span className="font-medium text-slate-700">Smoker?</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl hover:bg-slate-50 transition w-1/2">
                  <input 
                    type="checkbox"
                    className="w-5 h-5 text-sage-600 rounded focus:ring-sage-500"
                    checked={formData.drinker}
                    onChange={(e) => handleChange('drinker', e.target.checked)}
                  />
                  <Wine className="text-slate-400" />
                  <span className="font-medium text-slate-700">Drinker?</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
             <h3 className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-sage-100 p-2 rounded-lg text-sage-700"><Heart size={20} /></span>
              Health & Schedule
            </h3>

            <div className="space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Health Conditions (Optional)</label>
                <textarea 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none h-20 resize-none"
                  placeholder="e.g., Asthma, Diabetes, Hypertension..."
                  value={formData.healthConditions || ''}
                  onChange={(e) => handleChange('healthConditions', e.target.value)}
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mental Health (Optional)</label>
                <div className="relative">
                    <Brain className="absolute left-3 top-3 text-slate-400" size={18} />
                    <textarea 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none h-20 resize-none"
                    placeholder="e.g., Anxiety, High Stress, Insomnia..."
                    value={formData.mentalConditions || ''}
                    onChange={(e) => handleChange('mentalConditions', e.target.value)}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usual Wake Time</label>
                    <input 
                        type="time"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                        value={formData.wakeTime || '07:00'}
                        onChange={(e) => handleChange('wakeTime', e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Usual Sleep Time</label>
                    <input 
                        type="time"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                        value={formData.sleepTime || '23:00'}
                        onChange={(e) => handleChange('sleepTime', e.target.value)}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work/Study Schedule</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none"
                        placeholder="e.g., Mon-Fri 9-5, Night shifts"
                        value={formData.workSchedule || ''}
                        onChange={(e) => handleChange('workSchedule', e.target.value)}
                    />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>
        ) : <div />}
        
        <Button onClick={handleNext}>
          {step === 3 ? 'Complete Profile' : 'Next Step'}
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;