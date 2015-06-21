/**
 * Bootstrap Multiselect v0.9.0 (https://github.com/davidstutz/jquery-pseudocode)
 * 
 * Copyright 2015 David Stutz
 * 
 * Licensed under BSD-3-Clause
 */
(function($) {  
    $.fn.pseudocode = function(options, optionsHandling) {
 
        $(this).each(function() {
            
            /**
             * Returns the index of the smallest element.
             */
            function findMinIdx(arr) {
                var minIdx = 0;
                for (var i = 1; i < arr.length; i++) {
                    if (arr[i] < arr[minIdx]) {
                        minIdx = i;
                    }
                }
                return minIdx;
            }
            
            /**
             * Escape the given stirng for regex usage.
             * 
             * @param {type} string
             * @returns {unresolved}
             */
            function escape(string) {
                var chars = '/.*[]()+$^';

                for (var i = 0; i < chars.length; i++) {
                    string = string.replace(chars[i], '\\' + chars[i]);

                }

                return string;
            }

            /**
             * Wrap a span around the keyword in the line changing the text appereance.
             * 
             * @param {type} line
             * @param {type} keyword
             * @param {type} attrs
             * @returns {unresolved}
             */
            function keywords(line, keyword, attrs) {

                var regex = new RegExp('(\\s+|^)(' + keyword + ')(\\s+|$)', 'g');
                var at = getAttrs(attrs, true);
                line = line.replace(regex, '$1<span ' + at + '>$2</span>$3')

                return line;
            }

            /**
             * Wrap a line comment (beginning with the identifier in 'comment').
             * 
             * @param {type} line
             * @param {type} comment
             * @param {type} attrs
             * @returns {unresolved}
             */
            function comment(line, comment, attrs) {

                var regex = new RegExp('(' + comment + '.*)', 'g');
                var at = getAttrs(attrs, false);
                line = line.replace(regex, '<span ' + at + '>$1</span>');

                return line;
            }
            
            function getAttrs(attrs, keyword) {
                // compatibility mode - there is only the color
                if (typeof attrs == 'string' || attrs instanceof String) {
                    return 'style="color:' + attrs + (keyword ? ';font-weight:bold' : '') + '"';
                }
                
                var at = '';
                if (attrs.class !== undefined) {
                    at = 'class="' + attrs.class + '"';
                }
                if (attrs.style !== undefined) {
                    at += ' style="' + attrs.style + '"';
                }
                
                return at;
            }

            var defaults = {
                keywords: {
                    'if': {class:'keyword'},
                    'for': {class:'keyword'},
                    'var': {class:'keyword'},
                    'function': {class:'keyword'},
                    'return': {class:'keyword'},
                    'this': {class:'keyword'},
                    'while': {class:'keyword'},
                    'end': {class:'keyword'},
                    'endif': {class:'keyword'},
                    'endfor': {class:'keyword'},
                    'endwhile': {class:'keyword'},
                },
                comment: {
                    '//': {class:'comment'},
                    '%': {class:'comment'}
                },
                tab: 4,
                lineNumbers: false
            }
            
            var settings;
            if (optionsHandling === undefined) {
                settings = $.extend(defaults, options);
            } else if (optionsHandling == 'extend-recursive') {
                settings = $.extend(true, defaults, options);
            } else if (optionsHandling == 'extend') {
                settings = $.extend(defaults, options);
            } else if (optionsHandling == 'override') {
                settings = options;
            } else {
                console.warn('Unrecognized optionsHandling value: ' + optionsHandling);
                settings = $.extend(defaults, options);
            }

            var $this = $(this);
            $this.hide();

            var code = $this.text().trim();
            var lines = code.split("\n");

            var depth = 0;
            var id = $this.attr('id');
            var html = '<div class="pseudocode"' + (id ? ' id="' + id + '"' : '') + '>';

            var comments = Array(Object.keys(settings.comment).length);
            var commentIdx = 0;
            $.each(settings.comment, function(key, spec) {
                comments[commentIdx] = key;
                commentIdx++;
            });
            var linenumChars = Math.log10(lines.length);
            $.each(lines, function(n, line) {

                for (var i = 0; i < line.length; i++) {
                    if (line[i] !== ' ') {
                        break;
                    }
                }
                
                html += '<div class="line">';
                
                if (settings.lineNumbers === true) {
                    // Compose the line number
                    var linenumStr = '' + n;
                    for (var j = linenumStr.length; j < linenumChars; j++) {
                        linenumStr = '&nbsp;' + linenumStr;
                    }
                    html += '<div class="line-number">' + linenumStr + '</div>';
                }

                // Check on which level we are.
                var indent = Math.floor((i + 1)/settings.tab);
                for (var i = 0; i < indent; i++) {
                    html += '<div class="indent">&nbsp;</div>';
                }

                // Update current depth.
                depth = indent;

                // Scan for line comments.
                var commentPos = Array(comments.length);
                $.each(comments, function(idx, key) {
                    var cPos = line.indexOf(key);
                    if (cPos >= 0) {
                        commentPos[idx] = cPos;
                    } else {
                        commentPos[idx] = line.length;
                    }
                });
                var firstCommentIdx = findMinIdx(commentPos);
                var commentStartPos = commentPos[firstCommentIdx];
                if (commentStartPos < line.length) {
                    var key = comments[firstCommentIdx];
                    var spec = settings.comment[key];
                    line = comment(line, escape(key), spec);
                }

                // Scan for keywords:
                $.each(settings.keywords, function(keyword, color) {
                    var kIdx = line.indexOf(keyword);
                    if (kIdx >= 0 && kIdx < commentStartPos) {
                        line = keywords(line, keyword, color);
                    }
                });
                html += '<div class="text">' + line.trim() + '</div></div>';
            });

            html += '</div>';

            $ul = $(html);
            $this.after($ul);
        });
        
        return this;
    };
}(jQuery));
