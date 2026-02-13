// Test script to check API responses

const axios = require('axios');

async function testAPI() {
    try {
        console.log('=== Testing API Responses ===');
        
        // Test assignments API
        console.log('\n=== Assignments API ===');
        const assignmentsResponse = await axios.get('http://localhost:3000/api/assignments');
        console.log('Status:', assignmentsResponse.status);
        console.log('Data:', JSON.stringify(assignmentsResponse.data, null, 2));
        
        if (assignmentsResponse.data.assignments && assignmentsResponse.data.assignments.length > 0) {
            console.log('\n=== First Assignment ===');
            console.log(JSON.stringify(assignmentsResponse.data.assignments[0], null, 2));
        }
        
        // Test people API
        console.log('\n=== People API ===');
        const peopleResponse = await axios.get('http://localhost:3000/api/users');
        console.log('Status:', peopleResponse.status);
        console.log('Data:', JSON.stringify(peopleResponse.data, null, 2));
        
        // Test projects API
        console.log('\n=== Projects API ===');
        const projectsResponse = await axios.get('http://localhost:3000/api/projects');
        console.log('Status:', projectsResponse.status);
        console.log('Data:', JSON.stringify(projectsResponse.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

// Only run if script is executed directly
if (require.main === module) {
    testAPI();
}
