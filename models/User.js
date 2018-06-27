'use strict';

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: Date.now()
    },
    endDate: DataTypes.DATE
  }
);
  return User;
};
