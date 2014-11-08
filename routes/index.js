
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

exports.gamingRoom = function(req, res){
    res.render('gamingRoom', { title: 'Superklicker' });
};