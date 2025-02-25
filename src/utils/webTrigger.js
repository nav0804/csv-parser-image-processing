const axios = require('axios');

async function triggerWebhook(webhookUrl, data) {
  try {
    await axios.post(webhookUrl, data);
    console.log('Webhook triggered successfully');
  } catch (error) {
    console.error('Failed to trigger webhook:', error);
  }
}

module.exports = { triggerWebhook };
