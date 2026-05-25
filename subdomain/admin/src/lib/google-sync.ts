import { google } from 'googleapis';
import { GoogleIntegration } from '@/models/GoogleIntegration';
import { AnalyticsSnapshot } from '@/models/AnalyticsSnapshot';
import { SearchConsoleMetrics } from '@/models/SearchConsoleMetrics';
import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
};

export async function getGoogleClient(service: 'analytics' | 'search_console') {
  await connectDB();
  const integration = await GoogleIntegration.findOne({ service });
  
  if (!integration || !integration.refreshToken) {
    throw new Error(`Google ${service} not integrated or missing refresh token`);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_ID,
    process.env.GOOGLE_SEARCH_CONSOLE_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: integration.refreshToken,
    access_token: integration.accessToken
  });

  return oauth2Client;
}

export async function syncGA4Data() {
  const auth = await getGoogleClient('analytics');
  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth });
  
  const propertyId = process.env.GOOGLE_ANALYTICS_ID?.replace('G-', '') || '';

  const response = await analyticsdata.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' }
      ]
    }
  });

  const rows = response.data.rows || [];
  for (const row of rows) {
    const dateStr = row.dimensionValues?.[0].value || '';
    const date = new Date(
      parseInt(dateStr.substring(0, 4)),
      parseInt(dateStr.substring(4, 6)) - 1,
      parseInt(dateStr.substring(6, 8))
    );

    await AnalyticsSnapshot.findOneAndUpdate(
      { date, source: 'GA4' },
      {
        visitors: parseInt(row.metricValues?.[0].value || '0'),
        pageviews: parseInt(row.metricValues?.[1].value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2].value || '0'),
        avgSessionDuration: parseFloat(row.metricValues?.[3].value || '0'),
      },
      { upsert: true }
    );
  }

  await GoogleIntegration.updateOne({ service: 'analytics' }, { lastSync: new Date() });
}

export async function syncSearchConsoleData() {
  const auth = await getGoogleClient('search_console');
  const searchconsole = google.searchconsole({ version: 'v1', auth });
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.fashcon.store';

  const response = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      dimensions: ['date']
    }
  });

  const rows = response.data.rows || [];
  for (const row of rows) {
    const date = new Date(row.keys?.[0] || '');
    
    await SearchConsoleMetrics.findOneAndUpdate(
      { date },
      {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0,
      },
      { upsert: true }
    );
  }

  await GoogleIntegration.updateOne({ service: 'search_console' }, { lastSync: new Date() });
}
