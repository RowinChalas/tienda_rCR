import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../../context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { items, removeItem, updateQuantity, isCartOpen, closeCart, itemCount, subtotalFormatted } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Slide-over panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-screen max-w-md flex flex-col shadow-2xl"
              style={{ backgroundColor: 'var(--sf-bg)', color: 'var(--sf-charcoal)' }}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--sf-stone)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--sf-stone)] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-[var(--sf-charcoal)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm font-editorial">Bolsa de Compras</h3>
                    <p className="text-[11px] text-[var(--sf-charcoal-60)]">
                      {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'} seleccionados
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Cerrar bolsa"
                >
                  <X className="w-5 h-5 text-[var(--sf-charcoal)]" />
                </button>
              </div>

              {/* Items List / Empty State */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                    <div className="w-16 h-16 rounded-full bg-[var(--sf-stone)] flex items-center justify-center text-2xl">
                      🛋️
                    </div>
                    <h4 className="font-editorial text-base font-bold">Tu bolsa está vacía</h4>
                    <p className="text-xs text-[var(--sf-charcoal-60)] max-w-xs">
                      Explora nuestras piezas artesanales just-in-time y añade tus muebles favoritos.
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-2 text-xs font-semibold px-5 py-2.5 rounded-sm bg-[var(--sf-charcoal)] text-white hover:bg-[var(--sf-madera)] transition-colors"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 p-3.5 rounded-sm border bg-white shadow-sm relative group"
                      style={{ borderColor: 'var(--sf-stone)' }}
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 bg-[var(--sf-stone)]">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-xs font-bold leading-tight truncate pr-4">{item.name}</h5>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                              title="Eliminar artículo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Logistic pill */}
                          {item.logisticStatus && (
                            <span
                              className={`inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                item.logisticStatus === 'disponible_ya'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : item.logisticStatus === 'bajo_pedido'
                                  ? 'bg-purple-50 text-purple-700'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {item.logisticStatus === 'disponible_ya'
                                ? '✦ Envío Inmediato'
                                : item.logisticStatus === 'bajo_pedido'
                                ? '⏱ 15 días fabricación'
                                : '⚡ JIT 24-48h'}
                            </span>
                          )}
                        </div>

                        {/* Price & Quantity Stepper */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-bold text-[var(--sf-charcoal)]">{item.priceFormatted}</span>

                          <div className="flex items-center border rounded-sm overflow-hidden text-xs bg-slate-50">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="px-2 py-0.5 hover:bg-slate-200 transition-colors font-mono"
                            >
                              -
                            </button>
                            <span className="px-2 font-mono font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="px-2 py-0.5 hover:bg-slate-200 transition-colors font-mono"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-6 border-t bg-white space-y-4" style={{ borderColor: 'var(--sf-stone)' }}>
                  {/* Fulfillment promise */}
                  <div className="flex items-center gap-2 text-[11px] text-[var(--sf-charcoal-60)]">
                    <Truck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Envío coordinado a todo República Dominicana</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[var(--sf-charcoal-60)]">
                      <span>Subtotal estimado:</span>
                      <span className="font-semibold text-[var(--sf-charcoal)]">{subtotalFormatted}</span>
                    </div>
                    <div className="flex justify-between text-[var(--sf-charcoal-60)]">
                      <span>Depósito mínimo de reserva (50%):</span>
                      <span className="font-semibold text-emerald-600">
                        {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(
                          items.reduce((acc, item) => acc + item.price * item.quantity, 0) * 0.5
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closeCart();
                      onCheckout();
                    }}
                    className="w-full py-3.5 rounded-sm bg-[var(--sf-charcoal)] text-white hover:bg-[var(--sf-madera)] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
                  >
                    <span>Proceder a Reserva con Soft Lock</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[10px] text-center text-[var(--sf-charcoal-35)] flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" /> Soft Lock de 20 minutos protegido al iniciar reserva
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
