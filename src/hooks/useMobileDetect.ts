import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 */
export const useMobileDetect = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        // Check user agent
        const checkMobile = () => {
            const userAgent =
                typeof navigator === 'undefined' ? '' : navigator.userAgent;
            const isMobileDevice =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    userAgent
                );
            const isPortrait = window.innerWidth <= 768 || isMobileDevice;
            const isLandscapeMode = window.innerHeight < window.innerWidth;

            setIsMobile(isPortrait);
            setIsLandscape(isLandscapeMode);
        };

        checkMobile();

        window.addEventListener('resize', checkMobile);
        window.addEventListener('orientationchange', checkMobile);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('orientationchange', checkMobile);
        };
    }, []);

    return { isMobile, isLandscape };
};

export default useMobileDetect;
