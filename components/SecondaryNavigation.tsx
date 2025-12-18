import React, { useRef, useState, useEffect } from 'react';

interface NavTab {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface SecondaryNavigationProps {
    tabs: NavTab[];
    activeTabId: string;
    onTabChange: (tabId: string) => void;
}

/**
 * SecondaryNavigation Component
 * 
 * Renders a horizontally scrollable navigation menu for sub-tabs.
 * This component ensures all options remain accessible on smaller screens
 * and allows smooth horizontal scrolling when content exceeds viewport width.
 * 
 * Features:
 * - Horizontal scroll container for sub-tabs
 * - Active tab indicator with blue border and background
 * - Responsive design that adapts to screen size
 * - Smooth scrolling behavior
 */
export const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({
    tabs,
    activeTabId,
    onTabChange,
}) => {
    const navContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);

    // Check for scroll position to show/hide fade indicators
    const checkScroll = () => {
        if (navContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = navContainerRef.current;
            
            // Show left fade when scrolled away from start
            setShowLeftFade(scrollLeft > 0);
            
            // Show right fade when there's more content to scroll
            setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        const container = navContainerRef.current;
        if (!container) return;

        // Check scroll on mount and when container size changes
        checkScroll();
        window.addEventListener('resize', checkScroll);
        container.addEventListener('scroll', checkScroll);

        return () => {
            window.removeEventListener('resize', checkScroll);
            container.removeEventListener('scroll', checkScroll);
        };
    }, [tabs]);

    // Scroll the container smoothly
    const scroll = (direction: 'left' | 'right') => {
        if (navContainerRef.current) {
            const scrollAmount = 200;
            const currentScroll = navContainerRef.current.scrollLeft;
            const targetScroll =
                direction === 'left'
                    ? currentScroll - scrollAmount
                    : currentScroll + scrollAmount;

            navContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth',
            });
        }
    };

    // Ensure active tab is visible when it changes
    useEffect(() => {
        const container = navContainerRef.current;
        if (!container) return;

        const activeTabElement = container.querySelector(
            `[data-tab-id="${activeTabId}"]`
        ) as HTMLElement;

        if (activeTabElement) {
            // Check if element is partially or fully out of view
            const containerRect = container.getBoundingClientRect();
            const elementRect = activeTabElement.getBoundingClientRect();

            if (elementRect.left < containerRect.left) {
                // Element is to the left, scroll left
                activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'start' });
            } else if (elementRect.right > containerRect.right) {
                // Element is to the right, scroll right
                activeTabElement.scrollIntoView({ behavior: 'smooth', inline: 'end' });
            }
        }
    }, [activeTabId]);

    return (
        <div className="relative bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            {/* Left Fade Indicator */}
            {showLeftFade && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-950 pointer-events-none z-10" />
            )}

            {/* Right Fade Indicator */}
            {showRightFade && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent dark:from-slate-950 pointer-events-none z-10" />
            )}

            {/* Scrollable Navigation Container */}
            <nav
                ref={navContainerRef}
                className="-mb-px flex overflow-x-auto scrollbar-hide"
                style={{
                    scrollBehavior: 'smooth',
                    // Hide scrollbar while maintaining scroll functionality
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                }}
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.id === activeTabId;

                    return (
                        <button
                            key={tab.id}
                            data-tab-id={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-shrink-0 py-3 px-4 text-center font-semibold flex items-center justify-center gap-2 transition-colors duration-200 text-sm whitespace-nowrap border-b-2 ${
                                isActive
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* CSS to hide scrollbar */}
            <style>{`
                nav::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};
