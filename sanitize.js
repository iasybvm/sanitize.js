'use strict';
/**
 * Most codes in this file is stolen from angular-sanitize.js
 * Please referer http://angularjs.org for more information
 * This file lisenced MIT
 */

(function(window) {
    var   SURROGATE_PAIR_REGEXP = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    var   NON_ALPHANUMERIC_REGEXP = /([^\#-~ |!])/g;
    var   HREF_REGEXP = /^\s*(https?|ftp|mailto|tel|file):/;
    var   IMAGE_REGEXP = /^\s*((https?|ftp|file|blob):|data:image\/)/;
    var   voidElements = toMap("area,br,col,hr,img,wbr");
    var   optionalEndTagBlockElements = toMap("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thread,tr");
    var   optionalEndTagInlineElements = toMap("rp,rt");
    var   optionalEndTagElements = extend({}, optionalEndTagInlineElements, optionalEndTagBlockElements);
    var   blockElements = extend({}, optionalEndTagBlockElements, toMap("address,article," +
                                                                        "aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5," +
                                                                        "h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul"));
    var   inlineElements = extend({}, optionalEndTagInlineElements, toMap("a,abbr,acronym,b," +
                                                                          "bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s," +
                                                                          "samp,small,span,strike,strong,sub,sup,time,tt,u,var"));
    var   svgElements = toMap("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph," +
                              "hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline," +
                              "radialGradient,rect,stop,svg,switch,text,title,tspan");
    var   blockedElements = toMap("script,style");
    var   validElements = extend({}, voidElements, blockElements, inlineElements, optionalEndTagElements);
    var   uriAttrs = toMap("background,cite,href,longdesc,src,xlink;href");
    var   htmlAttrs = toMap('abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,' +
                            'color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,' +
                            'ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,' +
                            'scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,' +
                            'valign,value,vspace,width');
    var   svgAttrs = toMap('accent-height,accumulate,additive,alphabetic,arabic-form,ascent,' +
                           'baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,' +
                           'cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,' +
                           'font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,' +
                           'height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,' +
                           'marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,' +
                           'max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,' +
                           'path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,' +
                           'requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,' +
                           'stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,' +
                           'stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,' +
                           'stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,' +
                           'underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,' +
                           'width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,' +
                           'xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan', true);
    var   validAttrs = extend({}, uriAttrs, svgAttrs, htmlAttrs);
    var   old_valid = validElements;
    var   inert;


    console.log(voidElements);
    function toMap(str, lowercaseKeys) {
        var   i, obj, items;

        obj = {};
        items = str.split(',');

        for (i = 0; i < items.length; i++) {
            obj[lowercaseKeys ? items[i].toLowerCase() : items[i]] = true;
        }

        return obj;
    }

    function extend(obj1) {
        var   i, obj2, key;

        for (i = 1; i < arguments.length; i++) {
            obj2 = arguments[i];
            for (key in obj2) {
                obj1[key] = obj2[key];
            }
        }

        return obj1;
    }

    function attrToMap(attrs) {
        var   map, i, attr;

        map = {};

        for (i = 0; i < attrs.length; i++) {
            attr = attrs[i];
            map[attr.name] = attr.value;
        }

        return map;
    }

    function encodeEntities(value) {
        var   hi, low;

        value = value.replace(/&/g, '&amp;').
            replace(SURROGATE_PAIR_REGEXP, function(v) {
            hi = v.charCodeAt(0);
            low = v.charCodeAt(1);
            return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
        }).
            replace(NON_ALPHANUMERIC_REGEXP, function(v) {
            return '&#' + v.charCodeAt(0) + ';';
        }).
            replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return value;
    }

    function stripCustomNsAttrs(node) {
        var   i, attrs, len, name, next;

        if (node.nodeType === window.Node.ELEMENT_NODE) {
            attrs = node.attributes;

            for (i = 0, len = attrs.length; i < len; i++) {
                node = attrs[i];
                name = node.name.toLowerCase();

                if (name === 'xmlns:ns1' || name.lastIndexOf('ns1:', 0) === 0) {
                    node.removeAttributeNode(node);
                    i--;
                    len--;
                }
            }
        }

        next = node.firstChild;
        if (next) {
            stripCustomNsAttrs(next);
        }

        next = node.nextSibling;
        if (next) {
            stripCustomNsAttrs(next);
        }
    }

    function create_inert() {
        var   inertBodyElement, doc, docElement, bodyElements, html;

        if (window.document && window.document.implementation) {
            doc = window.document.implementation.createHTMLDocument("inert");

        } else {
            throw new Error("Create inert html document failed");
        }

        docElement = doc.documentElement || doc.getDocumentElement();
        bodyElements = docElement.getElementsByTagName("body");

        if (bodyElements.length === 1) {
            inert = bodyElements[0];

        } else {
            html = doc.createElement('html');
            inert = doc.createElement("body");
            html.append(inert);
            doc.appendChild(html);
        }

        return inert;
    }



    function parser(html, handler) {
        var   inert, attempts, node, next;


        if (html === null || html === undefined) {
            html = '';

        } else if (typeof html !== 'string') {
            html = '' + html;
        }

        inert = create_inert();
        inert.innerHTML = html;

        // mXSS protection
        attempts = 5;    //// 为什么是5？有什么特殊含义吗？不明白
        do {
            if (attempts-- === 0) {
                throw new Error("sanitize failed,  the input is unstable");
            }

            // strip custom-namespaced attributes on IE<=11
            if (window.document.documentMode) {
                stripCustomNsAttrs(inert);
            }

            html = inert.innerHTML;   // trigger mXSS
            inert.innerHTML = html;

        } while (html !== inert.innerHTML);

        node = inert.firstChild;
        while (node) {

            if (node.nodeType == 1) {
                handler.start(node.nodeName.toLowerCase(), attrToMap(node.attributes));
            } else if (node.nodeType == 3) {
                handler.chars(node.textContent);
            }

            next = node.firstChild;
            if (!next) {
                if (node.nodeType == 1) {
                    handler.end(node.nodeName.toLowerCase());
                }
                next = node.nextSibling;
                if (!next) {
                    while (next == null) {
                        node = node.parentNode;
                        if (node == inert) {
                            break;
                        }
                        next = node.nextSibling;
                        if (node.nodeType == 1) {
                            handler.end(node.nodeName.toLowerCase());
                        }
                    }
                }
            }
            node = next;
        }

        while (!!(node = inert.firstChild)) {
            inert.removeChild(node);
        }
    }

    function handler(buf, uriValidator) {
        var   ignore, out, i, key, value, isImage;

        function start(tag, attrs) {
            tag = tag.toLowerCase();

            if (ignore && blockedElements[tag]) {
                ignore = tag;
            }

            if (!ignore && validElements[tag] === true) {
                buf.push('<');
                buf.push(tag);

                for (i = 0; i < attrs.length; i++) {
                    key = attrs[i].name.toLowerCase();
                    value = attrs[i].value;
                    isImage = (tag === 'img' && key === 'src') || (key === 'background');

                    if (validAttrs[key] === true && (uriAttrs[key] !== true || uriValidator(value, isImage))) {
                        buf.push(" " + key + '="' + encodeEntities(value) + '"');
                    }
                };
                buf.push('>');
            }
        }

        function end(tag) {
            console.log(tag);
            console.log(voidElements);
            tag = tag.toLowerCase();
            if (!ignore && validElements[tag] === true && voidElements[tag] !== true) {
                buf.push('</' + tag + '>');
            }

            if (tag === ignore) {
                ignore = false;
            }
        }

        function chars(chars) {
            if (!ignore) {
                buf.push(encodeEntities(chars));
            }
        }

        return {chars:chars, start:start, end:end};
    }

    function resolve(url) {
        var   href, a;

        if (!sanitize.anchor) {
            sanitize.anchor = a = document.createElement("a");
        } else {
            a = sanitize.anchor;
        }

        href = url;

        //   for ie
        if (window.document.documentMode) {
            a.setAttribute("href", href);
            href = a.href;
        }

        a.setAttribute('href', href);

        return {
            href: a.href,
            protocol: a.protocol ? a.protocol.replace(/:$/, '') : '',
            host: a.host,
            search: a.search ? a.search.replace(/^\?/, '') : '',
            hash: a.hash ? a.hash.replace(/^#/, '') : '',
            hostname: a.hostname,
            port: a.port,
            pathname: (a.pathname.charAt(0) === '/') ? a.pathname : '/' + a.pathname
        };
    }

    function sanitize_url(uri, image) {
        var   regexp, cleaned;

        regexp = image ? IMAGE_REGEXP : HREF_REGEXP;
        cleaned = resolve(uri).href;

        if (cleaned !== '' && !cleaned.match(regexp)) {
            return 'unsafe:' + cleaned;
        }

        return uri;
    }


    function sanitize(html, svgEnabled) {
        var   buf;

        if (svgEnabled) {
            validElements = extend({}, old_valid, svgElements);
        }

        buf = [];
        parser(html, handler(buf, function(uri, image) {
            return !/^unsafe:/.test(sanitize_url(uri, image));
        }));
        return buf.join('');

    }

    window.sanitize =  {
        sanitize_url:sanitize_url,
        sanitize:sanitize
    }
})(window)
