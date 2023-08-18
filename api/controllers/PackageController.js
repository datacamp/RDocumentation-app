/**
 * PackageController
 *
 * @description :: Server-side logic for managing packages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {


  /**
  * @api {get} /packages/:name Request Package Information
  * @apiName Get Package
  * @apiGroup Package
  *
  * @apiParam {String} name Name of the package
  *
  * @apiUse Timestamps
  * @apiSuccess {String}   name                   Package name
  * @apiSuccess {Integer}  latest_version_id      Last version (more recent) of this package
  * @apiSuccess {String}   uri                    Url to `self`
  * @apiSuccess {String}   api_uri                Url to the api endpoint of `self`
  * @apiSuccess {Integer}  type_id                Represents the repository from which the package is retrieved (1 for cran, 2 for bioconductor and 3 for github).
  * @apiSuccess {String}   created_at             The moment at which the record was created.
  * @apiSuccess {String}   updated_at             The moment at which the most recent update to the record occured.
  * @apiSuccess {Object[]} versions               List of versions of this package
  * @apiSuccess {String}   versions.uri           Url to this version
  * @apiSuccess {String}   versions.api_uri       Url to the api endpoint of this version
  * @apiSuccess {Integer}  versions.id            Id of this version
  * @apiSuccess {String}   versions.package_name  Name of the package of this version
  * @apiSuccess {String}   versions.version       String describing the version of the package
  * @apiSuccess {String}   versions.title         Title of the version
  * @apiSuccess {String}   versions.description   Description of the package version
  * @apiSuccess {Date}     versions.release_date  Release date of the package version
  * @apiSuccess {String}   versions.license       License of the package version
  * @apiSuccess {String}   versions.url           Url to official site of package
  * @apiSuccess {String}   versions.copyright     Copyright notice included in package
  * @apiSuccess {String}   versions.readmemd      Readme included in the package
  * @apiSuccess {String}   versions.sourceJSON    The sourceJSON containing the data from which the package is parsed.
  * @apiSuccess {Date}     created_at             The moment at which the record was created.
  * @apiSuccess {Date}     updated_at             The moment at which the most recent update to the record occured.
  * @apiSuccess {Integer}  versions.maintainer_id Id of the maintainer of the package version
  * @apiSuccess {String}   type                   Always 'package'
  */
  findByName: function(req, res) {
    var packageName = req.param('name');

    Package.findOne({
      where: {
        name: packageName
      },
      include: [
        { model: PackageVersion, as: 'versions' }
      ]
    }).then(function(_package) {
      if (_package === null) {
        return res.rstudio_redirect(301, '/search?q=' + encodeURIComponent(packageName));
        // there seems to be a problem with redirected requests if text/html is set as contentype for the ajax request, so I just
        // adapt this so Rstudio still gets the html
      } else if ((req.wantsJSON || req.path.startsWith('/api/')) && !req.param('viewer_pane') == 1) {
        _package = _package.toJSON();
        _package.type = 'package';
        return res.json(_package);
      } else {
        return res.redirect(302, "https://rdocumentation.org" + req.path);
      }
    }).catch(function(err) {
      return res.negotiate(err);
    });

  },

  /**
  * @api {get} /packages List all packages
  * @apiName Get Packages
  * @apiGroup Package
  * @apiDescription Return an array of package object containing listed attributes and total number of package objects header.
  *
  * @apiHeader (Header) {String} x-total-count total count of packages.
  * 
  * @apiParam {String} limit    the number to use when limiting records to send back (useful for pagination)
  * @apiParam {String} skip     the number of records to skip when limiting (useful for pagination)
  * @apiParam {String} sort     the order of returned records, e.g. `name ASC` or `name DESC`
  * @apiParam {String} criteria Limits packages to ones matching the given criteria. Criteria on the following columns are supported: `name`, `created_at`, `updated_at`, `latest_version_id` and `type_id` (being the number given to the repository in which the package is 1 for cran, 2 for bioconductor and 3 for github).
  * (e.g.: If you only want packages from github the argument type_id=3 can be passed.)
  *
  * @apiSuccess {String}   name                   Package name
  * @apiSuccess {Integer}  latest_version_id      Id of the last version (more recent) of this package
  * @apiSuccess {String}   uri                    Url to `self`
  * @apiSuccess {String}   api_uri                Url to the api endpoint of `self`
  * @apiSuccess {String}   type_id                Represents the repository from which the package is retrieved (1 for cran, 2 for bioconductor and 3 for github).
  * @apiSuccess {Date}     created_at             The moment at which the record was created.
  * @apiSuccess {Date}     updated_at             The moment at which the most recent update to the record occured.
  * @apiUse Timestamps
  */
  find: function(req, res) {
    var limit = Utils.parseLimit(req);
    var offset = Utils.parseSkip(req);
    var sort = Utils.parseSort(req);
    var criteria = Utils.parseCriteria(req); 

    Package.findAll({
      limit: limit,
      where: criteria,
      offset: offset,
      order: sort,
      include: []
    }).then(function(packages) {
      res.set('X-Total-Count', packages.length);
      return res.json(packages);
    }).catch(function(err) {
      return res.negotiate(err);
    });
  },

  toggleStar: function(req, res) {
    var packageName = req.param('name');
    var user = req.user;

    RedisService.delPrefix('view_package_version_' + packageName);
    Package.findOne({
      where: {name: packageName},
      include: [
        { model: TaskView, as: 'inViews', attributes: ['name'] }
      ]
    }).then(function(_package) {
      var views = _package.inViews;
      views.forEach(function(view) {
        RedisService.del('rdocs_view_show_' + view.name);
      });
    });

    Star.findOrCreate({
      where: {
        user_id: user.id,
        package_name: packageName
      }
    }).spread(function(instance, created) {
      var destroyPromise = created ? Promise.resolve() : instance.destroy();
      destroyPromise.then(function() {
        return Star.findAll({
          where: { package_name: packageName }
        }).then(function(stars) {
          var newCount = stars.length;
          if (created) {
            return res.created({
              newCount: newCount,
              star: instance
            });
          }
          return res.send(200, {
            newCount: newCount,
            star: 'deleted'
          });
        });
      });
    }).catch(function(err) {
      return res.negotiate(err);
    });
  },

  toParse: function(req, res) {
    var limit = Utils.parseLimit(req);
    var offset = Utils.parseSkip(req);
    var parserVersion = req.param('parser_version');

    Package
    .findMostPopularUnfailedOldPackages(parserVersion, limit, offset)
    .then(function(packages) {
      return res.json(packages);
    }).catch(function(err) {
      return res.negotiate(err);
    });
  }
};

