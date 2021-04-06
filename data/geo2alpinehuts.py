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
    properties = feature.get('properties', None)
    if properties:
        data['external_id'] = {'osm': properties['@id']}
        data['email'] = chain_get(properties, ['contanct:email', 'email'])
        data['website'] = chain_get(properties, ['contact:website', 'website', 'website2', 'operator:website'])
        data['phone'] = chain_get(properties, ['contact:phone', 'phone', 'telephone'])
        data['mobile'] = chain_get(properties, ['contact:mobile', 'phone:mobile'])
        data['name'] = chain_get(properties, ['name', 'reg_name', 'official_name', 'short_name'])
        data['ele'] = chain_get(properties, ['elevation', 'elev', 'ele'])
        data['beds'] = chain_get(properties, ['beds', 'capacity:beds'])
        # Enhanced data
        data['facilities'] = {}
        data['addr'] = {}
        # Possible properties
        for key in properties.keys():
            # Checking for name in different languages
            if key.startswith('name:'):
                try:
                    data['names'][key[5:]] = properties[key]
                except KeyError:
                    data['names'] = {key[5:]: properties[key]}
            # Facilities
            elif key in ['shower', 'showers', 'toilet', 'internet_access', 'restaurant', 'breakfast', 'diner', 'lunch']:
                data['facilities'][key] = properties[key]
            # Address
            elif key.startswith('addr:'):
                data['addr'][key[5:]] = properties[key]

        """
        for k in properties.keys():
            if k not in new_props:
                print(k)
                new_props.append(k)
        """
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
    with open(at_file_name, 'w') as f:
        json.dump(ahdata, f)

# @TODO make this take infile and outfile as parameter
def main():
    files = ('fr.geojson', 'ch.geojson', 'at.geojson')
    for file_name in files:
        convert_file(file_name)


if __name__ == '__main__':
    main()

