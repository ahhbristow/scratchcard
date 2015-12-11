module.exports = function(req, res, next) {
  
  if (req.isAuthenticated()) {
    console.log("Successfully authenticated");
    return next();
  }

  // if the user is not authenticated then redirect him to the login page 
  console.log("User not authenticated, redirecting to login screen");
  res.redirect('/login');
}