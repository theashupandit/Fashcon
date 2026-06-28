const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
console.log('Using MONGODB_URI:', MONGODB_URI);

const VisitorLogSchema = new mongoose.Schema({
  externalId: { type: String, required: true },
  event: { type: String, required: true },
  email: { type: String },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { collection: 'visitorlogs' });

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const VisitorLog = mongoose.models.VisitorLog || mongoose.model('VisitorLog', VisitorLogSchema);
  const logs = await VisitorLog.find({}).sort({ timestamp: 1 });
  console.log('Total visitor logs:', logs.length);

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
    const first = visitorLogs[0];
    const last = visitorLogs[visitorLogs.length - 1];
    const totalTimeMs = last.timestamp.getTime() - first.timestamp.getTime();
    const mins = Math.floor(totalTimeMs / 60000);
    const secs = Math.floor((totalTimeMs % 60000) / 1000);
    console.log(`Visitor: ${visitorId}`);
    console.log(`- Logs count: ${visitorLogs.length}`);
    console.log(`- First seen: ${first.timestamp.toISOString()}`);
    console.log(`- Last seen: ${last.timestamp.toISOString()}`);
    console.log(`- Time on site: ${mins}m ${secs}s`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
