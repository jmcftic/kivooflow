import React, { useEffect, useState } from 'react';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import Logo from '../components/atoms/Logo';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import InfoBanner from '../components/atoms/InfoBanner';
import MiniBaner from '../components/atoms/MiniBaner';
import FullBanner from '../components/atoms/FullBanner';
import FoldedCard from '../components/atoms/FoldedCard';
import ResumenCard from '../components/organisms/ResumenCard';
import TransaccionesRecientesCard from '../components/organisms/TransaccionesRecientesCard';
import KivoMainBg from '../components/atoms/KivoMainBg';
import { User } from '../types/auth';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');

  useEffect(() => {
    // Cargar información del usuario del localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData: User = JSON.parse(userStr);
        setUser(userData);
        
        // Construir el link de referido
        if (userData.referral_code) {
          const link = `https://kivooapp.com/register?ref=${userData.referral_code}`;
          setReferralLink(link);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleCopyReferralLink = async () => {
    if (referralLink) {
      try {
        await navigator.clipboard.writeText(referralLink);
        console.log('Link copiado al portapapeles');
        // Aquí puedes agregar una notificación de éxito si tienes un sistema de notificaciones
      } catch (error) {
        console.error('Error al copiar link:', error);
      }
    }
  };

  const handleShareReferralLink = async () => {
    if (referralLink && navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a Kivoo',
          text: 'Únete a Kivoo usando mi link de referido',
          url: referralLink,
        });
      } catch (error) {
        console.error('Error al compartir:', error);
      }
    } else {
      // Fallback: copiar al portapapeles
      handleCopyReferralLink();
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
        <DashboardNavbar />

        {/* Info Banner - Justo debajo del navbar */}
        <div className="relative z-20">
          <InfoBanner>
            <h2 className="text-black text-xl  text-center">
              Banner informativo
            </h2>
          </InfoBanner>
        </div>

        {/* Mini Banners - Debajo del Info Banner */}
        <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mt-6">
          <MiniBaner 
            className="h-[90px] md:h-[100px] lg:h-[110px]"
            detail="0.00"
            subtitle="Ganancias totales"
          />
          <MiniBaner 
            className="h-[90px] md:h-[100px] lg:h-[110px]"
            detail="0.00"
            subtitle="Saldo disponible"
            actionButton={{
              text: "Solicitar pago",
              onClick: () => {
                // Aquí puedes agregar la lógica para abrir un modal o cambiar de página
                console.log("Solicitar pago clickeado");
              }
            }}
          />
        </div>

        {/* Full Banner - Debajo de los Mini Banners */}
        <div className="relative z-20 mt-6 mb-2">
          <FullBanner
            title="Link de referido"
            linkText={referralLink || 'Cargando...'}
            linkHref={referralLink}
            onLinkClick={() => {
              if (referralLink) {
                window.open(referralLink, '_blank');
              }
            }}
            onCopyClick={handleCopyReferralLink}
            onShareClick={handleShareReferralLink}
          />
        </div>

        {/* Mini Banners adicionales - Debajo del Full Banner */}
        <div className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6">
          <MiniBaner 
            className="h-[90px] md:h-[100px] lg:h-[110px]"
            detail="0"
            subtitle="Referidos Activos"
            showDollarSign={false}
          />
          <MiniBaner 
            className="h-[90px] md:h-[100px] lg:h-[110px]"
            detail="0.00"
            subtitle="Comisiones último mes"
          />
          <MiniBaner 
            className="h-[90px] md:h-[100px] lg:h-[110px]"
            detail="0.00"
            subtitle="Claims pendientes"
          />
        </div>

        {/* Resumen Card - Gráfico de barras */}
        <div className="relative z-20 mt-6 mb-6">
          <ResumenCard />
        </div>

        {/* Transacciones Recientes Card */}
        <div className="relative z-20 mb-8">
          <TransaccionesRecientesCard />
        </div>

        {/* Contenido principal centrado */}
        <div className="flex flex-col items-center justify-center flex-1 relative z-20">
         
        </div>

        {/* SVG de esquina en inferior derecha (debajo del patrón) */}
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

export default Dashboard;
