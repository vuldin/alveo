/**@license
 * {{project}} <{{homepage}}>
 * Copyright (C) {{year}} {{author}}
 * {{license}}
 */
var encoding='utf-8',
    file='web/index.html',
    fs=require('fs'),
    hb=require('Handlebars');
hb.registerHelper('url',function(items){
    items=items.map(function(val){
        return val.type;
    });
    return items.join(', ');
});
var distContent = _fs.readFileSync(file, encoding);
var template = hb.compile(distContent);

//reuse package.json data and add build date
var data=JSON.parse(fs.readFileSync('package.json',encoding));
data.hostname=(;

_fs.writeFileSync(file, template(data), encoding);