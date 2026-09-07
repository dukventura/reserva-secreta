import React from 'react';
import { Hero } from '../components/Hero';
import { ProfileGrid } from '../components/ProfileGrid';
import { mockProfiles } from '../data/mockProfiles';
import { useProfileFilters } from '../hooks/useProfileFilters';

export const HomePage: React.FC = () => {
  const { filters, handleFilterChange, handleResetFilters } = useProfileFilters();

  return (
    <>
      <Hero filters={filters} onFilterChange={handleFilterChange} totalProfiles={mockProfiles.length} />
      <ProfileGrid profiles={mockProfiles} filters={filters} onResetFilters={handleResetFilters} />
    </>
  );
};
