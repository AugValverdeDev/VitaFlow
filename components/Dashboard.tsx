import React, { useState, useEffect } from 'react';
import { UserProfile, RoutineItem, HealthTip, JournalEntry } from '../types';
import { generateRoutines, generateDailyTips } from '../services/geminiService';
import { saveRoutine, getRoutines, saveJournalEntry, getJournalEntry } from '../services/dataService';
import Button from './Button';
import { Sun, Moon, Coffee, Briefcase, BookOpen, CheckCircle, ExternalLink, Activity, Sparkles, User, LogOut } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  user: any;
  profile: UserProfile;
  onLogout: () => void;
  onEditProfile: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, profile, onLogout, onEditProfile }) => {
  const [activeTab, setActiveTab] = useState<'routines' | 'tips' | 'journal'>('routines');
  const [routines, setRoutines] = useState<RoutineItem[]>([]);
  const [tips, setTips] = useState<HealthTip[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Journal State
  const [todayJournal, setTodayJournal] = useState<Partial<JournalEntry>>({
    completedRoutineIds: [],
    waterIntakeCups: 0,
    sleepHours: 7,
    mood: 3,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [profile.uid]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Check existing routines
      let loadedRoutines = await getRoutines(profile.uid);
      if (!loadedRoutines || loadedRoutines.length === 0) {
        loadedRoutines = await generateRoutines(profile);
        await saveRoutine(profile.uid, loadedRoutines);
      }
      setRoutines(loadedRoutines);

      // 2. Load today's journal
      const todayStr = new Date().toISOString().split('T')[0];
      const entry = await getJournalEntry(profile.uid, todayStr);
      if (entry) {
        setTodayJournal(entry);
      } else {
        // Reset journal for new day
        setTodayJournal({ 
            completedRoutineIds: [], 
            waterIntakeCups: 0, 
            sleepHours: 7, 
            mood: 3, 
            notes: '' 
        });
      }

      // 3. Generate tips (fresh every load for demo, ideally cached by date)
      const generatedTips = await generateDailyTips(profile);
      setTips(generatedTips);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutineToggle = async (id: string) => {
    const currentCompleted = todayJournal.completedRoutineIds || [];
    const newCompleted = currentCompleted.includes(id)
      ? currentCompleted.filter(c => c !== id)
      : [...currentCompleted, id];
    
    const updatedJournal = { ...todayJournal, completedRoutineIds: newCompleted };
    setTodayJournal(updatedJournal);
    
    // Auto-save
    const todayStr = new Date().toISOString().split('T')[0];
    await saveJournalEntry(profile.uid, { ...updatedJournal, date: todayStr } as JournalEntry);
  };

  const saveJournal = async () => {
     const todayStr = new Date().toISOString().split('T')[0];
     await saveJournalEntry(profile.uid, { ...todayJournal, date: todayStr } as JournalEntry);
     alert("Journal saved successfully!");
  }

  const getIconForCategory = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'exercise': return <Activity className="text-orange-500" />;
      case 'diet': return <Coffee className="text-green-500" />;
      case 'sleep': return <Moon className="text-indigo-500" />;
      case 'work': return <Briefcase className="text-blue-500" />;
      default: return <Sun className="text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-sage-600 text-white p-2 rounded-lg">
                <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-serif font-bold text-sage-900">VitaFlow</h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500 hidden md:block">Hello, {profile.displayName || user.email}</span>
             <button onClick={onEditProfile} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><User size={20} /></button>
             <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-full text-red-500"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        
        {/* Mobile Tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
          <button onClick={() => setActiveTab('routines')} className={`flex flex-col items-center text-xs ${activeTab === 'routines' ? 'text-sage-600' : 'text-slate-400'}`}>
            <Activity size={24} /> Routines
          </button>
          <button onClick={() => setActiveTab('tips')} className={`flex flex-col items-center text-xs ${activeTab === 'tips' ? 'text-sage-600' : 'text-slate-400'}`}>
            <Sparkles size={24} /> Daily Tips
          </button>
          <button onClick={() => setActiveTab('journal')} className={`flex flex-col items-center text-xs ${activeTab === 'journal' ? 'text-sage-600' : 'text-slate-400'}`}>
            <BookOpen size={24} /> Journal
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 mb-8">
          <Button variant={activeTab === 'routines' ? 'primary' : 'ghost'} onClick={() => setActiveTab('routines')}>My Routine</Button>
          <Button variant={activeTab === 'tips' ? 'primary' : 'ghost'} onClick={() => setActiveTab('tips')}>Daily Tips</Button>
          <Button variant={activeTab === 'journal' ? 'primary' : 'ghost'} onClick={() => setActiveTab('journal')}>Health Journal</Button>
        </div>

        {loading && (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
            </div>
        )}

        {!loading && activeTab === 'routines' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-sage-500 to-sage-700 rounded-3xl p-8 text-white mb-8">
                <h2 className="text-2xl font-serif font-bold mb-2">Today's Focus</h2>
                <p className="opacity-90">Consistency is key. You have completed {todayJournal.completedRoutineIds?.length} of {routines.length} tasks today.</p>
                <div className="w-full bg-white/20 h-2 rounded-full mt-4">
                    <div 
                        className="bg-white h-2 rounded-full transition-all duration-700" 
                        style={{ width: `${( (todayJournal.completedRoutineIds?.length || 0) / (routines.length || 1) ) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {routines.map((routine) => (
                <div 
                  key={routine.id} 
                  className={`group relative overflow-hidden bg-white p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${todayJournal.completedRoutineIds?.includes(routine.id) ? 'border-sage-300 bg-sage-50/50' : 'border-slate-100'}`}
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-sage-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4">
                            <div className="bg-slate-50 p-3 rounded-xl h-fit">
                                {getIconForCategory(routine.category)}
                            </div>
                            <div>
                                <h3 className={`font-semibold text-lg ${todayJournal.completedRoutineIds?.includes(routine.id) ? 'text-sage-800 line-through decoration-sage-400' : 'text-slate-800'}`}>
                                    {routine.title}
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">{routine.description}</p>
                                <div className="flex gap-3 mt-3">
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium uppercase tracking-wider">{routine.timeOfDay}</span>
                                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 font-medium">{routine.durationMinutes} mins</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRoutineToggle(routine.id)}
                            className={`p-2 rounded-full transition-colors ${todayJournal.completedRoutineIds?.includes(routine.id) ? 'bg-sage-100 text-sage-600' : 'text-slate-300 hover:text-sage-500'}`}
                        >
                            <CheckCircle size={28} fill={todayJournal.completedRoutineIds?.includes(routine.id) ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && activeTab === 'tips' && (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-sage-900">Expert Insights</h2>
                <p className="text-slate-500 mt-2">Curated daily tips from certified health organizations.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tips.map((tip) => (
                    <div key={tip.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
                        <div className="mb-4">
                            <span className="text-xs font-bold text-sage-600 bg-sage-50 px-2 py-1 rounded-md uppercase tracking-wide">
                                {tip.category}
                            </span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-3">{tip.title}</h3>
                        <div className="text-slate-600 text-sm mb-6 flex-grow">
                             <ReactMarkdown>{tip.content}</ReactMarkdown>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                             <span>Source: {tip.sourceName}</span>
                             <a href={tip.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sage-600 hover:text-sage-800 font-medium">
                                Verify <ExternalLink size={12} />
                             </a>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {!loading && activeTab === 'journal' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
             <div className="bg-white rounded-3xl shadow-xl shadow-sage-100/50 p-8 border border-sage-50">
                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="text-sage-600" />
                    <h2 className="text-2xl font-serif font-bold text-slate-800">Daily Check-In</h2>
                </div>

                <div className="space-y-8">
                    {/* Water */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Water Intake (Cups)</label>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setTodayJournal(prev => ({ ...prev, waterIntakeCups: Math.max(0, (prev.waterIntakeCups || 0) - 1) }))}
                                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-slate-50"
                            >-</button>
                            <span className="text-2xl font-bold w-12 text-center">{todayJournal.waterIntakeCups}</span>
                            <button 
                                onClick={() => setTodayJournal(prev => ({ ...prev, waterIntakeCups: (prev.waterIntakeCups || 0) + 1 }))}
                                className="w-10 h-10 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center hover:bg-sage-200"
                            >+</button>
                        </div>
                    </div>

                    {/* Mood */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">How do you feel today?</label>
                        <div className="flex justify-between bg-slate-50 p-2 rounded-xl">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => setTodayJournal(prev => ({ ...prev, mood: val }))}
                                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${todayJournal.mood === val ? 'bg-white shadow text-2xl scale-110' : 'opacity-50 hover:opacity-100'}`}
                                >
                                    {val === 1 ? '😫' : val === 2 ? '😕' : val === 3 ? '😐' : val === 4 ? '🙂' : '😁'}
                                </button>
                            ))}
                        </div>
                    </div>

                     {/* Sleep */}
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Hours Slept</label>
                        <input 
                            type="range" 
                            min="0" 
                            max="12" 
                            step="0.5"
                            className="w-full accent-sage-600"
                            value={todayJournal.sleepHours}
                            onChange={(e) => setTodayJournal(prev => ({ ...prev, sleepHours: parseFloat(e.target.value) }))}
                        />
                        <div className="text-center text-sm text-slate-500 mt-2">{todayJournal.sleepHours} hours</div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                        <textarea 
                            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none h-32 resize-none"
                            placeholder="Any pain points, small wins, or thoughts..."
                            value={todayJournal.notes}
                            onChange={(e) => setTodayJournal(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    <Button onClick={saveJournal} className="w-full justify-center">Save Daily Entry</Button>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;