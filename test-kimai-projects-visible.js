const mysql = require('mysql2/promise');

// Kimai database connection configuration
const kimaiConfig = {
  host: '172.245.119.247',
  port: 3308,
  user: 'kimaiuser',
  password: 'kimaipassword',
  database: 'kimai',
  connectTimeout: 10000,
};

async function testKimaiProjects() {
  try {
    console.log('Connecting to Kimai database...');
    const connection = await mysql.createConnection(kimaiConfig);
    
    console.log('Fetching all projects from kimai2_projects table...');
    const [projects] = await connection.execute(`
      SELECT id, name, color, visible
      FROM kimai2_projects
    `);
    
    console.log(`Found ${projects.length} projects:`);
    projects.forEach(project => {
      console.log(`ID: ${project.id}, Name: ${project.name}, Color: ${project.color}, Visible: ${project.visible}`);
    });
    
    await connection.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

testKimaiProjects();