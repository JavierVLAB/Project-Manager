// Test script to debug assignment deletion API

const axios = require('axios');

async function testDeleteAPI() {
    try {
        console.log('=== Testing Assignment Delete API ===');
        
        // First, create a test assignment
        console.log('1. Creating test assignment...');
        const createResponse = await axios.post('http://localhost:3000/api/assignments', {
            personId: 'test-person',
            projectId: 'test-project',
            startDate: new Date('2026-02-02').toISOString(),
            endDate: new Date('2026-02-08').toISOString(),
            percentage: 50
        });
        
        const testAssignment = createResponse.data;
        console.log('✅ Created test assignment:', testAssignment);
        
        // Verify it exists
        console.log('\n2. Checking if assignment exists in database...');
        const getResponse = await axios.get('http://localhost:3000/api/assignments');
        const assignments = getResponse.data.assignments;
        const testAssignmentInDB = assignments.find(a => a.id === testAssignment.id);
        console.log('✅ Assignment exists in database:', !!testAssignmentInDB);
        
        // Try to delete it
        console.log('\n3. Attempting to delete assignment...');
        const deleteResponse = await axios.delete('http://localhost:3000/api/assignments', {
            data: { id: testAssignment.id }
        });
        
        console.log('✅ Delete response:', deleteResponse.status, deleteResponse.data);
        
        // Verify it was deleted
        console.log('\n4. Verifying assignment was deleted...');
        const checkResponse = await axios.get('http://localhost:3000/api/assignments');
        const assignmentsAfterDelete = checkResponse.data.assignments;
        const assignmentStillExists = assignmentsAfterDelete.find(a => a.id === testAssignment.id);
        console.log('✅ Assignment still exists:', !!assignmentStillExists);
        
        if (assignmentStillExists) {
            console.error('❌ Assignment was NOT deleted from database');
            console.log('Current assignments:', assignmentsAfterDelete);
        } else {
            console.log('✅ Assignment successfully deleted from database');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testDeleteAPI();
