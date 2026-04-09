'use client';

interface TextareaFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
}

export default function TextareaField({ label, placeholder, value, onChange, rows = 4 }: TextareaFieldProps) {
    return (
        <div className="group/field">
            <label className="text-[14px] font-black text-slate-800 tracking-widest uppercase mb-3 block opacity-80 group-hover/field:opacity-100 transition-opacity translate-x-1">{label}</label>
            <textarea
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder} 
                rows={rows}
                className="w-full bg-white/60 backdrop-blur-md border-0 ring-1 ring-black/[0.04] shadow-sm rounded-[24px] p-5 text-[17px] text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:ring-[6px] focus:ring-emerald-100/30 resize-none font-bold"
            />
        </div>
    );
}
