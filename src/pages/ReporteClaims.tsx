import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import NetworkTabs from '../components/molecules/NetworkTabs';
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
import { Spinner } from '@/components/ui/spinner';

const ReporteClaims: React.FC = () => {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
        setIsDownloading(false);
        return;
      }

      const url = `${API_BASE_URL}${API_ENDPOINTS.DASHBOARD.CLAIMS_REPORT}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al descargar el reporte: ${response.statusText}`);
      }

      // Obtener el blob del archivo
      const blob = await response.blob();
      
      // Obtener el nombre del archivo del header Content-Disposition o usar uno por defecto
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'reporte-claims.xlsx'; // Nombre por defecto
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      // Crear un link temporal para descargar el archivo
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error('Error descargando reporte:', error);
      alert(error?.message || 'Error al descargar el reporte. Por favor, intenta nuevamente.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title="Reportes" />

        {/* Tabs - Tab "Claims" */}
        <div className="relative z-20 mt-4 mb-4">
          <NetworkTabs
            activeTab="b2c"
            onTabChange={() => {}}
            availableTabs={{
              b2c: true,
              b2b: false,
              b2t: false,
            }}
            tabHeight={55}
            customLabels={{
              b2c: 'Claims',
            }}
          />
        </div>

        {/* Contenido del reporte */}
        <div className="relative z-20 mt-6 mb-8">
          <div className="bg-[#212020] rounded-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-white text-xl font-semibold">Reporte Claims</h2>
              <button
                onClick={handleDownloadReport}
                disabled={isDownloading}
                className="bg-[#32d74b] hover:bg-[#2bc441] text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {isDownloading ? (
                  <>
                    <Spinner className="size-4 text-white" />
                    <span>Descargando...</span>
                  </>
                ) : (
                  <span>Descargar reporte</span>
                )}
              </button>
            </div>
            <p className="text-white/60">
              Aquí podrás descargar el reporte completo de todos los claims ya solicitados.
            </p>
          </div>
        </div>

        {/* SVG de esquina en inferior derecha */}
        <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden z-0">
          <Ki6SvgIcon
            width={2850.92}
            height={940.08}
            rotation={0}
            className="w-[80vw] sm:w-[60vw] lg:w-[50vw] h-auto border-0 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default ReporteClaims;

