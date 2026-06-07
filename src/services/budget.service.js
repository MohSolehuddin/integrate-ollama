// Budget service - use axios to call the budget service directly
const axios = require('axios');

const config = require('../config');

/**
 * Call the budget service API to get or create budget
 */
const getOrCreateBudget = async (senderId) => {
  try {
    const response = await callBudgetService('/api/budget/status', {
      method: 'GET',
      headers: {
        'X-Telegram-Sender': senderId
      }
    });

    return {
      budgetId: response.budgetId,
      email: response.email,
      userId: response.budgetId
    };
  } catch (error) {
    console.error(`Failed to get or create budget for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Get accounts from budget service
 */
const getAccounts = async (senderId) => {
  try {
    const response = await callBudgetService('/api/budget/accounts', {
      method: 'GET',
      headers: {
        'X-Telegram-Sender': senderId
      }
    });

    return response.data || [];
  } catch (error) {
    console.error(`Failed to get accounts for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Get categories from budget service
 */
const getCategories = async (senderId) => {
  try {
    const response = await callBudgetService('/api/budget/categories', {
      method: 'GET',
      headers: {
        'X-Telegram-Sender': senderId
      }
    });

    return response.data || [];
  } catch (error) {
    console.error(`Failed to get categories for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Process and sync transaction to budget service
 */
const processTransaction = async (senderId, transactionData) => {
  try {
    const response = await callBudgetService('/budget/transactions', {
      method: 'POST',
      data: {
        accountId: 'local_1',
        transactions: [{
          date: transactionData.date || new Date().toISOString().split('T')[0],
          amount: transactionData.amount || 0,
          payee: transactionData.payee || null,
          category: transactionData.category || 'food',
          notes: transactionData.notes || null
        }]
      },
      headers: {
        'X-Telegram-Sender': senderId,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      transactionId: response.data?.id || null,
      syncedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Failed to process transaction for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Make HTTP call to budget service
 */
const callBudgetService = async (endpoint, options = {}) => {
  const url = `${config.BUDGET_SERVICE_URL}${endpoint}`;
  
  try {
    console.log(`DEBUG callBudgetService: endpoint=${endpoint}, method=${options.method}`);
    
    const response = await axios({
      method: options.method,
      url: url,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      data: options.data || null,
      timeout: 10000
    });

    console.log(`DEBUG callBudgetService: response status=${response.status}`);
    return response.data;
  } catch (error) {
    console.error(`DEBUG callBudgetService: ERROR - ${error.response?.status || 'UNKNOWN'} ${error.message}`);
    if (error.response?.data) {
      console.error(`DEBUG callBudgetService: response data=${error.response.data}`);
    }
    throw error;
  }
};

module.exports = {
  getOrCreateBudget,
  getAccounts,
  getCategories,
  processTransaction
};
