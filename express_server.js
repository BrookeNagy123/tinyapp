//Setup for express_server.js

const express = require("express");
const cookieSession = require('cookie-session');
const getUserByEmail = require('./helpers');
const bcrypt = require("bcryptjs");
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const PORT = 8080;

//URL Database and Users Object

const urlDatabase = {
  "b2xVn2": {
    longURL:"http://www.lighthouselabs.ca",
    userID:"userRandomID",
  },
  "9sm5xK": {
    longURL:"http://www.google.com",
    userID:"user2RandomID"
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "$2a$10$MrIpvUfqCkGlX63JL3m7GeUdzI4apGC10wykzlvhEawwNPDcwGPjG",
    //Password: purple-monkey-dinosaur
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "$2a$10$ymxHl1dozarYZtwVFUD.AegeR7XUZ5xBQ4nfSqAjQxyS5X2UrGc/O",
    //Password: purple2-monkey-dinosaur
  },
};

// Helper Functions

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}

function idCompare(id) {
  let answer;
  Object.keys(urlDatabase).forEach(key => {
    if (key === id) {
      answer = true;
    }
  });
  return answer;
}

function getID(email) {
  let id;
  Object.values(users).map(value => {
    if (value.email === email) {
      id = value.id;
    }
  });
  return id;
}

function urlsForUser(id) {
  let answer = {};
  Object.keys(urlDatabase).forEach(key => {
    if (urlDatabase[key].userID === id) {
      answer[key] = urlDatabase[key];
    }
  });
  return answer;
}

// GET and POST Routes

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { urls: urlDatabase , user};
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const user = getUserByEmail(users, req.body.email);
  if (req.body.email === "") {
    return res.status(400).send("Please provide a valid email");
  } else if (user) {
    return res.status(400).send("Email address already in use");
  } else {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {id, email, hashedPassword};
    req.session.user_id = id;
    res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user };
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(users, req.body.email);
  if (bcrypt.compareSync(req.body.password, user.hashedPassword)) {
    const id = getID(req.body.email);
    req.session.user_id = id;
    res.redirect("/urls");
  } else {
    res.status(403).send("Please try again with the correct email and password");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlsForUser(userID);
  const templateVars = {urls: url, user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlsForUser(userID);
  const templateVars = {urls: url, user};
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const url = urlsForUser(userID);
  const templateVars = {urls: url, user};
  if (userID) {
    let newID = generateRandomString();
    urlDatabase[newID] = {longURL: req.body.longURL, userID: userID};
    res.redirect("/urls/" + newID);
    res.render("urls_new", templateVars);
  } else {
    res.send("Login or Register to create new short URLs");
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (idCompare(req.params.id) === true) {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user};
    res.render("urls_show", templateVars);
  } else {
    res.send("ID Not Found");
  }
});

app.get("/u/:id", (req, res) => {
  if (idCompare(req.params.id) === true) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send("URL Not Found");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const id = req.params.id;
  if (idCompare(req.params.id) === true) {
    if (userID === urlDatabase[id].userID) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.send("Please login to delete");
    }
  } else {
    res.send("ID Not Found");
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const id = req.params.id;
  const longURL = req.body.url;
  if (idCompare(req.params.id) === true) {
    if (userID === urlDatabase[id].userID) {
      urlDatabase[id].longURL = longURL;
      res.redirect("/urls");
    } else {
      res.send("Please login to edit");
    }
  } else {
    res.send("ID Not Found");
  }
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});