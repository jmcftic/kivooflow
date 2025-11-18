"use client"

import React, { useState, useMemo } from "react";
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
import resumenData from "../../data/resumen.json";

type RangeOption = "6months" | "1year" | "2years";

interface ResumenCardProps {
  className?: string;
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

const ResumenCard: React.FC<ResumenCardProps> = ({ className = "" }) => {
  const [selectedRange, setSelectedRange] = useState<RangeOption>("6months");

  // Filtrar datos según el rango seleccionado
  const filteredData = useMemo(() => {
    const allData = resumenData.Resumen;
    const monthsToShow = selectedRange === "6months" ? 6 : selectedRange === "1year" ? 12 : 24;
    return allData.slice(-monthsToShow).map(item => ({
      ...item,
      mesCorto: item.mes.split(" ")[0] // Solo el mes para el eje X
    }));
  }, [selectedRange]);

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
          <Select value={selectedRange} onValueChange={(value) => setSelectedRange(value as RangeOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona un rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
              <SelectItem value="2years">Últimos 2 años</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gráfico */}
        <div className="flex-1 min-h-[350px]">
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
                content={
                  <ChartTooltipContent
                    className="bg-[#212020] border-[#FFF100] text-white"
                    indicator="dot"
                  />
                }
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
        </div>
      </div>
    </FoldedCard>
  );
};

export default ResumenCard;

