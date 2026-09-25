import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ShieldCheck, Lock, UserCheck, UserPlus, Radio, Award } from 'lucide-react';

interface LoginPageProps {
  onBypassLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBypassLogin }) => {
  const { loginWithRedirect } = useAuth0();

  const handleSignIn = () => {
    loginWithRedirect().catch((err) => {
      console.warn('Auth0 redirect error or unconfigured domain:', err);
      if (onBypassLogin) onBypassLogin();
    });
  };

  const handleRegister = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      },
    }).catch((err) => {
      console.warn('Auth0 signup redirect error:', err);
      if (onBypassLogin) onBypassLogin();
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-950 to-slate-950 z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 z-0" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* State Govt Emblem Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 border-b border-slate-800 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center mb-3 shadow-lg">
            <Award className="w-8 h-8 text-amber-400" />
          </div>
          <span className="bg-slate-800 text-amber-400 font-extrabold text-[10px] tracking-widest px-3 py-1 rounded-full uppercase mb-1.5 border border-amber-400/20">
            GOVERNMENT OF WEST BENGAL
          </span>
          <h1 className="text-2xl font-black tracking-wider text-white uppercase font-sans">
            CROPSENTINEL AI
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Department of Agriculture • Disaster Risk & Relief Portal
          </p>
        </div>

        {/* Security & Access Notice */}
        <div className="p-6 flex flex-col gap-5">
          <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white block font-semibold mb-0.5">RESTRICTED ACCESS PORTAL</strong>
              Authorized for Block Development Officers (BDO), Agricultural Extension Officers, and Disaster Management Command Personnel.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSignIn}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>OFFICER & PERSONNEL SIGN IN</span>
            </button>

            <button
              onClick={handleRegister}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-slate-300" />
              <span>REGISTER NEW FIELD ACCOUNT</span>
            </button>

            {/* Offline / Demo Quick Access Bypass */}
            {onBypassLogin && (
              <button
                onClick={onBypassLogin}
                className="w-full mt-1 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold py-2 px-3 rounded-lg border border-slate-800 text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400" />
                <span>DEV DEMO BYPASS (OFFICER ACCESS)</span>
              </button>
            )}
          </div>

          {/* Footer Security Badges */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" /> 256-BIT AUTH0 SSL
            </span>
            <span>HOOGHLY BASIN DIVISION v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
