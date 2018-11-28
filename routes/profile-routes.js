const router = require('express').Router();

// const authCheck = (req, res, next) => {
//   if(!req.user){
//     //if user is not logged
//     res.redirect('/auth/login');
//   }else{
//     //if logged
//     next();
//   }
// };

router.get('/',  (req, res) => {
  res.render('profile');
  //res.send(req.user)
});


module.exports = router;
