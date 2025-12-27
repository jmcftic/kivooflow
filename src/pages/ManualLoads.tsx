import React, { useState, useEffect, useRef } from 'react';
import SidebarApp from '../components/organisms/SidebarApp';
import DashboardNavbar from '../components/atoms/DashboardNavbar';
import KivoMainBg from '../components/atoms/KivoMainBg';
import Ki6SvgIcon from '../components/atoms/Ki6SvgIcon';
import Input from '../components/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';
import ErrorModal from '../components/atoms/ErrorModal';
import { createManualCommission } from '../services/network';
import { CreateManualCommissionRequest } from '../types/network';
import { Spinner } from '@/components/ui/spinner';
import { authService } from '../services/auth';
import { KIVOO_DIAGONAL_CLASSES, KIVOO_COLORS } from '../styles/kivoo-animations';
import { cn } from '../lib/utils';
import SuccessModal from '../components/molecules/SuccessModal';

const ManualLoads: React.FC = () => {
  const [formData, setFormData] = useState<CreateManualCommissionRequest>({
    userId: 0,
    commissionAmount: 0,
    concept: 'fund',
    teamId: undefined,
    periodStartDate: undefined,
    periodEndDate: undefined,
    notes: undefined,
  });

  const [userEmail, setUserEmail] = useState('');
  const [foundUserId, setFoundUserId] = useState<number | null>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const [userSearchError, setUserSearchError] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Efecto para buscar usuario por email con debounce
  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!userEmail || !emailRegex.test(userEmail)) {
      setFoundUserId(null);
      setFormData((prev) => ({ ...prev, userId: 0 }));
      setUserSearchError('');
      setIsSearchingUser(false);
      return;
    }

    // Establecer delay de 500ms antes de buscar
    setIsSearchingUser(true);
    setUserSearchError('');
    
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const user = await authService.getUserByEmail(userEmail);
        setFoundUserId(user.id);
        setFormData((prev) => ({ ...prev, userId: user.id }));
        setUserSearchError('');
      } catch (error: any) {
        setFoundUserId(null);
        setFormData((prev) => ({ ...prev, userId: 0 }));
        setUserSearchError(error?.message || 'Usuario no encontrado');
      } finally {
        setIsSearchingUser(false);
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [userEmail]);

  const handleInputChange = (field: keyof CreateManualCommissionRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setUserEmail(email);
    // Limpiar errores relacionados
    if (errors.userId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.userId;
        return newErrors;
      });
    }
    setUserSearchError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar email y userId
    if (!userEmail || !userEmail.trim()) {
      newErrors.userId = 'El correo electrónico es requerido';
    } else if (!foundUserId || foundUserId <= 0) {
      newErrors.userId = userSearchError || 'Usuario no encontrado. Verifica el correo electrónico';
    }

    // Validar commissionAmount
    if (!formData.commissionAmount || formData.commissionAmount <= 0) {
      newErrors.commissionAmount = 'El monto de comisión es requerido y debe ser mayor a 0';
    }

    // Validar concept
    if (!formData.concept || (formData.concept !== 'fund' && formData.concept !== 'card_selling')) {
      newErrors.concept = 'Debe seleccionar un concepto válido';
    }

    // Validar fechas si ambas están presentes
    if (formData.periodStartDate && formData.periodEndDate) {
      const startDate = new Date(formData.periodStartDate);
      const endDate = new Date(formData.periodEndDate);
      if (endDate <= startDate) {
        newErrors.periodEndDate = 'La fecha de fin debe ser mayor que la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Preparar los datos para enviar, excluyendo campos undefined
      const requestData: CreateManualCommissionRequest = {
        userId: formData.userId,
        commissionAmount: formData.commissionAmount,
        concept: formData.concept,
      };

      if (formData.teamId !== undefined) {
        requestData.teamId = formData.teamId;
      }
      if (formData.periodStartDate) {
        requestData.periodStartDate = formData.periodStartDate;
      }
      if (formData.periodEndDate) {
        requestData.periodEndDate = formData.periodEndDate;
      }
      if (formData.notes) {
        requestData.notes = formData.notes;
      }

      // Obtener información del usuario autenticado para debugging
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      console.log('Enviando comisión manual:', {
        requestData,
        currentUserId: currentUser?.id,
        currentUserEmail: currentUser?.email,
      });

      const response = await createManualCommission(requestData);
      setSuccessMessage(response.message || 'Comisión manual creada exitosamente');
      setSuccessModalOpen(true);
      
      // Limpiar solo el correo y el valor de comisión después de guardar exitosamente
      setUserEmail('');
      setFormData((prev) => ({
        ...prev,
        commissionAmount: 0,
        userId: 0,
      }));
      setFoundUserId(null);
      setUserSearchError('');
    } catch (error: any) {
      // Log detallado del error para debugging
      console.error('Error al crear comisión manual:', {
        error,
        response: error?.response,
        status: error?.status,
        message: error?.message,
        data: error?.response?.data,
      });

      // Construir mensaje de error más detallado
      let errorMsg = 'Error al crear la comisión manual. Por favor, intenta nuevamente.';
      
      if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.status === 403) {
        errorMsg = 'No tienes permiso para crear comisiones manuales. Contacta al administrador.';
      } else if (error?.status === 401) {
        errorMsg = 'Tu sesión expiró. Por favor, inicia sesión nuevamente.';
      }

      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const conceptOptions = [
    { value: 'fund', label: 'Recarga' },
    { value: 'card_selling', label: 'Venta de Tarjetas' },
  ];

  return (
    <div className="h-screen w-full bg-[#2a2a2a] relative flex flex-col lg:flex-row overflow-hidden">
      {/* Nuevo fondo SVG */}
      <KivoMainBg className="absolute inset-0 z-0" />

      {/* Sidebar - Mobile drawer + Desktop collapsible */}
      <SidebarApp />

      {/* Contenido principal */}
      <div className="flex-1 relative flex flex-col pl-6 pr-6 overflow-y-auto pb-8 pt-16 lg:pt-0">
        {/* Navbar responsivo */}
        <DashboardNavbar title="Cargas manuales" />

        {/* Contenido del formulario centrado */}
        <div className="relative z-20 flex-1 flex items-center justify-center py-8">
          {/* Contenedor negro con tab estilo */}
          <div className="w-full max-w-2xl">
            {/* Tab negro superior */}
            <div className="relative w-full overflow-hidden mb-[-1px]" style={{ height: '52px' }}>
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: '#2d2d2d',
                  clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(to top, #33333300 0%, #33333347 100%)',
                  }}
                />
              </div>
              <div className="relative z-10 h-full flex items-center justify-center px-6">
                <span className="text-sm text-center text-white">Cargas manuales</span>
              </div>
            </div>

            {/* Contenedor del formulario con fondo negro */}
            <div className="bg-[#212020] rounded-lg rounded-tl-none p-6 md:p-8 border border-white/10 border-t-0">
              {/* Mensaje de éxito */}
              {showSuccess && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
                  {successMessage}
                </div>
              )}

              {/* Formulario centrado */}
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Usuario */}
            <div>
              <label htmlFor="user-email" className="block text-sm font-medium text-white mb-2">
                Correo Electrónico *
              </label>
              <Input
                id="user-email"
                type="email"
                value={userEmail}
                onChange={handleEmailChange}
                error={errors.userId || userSearchError}
                variant="kivoo-glass"
                placeholder="usuario@ejemplo.com"
                required
                rightIcon={isSearchingUser ? <Spinner className="size-4 text-white" /> : undefined}
              />
              {foundUserId && !userSearchError && (
                <p className="mt-2 text-sm text-green-400">
                  Usuario encontrado - ID: {foundUserId}
                </p>
              )}
            </div>

            {/* Concepto */}
            <div>
              <label htmlFor="concept" className="block text-sm font-medium text-white mb-2">
                Concepto *
              </label>
              <Select
                value={formData.concept}
                onValueChange={(value) => handleInputChange('concept', value as 'fund' | 'card_selling')}
              >
                <SelectTrigger 
                  id="concept"
                  className={cn(
                    "h-14 backdrop-blur-[30px]",
                    KIVOO_COLORS.glass.background,
                    "border border-transparent hover:border-white/30 focus:border-white",
                    KIVOO_COLORS.glass.text,
                    "focus:ring-0 focus:outline-none",
                    KIVOO_DIAGONAL_CLASSES.complete,
                    errors.concept && "border-red-400"
                  )}
                >
                  <SelectValue placeholder="Selecciona un concepto" />
                </SelectTrigger>
                <SelectContent>
                  {conceptOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.concept && (
                <p className="mt-1 text-sm text-red-400">{errors.concept}</p>
              )}
            </div>

            {/* Monto de Comisión */}
            <div>
              <label htmlFor="commission-amount" className="block text-sm font-medium text-white mb-2">
                Monto de Comisión (USDT) *
              </label>
              <Input
                id="commission-amount"
                type="number"
                value={formData.commissionAmount || ''}
                onChange={(e) => handleInputChange('commissionAmount', parseFloat(e.target.value) || 0)}
                error={errors.commissionAmount}
                variant="kivoo-glass"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
              />
            </div>

            {/* ID Equipo (Opcional) */}
            <div>
              <label htmlFor="team-id" className="block text-sm font-medium text-white mb-2">
                ID Equipo - Opcional
              </label>
              <Input
                id="team-id"
                type="number"
                value={formData.teamId || ''}
                onChange={(e) => handleInputChange('teamId', e.target.value ? parseInt(e.target.value) : undefined)}
                variant="kivoo-glass"
                placeholder="Ingrese el ID del equipo"
                min="1"
              />
            </div>

            {/* Fecha Inicio Período (Opcional) */}
            <div>
              <label htmlFor="period-start" className="block text-sm font-medium text-white mb-2">
                Fecha Inicio Período - Opcional
              </label>
              <Input
                id="period-start"
                type="date"
                value={formData.periodStartDate || ''}
                onChange={(e) => handleInputChange('periodStartDate', e.target.value || undefined)}
                variant="kivoo-glass"
              />
            </div>

            {/* Fecha Fin Período (Opcional) */}
            <div>
              <label htmlFor="period-end" className="block text-sm font-medium text-white mb-2">
                Fecha Fin Período - Opcional
              </label>
              <Input
                id="period-end"
                type="date"
                value={formData.periodEndDate || ''}
                onChange={(e) => handleInputChange('periodEndDate', e.target.value || undefined)}
                error={errors.periodEndDate}
                variant="kivoo-glass"
              />
            </div>

            {/* Notas (Opcional) */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Notas - Opcional
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value || undefined)}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-[30px] border border-transparent hover:border-white/30 focus:border-white rounded-tl-xl rounded-tr-xl rounded-bl-xl text-white placeholder-white/50 focus:outline-none focus:ring-0 h-24 resize-none"
                placeholder="Ingrese notas adicionales (opcional)"
                rows={4}
              />
            </div>

            {/* Botón de envío */}
            <div className="pt-4">
              <Button
                type="submit"
                variant="yellow"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4 text-black" />
                    <span>Creando comisión...</span>
                  </>
                ) : (
                  'Crear Comisión Manual'
                )}
              </Button>
            </div>
              </form>
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
        title="Comisión creada exitosamente"
        message={successMessage}
      />
    </div>
  );
};

export default ManualLoads;

