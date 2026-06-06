// Budget service - use http to call the budget service directly
const http = require('http');

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
    const response = await callBudgetService('/api/budget/transactions', {
      method: 'POST',
      body: {
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
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, config.BUDGET_SERVICE_URL);
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    if (options.body) {
      requestOptions.body = JSON.stringify(options.body);
    }

    const req = http.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Budget service error: ${res.statusCode} ${parsed.error || data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
};

module.exports = {
  getOrCreateBudget,
  getAccounts,
  getCategories,
  processTransaction
};
