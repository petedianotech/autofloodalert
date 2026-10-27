import { sendFcmV1Push } from '../../src/server/fcmV1Client';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const { title, body, severity, village, peakDelta, tokens, data } = req.body || {};

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters "title" or "body".',
      });
    }

    const result = await sendFcmV1Push({
      title,
      body,
      severity,
      village,
      peakDelta,
      tokens: Array.isArray(tokens) ? tokens : [],
      data,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch FCM push notification.',
    });
  }
}
