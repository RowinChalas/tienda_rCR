import React, { useState, useEffect } from 'react';
import { PricingEngine } from '../../../domain/pricing/PricingEngine';
import { PricingRule } from '../../../domain/models/PricingRule';
import { services } from '../../../services/ServiceContainer';
import { Badge } from '../../../design-system/atoms/Badge';
import { Input } from '../../../design-system/atoms/Input';
import {
  Calculator,
  ShieldCheck,
  Percent,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const PricingSimulatorView: React.FC = () => {
  const [costInput, setCostInput] = useState<number>(15000);
  const [markupPct, setMarkupPct] = useState<number>(0.35); // 35%
  const [floorPct, setFloorPct] = useState<number>(0.18);   // 18%
  const [allowRounding, setAllowRounding] = useState<boolean>(true);
  const [rules, setRules] = useState<PricingRule[]>([]);

  // Simulador de negociación de cliente
  const [testOfferInput, setTestOfferInput] = useState<number>(18500);

  useEffect(() => {
    services.pricingRepo.getRules().then(setRules);
  }, []);

  const calculation = PricingEngine.calculatePricing(costInput, markupPct, floorPct, allowRounding);
  const discountValidation = PricingEngine.validateDiscountOffer(
    testOfferInput,
    calculation.suggestedPrice,
    calculation.floorPrice,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold font-editorial tracking-tight flex items-center gap-2.5" style={{ color: 'var(--admin-text-primary)' }}>
          Motor de Precios & Simulador de Márgenes
          <Badge variant="gold" size="sm">
            Épica B / EARS-E-04
          </Badge>
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
          Cálculo dinámico de precios sugeridos, protección del Precio Suelo para el Agente IA y reglas de margen por categoría.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Inputs de Configuración */}
        <div
          className="rounded-2xl p-6 border space-y-5"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderColor: 'var(--admin-border)',
            boxShadow: 'var(--admin-shadow)',
            backdropFilter: 'var(--admin-backdrop)',
            WebkitBackdropFilter: 'var(--admin-backdrop)',
          }}
        >
          <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <Calculator className="w-5 h-5 text-brand-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
              Parámetros de Costo & Margen
            </h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Costo Base del Proveedor ($)"
              type="number"
              value={costInput}
              onChange={(e) => setCostInput(Number(e.target.value) || 0)}
              leftIcon={<DollarSign className="w-4 h-4" />}
              helperText="Costo confidencial pactado con el taller."
            />

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span style={{ color: 'var(--admin-text-secondary)' }}>Margen Objetivo Sugerido:</span>
                <span className="text-brand-500 font-bold">{(markupPct * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.01"
                value={markupPct}
                onChange={(e) => setMarkupPct(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer"
                style={{ accentColor: '#3b82f6', backgroundColor: 'var(--admin-card-alt)' }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
                <span>10% (Mínimo)</span>
                <span>80% (Premium)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1" style={{ color: 'var(--admin-text-secondary)' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> Margen Suelo Protegido:
                </span>
                <span className="text-purple-500 font-bold">{(floorPct * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max={markupPct}
                step="0.01"
                value={floorPct}
                onChange={(e) => setFloorPct(Number(e.target.value))}
                className="w-full h-2 rounded-lg cursor-pointer"
                style={{ accentColor: '#a855f7', backgroundColor: 'var(--admin-card-alt)' }}
              />
              <p className="text-[10px] mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
                Límite no negociable: Si el cliente pide menos, se activa Handoff humano (EARS-N-01).
              </p>
            </div>

            <label
              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--admin-card-alt)',
                borderColor: 'var(--admin-border)',
              }}
            >
              <input
                type="checkbox"
                checked={allowRounding}
                onChange={(e) => setAllowRounding(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400"
                style={{ backgroundColor: 'var(--admin-bg)', borderColor: 'var(--admin-border-strong)' }}
              />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--admin-text-primary)' }}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Redondeo Psicológico (RF-09)
                </p>
                <p className="text-[11px]" style={{ color: 'var(--admin-text-secondary)' }}>Terminaciones comerciales (.990 / .490).</p>
              </div>
            </label>
          </div>
        </div>

        {/* Panel Central: Resultados de Precios Calculados */}
        <div
          className="rounded-2xl p-6 border space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderColor: 'var(--admin-border)',
            boxShadow: 'var(--admin-shadow)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--admin-text-primary)' }}>
                <TrendingUp className="w-5 h-5 text-emerald-500" /> Precios Resultantes
              </h3>
              {calculation.isPsychologicallyRounded && (
                <Badge variant="gold" size="sm">
                  Psicológico Aplicado
                </Badge>
              )}
            </div>

            {/* Precio de Venta Sugerido (PVP) */}
            <div
              className="p-4 rounded-xl border space-y-1 shadow-inner"
              style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border-strong)' }}
            >
              <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider">
                Precio de Venta Sugerido (PVP)
              </span>
              <p className="text-3xl font-extrabold font-editorial tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
                ${calculation.suggestedPrice.toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
                <span>Margen Bruto de Ganancia:</span>
                <span className="font-bold text-emerald-500 font-mono">
                  +${calculation.targetGrossMargin.toLocaleString()} (
                  {((calculation.targetGrossMargin / costInput) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            {/* Precio Suelo Protegido */}
            <div
              className="p-4 rounded-xl border space-y-1"
              style={{ backgroundColor: 'rgba(168, 85, 247, 0.05)', borderColor: 'rgba(168, 85, 247, 0.3)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-500" /> Precio Suelo Mínimo
                </span>
                <span className="text-[10px] text-purple-500 font-mono">EARS-N-01</span>
              </div>
              <p className="text-2xl font-bold font-mono" style={{ color: 'var(--admin-text-primary)' }}>
                ${calculation.floorPrice.toLocaleString()}
              </p>
              <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
                <span>Margen Mínimo Garantizado:</span>
                <span className="font-semibold text-purple-500 font-mono">
                  +${calculation.minGrossMargin.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div
            className="p-3 rounded-xl border text-[11px] space-y-1"
            style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}
          >
            <span className="font-semibold block" style={{ color: 'var(--admin-text-primary)' }}>Invariante de Seguridad:</span>
            <p>
              El Agente de IA tiene autorización para conceder descuentos progresivos entre{' '}
              <strong style={{ color: 'var(--admin-text-primary)' }}>${calculation.suggestedPrice.toLocaleString()}</strong> y{' '}
              <strong className="text-purple-500">${calculation.floorPrice.toLocaleString()}</strong> sin intervención manual.
            </p>
          </div>
        </div>

        {/* Panel Derecho: Sandbox de Prueba de Negociación IA */}
        <div
          className="rounded-2xl p-6 border space-y-5 shadow-card flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderColor: 'var(--admin-border)',
            boxShadow: 'var(--admin-shadow)',
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <Percent className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-primary)' }}>
                Sandbox de Negociación IA
              </h3>
            </div>

            <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
              Prueba una oferta que un cliente podría proponer en WhatsApp para ver la respuesta del motor.
            </p>

            <Input
              label="Contrapropuesta del Cliente ($)"
              type="number"
              value={testOfferInput}
              onChange={(e) => setTestOfferInput(Number(e.target.value) || 0)}
              leftIcon={<DollarSign className="w-4 h-4" />}
            />

            {/* Resultado de la validación */}
            <div
              className={`p-4 rounded-xl border space-y-2 transition-all ${
                discountValidation.isAllowed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {discountValidation.isAllowed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>IA Acepta Descuento ({discountValidation.discountPct}% off)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Handoff Humano Obligatorio</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {discountValidation.reason}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--admin-text-secondary)' }}>
              Reglas Activas por Categoría
            </span>
            <div className="space-y-1.5">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-lg text-xs border"
                  style={{ backgroundColor: 'var(--admin-card-alt)', borderColor: 'var(--admin-border)' }}
                >
                  <span className="font-semibold" style={{ color: 'var(--admin-text-primary)' }}>{r.name}</span>
                  <span className="font-mono text-brand-500">
                    Suelo: {(r.floorPct * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
