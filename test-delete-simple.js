// Test script to debug assignment deletion API
const http = require('http');

function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(data) : 0
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    if (body) {
                        body = JSON.parse(body);
                    }
                } catch (e) {
                    console.error('Failed to parse response');
                }
                resolve({ status: res.statusCode, data: body });
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(data);
        }
        req.end();
    });
}

async function testDeleteAPI() {
    try {
        console.log('=== Testing Assignment Delete API ===');
        
        // First, create a test assignment
        console.log('1. Creating test assignment...');
        const createData = JSON.stringify({
            personId: 'test-person',
            projectId: 'test-project',
            startDate: new Date('2026-02-02').toISOString(),
            endDate: new Date('2026-02-08').toISOString(),
            percentage: 50
        });
        
        const createResponse = await makeRequest('POST', '/api/assignments', createData);
        console.log('✅ Create response:', createResponse.status);
        
        if (createResponse.status !== 200) {
            console.error('❌ Failed to create test assignment:', createResponse.data);
            return;
        }
        
        const testAssignment = createResponse.data;
        console.log('✅ Created test assignment:', testAssignment);
        
        // Verify it exists
        console.log('\n2. Checking if assignment exists in database...');
        const getResponse = await makeRequest('GET', '/api/assignments');
        console.log('✅ Get response:', getResponse.status);
        
        const assignments = getResponse.data.assignments;
        const testAssignmentInDB = assignments.find(a => a.id === testAssignment.id);
        console.log('✅ Assignment exists in database:', !!testAssignmentInDB);
        
        // Try to delete it
        console.log('\n3. Attempting to delete assignment...');
        const deleteData = JSON.stringify({ id: testAssignment.id });
        const deleteResponse = await makeRequest('DELETE', '/api/assignments', deleteData);
        
        console.log('✅ Delete response:', deleteResponse.status);
        
        if (deleteResponse.status !== 200) {
            console.error('❌ Failed to delete assignment:', deleteResponse.data);
            return;
        }
        
        console.log('✅ Delete data:', deleteResponse.data);
        
        // Verify it was deleted
        console.log('\n4. Verifying assignment was deleted...');
        const checkResponse = await makeRequest('GET', '/api/assignments');
        const assignmentsAfterDelete = checkResponse.data.assignments;
        const assignmentStillExists = assignmentsAfterDelete.find(a => a.id === testAssignment.id);
        console.log('✅ Assignment still exists:', !!assignmentStillExists);
        
        if (assignmentStillExists) {
            console.error('❌ Assignment was NOT deleted from database');
        } else {
            console.log('✅ Assignment successfully deleted from database');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

testDeleteAPI();
