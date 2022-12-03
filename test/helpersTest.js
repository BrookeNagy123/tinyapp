const { assert } = require('chai');

const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com",)
    const expectedResult =  { id: "userRandomID", email: "user@example.com",password: "purple-monkey-dinosaur"};
    assert.deepEqual(user, expectedResult)
    
  });
  it('should return undefined with invalid email', function() {
    const user = getUserByEmail(testUsers, "test@example.com",)
    const expectedResult = undefined;
    assert.deepEqual(user, expectedResult)
  });
});