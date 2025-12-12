import React, { useState } from 'react';
import { loginWithGoogle } from '../services/dataService';
import Button from './Button';
import { Activity } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
    } catch (error) {
      console.error(error);
      alert("Login failed. Check console or make sure Mock Mode is on if no keys.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-sage-500">
        <div className="flex justify-center mb-6">
          <div className="bg-sage-100 p-4 rounded-full">
            <Activity className="text-sage-600" size={48} />
          </div>
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-sage-900 mb-2">Welcome to VitaFlow</h1>
        <p className="text-slate-500 mb-8">Your personalized journey to better health begins here.</p>

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin} 
            isLoading={isLoading} 
            className="w-full justify-center text-lg"
          >
             <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            Sign in with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">or continue with email</span>
            </div>
          </div>

          <form className="space-y-4 text-left" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sage-500 outline-none" placeholder="••••••••" />
            </div>
            <Button variant="secondary" className="w-full justify-center">Log In</Button>
          </form>

          <p className="text-xs text-slate-400 mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;