'use client';

// Authentication removed - always return null user and no loading state
export const useUser = () => {
  // Return null user and false loading since we don't need authentication
  return { user: null, loading: false };
};
