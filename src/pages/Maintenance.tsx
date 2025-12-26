import React from "react";
import MaintenanceIcon from "../components/atoms/MaintenanceIcon";
import MaintenanceButton from "../components/atoms/MaintenanceButton";

const Maintenance: React.FC = () => {
  const handleButtonClick = () => {
    // Abrir WhatsApp con el número de soporte
    const phoneNumber = "5215540576890"; // +52 1 55 4057 6890 sin espacios ni símbolos
    const whatsappUrl = `https://wa.me/${phoneNumber}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="h-screen w-full maintenance-page flex flex-col items-center justify-center">
      {/* Contenido centrado */}
      <div className="flex flex-col items-center justify-center gap-8 px-6">
        {/* Icono de mantenimiento */}
        <div className="flex justify-center">
          <MaintenanceIcon width={300} height={300} className="max-w-full h-auto" />
        </div>

        {/* Texto grande */}
        <h1 className="maintenance-title text-center">
          Estamos realizando tareas de mantenimiento
        </h1>

        {/* Texto pequeño */}
        <p className="maintenance-subtitle text-center max-w-2xl">
          Nuestra app está temporalmente fuera de servicio mientras trabajamos en mejoras. La app estará disponible pronto, gracias por tu comprensión.
        </p>

        {/* Botón */}
        <div className="mt-4">
          <MaintenanceButton onClick={handleButtonClick} />
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

