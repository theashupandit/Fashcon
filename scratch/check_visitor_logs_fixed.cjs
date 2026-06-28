const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const VisitorLogSchema = new mongoose.Schema({
  externalId: { type: String, required: true },
  event: { type: String, required: true },
  email: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'visitorlogs' });

async function run() {
  await mongoose.connect(MONGODB_URI);

  const VisitorLog = mongoose.models.VisitorLog || mongoose.model('VisitorLog', VisitorLogSchema);
  const logs = await VisitorLog.find({}).sort({ timestamp: 1 });

  // Group by externalId
  const grouped = {};
  logs.forEach(log => {
    if (!grouped[log.externalId]) {
      grouped[log.externalId] = [];
    }
    grouped[log.externalId].push(log);
  });

  console.log(`Found ${Object.keys(grouped).length} unique visitors.`);

  for (const [visitorId, visitorLogs] of Object.entries(grouped)) {
    const sortedLogs = [...visitorLogs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Calculate total session time
    let totalSessionTimeMs = 0;
    if (sortedLogs.length > 0) {
      let sessionStart = new Date(sortedLogs[0].timestamp).getTime();
      let sessionLast = sessionStart;

      for (let i = 1; i < sortedLogs.length; i++) {
        const currentTimestamp = new Date(sortedLogs[i].timestamp).getTime();
        const gap = currentTimestamp - sessionLast;
        if (gap > 30 * 60 * 1000) {
          // End of session, add duration
          const sessionDuration = sessionLast - sessionStart;
          totalSessionTimeMs += sessionDuration > 0 ? sessionDuration : 30000;
          // Start new session
          sessionStart = currentTimestamp;
          sessionLast = currentTimestamp;
        } else {
          sessionLast = currentTimestamp;
        }
      }
      const finalSessionDuration = sessionLast - sessionStart;
      totalSessionTimeMs += finalSessionDuration > 0 ? finalSessionDuration : 30000;
    } else {
      totalSessionTimeMs = 30000;
    }

    const mins = Math.floor(totalSessionTimeMs / 60000);
    const secs = Math.floor((totalSessionTimeMs % 60000) / 1000);
    const timeOnSiteStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    // Only show visitors with logs count > 1 or non-zero duration
    if (visitorLogs.length > 1) {
      const legacyTotalTimeMs = new Date(sortedLogs[sortedLogs.length - 1].timestamp).getTime() - new Date(sortedLogs[0].timestamp).getTime();
      const legacyMins = Math.floor(legacyTotalTimeMs / 60000);
      const legacySecs = Math.floor((legacyTotalTimeMs % 60000) / 1000);
      const legacyStr = legacyTotalTimeMs > 0 ? `${legacyMins}m ${legacySecs}s` : '30s';

      if (legacyTotalTimeMs > 30 * 60 * 1000) { // Shows cases where they span multiple sessions
        console.log(`Visitor: ${visitorId}`);
        console.log(`  - Logs count: ${visitorLogs.length}`);
        console.log(`  - Old lifetime duration calculation: ${legacyStr}`);
        console.log(`  - New session-based calculation   : ${timeOnSiteStr}`);
      }
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
