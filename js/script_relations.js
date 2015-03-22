var aggKeywordBar = dc.barChart("#aggKeywordBar");
var ratingBar = dc.barChart("#ratingBar");
var sbjSentTypeBar = dc.barChart("#sbjSentTypeBar");
var objSentTypeBar = dc.barChart("#objSentTypeBar");
var actVerbTextBar = dc.rowChart("#actVerbTextBar");
/*
var negativeBar = dc.rowChart("#negativeBar");

*/




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


var database = "data/alchemy_ratings_relations_small.csv"
d3.csv(database, function(error, data) {

function toNumbers(d) {

  d.AggKeyword=d.AggKeyword.trim()
  d.Rating=d.Rating.trim()
  d.ActVerbText=d.ActVerbText.trim()
  d.SbjSentType=d.SbjSentType.trim()
  d.ObjSentType=d.ObjSentType.trim()
  d.Message=d.Message.trim() 
  d.Count=parseInt(d.Count)   
    d.Index=parseInt(d.Index)
   }



data.forEach(toNumbers)

var xf = crossfilter();

xf.add(data)

var all = xf.groupAll();

var aggKeyword = xf.dimension(function (d){return d.AggKeyword;})
var rating = xf.dimension(function (d){return d.Rating;})
var actVerbText = xf.dimension(function (d){return d.ActVerbText;})
var sbjSentType = xf.dimension(function (d){return d.SbjSentType;})
var objSentType = xf.dimension(function (d){return d.ObjSentType;})
var message = xf.dimension(function (d){return d.Message;})
var count = xf.dimension(function (d){return d.Count;})

var aggKeywordGroup = aggKeyword.group()
var ratingGroup = rating.group()
var actVerbTextGroup = actVerbText.group()
var sbjSentTypeGroup = sbjSentType.group()
var objSentTypeGroup = objSentType.group()
var messageGroup = message.group()


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



var aggKeywordDimensionGroup =  aggKeywordGroup.reduce(genericAdd,genericReduce,genericInit);
var ratingDimensionGroup =      ratingGroup.reduce(genericAdd,genericReduce,genericInit);
var actVerbTextDimensionGroup = actVerbTextGroup.reduce(genericAdd,genericReduce,genericInit);
var sbjSentTypeDimensionGroup = sbjSentTypeGroup.reduce(genericAdd,genericReduce,genericInit);
var objSentTypeDimensionGroup = objSentTypeGroup.reduce(genericAdd,genericReduce,genericInit);
var messageDimensionGroup =     messageGroup.reduce(genericAdd,genericReduce,genericInit);



aggKeywordBar
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .width(widthSmall+130)
   .height(heightSmall+50)
    .margins({top: marginTop+30, right: marginRightSmall-10, bottom: marginBottomSmall, left: marginLeftSmall-50})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(2)
    .elasticX(false)
    .elasticY(true)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(false)
    .title(function (p) {return p.key
                                + "\n"
                            + "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                   
                                                    ;
    })
    .renderTitle(true)
    .dimension(aggKeyword)    
    .group(aggKeywordDimensionGroup)
 aggKeywordBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)

ratingBar
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .width(widthSmall-130)
   .height(heightSmall+50)
    .margins({top: marginTop+30, right: marginRightSmall-10, bottom: marginBottomSmall, left: marginLeftSmall-50})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(2)
    .elasticX(false)
    .elasticY(true)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(false)
    .title(function (p) {return p.key
                                + "\n"
                            + "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                        
                                                    ;
    })
    .renderTitle(true)
    .dimension(rating)    
    .group(ratingDimensionGroup)
 ratingBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)


sbjSentTypeBar
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .width(widthSmall-80)
   .height(heightSmall+50)
    .margins({top: marginTop+30, right: marginRightSmall-10, bottom: marginBottomSmall, left: marginLeftSmall-50})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(2)
    .elasticX(false)
    .elasticY(true)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(false)
    .title(function (p) {return p.key
                                + "\n"
                            + "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                       
                                                    ;
    })
    .renderTitle(true)
    .dimension(sbjSentType)    
    .group(sbjSentTypeDimensionGroup)
 sbjSentTypeBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)

objSentTypeBar
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .width(widthSmall-80)
   .height(heightSmall+50)
    .margins({top: marginTop+30, right: marginRightSmall-10, bottom: marginBottomSmall, left: marginLeftSmall-50})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(2)
    .elasticX(false)
    .elasticY(true)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(false)
    .title(function (p) {return p.key
                                + "\n"
                            "occurrences: " + accounting.formatMoney(p.value.TotalCount,"", 0, ".", ",")                     
                                                    ;
    })
    .renderTitle(true)
    .dimension(objSentType)    
    .group(objSentTypeDimensionGroup)
 objSentTypeBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)

actVerbTextBar
   .data(function(p) {return p.order(function (p){return p.TotalCount;}).top(30);})   
    .ordering(function (p) {return p.value.TotalCount; })
    .valueAccessor(function (p) {return p.value.TotalCount; })
    .gap(1)
     .colors("white")
    .width(150)
    .height(heightBig+100)
    .margins({top: marginTop, right: 10, bottom:0, left: 80})
    .transitionDuration(2000) 
    .elasticX(true)
        .renderTitle(true)
        .renderLabel(true)
        .labelOffsetX(-70)
        .labelOffsetY(8)
    .dimension(actVerbText)    
    .group(actVerbTextDimensionGroup);
actVerbTextBar.xAxis().ticks(5);

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




        
        
