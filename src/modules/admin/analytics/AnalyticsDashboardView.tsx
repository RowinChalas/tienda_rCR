import React, { useState, useEffect } from 'react';
import { StatCard } from '../../../design-system/molecules/StatCard';
import { Badge } from '../../../design-system/atoms/Badge';
import { services } from '../../../services/ServiceContainer';
import { Supplier } from '../../../domain/models/Product';
import {
  DollarSign,
  AlertTriangle,
  Users,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export const AnalyticsDashboardView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    services.supplierRepo.getAll().then(setSuppliers);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-editorial tracking-tight flex items-center gap-2.5" style={{ color: 'var(--admin-text-primary)' }}>
          Métricas de Rentabilidad & Analítica JIT
          <Badge variant="gold" size="sm">
            Épica F / RF-30 a RF-34
          </Badge>
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
          Margen de contribución real por proveedor, tasa de stockout histórica y rendimiento de orquestación IA.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ventas Totales (GMV)"
          value="$111,470"
          subtitle="Mes en curso"
          trend={{ value: '+18.4%', isPositive: true }}
          icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
          variant="brand"
        />

        <StatCard
          title="Margen de Contribución"
          value="34.8%"
          subtitle="$30,970 utilidad bruta"
          trend={{ value: '+2.1%', isPositive: true }}
          icon={<Percent className="w-5 h-5 text-brand-500" />}
          variant="gold"
        />

        <StatCard
          title="Tasa de Agotamiento (Stockout)"
          value="3.2%"
          subtitle="Meta plataforma: < 5.0%"
          trend={{ value: '-1.4%', isPositive: true }}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          variant="default"
        />

        <StatCard
          title="Resolución IA sin Handoff"
          value="74.2%"
          subtitle="Cierres de venta automáticos"
          trend={{ value: '+6.5%', isPositive: true }}
          icon={<ShieldCheck className="w-5 h-5 text-purple-500" />}
          variant="purple"
        />
      </div>

      {/* Tabla de Rendimiento por Proveedor / Taller (US-18 & US-19) */}
      <div
        className="rounded-2xl border overflow-hidden shadow-card"
        style={{
          backgroundColor: 'var(--admin-card)',
          borderColor: 'var(--admin-border)',
          boxShadow: 'var(--admin-shadow)',
          backdropFilter: 'var(--admin-backdrop)',
          WebkitBackdropFilter: 'var(--admin-backdrop)',
        }}
      >
        <div className="p-4 px-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
              Evaluación de Confiabilidad y Margen por Proveedor (US-18 & US-19)
            </h3>
          </div>
          <span className="text-xs font-semibold" style={{ color: 'var(--admin-text-secondary)' }}>3 Talleres Afiliados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" style={{ color: 'var(--admin-text-primary)' }}>
            <thead className="uppercase font-bold tracking-wider border-b" style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
              <tr>
                <th className="py-3.5 px-6">Taller / Proveedor</th>
                <th className="py-3.5 px-6">Nivel</th>
                <th className="py-3.5 px-6">Zona Geográfica</th>
                <th className="py-3.5 px-6">Tiempo Despacho</th>
                <th className="py-3.5 px-6">Tasa Stockout (RF-31)</th>
                <th className="py-3.5 px-6 text-right">Margen Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--admin-border-strong)' }}>
              {suppliers.map((sup) => (
                <tr key={sup.id} className="transition-colors cursor-default" style={{ backgroundColor: 'transparent' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--admin-hover)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td className="py-4 px-6 font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                    <p>{sup.businessName}</p>
                    <p className="text-[10px] font-normal font-mono" style={{ color: 'var(--admin-text-secondary)' }}>{sup.contactWhatsapp}</p>
                  </td>

                  <td className="py-4 px-6">
                    <Badge variant={sup.level === 1 ? 'gold' : 'default'} size="sm">
                      {sup.level === 1 ? 'Nivel 1 (Principal)' : 'Nivel 2 (Satélite)'}
                    </Badge>
                  </td>

                  <td className="py-4 px-6" style={{ color: 'var(--admin-text-secondary)' }}>{sup.geoZone}</td>

                  <td className="py-4 px-6 font-mono" style={{ color: 'var(--admin-text-secondary)' }}>
                    ~{sup.averageFulfillmentHours} horas
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`font-mono font-bold ${
                        sup.stockoutRate < 3.0 ? 'text-emerald-500' : 'text-amber-500'
                      }`}
                    >
                      {sup.stockoutRate}%
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right font-mono font-bold text-brand-500 text-sm">
                    {sup.level === 1 ? '38.5%' : '35.0%'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
