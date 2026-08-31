import React, { useState, useEffect } from 'react';
import { CrmConversation, CrmMessage } from '../../../domain/models/CrmConversation';
import { services } from '../../../services/ServiceContainer';
import { SoftLockCountdown } from '../../../design-system/molecules/SoftLockCountdown';
import {
  MessageSquare,
  Bot,
  UserCheck,
  Send,
  AlertTriangle,
  Instagram,
  ShoppingBag,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CrmOmnichannelView: React.FC = () => {
  const [conversations, setConversations] = useState<CrmConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('conv_01');
  const [messages, setMessages] = useState<CrmMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadConversations = async () => {
    const list = await services.crmRepo.getConversations();
    setConversations(list);
  };

  const loadMessages = async (convId: string) => {
    const msgs = await services.crmRepo.getMessages(convId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadConversations();
    const handleCrmChange = () => {
      loadConversations();
      if (activeConvId) loadMessages(activeConvId);
    };
    window.addEventListener('barversuit_crm_changed', handleCrmChange);
    return () => window.removeEventListener('barversuit_crm_changed', handleCrmChange);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;

    setIsSending(true);
    await services.crmRepo.sendMessage(activeConvId, {
      conversationId: activeConvId,
      sender: 'agente_humano',
      senderName: 'Operador Admin',
      content: inputMessage,
    });
    setInputMessage('');
    setIsSending(false);
  };

  const handleToggleAi = async (isActive: boolean) => {
    if (!activeConvId) return;
    await services.crmRepo.toggleAi(activeConvId, isActive);
  };

  const channelIcons: Record<string, React.ReactNode> = {
    whatsapp: <span className="text-emerald-500 font-bold">WA</span>,
    instagram: <Instagram className="w-3.5 h-3.5 text-pink-500" />,
    messenger: <span className="text-blue-500 font-bold">FB</span>,
  };

  return (
    <div
      className="p-6 transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center font-bold text-xl"
            style={{
              backgroundColor: 'var(--admin-card)',
              color: 'var(--admin-text-primary)',
              borderRadius: 'var(--admin-radius-sm)',
              boxShadow: 'var(--admin-shadow)',
              border: '1px solid var(--admin-border)',
            }}
          >
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--admin-text-primary)' }}>
              Bandeja Omnicanal
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--admin-text-secondary)' }}>
              Orquestación IA & Protocolo Handoff
            </p>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        {/* Columna 1: Lista de Conversaciones */}
        <div
          className="lg:col-span-4 flex flex-col h-full"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderRadius: 'var(--admin-radius)',
            boxShadow: 'var(--admin-shadow)',
            border: '1px solid var(--admin-border)',
            backdropFilter: 'var(--admin-backdrop)',
            WebkitBackdropFilter: 'var(--admin-backdrop)',
          }}
        >
          <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" style={{ color: 'var(--admin-text-primary)' }} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Hilos Activos</h3>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-secondary)' }}
            >
              {conversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              const hasAlert = conv.handoffStatus === 'requiere_humano';

              return (
                <motion.div
                  key={conv.id}
                  whileHover={{ scale: 0.98 }}
                  onClick={() => setActiveConvId(conv.id)}
                  className="p-4 cursor-pointer transition-all space-y-2 relative overflow-hidden"
                  style={{
                    backgroundColor: isSelected
                      ? 'var(--admin-badge-bg)'
                      : hasAlert
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'transparent',
                    borderRadius: 'var(--admin-radius-sm)',
                    border: `1px solid ${isSelected || hasAlert ? 'var(--admin-border)' : 'transparent'}`,
                  }}
                >
                  {/* Hover indicator line */}
                  {isSelected && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ background: 'var(--admin-accent)' }}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px]"
                        style={{ backgroundColor: 'var(--admin-bg)', border: '1px solid var(--admin-border)' }}
                      >
                        {channelIcons[conv.channel] || 'CH'}
                      </div>
                      <h4 className="text-sm font-bold truncate">{conv.customerName}</h4>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>
                      {conv.lastMessageAt}
                    </span>
                  </div>

                  <p className="text-xs line-clamp-1 leading-relaxed" style={{ color: 'var(--admin-text-secondary)' }}>
                    {conv.lastMessageSnippet}
                  </p>

                  <div className="flex items-center justify-between pt-2 gap-2">
                    {hasAlert ? (
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                        <ShieldAlert className="w-3 h-3" /> Handoff: Precio Suelo
                      </span>
                    ) : conv.isAiActive ? (
                      <span
                        className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--admin-badge-bg)' }}
                      >
                        <Bot className="w-3 h-3" /> IA Activa
                      </span>
                    ) : (
                      <span
                        className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--admin-badge-bg)' }}
                      >
                        <UserCheck className="w-3 h-3" /> Humano
                      </span>
                    )}

                    {conv.activeOrderId && (
                      <span className="text-[10px] font-mono font-bold uppercase" style={{ color: 'var(--admin-text-primary)' }}>
                        {conv.activeOrderId}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Columna 2: Chat en Vivo */}
        <div
          className="lg:col-span-5 flex flex-col h-full relative"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderRadius: 'var(--admin-radius)',
            boxShadow: 'var(--admin-shadow)',
            border: '1px solid var(--admin-border)',
            backdropFilter: 'var(--admin-backdrop)',
            WebkitBackdropFilter: 'var(--admin-backdrop)',
          }}
        >
          {/* Chat Header */}
          {activeConversation ? (
            <div className="p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)' }}
                >
                  {activeConversation.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    {activeConversation.customerName}
                  </h4>
                  <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--admin-text-secondary)' }}>
                    Canal: <strong className="uppercase">{activeConversation.channel}</strong> • {activeConversation.customerPhone}
                  </p>
                </div>
              </div>

              {activeConversation.isAiActive ? (
                <button
                  onClick={() => handleToggleAi(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-colors border border-amber-500/20"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Tomar Control
                </button>
              ) : (
                <button
                  onClick={() => handleToggleAi(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--admin-accent)' }}
                >
                  <Bot className="w-3.5 h-3.5" />
                  Activar IA
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 border-b text-sm" style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text-secondary)' }}>
              Selecciona un chat
            </div>
          )}

          {/* Messages Area */}
          <div
            className="flex-1 p-5 overflow-y-auto space-y-4"
            style={{ backgroundColor: 'var(--admin-bg)' }}
          >
            <AnimatePresence>
              {messages.map((msg) => {
                const isCustomer = msg.sender === 'cliente';
                const isAi = msg.sender === 'ia';
                const isSystem = msg.sender === 'sistema';

                if (isSystem) {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className="p-3 rounded-2xl text-center space-y-1 my-4 border"
                      style={{ backgroundColor: 'var(--admin-badge-bg)', borderColor: 'var(--admin-border)' }}
                    >
                      <p className="text-xs font-semibold flex items-center justify-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> {msg.content}
                      </p>
                      <span className="text-[10px]" style={{ color: 'var(--admin-text-secondary)' }}>{msg.createdAt}</span>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 px-1 text-[10px] font-medium" style={{ color: 'var(--admin-text-secondary)' }}>
                      {isAi && <Bot className="w-3 h-3" />}
                      <span>{msg.senderName}</span>
                      <span>• {msg.createdAt}</span>
                    </div>

                    <div
                      className="max-w-[85%] p-4 text-sm leading-relaxed"
                      style={{
                        backgroundColor: isCustomer ? 'var(--admin-card)' : isAi ? 'var(--admin-msg-ai)' : 'var(--admin-accent)',
                        color: isCustomer ? 'var(--admin-text-primary)' : 'var(--admin-text-inverse)',
                        borderRadius: isCustomer ? '2px 24px 24px 24px' : '24px 2px 24px 24px',
                        boxShadow: 'var(--admin-shadow)',
                        border: isCustomer ? '1px solid var(--admin-border)' : 'none',
                      }}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t flex gap-3"
            style={{ borderColor: 'var(--admin-border)', backgroundColor: 'var(--admin-card)', borderBottomLeftRadius: 'var(--admin-radius)', borderBottomRightRadius: 'var(--admin-radius)' }}
          >
            <input
              type="text"
              placeholder={
                activeConversation?.isAiActive
                  ? 'La IA está respondiendo (escribe para intervenir)...'
                  : 'Escribe una respuesta como operador humano...'
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-5 py-3 text-sm focus:outline-none"
              style={{
                backgroundColor: 'var(--admin-bg)',
                color: 'var(--admin-text-primary)',
                borderRadius: '9999px',
                border: '1px solid var(--admin-border)',
              }}
            />
            <button
              type="submit"
              disabled={isSending}
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--admin-accent)', color: 'white', boxShadow: 'var(--admin-shadow)' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Columna 3: Contexto */}
        <div
          className="lg:col-span-3 flex flex-col h-full overflow-y-auto"
          style={{
            backgroundColor: 'var(--admin-card)',
            borderRadius: 'var(--admin-radius)',
            boxShadow: 'var(--admin-shadow)',
            border: '1px solid var(--admin-border)',
            backdropFilter: 'var(--admin-backdrop)',
            WebkitBackdropFilter: 'var(--admin-backdrop)',
          }}
        >
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b" style={{ borderColor: 'var(--admin-border)' }}>
              <ShoppingBag className="w-4 h-4" style={{ color: 'var(--admin-text-primary)' }} />
              <h3 className="text-sm font-bold uppercase tracking-wider">Contexto</h3>
            </div>

            {/* Pedido Activo Vinculado */}
            {activeConversation?.activeOrderId ? (
              <div
                className="p-4 space-y-3"
                style={{
                  backgroundColor: 'var(--admin-bg)',
                  borderRadius: 'var(--admin-radius-sm)',
                  border: '1px solid var(--admin-border)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase" style={{ color: 'var(--admin-text-secondary)' }}>Pedido Activo</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--admin-card)', color: 'var(--admin-text-primary)' }}>
                    {activeConversation.activeOrderId}
                  </span>
                </div>

                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 overflow-hidden border" style={{ borderColor: 'var(--admin-border)' }}>
                    <img
                      src={'https://images.unsplash.com/photo-1505693314120-0d443867891c'}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold line-clamp-2">Sofá Minimalista</p>
                    <p className="text-sm font-medium mt-1">$450.00</p>
                  </div>
                </div>

                <div className="pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
                  <p className="text-[10px] font-bold uppercase mb-1.5" style={{ color: 'var(--admin-text-secondary)' }}>Reserva de Soft-Lock</p>
                  <SoftLockCountdown
                    expiresAt={new Date(Date.now() + 15 * 60000).toISOString()}
                    onExpire={() => {}}
                  />
                </div>
              </div>
            ) : (
              <div
                className="p-5 text-center"
                style={{ backgroundColor: 'var(--admin-bg)', borderRadius: 'var(--admin-radius-sm)', border: '1px dashed var(--admin-border)' }}
              >
                <p className="text-xs" style={{ color: 'var(--admin-text-secondary)' }}>No hay un pedido formal vinculado a este chat.</p>
              </div>
            )}

            {/* Negociación & Tags */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--admin-text-secondary)' }}>Datos Extraídos por IA</h4>
              <div className="flex flex-wrap gap-2">
                {activeConversation?.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--admin-badge-bg)', color: 'var(--admin-text-primary)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              className="w-full py-3 rounded-full text-xs font-bold transition-opacity hover:opacity-90"
              style={{ background: 'var(--admin-accent)', color: 'white', boxShadow: 'var(--admin-shadow)' }}
            >
              Crear Orden Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
