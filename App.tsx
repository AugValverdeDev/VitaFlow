import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import { subscribeToAuth, getUserProfile, saveUserProfile, logoutUser } from './services/dataService';
import { UserProfile } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'loading' | 'login' | 'onboarding' | 'dashboard'>('loading');

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch profile
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUserProfile(profile);
          setView('dashboard');
        } else {
          // New user, needs onboarding
          setView('onboarding');
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setView('login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOnboardingComplete = async (data: UserProfile) => {
    if (!user) return;
    const fullProfile = {
      ...data,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || data.displayName,
      photoURL: user.photoURL
    };
    await saveUserProfile(fullProfile);
    setUserProfile(fullProfile);
    setView('dashboard');
  };

  const handleEditProfile = () => {
    setView('onboarding');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sage-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50">
      {view === 'login' && <Login onLoginSuccess={() => {}} />}
      
      {view === 'onboarding' && (
        <Onboarding 
          initialData={userProfile || {}} 
          onComplete={handleOnboardingComplete} 
        />
      )}
      
      {view === 'dashboard' && userProfile && (
        <Dashboard 
          user={user} 
          profile={userProfile} 
          onLogout={logoutUser}
          onEditProfile={handleEditProfile}
        />
      )}
    </div>
  );
};

export default App;