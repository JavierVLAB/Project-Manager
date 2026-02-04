import mysql from 'mysql2/promise';
import { prisma } from '@/lib/prisma';

// Kimai database connection configuration
const kimaiConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

// Create a reusable connection pool
let connectionPool: mysql.Pool | null = null;

async function getKimaiConnection() {
  if (!connectionPool) {
    connectionPool = mysql.createPool(kimaiConfig);
  }
  return connectionPool;
}

// Function to fetch all users from Kimai (both enabled and disabled)
export async function getKimaiUsers() {
  const pool = await getKimaiConnection();
  const [users] = await pool.execute(`
    SELECT id, username, alias as name, email, enabled 
    FROM kimai2_users 
  `);
  
  return (users as any[]).map((user: any) => ({
    id: user.id.toString(),
    name: user.name || user.username, // Use alias (full name) if available
    username: user.username,
    email: user.email,
    enabled: Boolean(user.enabled), // Include enabled status
  }));
}

// Function to fetch all visible projects from Kimai
export async function getKimaiProjects() {
  const pool = await getKimaiConnection();
  const [projects] = await pool.execute(`
    SELECT p.id, p.name, p.color, c.name as customer_name
    FROM kimai2_projects p
    LEFT JOIN kimai2_customers c ON p.customer_id = c.id
    WHERE p.visible = 1
  `);
  
  return (projects as any[]).map((project: any) => ({
    id: project.id.toString(),
    name: project.name,
    customer: project.customer_name,
    color: project.color || '#000000', // Default color if null
  }));
}

// Function to synchronize Kimai users with local database
export async function syncKimaiUsers() {
  const kimaiUsers = await getKimaiUsers();
  console.log(`Found ${kimaiUsers.length} users in Kimai (${kimaiUsers.filter(u => u.enabled).length} enabled)`);
  
  // Synchronize with local database
  await prisma.person.deleteMany();
  const createdUsers = await prisma.person.createMany({
    data: kimaiUsers.map(user => ({
      id: user.id,
      name: user.name,
      enabled: user.enabled !== undefined ? user.enabled : true,
    })),
  });
  
  console.log(`Synchronized ${createdUsers.count} users to local database`);
  
  return kimaiUsers;
}

// Function to synchronize Kimai projects with local database
export async function syncKimaiProjects() {
  const kimaiProjects = await getKimaiProjects();
  console.log(`Found ${kimaiProjects.length} visible projects in Kimai`);
  
  // Synchronize with local database
  await prisma.project.deleteMany();
  const createdProjects = await prisma.project.createMany({
    data: kimaiProjects.map(project => ({
      id: project.id,
      name: project.name,
      color: project.color,
    })),
  });
  
  console.log(`Synchronized ${createdProjects.count} projects to local database`);
  
  return kimaiProjects;
}

// Function to test Kimai connection
export async function testKimaiConnection() {
  try {
    const pool = await getKimaiConnection();
    const [result] = await pool.execute('SELECT 1');
    return (result as any[]).length > 0;
  } catch (error) {
    console.error('Kimai connection test failed:', error);
    return false;
  }
}
