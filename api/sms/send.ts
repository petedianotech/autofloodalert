// Vercel Serverless Function for Textbee SMS Relay
export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { recipients, message, textbeeApiKey, textbeeDeviceId } = req.body || {};

    if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: message or recipients list.',
      });
    }

    const defaultMsg = 'FLOOD ALERT: Ruo River rising fast at Dzenje! Evacuate to high ground now!';
    const safeMessage = (message || defaultMsg).slice(0, 99);
    const cleanRecipients = recipients
      .map((r: string) => (r || '').trim())
      .filter((r: string) => r.length >= 6);

    const effectiveApiKey =
      textbeeApiKey && textbeeApiKey.trim().length > 5
        ? textbeeApiKey.trim()
        : process.env.TEXTBEE_API_KEY || 'txb_qFXRYTTd0wxVbT5sXIw8sHCHPygvhSrQ';

    const effectiveDeviceId =
      textbeeDeviceId && textbeeDeviceId.trim().length > 5
        ? textbeeDeviceId.trim()
        : process.env.TEXTBEE_DEVICE_ID || '6a8fc290f3dc6f0f7b175829';

    const textbeeUrl = `https://api.textbee.dev/api/v1/gateway/devices/${effectiveDeviceId}/send-sms`;

    const tbResponse = await fetch(textbeeUrl, {
      method: 'POST',
      headers: {
        'x-api-key': effectiveApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipients: cleanRecipients,
        message: safeMessage,
      }),
    });

    const tbData = await tbResponse.json().catch(() => ({}));

    if (tbResponse.ok) {
      return res.status(200).json({
        success: true,
        sentCount: cleanRecipients.length,
        failedCount: 0,
        totalRecipients: cleanRecipients.length,
        textbeeMessage: tbData.message || 'SMS queued successfully on Samsung SM-A105F device.',
      });
    }

    return res.status(tbResponse.status || 500).json({
      success: false,
      error: tbData.message || `Textbee returned status ${tbResponse.status}`,
    });
  } catch (err: any) {
    console.error('[Vercel SMS API] Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal SMS relay error',
    });
  }
}
