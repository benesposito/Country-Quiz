var nameInput = document.getElementById('nameInput')
var capitalInput = document.getElementById('capitalInput');
var selectedFlag = null;

var nameP = document.getElementById('nameP');
var capitalP = document.getElementById('capitalP');
var flagP = document.getElementById('flagP');

var testName = document.getElementById('testName');
var testCapital = document.getElementById('testCapital');
var testFlag = document.getElementById('testFlag');
var needName = document.getElementById('needName');
var needCapital = document.getElementById('needCapital');
var needFlag = document.getElementById('needFlag');

var givenInfo;
var flagSelector = document.getElementById('flagSelector');
var forceUndiscovered = false;

var settings = {
	get testableInfo() {
		return {
			name: testName.checked,
			capital: testCapital.checked,
			flag: testFlag.checked
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
			return;
			
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
			return;
	}

	if(givenInfo != 'flag') {
		if(selectedFlag) {
			setTimeout(function() {
				getNewCountry(selectedFlag.src == currentCountry.flag);
			}, 250);
		}
	} else {
		setTimeout(function() {
			getNewCountry(true);
		}, 5000);
	}

}

function getNewCountry(discovered) {
	var testableInfo = []
	for(info in settings.testableInfo)
		if(settings.testableInfo[info])
			testableInfo.push(info);
	givenInfo = testableInfo[random(testableInfo.length)];

	while(flagSelector.firstChild)
		flagSelector.removeChild(flagSelector.firstChild);

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
				var image = document.createElement('img');
				image.setAttribute('src', currentCountry.flag);
				image.setAttribute('class', 'flag');
				image.setAttribute('id', 'flagInput');
				flagSelector.appendChild(image);
			}

			if(givenInfo != 'flag') {
				json.flags.forEach(function(flag, i) {
					var image = document.createElement('img');
					image.setAttribute('src', flag);
					image.setAttribute('class', 'flag');
					image.setAttribute('onclick', 'selectFlag(this.id)');
					image.setAttribute('id', flag);
					flagSelector.appendChild(image);
				});
			}

            console.log('Current Country: ' + JSON.stringify(currentCountry));
			selectedFlag = null;
		}
	}

	request.open("POST", "getNewCountry", true);
	request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    request.send(`numberOfFlags=${settings.neededInfo['numberOfFlags']}&discovered=${discovered && !forceUndiscovered}`);
	console.log(discovered && !forceUndiscovered);
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
	return removeDiacritics(input).toLowerCase().replace('st', 'saint').replace('st.', 'saint');
}

function random(max) {
	return Math.floor(Math.random() * max);
}
