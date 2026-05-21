/**
 * Generates the JavaScript bookmarklet loader.
 * This is a tiny script that pulls the full sync logic from our backend.
 * This avoids URL length limits and syntax encoding issues in the bookmark bar.
 */
export const generateLineSyncScript = (setupToken: string, domain: string, webhookUrl: string): string => {
    // Standard loader pattern: create a script element and point it to our API
    const loaderCode = `(function(){
        var s=document.createElement('script');
        s.src='${domain}/api/line/script?t=${setupToken}&d=${domain}&w=${encodeURIComponent(webhookUrl)}';
        document.body.appendChild(s);
    })()`;

    // Minify the loader (preserve at least one space for keywords)
    const minified = loaderCode.replace(/\s+/g, ' ').trim();
    
    return 'javascript:' + minified;
};
