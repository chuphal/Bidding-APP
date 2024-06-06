import { use, expect } from "chai";
import chaiHttp from "chai-http";

import { server } from "../backend/server.js";
import { StatusCodes } from "http-status-codes";
import pool from "../backend/db/dbConfig.js";

const chai = use(chaiHttp);

// item routes
describe("Testing API endpoint for items route", () => {
  describe("delete item TESTING", () => {
    let agent;
    let testItemId;
    let testUserId;

    before(async () => {
      agent = chai.request.agent(server);
      // Log in before running tests
      const user = await pool.query(`SELECT * FROM users WHERE username=$1`, [
        "Mishima",
      ]);
      testUserId = user.rows[0].id;

      const name = "dummy Diamonds";
      const description =
        "These are exactly like diamonds having amazing shine..";
      const starting_price = 1000;
      const end_time = "2025-06-01 00:00:00";
      const newCurrent_price = 1000;
      const image_url = "";

      const item = await pool.query(
        `INSERT INTO auction_items (name, description, starting_price, current_price,image_url, end_time, owner_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          name,
          description,
          starting_price,
          newCurrent_price,
          image_url,
          end_time,
          testUserId,
        ]
      );

      testItemId = item.rows[0].id;

      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        console.log(error);
        throw new Error("Login failed");
      }
    });

    after((done) => {
      agent.close();
      done();
    });

    it("delete item type DELETE", async () => {
      await agent.delete(`/api/v1/items/${testItemId}`).end((err, res) => {
        if (err) {
          console.log(err);
        } else {
          expect(res).to.have.status(StatusCodes.OK);
          expect(res.body).to.have.property(
            "msg",
            "successfully deleted an item"
          );
        }
      });
    });
  });

  describe("POST type testing", () => {
    let agent;
    before(async () => {
      agent = chai.request.agent(server);
      // Log in before running tests
      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        throw new Error("Login failed");
      }
    });

    after((done) => {
      agent.close();
      done();
    });

    it("Create new item", async () => {
      agent
        .post(`/api/v1/items`)
        .send({
          name: "Monalisa wall painting",
          description:
            "The Mona Lisa bears a strong resemblance to many Renaissance depictions of the Virgin Mary, who was at that time seen as an ideal for womanhood.",
          starting_price: 10000000,
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRPQBpjOdvNuGkX5lP5wiSHCZO_qomDLfpFQ&s",
          end_time: "2025-01-01 00:00:00",
        })
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            expect(res).to.have.status(StatusCodes.CREATED);
            expect(res.body).to.have.property(
              "msg",
              "item created successfully"
            );
            expect(res.body).to.have.property("itemId");
            expect(res.body).to.have.property("name");
            expect(res.body).to.have.property("username");
          }
        });
    });
  });

  describe("PUT type testing", () => {
    let agent;
    let testItemId;
    let testUserId;

    before(async () => {
      agent = chai.request.agent(server);
      // Log in before running tests
      const user = await pool.query(`SELECT * FROM users WHERE username=$1`, [
        "Mishima",
      ]);
      testUserId = user.rows[0].id;

      const item = await pool.query(
        `SELECT * FROM auction_items WHERE owner_id = $1`,
        [testUserId]
      );

      testItemId = item.rows[0].id;

      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        throw new Error("Login failed");
      }
    });

    after((done) => {
      agent.close();
      done();
    });

    it("PUT type POST", async () => {
      agent
        .put(`/api/v1/items/${testItemId}`)
        .send({
          name: "Monalisa wall painting",
          description:
            "The Mona Lisa bears a strong resemblance to many Renaissance depictions of the Virgin Mary, who was at that time seen as an ideal for womanhood.",
          starting_price: 10000000,
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRPQBpjOdvNuGkX5lP5wiSHCZO_qomDLfpFQ&s",
          end_time: "2025-01-01 00:00:00",
        })
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            expect(res).to.have.status(StatusCodes.CREATED);
            expect(res.body).to.have.property(
              "msg",
              "item updated successfully"
            );
            expect(res.body).to.have.property("newItem");
            expect(res.body).to.have.property("Changer_name");
          }
        });
    });
  });

  describe("GET type testing", () => {
    it("getAllItems type GET", (done) => {
      chai
        .request(server)
        .get("/api/v1/items/")
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            expect(response).to.have.status(StatusCodes.OK);
            expect(response.body).to.have.property("totalCount");
            expect(response.body).to.have.property("Items");
            expect(response.body).to.have.property("totalPages");
            expect(response.body).to.have.property("currentPage");
          }
        });
      done();
    });
  });

  describe("GET Single type item testing", () => {
    let testItemId;
    let testUserId;

    before(async () => {
      // Log in before running tests
      const user = await pool.query(`SELECT * FROM users WHERE username=$1`, [
        "Mishima",
      ]);
      testUserId = user.rows[0].id;

      const item = await pool.query(
        `SELECT * FROM auction_items WHERE owner_id = $1`,
        [testUserId]
      );

      testItemId = item.rows[0].id;
    });

    it(`GET Single item`, async () => {
      chai
        .request(server)
        .get(`/api/v1/items/${testItemId}`)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            expect(res).to.have.status(StatusCodes.OK);

            expect(res.body).to.have.property("item");
          }
        });
    });
  });
});

// bids route
// it by one
let globalBidAmount = 10000004;

describe("Testing API endpoint for bids route.", () => {
  describe("Create bid  testing", () => {
    let agent;
    let testItemId;
    let testUserId;

    before(async () => {
      agent = chai.request.agent(server);
      // Log in before running tests
      const user = await pool.query(`SELECT * FROM users WHERE username=$1`, [
        "Mishima",
      ]);
      testUserId = user.rows[0].id;

      const item = await pool.query(
        `SELECT * FROM auction_items WHERE owner_id = $1`,
        [testUserId]
      );

      testItemId = item.rows[0].id;

      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        throw new Error("Login failed");
      }
    });

    after((done) => {
      agent.close();
      done();
    });

    it("Create bid type POST ", async () => {
      agent
        .post(`/api/v1/items/${testItemId}/bids`)
        .send({
          // add one after each run
          bid_amount: globalBidAmount,
        })
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            expect(res).to.have.status(StatusCodes.CREATED);
            expect(res.body).to.have.property(
              "msg",
              "bid created successfully"
            );
            expect(res.body).to.have.property("bid_creator");
          }
        });
    });
  });

  describe("getAllbids Type GET", () => {
    let testItemId;
    let testUserId;

    before(async () => {
      // Log in before running tests
      const user = await pool.query(`SELECT * FROM users WHERE username=$1`, [
        "Mishima",
      ]);
      testUserId = user.rows[0].id;

      const item = await pool.query(
        `SELECT * FROM auction_items WHERE owner_id = $1`,
        [testUserId]
      );

      testItemId = item.rows[0].id;

      // create bid;
    });

    it(`get all bids`, async () => {
      await chai
        .request(server)
        .get(`/api/v1/items/${testItemId}/bids`)
        .end((err, res) => {
          if (err) {
            console.log(err);
          } else {
            // console.log(res);
            expect(res).to.have.status(StatusCodes.OK);
            expect(res.body).to.have.property("bids");
          }
        });
    });
  });
});

// notifications route
describe("Testing API for notification route", () => {
  describe("Testing API notifications endpoint", () => {
    let agent;
    before(async () => {
      agent = chai.request.agent(server);
      // Log in before running tests
      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        throw new Error("Login failed");
      }
    });

    after((done) => {
      agent.close();
      done();
    });
    it(`get notification type GET`, async () => {
      await agent.get("/api/v1/notifications/").end((err, res) => {
        if (err) {
          console.log(err);
        } else {
          expect(res).to.have.status(StatusCodes.OK);
          expect(res.body).to.have.property("notifications");
        }
      });
    });
  });

  describe("Testing mark-notifications end point", () => {
    let agent;
    before(async () => {
      agent = chai.request.agent(server);
      // Log in before running tests
      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        throw new Error("Login failed");
      }
    });

    after((done) => {
      agent.close();
      done();
    });
    it(`mark notification type POST`, async () => {
      await agent.post("/api/v1/notifications/mark-read").end((err, res) => {
        if (err) {
          console.log(err);
        } else {
          expect(res).to.have.status(StatusCodes.OK);
          expect(res.body).to.have.property("msg");
        }
      });
    });
  });
});

// auth testing
describe("Testing API endpoint for auth route", () => {
  describe("profile user Type GET", () => {
    let agent;
    before(async () => {
      agent = chai.request.agent(server);
      try {
        const loginRes = await agent.post("/api/v1/users/login").send({
          username: "Mishima",
          password: "1234567890",
        }); // Adjust the login credentials

        expect(loginRes).to.have.status(StatusCodes.OK);
        agent.jar.setCookie(`jwt=${loginRes.body.token}`);
      } catch (error) {
        throw new Error("Login failed");
      }
    });

    it("Profile route GET testing", () => {
      agent.get("/api/v1/users/profile").end((err, res) => {
        if (err) {
          console.log(err);
        } else {
          expect(res).to.have.status(StatusCodes.OK);
          expect(res.body).to.have.property("auctionItemsCount");
          expect(res.body).to.have.property("auctionItems");
          expect(res.body).to.have.property("bidsCount");
          expect(res.body).to.have.property("bids");
          expect(res.body).to.have.property("notificationCount");
          expect(res.body).to.have.property("notifications");
        }
      });
    });
  });

  describe("POST type testing register user", () => {
    const registerUser = {
      username: "Mishima12",
      password: "12345678",
      email: "mishima12@gmail.com",
    };

    before(async () => {
      await pool.query("DELETE FROM users WHERE username=$1", [
        registerUser.username,
      ]);
    });

    it("register user type POST", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/register")
        .send(registerUser)
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            expect(response).to.have.status(StatusCodes.CREATED);
            expect(response.body).to.have.property(
              "msg",
              "Registered successfully"
            );
            expect(response.body).to.have.property("user");
            expect(response).cookie("jwt").to.not.be.null;
          }
        });
      done();
    });
  });

  describe("POST type testing for login user", () => {
    const loginUser = {
      username: "Mishima1",
      password: "1234567890",
    };

    it("login user type POST", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/login")
        .send(loginUser)
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            expect(response).to.have.status(StatusCodes.OK);
            expect(response.body).to.have.property("msg", "Login successfully");
            expect(response.body).to.have.property("user");
            expect(response).cookie("jwt").to.not.be.null;
          }
        });
      done();
    });
  });

  describe("POST type testing logout ", () => {
    it("logout user type POST", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/logout")
        .set("Cookie", `jwt=klajflksajd;l`)
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            expect(response).to.have.status(StatusCodes.OK);
            expect(response.body).to.have.property(
              "msg",
              "Logged out successfully"
            );
          }
        });
      done();
    });
  });

  describe("POST type testing password-reset", () => {
    const resetEmail = {
      email: "chandanchuphal124@gmail.com",
    };

    it("reset-password user type POST", (done) => {
      chai
        .request(server)
        .post("/api/v1/users/password-reset")
        .send(resetEmail)
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            expect(response).to.have.status(StatusCodes.OK);
            expect(response.body).to.have.property(
              "msg",
              `Reset link has been sent. Please check your email. .`
            );
          }
        });
      done();
    });
  });

  describe("POST type testing for reset-password-token", () => {
    let token = "";

    before(async () => {
      const user = await pool.query(`SELECT * FROM users WHERE email=$1`, [
        "chandanchuphal124@gmail.com",
      ]);
      token = user.rows[0].reset_token;
    });

    it("password-reset-token user type POST", (done) => {
      chai
        .request(server)
        .post(`/api/v1/users/reset-password/${token}`)
        .send({
          newPassword: "1234567890",
        })
        .end((err, response) => {
          if (err) {
            console.log(err);
          } else {
            //   console.log(response);
            expect(response).to.have.status(StatusCodes.OK);
            expect(response.body).to.have.property(
              "msg",
              "Password updated successfully"
            );
          }
        });
      done();
    });
  });
});
