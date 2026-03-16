const fetch = require('node-fetch');

async function testApi() {
  const BASE_URL = 'http://localhost:3000'; // Assuming server is running on 3000

  console.log('--- Testing Hostel APIs ---');

  try {
    // 1. Test GET /api/rooms
    console.log('\nTesting GET /api/rooms...');
    const roomRes = await fetch(`${BASE_URL}/api/rooms`);
    const roomData = await roomRes.json();
    console.log('Status:', roomRes.status);
    console.log('Rooms Count:', roomData.rooms ? roomData.rooms.length : 0);

    // 2. Test GET /api/hostelers
    console.log('\nTesting GET /api/hostelers...');
    const hostelerRes = await fetch(`${BASE_URL}/api/hostelers`);
    const hostelerData = await hostelerRes.json();
    console.log('Status:', hostelerRes.status);
    if (hostelerRes.status !== 200) {
      console.log('Error:', hostelerData.error);
    } else {
      console.log('Hostelers Count:', hostelerData.hostelers ? hostelerData.hostelers.length : 0);
    }

    // 3. Test POST /api/rooms
    console.log('\nTesting POST /api/rooms...');
    const newRoomRes = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomNo: "101-Test",
        floor: "Ground",
        capacity: 2,
        hostelBlock: "Test-Block"
      })
    });
    const newRoomData = await newRoomRes.json();
    console.log('Status:', newRoomRes.status);
    console.log('Message:', newRoomData.message);

    // 4. Test GET /api/hostel-applications
    console.log('\nTesting GET /api/hostel-applications (may require auth)...');
    const appRes = await fetch(`${BASE_URL}/api/hostel-applications`);
    const appData = await appRes.json();
    console.log('Status:', appRes.status);
    if (appRes.status === 401) {
      console.log('Note: Auth required for applications as expected.');
    } else {
      console.log('Applications Count:', appData.applications ? appData.applications.length : 0);
    }

  } catch (error) {
    console.error('Connection error:', error.message);
    console.log('Please ensure the dev server is running (npm run dev).');
  }
}

testApi();
