class markdown{
    constructor(){
        this.styles = {
            boldItalic: {
                patt: '\\*{3}',
                tag : '<b><i>',
            },
            bold: {
                patt: '\\*{2}',
                tag : '<b',
            },
            italic: {
                patt: '\\*',
                tag : '<i>',
            },
            underline: {
                patt: '\\_{2}',
                tag : '<u>',
            },
            strike: {
                patt: '\\~{2}',
                tag:'<strike>',
            },
            subscript: {
                patt: '\\_',
                tag : '<sub>',
            },
            subperscript: {
                patt: '\\^',
                tag : '<sup>',
            },
            blockquote: {
                patt: '\\`{3}',
                tag : '<blockquote>',
            },
            image: {
                patt: '\\!\\[(.*)\\]\\((.*)\\)',
                tpl: '<img src="#part2#" alt="#part1#" style="#part3#" />&nbsp;',
            },
            anchor: {
                patt: '\\[(.*)\\]\\((.*)\\)',
                tpl: '<a href="#part2#" target="_blank">#part1#</a>',
            },
            h5: {
                patt: '\\#{5} ([^<]+)',
                tpl: '<h5>#part1#</h5>',
                open: true,
            },
            h4: {
                patt: '\\#{4} ([^<]+)',
                tpl: '<h4>#part1#</h4><',
                open: true,
            },
            h3: {
                patt: '\\#{3} ([^<]+)',
                tpl: '<h3>#part1#</h3>',
                open: true,
            },
            h2: {
                patt: '\\#{2} ([^<]+)',
                tag: '<h2>',
                open: true,
            },
            h1: {
                patt: '\\#{1} ([^<]+)',
                tag: '<h1>',
                open: true,
            },
        }    
    }
    makeHtml(text){
        text = text
            .replace(/\n/g,' <br>')
            .replace(/\s+/,' ')
            .replace(/\-{3}/g, '<hr/>');
        var pairs;
        for(var i in this.styles){
            var pattern = new RegExp(this.styles[i].patt, 'ig');
            var fragments = text.match(pattern);
            if(fragments){
                if(this.styles[i].tag){
                    if(this.styles[i].open){
                        for(var j=0; j< fragments.length; j++){
                            const repl = fragments[j].replace(new RegExp(this.styles[i].patt.split(' ')[0]+' '), this.styles[i].tag).trim()+this.styles[i].tag.replace('<','</')
                            text = text.replace(fragments[j], repl)
                        }
                    }else{
                        pairs = Math.floor(fragments.length/2);
                        if(pairs>0){
                            for(var j=0; j< pairs; j++){
                                text = text.replace(new RegExp(this.styles[i].patt), this.styles[i].tag)
                                text = text.replace(new RegExp(this.styles[i].patt), this.styles[i].tag.replace(/</g,'</'))
                            }
                        }
                    }
                }else{
                    for(var j = 0; j<fragments.length; j++){
                        const part = fragments[j].replace('!','').replace('[','').trim(')').split('](');
                        const subpart = part[0].split('|')
                        const repl = this.styles[i].tpl.replace('#part1#', subpart[0]).replace('#part2#',part[1]).replace('#part3#', subpart[1]??'');
                        text = text.replace(fragments[j], repl);
                    }
                }
            }
        }
                
        var lines = text.split('<br>')
        var pre, opt = [], code = false;
        for(var i in lines){
            pre = lines[i].split(' ');
            opt[i] = false;
            if(!pre[0]) {
                if(opt[i-1]) lines[i] = '</ul>';
                continue;
            }
            if(opt[i-1] && pre[0]!='-'){
                lines[i] = '</ul>'+lines[i];
            }
            switch(pre[0]){
                case '-' : lines[i] = '<li>'+lines[i].replace('- ','')+'</li>';
                    opt[i] = true;
                    if(opt[i-1]==false) lines[i] = '<ul>'+lines[i];
                    break;
                default :
                    lines[i] ='<p>'+lines[i]+'</p>'; break;
            }
        }
        text = lines.join('');
        return text.replace(/\|/g,'');
    }
}