import json, sys, re

def esc(s):
    return (str(s).replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('"', '&quot;'))

def prop_xml(p):
    t = p.get('type', 'string')
    if t == 'string':
        return '    <property name="%s" value="%s"/>' % (esc(p['name']), esc(p['value']))
    if t == 'bool':
        v = 'true' if p['value'] else 'false'
        return '    <property name="%s" type="bool" value="%s"/>' % (esc(p['name']), v)
    if t == 'int':
        return '    <property name="%s" type="int" value="%s"/>' % (esc(p['name']), p['value'])
    if t == 'float':
        return '    <property name="%s" type="float" value="%s"/>' % (esc(p['name']), p['value'])
    return '    <property name="%s" type="%s" value="%s"/>' % (esc(p['name']), t, esc(p['value']))

def convert(tmj_path, tmx_path_existing, tmx_path_out):
    tmj = json.load(open(tmj_path, encoding='utf-8'))
    existing = open(tmx_path_existing, encoding='utf-8').read()
    idx = existing.find('<layer ')
    header = existing[:idx]
    header = re.sub(r'nextlayerid="\d+"', 'nextlayerid="%d"' % tmj.get('nextlayerid', 99), header)
    header = re.sub(r'nextobjectid="\d+"', 'nextobjectid="%d"' % tmj.get('nextobjectid', 999), header)

    out = [header.rstrip('\n')]
    for layer in tmj['layers']:
        if layer['type'] == 'tilelayer':
            out.append(' <layer id="%d" name="%s" width="%d" height="%d">' % (
                layer['id'], esc(layer['name']), layer['width'], layer['height']))
            out.append('  <data encoding="csv">')
            w = layer['width']
            data = layer['data']
            rows = []
            for y in range(layer['height']):
                row = data[y*w:(y+1)*w]
                rows.append(','.join(str(v) for v in row))
            out.append(',\n'.join(rows))
            out.append('</data>')
            out.append(' </layer>')
        elif layer['type'] == 'objectgroup':
            out.append(' <objectgroup id="%d" name="%s">' % (layer['id'], esc(layer['name'])))
            for o in layer.get('objects', []):
                attrs = ' id="%d"' % o['id']
                if o.get('name'):
                    attrs += ' name="%s"' % esc(o['name'])
                if o.get('type'):
                    attrs += ' type="%s"' % esc(o['type'])
                attrs += ' x="%s" y="%s"' % (o['x'], o['y'])
                if o.get('width'):
                    attrs += ' width="%s"' % o['width']
                if o.get('height'):
                    attrs += ' height="%s"' % o['height']
                props = o.get('properties', [])
                if props:
                    out.append('  <object%s>' % attrs)
                    out.append('   <properties>')
                    for p in props:
                        out.append(prop_xml(p))
                    out.append('   </properties>')
                    if o.get('point'):
                        out.append('   <point/>')
                    out.append('  </object>')
                else:
                    if o.get('point'):
                        out.append('  <object%s>' % attrs)
                        out.append('   <point/>')
                        out.append('  </object>')
                    else:
                        out.append('  <object%s/>' % attrs)
            out.append(' </objectgroup>')
    out.append('</map>')
    out.append('')

    open(tmx_path_out, 'w', encoding='utf-8').write('\n'.join(out))

if __name__ == '__main__':
    tmj_path, tmx_existing, tmx_out = sys.argv[1], sys.argv[2], sys.argv[3]
    convert(tmj_path, tmx_existing, tmx_out)
    print('scritto', tmx_out)
