var models = require('./models');
var crypto = require('crypto');

var productos = models.Productos;
var users = models.Users;

var sha1 = function(str){
	return crypto.createHash('sha1').update(str).digest('hex');
};

exports.index = function(req, res) {
	productos.view({ design:'productos', view:'all' }, { descending:true }, function(results){
		res.render('index', {productos:results.rows});
	});
};

exports.agregar = function(req, res) {
	res.render('agregar');
};

exports.add = function(req, res) {
	var post = req.body;
	if (post && post.nombre && post.precio){
		post.precio = parseInt(post.precio);
		post.user = req.session.user;
		productos.post(post, function(result){
			if (result.ok){
				res.redirect('/');
			} else {
				res.send(500, 'Algo ha ido mal!');
			}
		});
	} else {
		res.redirect('/agregar');
	}
};

exports.delete = function(req, res) {
	if (req.params.id){
		productos.delete(req.params.id, function(result){
			if (result.ok){
				res.redirect('/');
			} else {
				res.send(500, 'Algo ha ido mal!');
			}
		});
	} else {
		res.send(500, 'Debe especificar un ID');
	}
};

exports.editar = function(req, res) {
	if (req.params.id){
		productos.get(req.params.id, function(result){
			if (result._id){
				res.render('editar', {producto:result});
			} else {
				res.send(404, 'El producto no existe');
			}
		});
	} else {
		res.send(500, 'Debe especificar un ID');
	}
};

exports.edit = function(req, res) {
	if (req.params.id && req.body){
		var post = req.body;
		post.user = req.session.user;

		productos.put(req.params.id, post, function(result){
			if (result.ok){
				res.redirect('/');
			} else {
				res.send(500, 'Algo ha ido mal!');
			}
		});
	} else {
		res.send(500, 'Error!');
	}
};

exports.login = function(req, res){
	if (req.body && req.body.user && req.body.passwd){
		users.get(req.body.user, function(result){
			if (result._id){
				if (sha1(req.body.passwd) == result.passwd){
					req.session.user = result._id;
					res.redirect('/');
				} else {
					res.send(404, 'El usuario y la contraseña no coinciden!');
				}
			} else {
				res.send(404, 'El usuario no existe!');
			}
		});
	} else {
		res.send(500, 'Error!');
	}
};

exports.signup = function(req, res){
	if (req.body && req.body.user && req.body.passwd){
		users.get(req.body.user, function(result){
			if (result._id){
				res.send(500, 'El usuario ya existe');
			} else {
				var post = req.body;
				post._id = post.user;
				delete post.user;
				post.passwd = sha1(post.passwd);

				users.post(post, function(result){
					if (result.ok){
						res.redirect('/');
					} else {
						res.send(500, 'Algo ha ido mal!');
					}
				});
			}
		});
	} else {
		res.send(500, 'Error!');
	}
};