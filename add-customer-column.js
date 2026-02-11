const mysql = require('mysql2/promise');

const dbConfig = {
  host: '23.94.84.111',
  port: 3307,
  user: 'projectmanager',
  password: 'Brewing4-Prankster-Strategic',
  database: 'projectmanagerdb',
};

async function addCustomerColumn() {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection(dbConfig);

    console.log('Adding customer column to projects table...');
    await connection.execute(`
      ALTER TABLE projects
      ADD COLUMN customer VARCHAR(255) NULL
    `);

    console.log('Customer column added successfully');

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

addCustomerColumn();