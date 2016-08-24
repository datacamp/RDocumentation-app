/**
 * Package.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: Sequelize.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false
    }

  },
  associations: function() {
    Package.hasMany(PackageVersion,
      {
        as: 'versions',
        foreignKey: {
          name: 'package_name',
          as: 'versions'
        }
      }
    );
    Package.belongsTo(PackageVersion, {
      as: 'latest_version',
      foreignKey: {
        name:'latest_version_id',
        as: 'latest_version'
      },
      constraints: false }
    );

    Package.belongsTo(Repository, {
      as: 'repository',
      foreignKey: {
        name:'type_id',
        allowNull: true,
        as: 'repository'
      }
    });

    Package.belongsToMany(TaskView, {
      as: 'inViews',
      foreignKey: 'package_name',
      through: 'TaskViewPackages',
      timestamps: false
    });

    Package.belongsToMany(PackageVersion, { as: 'reverse_dependencies', foreignKey: 'dependency_name', through: Dependency, constraints: false});

    Package.hasOne(DownloadStatistic,
      {
        as: 'last_month_stats',
        foreignKey: {
          name: 'package_name',
          as: 'last_month_stats'
        }
      }
    );

    Package.hasMany(Star,
      {
        as: 'stars',
        foreignKey: 'package_name'
      }
    );
  },

  options: {
    getterMethods: {
      api_uri: function()  {
        return '/api/packages/:name'
          .replace(':name', encodeURIComponent(this.getDataValue('name')));
      },
      uri: function()  {
        return '/packages/:name'
          .replace(':name', encodeURIComponent(this.getDataValue('name')));
      }
    },
    underscored: true,

    classMethods: {
      getLatestVersionNumber :function(package_name){
        return Package.findOne({
          include:[{
            model:PackageVersion,
            as:'latest_version',
            attributes:['version'],
            required:true
          }],
          where:{
            name:package_name
          }
        });
      },

      getAllNamesOfType:function(type){
        return Package.findAll({
          where:{type_id:type}
        }).then(function(packages){
          return _.map(packages,function(package){
            return package.dataValues.name;
          });
        });
      }
    }
  }
};

