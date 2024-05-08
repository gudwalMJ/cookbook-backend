console.log("Test file is being executed");

const chaiPromise = import("chai");

chaiPromise
  .then((chai) => {
    console.log("Chai has been loaded successfully");
    const expect = chai.expect;
    const request = require("supertest");
    const app = require("../app"); // Make sure this path is correct and app is exported properly

    describe("POST /api/auth/login", () => {
      it("should login user and return JWT", (done) => {
        console.log("Sending login request");
        request(app)
          .post("/api/auth/login")
          .send({ email: "user@example.com", password: "password123" })
          .end((err, res) => {
            if (err) {
              console.error("Error during request:", err);
              done(err);
            } else {
              console.log("Received response with status:", res.statusCode);
              expect(res.statusCode).to.equal(200);
              expect(res.body).to.have.property("token");
              console.log("JWT token received:", res.body.token);
              done();
            }
          });
      });
    });
  })
  .catch((error) => {
    console.error("Failed to load Chai:", error);
  });
