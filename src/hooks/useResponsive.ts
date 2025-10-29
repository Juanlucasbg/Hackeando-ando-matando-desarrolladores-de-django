import { useBreakpoint } from './useBreakpoint';

/**
 * Custom hook that provides responsive utility functions
 * Returns boolean flags for common device categories
 */
export const useResponsive = () => {
  const breakpoint = useBreakpoint();

  return {
    breakpoint,
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    isSmallScreen: breakpoint === 'xs',
    isMediumScreen: breakpoint === 'sm' || breakpoint === 'md',
    isLargeScreen: breakpoint === 'lg' || breakpoint === 'xl',
    isExtraLargeScreen: breakpoint === '2xl',
  };
};