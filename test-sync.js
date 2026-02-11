const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Kimai database connection configuration
const kimaiConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

async function getKimaiConnection() {
  const connection = await mysql.createConnection(kimaiConfig);
  return connection;
}

async function getKimaiProjects() {
  const connection = await getKimaiConnection();
  const [projects] = await connection.execute(`
    SELECT p.id, p.name, p.color, c.name as customer_name, p.visible
    FROM kimai2_projects p
    LEFT JOIN kimai2_customers c ON p.customer_id = c.id
  `);
  await connection.end();
  
  return projects.map(project => ({
    id: project.id.toString(),
    name: project.name,
    customer: project.customer_name,
    color: project.color || '#000000',
    visible: Boolean(project.visible),
  }));
}

async function syncKimaiProjects() {
  const kimaiProjects = await getKimaiProjects();
  console.log(`Found ${kimaiProjects.length} projects in Kimai (${kimaiProjects.filter(p => p.visible).length} visible)`);
  
  const existingProjects = await prisma.project.findMany();
  const existingProjectIds = existingProjects.map(project => project.id);
  const kimaiProjectIds = kimaiProjects.map(project => project.id);
  
  const projectsToCreate = kimaiProjects.filter(project => !existingProjectIds.includes(project.id));
  if (projectsToCreate.length > 0) {
    await prisma.project.createMany({
      data: projectsToCreate.map(project => ({
        id: project.id,
        name: project.name,
        color: project.color,
        visible: project.visible,
      })),
    });
  }
  
  const projectsToUpdate = kimaiProjects.filter(project => existingProjectIds.includes(project.id));
  for (const project of projectsToUpdate) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        name: project.name,
        color: project.color,
        visible: project.visible,
      },
    });
  }
  
  const projectsToMarkInvisible = existingProjects.filter(project => 
    !kimaiProjectIds.includes(project.id) || 
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

async function testSync() {
  try {
    console.log('Starting syncKimaiProjects...');
    const kimaiProjects = await getKimaiProjects();
    console.log(`Found ${kimaiProjects.length} projects in Kimai (${kimaiProjects.filter(p => p.visible).length} visible)`);
    
    // Check if any projects have customer information
    const projectsWithCustomer = kimaiProjects.filter(project => project.customer);
    console.log(`\nFound ${projectsWithCustomer.length} projects with customer information:`);
    projectsWithCustomer.forEach(project => {
      console.log(`ID: ${project.id}, Name: ${project.name}, Customer: ${project.customer}`);
    });
    
    // Sync with local database
    const projects = await syncKimaiProjects();
    console.log(`Sync completed. Found ${projects.length} projects in local database:`);
    
    const invisibleProjects = projects.filter(project => !project.visible);
    console.log(`\nFound ${invisibleProjects.length} invisible projects:`);
    invisibleProjects.forEach(project => {
      console.log(`ID: ${project.id}, Name: ${project.name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSync();