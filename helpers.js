function getUserByEmail(users, email){
  let answer;
  Object.values(users).forEach(user => {
    if(user.email === email){
      answer = user
    }
  });
  return answer;
}

module.exports = getUserByEmail;