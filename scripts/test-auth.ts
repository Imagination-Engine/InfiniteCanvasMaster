async function run() {
  try {
    const res = await fetch("http://localhost:3001/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password" }),
    });
    console.log("Status:", res.status);
    console.log("Response:", await res.json());
  } catch (e) {
    console.error(e);
  }
}
run();
