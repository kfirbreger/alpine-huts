"""
Converts geojson data into alpine huts json.
"""
import json


def convert_feature(feature):
    data = {}
    properties = feature.get('properties', None)
    if properties:
        # Basic properties
        data['name'] = properties.get('name', None)
        data['website'] = properties.get('website', None)
        data['tel'] = properties.get('phone', None)
        # Extended properties
        data['extended'] = {

    # Adding the geolocation. For now derived from middle
    data['coordinates'] = feature['geometry']['coordinates']


def convert_file(file_name):
    at_file_name = '.'.join([(file_name.split('.'))[0], 'json'])
    print(at_file_name)
    ahdata = []
    with open(file_name, 'r') as f:
        geodata = json.load(f)
        geodata = geodata['features']
        for feature in geodata:
            ahdata.append(convert_feature(feature))
        #print(geodata)

# @TODO make this take infile and outfile as parameter
def main():
    files = ('fr.geojson', 'ch.geojson', 'at.geojson')
    for file_name in files:
        convert_file(file_name)


if __name__ == '__main__':
    main()

