/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {
  // Homepage
  'get /': 'HomeController.index',
  'get /status': 'HomeController.status',

  // Authentication
  'get /login': 'AuthController.login',
  'get /modalLogin': 'AuthController.modalLogin',
  'get /register': 'AuthController.register',
  'post /login': 'AuthController.process',
  'post /rstudio_login': 'AuthController.rstudioProcess',
  'post /modalLogin':'AuthController.modalProcess',
  'get /logout': 'AuthController.logout',


  //***** User *****
  'get /users/me' : 'UserController.me',
  //***** /User *****

  //***** Package *****
    // API
    'get /api/packages/:name': 'PackageController.findByName',
    'post /api/packages/:name/toggleStar': 'PackageController.toggleStar',
    // HTML
    'get /packages/:name': 'PackageController.findByName',
  //***** /Package *****

  //***** Trends *****
    // startpage
    'get /trends': 'TrendsController.startPage',
    // API
    'get /api/trends/download': 'TrendsController.mostDownloaded',
    'get /api/trends/keyword': 'TrendsController.topKeywords',
    'get /api/trends/graph': 'TrendsController.dependencyGraph',
    'get /api/trends/perrange': 'TrendsController.downloadsPerRange',
    'get /api/trends/newpackages' : 'TrendsController.newPackages',
    'get /api/trends/newversions' : 'TrendsController.newVersions',
    'get /api/trends/mostpopular' : 'TrendsController.lastMonthMostDownloaded',
    'get /api/trends/topcollaborators' : 'TrendsController.topCollaborators',
  //***** /Trends *****

  //***** PackageVersion *****
    // API
    'get /api/packages/:name/versions/:version/downloads' : 'PackageVersion.getDownloadStatistics',
    'get /api/packages/:name/downloads' : 'PackageVersion.getDownloadStatistics',
    'get /api/packages/:name/versions/:version/percentile' : 'PackageVersion.getPercentile',
    'get /api/packages/:name/versions/:version/topics/:topic/percentile' : 'PackageVersion.getPercentile',
    'get /api/packages/:name/percentile' : 'PackageVersion.getPercentile',
    'get /api/packages/:name/versions/:version/downloads/per_day_last_month' : 'PackageVersion.getLastMonthDownloadPerDay',
    'get /api/packages/:name/versions/:version/downloads/bioc/years/:years/per_month_last_years':'PackageVersion.getBiocPerMonthLastYears',
    'get /api/packages/:name/versions/:version/downloads/days/:days/per_day' : 'PackageVersion.getDownloadPerDayLastDays',
    'get /api/packages/:name/downloads/per_day_last_month' : 'PackageVersion.getLastMonthDownloadPerDay',
    'get /api/packages/:name/downloads/bioc/years/:years/per_month_last_years':'PackageVersion.getBiocPerMonthLastYears',
    'get /api/packages/:name/downloads/days/:days/per_day' : 'PackageVersion.getDownloadPerDayLastDays',
    'get /api/packages/:name/versions/:version': 'PackageVersion.findByNameVersion',
    'post /api/versions': 'PackageVersion.postDescription',
    'get /api/packages/:name/versions/:version/downloads/splitted' : 'PackageVersion.getSplittedDownloadStatistics',
    'get /api/packages/:name/downloads/splitted': 'PackageVersionController.getSplittedDownloadStatistics',
    'get /api/packages/:name/versions/:version/dependencies': 'PackageVersionController.getDependencyGraph',
    'get /api/packages/:name/dependencies': 'PackageVersionController.getDependencyGraph',
    'get /api/packages/:name/versions/:version/reversedependencies': 'PackageVersionController.getReverseDependencyGraph',
    'get /api/packages/:name/reversedependencies': 'PackageVersionController.getReverseDependencyGraph',
    'get r|\/api\/packages\/([^\/]+)\/versions\/([^\/]+)\/source\/(.*\.[R|r]$)|name,version,filename': 'PackageVersionController.getSource',
    'get r|\/api\/packages\/([^\/]+)\/versions\/([^\/]+)\/sourceTree|name,version': 'PackageVersionController.getSourceTree',


    // HTML
    'get /packages/:name/versions/:version': 'PackageVersion.findByNameVersion',
    'get /packages/:name/versions/:version/readme': 'PackageVersion.readmePage',
    'get r|\/packages\/([^\/]+)\/versions\/([^\/]+)\/vignettes\/(.*)|name,version,key': 'PackageVersionController.getVignette',
    'get r|^\/packages\/([^\/]+)\/versions\/([^\/]+)\/source|name,version': 'PackageVersionController.sourcePage',
  //***** /PackageVersion *****

  //***** Topic *****
    //API
    'get /api/topics/:id': 'Topic.findById',
    'get /api/topics/:id/rating': 'Topic.rating',
    'get /api/packages/:name/versions/:version/topics/:topic': 'Topic.findByName',
    'get /api/packages/:name/topics/:function': 'Topic.redirect',
    'post /api/packages/:name/versions/:version/topics': 'Topic.postRdFile',
    //HTML
    'get /topics/:id': 'Topic.findById',
    'get /packages/:name/topics/:function': 'Topic.redirect',
    'get /packages/:name/versions/:version/topics/:topic': 'Topic.findByName',
    // Backwards compatibility
    'get /packages/:name/functions/:function': 'Topic.redirect',
    'get /packages/:name/html/:function': 'Topic.redirect',
    'get /goto/:name/:function': 'Topic.redirect',

    'get r|^/figures/(.*)|path': 'Topic.figure',
  //***** /Topic *****

  //***** Collaborator *****
    // API
    'get /api/collaborators/:id': 'CollaboratorController.findById',
    'get /api/collaborators/name/:name/downloads': 'CollaboratorController.getNumberOfDirectDownloads',
    'get /api/collaborators/name/:name/depsy' : 'CollaboratorController.getDepsyData',
    // HTML
    'get /collaborators/:id': 'CollaboratorController.findById',
    'get /collaborators/name/:name': 'CollaboratorController.findByName',
  //***** /Collaborator *****

  //***** Review *****
    // API
    'get /api/topics/:topicId/reviews': 'ReviewController.findByTopic',
    'get /api/packages/:name/versions/:version/reviews': 'ReviewController.findByVersion',
    'post /api/topics/:topicId/reviews': 'ReviewController.postReviewToTopic',
    'post /api/packages/:name/versions/:version/reviews': 'ReviewController.postReviewToVersion',

  //***** Example *****
    // API
    'get /api/topics/:topicId/examples': 'ExampleController.findByTopic',
    'post /api/topics/:topicId/examples': 'ExampleController.postExampleToTopic',
    'delete /api/examples/:exampleId': 'ExampleController.deleteExample',
    'post /api/examples/:exampleId': 'ExampleController.updateExample',

  //***** TaskViews *****
    // API
    'post /api/taskviews': 'TaskViewController.postView',
    'get /api/taskviews': 'TaskViewController.findAll',
    'get /api/taskviews/:view/statistics': 'TaskViewController.getDownloadStatistics',
    'get /api/taskviews/:view': 'TaskViewController.find',
    // HTML
    'get /taskviews': 'TaskViewController.findAll',
    'get /taskviews/:view': 'TaskViewController.find',
    // Backwards compatibility
    'get /domains/:view': 'TaskViewController.redirect',

  // Link
  'get /link/:alias': 'Topic.findByAlias',

  //rstudio
  'get /rstudio/update': 'RStudioController.update',
  'post /rstudio/help': 'RStudioController.viewResults',
  'post /rstudio/help_search' : 'RStudioController.viewResults',
  'post /rstudio/view' : 'RStudioController.view',
  'post /rstudio/find_package':'RstudioController.findPackage',
  'post /rstudio/make_default':'RstudioController.makeDefault',
  'get /help/*':'RstudioController.redirect',

  //campus-app
  'get /campus/help/:package/:topic': 'CampusController.help',
  'get /campus/help': 'CampusController.path',

  //Badges
  'get /badges/version/:packageName':'BadgeController.getLatestVersion',
  'get /badges/:downloadsKind/:packageName' :'BadgeController.getDownloadStatsBadge',
  'get /badges/:downloadsKind/:period/:packageName' :'BadgeController.getDownloadStatsPeriodBadge',
  'get /api/badges/version/:packageName':'BadgeController.getLatestVersion',
  'get /api/badges/:downloadsKind/:packageName' :'BadgeController.getDownloadStatsBadge',
  'get /api/badges/:downloadsKind/:period/:packageName' :'BadgeController.getDownloadStatsPeriodBadge',

  // Search
  'post /api/quick_search': 'SearchController.quickSearch',
  'get /search/keywords/:keyword': 'SearchController.keywordSearch',
  'get /search': 'SearchController.fullSearch',

  'get /api/searchpackages' : 'SearchController.packageSearch',
  'get /api/searchfunctions' : 'SearchController.functionSearch',
  'get /search_packages' : 'SearchController.packageSearch',
  'get /search_functions' : 'SearchController.functionSearch',

  // Parsing
  'get /api/parsing/jobs': 'PackageController.toParse',
  'get /api/users': 'UserController.show',
  'get /api/users/*': 'UserController.show',

};
