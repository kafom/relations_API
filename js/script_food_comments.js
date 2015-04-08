var sbjKeywordBar = dc.rowChart("#sbjKeywordBar");
var verbBar = dc.rowChart("#verbBar");
var objKeywordBar = dc.rowChart("#objKeywordBar");
var ratingBar = dc.rowChart("#ratingBar");
var sbjSentBar = dc.rowChart("#sbjSentBar");
var objSentBar = dc.rowChart("#objSentBar");


var gap = 10
var downbig='-55'
var downmedium='-44'
var down='-40'
var downsmall='-20'
var rotate='rotate(-70)'
var marginRight = 40
var marginRightSmall = 20
var marginRightBig = 120
var marginLeftBig = 80
var marginLeftMedium = 50
var marginLeftSmall = 35
var marginTop = 10
var marginTopLarge = 40
var marginBottomBig = 110
var marginBottomMedium = 70
var marginBottomSmall = 10
var marginBottomWithout = 10
var heightBig=330
var heightMedium=300
var heightMediumSmall=240
var heightSmall=120
var widthVerySmall=210
var widthSmall=240
var widthSmallMedium=300
var widthMedium=500
var widthLarge=550;


var database = "data/alchemy_ratings_food_db.csv"
d3.csv(database, function(error, data) {

function toNumbers(d) {
  d.SbjKeyword =d.SbjKeyword.trim()
  d.Verb=d.Verb.trim()
  d.ObjKeyword =d.ObjKeyword.trim()
  d.Rating=d.Rating.trim()
  d.SbjSent=d.SbjSent.trim()
  d.ObjSent=d.ObjSent.trim()
  d.Message=d.Message.trim() 
  d.Count=parseInt(d.Count)   
   }



data.forEach(toNumbers)

var xf = crossfilter();

xf.add(data)

var all = xf.groupAll();

var sbjKeyword = xf.dimension(function (d){return d.SbjKeyword ;})
var verb = xf.dimension(function (d){return d.Verb;})
var objKeyword = xf.dimension(function (d){return d.ObjKeyword ;})
var rating = xf.dimension(function (d){return d.Rating;})
var sbjSent = xf.dimension(function (d){return d.SbjSent;})
var objSent = xf.dimension(function (d){return d.ObjSent;})
var message = xf.dimension(function (d){return d.Message;})
var count = xf.dimension(function (d){return d.Count;})

var sbjKeywordGroup =   sbjKeyword.group()
var verbGroup =         verb.group()
var objKeywordGroup =   objKeyword.group()
var ratingGroup =       rating.group()
var sbjSentGroup =      sbjSent.group()
var objSentGroup =      objSent.group()
var messageGroup =      message.group()


genericAdd = function (p, v) 
                            {
        p.TotalCount += v.Count;        
        return p;
        },

genericReduce = function (p, v) {
        
        p.TotalCount-= v.Count;   
        return p;       
    },
                    
genericInit =  function(p,v){
            return {
        TotalCount: 0
        }
  }


var sbjKeywordDimensionGroup =  sbjKeywordGroup.reduce(genericAdd,genericReduce,genericInit);
var verbDimensionGroup =        verbGroup.reduce(genericAdd,genericReduce,genericInit);
var objKeywordDimensionGroup =  objKeywordGroup.reduce(genericAdd,genericReduce,genericInit);
var ratingDimensionGroup =      ratingGroup.reduce(genericAdd,genericReduce,genericInit);
var sbjSentDimensionGroup =     sbjSentGroup.reduce(genericAdd,genericReduce,genericInit);
var objSentDimensionGroup =     objSentGroup.reduce(genericAdd,genericReduce,genericInit);
var messageDimensionGroup =     messageGroup.reduce(genericAdd,genericReduce,genericInit);

sbjKeywordBar
   .data(function(p) {return p.order(function (p){return p.TotalCount;}).top(30);})   
    .ordering(function (p) {return p.value.TotalCount; })
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(1)
     .colors("white")
    .width(200)
    .height(heightBig+130)
    .margins({top: marginTop, right: 110, bottom:0, left: 0})
    .transitionDuration(2000) 
    .elasticX(true)
    .renderTitle(true)
    .renderLabel(true)
    .labelOffsetX(0)
    .labelOffsetY(8)
    .dimension(sbjKeyword)    
    .group(sbjKeywordDimensionGroup);
sbjKeywordBar.xAxis().ticks(5);


verbBar
   .data(function(p) {return p.order(function (p){return p.TotalCount;}).top(30);})   
    .ordering(function (p) {return p.value.TotalCount; })
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(1)
     .colors("white")
    .width(200)
    .height(heightBig+130)
    .margins({top: marginTop, right: 110, bottom:0, left: 0})
    .transitionDuration(2000) 
    .elasticX(true)
    .renderTitle(true)
    .renderLabel(true)
    .labelOffsetX(0)
    .labelOffsetY(8)
    .dimension(verb)    
    .group(verbDimensionGroup);
verbBar.xAxis().ticks(5);


objKeywordBar
   .data(function(p) {return p.order(function (p){return p.TotalCount;}).top(30);})   
    .ordering(function (p) {return p.value.TotalCount; })
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(1)
     .colors("white")
    .width(200)
    .height(heightBig+130)
    .margins({top: marginTop, right: 110, bottom:0, left: 0})
    .transitionDuration(2000) 
    .elasticX(true)
    .renderTitle(true)
    .renderLabel(true)
    .labelOffsetX(0)
    .labelOffsetY(8)
    .dimension(objKeyword)    
    .group(objKeywordDimensionGroup);
objKeywordBar.xAxis().ticks(5);

ratingBar  
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(2)
    .colors("#1f77b4")
    .width(100)
    .height(heightSmall-40)
    .margins({top: marginTop, right: 10, bottom:0, left: 50})
    .transitionDuration(2000) 
    .elasticX(true)
    .renderTitle(true)
    .renderLabel(true)
    .labelOffsetX(-50)
    .labelOffsetY(18)
    .title(function (p) {return p.key
                                + "\n"
                            + "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                       
                                                    ;
    })
   .dimension(rating)    
    .group(ratingDimensionGroup);


sbjSentBar  
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(2)
    .colors("#1f77b4")
    .width(100)
    .height(heightSmall-20)
    .margins({top: marginTop, right: 10, bottom:0, left: 50})
    .transitionDuration(2000) 
    .elasticX(true)
    .renderTitle(true)
    .renderLabel(true)
    .labelOffsetX(-50)
    .labelOffsetY(15)
    .title(function (p) {return p.key
                                + "\n"
                            + "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                       
                                                    ;
    })
    .dimension(sbjSent)    
    .group(sbjSentDimensionGroup)

objSentBar
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(2)
    .colors("#1f77b4")
    .width(100)
    .height(heightSmall-20)
    .margins({top: marginTop, right: 10, bottom:0, left: 50})
    .transitionDuration(2000) 
    .elasticX(true)
    .renderTitle(true)
    .renderLabel(true)
    .labelOffsetX(-50)
    .labelOffsetY(15)
    .title(function (p) {return p.key
                                + "\n"
                            + "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                       
                                                    ;
    })
    .dimension(objSent)    
    .group(objSentDimensionGroup)





var datatable = $("#dc-data-table").dataTable({
            "bPaginate": true,
            "bLengthChange": true,
            "bFilter": true,
            "bSort": true,
            "bInfo": false,
            "bAutoWidth": false,
            "bDeferRender": true,
            "aaData" : message.top(Infinity),
            "bDestroy": true,
            "aoColumns": [
                { "mData": function(d) { return d.Message; }, "sDefaultContent": ""},
               
            ]
        })
        
        function RefreshTable() {
            dc.events.trigger(function () {
                alldata = message.top(1000);
                datatable.fnClearTable();
                datatable.fnAddData(alldata);
                datatable.fnDraw();
            });
        }


dc.dataCount(".dc-data-count")
                    .dimension(xf)
                    .group(all);

for (var i = 0; i < dc.chartRegistry.list().length; i++) {
            var chartI = dc.chartRegistry.list()[i];
            chartI.on("filtered", RefreshTable);
        }
        
     RefreshTable();

        dc.renderAll();

});




        
        
