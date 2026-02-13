// Test script to debug assignment deletion

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAssignmentManagement() {
    try {
        console.log('=== Starting Assignment Management Test ===');
        
        // Clean up any existing test assignments
        await prisma.assignment.deleteMany({
            where: {
                OR: [
                    { personId: 'test-person' },
                    { projectId: 'test-project' }
                ]
            }
        });
        
        await prisma.person.deleteMany({ where: { id: 'test-person' } });
        await prisma.project.deleteMany({ where: { id: 'test-project' } });
        
        console.log('✅ Cleaned up existing test data');
        
        // Create test person and project
        const testPerson = await prisma.person.create({
            data: {
                id: 'test-person',
                name: 'Test Person',
                enabled: true
            }
        });
        
        const testProject = await prisma.project.create({
            data: {
                id: 'test-project',
                name: 'Test Project',
                color: '#ff0000'
            }
        });
        
        console.log('✅ Created test person and project');
        
        // Test 1: Add single week assignment
        console.log('\n=== Test 1: Adding single week assignment ===');
        
        const startDate = new Date('2026-02-02'); // Monday
        const endDate = new Date('2026-02-08'); // Sunday
        
        const assignment1 = await prisma.assignment.create({
            data: {
                personId: testPerson.id,
                projectId: testProject.id,
                startDate: startDate,
                endDate: endDate,
                percentage: 50,
                layer: 0
            }
        });
        
        console.log('✅ Created assignment 1:', assignment1.id);
        
        // Check assignments count
        const assignmentsAfterAdd1 = await prisma.assignment.findMany({
            where: { personId: testPerson.id }
        });
        console.log('📊 Number of assignments after add 1:', assignmentsAfterAdd1.length);
        
        // Test 2: Try to delete assignment
        console.log('\n=== Test 2: Deleting assignment ===');
        
        const deleteResult = await prisma.assignment.delete({
            where: { id: assignment1.id }
        });
        
        console.log('✅ Deleted assignment:', deleteResult.id);
        
        // Check assignments count
        const assignmentsAfterDelete = await prisma.assignment.findMany({
            where: { personId: testPerson.id }
        });
        console.log('📊 Number of assignments after delete:', assignmentsAfterDelete.length);
        
        // Test 3: Add multiple week assignment
        console.log('\n=== Test 3: Adding multiple week assignment ===');
        
        const longStartDate = new Date('2026-02-02'); // Monday
        const longEndDate = new Date('2026-02-22'); // Three weeks later
        
        const assignment2 = await prisma.assignment.create({
            data: {
                personId: testPerson.id,
                projectId: testProject.id,
                startDate: longStartDate,
                endDate: longEndDate,
                percentage: 75,
                layer: 0
            }
        });
        
        console.log('✅ Created assignment 2:', assignment2.id);
        
        // Check assignments count
        const assignmentsAfterAdd2 = await prisma.assignment.findMany({
            where: { personId: testPerson.id }
        });
        console.log('📊 Number of assignments after add 2:', assignmentsAfterAdd2.length);
        
        // Test 4: Delete assignment 2
        console.log('\n=== Test 4: Deleting assignment 2 ===');
        
        const deleteResult2 = await prisma.assignment.delete({
            where: { id: assignment2.id }
        });
        
        console.log('✅ Deleted assignment:', deleteResult2.id);
        
        // Check final count
        const assignmentsFinal = await prisma.assignment.findMany({
            where: { personId: testPerson.id }
        });
        console.log('📊 Final number of assignments:', assignmentsFinal.length);
        
        // Cleanup
        await prisma.assignment.deleteMany({
            where: {
                OR: [
                    { personId: testPerson.id },
                    { projectId: testProject.id }
                ]
            }
        });
        
        await prisma.person.delete({ where: { id: testPerson.id } });
        await prisma.project.delete({ where: { id: testProject.id } });
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAssignmentManagement();
