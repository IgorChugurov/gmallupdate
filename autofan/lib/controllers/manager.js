/*
 * GET home page.
 */

exports.index = function(req, res){
    //console.log(req.session);
   // if (req.session.role && req.session.role=='1')
    //req.session = {'hello':'world'};
        res.render('manager');
   /* else{
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('WWW-Authenticate: Basic realm="My Realm"');
        res.setHeader('HTTP/1.0 401 Unauthorized');
        res.end();
       // res.redirect('/');
    }*/
};

/*module.exports = function routes()  {
    function index(req, res) {
        res.render('index');
    };
    function manager(req, res) {
        res.render('manager');
    };
    return{
        index: index,
        manager: manager
    }
}; */