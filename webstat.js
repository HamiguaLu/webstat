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
	for (var i = 0; i < coutryDomain.length; ++i){
		if (domain.lastIndexOf(coutryDomain[i])  == domain.length - coutryDomain[i].length){
			domain = domain.replace(coutryDomain[i],"");
			break;
		}
	}

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
				
	var blob = "";

	var startTime = (new Date).getTime();
	 for (var i = 0; i < HistroyList.length; ++i) {
		
	 
		blob += HistroyList[i].host + "," + HistroyList[i].lastVisitTime  + "," + HistroyList[i].visitCount + "," + HistroyList[i].typedCount + "</br>";
	}
		
	$("#historylist").append(blob);
}

function StatByMonthTime(){
	
}

function MonthTimeStatProcessor(){
	
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
  StatByDayTime();
});
