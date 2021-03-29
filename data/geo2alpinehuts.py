"""
Converts geojson data into alpine huts json.
"""
import json

new_props = []


def chain_get(prop, chain):
    """
    Recustivly go through the chain, returning the first value
    encountered
    """
    data = prop.get(chain[0], None)
    if not data:
        if len(chain) > 1:
            data = chain_get(prop, chain [1:])
    return data

def convert_feature(feature):
    data = {}
    main_properties = []
    properties = feature.get('properties', None)
    if properties:
        data['email'] = chain_get(properties, ['contanct:email', 'email'])
        data['website'] = chain_get(properties, ['contact:website', 'website', 'website2', 'operator:website'])
        data['name'] = chain_get(properties, ['name', 'reg_name', 'official_name', 'short_name'])
        """
        data['name'] = properties.get('name', None)
        # Checking for name in different languages
        """
        for prop in main_properties:
            data[prop] = properties.get(prop, None)
        # Extended properties
        #data['extended'] = {
        for k in properties.keys():
            if k not in main_properties and k not in new_props:
                print(k)
                new_props.append(k)

    # Adding the geolocation. For now derived from middle
    data['coordinates'] = feature['geometry']['coordinates']
    return data


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

