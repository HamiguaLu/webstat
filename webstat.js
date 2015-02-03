var MAX_RESULT_COUNT = 10050;
var microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
var HistroyList = [];

function GetDomain(url) {
	url = url.toLowerCase();
    
	var domain = "";
    
	//remove "http://"
    if (url.indexOf("http://") == 0) {
        url = url.substr(7);
    }
	
	if (url.indexOf("https://") == 0) {
        url = url.substr(8);
    }
	
	if (url.indexOf("file://") == 0) {
		return "";
	}
	
	if (url.indexOf(':') > 0){
		url = url.split('/')[0];
	}
	
	if (url.indexOf('/') > 0){
		return url.split('/')[0];
	}
    	  
    return domain;
}

function GetHostName(domain){
	//replace country code like cn/uk etc
	for (var i = 0; i < coutryDomain.length; ++i){
		if (domain.lastIndexOf(coutryDomain[i])  == domain.length - coutryDomain[i].length){
			domain = domain.replace(coutryDomain[i],"");
			break;
		}
	}

	//replace top domain like com/gov
	for (var i = 0; i < topDomain.length; ++i){
		if (domain.lastIndexOf(topDomain[i]) == domain.length - topDomain[i].length){
			domain = domain.replace(topDomain[i],"");
			break;
		}
	}

	if (domain.indexOf('.') > 0){
		var hosts = domain.split('.');
		if (hosts.length == 4){
			if (jQuery.isNumeric(hosts[0]) && jQuery.isNumeric(hosts[1]) && jQuery.isNumeric(hosts[2]) && jQuery.isNumeric(hosts[3])) {
				//ip address
				return domain;
			}
		}
		
		return hosts[hosts.length - 1];
	}
	
	return domain;
}

function TrimURL(domain){
	if (domain == null || domain.length < 1){
		return "";
	}
	
	var host = GetHostName(domain);
	
	return domain.substr(domain.indexOf(host),domain.length);
}


function QueryHistoryItem( startTime,endTime, itemProcessor){
	var lastStartTime = startTime;
	
	HistroyList = [];
	
	chrome.history.search({'text': '','startTime':lastStartTime,'endTime':endTime,	'maxResults':MAX_RESULT_COUNT},
		function (historyItems) {
			
			for (var i = 0; i < historyItems.length; ++i) {
				var item = historyItems[i];
				var domain = GetDomain(item.url);
				
				if (domain == ""){
					continue;
				}
				
				var hitem = {
					domain:domain  ,
					host:TrimURL(domain),
					lastVisitTime: item.lastVisitTime,
					visitCount:item.visitCount,
					typedCount:item.typedCount,
    			};
				
				HistroyList.push(hitem);
				
			}
			
			itemProcessor();
			
		});
}




function StatByDayTime(){
  var startTime = (new Date).getTime() - microsecondsPerWeek * 4;
  var endTime = (new Date).getTime();
  
  QueryHistoryItem(startTime,endTime,DayTimeStatProcessor);
}

function DayTimeStatProcessor(){
	HistroyList.sort(function(a, b) {
					return  b["lastVisitTime"] - a["lastVisitTime"];
				});
				
	var startTime = (new Date).getTime() - microsecondsPerWeek * 4;
	
	var lastitem = null;
	
	var statResult = [];
	for (var i = 0; i < HistroyList.length; ++i) {
		if (HistroyList[i].lastVisitTime < startTime){
			continue;
		}
	
		var d = new Date()
		d.setTime(HistroyList[i].lastVisitTime);
		
		var day = (d.getMonth() + 1) + "-" +  d.getDate();
		
		
		var j = 0;
		for (; j < statResult.length; ++j){
			if (statResult[j].day == day){
				break;
			}
		}
		
		if (j >= statResult.length){
			j = statResult.length;
			var statItem = {day:day, totaltime:	parseInt(0),count:0};
			statResult.push(statItem);
		}
		
		if (lastitem != null){
			var d1 = new Date()
			d1.setTime(lastitem.lastVisitTime);
		
			var day1 = (d1.getMonth() + 1) + "-" +  d1.getDate();
			if (day1 == day){
				statResult[j].count += 1;
				var timeDiff =  parseInt(lastitem.lastVisitTime - HistroyList[i].lastVisitTime);
				if (timeDiff < 1000 * 60 * 10){
					//alert(timeDiff);
					//within 10 minutes
					statResult[j].totaltime += parseInt(timeDiff);
				}
			}
		}
	 
		//blob += HistroyList[i].host + "," + (d.getMonth() + 1) + "-" +  d.getDate() +"," + HistroyList[i].visitCount + "," + HistroyList[i].typedCount + "</br>";
		
		lastitem = HistroyList[i];
		
	}
	
	var blob = "";
	for (var j = 0; j < statResult.length; ++j){
		statResult[j].totaltime = parseInt(statResult[j].totaltime)/1000;
		statResult[j].totaltime = parseInt(statResult[j].totaltime/60);
		blob += statResult[j].day + "," + statResult[j].totaltime + "," + statResult[j].count +"</br>";
	}
		
	$("#historylist").append(blob);
}

function StatByMonthTime(){
	var startTime = (new Date).getTime() - microsecondsPerWeek * 4;
  var endTime = (new Date).getTime();
  
  QueryHistoryItem(startTime,endTime,MonthTimeStatProcessor);
}

function MonthTimeStatProcessor(){
	HistroyList.sort(function(a, b) {
					return  b["lastVisitTime"] - a["lastVisitTime"];
				});
				
	var startTime = (new Date).getTime() - microsecondsPerWeek * 4;
	
	var lastitem = null;
	
	var statResult = [];
	for (var i = 0; i < HistroyList.length; ++i) {
		if (HistroyList[i].lastVisitTime < startTime){
			continue;
		}
	
		var d = new Date()
		d.setTime(HistroyList[i].lastVisitTime);
		
		var day = (d.getMonth() + 1) + "-" +  d.getDate();
		
		
		var j = 0;
		for (; j < statResult.length; ++j){
			if (statResult[j].day == day){
				break;
			}
		}
		
		if (j >= statResult.length){
			j = statResult.length;
			var statItem = {month:d.getMonth() + 1,day:day, totaltime:	parseInt(0),count:0};
			statResult.push(statItem);
		}
		
		if (lastitem != null){
			var d1 = new Date()
			d1.setTime(lastitem.lastVisitTime);
		
			var day1 = (d1.getMonth() + 1) + "-" +  d1.getDate();
			if (day1 == day){
				statResult[j].count += 1;
				var timeDiff =  parseInt(lastitem.lastVisitTime - HistroyList[i].lastVisitTime);
				if (timeDiff < 1000 * 60 * 10){
					//alert(timeDiff);
					//within 10 minutes
					statResult[j].totaltime += parseInt(timeDiff);
				}
			}
		}
	 
		//blob += HistroyList[i].host + "," + (d.getMonth() + 1) + "-" +  d.getDate() +"," + HistroyList[i].visitCount + "," + HistroyList[i].typedCount + "</br>";
		
		lastitem = HistroyList[i];
		
	}
	
	var statResult1 = [];
	for (var j = 0; j < statResult.length; ++j){
		statResult[j].totaltime = parseInt(statResult[j].totaltime)/1000;
		statResult[j].totaltime = parseInt(statResult[j].totaltime/60);
		
		var a = 0;
		for (; a < statResult1.length; ++a){
			if (statResult1[a].month == statResult[j].month){
				break;
			}
		}
		
		if (a >= statResult1.length){
			a = statResult1.length;
			var statItem = {month:statResult[j].month, totaltime:parseInt(0),count:0};
			statResult1.push(statItem);
		}		
		
		statResult1[a].totaltime += statResult[j].totaltime;
		statResult1[a].count += statResult[j].count;
		
	}
	
	statResult = [];
		
	var blob = "";
	for (var j = 0; j < statResult1.length; ++j){
		blob += statResult1[j].month + "," + statResult1[j].totaltime + "," + statResult1[j].count +"</br>";
	}
		
	$("#historylist").append(blob);
}

function StatByTop10Count(){
	
}

function Top10CountStatProcessor(){
	
}

function StatByTop10Time(){
	
}

function Top10TimeStatProcessor(){
	
}

function StatByVisitType(){
	
}

function VisitTypeStatProcessor(){
	
}

document.addEventListener('DOMContentLoaded', function () {
  //StatByDayTime();
  StatByMonthTime();
});
