var nameInput = document.getElementById('nameInput')
var capitalInput = document.getElementById('capitalInput');
var selectedFlag = null;

var nameP = document.getElementById('nameP');
var capitalP = document.getElementById('capitalP');
var flagP = document.getElementById('flagP');

var giveName = document.getElementById('giveName');
var giveCapital = document.getElementById('giveCapital');
var giveFlag = document.getElementById('giveFlag');
var needName = document.getElementById('needName');
var needCapital = document.getElementById('needCapital');
var needFlag = document.getElementById('needFlag');

var givenInfo;
var flagSelector = document.getElementById('flagSelector');
var forceUndiscovered = false;

var settings = {
	get givableInfo() {
		return {
			name: giveName.checked,
			capital: giveCapital.checked,
			flag: giveFlag.checked
		};
	},

	get neededInfo() {
		return {
			name: needName.checked,
			capital: needCapital.checked,
			flag: needFlag.checked,
			numberOfFlags: document.getElementById("numerOfFlags").value
		};
	}
}

var currentCountry = null;
document.getElementById("discoveredCountries").innerHTML = "0";

getNewCountry(false);

function checkInputs() {
	var discovered = true;
	console.log(nameInput.value + ', ' + capitalInput.value);
	neededInfo = settings.neededInfo;

	if(givenInfo != 'name' && neededInfo['name']) {
		var names = [];

		for(name of currentCountry.names)
			names.push(formatInput(name));

 		if(names.includes(formatInput(nameInput.value))) {
			nameInput.value = currentCountry.names[0];
			nameInput.readOnly = true;
			nameInput.style.border = '4px solid #01FE55';
		} else
			discovered = false;
			
	}

	if(givenInfo != 'capital' && neededInfo['capital']) {
		var capitals = [];

		for(capital of currentCountry.capitals)
			capitals.push(formatInput(capital));

 		if(capitals.includes(formatInput(capitalInput.value))) {
			capitalInput.value = currentCountry.capitals[0];
			capitalInput.readOnly = true;
			capitalInput.style.border = '4px solid #01FE55';
		} else
			discovered = false;
	}

	var timeout = 250;

	if(givenInfo == 'flag' || !settings.neededInfo.flag) {
		setTimeout(function() {
			if(discovered)
				getNewCountry(true);
		}, timeout);
	} else {
		if(selectedFlag) {
			timeout = (selectedFlag.id == currentCountry.flag)? 250 : 1250;
			console.log(timeout);
			setTimeout(function() {
				if(discovered)
					getNewCountry(selectedFlag.id == currentCountry.flag);
			}, timeout);
		}
	}
}

function getNewCountry(discovered) {
	var givableInfo = []
	for(info in settings.givableInfo)
		if(settings.givableInfo[info])
			givableInfo.push(info);
	givenInfo = givableInfo[random(givableInfo.length)];

	while(flagSelector.firstChild)
		flagSelector.removeChild(flagSelector.firstChild);
	
	flagSelector.style.display = '';

	var request = new XMLHttpRequest();

	request.onload = function() {
		if(request.readyState == 4 && request.status == 200) {
            var json = JSON.parse(request.responseText);
            currentCountry = json.country;

			nameInput.value = "";
			nameInput.placeholder = "";
			nameInput.readOnly = false;
			nameInput.style.border = '';

			capitalInput.value = "";
			capitalInput.placeholder = "";
			capitalInput.readOnly = false;
			capitalInput.style.border = '';

			var flagImage = document.createElement('img');
			flagImage.setAttribute('src', currentCountry.flag);
			flagImage.setAttribute('class', 'flag');
			flagImage.setAttribute('id', 'flagInput');

			switch(givenInfo) {
			case 'name':
				nameInput.value = currentCountry.names[0];
				nameInput.readOnly = true;
				break;
			case 'capital':
				capitalInput.value = currentCountry.capitals[0];
				capitalInput.readOnly = true;
				break;
			case 'flag':
				flagSelector.appendChild(flagImage);
				break;
			}

			if(givenInfo != 'flag') {
				if(settings.neededInfo.flag) {
					json.flags.forEach(function(flag, i) {
						var image = document.createElement('img');
						image.setAttribute('src', flag);
						image.setAttribute('class', 'flag');
						image.setAttribute('onclick', 'selectFlag(this.id)');
						image.setAttribute('id', flag);
						flagSelector.appendChild(image);
					});
				} else {
					flagSelector.appendChild(flagImage);

					if(!document.getElementById('showFlagWhenNotTested').checked)
						flagSelector.style.display = 'none';
				}
			}

            console.log('Current Country: ' + JSON.stringify(currentCountry));
			selectedFlag = null;

			if(json.discoveredCountries.length > 0)
            	document.getElementById("discoveredCountries").innerHTML = getCountriesStr(json.discoveredCountries);
		}
	}

	request.open("POST", "getNewCountry", true);
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    request.send(`numberOfFlags=${settings.neededInfo['numberOfFlags']}&discovered=${discovered && !forceUndiscovered}`);
	forceUndiscovered = false;
}

function idontknowclick() {
	forceUndiscovered = true;

	if(settings.neededInfo['name'])
		nameInput.placeholder = currentCountry['names'][0];

	if(settings.neededInfo['capital'])
		capitalInput.placeholder = currentCountry['capitals'][0];
}

function selectFlag(id) {
	if(!selectedFlag) {	
		selectedFlag = document.getElementById(id);

		if(selectedFlag.getAttribute('id') == currentCountry.flag)
			selectedFlag.style.border = '6px solid #01FE55';
		else {
			selectedFlag.style.border = '6px solid red';
			document.getElementById(currentCountry.flag).style.border = "6px solid #01A1FE";
		}

		checkInputs();
	}
}

function formatInput(input) {
	return removeDiacritics(input).toLowerCase().replace('st', 'saint').replace('.', '').replace('-', ' ').replace(',', '');
}

function random(max) {
	return Math.floor(Math.random() * max);
}

function getCountriesStr(countries) {
    html = countries.length + "\n";

    for(country of countries)
        html += country.names[0] + "\n"

    return html
}
