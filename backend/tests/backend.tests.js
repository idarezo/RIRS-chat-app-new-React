const {
  app,
  bcrypt,
  validator,
  testUser,
  validToken,
} = require("./setUpTests");
const request = require("supertest");

describe("Express Server API Tests", () => {
  it("GET / should return Hello, world!", async () => {
    const res = await request(app).get("/").expect(200);
    expect(res.text).toBe("Hello, world!");
  });

  it("GET /verifyToken should return token valid", async () => {
    const res = await request(app)
      .get("/verifyToken")
      .set("Authorization", `Bearer ${validToken}`)
      .expect(200);
    expect(res.body).toHaveProperty("message", "Token valid");
  });

  it("GET /verifyToken with invalid token should return 401", async () => {
    const invalidToken = "invalid.token.here";
    const res = await request(app)
      .get("/verifyToken")
      .set("Authorization", `Bearer ${invalidToken}`)
      .expect(401);
    expect(res.body).toHaveProperty("message", "Invalid or expired token");
  });

  it("POST /userLogin should succeed with correct credentials", async () => {
    bcrypt.compare.mockResolvedValue(true);
    const res = await request(app)
      .post("/userLogin")
      .send({ emailValue: "test@example.com", pswd: "password" })
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("token");
  });

  it("POST /userLogin should return 400 if missing credentials", async () => {
    const res = await request(app).post("/userLogin").send({}).expect(400);
    expect(res.text).toBe("Email and password are required");
  });

  it("POST /userRegistracija should succeed for valid email", async () => {
    validator.isEmail.mockReturnValue(true);
    const res = await request(app)
      .post("/userRegistracija")
      .send({ emailValue: "newuser@example.com" })
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /userRegistracija should fail for invalid email", async () => {
    validator.isEmail.mockReturnValue(false);
    const res = await request(app)
      .post("/userRegistracija")
      .send({ emailValue: "bad-email" })
      .expect(400);
    expect(res.text).toBe("Credentials are not valid");
  });

  it("GET /userInfo should return user info", async () => {
    const res = await request(app)
      .get("/userInfo")
      .set("Authorization", `Bearer ${validToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty("gravatar");
    expect(res.body.user).toHaveProperty("email");
  });

  it("GET /userInfo without token should return 401", async () => {
    const res = await request(app).get("/userInfo").expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("No token provided");
  });

  it("POST /postMessage should create a message", async () => {
    const message = {
      authorId: testUser.uuid,
      authorEmail: testUser.email,
      authorName: "Test User",
      timestamp: new Date().toISOString(),
      content: "Hello, this is a test message!",
    };

    const res = await request(app)
      .post("/postMessage")
      .set("Authorization", `Bearer ${validToken}`)
      .send(message)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("message", "Message created");
  });
});
