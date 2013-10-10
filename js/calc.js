
var sort_pops = false;
var sort_price = false;

function show_cdn_plan_notes(cdn_name, plan_name, extra, lastline = '') {
	
	$("#traffic_info tr:contains("+cdn_name+") td").eq(3).html(plan_name + ((extra > 0) ? (' + extra $' + extra + ' ') : '') + lastline);
}
function max_and_cachefly(trange, cdn_name) {
	var traf = $("#traffic_volume").val();
	var result = 0;
	var last_excessPrice = 0;
	$.each(trange, function(index) {
		if (traf <= this.included) {
			result = this.price;
			$("#traffic_info tr:contains("+cdn_name+") td").eq(3).html(this.name + ((cdn_name == 'MaxCDN') ? ' <span id="recommended">Recommended</span>' : '') );
			return false;
		}
		else {
			$("#traffic_info tr:contains("+cdn_name+") td").eq(3).html(this.name + ((cdn_name == 'MaxCDN') ? ' <span id="recommended">Recommended</span>' : ''));
			var traf_excess = traf - this.included;
			var next_plan = trange[index+1];
			if (typeof next_plan !== "undefined" 
					&& traf < next_plan.included 
					&& traf_excess * this.excessPrice + this.price < next_plan.price) {
				result = traf_excess * this.excessPrice + this.price;
				 
				show_cdn_plan_notes(cdn_name,this.name,Math.round(traf_excess * this.excessPrice) 
					, (cdn_name == 'MaxCDN') ? ' <span id="recommended">Recommended</span>' : '' );
				return false;
			}
			else {
				result = traf_excess * this.excessPrice + this.price;
				show_cdn_plan_notes(cdn_name,this.name,Math.round(traf_excess * this.excessPrice)
				, (cdn_name == 'MaxCDN') ? ' <span id="recommended">Recommended</span>' : '' ); 
			}
		}
		last_excessPrice = this.excessPrice;
	});
	result = result ? result : Math.round(traf * last_excessPrice);
	$("#traffic_info tr:contains("+cdn_name+") td:last").html('$' + Math.round(result));
}

function calculate_total() {
	var total = 0;
	var continents = [ {name:'US'},{name:'SA'},{name:'EU'},{name:'AU'},{name:'AS'},{name:'AF'}];
			$.each(continents, function () {
				$('#traff'+this.name).val($('#traff'+this.name).val().replace(/\D+/g,''));
				if ($('#traff'+this.name).val() == '') $('#traff'+this.name).val(0);
				total += parseInt($('#traff'+this.name).val());
			});
			if (total != 100) {
				$.each(continents, function () {
					$('#traff'+this.name).parent().removeClass('has-success');
					$('#traff'+this.name).parent().addClass('has-error');
				});
			}
			else {
				$.each(continents, function () {
					$('#traff'+this.name).parent().removeClass('has-error');
					$('#traff'+this.name).parent().addClass('has-success');
				});
			}
	return total;		
}
var 
	continents_codes = {'US':'USA','SA':'South America','EU':'Europe','AU':'Australia','AS':'Asia','AF':'Africa'};
var 
	plans = {
		Cachefly: function () {
			var trange = [ 
				{name:'Plus',     price:  99, included:  256, excessPrice: 0.37 },
				{name:'Premium',  price: 299, included: 1200, excessPrice: 0.25 }, 
				{name:'Platinum', price: 409, included: 2048, excessPrice: 0.20 } ];
			max_and_cachefly(trange, "CacheFly");
		},
		
		MaxCDN: function () {
			var trange = [ 
				{name:'#!/bin/start', price:   9, included:   100, excessPrice: 0.08 },
				{name:'./plus',       price:  39, included:   500, excessPrice: 0.07 }, 
				{name:'./business',   price:  79, included:  1000, excessPrice: 0.06 },
				{name:'./premium',    price: 499, included: 10000, excessPrice: 0.05 } ];
			max_and_cachefly(trange, "MaxCDN");
		},
		
		MtProCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = 0;
			if (traf <= 200) {
				result = 20;
				show_cdn_plan_notes("ProCDN","Default Plan");
			}
			else if(traf <= 10240) {
				result = 20 + (traf-200)*0.15;
				show_cdn_plan_notes("ProCDN","Default Plan",Math.round((traf-200)*0.15));
			}
			else {
				result = 20 + (traf-200)*0.10;
				show_cdn_plan_notes("ProCDN","Default Plan",Math.round((traf-200)*0.15));
			}
			result = Math.round(result);
			$("#traffic_info tr:contains(ProCDN) td:last").html('$' + result);
		},
		
		KeyCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = Math.ceil(traf * 0.04);
			$("#traffic_info tr:contains(KeyCDN) td:last").html('$' + result);
			show_cdn_plan_notes("KeyCDN","Default Plan");
		},
		
		CDNify: function () {
			var traf = $("#traffic_volume").val();
			var result = Math.ceil(traf * 0.06);
			$.each([ [500, 29], [1000, 49], [500, 29], [2000, 95], [5000, 230], [10000, 445] ], function(index) {
				if (traf <=  this[0]) {
					result = this[1];
					if (index < 2 ) show_cdn_plan_notes("CDNify","Plan Developer");
					if (index == 2) show_cdn_plan_notes("CDNify","Plan Start Up");
					if (index > 2 ) show_cdn_plan_notes("CDNify","Plan Agency");
					return false;
				}
			});
			$("#traffic_info tr:contains(CDNify) td:last").html('$' + result);
		},
		
		Akamai: function () {
			var traf = $("#traffic_volume").val();
			var result = Math.ceil(traf * 0.15);
			$.each([ [1000, 100], [2500, 250], [5000, 500], [2000, 95], [10000, 900], [100000, 8000] ], function(index) {
				if (traf <=  this[0]) {
					result = this[1];
					return false;
				}
			});
			$("#traffic_info tr:contains(Akamai) td:last").html('$' + result);
		},
		
		SoftlayerCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = Math.ceil(  ($("#traffProtocolHTTP:checked").val() ? (traf * 0.12) : 0) +  ($("#traffProtocolHTTPS:checked").val() ? (traf * 0.15) : 0) );
			$("#traffic_info tr:contains(Layer) td:last").html('$' + result);
			show_cdn_plan_notes("Layer","Origin Pull Solution");
		},
		
		GoGridCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = 0; 
			var total = 0;
			total = calculate_total();
			var continents = [ {name:'US',price:0.3},{name:'SA',price:0.3},{name:'EU',price:0.3},{name:'AU',price:0.8},{name:'AS',price:0.8} ];
			var note = '', us_cost=0, as_cost=0;
			$.each(continents, function () {
				result += traf * ($('#traff'+this.name).val()) * this.price / total;
				if ($.inArray(this.name, ['US','SA','EU']) != -1) {
					us_cost += (traf * $('#traff'+this.name).val() * this.price) / total;
				}
				if ($.inArray(this.name, ['AS','AU']) != -1) {
					as_cost += (traf * $('#traff'+this.name).val() * this.price) / total;
				}
			});
			note += 'Global $' + Math.ceil(us_cost) + '<br>';
			note += 'Asia+Australia $' + Math.ceil(as_cost)+'';
			result = Math.ceil(result);
			$("#traffic_info tr:contains(GoGrid) td:last").html('$' + result);
			show_cdn_plan_notes("GoGrid",note);
		},
		
		CDN77: function () {
			var traf = $("#traffic_volume").val();
			var result = 0; 
			var  note = '', total = 0;
			total = calculate_total();
			var matrix = [
				{traffic:   30000, prices: [{continents: ['US','EU'], price: 0.049}, {continents: ['AS','AF'], price: 0.125}, {continents: ['SA'], price: 0.185}]},
				{traffic:  100000, prices: [{continents: ['US','EU'], price: 0.045}, {continents: ['AS','AF'], price: 0.120}, {continents: ['SA'], price: 0.160}]},
				{traffic:  400000, prices: [{continents: ['US','EU'], price: 0.030}, {continents: ['AS','AF'], price: 0.100}, {continents: ['SA'], price: 0.135}]},
				{traffic: 1000000, prices: [{continents: ['US','EU'], price: 0.025}, {continents: ['AS','AF'], price: 0.085}, {continents: ['SA'], price: 0.110}]},
				{traffic:      -1, prices: [{continents: ['US','EU'], price: 0.019}, {continents: ['AS','AF'], price: 0.070}, {continents: ['SA'], price: 0.095}]},
			];
			$.each(matrix, function (index) {
				if (traf <= this.traffic || index == matrix.length-1) {
					$.each(this.prices, function (){
						var cprice = this.price;
						var group_money = 0;
						var group_note = '';
						var this_continents = this.continents;
						$.each(this.continents, function (ci){
							result += traf * ($('#traff'+this ).val()) * cprice / total;
							group_money += traf * ($('#traff'+this ).val()) * cprice / total;
							group_note += continents_codes[this] + ((ci < this_continents.length - 1) ? ', ':'');  
						});
						if(group_money > 0)
						note += group_note + ' - $' + Math.ceil(group_money) + '<br>';
					});
					return false;
				}
			});
			show_cdn_plan_notes("CDN77",note);
			result = Math.ceil(result);
			$("#traffic_info tr:contains(CDN77) td:last").html('$' + result);
		},
		
		CloudFront: function () {
			var traf = $("#traffic_volume").val();
			var result = 0; 
			var  note = '', total = 0;
			total = calculate_total();
			var matrix = [
				{traffic:   10000, prices: [{continents:['US','EU'],price: 0.12},{continents:['AS','AU'],price: 0.19},{continents:['SA'],price:0.25},{continents:['JP'],price:0.201},{continents:['IN'],price:0.17}]},
				{traffic:   40000, prices: [{continents:['US','EU'],price: 0.08},{continents:['AS','AU'],price: 0.14},{continents:['SA'],price:0.20},{continents:['JP'],price:0.148},{continents:['IN'],price:0.13}]},
				{traffic:  100000, prices: [{continents:['US','EU'],price: 0.06},{continents:['AS','AU'],price: 0.12},{continents:['SA'],price:0.18},{continents:['JP'],price:0.127},{continents:['IN'],price:0.11}]},
				{traffic:  350000, prices: [{continents:['US','EU'],price: 0.04},{continents:['AS','AU'],price: 0.10},{continents:['SA'],price:0.16},{continents:['JP'],price:0.106},{continents:['IN'],price:0.1}]},
				{traffic:  524000, prices: [{continents:['US','EU'],price: 0.03},{continents:['AS'],price: 0.08},{continents:['SA'],price:0.140},{continents:['AU'],price:0.095},{continents:['JP'],price:0.085},{continents:['IN'],price:0.1}]},
				{traffic: 4000000, prices: [{continents:['US','EU'],price:0.025},{continents:['AS'],price: 0.07},{continents:['SA'],price:0.130},{continents:['AU'],price:0.090},{continents:['JP'],price:0.075},{continents:['IN'],price:0.1}]},
				{traffic:      -1, prices: [{continents:['US','EU'],price: 0.02},{continents:['AS'],price: 0.06},{continents:['SA'],price:0.125},{continents:['AU'],price:0.085},{continents:['JP'],price:0.065},{continents:['IN'],price:0.1}]},
			];               
			$.each(matrix, function (index) {
				if (traf <= this.traffic || index == matrix.length-1) {
					$.each(this.prices, function (){
						var cprice = this.price;
						var group_money = 0;
						var group_note = '';
						var this_continents = this.continents;
						$.each(this.continents, function (ci){
							result += traf * ($('#traff'+this).length > 0 ? $('#traff'+this).val() : 0) * cprice / total;
							group_money += traf * ($('#traff'+this).length > 0 ? $('#traff'+this).val() : 0) * cprice / total;
							group_note += continents_codes[this] + ((ci < this_continents.length - 1) ? ', ':'');  
						});
						if(group_money > 0)
						note += group_note + ' - $' + Math.ceil(group_money) + '<br>';
					});
					return false;
				}
			});
			show_cdn_plan_notes("CloudFront",note);
			result = Math.ceil(result);
			$("#traffic_info tr:contains(CloudFront) td:last").html('$' + result);
		},
		
		Fastly: function () {
			var traf = $("#traffic_volume").val();
			var reqs = $("#inputHttpRequest").val();
			var result = 0; 
			var  note = '', total = 0;
			total = calculate_total();
			var matrix = [
		{traffic:   10000,prices:[{continents:['US','EU'],price: 0.12},{continents:['AU'],price: 0.19}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
		{traffic:   40000,prices:[{continents:['US','EU'],price: 0.08},{continents:['AU'],price: 0.14}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
		{traffic:  100000,prices:[{continents:['US','EU'],price: 0.06},{continents:['AU'],price: 0.12}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
		{traffic:  350000,prices:[{continents:['US','EU'],price: 0.04},{continents:['AU'],price: 0.10}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
		{traffic:  500000,prices:[{continents:['US','EU'],price: 0.03},{continents:['AU'],price:0.095}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
		{traffic: 4000000,prices:[{continents:['US','EU'],price:0.025},{continents:['AU'],price: 0.09}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
		{traffic:      -1,prices:[{continents:['US','EU'],price: 0.02},{continents:['AU'],price:0.085}],requests:[{continents:['US'],price: 0.0075,price_s:0.01},{continents:['AU','EU'],price:0.009,price_s:0.012}]},
			];
			
			$.each(matrix, function (index) {
				if (traf <= this.traffic || index == matrix.length-1) {
					$.each(this.prices, function (){
						var cprice = this.price;
						var group_money = 0;
						var group_note = '';
						var this_continents = this.continents;
						$.each(this.continents, function (ci){
							result += traf * ($('#traff'+this ).val()) * cprice / total ;
							group_money += traf * ($('#traff'+this ).val()) * cprice / total ;
							group_note += continents_codes[this] + ((ci < this_continents.length - 1) ? ', ':'');  
						});
						if(group_money > 0)
						note += group_note + ' - $' + Math.ceil(group_money) + '<br>';
					});
					$.each(this.requests, function (){
						var cprice = this.price;
						var cprice_s = this.price_s;
						$.each(this.continents, function (ci){
							result += ($("#traffProtocolHTTP:checked").val() ? (reqs*($('#traff'+this).val())*cprice/total):0) + ($("#traffProtocolHTTPS:checked").val() ? (reqs*($('#traff'+this).val())*cprice_s/total) : 0);
						});
					});
					return false;
				}
			});
			show_cdn_plan_notes("Fastly",note);
			result = Math.ceil(result);
			$("#traffic_info tr:contains(Fastly) td:last").html('$' + result);
		},
		
		OneHundredTBCDN: function () {
			var traf = $("#traffic_volume").val();
			var result = 0;
			var note = '';
			var rest100 = traf % 100000;
			result += Math.floor( traf / 100000 ) * 2500;
			var rest10 = rest100 % 10000;
			result += Math.floor( rest100 / 10000 ) * 500;
			result += Math.ceil( rest10 / 1000 ) * 75;
			result = Math.ceil(result);
			$("#traffic_info tr:contains(100TB) td:last").html('$' + result);
			show_cdn_plan_notes("100TB","Default Plan");
		},
		
		
	};
if (!Array.min) { Array.min = function( array ){return Math.min.apply( Math, array )} };	
function highlight_cheapest() {
	$('#traffic_info tbody tr.success').removeClass('success');
	var mins = new Array();
	 $('#traffic_info tbody tr td:nth-child(5)').each(function (i){
	 	
	 	mins[i] = $(this).text().replace(/\$/,'');
	
	 });
	var minValue = Array.min(mins );
	
	$('#traffic_info tbody tr td:nth-child(5):contains(\'$'+minValue+'\')').each(function (i){
		if ($(this).text() == ('$'+minValue)) {
			$(this).parent().addClass('success');
		}
	
	});
	
	
}	
function highlight_recommended() {
	$('#traffic_info tr').removeClass('warning');
	$('#traffic_info tr:contains(MaxCDN)').addClass('warning');
}	

function recalculate() {
	$("#traffic_volume").val($("#traffic_volume").val().replace(/\D+/g,''));

	if ($('#traffic_info').find(':animated').length > 0) {
		var to = window.setTimeout(function () {recalculate();}, 300);	
		return;
	}
	if ( $("#traffic_volume").val() >= 0) {
		$.each(plans, function (){
			this();
		});
		$('#traffic_info').sortTable({onCol: 5, keepRelationships: true, sortType: 'numeric', sortDesc:sort_price});
		//sort_price = true;
	}
}
$(document).ready( function(){
	$("input").keyup(function(){
		recalculate();
	});
	$("input").change(function(){
		recalculate();
	});
	//	recalculate();
	
});

