$(document).ready(function() {
  $( ".js-display-list" ).click(function(e) {
    e.preventDefault();
    $(this).parent().find(".js-view-package-list").toggle();
  });
  $(".list-group .list-group-item").each(function(){
  	$(this).click(function(event){
  		event.preventDefault();
  		getView($(this).html());
  		$(".highlight").removeClass("highlight");
  		$(this).addClass("highlight");
  	});
  });
});

getView = function(view){
  $.ajax({
  	url: "/taskviews/"+view,
    cache: false
  }).done(function(response){
  	$(".view").html($($.parseHTML(response)).filter(".content").html());
  	resetFilter();
    percentileTaskView();
  });
}

sortTable = function(){
  $("table.taskviewtable").tablesorter({
          headers: {
            3: {
                sorter:'rating'
            }
        },
        textExtraction: function (node){
          if($(node).find(".rating").length>0){
            return ($(node).find(".rating").data('rating'));
          }else if($(node).find(".percentile-task".length>0)){
            return $(node).find(".percentile-task").data('percentile');
          }
          return $(node).text();
        },
        sortList: [[2,1]]
    });
}

aggregatePercentile = function(){
  total = 0;
  $(".percentile-task").each(function(){
    total += $(this).data('percentile');
  });
  avg = total/($(".percentile-task").length);
  if(avg){
    $("#aggpercentile").html(""+Math.round(avg)+"th");
    $('.downloads').css({"visibility": "visible"});
  }
}

percentileTaskView = function(){
  requests =[];
  $('.percentile-task').each(function(elem) {
    var $self = $(this);
    var url = $self.data('url');
    requests.push($.get(url, function(data){
      if(data.percentile != null){
      $self.find(".percentile").text(''+ data.percentile + 'th');
      $self.data("percentile",data.percentile)
      $('.percentile-task').css({'visibility': 'visible'});
    } else{
      $('.percentile-task').css({'display': 'none'});
    }
    }));
  });
  $.when.apply(undefined,requests).then(function(){
    window.triggerIcon();
    sortTable();
    aggregatePercentile();
  });
}