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
import { DateFilter } from "@/types/dashboard";

interface ResumenCardProps {
  className?: string;
  monthlyData?: Array<{
    mes: string;
    ventas: number;
    recargas: number;
    comisiones: number;
  }>;
  onDateFilterChange?: (filter: DateFilter) => void;
  currentDateFilter?: DateFilter;
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

const ResumenCard: React.FC<ResumenCardProps> = ({ 
  className = "",
  monthlyData = [],
  onDateFilterChange,
  currentDateFilter = "last_2_months"
}) => {
  // Inicializar el rango basado en el currentDateFilter
  const initialRange = DATE_FILTER_TO_RANGE[currentDateFilter] || "2months";
  const [selectedRange, setSelectedRange] = useState<RangeOption>(initialRange as RangeOption);

  // Actualizar el rango cuando cambie el currentDateFilter desde fuera
  useEffect(() => {
    const newRange = DATE_FILTER_TO_RANGE[currentDateFilter] || "2months";
    setSelectedRange(newRange as RangeOption);
  }, [currentDateFilter]);

  // Preparar datos para la gráfica
  const filteredData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return [];
    }

    // Los datos ya vienen filtrados desde la API según el dateFilter
    // Solo necesitamos formatear el mes para el eje X
    return monthlyData.map(item => ({
      ...item,
      mesCorto: item.mes.split(" ")[0] // Solo el mes para el eje X
    }));
  }, [monthlyData]);

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
      {/* Header con título y selector */}
      <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#FFF000] text-xl font-bold uppercase">RESUMEN GENERAL</h3>
          
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

        {/* Gráfico */}
        <div className="flex-1 min-h-[350px]">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No hay datos disponibles para el período seleccionado</p>
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-full w-full"
            >
              <AreaChart data={filteredData}>
              <defs>
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
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                className="stroke-[#333]"
              />
              <XAxis
                dataKey="mesCorto"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: '#aaa', fontSize: 11 }}
                className="stroke-[#aaa]"
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
                        {props.payload.map((item, index) => {
                          const key = item.dataKey || item.name || 'value';
                          const itemConfig = chartConfig[key as keyof typeof chartConfig];
                          const value = typeof item.value === 'number' 
                            ? item.value.toLocaleString('es-MX', { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })
                            : String(item.value || '0');

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
              <Area
                type="monotone"
                dataKey="ventas"
                fill="url(#fillVentas)"
                stroke="var(--color-ventas)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="recargas"
                fill="url(#fillRecargas)"
                stroke="var(--color-recargas)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="comisiones"
                fill="url(#fillComisiones)"
                stroke="var(--color-comisiones)"
                strokeWidth={2}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
          )}
        </div>
      </div>
    </FoldedCard>
  );
};

export default ResumenCard;

