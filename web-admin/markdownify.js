class markdown{
    constructor(){
        this.styles = {
            boldItalic: {
                patt: '\\*\\*\\*(.*)\\*\\*\\*',
                templ : '<b><i>#part1#</i></b>',
            },
            bold: {
                patt: '\\*\\*(.*)\\*\\*',
                templ : '<b>#part1#</b>',
            },
            italic: {
                patt: '\\*(.*)\\*',
                templ : '<i>#part1#</i>',
            },
            underline: {
                patt: '__(.*)__',
                templ : '<u>#part1#</u>',
            },
            strike: {
                patt: '~~(.*)~~',
                templ : '<strike>#part1#</strike>',
            },
            subscript: {
                patt: '_(.*)_',
                templ : '<sub>#part1#</sub>',
            },
            subperscript: {
                patt: '\\^(.*)\\^',
                templ : '<sup>#part1#</sup>',
            },
            blockquote: {
                patt: '\\`\\`\\`(.*)\\`\\`\\`',
                templ : '<blockquote>#part1#</blockquote>',
            },
            image: {
                patt: '\\!\\[(.*)\\]\\((.*)\\)',
                templ: '<img src="#part2#" alt="#part1#" style="#part3#" />',
            },
            anchor: {
                patt: '\\[(.*)\\]\\((.*)\\)',
                templ: '<a href="#part2#" target="_blank">#part1#</a>',
            },
            // h1: {
            //     patt: '# (.*)<br\\/>',
            //     templ: '<h1>#part1#</h1><br/>',
            // },
            // h2: {
            //     patt: '## (.*)<br\\/>',
            //     templ: '<h2>#part1#</h2><br/>',
            // },
            // h3: {
            //     patt: '### (.*)<',
            //     templ: '<h3>#part1#</h3><',
            // },
            // h4: {
            //     patt: '## (.*)<',
            //     templ: '<h4>#part1#</h4><',
            // },
            // h5: {
            //     patt: '## (.*)<',
            //     templ: '<h5>#part1#</h5><',
            // },
        }    
    }
    makeHtml(text){
        text = text.replace(/\n/g,'<br/>');
        for(var i in this.styles){
            var pattern = new RegExp(this.styles[i].patt);
            var fragments = text.match(pattern);
            if(fragments){
                for(var j = 0; j<fragments.length; j++){
                    this.styles[i].templ = this.styles[i].templ.replace('#part'+(j)+'#', fragments[j])
                }
                text = text.replace(fragments[0], this.styles[i].templ);
            }
        }
                
        var lines = text.split('<br/>')
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
                case '#' : lines[i] = '<h1>'+lines[i].replace('# ','')+'</h1>'; break;
                case '##' : lines[i] = '<h2>'+lines[i].replace('## ','')+'</h2>'; break;
                case '###' : lines[i] = '<h3>'+lines[i].replace('### ','')+'</h3>'; break;
                case '####' : lines[i] = '<h4>'+lines[i].replace('#### ','')+'</h4>'; break;
                case '#####' : lines[i] = '<h5>'+lines[i].replace('##### ','')+'</h5>'; break;
                case '-' : lines[i] = '<li>'+lines[i].replace('- ','')+'</li>';
                    opt[i] = true;
                    if(opt[i-1]==false) lines[i] = '<ul>'+lines[i];
                    break;
                case '---' :
                    lines[i] = lines[i].replace('---', '<hr/>');
                    break;
                default :
                    if(code){
                        lines[i] = '&nbsp;&nbsp;&nbsp;&nbsp;'+lines[i];    
                    } 
                    lines[i] ='<p>'+lines[i]+'</p>'; break;
            }
        }
        text = lines.join('');
        return text;
    }
}