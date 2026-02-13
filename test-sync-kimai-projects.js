const { PrismaClient } = require('@prisma/client');
const { syncKimaiProjects } = require('./src/lib/kimai');

const prisma = new PrismaClient();

async function testSync() {
  try {
    console.log('Starting syncKimaiProjects...');
    const projects = await syncKimaiProjects();
    console.log(`Sync completed. Found ${projects.length} projects in local database:`);
    
    // Check if there are any invisible projects
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