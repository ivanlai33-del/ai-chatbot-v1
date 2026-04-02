/**
 * Global Authentication Utilities
 * Used for consistent session management across the entire application.
 */

export const AUTH_KEYS = {
    USER_ID: 'line_user_id',
    USER_NAME: 'line_user_name',
    USER_PICTURE: 'line_user_picture',
    PLAN_LEVEL: 'plan_level'
};

/**
 * Clears all user session data from both Cookies and LocalStorage.
 * Ensures that a logout on any page propagates to all other pages on the same domain.
 */
export const globalLogout = () => {
    if (typeof window === 'undefined') return;

    // 1. Clear LocalStorage
    localStorage.removeItem(AUTH_KEYS.USER_ID);
    localStorage.removeItem(AUTH_KEYS.USER_NAME);
    localStorage.removeItem(AUTH_KEYS.USER_PICTURE);
    localStorage.removeItem(AUTH_KEYS.PLAN_LEVEL);

    // 2. Clear SessionStorage (for good measure)
    sessionStorage.clear();

    // 3. Clear Cookies (Standard path and subdomains protection)
    const cookiesToClear = [
        AUTH_KEYS.USER_ID,
        AUTH_KEYS.USER_NAME,
        AUTH_KEYS.USER_PICTURE,
        AUTH_KEYS.PLAN_LEVEL
    ];

    cookiesToClear.forEach(cookieName => {
        // Expire cookie by setting max-age to 0 and date to past
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        
        // Also try to clear without path just in case
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });

    console.log('[Auth] Global Logout Performed. All session data cleared.');
};
