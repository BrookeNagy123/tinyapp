const express = require("express");
let cookieSession = require('cookie-session')
const bcrypt = require("bcryptjs");
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));
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

// Helper Functions Below 

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}

function idCompare(id){
  let answer;
  Object.keys(urlDatabase).forEach(key => {
    if(key === id){
      answer = true
    } 
  })
  return answer;
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
  
function getUserByEmail(users, email){
  let answer;
  Object.values(users).forEach(user => {
    if(user.email === email){
      answer = user
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
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase , user};
  if(user_id){
    res.redirect("/urls");
  } else {
  res.render("register", templateVars);
  }
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
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {id, email, hashedPassword};
    req.session.user_id = id;
    res.redirect("/urls");
  }
});


app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { user };
  if(user_id){
    res.redirect("/urls");
  } else {
  res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const user = getUserByEmail(users, req.body.email)
  if(bcrypt.compareSync(req.body.password, user.hashedPassword)) {
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
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { urls: urlDatabase , user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {user};
  if(user_id){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {user};
  if(user_id){
    let newID = generateRandomString();
    urlDatabase[newID] = req.body.longURL;
    res.redirect("/urls/" + newID);
    res.render("urls_new", templateVars);
  } else {
    res.send("Login or Register to create new short URLs");
  }
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if(idCompare(req.params.id) === true) {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
  } else {
  res.send("URL not found")
  }
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