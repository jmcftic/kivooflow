import React, { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableMlmModels } from '@/services/network';
import { AvailableMlmModelsData } from '@/types/network';

interface ModelSelectorProps {
  className?: string;
  onModelChange?: (model: string) => void;
}

type ModelOption = 'b2c' | 'b2b' | 'b2t';

const MODEL_LABELS: Record<ModelOption, string> = {
  b2c: 'B2C',
  b2b: 'B2B',
  b2t: 'B2T',
};

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  className = '',
  onModelChange 
}) => {
  const [availableModels, setAvailableModels] = useState<AvailableMlmModelsData | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const data = await getAvailableMlmModels();
        setAvailableModels(data);
        
        // Establecer el modelo actual del usuario como seleccionado
        const normalizedModel = data.my_model?.trim().toLowerCase();
        if (normalizedModel === 'b2c' || normalizedModel === 'b2b' || normalizedModel === 'b2t') {
          setSelectedModel(normalizedModel);
          onModelChange?.(normalizedModel);
        }
      } catch (error) {
        console.error('Error obteniendo modelos disponibles', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    onModelChange?.(value);
  };

  // Construir opciones disponibles basándose en los tabs disponibles
  const availableOptions: ModelOption[] = [];
  if (availableModels?.show_b2c_tab) {
    availableOptions.push('b2c');
  }
  if (availableModels?.show_b2b_tab) {
    availableOptions.push('b2b');
  }
  if (availableModels?.show_b2t_tab) {
    availableOptions.push('b2t');
  }

  if (loading) {
    return (
      <div className={`w-full lg:w-[180px] ${className}`}>
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Cargando..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (!availableModels || availableOptions.length === 0) {
    return null;
  }

  return (
    <div className={`w-full lg:w-[180px] ${className}`}>
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecciona un modelo" />
        </SelectTrigger>
        <SelectContent>
          {availableOptions.map((model) => (
            <SelectItem key={model} value={model}>
              {MODEL_LABELS[model]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;

