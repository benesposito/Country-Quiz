from flask import Flask, redirect, url_for, request, render_template, jsonify, session
from flask_session import Session
import json
import random
import unidecode
import os

app = Flask(__name__)
app.config.from_object(__name__)
sess = Session()

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'super secret key'
sess.init_app(app)

@app.route('/')
def root():
    with open('jsons/countries.json') as json_file:
        rawCountries = json.load(json_file)
        session['undiscoveredCountries'] = []
        
        for country in rawCountries:
            if country['independent']:
                countryCodes = [country['cca2'], country['cca3']]
                names = [country['name']['common'], country['name']['official']] + [name for name in country['altSpellings'] if name not in country['name']]

                for code in countryCodes:
                    if code in names:
                        names.remove(code)

                if 'removedSpellings' in country:
                    print(names)
                    print(country['removedSpellings'])
                    for spelling in country['removedSpellings']:
                        names.remove(spelling)

                if 'addedSpellings' in country:
                    names += country['addedAltSpellings']

                flag = 'static/flags/' + country['cca2'].lower() + '.png'
                session['undiscoveredCountries'].append({'names': names, 'capitals': country['capital'], 'flag': flag})

    session['discoveredCountries'] = []
    session['settings'] = {'useName': 'true', 'useCapital': 'true', 'useFlag': 'true'}

    return render_template('index.html')

@app.route('/getNewCountry', methods=['POST'])
def getNewCountry():
    if request.form['discovered'] == 'true' and session.get('currentCountry') != None:
        session.get('discoveredCountries').append(session.get('currentCountry'))
        session.get('undiscoveredCountries').remove(session.get('currentCountry'))

    session['currentCountry'] = session.get('undiscoveredCountries')[random.randint(0, len(session.get('undiscoveredCountries')) - 1)]

    print(session.get('currentCountry'))
    flags = []

    walk = os.walk('./static/flags/')

    for a, b, c in walk:
        filenames = c

    for i in range(int(request.form['numberOfFlags']) - 1):
        filename = filenames.pop(random.randint(0, len(filenames) - 1))

        if 'static/flags/' + filename == session.get('currentCountry')['flag']:
            filename = filenames.pop(random.randint(0, len(filenames) - 1))

        flags.append('static/flags/' + filename)

    flags.insert(random.randint(0, len(flags)), session.get('currentCountry')['flag'])

    return jsonify(country=session.get('currentCountry'), flags=flags, discoveredCountries=session.get('discoveredCountries'))
