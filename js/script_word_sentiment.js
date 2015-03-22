var starting = [null, null, null, null]  
var period='standard';      
//var direction = -1;


//var lineBar = dc.barChart("#lineBar");
var yearBar = dc.barChart("#yearBar");
var ratingBar = dc.barChart("#ratingBar");
var shipBar = dc.barChart("#shipBar");
var positiveBar = dc.rowChart("#positiveBar");
var negativeBar = dc.rowChart("#negativeBar");



function init() {


        var menuTime = "Confidence level,medium,high,very high";
        var menuTimeVal = "MinimumRating,standard,high,very_high";

        menuTime = menuTime.split(",")
        menuTimeVal = menuTimeVal.split(",")
        var listtime=document.getElementById("listTime");

        var numeroScelteTime = menuTime.length
          
        for (var i = 0; i < menuTime.length; i++) 
        {
            var opt = document.createElement("option");
            document.getElementById("listTime").options.add(opt);
            opt.text = menuTime[i];
            opt.value = menuTimeVal[i];
            opt.id = menuTimeVal[i];
        }

if (starting[0] == null)
{
starting[0]="started"
document.getElementById(period).selected="true"
}

var sceltaTime = listtime.options[listtime.selectedIndex].value; 

        if (sceltaTime == "MinimumRating")
          {
          }
          else 
          {
           period = sceltaTime;
          }; 

var lunghezzaMenuTime = document.getElementById("listTime").options.length 

if (lunghezzaMenuTime>numeroScelteTime)
{
       for (var i = 0; i < numeroScelteTime; i++) 
        {  
       var options = document.getElementById("listTime");
       options.remove(lunghezzaMenuTime-1)
        lunghezzaMenuTime= lunghezzaMenuTime-1
        }
}

       
makeChart()

}




function makeChart () {


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


var database = "data/alchemy_ratings_"+period+".csv"

d3.csv(database, function(error, data) {

 
function toNumbers(d) {

//  d.Line=d.Line.trim()
  d.Word=d.Word.trim()
  d.Rating=d.Rating.trim()
  d.Year = parseInt(d.Year)
  d.Ship=d.Ship.trim()
  d.Negative=parseInt(d.Negative) 
  d.Positive=parseInt(d.Positive) 
  d.Total=parseInt(d.Total)  
   }

data.forEach(toNumbers)

var xf = crossfilter();

xf.add(data)

var all = xf.groupAll();

//var line = xf.dimension(function (d){return d.Line;})
var year = xf.dimension(function (d){return d.Year;})
var word = xf.dimension(function (d){return d.Word;})
var rating = xf.dimension(function (d){return d.Rating;})
var ship = xf.dimension(function (d){return d.Ship;})
var negative = xf.dimension(function (d){return d.Negative;})
var positive = xf.dimension(function (d){return d.Positive;})
var total = xf.dimension(function (d){return d.Total;})

//var linePositiveGroup = line.group()
//var lineNegativeGroup = line.group()

var yearPositiveGroup = year.group()
var yearNegativeGroup = year.group()

var ratingPositiveGroup = rating.group()
var ratingNegativeGroup = rating.group()

var shipPositiveGroup = ship.group()
var shipNegativeGroup = ship.group()

var wordPositiveGroup = word.group()
var wordNegativeGroup = word.group()


genericAdd = function (p, v) 
                            {
        p.GrandTotal += v.Total;
        p.TotalPositive += v.Positive;
        p.TotalNegative += v.Negative;            
        return p;
        },

genericReduce = function (p, v) {
        
        p.GrandTotal -= v.Total;
        p.TotalPositive -= v.Positive;
        p.TotalNegative -= v.Negative;         
        return p;       
    },
                    
genericInit =  function(p,v){
            return {
        GrandTotal: 0,
        TotalPositive: 0,
        TotalNegative: 0
        }
  }


genericAddPositive = function (p, v) 
                            {
        p.GrandTotal += v.Total;
        p.TotalPositive += v.Positive;
        p.PercentPositive=p.TotalPositive/p.GrandTotal* 100;
        p.result=p.PercentPositive;           
        return p;
        },

genericReducePositive = function (p, v) {
        
        p.GrandTotal -= v.Total;
        p.TotalPositive -= v.Positive;
        p.PercentPositive=p.TotalPositive/p.GrandTotal* 100;
        p.result=p.PercentPositive; 
        return p;       
    },
                    
genericInitPositive =  function(p,v){
            return {
        GrandTotal: 0,
        TotalPositive: 0,
        PercentPositive:0,
        result:0
        }
  }

genericAddNegative = function (p, v) 
                            {
        p.GrandTotal += v.Total;
        p.TotalNegative += v.Negative; 
        p.PercentNegative=p.TotalNegative/p.GrandTotal* 100;
        p.result=p.PercentNegative;    
        return p;
        },

genericReduceNegative = function (p, v) {
        
        p.GrandTotal -= v.Total;
        p.TotalNegative -= v.Negative;
        p.PercentNegative=p.TotalNegative/p.GrandTotal* 100;
        p.result=p.PercentNegative;    
        return p;       
    },
                    
genericInitNegative =  function(p,v){
            return {
        GrandTotal: 0,
        TotalNegative: 0,
        PercentNegative:0,
        result:0
        }
  }

//var lineDimensionGroupPositive = linePositiveGroup.reduce(genericAddPositive,genericReducePositive,genericInitPositive);
//var lineDimensionGroupNegative = lineNegativeGroup.reduce(genericAddNegative,genericReduceNegative,genericInitNegative);

var yearDimensionGroupPositive = yearPositiveGroup.reduce(genericAddPositive,genericReducePositive,genericInitPositive);
var yearDimensionGroupNegative = yearNegativeGroup.reduce(genericAddNegative,genericReduceNegative,genericInitNegative);

var ratingDimensionGroupPositive = ratingPositiveGroup.reduce(genericAddPositive,genericReducePositive,genericInitPositive);
var ratingDimensionGroupNegative = ratingNegativeGroup.reduce(genericAddNegative,genericReduceNegative,genericInitNegative);

var shipDimensionGroupPositive = shipPositiveGroup.reduce(genericAddPositive,genericReducePositive,genericInitPositive);
var shipDimensionGroupNegative = shipNegativeGroup.reduce(genericAddNegative,genericReduceNegative,genericInitNegative);

var wordDimensionGroupPositive = wordPositiveGroup.reduce(genericAddPositive,genericReducePositive,genericInitPositive);
var wordDimensionGroupNegative = wordNegativeGroup.reduce(genericAddNegative,genericReduceNegative,genericInitNegative);

/*
lineBar
    .valueAccessor(function (p) {return p.value.result; })
    .width(widthVerySmall-100)
    .height(heightSmall+110)
    .margins({top: marginTop+35, right: marginRightSmall, bottom: marginLeftBig, left: marginLeftSmall-20})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(4)
    .elasticX(false)
    .elasticY(false)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(true)
    .title(function (p) {return p.key
                                + "\n"
                            + "Positive: " + accounting.formatMoney(p.value.PercentPositive,  "%", 0, ".", ",") + "\n"
                             +"Negative: " + accounting.formatMoney(p.value.PercentNegative,  "%", 0, ".", ",") + "\n"                     
                                                    ;
    })
    .renderTitle(true)
    .dimension(line)    
    .group(lineDimensionGroupNegative, "Negative")
    .stack(lineDimensionGroupPositive, "Positive"); 
lineBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)

*/

yearBar
    .valueAccessor(function (p) {return p.value.result; })
    .width(widthSmall)
    .height(heightSmall+110)
    .margins({top: marginTop+35, right: marginRightSmall-10, bottom: marginLeftBig, left: marginLeftSmall-20})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(4)
    .elasticX(false)
    .elasticY(false)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(true)
    .title(function (p) {return p.key
                                + "\n"
                            + "Positive: " + accounting.formatMoney(p.value.PercentPositive,  "%", 0, ".", ",") + "\n"
                             +"Negative: " + accounting.formatMoney(p.value.PercentNegative,  "%", 0, ".", ",") + "\n"                     
                                                    ;
    })
    .renderTitle(true)
    .dimension(year)    
    .group(yearDimensionGroupNegative, "Negative")
    .stack(yearDimensionGroupPositive, "Positive"); 
yearBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)

ratingBar
    .valueAccessor(function (p) {return p.value.result; })
    .width(widthVerySmall-100)
    .height(heightSmall+110)
    .margins({top: marginTop+35, right: marginRightSmall-10, bottom: marginLeftBig, left: marginLeftSmall})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(4)
    .elasticX(false)
    .elasticY(false)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderHorizontalGridLines(true)
    .title(function (p) {return p.key
                                + "\n"
                            + "Positive: " + accounting.formatMoney(p.value.PercentPositive,  "%", 0, ".", ",") + "\n"
                             +"Negative: " + accounting.formatMoney(p.value.PercentNegative,  "%", 0, ".", ",") + "\n"                     
                                                    ;
    })
    .renderTitle(true)
    .dimension(rating)    
    .group(ratingDimensionGroupNegative, "Negative")
    .stack(ratingDimensionGroupPositive, "Positive"); 
ratingBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)



shipBar
    .valueAccessor(function (p) {return p.value.result; })
    .width(widthSmall+130)
   .height(heightSmall+110)
    .margins({top: marginTop+30, right: marginRightSmall-10, bottom: marginLeftBig, left: marginLeftSmall-20})
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .brushOn(false)
    .transitionDuration(2000)  
    .centerBar(false)
    .barPadding(0.1)
    .outerPadding(0.05)
    .gap(2)
    .elasticX(false)
    .elasticY(false)
    .xAxisLabel("")
    .yAxisLabel("")
    .renderlet(function (chart) {
    shipBar.selectAll("g.x text")
                      .attr('dx', down)
                      .attr('transform', rotate);
                })

    .renderHorizontalGridLines(true)
    .title(function (p) {return p.key
                                + "\n"
                            + "Positive: " + accounting.formatMoney(p.value.PercentPositive,  "%", 0, ".", ",") + "\n"
                             +"Negative: " + accounting.formatMoney(p.value.PercentNegative,  "%", 0, ".", ",") + "\n"                     
                                                    ;
    })
    .renderTitle(true)
    .dimension(ship)    
    .group(shipDimensionGroupNegative, "Negative")
    .stack(shipDimensionGroupPositive, "Positive") 
    .legend(dc.legend().x(300).y(1)) ;
 shipBar.yAxis().tickFormat(d3.format(".1s")).ticks(4)


positiveBar
    .data(function(p) {return p.order(function (p){return p.TotalPositive;}).top(20);})   
    .ordering(function (p) {return p.value.TotalPositive; })
    .valueAccessor(function (p) {return p.value.TotalPositive; })
    .gap(1)
    .colors("#ff7f0e")
    .width(widthLarge-50)
    .height(heightBig)
    .margins({top: marginTop, right: marginRightSmall+30, bottom:20, left: marginLeftBig+50})
    .transitionDuration(2000)  
    .label(function (p){if (isNaN(p.value.PercentPositive)){return ""}
                        else 
                            {return  p.key}})                
    .elasticX(false)
    .title(function (p) {return p.key
                                + "\n"
                              + "ratings where best: " + accounting.formatMoney(p.value.PercentPositive,  "%", 1, ".", ",") + "\n"                    
                                                    ;
    })
      .elasticX(true)
        .renderTitle(true)
        .renderLabel(true)
        .labelOffsetX(-120)
        .labelOffsetY(10)
    .dimension(word)    
    .group(wordDimensionGroupPositive);
positiveBar.xAxis().ticks(5);


negativeBar
    .data(function(p) {return p.order(function (p){return p.TotalNegative;}).top(20);})   
    .ordering(function (p) {return p.value.TotalNegative; })
    .valueAccessor(function (p) {return p.value.TotalNegative; })
    .gap(1)
    .width(widthLarge-50)
    .height(heightBig)
    .margins({top: marginTop, right: marginRightSmall+30, bottom:20, left: marginLeftBig+50})
    .transitionDuration(2000)  
    .colors('#1f77b4')
    .label(function (p){if (isNaN(p.value.PercentNegative)){return ""}
                        else 
                            {return  p.key}})                
    .elasticX(false)
    .title(function (p) {return p.key
                                + "\n"
                              + "ratings where best: " + accounting.formatMoney(p.value.PercentNegative,  "%", 1, ".", ",") + "\n"                    
                                                    ;
    })
      .elasticX(true)
        .renderTitle(true)
        .renderLabel(true)
        .labelOffsetX(-120)
        .labelOffsetY(10)
    .dimension(word)    
    .group(wordDimensionGroupNegative);
negativeBar.xAxis().ticks(4);



   window.filter = function (o) {
        if (o != null && typeof o == "string") {
            o = decodeFiltersURL(decodeURIComponent(o))
        }
        hashBlock = true;
        if (o == null) {
            dc.filterAll()
        } else {
            dc.filterAll();
            dc.chartRegistry.list().forEach(function (s, r) {
                if (r < o.length) {
                    if (o[r] instanceof Array) {
                            var p = o[r].pop();
                            var q = s.filters();
                            q.splice(s.filters()).push.apply(q, o[r]);
                            s.filter(p)
                    } else {
                        s.filter(o[r])
                    }
                } else {
                    s.filter(null)
                }
            })
        }
        hashBlock = false;
        dc.redrawAll()
    }
        window.reset = function () {
            filter();
        };

        var hashFilters = function () {
            setTimeout(function () {
                window.location.hash = encodeFiltersURL(getFilters());
            }, 100);
        }

        var getFilters = function () {
            var filters = [];
            dc.chartRegistry.list().forEach(function (d, i) {
                filters[i] = d.filters().slice(0);
            });
            return filters;
        };


window.quickfilter0 = function () {
        dc.chartRegistry.list().filterAll();
        dc.redrawAll()
    };

        var encodeFiltersURL = function (filters) {
            filters.forEach(function (f, i) {
                if (f == null)
                    filters[i] = '';
                else if (f instanceof Array || f instanceof Object) {
                    if (f[0] instanceof Date && f[1] instanceof Date)
                        filters[i] = "d" + Math.round(f[0].getTime() / 86400000 - 37 * 365) + "-" + Math.round(f[1].getTime() / 86400000 - 37 * 365);
                    else if (!isNaN(parseFloat(f[0])) && !isNaN(parseFloat(f[1])))
                        filters[i] = Math.round(parseFloat(f[0]) * 100) / 100 + "-" + Math.round(parseFloat(f[1]) * 100) / 100;
                } else if (!isNaN(parseFloat(f)))
                    filters[i] = Math.round(parseFloat(f) * 100) / 100;
            });
            var f = filters.join("&");
            if (f.replace(/[\|\&]/g, "") == "")
                f = "&";
            return f;
        };

        window.decodeFiltersURL = function (hash) {
        if (hash == null || hash == "" || hash == "#"|| hash == "#&") {
            return null
        }
        if (hash[0] == "#") {
            hash = hash.substr(1)
        }
        hash = hash.split("&");
        var filters = [];
        hash.forEach(function (r, q) {
            if (r == "") {
                filters[q] = null
            } else {
                if (q == 0) {
                    filters[q] = [r.split(",")]
                } else {
                    filters[q] = r.split(",")
                }
            }
        if (console) 
                    console.log(hash + " " + filters[q]);   
        });
        return filters
        };

 
    dc.dataCount(".dc-data-count")
                    .dimension(xf)
                    .group(all);
  dc.renderAll();

           filter(window.location.hash);

            dc.chartRegistry.list().forEach(function (D, C) {
            D.on("filtered", hashFilters)
        });





});

}

    window.onload = init
        
        
