const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment!');
  process.exit(1);
}

// User schema definition
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  role: { type: String, enum: ['user', 'manager', 'admin', 'super_admin'], default: 'user' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    // List all users before
    const allBefore = await User.find({});
    console.log('--- Current Personnel in Database ---');
    allBefore.forEach(u => {
      console.log(`- ${u.displayName} (${u.email}) [Role: ${u.role}] ID: ${u._id}`);
    });

    // Delete ANONYMOUS and DEV ADMINISTRATOR
    console.log('\nPurging ANONYMOUS and DEV ADMINISTRATOR test accounts...');
    const resultAnonymous = await User.deleteOne({ email: 'admin@fashcon.store' });
    const resultDev = await User.deleteOne({ email: 'admin@fashcon.dev' });

    console.log(`Deleted ANONYMOUS: ${resultAnonymous.deletedCount} record(s)`);
    console.log(`Deleted DEV ADMINISTRATOR: ${resultDev.deletedCount} record(s)`);

    // List all users after
    const allAfter = await User.find({});
    console.log('\n--- Active Personnel After Purge ---');
    allAfter.forEach(u => {
      console.log(`- ${u.displayName} (${u.email}) [Role: ${u.role}] ID: ${u._id}`);
    });

  } catch (error) {
    console.error('Error executing database command:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
}

run();
