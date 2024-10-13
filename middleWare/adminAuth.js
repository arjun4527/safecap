// Middleware to check if the admin is logged in
const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin) {
      return next();  // User is logged in, proceed to the next middleware/route
    } else {
      return res.redirect("/admin");  // User is not logged in, redirect to login page
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");  // Handle error gracefully
  }
};

// Middleware to check if the admin is already logged out
const isLogout = async (req, res, next) => {
  try {
    if (req.session.admin) {
      return res.redirect("/admin/home");  // User is already logged in, redirect to the dashboard
    }
    return next();  // User is not logged in, proceed to the next middleware/route
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");  // Handle error gracefully
  }
};


module.exports={isLogin,isLogout} 