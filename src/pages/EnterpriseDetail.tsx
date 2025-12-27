import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import SingleArrowHistory from '../components/atoms/SingleArrowHistory';
import EnterpriseInfoCardLarge from '../components/atoms/EnterpriseInfoCardLarge';
import EnterpriseInfoCardSmall from '../components/atoms/EnterpriseInfoCardSmall';
import { getLeaderByUserId, getTeamDetails } from '../services/network';
import { NetworkLeaderOwnedToB2C, TeamDetailsData } from '../types/network';

const EnterpriseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { enterpriseId, model } = useParams<{ enterpriseId: string; model?: string }>();
  const { t, i18n } = useTranslation(['network', 'commissions', 'common']);
  const [enterpriseName, setEnterpriseName] = useState<string>('X Billion');
  const [networkType, setNetworkType] = useState<string>('B2T');
  const [enterpriseFullName, setEnterpriseFullName] = useState<string>('X Billion');
  const [userEmail, setUserEmail] = useState<string>('usuario@ejemplo.com');
  const [leader, setLeader] = useState<NetworkLeaderOwnedToB2C | null>(null);
  const [teamDetails, setTeamDetails] = useState<TeamDetailsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [level, setLevel] = useState<number>(1);

  // Función para formatear valores monetarios
  const formatCurrency = (amount: number, currency: string = 'USDT'): string => {
    const locale = i18n.language === 'en' ? 'en-US' : 'es-MX';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Función para capitalizar cada palabra
  const capitalizeWords = (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const loadEnterpriseData = async () => {
      if (!enterpriseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userId = parseInt(enterpriseId, 10);
        const leaderType = model?.toUpperCase() === 'B2B' ? 'B2B' : 'B2T';
        
        // Cargar datos del líder para obtener el teamId
        const leaderData = await getLeaderByUserId(userId, leaderType);
        
        if (leaderData && leaderData.teamId != null) {
          setLeader(leaderData);
          setNetworkType(leaderType);

          // Cargar detalles del equipo usando el nuevo endpoint
          try {
            const details = await getTeamDetails(leaderData.teamId);
            if (details) {
              setTeamDetails(details);
              setEnterpriseName(details.teamName);
              setEnterpriseFullName(details.leaderFullName);
              setUserEmail(details.leaderEmail);
              setLevel(details.level);
            }
          } catch (error: any) {
            console.error('Error cargando detalles del equipo:', error);
            // Si hay error 403 o 404, mostrar mensaje apropiado
            if (error?.status === 403) {
              console.error('No tienes permisos para ver este equipo');
            } else if (error?.status === 404) {
              console.error('Equipo no encontrado');
            }
          }
        }
      } catch (error) {
        console.error('Error cargando datos del enterprise:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadEnterpriseData();
  }, [enterpriseId, model]);

  const handleBackToNetwork = () => {
    navigate('/network');
  };

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-0 pt-16 lg:pt-0">
        {/* Navbar - Vacío */}
        <DashboardNavbar title="" />

        {/* Contenido */}
        <div className="relative z-20 mt-4 mb-6 flex flex-col flex-1 min-h-0">
          {/* Row con Perfil y datos de la empresa */}
          <div className="mb-6 flex items-center justify-between w-full">
            {/* Perfil de X Billion - 303x50 */}
            <div className="w-[303px] h-[50px] flex items-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FFF100]" style={{ fontFamily: 'Archivo, sans-serif' }}>
                {t('network:enterpriseDetail.profileOf', { name: enterpriseName })}
              </h1>
            </div>
            
            {/* Información de la empresa - 242x54, alineado a la derecha */}
            <div className="w-[242px] h-[54px] flex flex-col justify-center items-end text-right">
              <div className="text-white font-bold text-sm">
                {capitalizeWords(enterpriseFullName)}
              </div>
              <div className="text-gray-400 text-sm mt-1 font-normal" style={{ fontFamily: 'Archivo, sans-serif' }}>
                {userEmail}
              </div>
            </div>
          </div>

          {/* Red B2T General con History */}
          <div className="mb-6 flex items-center text-white text-sm">
            <button 
              onClick={handleBackToNetwork}
              className="text-white hover:opacity-80 transition-opacity"
            >
              {t('network:networkGeneral', { tab: networkType })}
            </button>
            {teamDetails && (
              <>
                <SingleArrowHistory className="mx-2" />
                <span className="font-bold">{t('network:level')} {level}</span>
                <SingleArrowHistory className="mx-2" />
                <span className="font-bold">{enterpriseName}</span>
              </>
            )}
          </div>

          {/* Fila de 2 EnterpriseInfoCardLarge - Responsive: oculto en móvil, se estira hasta 2k en desktop */}
          <div 
            className="mb-6 hidden md:flex gap-[26px]"
            style={{
              maxWidth: '2000px'
            }}
          >
            <div className="flex-1 min-w-0">
              <EnterpriseInfoCardLarge
                primaryText={
                  loading || !teamDetails ? (
                    <>0.00 <span className="text-[#FFF100]">USDT</span></>
                  ) : (
                    <>
                      {formatCurrency(teamDetails.totalEarnings, 'USDT')} <span className="text-[#FFF100]">USDT</span>
                    </>
                  )
                }
                secondaryText={t('network:stats.totalEarnings')}
                height={172}
                className="w-full"
                showChart={true}
              />
            </div>
            <div className="flex-1 min-w-0">
              <EnterpriseInfoCardLarge
                primaryText={
                  loading || !teamDetails ? (
                    <>0.00 <span className="text-[#FFF100]">USDT</span></>
                  ) : (
                    <>
                      {formatCurrency(teamDetails.availableBalance, 'USDT')} <span className="text-[#FFF100]">USDT</span>
                    </>
                  )
                }
                secondaryText={t('network:stats.availableBalance')}
                height={172}
                className="w-full"
              />
            </div>
          </div>

          {/* Fila de 3 EnterpriseInfoCardSmall - Responsive: una columna en móvil, 3 columnas en desktop, se estiran hasta 2k */}
          <div 
            className="mb-6 flex flex-col md:flex-row gap-[26px]"
            style={{
              maxWidth: '2000px'
            }}
          >
            <div className="w-full md:flex-1 min-w-0">
              <EnterpriseInfoCardSmall
                primaryText={loading || !teamDetails ? '0' : teamDetails.activeReferrals.toString()}
                secondaryText={t('network:stats.activeReferrals')}
                height={129}
                className="w-full"
                showChart={true}
              />
            </div>
            <div className="w-full md:flex-1 min-w-0">
              <EnterpriseInfoCardSmall
                primaryText={loading || !teamDetails ? '0' : teamDetails.totalReferrals.toString()}
                secondaryText={t('network:stats.totalReferrals')}
                height={129}
                className="w-full"
              />
            </div>
            <div className="w-full md:flex-1 min-w-0">
              <EnterpriseInfoCardSmall
                primaryText={
                  loading || !teamDetails ? (
                    <>0.00 <span className="text-[#FFF100]">USDT</span></>
                  ) : (
                    <>
                      {formatCurrency(teamDetails.totalVolume, 'USDT')} <span className="text-[#FFF100]">USDT</span>
                    </>
                  )
                }
                secondaryText={t('network:stats.totalVolume')}
                height={129}
                className="w-full"
              />
            </div>
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

export default EnterpriseDetail;

