import json

with open('countries.json') as json_file:
    countries = json.load(json_file)
    independentCountries = []
        
    for country in countries:
        if country['independent']:
            names = [country['name']['common'], country['name']['official']] + country['altSpellings']
            independentCountries.append({'names': names, 'capital': country['capital']})

print([a['names'] for a in independentCountries])
