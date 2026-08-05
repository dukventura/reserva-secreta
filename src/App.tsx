import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProfileGrid } from './components/ProfileGrid';
import { ProfileModal } from './components/ProfileModal';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { AdvertiseModal } from './components/AdvertiseModal';
import { Footer } from './components/Footer';
import { mockProfiles } from './data/mockProfiles';
import type { EscortProfile, FilterState } from './types';

export function App() {
  const [filters, setFilters] = useState<FilterState>({
    city: 'Todas',
    category: 'Todas',
    searchQuery: '',
    onlyVerified: false,
  });

  const [selectedProfile, setSelectedProfile] = useState<EscortProfile | null>(null);
  const [isAdvertiseOpen, setIsAdvertiseOpen] = useState(false);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('guia_prime_18_confirmed') === 'true';
    } catch {
      return false;
    }
  });

  const handleConfirmAge = () => {
    try {
      sessionStorage.setItem('guia_prime_18_confirmed', 'true');
    } catch (e) {
      console.warn('sessionStorage is unavailable', e);
    }
    setIsAgeConfirmed(true);
  };

  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      city: 'Todas',
      category: 'Todas',
      searchQuery: '',
      onlyVerified: false,
    });
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Age Verification Overlay */}
      {!isAgeConfirmed && (
        <AgeVerificationModal onConfirm={handleConfirmAge} />
      )}

      {/* Main Header */}
      <Navbar onOpenAdvertise={() => setIsAdvertiseOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section & Filters */}
        <Hero
          filters={filters}
          onFilterChange={handleFilterChange}
          totalProfiles={mockProfiles.length}
        />

        {/* Directory Grid */}
        <ProfileGrid
          profiles={mockProfiles}
          filters={filters}
          onSelectProfile={(profile) => setSelectedProfile(profile)}
          onResetFilters={handleResetFilters}
        />
      </main>

      {/* Profile Details Modal */}
      {selectedProfile && (
        <ProfileModal
          profile={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}

      {/* Advertise Modal */}
      {isAdvertiseOpen && (
        <AdvertiseModal onClose={() => setIsAdvertiseOpen(false)} />
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}

export default App;
