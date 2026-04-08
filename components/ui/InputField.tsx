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
                className="w-full bg-white border-2 border-slate-200 hover:border-slate-400 focus:border-emerald-500 rounded-2xl p-[25px] text-[15px] text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 focus:shadow-[0_0_0_4px_rgba(6,199,85,0.12)] shadow-sm"
            />
        </div>
    );
}
