// 🗺️ API Endpoints
// جميع الـ API routes في مكان واحد

const ENDPOINTS = {
  // ==========================================
  // 🔐 Authentication
  // ==========================================
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  
  // ==========================================
  // 👤 Users
  // ==========================================
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    UPLOAD_AVATAR: '/users/avatar',
  },
  
  // ==========================================
  // 📇 Contacts
  // ==========================================
  CONTACTS: {
    BASE: '/contacts',
    BY_ID: (id) => `/contacts/${id}`,
    IMPORT: '/contacts/import',
    EXPORT: '/contacts/export',
    BULK_DELETE: '/contacts/bulk-delete',
    SEARCH: '/contacts/search',
    TAGS: '/contacts/tags',
    STATS: '/contacts/stats',
  },
  
  // ==========================================
  // 📧 Email Campaigns
  // ==========================================
  CAMPAIGNS: {
    BASE: '/campaigns',
    BY_ID: (id) => `/campaigns/${id}`,
    SEND: (id) => `/campaigns/${id}/send`,
    PAUSE: (id) => `/campaigns/${id}/pause`,
    RESUME: (id) => `/campaigns/${id}/resume`,
    STATS: (id) => `/campaigns/${id}/stats`,
    RECIPIENTS: (id) => `/campaigns/${id}/recipients`,
  },
  
  // ==========================================
  // 📝 Email Templates
  // ==========================================
  TEMPLATES: {
    BASE: '/templates',
    BY_ID: (id) => `/templates/${id}`,
    DUPLICATE: (id) => `/templates/${id}/duplicate`,
    TEST: (id) => `/templates/${id}/test`,
  },
  
  // ==========================================
  // 🤖 Automation
  // ==========================================
  AUTOMATION: {
    BASE: '/automation',
    BY_ID: (id) => `/automation/${id}`,
    TOGGLE: (id) => `/automation/${id}/toggle`,
    STATS: (id) => `/automation/${id}/stats`,
    LOGS: (id) => `/automation/${id}/logs`,
  },
  
  // ==========================================
  // 💬 Social Media
  // ==========================================
  SOCIAL: {
    // Instagram
    INSTAGRAM: {
      CONNECT: '/social/instagram/connect',
      DISCONNECT: '/social/instagram/disconnect',
      POSTS: '/social/instagram/posts',
      COMMENTS: '/social/instagram/comments',
      REPLY: '/social/instagram/reply',
    },
    
    // Facebook
    FACEBOOK: {
      CONNECT: '/social/facebook/connect',
      DISCONNECT: '/social/facebook/disconnect',
      POSTS: '/social/facebook/posts',
      COMMENTS: '/social/facebook/comments',
      REPLY: '/social/facebook/reply',
    },
    
    // Inbox
    INBOX: '/social/inbox',
    CONVERSATIONS: '/social/conversations',
  },
  
  // ==========================================
  // 📊 Analytics
  // ==========================================
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    CONTACTS: '/analytics/contacts',
    CAMPAIGNS: '/analytics/campaigns',
    SOCIAL: '/analytics/social',
    ENGAGEMENT: '/analytics/engagement',
    REVENUE: '/analytics/revenue',
  },
  
  // ==========================================
  // ⚙️ Settings
  // ==========================================
  SETTINGS: {
    GENERAL: '/settings/general',
    INTEGRATIONS: '/settings/integrations',
    NOTIFICATIONS: '/settings/notifications',
    BILLING: '/settings/billing',
    TEAM: '/settings/team',
  },
  
  // ==========================================
  // 🔗 Integrations
  // ==========================================
  INTEGRATIONS: {
    GHL: {
      CONNECT: '/integrations/ghl/connect',
      DISCONNECT: '/integrations/ghl/disconnect',
      SYNC: '/integrations/ghl/sync',
      WEBHOOKS: '/integrations/ghl/webhooks',
    },
    BREVO: {
      TEST: '/integrations/brevo/test',
      STATUS: '/integrations/brevo/status',
    },
    INSTAGRAM_POSTS: '/integrations/instagram/posts',
    FACEBOOK_POSTS: '/integrations/facebook/posts',
  },
  
  // ==========================================
  // 🧪 Test Endpoints
  // ==========================================
  TEST: {
    SEND_EMAIL: '/test/send-email',
    HEALTH: '/health',
  },
};

export default ENDPOINTS;