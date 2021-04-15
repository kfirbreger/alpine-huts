import geojson


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

def create_ah_feature(ext_feature):
    props = {}
    ext_props = ext_feature.get('properties', None)
    if ext_props:
        props['name'] = chain_get(ext_props, ['name', 'reg_name', 'official_name', 'short_name'])
        if props['name'] is None:
            return None
        props['external_id'] = {'osm': ext_feature['id']}
        props['email'] = chain_get(ext_props, ['contanct:email', 'email'])
        props['website'] = chain_get(ext_props, ['contact:website', 'website', 'website2', 'operator:website'])
        props['phone'] = chain_get(ext_props, ['contact:phone', 'phone', 'telephone'])
        props['mobile'] = chain_get(ext_props, ['contact:mobile', 'phone:mobile'])
        props['elev'] = chain_get(ext_props, ['elevation', 'elev', 'ele'])
        props['beds'] = chain_get(ext_props, ['beds', 'capacity:beds'])
        # Enhanced props
        props['facilities'] = {}
        props['addr'] = {}
        # Possible ext_props
        for key in ext_props.keys():
            # Checking for name in different languages
            if key.startswith('name:'):
                try:
                    props['names'][key[5:]] = ext_props[key]
                except KeyError:
                    props['names'] = {key[5:]: ext_props[key]}
            # Facilities
            elif key in ['shower', 'showers', 'toilet', 'internet_access', 'restaurant', 'breakfast', 'diner', 'lunch']:
                props['facilities'][key] = ext_props[key]
            # Address
            elif key.startswith('addr:'):
                props['addr'][key[5:]] = ext_props[key]
        # Adding osm as the source
        props['sources'] = ['osm']
        # Removing empty fields
        for key, value in list(props.items()):
            if value is None or value == {}:
                del props[key]
    ah_id = ext_feature['id']  # @TODO make a better id
    ah_feature = geojson.Feature(geometry=ext_feature.geometry, properties=props, id=ah_id)
    return ah_feature

def standardize_file(file_name):
    # A filename is of the format source-country.geojson
    # Where source is always 3 letters
    ah_filename = file_name[4:]
    ah_data = []
    with open(file_name, 'r') as f:
        geodata = geojson.load(f)
        for feature in geodata['features']:
            ah_feature = create_ah_feature(feature)
            if ah_feature is not None:
                ah_data.append(ah_feature)

    ah_fc = geojson.FeatureCollection(ah_data)
    with open(ah_filename, 'w') as f:
        geojson.dump(ah_fc, f)
    print(file_name, len(ah_data))
    return ah_data


def main():
    files = ('osm-fr.geojson', 'osm-at.geojson', 'osm-ch.geojson')
    all_data = []
    for file_name in files:
        all_data.extend(standardize_file(file_name))
    # Removing double entries
    clean_data = []
    doub = 0
    for item in all_data:
        if item not in clean_data:
            clean_data.append(item)
        else:
            doub += 1
    print("dup:", doub)
    ah_fc = geojson.FeatureCollection(clean_data)
    print('all', len(clean_data))
    with open('alpen.geojson', 'w') as f:
        geojson.dump(ah_fc, f)


if __name__ == '__main__':
    main()

