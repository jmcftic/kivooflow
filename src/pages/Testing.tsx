import React, { useState, useEffect } from 'react';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import InfoBanner from '../components/atoms/InfoBanner';
import { Button } from '../components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import ErrorModal from '../components/atoms/ErrorModal';
import SuccessModal from '../components/molecules/SuccessModal';
import { getTestingUser, resetUserClaims, TestingUserResponse } from '../services/network';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../constants/api';

const Testing: React.FC = () => {
  const { t } = useTranslation('navigation');
  const [user, setUser] = useState<TestingUserResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const TESTING_USER_ID = 62;
  
  // Verificar si estamos en producción (deshabilitar botón en producción)
  const PRODUCTION_API_URL = 'https://kivoo.kivooapp.co';
  const isProduction = API_BASE_URL === PRODUCTION_API_URL;

  useEffect(() => {
    loadTestingUser();
  }, []);

  const loadTestingUser = async () => {
    setIsLoading(true);
    try {
      const response = await getTestingUser();
      setUser(response.data);
    } catch (error: any) {
      console.error('Error al cargar usuario de pruebas:', error);
      setErrorMessage(error?.message || 'Error al cargar el usuario de pruebas');
      setErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetClaims = async () => {
    if (!user) return;

    setIsResetting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await resetUserClaims(TESTING_USER_ID);
      setSuccessMessage(response.message || `Claims reseteados exitosamente. ${response.data?.claimsReset || 0} claims fueron reseteados.`);
      setSuccessModalOpen(true);
      // Recargar el usuario después del reset
      await loadTestingUser();
    } catch (error: any) {
      console.error('Error al resetear claims:', error);
      let errorMsg = 'Error al resetear los claims. Por favor, intenta nuevamente.';
      
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.status === 403) {
        errorMsg = 'No tienes permiso para ejecutar esta acción. Solo usuarios autorizados pueden resetear claims.';
      } else if (error?.status === 401) {
        errorMsg = 'Tu sesión expiró. Por favor, inicia sesión nuevamente.';
      }

      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Navbar */}
        <DashboardNavbar title="Pruebas" />

        {/* Contenido */}
        <div className="relative z-20 mt-6 mb-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="size-8 text-white" />
            </div>
          ) : user ? (
            <div className="space-y-4">
              <InfoBanner className="w-full h-16" backgroundColor="#212020">
                <div className="w-full flex items-center px-6 py-2">
                  <div className="flex-1 grid grid-cols-3 gap-4 items-center text-sm text-white">
                    <div className="flex items-center justify-center">
                      <span
                        className="block w-full text-center truncate"
                        title={user.full_name}
                      >
                        {user.full_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span
                        className="block w-full text-center truncate"
                        title={user.email}
                      >
                        {user.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span
                        className="block w-full text-center truncate"
                        title={user.phone}
                      >
                        {user.phone}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={handleResetClaims}
                      disabled={isResetting || isLoading || !user || isProduction}
                      variant="yellow"
                      size="lg"
                      title={isProduction ? 'Esta función está deshabilitada en producción' : ''}
                    >
                      {isResetting ? (
                        <>
                          <Spinner className="size-4 text-black" />
                          <span>Reseteando...</span>
                        </>
                      ) : (
                        'RESET CLAIMS'
                      )}
                    </Button>
                  </div>
                </div>
              </InfoBanner>
            </div>
          ) : (
            <div className="text-center py-12 text-white/60">
              No se pudo cargar la información del usuario de pruebas.
            </div>
          )}
        </div>

        {/* SVG de esquina inferior derecha */}
        <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
          <Ki6SvgIcon
            width={2850.92}
            height={940.08}
            rotation={0}
            className="w-[80vw] sm:w-[60vw] lg:w-[50vw] h-auto border-0 outline-none"
          />
        </div>
      </div>

      {/* Modal de error */}
      <ErrorModal
        isOpen={errorModalOpen}
        onClose={() => setErrorModalOpen(false)}
        title="Error"
        message={errorMessage}
      />

      {/* Modal de éxito */}
      <SuccessModal
        open={successModalOpen}
        onOpenChange={setSuccessModalOpen}
        title="Éxito"
        message={successMessage}
      />
    </div>
  );
};

export default Testing;

