const passport=require('passport')
const GoogleStrategy=require("passport-google-oauth20")
const User=require("../models/user-model")
require("dotenv").config()


passport.use(new GoogleStrategy({
  clientID:process.env.GOOGLE_CLIENT_ID,
  clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:process.env.GOOGLE_CLIENT_URL,
  passReqToCallback: true
},

async(req,accessToken,refreshToken,profile,cb)=>{
  try{
    let user=await User.findOne({googleId:profile.id})
    
    if(!user){
      user=new User({
        firstName:profile._json.given_name,
        lastName:profile._json.family_name,
        email:profile._json.email,
        googleId:profile.id
        
      })
      await user.save()
    }
    req.session.user=user._id
    return cb(null,user)
  }catch(error){
    return cb(error,null)
  }

}

))


passport.serializeUser((user,done)=>{
  done(null,user.id)
})


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)

    done(null, user)

  } catch (error) {

    done(error, null)

  }

})


module.exports = passport;