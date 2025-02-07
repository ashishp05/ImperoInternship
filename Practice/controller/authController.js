const User = require("../models/userModel")
const bcrypt = require("bcrypt")
exports.getSignUp = async(req ,res) =>
    {
        try{
           await res.render("auth/signup" ,{
                pageTitle : "SignUp Page",
                isLoggedIn : req.session.isLoggedIn,
                error : req.flash("error")
            })
        }catch(err)
        {
            console.log(err)
        }
    }

    
exports.getLogin = async(req ,res) =>
    {
        try{
           await res.render("auth/login" ,{
                pageTitle : "Login Page",
                isLoggedIn : req.session.isLoggedIn,
                error : req.flash("error")
            })
        }catch(err)
        {
            console.log(err)
        }
    }

    exports.postSignUp = async(req ,res ,next) =>
    {
       try{ 
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        const confirmPassword = req.body.confirmPassword

        if(!name || !email || !password || !confirmPassword )
        {
          throw new Error("All the feild are required.")
        }

        const hashPassword = await bcrypt.hash(password , 12)
        console.log(hashPassword)
        
        
         
        const user = await User.create({name : name ,email : email , password : hashPassword })

            res.redirect("/login") 
            return user ;

       }catch(err)
       {
        console.log(err)
       }
       
    }

    exports.postLogin = async(req ,res , next) =>
    { 
        try{
            const email = req.body.email
            const password = req.body.password

            if(!email || !password)
            {
                req.flash("error" , "this is invalid value.")
               return res.redirect("/login")
            }

        const user = await User.findOne({email : email})
        if(!user)
        {     
            req.flash("error" , "user is not exist signup please.")
             return res.redirect("/signup")
             
        }
      
         const matchPassword = await bcrypt.compare(password , user.password)
         console.log("pass" ,password , user.password)
         console.log(matchPassword)
         if(!matchPassword)
         {
             req.flash("error" , "password is incoorect")
             return res.redirect("/login")
         }

         req.session.isLoggedIn = true ;
         req.session.user = user;
         req.session.save( err =>
         {
            console.log("err in session" , err)
         }
         )
         res.redirect("/")

        }catch(err)
        {
            console.log(err)
        }
        
    }

    exports.postLogout = (req ,res ,next) =>
    {
        req.session.destroy(err =>
        {
            console.log(err);

            res.redirect("/");
        }
        )
    }