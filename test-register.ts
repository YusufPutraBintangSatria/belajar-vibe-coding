const name = "a".repeat(300);
const response = await fetch("http://localhost:3001/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name,
    email: "testlongname@example.com",
    password: "password123"
  })
});

const text = await response.text();
console.log(`Status: ${response.status}`);
console.log(`Body: ${text}`);
