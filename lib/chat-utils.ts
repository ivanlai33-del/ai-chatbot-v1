export function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let sid = localStorage.getItem('brand_dna_session_id');
    if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem('brand_dna_session_id', sid);
    }
    return sid;
}

export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
