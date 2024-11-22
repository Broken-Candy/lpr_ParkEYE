               import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
        import { getDatabase, ref, set, get, update, push, onChildAdded, serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyD5odFpXeE_tXrREBWeYcIXMu5a4B3EQQo",
            authDomain: "license-plate-recognition--web.firebaseapp.com",
            projectId: "license-plate-recognition--web",
            storageBucket: "license-plate-recognition--web.appspot.com",
            messagingSenderId: "515853944080",
            appId: "1:515853944080:web:42f0fe6e5f38f02b0cd195",
            measurementId: "G-K4EZRGVRMR",
            databaseURL: "https://license-plate-recognition--web-default-rtdb.firebaseio.com"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const database = getDatabase(app);

        // Sign-up function
        function signUp(event) {
            event.preventDefault();

            // Get form values
            const vehicleNumber = document.getElementById('vehicle-number').value;
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;

            // Validate inputs...
            if (!validateMail(email) || !validatePassword(password)) {
                alert('Invalid email or password');
                return;
            }
            if (!validateFields(vehicleNumber) || !validateFields(username) || !validateFields(phone)) {
                alert('One or more fields are invalid');
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    const userRef = ref(database, 'users/' + user.uid);
                    const userData = {
                        vehicleNumber: vehicleNumber,
                        username: username,
                        phone: phone,
                        email: email,
                        walletBalance: 0 // Initialize wallet balance to 0
                    };

                    set(userRef, userData)
                        .then(() => alert('User created successfully!'))
                        .catch((error) => console.error('Error saving user data:', error));
                })
                .catch((error) => alert('Error: ' + error.message));
        }

        // Function to top up the wallet balance
        function topUpWallet(amount) {
            const userId = localStorage.getItem('loggedInUserId');
            const userRef = ref(database, 'users/' + userId);

            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const currentBalance = snapshot.val().walletBalance || 0;
                    const newBalance = currentBalance + amount;

                    update(userRef, { walletBalance: newBalance })
                        .then(() => alert('Wallet topped up successfully! New Balance: ' + newBalance))
                        .catch((error) => console.error('Error updating balance:', error));
                } else {
                    alert('User not found.');
                }
            });
        }

        // Function to check the wallet balance
        function checkBalance() {
            const userId = localStorage.getItem('loggedInUserId');
            const userRef = ref(database, 'users/' + userId);

            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const balance = snapshot.val().walletBalance || 0;
                    alert('Your wallet balance is: ' + balance);
                } else {
                    alert('User not found.');
                }
            });
        }

        // Log-in function
        function logIn(event) {
            event.preventDefault();
            const email = document.getElementById('email')?.value || '';
            const password = document.getElementById('password')?.value || '';

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredentials) => {
                    alert('Login successful!');
                    const user = userCredentials.user;
                    localStorage.setItem('loggedInUserId', user.uid);
                    window.location.href = 'dashboard.html'; // Redirect to wallet page after login
                })
                .catch((error) => {
                    const errorCode = error.code;
                    if (errorCode === 'auth/invalid-credentials') {
                        alert('Incorrect email or password');
                    } else {
                        alert('Account does not exist.');
                    }
                });
        }

        // Helper functions
        function validateMail(email) {
            const expression = /^[^@]+@\w+(\.\w+)+\w$/;
            return expression.test(email);
        }

        function validatePassword(password) {
            return password.length >= 6;
        }

        function validateFields(field) {
            return field != null && field.length > 0;
        }

        window.signUp = signUp;
        window.topUpWallet = topUpWallet;
        window.checkBalance = checkBalance;
        window.logIn = logIn;

        // Function to fetch and display all users
        function displayUsers() {
            const usersRef = ref(database, 'users');
            get(usersRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const tableBody = document.getElementById('tableBody');
                    tableBody.innerHTML = ''; // Clear any existing rows

                    for (let uid in users) {
                        const user = users[uid];
                        const row = document.createElement('tr');
                        
                        // Create table cells for each user field
                        row.innerHTML = `
                            <td>${user.vehicleNumber}</td>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td>${user.phone}</td>
                            <td>${user.walletBalance}</td>
                        `;
                        tableBody.appendChild(row);
                    }
                } else {
                    console.log('No users found.');
                }
            }).catch((error) => {
                console.error('Error fetching users:', error);
            });
        }

        // Function to filter/search the table
        function searchTable() {
            const input = document.getElementById('searchInput').value.toLowerCase();
            const rows = document.querySelectorAll('#userTable tbody tr');

            rows.forEach(row => {
                const vehicleNo = row.cells[0].textContent.toLowerCase();
                const username = row.cells[1].textContent.toLowerCase();
                
                // Check if the search input matches vehicle number or username
                if (vehicleNo.includes(input) || username.includes(input)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        // Call the displayUsers function when the page loads
        window.onload = displayUsers;


        // Haversine Formula
        function haversine(lat1, lon1, lat2, lon2) {
            const R = 6371; // Earth's radius in km
            const toRad = (degrees) => degrees * (Math.PI / 180);

            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);

            const a = Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Distance in km
        }

        onChildAdded(ref(database, 'detected_plates'), async (snapshot) => {
            const newRecord = snapshot.val();
            const { camera, license_plate, timestamp, processed, status } = newRecord;
        
            if (processed) {
                console.log(`Record already processed: ${license_plate}, timestamp: ${timestamp}`);
                return;
            }
        
            if (!camera || !license_plate || !timestamp) {
                console.error('Invalid record:', newRecord);
                return;
            }
        
            try {
                // Lock mechanism: Check if a record is already marked as "in-progress"
                const lockRef = ref(database, `processing_lock/${license_plate}`);
                const lockSnapshot = await get(lockRef);
        
                if (lockSnapshot.exists() && lockSnapshot.val() === true) {
                    console.log(`Processing in progress for license_plate: ${license_plate}. Skipping this record.`);
                    return;
                }
        
                // Set lock
                await set(lockRef, true);
        
                const platesSnapshot = await get(ref(database, 'detected_plates'));
                const plates = platesSnapshot.val();
        
                if (!plates) {
                    console.error('No detected plates found in the database.');
                    return;
                }
        
                // Check for a previous processed record
                const previousProcessedRecord = Object.entries(plates).find(([key, record]) =>
                    record.license_plate === license_plate && record.status === 'processed' && key !== snapshot.key
                );
        
                if (previousProcessedRecord) {
                    console.log(`Previous record for license_plate: ${license_plate} is processed. Marking current record as "waiting for second record".`);
                    await update(ref(database, `detected_plates/${snapshot.key}`), { status: 'waiting for second record' });
                    return;
                }
        
                // Check for the second record
                const secondRecordEntry = Object.entries(plates).find(([key, record]) =>
                    record.license_plate === license_plate &&
                    record.camera !== camera &&
                    !record.processed &&
                    record.status === 'waiting for second record'
                );
        
                if (!secondRecordEntry) {
                    console.log(`No second record found for license_plate: ${license_plate}, timestamp: ${timestamp}. Marking as "waiting for second record".`);
                    await update(ref(database, `detected_plates/${snapshot.key}`), { status: 'waiting for second record' });
                    // Release lock
                    await set(lockRef, false);
                    return;
                }
        
                const [secondRecordKey, secondRecord] = secondRecordEntry;
        
                // Process the pair
                const camerasSnapshot = await get(ref(database, 'cameras'));
                const cameras = camerasSnapshot.val();
        
                if (!cameras) {
                    console.error('No cameras found in the database.');
                    return;
                }
        
                const firstCamera = Object.values(cameras).find(cam => cam.camNo === camera);
                const secondCamera = Object.values(cameras).find(cam => cam.camNo === secondRecord.camera);
        
                if (!firstCamera || !secondCamera) {
                    console.error('Camera data missing for one of the records.');
                    return;
                }
        
                const distance = haversine(firstCamera.latitude, firstCamera.longitude, secondCamera.latitude, secondCamera.longitude);
                const type = distance > 0.5 ? 'toll' : 'parking';
        
                const entryTime = new Date(type === 'toll' ? timestamp : secondRecord.timestamp);
                const exitTime = new Date(type === 'parking' ? timestamp : secondRecord.timestamp);
        
                const duration = Math.abs(exitTime - entryTime) / (1000 * 60);
                const amount = type === 'toll' ? distance * 5 : duration * 0.5;
        
                const userRef = ref(database, 'users');
                const userSnapshot = await get(userRef);
        
                let currentBalance = null;
        
                if (userSnapshot.exists()) {
                    const users = userSnapshot.val();
                    const userKey = Object.keys(users).find(
                        uid => users[uid].vehicleNumber === license_plate
                    );
        
                    if (userKey) {
                        const user = users[userKey];
                        currentBalance = user.walletBalance || 0;
        
                        if (currentBalance >= amount) {
                            const newBalance = currentBalance - amount;
        
                            // Update wallet balance
                            await update(ref(database, `users/${userKey}`), { walletBalance: newBalance });
        
                            currentBalance = newBalance;
                        } else {
                            console.error(`Insufficient wallet balance for vehicle number: ${license_plate}`);
                        }
                    }
                }
        
                // Record transaction
                const sanitizedEntryTime = entryTime.toISOString().replace(/[\.\#\$\[\]]/g, '_');
                const historyData = {
                    license_plate,
                    distance: distance.toFixed(2),
                    type,
                    duration: type === 'parking' ? duration.toFixed(2) : 0,
                    amount: amount.toFixed(2),
                    balance: currentBalance !== null ? currentBalance.toFixed(2) : 'N/A',
                    timestamp: entryTime.toISOString()
                };
        
                const historyEntryRef = ref(database, `vehicle_history/${license_plate}_${sanitizedEntryTime}`);
                await set(historyEntryRef, historyData);
        
                console.log(`Processed and stored in vehicle_history for license_plate: ${license_plate}`);
        
                // Mark both records as processed
                await update(ref(database, `detected_plates/${snapshot.key}`), { status: 'processed' });
                await update(ref(database, `detected_plates/${secondRecordKey}`), { processed: true });
        
                // Release lock
                await set(lockRef, false);
            } catch (error) {
                console.error('Error processing detected plates:', error.message);
            }
        });
        
        export { database };
