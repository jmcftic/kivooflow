"use client"

import React, { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
} from "recharts";
import FoldedCard from "../atoms/FoldedCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DateFilter, WeeklyData } from "@/types/dashboard";
import { getAvailableMlmModels } from "@/services/network";

interface ResumenCardProps {
  className?: string;
  monthlyData?: Array<{
    mes: string;
    ventas: number;
    recargas: number;
    comisiones: number;
  }>;
  weeklyData?: WeeklyData[];
  onDateFilterChange?: (filter: DateFilter) => void;
  currentDateFilter?: DateFilter;
  model?: string | null; // Modelo seleccionado (B2C, B2B, B2T)
}

const chartConfig = {
  ventas: {
    label: "Ventas",
    color: "#00BFFF",
  },
  recargas: {
    label: "Recargas",
    color: "#FFFF00",
  },
  comisiones: {
    label: "Comisiones",
    color: "#B8860B",
  },
} satisfies ChartConfig;

// Mapeo de opciones del selector a DateFilter de la API
const RANGE_TO_DATE_FILTER: Record<string, DateFilter> = {
  "2months": "last_2_months",
  "6months": "last_6_months",
  "1year": "last_year",
  "2years": "last_2_years",
};

const DATE_FILTER_TO_RANGE: Record<DateFilter, string> = {
  "last_month": "2months", // Mapear a 2months como default visual
  "last_2_months": "2months",
  "last_6_months": "6months",
  "last_year": "1year",
  "last_2_years": "2years",
  "all_time": "2years", // Mapear a 2years como default visual
};

type RangeOption = "2months" | "6months" | "1year" | "2years";
type ViewType = "monthly" | "weekly";

const ResumenCard: React.FC<ResumenCardProps> = ({ 
  className = "",
  monthlyData = [],
  weeklyData = [],
  onDateFilterChange,
  currentDateFilter = "last_2_months",
  model
}) => {
  // Obtener el modelo del usuario - inicializar desde localStorage primero para evitar delay
  const getInitialUserModel = (): string | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        const fallbackModel = userData?.mlmModel || userData?.mlm_model || userData?.networkModel || userData?.network_model || null;
        if (fallbackModel) {
          return fallbackModel.trim().toLowerCase();
        }
      }
    } catch (error) {
      // Ignorar errores en la inicialización
    }
    return null;
  };

  const [userModel, setUserModel] = useState<string | null>(getInitialUserModel());
  
  useEffect(() => {
    const fetchUserModel = async () => {
      try {
        const data = await getAvailableMlmModels();
        const model = data.my_model?.trim().toLowerCase() || '';
        if (model === 'b2c' || model === 'b2b' || model === 'b2t') {
          setUserModel(model);
        } else {
          // Fallback a localStorage
          const fallbackModel = getInitialUserModel();
          if (fallbackModel) {
            setUserModel(fallbackModel);
          }
        }
      } catch (error) {
        console.error('Error obteniendo modelo del usuario:', error);
        // Fallback a localStorage
        const fallbackModel = getInitialUserModel();
        if (fallbackModel) {
          setUserModel(fallbackModel);
        }
      }
    };
    void fetchUserModel();
  }, []);
  
  // Detectar si es B2C viendo la pestaña B2B
  const isB2CViewingB2B = userModel?.toLowerCase() === 'b2c' && model?.toLowerCase() === 'b2b';
  
  // Debug: verificar valores
  if (process.env.NODE_ENV === 'development') {
    console.log('ResumenCard debug:', { userModel, model, isB2CViewingB2B });
  }
  
  // Si es B2C viendo B2B, solo mostrar recargas
  const filteredChartConfig = isB2CViewingB2B 
    ? { recargas: chartConfig.recargas } 
    : chartConfig;
  // Inicializar el rango basado en el currentDateFilter
  const initialRange = DATE_FILTER_TO_RANGE[currentDateFilter] || "2months";
  const [selectedRange, setSelectedRange] = useState<RangeOption>(initialRange as RangeOption);
  const [viewType, setViewType] = useState<ViewType>("weekly");

  // Actualizar el rango cuando cambie el currentDateFilter desde fuera
  useEffect(() => {
    const newRange = DATE_FILTER_TO_RANGE[currentDateFilter] || "2months";
    setSelectedRange(newRange as RangeOption);
  }, [currentDateFilter]);

  // Calcular factor de escala para recargas basado en la diferencia con comisiones
  const scaleFactor = useMemo(() => {
    const dataSource = viewType === "weekly" ? weeklyData : monthlyData;
    if (!dataSource || dataSource.length === 0) {
      return 1;
    }

    // Calcular promedios de recargas y comisiones
    let totalRecargas = 0;
    let totalComisiones = 0;
    let count = 0;

    dataSource.forEach((item) => {
      if (item.recargas > 0 && item.comisiones > 0) {
        totalRecargas += item.recargas;
        totalComisiones += item.comisiones;
        count++;
      }
    });

    if (count === 0 || totalComisiones === 0) {
      return 1;
    }

    // Calcular la relación promedio
    const avgRecargas = totalRecargas / count;
    const avgComisiones = totalComisiones / count;
    const ratio = avgRecargas / avgComisiones;

    // Si las recargas son más de 5 veces mayores, aplicar escala
    // Usar un factor más agresivo para equilibrar mejor la visualización
    // Dividir por un factor mayor para reducir más la escala
    if (ratio > 5) {
      // Usar aproximadamente ratio/25 para un escalado más agresivo
      // Ejemplo: si ratio es 60, factor será ~2.4 (pero mínimo 3)
      // Si ratio es 100, factor será ~4 (pero mínimo 3)
      return Math.max(ratio / 3, 3);
    }

    return 1;
  }, [monthlyData, weeklyData, viewType]);

  // Preparar datos para la gráfica
  const filteredData = useMemo(() => {
    if (viewType === "weekly") {
      // Usar datos semanales
      if (!weeklyData || weeklyData.length === 0) {
        return [];
      }
      
      // Formatear el nombre de la semana para el eje X
      return weeklyData.map((item, index) => {
        // Extraer una versión corta para el eje X
        // Ejemplos: "Semana 1-7 Ene 2024" -> "1-7 Ene" o "S1-7"
        // "Semana 1 Ene - 7 Feb 2024" -> "1 Ene-7 Feb" o "S1"
        let semanaCorta = item.semana;
        
        // Intentar extraer una versión más corta
        const semanaMatch = item.semana.match(/Semana\s+(\d+)(?:\s*-\s*(\d+))?\s+([A-Za-z]+)/);
        if (semanaMatch) {
          const [, startDay, endDay, month] = semanaMatch;
          if (endDay) {
            semanaCorta = `${startDay}-${endDay} ${month.substring(0, 3)}`;
          } else {
            semanaCorta = `${startDay} ${month.substring(0, 3)}`;
          }
        } else {
          // Si no coincide, usar el índice como fallback
          semanaCorta = `S${index + 1}`;
        }
        
        return {
          ...item,
          label: item.semana, // Usar el nombre completo de la semana para el tooltip
          semanaCorta: semanaCorta,
          // Guardar todos los valores originales para el tooltip
          ventasOriginal: item.ventas,
          recargasOriginal: item.recargas,
          comisionesOriginal: item.comisiones,
          // Valores escalados solo para visualización en la gráfica
          recargas: item.recargas / scaleFactor,
        };
      });
    } else {
      // Usar datos mensuales
      if (!monthlyData || monthlyData.length === 0) {
        return [];
      }

      // Los datos ya vienen filtrados desde la API según el dateFilter
      // Solo necesitamos formatear el mes para el eje X
      return monthlyData.map(item => ({
        ...item,
        label: item.mes,
        mesCorto: item.mes.split(" ")[0], // Solo el mes para el eje X
        // Guardar todos los valores originales para el tooltip
        ventasOriginal: item.ventas,
        recargasOriginal: item.recargas,
        comisionesOriginal: item.comisiones,
        // Valores escalados solo para visualización en la gráfica
        recargas: item.recargas / scaleFactor,
      }));
    }
  }, [monthlyData, weeklyData, viewType, scaleFactor]);

  const handleRangeChange = (value: string) => {
    const newRange = value as RangeOption;
    setSelectedRange(newRange);
    
    // Convertir el rango seleccionado a DateFilter y notificar al padre
    const dateFilter = RANGE_TO_DATE_FILTER[newRange];
    if (dateFilter && onDateFilterChange) {
      onDateFilterChange(dateFilter);
    }
  };

  return (
    <FoldedCard
      className={className}
      gradientColor="#FFF100"
      backgroundColor="#212020"
      variant="2xl"
    >
    <div className="w-full h-full flex flex-col mb-0 pt-10">
      {/* Header con título y selectores */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-[#FFF000] text-xl font-bold uppercase">RESUMEN GENERAL</h3>
          
          <div className="flex gap-2">
            {/* Select para tipo de vista (Mensual/Semanal) */}
            <Select value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Vista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensual</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Select para rango de tiempo */}
            <Select value={selectedRange} onValueChange={handleRangeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecciona un rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2months">Últimos 2 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
                <SelectItem value="1year">Último año</SelectItem>
                <SelectItem value="2years">Últimos 2 años</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Gráfico */}
        <div className="flex-1 min-h-[350px]">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>
                {viewType === "weekly" 
                  ? "No hay datos semanales disponibles para el período seleccionado"
                  : "No hay datos disponibles para el período seleccionado"}
              </p>
            </div>
          ) : (
            <ChartContainer
              config={filteredChartConfig}
              className="aspect-auto h-full w-full"
            >
              <AreaChart data={filteredData}>
              <defs>
                {!isB2CViewingB2B && (
                  <>
                    <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-ventas)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-ventas)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillComisiones" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-comisiones)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-comisiones)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </>
                )}
                <linearGradient id="fillRecargas" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-recargas)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-recargas)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                className="stroke-[#333]"
              />
              <XAxis
                dataKey={viewType === "weekly" ? "semanaCorta" : "mesCorto"}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#aaa', fontSize: 11 }}
                className="stroke-[#aaa]"
                angle={viewType === "weekly" ? -45 : 0}
                textAnchor={viewType === "weekly" ? "end" : "middle"}
                height={viewType === "weekly" ? 80 : 30}
              />
              <ChartTooltip
                cursor={false}
                content={(props) => {
                  if (!props.active || !props.payload?.length) {
                    return null;
                  }

                  // Calcular el ancho necesario basado en el valor más grande
                  const maxValueLength = Math.max(
                    ...props.payload.map(item => {
                      const value = typeof item.value === 'number' 
                        ? item.value.toLocaleString() 
                        : String(item.value || '');
                      return value.length;
                    })
                  );

                  // Ancho mínimo más grande y ajuste dinámico
                  const minWidth = Math.max(200, maxValueLength * 8 + 120);

                  return (
                    <div
                      className="bg-[#212020] border border-[#FFF100] text-white rounded-lg px-3 py-2 shadow-xl"
                      style={{ minWidth: `${minWidth}px` }}
                    >
                      {props.label && (
                        <div className="font-medium mb-2 text-sm border-b border-[#FFF100]/30 pb-1">
                          {props.label}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {props.payload
                          .filter((item) => {
                            // Si es B2C viendo B2B, solo mostrar recargas
                            if (isB2CViewingB2B) {
                              const key = item.dataKey || item.name || 'value';
                              return key === 'recargas';
                            }
                            return true;
                          })
                          .map((item, index) => {
                          const key = item.dataKey || item.name || 'value';
                          const itemConfig = filteredChartConfig[key as keyof typeof filteredChartConfig];
                          
                          // Obtener el valor original según el campo
                          let rawValue = 0;
                          if (key === 'recargas' && item.payload?.recargasOriginal !== undefined) {
                            rawValue = item.payload.recargasOriginal;
                          } else if (key === 'ventas' && item.payload?.ventasOriginal !== undefined) {
                            rawValue = item.payload.ventasOriginal;
                          } else if (key === 'comisiones' && item.payload?.comisionesOriginal !== undefined) {
                            rawValue = item.payload.comisionesOriginal;
                          } else {
                            // Fallback al valor del item si no hay original almacenado
                            rawValue = typeof item.value === 'number' ? item.value : 0;
                          }
                          
                          const value = rawValue.toLocaleString('es-MX', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          });

                          return (
                            <div
                              key={item.dataKey || index}
                              className="flex items-center gap-3"
                            >
                              {/* Indicador de color */}
                              <div
                                className="h-2.5 w-2.5 rounded-[2px] shrink-0"
                                style={{
                                  backgroundColor: item.color || item.payload?.fill || '#FFF100',
                                }}
                              />
                              {/* Etiqueta y valor con espacio adecuado */}
                              <div className="flex-1 flex justify-between items-center gap-4">
                                <span className="text-[#CBCACA] text-xs">
                                  {itemConfig?.label || item.name}
                                </span>
                                <span className="font-mono font-medium tabular-nums text-white text-xs whitespace-nowrap">
                                  {value}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              {!isB2CViewingB2B && (
                <>
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    fill="url(#fillVentas)"
                    stroke="var(--color-ventas)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="comisiones"
                    fill="url(#fillComisiones)"
                    stroke="var(--color-comisiones)"
                    strokeWidth={2}
                  />
                </>
              )}
              <Area
                type="monotone"
                dataKey="recargas"
                fill="url(#fillRecargas)"
                stroke="var(--color-recargas)"
                strokeWidth={2}
              />
              {/* Leyenda: para B2C viendo B2B, mostrar solo Recargas; para otros casos, mostrar todos */}
              {isB2CViewingB2B ? (
                // Para B2C viendo B2B, mostrar solo el label de Recargas manualmente
                // No usar ChartLegend de Recharts, solo mostrar nuestra leyenda personalizada
                <div className="flex items-center justify-center gap-4 pt-3">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2 w-2 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: chartConfig.recargas.color,
                      }}
                    />
                    <span className="text-[#FFF100]">{chartConfig.recargas.label}</span>
                  </div>
                </div>
              ) : (
                // Para otros casos, usar la leyenda normal de Recharts
                <ChartLegend content={<ChartLegendContent />} />
              )}
            </AreaChart>
          </ChartContainer>
          )}
          
          {/* Nota sobre escalado de recargas si aplica */}
          {scaleFactor > 1 && (
            <div className="mt-2 text-xs text-[#aaa] text-center">
              <span className="text-[#FFF100]">*</span> Las recargas se muestran a escala para mejor visualización. Los valores reales se muestran en el tooltip.
            </div>
          )}
        </div>
      </div>
    </FoldedCard>
  );
};

export default ResumenCard;

