import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Phone, User, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PhoneModalProps {
  isOpen: boolean;
  onSave: (phone: string, name: string, role: string) => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ isOpen, onSave }) => {
  const { user } = useAuth0();

  const [name, setName] = useState<string>(user?.name || 'Officer In-Charge');
  const [digits, setDigits] = useState<string>('');
  const [role, setRole] = useState<string>('Block Development Officer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = digits.replace(/\D/g, '');
    if (cleanDigits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const formattedPhone = `+91 ${cleanDigits}`;

    try {
      localStorage.setItem('officer_phone', formattedPhone);
      localStorage.setItem('officer_name', name);
      localStorage.setItem('officer_role', role);

      // Register phone number on backend API
      await fetch('http://localhost:8000/api/v1/auth/register-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          phone: formattedPhone,
          role: role,
        }),
      });
    } catch (err) {
      console.warn('Backend phone registration API skipped or unreachable:', err);
    } finally {
      setIsSubmitting(false);
      onSave(formattedPhone, name, role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-5 border-b border-slate-800 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-400/10 border-2 border-amber-400 flex items-center justify-center mb-2 shadow-md">
            <Phone className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-wide">
            EMERGENCY TELEPHONY ONBOARDING
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Register your mobile contact for real-time IVR broadcast & SMS alerts
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" /> Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-sky-400 transition"
              placeholder="e.g. Saptarshi Ghosh"
            />
          </div>

          {/* Mobile Number with +91 prefix */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Mobile Number (+91)
            </label>
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 border border-slate-700 text-amber-400 font-extrabold text-xs px-3 py-2 rounded-lg select-none">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={digits}
                onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))}
                className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono font-bold rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400 transition"
                placeholder="10-digit mobile number"
              />
            </div>
            {error && <span className="text-red-400 text-[11px] font-bold mt-0.5">{error}</span>}
          </div>

          {/* Role Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Officer Designation / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-400 transition cursor-pointer"
            >
              <option value="Block Development Officer">Block Development Officer (BDO)</option>
              <option value="Gram Pradhan / Sarpanch">Gram Pradhan / Sarpanch</option>
              <option value="Relief Coordinator">Disaster Relief Coordinator</option>
            </select>
          </div>

          {/* Action Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>{isSubmitting ? 'REGISTERING PHONE...' : 'SAVE EMERGENCY CONTACT'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PhoneModal;
