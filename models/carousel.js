'use strict';

module.exports = function (sequelize, DataTypes) {
  var Carousel = sequelize.define('carousel', {
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    linkUrl: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    contentType: DataTypes.INTEGER,
    startDate: {
        type: DataTypes.DATE,
        defaultValue: Date.now()
    },
    endDate: DataTypes.DATE
  }
);
  return Carousel;
};
