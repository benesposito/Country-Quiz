var nameInput = document.getElementById('nameInput')
var capitalInput = document.getElementById('capitalInput');
var flagInput = '';

var nameP = document.getElementById('nameP');
var capitalP = document.getElementById('capitalP');
var flagP = document.getElementById('flagP');

var useName = document.getElementById('useName');
var useCapital = document.getElementById('useCapital');
var useFlag = document.getElementById('useFlag');

var selectedCountry;
getNextCountry();
var neededInformation = ['name', 'capital'];
document.getElementById("discoveredCountries").innerHTML = "0";

function submitForm() {
	var request = new XMLHttpRequest();
	request.open("POST", "read", true);
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	var params = `name=${nameInput.value}&capital=${capitalInput.value}&flag=${flagInput}`;
	request.send(params);
	request.onload = function() {
		var json = JSON.parse(request.responseText);
		
		if(json.discoveredCountry) {
			nameInput.value = "";
			capitalInput.value = "";

			document.getElementById("discoveredCountries").innerHTML = getCountriesStr(json.discoveredCountries);
			getNextCountry();
		}
	}
}

function getNextCountry() {
	var request = new XMLHttpRequest();

	request.onreadystatechange = function() {
		if(request.readyState == 4 && request.status == 200) {
			var json = JSON.parse(request.responseText);
			selectedCountry = json.country;
			console.log(selectedCountry);

			for(info of neededInformation) {
				var element = document.getElementById(info + 'Input');
				element.value = "";
				element.placeholder = "";
			}
			
			if(json.givenInformation == 'name') {
				nameInput.value = selectedCountry.name[0];
				nameInput.readOnly = true;
				capitalInput.readOnly = false;
				flagInput.setAttribute('src', '');
			} else if(json.givenInformation == 'capital'){
				capitalInput.value = selectedCountry.capital;
				capitalInput.readOnly = true;
				nameInput.readOnly = false;
				flagInput.setAttribute('src', '');
			} else if(json.givenInformation == 'flag') {
				flagInput.setAttribute('src', '/static/' + selectedCountry.flag);
				nameInput.readOnly = false;
				capitalInput.readOnly = false;
			}
		}
	}

	request.open("GET", "write", true);
	request.send();
}

function getCountriesStr(countries) {
	html = countries.length + "\n";

	for(country of countries)
		html += country.name[0] + "\n"

	return html
}

function idontknowclick() {
	for(info of neededInformation) {
		var element = document.getElementById(info + 'Input');
		element.placeholder = selectedCountry[info][0];
	}
}

function updateSettings() {
	var request = new XMLHttpRequest();
	request.open("POST", "updateSettings", true);
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded");

	var params = `useName=${useName.checked}&useCapital=${useCapital.checked}&useFlag=${useFlag.checked}`;
	console.log(params);
	request.send(params);
	request.onload = function() {
		getNextCountry();
		console.log('sent!');
	}

	if(useName.checked) {
		nameP.style.display = "inline";
		nameInput.style.display = "inline";
	} else {
		nameP.style.display = "none";
		nameInput.style.display = "none";
	}

	if(useCapital.checked) {
		capitalP.style.display = "inline";
		capitalInput.style.display = "inline";
	} else {
		capitalP.style.display = "none";
		capitalInput.style.display = "none";
	}

	if(useFlag.checked) {
		flagP.style.display = "inline";
		flagInput.style.display = "inline";
	} else {
		flagP.style.display = "none";
		flagInput.style.display = "none";
	}
}
