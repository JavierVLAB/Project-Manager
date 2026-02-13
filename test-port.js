const net = require('net');

const HOST = '23.94.84.111';
const PORT = 3306;

console.log(`Testing port ${PORT} on ${HOST}...`);

const socket = new net.Socket();

socket.connect(PORT, HOST, () => {
    console.log(`✅ Port ${PORT} is open`);
    socket.destroy();
});

socket.setTimeout(5000);

socket.on('timeout', () => {
    console.log(`❌ Timeout: Could not connect to ${HOST}:${PORT}`);
    socket.destroy();
});

socket.on('error', (err) => {
    console.error(`❌ Error: ${err.message}`);
    socket.destroy();
});

socket.on('close', () => {
    console.log('Connection closed');
});
