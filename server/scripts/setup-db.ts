import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Test the database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if we have any integrations
    const integrations = await prisma.integration.findMany();
    console.log(`✅ Found ${integrations.length} integrations`);
    
    // Check if we have any call logs
    const callLogs = await prisma.callLog.findMany();
    console.log(`✅ Found ${callLogs.length} call logs`);
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
