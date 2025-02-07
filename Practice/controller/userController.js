exports.getHome = async(req ,res) =>
{
    try{ 
       
    await  res.render("link/home", {
        pageTitle : "HomePage",
        isLoggedIn : req.session.isLoggedIn,
        userName : req.session.user
      })
    }catch(err)
    {
        console.log(err)
    }
}
exports.getAbout = async(req ,res) =>
  {
      try{
      await  res.render("link/about", {
          pageTitle : "AboutPage",
        isLoggedIn : req.session.isLoggedIn,
        userName : req.session.user

        })
      }catch(err)
      {
          console.log(err)
      }
  }
  exports.getContact = async(req ,res) =>
    {
        try{
        await  res.render("link/contact", {
            pageTitle : "ContactPage",
       isLoggedIn : req.session.isLoggedIn,
        userName : req.session.user

          })
        }catch(err)
        {
            console.log(err)
        }
    }