
async function testBackend() {
    try {
        console.log('Testing Health...');
        const healthRes = await fetch('http://localhost:3001/health');
        console.log('Health Status:', healthRes.status);
        const healthData = await healthRes.json();
        console.log('Health Data:', healthData);

        console.log('\nTesting Chat...');
        const chatRes = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: 'test-user',
                message: 'Hello Trixie'
            })
        });
        console.log('Chat Status:', chatRes.status);
        const chatText = await chatRes.text();
        console.log('Chat Response:', chatText);

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testBackend();
