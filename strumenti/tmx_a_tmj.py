import sys, re
import xml.etree.ElementTree as ET
import json

def parse_props(el):
    props = []
    pel = el.find('properties')
    if pel is None:
        return props
    for p in pel.findall('property'):
        t = p.get('type', 'string')
        v = p.get('value')
        if t == 'bool':
            v = (v == 'true')
        elif t == 'int':
            v = int(v)
        elif t == 'float':
            v = float(v)
        props.append({'name': p.get('name'), 'type': t, 'value': v})
    return props

def num(s):
    f = float(s)
    return int(f) if f == int(f) else f

def convert(tmx_path, tmj_path):
    tree = ET.parse(tmx_path)
    root = tree.getroot()
    layers = []
    next_layer_id = 1
    next_object_id = 1
    for child in root:
        if child.tag == 'layer':
            lid = int(child.get('id'))
            next_layer_id = max(next_layer_id, lid + 1)
            data_el = child.find('data')
            raw = data_el.text.strip()
            data = [int(x) for x in raw.replace('\n', '').split(',') if x.strip() != '']
            layers.append({
                'data': data,
                'height': int(child.get('height')),
                'id': lid,
                'name': child.get('name'),
                'opacity': 1,
                'type': 'tilelayer',
                'visible': True,
                'width': int(child.get('width')),
                'x': 0, 'y': 0,
            })
        elif child.tag == 'objectgroup':
            lid = int(child.get('id'))
            next_layer_id = max(next_layer_id, lid + 1)
            objs = []
            for o in child.findall('object'):
                oid = int(o.get('id'))
                next_object_id = max(next_object_id, oid + 1)
                obj = {'id': oid}
                if o.get('name'): obj['name'] = o.get('name')
                else: obj['name'] = ''
                obj['opacity'] = 1
                if o.find('point') is not None:
                    obj['point'] = True
                props = parse_props(o)
                if props:
                    obj['properties'] = props
                obj['rotation'] = 0
                obj['type'] = o.get('type', '')
                obj['visible'] = True
                obj['width'] = num(o.get('width', '0'))
                obj['height'] = num(o.get('height', '0'))
                obj['x'] = num(o.get('x', '0'))
                obj['y'] = num(o.get('y', '0'))
                objs.append(obj)
            layers.append({
                'draworder': 'topdown',
                'id': lid,
                'name': child.get('name'),
                'objects': objs,
                'opacity': 1,
                'type': 'objectgroup',
                'visible': True,
                'x': 0, 'y': 0,
            })
    tilesets = []
    for ts in root.findall('tileset'):
        tilesets.append({'firstgid': int(ts.get('firstgid')), 'source': ts.get('source')})
    out = {
        'compressionlevel': -1,
        'height': int(root.get('height')),
        'infinite': False,
        'layers': layers,
        'nextlayerid': next_layer_id,
        'nextobjectid': next_object_id,
        'orientation': root.get('orientation'),
        'renderorder': root.get('renderorder'),
        'tiledversion': root.get('tiledversion'),
        'tileheight': int(root.get('tileheight')),
        'tilesets': tilesets,
        'tilewidth': int(root.get('tilewidth')),
        'type': 'map',
        'version': root.get('version'),
        'width': int(root.get('width')),
    }
    with open(tmj_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    print('scritto', tmj_path)

if __name__ == '__main__':
    convert(sys.argv[1], sys.argv[2])
