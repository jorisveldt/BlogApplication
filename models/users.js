module.exports = function (sequelize, Datatypes) {
	const User = sequelize.define('users', {
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
	passwordconfirm: Sequelize.STRING
});
}