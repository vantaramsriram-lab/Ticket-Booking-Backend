const base = "http://localhost:5000/api";
const post = (path, body, token) =>
  fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: "Bearer " + token }),
    },
    body: JSON.stringify(body),
  });

async function getTokens(count) {
  const tokens = [];
  for (let i = 131; i <= count; i++) {
    const user = { name: `user${i}`, email: `user${i}@test.com`, password: "Test@123" };
    await post("/auth/register", user);                  // ignore error if already exists
    const res = await post("/auth/login", { email: user.email, password: user.password });
    const data = await res.json();
    tokens.push(data.token);
  }
  return tokens;
}
async function main() {
  const tokens = await getTokens(140);
  console.log("Got tokens:", tokens.length);

  const results = await Promise.all(
  tokens.map(async (t) => {
    try {
      const r = await post("/bookings", { eventSeatId: 11 }, t);
      return r.status;
    } catch (err) {
      return `ERROR: ${err.cause?.code || err.message}`;
    }
  })
);


  console.log("Status codes:", results);
  console.log("Successes:", results.filter((c) => c === 200 || c === 201).length);
}

main();