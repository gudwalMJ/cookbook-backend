const bcrypt = require("bcryptjs");
const newPassword = "newPassword123";
const storedHash =
  "$2a$10$wDCi0GHYhbV6/18oMZgxJu6ag.LqfVjHqlZWtWR3zgDMwuSFfdpLO"; // use the actual hash from your DB after update

bcrypt.compare(newPassword, storedHash, (err, result) => {
  console.log("Manual verification result with updated hash:", result);
});
