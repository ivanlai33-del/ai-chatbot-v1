'use client';

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

export default function InputField({ label, placeholder, value, onChange }: InputFieldProps) {
    return (
        <div className="group/field">
            <label className="text-[12px] font-black text-slate-800 tracking-widest uppercase mb-1.5 block opacity-80 group-hover/field:opacity-100 transition-opacity translate-x-1">{label}</label>
            <input
                type="text" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder}
                className="w-full bg-white/60 backdrop-blur-md border-0 ring-1 ring-black/[0.04] shadow-sm rounded-[20px] px-6 py-3.5 text-[16px] font-bold text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:ring-[6px] focus:ring-emerald-100/30"
            />
        </div>
    );
}
