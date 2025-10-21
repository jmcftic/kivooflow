import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import FoldedCard from "../atoms/FoldedCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import resumenData from "../../data/resumen.json";

type RangeOption = "6months" | "1year" | "2years";

interface ResumenCardProps {
  className?: string;
}

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
          <h3 className="text-[#FFF000] text-xl font-bold uppercase">RESUMEN</h3>
          
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#333" 
                vertical={false}
              />
              <XAxis 
                dataKey="mesCorto" 
                stroke="#aaa"
                tick={{ fill: '#aaa', fontSize: 11 }}
                axisLine={{ stroke: '#333' }}
              />
              <YAxis 
                stroke="#aaa"
                tick={{ fill: '#aaa' }}
                axisLine={{ stroke: '#333' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#212020',
                  border: '1px solid #FFF100',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                cursor={{ fill: 'rgba(255, 241, 0, 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: '#aaa'
                }}
                iconType="circle"
                align="left"
              />
              <Bar 
                dataKey="ventas" 
                fill="#00BFFF" 
                radius={[4, 4, 0, 0]}
                name="Ventas"
              />
              <Bar 
                dataKey="recargas" 
                fill="#FFFF00" 
                radius={[4, 4, 0, 0]}
                name="Recargas"
              />
              <Bar 
                dataKey="comisiones" 
                fill="#B8860B" 
                radius={[4, 4, 0, 0]}
                name="Comisiones"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </FoldedCard>
  );
};

export default ResumenCard;

