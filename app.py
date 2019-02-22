from flask import Flask, redirect, url_for, request, render_template, jsonify, session
from flask_session import Session
import json
import random
import unidecode

app = Flask(__name__)
app.config.from_object(__name__)
sess = Session()

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'super secret key'
sess.init_app(app)

neededInformation = ['name', 'capital', 'flag']

@app.route('/')
def root():
    with open('countries.json') as json_file:
        rawCountries = json.load(json_file)
        session['undiscoveredCountries'] = []
            
        for country in rawCountries:
            if country['independent']:
                countryCodes = [country['cca2'], country['cca3']]
                name = [country['name']['common'], country['name']['official']] + [name for name in country['altSpellings'] if name not in country['name']]

                for code in countryCodes:
                    if code in name:
                        name.remove(code)

                if 'removedAltSpellings' in country:
                    for spelling in country['removedAltSpellings']:
                        name.remove(spelling)

                if 'addedAltSpellings' in country:
                    name += country['addedAltSpellings']

                flag = 'flags/' + country['cca2'].lower() + '.png'
                session['undiscoveredCountries'].append({'name': name, 'capital': country['capital'], 'flag': flag})

    session['discoveredCountries'] = []
    session['settings'] = {'useName': 'true', 'useCapital': 'true', 'useFlag': 'true'}

    return render_template('index.html')

@app.route('/write')
def write():
    session['selectedCountry'] = session.get('undiscoveredCountries')[random.randint(0, len(session.get('undiscoveredCountries')) - 1)]
    session['usableInputs'] = []

    for setting in session.get('settings'):
        if session.get('settings')[setting] == 'true':
            session['usableInputs'].append(setting[3:].lower())

    rand = random.randint(0, len(session.get('usableInputs')) - 1)
    session['givenInformation'] = session['usableInputs'][rand]

    print('------------------------------------------')
    return jsonify(country=session.get('selectedCountry'), givenInformation=session.get('givenInformation'))

@app.route('/read', methods=['POST', 'GET'])
def read():
    session['inputInformation'] = {}

    for key in neededInformation:
        session['inputInformation'][key] = format(request.form[key]) in [format(value) for value in session.get('selectedCountry')[key]]
    session['inputInformation']['flag'] = session['selectedCountry']['flag']

    if not (False in session.get('inputInformation').values()):
        session['discoveredCountries'].append(session.get('selectedCountry'))
        session['undiscoveredCountries'].remove(session.get('selectedCountry'))
        return jsonify(discoveredCountry=True, discoveredCountries=session['discoveredCountries'])
    else:
        return jsonify(discoveredCountry=False, discoveredCountries=session['discoveredCountries'])

    print('------------------------------------------')
    return jsonify(isCountry=False, discoveredCountries=session['discoveredCountries'])

def format(word):
    return unidecode.unidecode(word.lower()).replace('-', ' ').replace('st.', 'saint').replace('st', 'saint')

@app.route('/updateSettings', methods=['POST'])
def updateSettings():
    session['settings'] = request.form
    print('------------------------------------------')
    return 'test'

if __name__ == '__main__':
    app.run(debug=True)
