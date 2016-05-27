// ==UserScript==
// @name              FixCJK!
// @name:zh-CN        FixCJK!
// @namespace         https://github.com/stecue/fixcjk
// @version           0.9.14
// @description       1) Use real bold to replace synthetic SimSun bold; 2) Regular SimSun/中易宋体 can also be substituted; 3) Reassign font fallback list (Latin AND CJK). Browser serif/sans settings are overridden; 4) Use Latin fonts for Latin part in Latin/CJK mixed texts; 5) Fix fonts and letter-spacing for CJK punctuation marks.
// @description:zh-cn 中文字体和标点设定及修正脚本
// @author            stecue@gmail.com
// @license           GPLv3
// @match             http://*/*
// @match             https://*/*
// @exclude           http://*edit*/*
// @exclude           https://*edit*/*
// @exclude           http://*action=edit*
// @exclude           https://*action=edit*
// @exclude           https://*jsfiddle.net*/*
// @grant             GM_addStyle
// ==/UserScript==
(function () {
    'use strict';
    // You can change the the following fonts/settings until the "var FixPunct=" line.
    var CJKdefault = 'SimSun,"WenQuanYi Zen Hei Sharp"'; //The default CJK font. Regular weight.
    var CJKserif = '"Microsoft YaHei","WenQuanYi Micro Hei"'; //Serif fonts for CJK. "SimSun" with regular weight will be replaced by the font specified here. Although It is intended for regular weight but some element with bold weight still use the font here. Therefore "SimSun" itself is not a good choice because it does not have a real bold font.
    var CJKsans = '"Microsoft YaHei","Noto Sans CJK SC"'; //Sans-serif fonts for CJK. Regular weight.
    var CJKBold = '"Microsoft YaHei","WenQuanYi Micro Hei"'; //The "good CJK font" to replace SimSun bold. Note that some elements still use font in CJKserif defined above such as the menus on JD.com.
    var CJKPunct = 'Noto Sans CJK SC,"WenQuanYi Micro Hei",SimHei,SimSun'; //The font to use for CJK quotation marks.
    var LatinInSimSun = 'Ubuntu Mono'; //The Latin font in a paragraph whose font was specified to "SimSun" only.
    var LatinSans = 'Lato,"Open Sans",Arial'; //Sans-serif fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var LatinSerif = 'Constantia,"Liberation Serif","Times New Roman"'; //Serif fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var LatinMono = 'Consolas,"DejaVu Sans Mono"'; //Monospace fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var FixRegular = true; //Also fix regular fonts. You need to keep this true if you want to use "LatinInSimSun" in Latin/CJK mixed context.
    var FixMore = true; //Appendent CJK fonts to all elements. No side effects found so far.
    var FixPunct = true; //If Latin punctions in CJK paragraph need to be fixed. Usually one needs full-width punctions in CJK context. Turn it off if the script runs too slow or HTML strings are adding to your editing area.
    //Do not change following code unless you know the results!
    var timeOut=3000;
    var maxlength = 1100200;
    var t_start = performance.now();
    var t_stop = t_start;
    var re_simsun = / *simsun *| *宋体 *| *ËÎÌå */gi;
    var all = document.getElementsByTagName('*');
    var debug_00 = false;
    var debug_01 = false; //Turn on colors while debug_01.
    var debug_02 = false;
    var debug_03 = false;
    var debug_04 = false;
    var debug_left = false; //debug what's left.
    var sig_sun = 'RealCJKBold 宋'; // signature to check if change is sucssful or not.
    var sig_hei = 'RealCJKBold 黑'; // signature to check if change is sucssful or not.
    var sig_bold = 'RealCJKBold 粗'; // signature to check if change is sucssful or not.
    var sig_default = 'RealCJKBold 默'; // signature to check if change is sucssful or not.
    var sig_punct = '\uE135'; //will be attached to CJKPunct;
    var qsig_sun = '"' + sig_sun + '"'; //Quoted sinagure; Actually no need to quote.
    var qsig_hei = '"' + sig_hei + '"'; //Quoted sinagure;
    var qsig_bold = '"' + sig_bold + '"';
    var qsig_default = '"' + sig_default + '"';
    //var qpreCJK = '"' + CJKdefault + '"'; //Quoted "CJK font".
    var genPunct='General Punct \uE137';
    var qpreCJK = CJKdefault;
    var qCJK = LatinInSimSun + ',' + CJKdefault + ',' + qsig_default;
    var qSimSun = LatinInSimSun + ',' + CJKserif + ',' + qsig_sun;
    var qHei = LatinInSimSun + ',' + CJKsans + ',' + qsig_hei;
    var qBold = LatinInSimSun + ',' + CJKBold + ',' + qsig_bold;
    var qsans = LatinSans + ',' + CJKsans + ',' + qsig_hei + ',' + 'sans-serif'; //To replace "sans-serif"
    var qserif = LatinSerif + ',' + CJKserif + ',' + qsig_sun + ',' + 'serif'; //To replace "serif"
    var qmono = LatinMono + ',' + CJKdefault + ',' + qsig_default + ',' + 'monospace'; //To replace "monospace".
    var i = 0;
    var max = all.length;
    var child = all[i].firstChild;
    var if_replace = false;
    var font_str = window.getComputedStyle(all[i], null).getPropertyValue('font-family');
    var fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
    var re_sans0 = /^ ?sans ?$|^ ?sans-serif ?$/i;
    var re_serif = /^ ?serif ?$/i;
    var re_mono0 = /^ ?mono ?$|^ ?monospace ?$/i;
    //letter-spacing options
    var kern_consec_ll='-0.4em'; //。” or ））
    var kern_consec_lr='-0.8em'; //）（
    var kern_consec_pq='-0.5em'; //kern for ,. before right ” Just in case, do not use.
    var kern_consec_qp='-0.5em'; //quote followed by period. Just in case, do not use.
    var kern_sq='-0.5em'; //Just in case, do not use.
    var kern_ind_left_dq='-0.2em';
    var kern_ind_right_dq='-0.2em';
    var kern_ind_right_dq_tail='-0.3em'; //different from above one b/c the possible extra \n (which will show as a space in most cases).
    var kern_dq_right_end='-0.3em'; //Just in case, do not use.
    var kern_dq_right_left='-0.8em'; //Just in case, do not use.
    //Check if the font definitions are valid
    function check_fonts(font_var, fvname) {
        var fl = font_var.split(',');
        for (i = 0; i < fl.length; i++) {
            if (!(fl[i].match(/^[^" ][^"]+[^" ]$|^"[^ ][^"]+[^ ]"$/))) {
                alert('Check your font definition: ' + fl[i] + ' in ' + fvname);
                return false;
            }
        }
        return true;
    }
    if (check_fonts(CJKdefault, 'CJKdefault') === false)
        return false;
    else if (check_fonts(CJKserif, 'CJKserif') === false)
        return false;
    else if (check_fonts(CJKsans, 'CJKsans') === false)
        return false;
    else if (check_fonts(CJKBold, 'CJKBold') === false)
        return false;
    else if (check_fonts(LatinInSimSun, 'LatinInSimSun') === false)
        return false;
    else if (check_fonts(LatinSans, 'LatinSans') === false)
        return false;
    else if (check_fonts(LatinSerif, 'LatinSerif') === false)
        return false;
    else if (check_fonts(LatinMono, 'LatinMono') === false)
        return false;
    else {
    }
    function list_has(font_str, family) {
        /// Fucntion to check matches
        var allfonts = font_str.split(',');
        for (var j = 0, maxl = allfonts.length; j < maxl; j++) {
            if (allfonts[j].match(family)) {
                return j;
            }
        }
        return false;
    }
    function replace_font(font_str, family, qBold) {
        var allfonts = font_str.split(',');
        var j = 0;
        var maxl = allfonts.length;
        for (j = 0; j < maxl; j++) {
            if (allfonts[j].match(family)) {
                allfonts[j] = qBold;
            }
        }
        var toReturn = allfonts[0];
        for (j = 1; j < maxl; j++) {
            toReturn = toReturn + ',' + allfonts[j];
        }
        return toReturn;
    }
    function has_genfam(font_str) {
        /// Test if font_str include general families.
        if (list_has(font_str, re_sans0)) {
            return true;
        }
        else if (list_has(font_str, re_serif)) {
            return true;
        }
        else if (list_has(font_str, re_mono0)) {
            return true;
        }
        return false;
    }
    function dequote(font_str) {
        /// Function to dequote non-standard font lists.
        var strl=font_str.split(','); //font list;
        for (var k=0;k < strl.length; k++) {
            while (strl[k].charAt(0).match(/["' ]/)) {
                strl[k]=strl[k].slice(1);
            }
            while (strl[k].charAt(strl[k].length-1).match(/["' ]/)) {
                strl[k]=strl[k].slice(0,-1);
            }
        }
        var dequoted=strl[0];
        for (k=1;k<strl.length;k++) {
            dequoted=dequoted+','+strl[k];
        }
        return dequoted;
    }
    function FirstFontOnly(font_str) {
        return ((dequote(font_str)).split(','))[0];
    }
    function AddLocal(font_str) {
        font_str=(dequote(font_str)).split(',');
        var localed='local("'+font_str[0]+'"), local("'+font_str[0]+' Regular")';
        for (var l=1;l<font_str.length;l++) {
            localed=localed+',\n'+'local("'+font_str[l]+'"),local("'+font_str[l]+' Regular")';
        }
        return localed;
    }
    if (debug_00===true) {console.log(dequote('"SimSun","Times New Roman"""""'));}
    //Assign fonts for puncts:
    var punctStyle='@font-face { font-family: '+genPunct+';\n src: '+AddLocal(CJKPunct)+';\n unicode-range: U+3000-303F,U+FF00-FFEF;}';
    var useCSSforSimSun=false;
    if (useCSSforSimSun===true) {
        punctStyle=punctStyle+'\n @font-face { font-family: SimSun;\n src: local('+FirstFontOnly('SimSun')+');\n unicode-range: U+3400-9FBF;}';
        punctStyle=punctStyle+'\n @font-face { font-family: 宋体;\n src: local('+FirstFontOnly('SimSun')+');\n unicode-range: U+3400-9FBF;}';
        punctStyle=punctStyle+'\n @font-face { font-family: ËÎÌå;\n src: local('+FirstFontOnly('SimSun')+');\n unicode-range: U+3400-9FBF;}';
        punctStyle=punctStyle+'\n @font-face { font-family: 宋体;\n src: local('+FirstFontOnly(LatinInSimSun)+');\n unicode-range: U+0000-2C7F;}';
    }
    if (debug_00===true) alert(punctStyle);
    GM_addStyle(punctStyle);
    ///----------------------------
    qpreCJK = dequote(qpreCJK);
    qCJK = dequote(qCJK);//LatinInSimSun + ',' + CJKdefault + ',' + qsig_default;
    qSimSun = dequote(qSimSun);//LatinInSimSun + ',' + CJKserif + ',' + qsig_sun;
    qHei = dequote(qHei);//LatinInSimSun + ',' + CJKsans + ',' + qsig_hei;
    qBold = dequote(qBold);//LatinInSimSun + ',' + CJKBold + ',' + qsig_bold;
    qsans = dequote(qsans);//LatinSans + ',' + CJKsans + ',' + qsig_hei + ',' + 'sans-serif'; //To replace "sans-serif"
    qserif = dequote(qserif);//LatinSerif + ',' + CJKserif + ',' + qsig_sun + ',' + 'serif'; //To replace "serif"
    qmono = dequote(qmono);//LatinMono + ',' + CJKdefault + ',' + qsig_default + ',' + 'monospace'; //To replace "monospace".
    CJKPunct=dequote(CJKPunct)+','+sig_punct;
    if (debug_00===true) {alert('Entering Loops...');}
    /// ===== First round: Replace all bold fonts to CJKBold ===== ///
    for (i = 0; i < max; i++) {
        child = all[i].firstChild;
        if_replace = false;
        //Only change if current node (not child node) contains CJK characters.
        font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
        fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
        while (child) {
            if (child.nodeType == 3 && (child.data.match(/[\u3400-\u9FBF]/)) && (fweight == 'bold' || fweight > 500) && (!(font_str.match(sig_bold)))) {
                //Test if contains SimSun
                if (debug_01===true) {all[i].style.color="Blue";} //Bold-->Blue;
                if (font_str.match(re_simsun)) {
                    //all[i].style.color="Sienna"; //SimSun --> Sienna
                    all[i].style.fontFamily = genPunct+','+font_str.replace(re_simsun, qBold);
                    if (!(has_genfam(all[i].style.fontFamily))) {
                        all[i].style.fontFamily = genPunct+','+all[i].style.fontFamily + ',' + 'sans-serif';
                    }
                }        //Test if contains Sans
                else if (list_has(font_str, re_sans0) !== false) {
                    //all[i].style.color="Salmon";
                    all[i].style.fontFamily = genPunct+','+LatinSans + ',' + replace_font(font_str, re_sans0, qBold) + ',' + 'sans-serif';
                }        //Test if contains serif
                else if (list_has(font_str, re_serif) !== false) {
                    //all[i].style.color="SeaGreen";
                    all[i].style.fontFamily = genPunct+','+LatinSerif + ',' + replace_font(font_str, re_serif, qBold) + ',' + 'serif';
                }        //Test if contains monospace
                else if (list_has(font_str, re_mono0) !== false) {
                    //all[i].style.color="Maroon";
                    all[i].style.fontFamily = genPunct+','+LatinMono + ',' + replace_font(font_str, re_mono0, qBold) + ',' + 'monospace';
                }        //Just append the fonts to the font preference list.
                else {
                    //all[i].style.color="Fuchsia"; //qBold+"false-safe" sans-serif;
                    all[i].style.fontFamily = genPunct+','+font_str + ',' + qBold + ',' + '  sans-serif';
                    //console.log(all[i].style.fontFamily);
                }
            }
            child = child.nextSibling;
        }
    }
    if (FixRegular === false) {
        return false;
    }
    /// ===== Second Round: Deal with regular weight. ===== ///
    var tmp_idx=0;
    max = all.length;
    for (i = 0; i < max; i++) {
        child = all[i].firstChild;
        if_replace = false;
        //Only change if current node (not child node) contains CJK characters.
        font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
        fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
        //console.log(child.nodeType);
        while (child) {
            if (child.nodeType == 3) {
                //all[i].style.color='Teal'; //text-->teal;
                //Just check and fix the improper SimSun use
                if (font_str.match(re_simsun)) {
                    if (debug_02===true) {all[i].style.color="Sienna";}
                    if (fweight == 'bold' || fweight > 500) {
                        //all[i].style.color="Grey";
                        if_replace = false;
                        //console.log(child.data);
                        //return false;
                    }
                    else {
                        if (debug_02===true) {all[i].style.color="Orange";}
                        if (font_str.match(sig_sun) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default) || font_str.match(/\uE137/)) {
                            //do nothing if already replaced;
                            if (debug_02===true) {all[i].style.color="Grey";}
                            if_replace = false;
                        }
                        else {
                            if (debug_02 ===true) {all[i].style.color="Indigo";} //Improperly used SimSun. It shouldn't be used for non-CJK fonts.
                            if (debug_02===true) if (child.data.match(/目前量子多体的书/g)) {tmp_idx=i;console.log('before:'+all[i].style.fontFamily);}
                            all[i].style.fontFamily = dequote(genPunct+','+font_str.replace(re_simsun, qSimSun));
                            if (debug_02===true) if (child.data.match(/目前量子多体的书/g)) {console.log('after_applied:'+all[i].style.fontFamily);}
                            if (debug_02===true) if (child.data.match(/目前量子多体的书/g)) {console.log('after_calculated:'+window.getComputedStyle(all[tmp_idx], null).getPropertyValue('font-family'));}
                            if (all[i].style.fontFamily.length<1) {
                                console.log(font_str);console.log(font_str.replace(re_simsun, qSimSun));
                            }
                            if (!(has_genfam(all[i].style.fontFamily))) {
                                all[i].style.fontFamily = genPunct+','+all[i].style.fontFamily + ',' + 'sans-serif';
                            }              //all[i].style.color="Indigo"; //Improperly used SimSun. It shouldn't be used for non-CJK fonts.

                            if_replace = false;
                            //all[i].style.color="Grey";
                        }
                    }
                    if (debug_02===true) if (child.data.match(/目前量子多体的书/g)) {console.log('///////after_noCJK:'+i.toString()+'::'+all[i].style.fontFamily+'\n-->if_replace:'+if_replace);}
                }
                if (child.data.match(/[\u3400-\u9FBF]/)) {
                    if_replace = true;
                    if (debug_02===true) if (child.data.match(/目前量子多体的书/g)) {console.log('|||||||testing_CJK:'+i.toString()+'::'+all[i].style.fontFamily+'\n-->if_replace:'+if_replace);}
                    if (debug_02===true) {all[i].style.color="Cyan"; }//CJK-->Cyan
                    font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
                    if (font_str.match(sig_sun) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default)) {
                        //do nothing if already replaced;
                        if (debug_02===true) {all[i].style.color="Black";}
                        if_replace = false;
                        if (debug_02===true) if (child.data.match(/目前量子多体的书/g)) {console.log('XXXXXXXXXXXXtesting_CJK:'+i.toString()+'::'+all[i].style.fontFamily+'\n-->if_replace:'+if_replace);}
                    }          //break;

                }
            }
            child = child.nextSibling;
        }
        //Just to make sure "font_str" is already updated.
        font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
        if (if_replace === true) {
            if (debug_02===true) {all[i].style.color='Teal';} //Teal for true;
            if (debug_02===true) {if (all[i].innerHTML.match(/目前量子多体的书/g)) {console.log('\\\\\\\\\\\\afterall:'+i.toString()+'::'+all[i].style.fontFamily+'\n-->if_replace:'+if_replace);}}
            //Test if contains Sans
            if (list_has(font_str, re_sans0) !== false) {
                //all[i].style.color="Salmon";
                all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_sans0, qsans);
            }      //Test if contains serif
            else if (list_has(font_str, re_serif) !== false) {
                //all[i].style.color="SeaGreen";
                all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_serif, qserif);
            }      //Test if contains monospace
            else if (list_has(font_str, re_mono0) !== false) {
                //all[i].style.color="Maroon";
                all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_mono0, qmono);
            }
            else {
                if (debug_02===true) {all[i].style.color='Fuchsia';}
                if (font_str.match(re_simsun)) {
                    //all[i].style.color='Fuchsia';
                    //This is needed because some elements cannot be captured in "child elements" processing. (Such as the menues on JD.com) No idea why.
                    all[i].style.fontFamily = genPunct+','+font_str.replace(re_simsun, qSimSun) + ',' + 'serif';
                }
                else {
                    //all[i].style.color='Fuchsia';
                    all[i].style.fontFamily = genPunct+','+font_str + ',' + qCJK + ',' + 'sans-serif';
                }
            }
        }
    }
    if (debug_02===true) console.log('Just before Round 3:'+tmp_idx.toString()+'::'+all[tmp_idx].innerHTML);
    if (debug_02===true) console.log('Just before Round 3:'+tmp_idx.toString()+'::'+dequote(window.getComputedStyle(all[tmp_idx], null).getPropertyValue('font-family')));
    /// ===== The Third round: Add CJKdefault to all elements ===== ///
    if (FixMore === false) {
        return false;
    }
    max = all.length;
    for (i = 0; i < max; i++) {
        //all[i].style.color="SeaGreen";
        font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
        if (!(font_str.match(sig_sun) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default) || font_str.match(/\uE137/))) {
            if (list_has(font_str, re_sans0) !== false) {
                //all[i].style.color="Salmon";
                all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_sans0, qsans);
            }      //Test if contains serif
            else if (list_has(font_str, re_serif) !== false) {
                //all[i].style.color="SeaGreen";
                all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_serif, qserif);
            }      //Test if contains monospace
            else if (list_has(font_str, re_mono0) !== false) {
                //all[i].style.color="Maroon";
                all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_mono0, qmono);
            }
            else {
                if (debug_03 === true) { all[i].style.color='Fuchsia'; }
                if (font_str.match(re_simsun)) {
                    if (debug_03 === true) {all[i].style.color='Sienna'; }
                    //This is needed because some elements cannot be captured in "child elements" processing. (Such as the menues on JD.com) No idea why.
                    all[i].style.fontFamily = genPunct+','+font_str.replace(re_simsun, qSimSun) + ',' + 'serif';
                }
                else {
                    if (debug_03 === true) { all[i].style.color='Olive';}
                    all[i].style.fontFamily = genPunct+','+font_str + ',' + qCJK + ',' + 'sans-serif';
                }
            }
        }
        else {
            //all[i].style.color="Silver"; //Signed-->Silver
        }
    }
    ///===Round 4, FixPunct===///
    if (FixPunct === false) {
        return false;
    }
    else {
        //return true;
    }
    t_stop=performance.now();
    if ((t_stop-t_start)*2 > timeOut) {
        console.log('Too slow, skip checking and fixing punctuations...');
        FixPunct=false;
    }
    var bodyhtml=document.getElementsByTagName("HTML");
    if (bodyhtml[0].innerHTML.length > maxlength) {
        console.log('Too long, skip checking and fixing punctuations...');
        FixPunct=false;
    }
    else if (!(bodyhtml[0].innerHTML.match(/\u3000-\u303F\uFF00-\uFFEF/m))) {
        //Note that if one prefers using pure Latin punctuation for CJK contents, I'll leave it untouched.
        FixPunct=false;
    }
    else {
        FixPunct=true;
    }
    var currpunc=0;
    var currHTML='';
    var changhai_style=false;
    var tmp_str='';
    var numnodes=0;
    var puncnode=new Array('');
    var puncid=new Array('');
    var delete_all_spaces=true;
    var SkippedTags=/^(TITLE|HEAD|textarea|img|SCRIPT)$/i; //to be fixed for github.
    var AlsoChangeFullStop=false;
    var Squeezing=true;
    var CompressInd=false;
    var MaxNumLoops=5;
    SkippedTags=/^(?:TITLE)|(?:HEAD)|(?:textarea)|(?:img)$/i; //to be fixed for github.
    while ((FixPunct === true) && (MaxNumLoops>0)) {
        MaxNumLoops--;
        i=0;
        all = document.getElementsByTagName('*');
        numnodes=0;
        puncnode=new Array('');
        puncid=new Array('');
        if ((performance.now()-t_start) > timeOut) {
            console.log('Time out, stopping now...');
            break;
        }
        for (i = 0; i < max; i++) {
            child = all[i].firstChild;
            if_replace = false;
            //Only change if current node (not child node) contains CJK characters.
            //font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
            //fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
            //console.log(child.nodeType);
            font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
            if (debug_04===true) {
                if (font_str.match('monospace')) {
                    all[i].style.color='MidnightBlue';
                }
            }
            while (child) {
                if (child.nodeType == 3) {
                    //console.log(child.data);
                    //use "mg" to also match paragraphs with punctions at the end or beginning of a line.
                    if (all[i].nodeName.match(SkippedTags)) {
                        if (MaxNumLoops===0) {
                            console.log('Skipped Change (Case 0): '+all[i].nodeName+'#'+i.toString()+': '+child.data);
                        }
                        if (debug_04===true) { console.log('Processing node '+i+'::'+all[i].nodeName); }
                        break;
                    }
                    else {
                        if ((child.data.match(/[“‘][ \n\t]*[\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]+|[\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF][ \n\t]*[”’]/mg)) && (!(font_str.match('monospace')))) {
                            if (debug_04===true) {all[i].style.color='Purple';} //Punctions-->Purple;
                            numnodes++;
                            puncnode.push(i);
                            if (MaxNumLoops===0) {
                                console.log('To Change (Case A): '+all[i].nodeName+'#'+i.toString()+': '+child.data);
                            }
                            //if (all[i].id.match(/^$/)) {all[i].id='punct'+i.toString();}
                            //puncid.push(all[i].id);
                            break;
                        }
                        else if ((delete_all_spaces===true) && (child.data.match(/[\u3000-\u303F\uFF00-\uFFEF][\n]?[ ][^ |$]/mg))) {
                            if (debug_04===true) {all[i].style.color='Purple';} //Punctions-->Purple;
                            numnodes++;
                            puncnode.push(i);
                            if (MaxNumLoops===0) {
                                console.log('To Change (Case A): '+all[i].nodeName+'#'+i.toString()+': '+child.data);
                            }
                            //if (all[i].id.match(/^$/)) {all[i].id='punct'+i.toString();}
                            //puncid.push(all[i].id);
                            break;
                        }
                        else if ((AlsoChangeFullStop===true) && child.data.match(/[？！：；、，。]/mg)) {
                            if (MaxNumLoops===0) {
                                console.log('To Change (Case A): '+all[i].nodeName+'#'+i.toString()+': '+child.data);
                            }
                            numnodes++;
                            puncnode.push(i);
                            //if (all[i].id.match(/^$/)) {all[i].id='punct'+i.toString();}
                            //puncid.push(all[i].id);
                            break;
                        }
                        else if (child.data.match(/[\u3000-\u303F\uFF00-\uFFEF][\u3000-\u303F\uFF00-\uFFEF]/mg)) {
                            if (MaxNumLoops===0) {
                                console.log('To Change (Case A): '+all[i].nodeName+'#'+i.toString()+': '+child.data);
                            }
                            numnodes++;
                            puncnode.push(i);
                            break;
                        }
                        else {
                        }
                    }
                }
                child = child.nextSibling;
            }
        }
        if ((performance.now()-t_start) > timeOut) {
            console.log('Time out, stopping now...');
            break;
        }
        if (numnodes===0) {
            FixPunct=false;
            continue;
        }
        console.log(MaxNumLoops.toString()+' (or less) loop(s) left.');
        console.log(numnodes.toString()+' element(s) to change.');
        currpunc=0;
        //var kern_dq_right='-1px';
        //var kern_dq_right_tail='-5px';
        while(numnodes>0) {
            if ((performance.now()-t_start) > timeOut) {
                console.log('Time out, some elements are left unchanged...');
                break;
            }
            numnodes--;
            //Simply inserting blanck space, like changhai.org.
            currpunc=puncnode.pop();
            if (MaxNumLoops===0) {
                console.log('currpunc='+currpunc.toString()+': '+all[currpunc].nodeName+': '+currHTML);
            }
            if (debug_04===true) {console.log(currpunc);}
            currHTML=all[currpunc].innerHTML;
            if (changhai_style===true) {
                currHTML=currHTML.replace(/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]?)([“‘])([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]+)/g,'$1 $2$3');
                currHTML=currHTML.replace(/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF])([”’])([^，, ])/g,'$1$2 $3');
                if (debug_04===true) {console.log(currHTML);}
                all[currpunc].innerHTML=currHTML;
                continue;
            }
            //We need to strip the space before and after quotation marks before fixing punctions, but not \n
            if (delete_all_spaces===true) {
                currHTML=currHTML.replace(/([\u3000-\u303F\uFF00-\uFFEF][\n]?)[ ]([^ |$])/g,'$1$2');
            }
            currHTML=currHTML.replace(/[ ]?([“‘])[ ]?([\n]?[\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]+)/mg,'$1$2');
            currHTML=currHTML.replace(/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]+[\n]?)[ ]?([”’])[ ]?/mg,'$1$2');
            //fix quotations followed by HTML symbols:
            currHTML=currHTML.replace(/(&[^&;]+;)([“‘][\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF])/g,'$1<span style="font-family:sans-serif;letter-spacing:-1em;">&nbsp;</span>$2');
            //Add space/backspace between ">" and "“"
            if (currHTML.match(/(>[\n]?)[ ]*([“‘])/mg)) {
                if (debug_04===true) {alert('Before Replacement: '+currHTML);}
                currHTML=currHTML.replace(/(>[\n]?)[ ]*([“‘])/mg,'$1\u200B$2');
                if (debug_04===true) {alert('After Replacement: '+currHTML);}
            }
            //all[currpunc].innerHTML=currHTML; continue;
            //Now let's fix the punctions.
            //Use more negative kerning for consective punction marks.
            ///----[？！：；]“ does not need special treatment. Just compress [，。]---///
            if (Squeezing===true) {
                //--THREE PUNCTS: [，。：；！？]”“-//
                tmp_str='$1<span style="letter-spacing:'+kern_consec_ll+';">$2</span>'+'<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_lr+';">$3</span>';
                tmp_str=tmp_str+'<span style="font-family:'+dequote(CJKPunct)+';">$4</span>$5';
                currHTML=currHTML.replace(/([\n]?)([，。、：；！？][\n]?)([’”])([“‘][\n]?)([\u0021-\u003B\u003D\u003F-\u05FF]*[\u3000-\u303F\uFF00-\uFFEF\u3400-\u9FBF])/mg,tmp_str); //all[currpunc].innerHTML=currHTML; continue;
                //--THREE PUNCTS: [’”][，。：；！？）》」][“‘]-//
                var punct3=/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?)([’”])([，。、：；！？）》」])([“‘][\n]?)([\u0021-\u003B\u003D\u003F-\u05FF]*[\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF][\n]?)/mg;
                tmp_str='$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_ll+';">$2</span>'+'<span style="letter-spacing:'+kern_consec_lr+';">$3</span>';
                tmp_str=tmp_str+'<span style="font-family:'+dequote(CJKPunct)+';">$4</span>$5';
                currHTML=currHTML.replace(punct3,tmp_str); //all[currpunc].innerHTML=currHTML; continue;
                //--THREE PUNCTS: [’”][，。：；！？][”]-//
                punct3=/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?)([’”])([，。、：；！？）》」])([”][\n]?)/mg;
                tmp_str='$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_ll+';">$2</span>'+'<span style="letter-spacing:'+kern_consec_ll+';">$3</span>';
                tmp_str=tmp_str+'<span style="font-family:'+dequote(CJKPunct)+';">$4</span>';
                currHTML=currHTML.replace(punct3,tmp_str); //all[currpunc].innerHTML=currHTML; continue;
                //--TWO PUNCTS: End with '” (lean-left)' and NONE '“' after: ”[，。、：；！？]:left-left--//
                if (AlsoChangeFullStop===true) {
                    //The following should not be used.
                    tmp_str='$1<span style="letter-spacing:'+kern_consec_ll+';font-family:'+dequote(CJKPunct)+';">$2</span>'+'<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_dq_right_end+';">$3</span>$4';
                    currHTML=currHTML.replace(/([^？！：；，。、“”][\n]?)([？！：；，。、）》」][\n]?)([’”])([^“‘]|$)/mg,tmp_str); // "？！：；" should also use CJKPunct".
                    tmp_str='$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_qp+';">$2</span><span style="font-family:'+dequote(CJKPunct)+';">$3</span>$4';
                    currHTML=currHTML.replace(/([\u3400-\u9FBF《》][\u0021-\u003B\u003D\u003F-\u05FF]*[\n]?)([’”])([？！：；，。、])([^“‘]|$)/mg,tmp_str);
                }
                else {
                    //left-left. ）”
                    tmp_str='$1<span style="letter-spacing:'+kern_consec_ll+';">$2</span>'+'<span style="font-family:'+dequote(CJKPunct)+';">$3</span>$4';
                    currHTML=currHTML.replace(/(.|^)([，。、：；！？）》」][\n]?)([’”])([^“‘]|$)/mg,tmp_str); // "？！：；" are in the middle of the "font space".
                    //left-left ”）
                    tmp_str='$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_ll+';">$2</span>$3$4';
                    currHTML=currHTML.replace(/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF][\u0021-\u003B\u003D\u003F-\u05FF]*(?:<[^><]+>[ \n]?)*[\n]?)([’”])([，。、：；！？）》」])([^“‘]|$)/mg,tmp_str);
                }
                //--TWO PUNCTS: [、，。：；！？）》】」][、，。：；！？）》】」] (left-left)--//
                tmp_str='<span style="letter-spacing:'+kern_consec_ll+';">$1</span>$2';
                currHTML=currHTML.replace(/([、，。：；！？）》】」])([、，。：；！？）》】」])/mg,tmp_str);
                //--TWO PUNCTS: [、，。：；！？）》」][（《「] (left-right)--//
                tmp_str='<span style="letter-spacing:'+kern_consec_lr+';">$1</span>$2';
                currHTML=currHTML.replace(/([、，。：；！？）》】」])([（《「【])/mg,tmp_str);
                //--TWO PUNCTS: End with [，。：；）》】」] and ONE '[“]' (left mark) after:--//
                tmp_str='$1<span style="letter-spacing:'+kern_consec_lr+';">$2</span>'+'<span style="font-family:'+dequote(CJKPunct)+';">$3</span>$4';
                currHTML=currHTML.replace(/([^’”]|^)([、，。：；！？）》】」][\n]?)([“‘])([\n]?(?:<[^><]+>[ \n]?)*[\u0021-\u003B\u003D\u003F-\u05FF]*[\u3400-\u9FBF])/mg,tmp_str);
                //--TWO PUNCTS: ”[“‘] (left-rgiht)--//
                tmp_str='$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_lr+';">$2</span>'+'<span style="font-family:'+dequote(CJKPunct)+';">$3</span>$4';
                currHTML=currHTML.replace(/((?:[\u3400-\u9FBF][\u0021-\u003B\u003D\u003F-\u05FF]*[^’”、，。：；！？）》】」])|^)([\n]?[’”])([“‘])([\n]?(?:<[^><]+>[ \n]?)*[\u0021-\u003B\u003D\u003F-\u05FF]*[\u3400-\u9FBF])/mg,tmp_str);
                //--TWO PUNCTS: ”[（《「] (left-right)--//
                tmp_str='$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_consec_lr+';">$2</span>$3';
                currHTML=currHTML.replace(/((?:[\u3400-\u9FBF][\u0021-\u003B\u003D\u003F-\u05FF]*[^’”、，。：；！？）》】」])|^)([\n]?[’”])([（【《])/mg,tmp_str);
            }
            else {
                alert('Alway squeeze consec puncts now or ind ones won\'t work. No squeezing not implemented yet!');
            }
            ///---Done with conseqtive puncts--///
            //-----Use normal kerning for individual double quotation marks.---//
            if (CompressInd===true) {
                ////// Why do I need to start with non-space character?
                var use_kern_after_bra=true;
                if (use_kern_after_bra===false) {
                    currHTML=currHTML.replace(/([^ \n”。，\u200B][\n]?|^)([“])([\n]?[\u3400-\u9FBF]+)/mg,'<span style="letter-spacing:'+kern_ind_left_dq+'">$1</span><span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$2</span>$3');
                }
                else{
                    // ((?:(?:<[^><\uE135]*>[\n]?)+\u200B)?) ($2) matches 0 or more consec tags.
                    currHTML=currHTML.replace(/((?:&[^&;]+;)|[^ \n”。，><;][\n]?|^)((?:(?:<[^><\uE135]*>[\n]?)+\u200B)?)([“])([\n]?[\u3400-\u9FBF]+)/mg,'<span style="letter-spacing:'+kern_ind_left_dq+'">$1</span>$2<span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$3</span>$4');
                }
                //$1 is something like “智能ABC”, but not “智能"ABC”
                currHTML=currHTML.replace(/([\u3400-\u9FBF《》][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?)([”])([^“，。：；！\n])/mg,'$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_ind_right_dq+';">$2</span>$3');
                currHTML=currHTML.replace(/([\u3400-\u9FBF《》][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?)([”])([\n]|$)/mg,'$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_ind_right_dq_tail+';">$2</span>$3');
                ///===== User more negative spacing for single quotation marks. =====//
                // However, left quotation marks will overwrite the character on the left with too negative spacing.) ---///
                var Unified_Algo=true; //Unified replacement algorithm for double and single quotations.
                if (Unified_Algo===true) {
                    if (use_kern_after_bra===false) {
                        currHTML=currHTML.replace(/([^ \n”。，][\n]?|^)([‘])([\n]?[\u3400-\u9FBF]+)/mg,'<span style="letter-spacing:'+kern_sq+'">$1</span><span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$2</span>$3');
                    }
                    else {
                        currHTML=currHTML.replace(/([^ \n”。，><][\n]?|^)((?:(?:<[^><\uE135]+>[\n]?)+\u200B)?)([‘])([\n]?[\u3400-\u9FBF]+)/mg,'<span style="letter-spacing:'+kern_sq+'">$1</span>$2<span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$3</span>$4');

                    }
                    currHTML=currHTML.replace(/([\u3400-\u9FBF《》][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?)([’])([^“，。：；！\n])/mg,'$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_sq+';">$2</span>$3');
                    currHTML=currHTML.replace(/([\u3400-\u9FBF《》][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?)([’])([\n]|$)/mg,'$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_sq+';">$2</span>$3');
                }
                else {
                    currHTML=currHTML.replace(/([\u3400-\u9FBF，。？！：；《》、])([‘])([\n]?[\u3400-\u9FBF？！：；《》、]+)/mg,'<span style="letter-spacing:'+kern_sq+'">$1</span><span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$2</span>$3');
                    currHTML=currHTML.replace(/([\u3400-\u9FBF，。？！：；《》、][\n]?)([’])/g,'$1<span style="font-family:'+dequote(CJKPunct)+';letter-spacing:'+kern_sq+';">$2</span>');
                }
            }
            else {
                currHTML=currHTML.replace(/([“‘])([\n]?(?:<[^><\uE135]+>[ \n]?)*[\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\u3400-\u9FBF]+)/mg,'<span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$1</span>$2');
                currHTML=currHTML.replace(/([\u3400-\u9FBF？！：；《》、，][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?(?:<[^><\uE135]+>[ \n]?)*)([’”])([^“，。：；！（《\n])/mg,'$1<span style="font-family:'+dequote(CJKPunct)+';">$2</span>$3');
                currHTML=currHTML.replace(/([\u3400-\u9FBF？！：；《》、，][\u0021\u0023-\u003B\u003D\u003F-\u05FF]*[\n]?(?:<[^><\uE135]+>[ \n]?)*)([’”])([\n]|$)/mg,'$1<span style="font-family:'+dequote(CJKPunct)+';">$2</span>$3');
            }
            if (debug_04===true) {all[currpunc].style.color="Pink";}
            if ((AlsoChangeFullStop===true) && (currHTML.match(/[？！：；、，。]/mg))) {
                currHTML=currHTML.replace(/([？！：；、，。])/mg,'<span style="font-family:'+dequote(CJKPunct)+';">$1</span>');
            }
            all[currpunc].innerHTML=currHTML;
        }
    }
    ///--Reload if nessery--For testing purpose only. Keep it false!---///
    var reload=false;
    if (reload===true) {
        all=document.getElementsByTagName('*');
        for (i=0;i<all.length;i++) {
            //currHTML=currHTML.replace(/([^>]|^)([？！：；、，。])([^<]|$)/mg,'$1<span style="font-family:'+dequote(CJKPunct)+',sans-serif;">$2</span>$3');
            child = all[i].firstChild;
            while (child) {
                if (child.nodeType == 3) {
                    if (child.data.match(/([？！：；、，。])/mg)) {
                        console.log(all[i].innerHTML.replace(/([？！：；、，。])/mg,'<span style="font-family:'+dequote(CJKPunct)+';">$1</span>'));
                    }
                    break;
                }
                child = child.nextSibling;
            }
        }
    }
    all=document.getElementsByTagName('img');
    for (i=0;i<all.length;i++) {
        if (all[i].hasAttribute('data-actualsrc')) {
            all[i].src=all[i].getAttribute('data-actualsrc');
        }
    }
    t_stop=performance.now();
    console.log('FixCJK! execution time: '+((t_stop-t_start)/1000).toFixed(3)+' seconds');
    if (debug_left===true) {alert('Finished!');}
}
) ();
