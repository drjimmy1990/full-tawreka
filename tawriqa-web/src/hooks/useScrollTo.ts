import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useScrollTo = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Function to trigger the scroll
    const scrollTo = (elementId: string) => {
        if (location.pathname !== '/') {
            // If not on Home, go there and tell it to scroll
            navigate('/', { state: { scrollTo: elementId } });
        } else {
            // If already on Home, just scroll
            handleScroll(elementId);
        }
    };

    // 2. The actual scrolling logic
    const handleScroll = (elementId: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            const headerOffset = 100; // Height of sticky header + extra padding
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // 3. Effect to handle incoming navigation from other pages
    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            // Small delay to ensure DOM is loaded
            const timer = setTimeout(() => {
                handleScroll(location.state.scrollTo);

                // Clear state so it doesn't scroll again on refresh
                window.history.replaceState({}, document.title);
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [location]);

    return { scrollTo };
};
