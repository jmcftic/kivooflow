import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SidebarItem from '../atoms/SidebarItem';
import DashboardIcon from '../atoms/DashboardIcon';
import ClaimsIcon from '../atoms/ClaimsIcon';
import CardAcquisitionIcon from '../atoms/CardAcquisitionIcon';
import CommissionsIcon from '../atoms/CommissionsIcon';
import NetworkIcon from '../atoms/NetworkIcon';
import ActivityIcon from '../atoms/ActivityIcon';
import ReportsIcon from '../atoms/ReportsIcon';
import HelpIcon from '../atoms/HelpIcon';
import ManualLoadsIcon from '../atoms/ManualLoadsIcon';
import SidebarDivider from '../atoms/SidebarDivider';
import SidebarLogoutItem from '../atoms/SidebarLogoutItem';
import { User } from '../../types/auth';

interface SidebarNavigationProps {
  className?: string;
  isCollapsed?: boolean;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ className = "", isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('navigation');
  const [user, setUser] = useState<User | null>(null);

  // IDs permitidos para acceder a Reportes
  const allowedReportUserIds = ['49', '335', '57', '291', '53'];

  useEffect(() => {
    // Cargar información del usuario del localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData: User = JSON.parse(userStr);
        setUser(userData);
        // Debug: verificar el ID del usuario
        // console.log('User ID:', userData.id, 'Type:', typeof userData.id);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    }
  }, []);

  // Verificar si el usuario tiene acceso a Reportes
  // Convertir ambos lados a string para asegurar la comparación correcta
  const hasReportsAccess = user && allowedReportUserIds.includes(String(user.id));
  
  // Verificar si el usuario tiene acceso a Cargas manuales (mismos IDs que Reportes)
  const hasManualLoadsAccess = user && allowedReportUserIds.includes(String(user.id));
  
  // Debug: verificar acceso a reportes
  // useEffect(() => {
  //   if (user) {
  //     console.log('Checking reports access:', {
  //       userId: user.id,
  //       userIdType: typeof user.id,
  //       allowedIds: allowedReportUserIds,
  //       hasAccess: hasReportsAccess
  //     });
  //   }
  // }, [user, hasReportsAccess]);

  const primaryNavItems = useMemo(() => {
    const items = [
      {
        key: 'dashboard',
        label: t('menu.dashboard'),
        icon: <DashboardIcon />,
        path: '/dashboard',
        disabled: false,
      },
      {
        key: 'claims',
        label: t('menu.claims'),
        icon: <ClaimsIcon />,
        path: '/claims',
        disabled: false,
      },
      {
        key: 'card',
        label: t('menu.cardAcquisition'),
        icon: <CardAcquisitionIcon />,
        path: '/card-acquisition',
        disabled: true,
      },
      {
        key: 'commissions',
        label: t('menu.commissions'),
        icon: <CommissionsIcon />,
        path: '/commissions',
        disabled: false,
      },
      {
        key: 'network',
        label: t('menu.network'),
        icon: <NetworkIcon />,
        path: '/network',
        disabled: false,
      },
      {
        key: 'activity',
        label: t('menu.activity'),
        icon: <ActivityIcon />,
        path: '/activity',
        disabled: true,
      },
    ];

    // Agregar Reportes después de Actividad si el usuario tiene acceso
    if (hasReportsAccess) {
      items.push({
        key: 'reports',
        label: t('menu.reports'),
        icon: <ReportsIcon />,
        path: '/reports/claims',
        disabled: false,
      });
    }

    // Agregar Cargas manuales después de Reportes si el usuario tiene acceso
    if (hasManualLoadsAccess) {
      items.push({
        key: 'manual-loads',
        label: t('menu.manualLoads'),
        icon: <ManualLoadsIcon />,
        path: '/manual-loads',
        disabled: false,
      });
    }

    return items;
  }, [hasReportsAccess, hasManualLoadsAccess, user?.id, t]);

  const helpItem = useMemo(() => ({
    key: 'help',
    label: t('menu.help'),
    icon: <HelpIcon />,
    path: '/help',
    disabled: true,
  }), [t]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="space-y-2 flex-1">
      {primaryNavItems.map((item) => (
        <SidebarItem
          key={item.key}
          icon={item.icon}
          label={item.label}
          isActive={!item.disabled && (location.pathname === item.path || (item.key === 'reports' && location.pathname.startsWith('/reports')) || (item.key === 'manual-loads' && location.pathname.startsWith('/manual-loads')))}
          isCollapsed={isCollapsed}
          onClick={!item.disabled ? () => navigate(item.path) : undefined}
          disabled={item.disabled}
          disabledMessage={t('messages.moduleComingSoon')}
        />
      ))}
      
      {/* Línea divisoria */}
      {!isCollapsed && (
        <div className="mt-4">
          <SidebarDivider />
        </div>
      )}
      
      {/* Elemento Ayuda */}
      <div className="mt-4">
        <SidebarItem
          key={helpItem.key}
          icon={helpItem.icon}
          label={helpItem.label}
          isActive={false}
          isCollapsed={isCollapsed}
          onClick={undefined}
          disabled={helpItem.disabled}
          disabledMessage={t('messages.moduleComingSoon')}
        />
      </div>
      
      {/* Segunda línea divisoria */}
      {!isCollapsed && (
        <div className="mt-4">
          <SidebarDivider />
        </div>
      )}
      </div>
      
      {/* Elemento Cerrar sesión - siempre en la parte inferior */}
      <div className="mt-auto pt-8 pb-8">
        {!isCollapsed && (
          <div className="mb-4">
            <SidebarDivider />
          </div>
        )}
        <div>
          <SidebarLogoutItem isCollapsed={isCollapsed} />
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;
