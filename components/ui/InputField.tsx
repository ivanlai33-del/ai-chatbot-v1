'use client';

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

export default function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
    return (
        <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block tracking-wide">{label}</label>
            <input
                type="text" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full bg-white border border-slate-200 hover:border-emerald-400 focus:border-emerald-500 rounded-2xl px-4 py-3 text-[15px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(6,199,85,0.12)] shadow-sm"
            />
        </div>
    );
}
