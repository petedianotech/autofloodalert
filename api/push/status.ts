import { getFcmV1Status } from '../../src/server/fcmV1Client';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const status = await getFcmV1Status();
    return res.status(200).json(status);
  } catch (err: any) {
    return res.status(500).json({
      configured: false,
      apiVersion: 'Firebase Cloud Messaging HTTP v1',
      serviceName: 'FCM Push Gateway (HTTP v1)',
      error: err.message || 'Error checking FCM Gateway status.',
    });
  }
}
