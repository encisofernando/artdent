import axios from 'axios';

const PHRASES = [
    "¿Revisamos los trabajos pendientes hoy? 😊",
    "Podés consultarme ventas, stock o clientes.",
    "Recordá validar las entregas del día en el laboratorio.",
    "¿Querés chequear el estado de cuenta de un odontólogo?",
    "Estoy listo para ayudarte con todo el laboratorio."
];

const FALLBACK_WELCOME_MESSAGE = '¡Hola! Soy **Artie**, tu asistente inteligente del laboratorio. 👋 ¿En qué te ayudo hoy?';

const buildDefaultMessages = (welcomeMessage) => ([
    { role: 'assistant', content: welcomeMessage || FALLBACK_WELCOME_MESSAGE }
]);

const QUICK_ACTION_PROMPTS = {
    jobs: 'Necesito un resumen real de los trabajos de hoy del laboratorio. Si falta algún dato puntual, aclaralo y orientame a Laboratorio > Órdenes > Consultar.',
    sales: 'Necesito un resumen real de las ventas del día. Si falta algún dato puntual, aclaralo y orientame a Gestión > Ventas > Lista de Ventas.',
    stock: 'Quiero saber qué productos o insumos están con stock bajo usando datos reales. Si no alcanza la información, orientame a Gestión > Ventas > Artículos.',
    debt: 'Necesito ver clientes u odontólogos con deuda o saldo pendiente usando datos reales. Si no alcanza la información, orientame a Gestión > Clientes > Cuentas Corrientes o Laboratorio > Clientes / Odont. > Cuentas Corrientes y Pagos.',
};

const QUICK_ACTION_ALIASES = {
    'trabajos de hoy': 'jobs',
    'ventas del día': 'sales',
    'ventas del dia': 'sales',
    'stock bajo': 'stock',
    'clientes con deuda': 'debt',
};

const resolveWelcomeMessage = (metaWelcomeMessage, fallbackWelcomeMessage) => (
    metaWelcomeMessage || fallbackWelcomeMessage || FALLBACK_WELCOME_MESSAGE
);

const normalizeMessages = (messages, welcomeMessage) => (
    Array.isArray(messages) && messages.length > 0
        ? messages
        : buildDefaultMessages(resolveWelcomeMessage(null, welcomeMessage))
);

const resolveQuickActionKey = (action) => {
    if (!action) return null;

    if (typeof action === 'object' && typeof action.id === 'string') {
        return action.id;
    }

    const normalized = String(action).trim().toLowerCase();

    return QUICK_ACTION_ALIASES[normalized] || null;
};

export const artieService = {
    getRandomPhrase: () => {
        return PHRASES[Math.floor(Math.random() * PHRASES.length)];
    },

    buildWelcomeMessages: (welcomeMessage) => buildDefaultMessages(welcomeMessage),

    getQuickActionPrompt: (action) => {
        const quickActionKey = resolveQuickActionKey(action);

        if (quickActionKey && QUICK_ACTION_PROMPTS[quickActionKey]) {
            return QUICK_ACTION_PROMPTS[quickActionKey];
        }

        if (typeof action === 'object' && typeof action.label === 'string') {
            return action.label;
        }

        return String(action ?? '').trim();
    },

    loadConversations: async () => {
        try {
            const response = await axios.get(route('api.chatbot.index'));
            return response.data.conversations || [];
        } catch (error) {
            console.error('Artie conversations error:', error);
            return [];
        }
    },

    loadHistory: async (chatbotEnabled, welcomeMessage, conversationId = null) => {
        if (!chatbotEnabled) {
            return {
                messages: buildDefaultMessages(welcomeMessage),
                conversationId: null,
                meta: null,
                storageReady: false,
            };
        }

        try {
            const response = await axios.get(
                conversationId
                    ? route('api.chatbot.history', { id: conversationId })
                    : route('api.chatbot.history')
            );
            const wm = resolveWelcomeMessage(response.data.meta?.welcome_message, welcomeMessage);

            return {
                messages: normalizeMessages(response.data.messages, wm),
                conversationId: response.data.conversation_id ?? conversationId,
                meta: response.data.meta || null,
                storageReady: response.data.storage_ready !== false,
            };
        } catch (error) {
            console.error('Artie history error:', error);
            return {
                messages: buildDefaultMessages(welcomeMessage),
                conversationId,
                meta: null,
                storageReady: false,
            };
        }
    },

    sendMessage: async ({ messageText, conversationId = null }) => {
        try {
            const response = await axios.post(route('api.chatbot'), {
                message: messageText,
                conversation_id: conversationId,
            });
            const welcomeMessage = resolveWelcomeMessage(response.data.meta?.welcome_message, null);

            return {
                success: true,
                messages: normalizeMessages(response.data.messages, welcomeMessage),
                reply: response.data.message,
                conversationId: response.data.conversation_id ?? conversationId,
                meta: response.data.meta || null,
                storageReady: response.data.storage_ready !== false,
            };
        } catch (error) {
            console.error('Artie send error:', error);
            return {
                success: false,
                reply: error.response?.data?.message || 'Hubo un inconveniente para conectar con el servidor central.',
                conversationId,
            };
        }
    },

    resetConversation: async (welcomeMessage) => {
        try {
            const response = await axios.delete(route('api.chatbot.reset'));
            const resolvedWelcomeMessage = resolveWelcomeMessage(response.data.meta?.welcome_message, welcomeMessage);

            return {
                success: true,
                messages: normalizeMessages(response.data.messages, resolvedWelcomeMessage),
                conversationId: response.data.conversation_id ?? null,
                meta: response.data.meta || null,
                storageReady: response.data.storage_ready !== false,
            };
        } catch (error) {
            console.error('Artie reset error:', error);
            return {
                success: false,
                messages: buildDefaultMessages(welcomeMessage),
                conversationId: null,
                meta: null,
                storageReady: false,
                reply: error.response?.data?.message || 'No pude reiniciar la conversación en este momento.',
            };
        }
    }
};
