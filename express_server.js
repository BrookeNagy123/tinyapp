const { text } = require("express");
const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const result = Math.random().toString(36).substring(2,8);
  return result;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase , username: req.cookies["username"],};
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  res.redirect("/urls"); 
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase , username: req.cookies["username"],};
  res.render("urls_index", templateVars);
});

app.post("/login", (req, res) => {
  const username = req.body.username
  res.cookie("username", username);
  res.redirect("/urls"); 
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls"); 
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect("/urls/" + newID); 
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"]  }; 
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
  const id = req.params.id
  const longURL = req.body.url
  urlDatabase[id] = longURL
  res.redirect("/urls"); 
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});