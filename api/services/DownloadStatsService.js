var _ = require('lodash');
var Promise = require('bluebird');
var dateFormat = require('dateformat');
var CSV = require('csv-js');
var r = require('request');
var zlib = require('zlib');

module.exports = {

  reverseDependenciesCache: {

  },

  getReverseDependencies: function(package_name) {
    var reverseDependencies = DownloadStatsService.reverseDependenciesCache[package_name];
    if (reverseDependencies) {
      return Promise.resolve(reverseDependencies);
    } else {
      return Dependency.findByDependantForIndependentDownloads(package_name).then(function(rootPackages) {
        var rootPackageNames = _.map(rootPackages,function(_package){
          return _package.package_name;
        });
        rootPackageNames = _.sortBy(rootPackageNames);
        DownloadStatsService.reverseDependenciesCache[package_name] = rootPackageNames;
        return rootPackageNames;
      });
    }
  },

  getDailyDownloads: function () {
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 2);
    var yesterdayDateString = dateFormat(yesterday, "yyyy-mm-dd").toString();
    var url = `http://cran-logs.rstudio.com/${yesterday.getFullYear()}/${yesterdayDateString}.csv.gz`;

    var requestSettings = {
      method: 'GET',
      url,
      encoding: null,
    };

    r(requestSettings, function(error, response, buf) {
      zlib.gunzip(buf, function(err, dezipped) {
        var rows = CSV.parse(dezipped.toString());
        rows.shift();
        var rows = _.map(rows, function(row){
          return {
            date: row[0],
            time: row[1],
            package: row[6],
            ip_id: row[9]
          }
        });
      });
    });

  },

  binarySearchIncludes: function (haystack, needle) {
    return _.sortedIndexOf(haystack, needle) !== -1 ;
  },

  processDownloads:function(response,directDownloads,indirectDownloads,total,callback) {
    var hits = response.hits.hits;
    var _response = {
      hits: { total: response.hits.total },
      _scroll_id: response._scroll_id
    };
    var hit_date = hits[1].fields.datetime[0];
    var date = new Date(hit_date);
    var formattedDate = dateFormat(date, "yyyy-mm-dd").toString();

    Promise.map(hits, function(hit, i) {
      //execute queries to find inverse dependencies for all hits asynchronous, and find indirect hits before and after in ordered records
      var package_name = hit.fields.package[0];
      return DownloadStatsService.getReverseDependencies(package_name).then(function(rootPackageNames) {

        var indirect = false;
        var j=i+1;

        var thisHitTimestamp = new Date(hit.fields.datetime[0]).getTime();

        while (!indirect && j<hits.length && hits[j].fields.ip_id[0] == hit.fields.ip_id[0] &&
          new Date(hits[j].fields.datetime[0]).getTime()< (thisHitTimestamp+60000)
        ) {
          if(DownloadStatsService.binarySearchIncludes(rootPackageNames,hits[j].fields.package[0])) {
            indirectDownloads[package_name] = indirectDownloads[package_name]+1 || 1;
            indirect=true;
          }
          j+=1;
        }
        j=i-1;
        while (j>=0 && hits[j].fields.ip_id[0] == hit.fields.ip_id[0] &&
          new Date(hits[j].fields.datetime[0]).getTime()+60000> (thisHitTimestamp) &&
          !(indirect)
        ) {
          if(DownloadStatsService.binarySearchIncludes(rootPackageNames,hits[j].fields.package[0])) {
            indirectDownloads[package_name] = indirectDownloads[package_name]+1 || 1;
            indirect=true;
          }
          j-=1;
        }
        if(!indirect){
          directDownloads[package_name] = directDownloads[package_name]+1 || 1;
        }
      });

    }, {concurrency: 10}).then(function(){

      return ElasticSearchService.scrollDailyDownloadsBulk(_response,formattedDate,directDownloads,indirectDownloads,total,callback);
    });
  },

  //write all splitted download counts to the database
  writeSplittedDownloadCounts: function(date,directDownloads,indirectDownloads){
    console.log("writing data");
    return Package.findAll({attributes: ['name']}).then(function(packages) {
      var records = _.map(packages, function(_package) {
        return {
          package_name: _package.name,
          date: date,
          indirect_downloads: indirectDownloads[_package.name] || 0,
          direct_downloads: directDownloads[_package.name] || 0
        };
      });
      var groups = _.chunk(records,500);

      return Promise.map(groups, function(group) {
        return DownloadStatistic.bulkCreate(group, {
          updateOnDuplicate:true
        });
      }, {concurrency: 1});
    });
  }
};
