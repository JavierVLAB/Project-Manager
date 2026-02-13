const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testLocalProjects() {
  try {
    console.log('Fetching all projects from local database...');
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        visible: true,
      },
    });
    
    console.log(`Found ${projects.length} projects:`);
    projects.forEach(project => {
      console.log(`ID: ${project.id}, Name: ${project.name}, Color: ${project.color}, Visible: ${project.visible}`);
    });
    
    // Check if there are any projects with visible: false
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

testLocalProjects();