import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { AgeVerificationModal } from '../components/AgeVerificationModal';

/* Casca das paginas publicas do diretorio: Navbar + Footer fixos, com
   o portao de idade por cima ate ser confirmado. As paginas de dentro
   (home, cidade, perfil, cadastro) entram via <Outlet />. */
export const PublicLayout: React.FC = () => {
  const [isAgeConfirmed, setIsAgeConfirmed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('reservasecreta_18_confirmed') === 'true';
    } catch {
      return false;
    }
  });

  const handleConfirmAge = () => {
    try {
      sessionStorage.setItem('reservasecreta_18_confirmed', 'true');
    } catch (e) {
      console.warn('sessionStorage is unavailable', e);
    }
    setIsAgeConfirmed(true);
  };

  return (
    <div className="min-h-screen bg-onix text-marfim flex flex-col font-sans selection:bg-ouro selection:text-black">
      {!isAgeConfirmed && <AgeVerificationModal onConfirm={handleConfirmAge} />}
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
