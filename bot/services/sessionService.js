/**
 * Gerenciador de sessões de conversa.
 * Cada usuário possui uma sessão com o step atual e dados temporários.
 */

const sessions = new Map();

// Tempo de expiração da sessão (30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Retorna a sessão de um usuário. Cria uma nova se não existir.
 */
function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, {
      step: 'menu',
      data: {},
      lastActivity: Date.now(),
    });
  }

  const session = sessions.get(userId);
  session.lastActivity = Date.now();
  return session;
}

/**
 * Atualiza o step da sessão do usuário.
 */
function setStep(userId, step) {
  const session = getSession(userId);
  session.step = step;
}

/**
 * Salva dados temporários na sessão (ex: agendamento em andamento).
 */
function setSessionData(userId, key, value) {
  const session = getSession(userId);
  session.data[key] = value;
}

/**
 * Reseta a sessão do usuário ao estado inicial.
 */
function resetSession(userId) {
  sessions.set(userId, {
    step: 'menu',
    data: {},
    lastActivity: Date.now(),
  });
}

/**
 * Limpa sessões expiradas periodicamente.
 */
function cleanExpiredSessions() {
  const now = Date.now();
  for (const [userId, session] of sessions) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      sessions.delete(userId);
    }
  }
}

// Limpeza automática a cada 10 minutos
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

module.exports = {
  getSession,
  setStep,
  setSessionData,
  resetSession,
};
