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

// Function to fetch all projects from Kimai (including invisible ones)
export async function getKimaiProjects() {
  const pool = await getKimaiConnection();
  const [projects] = await pool.execute(`
    SELECT p.id, p.name, p.color, c.name as customer_name, p.visible
    FROM kimai2_projects p
    LEFT JOIN kimai2_customers c ON p.customer_id = c.id
  `);
  
  return (projects as any[]).map((project: any) => ({
    id: project.id.toString(),
    name: project.name,
    customer: project.customer_name,
    color: project.color || '#000000', // Default color if null
    visible: Boolean(project.visible),
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
  console.log(`Found ${kimaiProjects.length} projects in Kimai (${kimaiProjects.filter(p => p.visible).length} visible)`);
  
  // Synchronize with local database
  const existingProjects = await prisma.project.findMany();
  const existingProjectIds = existingProjects.map(project => project.id);
  const kimaiProjectIds = kimaiProjects.map(project => project.id);
  
  // Projects to create (not in local database)
  const projectsToCreate = kimaiProjects.filter(project => !existingProjectIds.includes(project.id));
  if (projectsToCreate.length > 0) {
    await prisma.project.createMany({
      data: projectsToCreate.map(project => ({
        id: project.id,
        name: project.name,
        color: project.color,
        visible: project.visible,
        customer: project.customer,
      })),
    });
  }
  
  // Projects to update (already in local database)
  const projectsToUpdate = kimaiProjects.filter(project => existingProjectIds.includes(project.id));
  for (const project of projectsToUpdate) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        color: project.color,
        visible: project.visible,
        customer: project.customer,
      },
    });
  }
  
  // Projects to delete (no longer in Kimai)
  const projectsToDelete = existingProjects.filter(project => 
    !kimaiProjectIds.includes(project.id)
  );
  for (const project of projectsToDelete) {
    try {
      await prisma.project.delete({
        where: { id: project.id },
      });
    } catch (error) {
      console.error(`Failed to delete project ${project.id}:`, error);
      // Continue with other deletions if one fails
    }
  }
  
  // Projects to mark as invisible (still in Kimai but now invisible)
  const projectsToMarkInvisible = existingProjects.filter(project => 
    kimaiProjectIds.includes(project.id) && 
    (kimaiProjects.find(p => p.id === project.id)?.visible === false)
  );
  for (const project of projectsToMarkInvisible) {
    await prisma.project.update({
      where: { id: project.id },
      data: { visible: false },
    });
  }
  
  console.log(`Synchronized projects: ${projectsToCreate.length} created, ${projectsToUpdate.length} updated, ${projectsToMarkInvisible.length} marked as invisible`);
  
  return await prisma.project.findMany();
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
