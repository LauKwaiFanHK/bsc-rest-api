import express, { json } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Create an app to start an express server.
const app = express();
const port = 3000;

// Enable the app to secure HTTP requests.
app.use(helmet());
// Enable the app to create a cookie parser middleware.
app.use(cookieParser());
// Enable the app to process POST request.
app.use(json());

// Basic logging.
app.use((req, res, next) => {
  console.log("Time:", Date.now());
  console.log(req.headers);
  next();
});

// Set a route for root URL.
// The app responds with a message for requests to the root URL.
app.get("/", (req, res) => {
  // Check if a user is logged in.
  if (req.cookies && req.cookies.username) {
    // res.send(`Hello ${req.cookies.username}!`);
    res.redirect("/welcome");
  } else {
    res.statusMessage("Unauthorized user!"); // plant this to trigger a 500 internal server error
    res.status(401).json({ message: "Unauthorized. You must first login." });
  }
});

// Set a route for user to login.
app.get("/login", (req, res) => {
  if (req.cookies.username) {
    //res.redirect('/welcome');
    res.send(`Hello ${req.cookies.username}, you are logged in.`);
  } else {
    res.status(401).json({ message: "Unauthorized. You must first login." });
  }
});

app.get("/welcome", (req, res) => {
  let username = req.cookies.username;
  if (username) {
    res.cookie("lang", "de", {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });
    res.cookie("test", "1", {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "none",
    });
    res.send(
      `Welcome back, username: ${username} --cookies: ${JSON.stringify(
        req.cookies
      )}`
    );
  } else {
    res
      .status(401)
      .json({ message: "Unauthorized user. You must first login." });
  }
});

// Set a route to handle POST request for login.
app.post("/login", (req, res) => {
  const userDetails = {
    username: "Billy",
    password: "abc123",
  };
  let { username, password } = req.body;
  if (username === userDetails.username && password === userDetails.password) {
    res.cookie("username", username, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    res.send("Successful login!");
  } else {
    res.status(401).json({ message: "Invalid username or password." }); // Links: '/', 'login'
  }
});

// Set a route for user to logout.
// Delete the username cookie when user logged out.
app.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/user");
});

// Following for browser convenience, delete in fuzzing test.
// Set a route for sending a cookie from the server to a client.
app.get("/setCookie", (req, res) => {
  const cookieName = "username";
  const cookieValue = "Billy Wonka";
  res.cookie(cookieName, cookieValue, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  res.send(`REST server sent a cookie to client: ${cookieName}=${cookieValue}`);
});

// Set a route to get a cookie which received from the server.
app.get("/getCookie", (req, res) => {
  res.send(
    `Client received a cookie: ${Object.keys(req.cookies)[0]}=${
      Object.values(req.cookies)[0]
    }`
  );
});

// Set a route to delete saved cookies
app.get("/deleteCookie", (req, res) => {
  res.clearCookie("username");
  res.send("Cookies deleted");
});

// The app listen on port 3000 for connetions.
app.listen(port, () => console.log(`REST server is running at port ${port}.`));
