
const isLogin = async (req, res, next) => {
  try {
    if (req.session.admin) {
      return next(); 
    } else {
      return res.redirect("/admin");  
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");  
  }
};


const isLogout = async (req, res, next) => {
  try {
    if (req.session.admin) {
      return res.redirect("/admin/dashboard");  
    }
    return next(); 
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");  
  }
};


module.exports={isLogin,isLogout} 