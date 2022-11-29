const express = require("express");
let cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

//URL Database and User Object Below 

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "purple2-monkey-dinosaur",
  },
};

// Helper Functions Below 

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}


function isEmailInUse(email) {
  let emails = [];
  Object.values(users).forEach(val => {
    emails.push(val.email);
  });
  for (let i = 0; i < emails.length; i ++) {
    if (emails[i] === email) {
      return true;
    } else {
      return false;
    }
  }
}
  
function emailAndPasswordMatch(email, password) {
  let answer;
  Object.values(users).map(value => {
    if (value.email === email) {
      let correctUser = value;
      if (correctUser.password === password) {
        answer = true;
      } else {
        answer = false;
      }
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

// GET and POST Routes Below 

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const cookieID = req.cookies.user_id;
  const user = users[cookieID];
  const templateVars = { urls: urlDatabase , user};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "") {
    return res.status(400).send("Please provide a valid email");
  } else if (isEmailInUse(req.body.email) === true) {
    return res.status(400).send("Email address already in use");
  } else {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    users[id] = {id, email, password};
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  const cookieID = req.cookies.user_id;
  const user = users[cookieID];
  const templateVars = { user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (emailAndPasswordMatch(req.body.email,req.body.password) === true) {
    const id = getID(req.body.email);
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Please try again with the correct email and password");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const cookieID = req.cookies.user_id;
  const user = users[cookieID];
  const templateVars = { urls: urlDatabase , user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const cookieID = req.cookies.user_id;
  const user = users[cookieID];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect("/urls/" + newID);
});

app.get("/urls/:id", (req, res) => {
  const cookieID = req.cookies.user_id;
  const user = users[cookieID];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.url;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});