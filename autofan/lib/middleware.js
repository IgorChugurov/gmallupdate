'use strict';

/**
 * Custom middleware used by the application
 */
module.exports = {

  /**
   *  Protect routes on your api from unauthenticated access
   */
  auth: function auth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.send(401);
  },

  /**
   * Set a cookie for angular so it knows we have an http session
   */
  setUserCookie: function(req, res, next) {
    if(req.user) {
      res.cookie('user', JSON.stringify(req.user.userInfo));
    }
    next();
  },


  requiresLogin : function (req, res, next) {
      //console.log(req.user);
      if (req.isAuthenticated() && req.user.role=='admin') return next()
      /*if (req.user.role!='admin'){
          res.redirect('/')
      }*/

    if (req.method == 'GET')
        req.session.returnTo = req.originalUrl
    res.redirect('/ru/login')
  },

    redirect: function(req,res,next){
        var urlparams =req.originalUrl;
        if (req.method == 'GET'){
            if (urlparams=='/uslugi/remont-bmw/remont-dvigatelej-bmw.html'){
                //console.log('/ru/stuff/section/5364d9c9707981801b25648f/stuffdetail/5368a212a3fe6bdc1fdc09ed/5364db8d707981801b256498');
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/5379de8ec51cbc682a6b303b';
                res.redirect(urlparams);
            }else if(urlparams=='/uslugi/remont-bmw/remont-elektriki-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/5379e18fc51cbc682a6b303c';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/remont-bmw/remont-xodovoj-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/5379e1b6c51cbc682a6b303d';
                res.redirect(urlparams);
            }else if(urlparams=='/uslugi/remont-bmw/remont-toplivnoj-sistemy-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/5379e1dfc51cbc682a6b303e';
                res.redirect(urlparams);
            }else if(urlparams=='/uslugi/remont-bmw/remont-tormoznoj-sistemy-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/537db77376fa38dc18dc95f8';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/remont-bmw/remont-akpp-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/537db7f076fa38dc18dc95f9';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/remont-bmw/remont-mkpp-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/537db7f076fa38dc18dc95f9';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/remont-bmw/remont-rulevogo-upravleniya-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da4ac51cbc682a6b3033/stuffdetail/537e3ceb67f508f0136f9c6b';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/diagnostika-bmw/diagnostika-kuzova-bmw.html'){

                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379db40c51cbc682a6b3035/stuffdetail/547ec2a4dbbc1717120a039c';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/diagnostika-bmw/diagnostika-dvigatelya-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379db40c51cbc682a6b3035/stuffdetail/547ec2c5dbbc1717120a039d';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/diagnostika-bmw/diagnostika-podveski-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379db40c51cbc682a6b3035/stuffdetail/547ec306dbbc1717120a039e';
                res.redirect(urlparams);
            }
            else if(urlparams=='/diagnostika-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379db40c51cbc682a6b3035';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/to/reglamentnoe-texnicheskoe-obsluzhivanie-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da8fc51cbc682a6b3034/stuffdetail/547ec40cdbbc1717120a039f';

                res.redirect(urlparams);
            }
            else if(urlparams=='remont-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da8fc51cbc682a6b3034';
                res.redirect(urlparams);
            }
            else if(urlparams=='/tyuning-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379dbdec51cbc682a6b3036';
                res.redirect(urlparams);
            }
            else if(urlparams=='/texobsluzhivanie-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379da8fc51cbc682a6b3034';
                res.redirect(urlparams);
            }

            else if(urlparams=='/zakaz/zapchasti-bmw.html'){
                urlparams='/ru/searchSpark/';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/tyuning-bmw/ac-schnitzer-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379dbdec51cbc682a6b3036/stuffdetail/545a8221e7f8c8316a18ced2';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/tyuning-bmw/hamann-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379dbdec51cbc682a6b3036/stuffdetail/53a3218b5ccedbd92dfb3a3d';
                res.redirect(urlparams);
            }
            else if(urlparams=='uslugi/tyuning-bmw/hamann-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379dbdec51cbc682a6b3036/stuffdetail/53a32a745ccedbd92dfb3a42';
                res.redirect(urlparams);
            }
            else if(urlparams=='/uslugi/tyuning-bmw/hartge-bmw.html'){
                urlparams='/ru/stuff/5379d9cdc51cbc682a6b3031/5379dbdec51cbc682a6b3036/stuffdetail/53a32b485ccedbd92dfb3a43';
                res.redirect(urlparams);
            }


            else next();


        } else
            next();

    }


};
