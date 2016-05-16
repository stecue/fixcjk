// ==UserScript==
// @name         FixCJK!
// @namespace    https://github.com/stecue/fixcjk
// @version      0.8.5
// @description  1) Use real bold to replace synthetic SimSun bold; 2) Use Latin fonts for Latin part in Latin/CJK mixed texts; 3) Assign general CJK fonts.
// @author       stecue@gmail.com
// @match        http://*/*
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    // You can change the the following fonts/settings until the "var all=" line.
    var CJKdefault ='SimSun,"WenQuanYi Zen Hei Sharp"'; //The default CJK font. Regular weight.
    var CJKserif='"Microsoft YaHei","WenQuanYi Micro Hei"'; //Serif fonts for CJK. "SimSun" with regular weight will be replaced by the font specified here. Although It is intended for regular weight but some element with bold weight still use the font here. Therefore "SimSun" itself is not a good choice because it does not have a real bold font.
    var CJKsans='"Microsoft YaHei","Noto Sans CJK SC"'; //Sans-serif fonts for CJK. Regular weight.
    var CJKBold='"Microsoft YaHei","WenQuanYi Micro Hei"'; //The "good CJK font" to replace SimSun bold. Note that some elements still use font in CJKserif defined above such as the menus on JD.com.
    var LatinInSimSun='Ubuntu Mono'; //The Latin font in a paragraph whose font was specified to "SimSun" only.
    var LatinSans='Lato,"Open Sans",Arial'; //Sans-serif fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var LatinSerif='Constantia,"Liberation Serif","Times New Roman"'; //Serif fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var LatinMono='Consolas,"DejaVu Sans Mono"'; //Monospace fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var FixRegular=true; //Also fix regular fonts. You need to keep this true if you want to use "LatinInSimSun" in Latin/CJK mixed context.
    var FixMore=true; //Appendent CJK fonts to all elements. Might have side effects ?
    var FixPunct=false; //If Latin punctions in CJK paragraph need to be fixed. Usually one needs full-width punctions in CJK context. Not implemented yet.
    //Do not change following code unless you know the results!
    var re_simsun=/ *simsun *| *宋体 */gi;
    var all = document.getElementsByTagName('*');
    var sig_sun='RealCJKBold 宋'; // signature to check if change is sucssful or not.
    var sig_hei='RealCJKBold 黑'; // signature to check if change is sucssful or not.
    var sig_bold='RealCJKBold 粗'; // signature to check if change is sucssful or not.
    var sig_default='RealCJKBold 默'; // signature to check if change is sucssful or not.
    var qsig_sun='"'+sig_sun +'"'; //Quoted sinagure; Actually no need to quote.
    var qsig_hei='"'+sig_hei +'"'; //Quoted sinagure;
    var qsig_bold='"'+sig_bold+'"';
    var qsig_default='"'+sig_default+'"';
    //var qpreCJK = '"' + CJKdefault + '"'; //Quoted "CJK font".
    var qpreCJK=CJKdefault;
    var qCJK = CJKdefault+','+qsig_default;
    var qSimSun = LatinInSimSun+','+CJKserif+','+qsig_sun;
    var qHei = LatinInSimSun+','+CJKsans+','+qsig_hei;
    var qBold = LatinInSimSun+','+CJKBold+','+qsig_bold;
    var qsans = LatinSans+',' + CJKsans +','+qsig_hei+','+'sans-serif'; //To replace "sans-serif"
    var qserif = LatinSerif+','+ CJKserif+','+qsig_sun+','+'serif'; //To replace "serif"
    var qmono = LatinMono+','+qCJK+','+'monospace'; //qCJK comes with signature;
    var i=0;
    var max=all.length;
    var child = all[i].firstChild;
    var if_replace = false;
    var font_str = window.getComputedStyle(all[i], null).getPropertyValue('font-family');
    var font_last=[];
    var fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
    var re_sans0=/^ ?sans ?$|^ ?sans-serif ?$/i ;
    var re_serif=/^ ?serif ?$/i;
    var re_mono0=/^ ?mono ?$|^ ?monospace ?$/i;
    //Check if the font definitions are valid
    function check_fonts(font_var,fvname) {
        var fl=font_var.split(',');
        for (i=0;i<fl.length;i++) {
            if (!(fl[i].match(/^[^" ][^"]+[^" ]$|^"[^ ][^"]+[^ ]"$/))) {
                alert("Check your font definition: "+fl[i]+" in "+fvname);
                return false;
            }
        }
        return true;
    }
    if (check_fonts(CJKdefault,'CJKdefault')===false)
        return false;
    else if (check_fonts(CJKserif,'CJKserif')===false)
        return false;
    else if (check_fonts(CJKsans,'CJKsans')===false)
        return false;
    else if (check_fonts(CJKBold,'CJKBold')===false)
        return false;
    else if (check_fonts(LatinInSimSun,'LatinInSimSun')===false)
        return false;
    else if (check_fonts(LatinSans,'LatinSans')===false)
        return false;
    else if (check_fonts(LatinSerif,'LatinSerif')===false)
        return false;
    else if (check_fonts(LatinMono,'LatinMono')===false)
        return false;
    else {
    }
    //fucntion to check matches
    function list_has(font_str,family ) {
        var allfonts=font_str.split(',');
        for (var j=0,maxl=allfonts.length;j< maxl;j++) {
            if (allfonts[j].match(family)) {
                return j;
            }
        }
        return false;
    }
    //alert(list_has('sans-serif,sans011,serif',re_sans0) !== false);
    //return true;
    function replace_font(font_str,family,qBold) {
        var allfonts=font_str.split(',');
        var j=0;
        var maxl=allfonts.length;
        for (j=0;j< maxl;j++) {
            if (allfonts[j].match(family)) {
                allfonts[j]=qBold;
            }
        }
        var toReturn=allfonts[0];
        for (j=1;j< maxl;j++) {
            toReturn=toReturn+','+allfonts[j];
        }
        //alert(qBold);
        return toReturn;
    }
    function has_genfam(font_str) {
        //Test if font_str include general families.
        if (list_has(font_str,re_sans0)){
            return true;
        }
        else if (list_has(font_str,re_serif)){
            return true;
        }
        else if (list_has(font_str,re_mono0)){
            return true;
        }
        return false;
    }
    /// First round: Replace all bold fonts to CJKBold ///
    for (i=0; i < max; i++) {
        child = all[i].firstChild;
        if_replace = false;
        //Only change if current node (not child node) contains CJK characters.
        font_str = window.getComputedStyle(all[i], null).getPropertyValue('font-family');
        fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
        while (child) {
            if (child.nodeType == 3 && (child.data.match(/[\u3400-\u9FBF]/)) && (fweight == 'bold' || fweight > 500) && (!(font_str.match(sig_bold)))) {
                //Test if contains SimSun
                //all[i].style.color="Blue"; //Bold-->Blue;
                if (font_str.match(re_simsun)) {
                    //all[i].style.color="Sienna"; //SimSun --> Sienna
                    all[i].style.fontFamily = font_str.replace(re_simsun, qBold);
                    if (!(has_genfam(all[i].style.fontFamily))) {
                        all[i].style.fontFamily=all[i].style.fontFamily+','+'sans-serif';
                    }
                }
                //Test if contains Sans
                else if (list_has(font_str, re_sans0) !== false ) {
                    //all[i].style.color="Salmon";
                    all[i].style.fontFamily = LatinSans+','+replace_font(font_str,re_sans0,qBold)+','+'sans-serif';
                }
                //Test if contains serif
                else if (list_has(font_str, re_serif) !== false ) {
                    //all[i].style.color="SeaGreen";
                    all[i].style.fontFamily = LatinSerif+','+replace_font(font_str,re_serif,qBold)+','+'serif';
                }
                //Test if contains monospace
                else if (list_has(font_str, re_mono0) !== false ) {
                    //all[i].style.color="Maroon";
                    all[i].style.fontFamily = LatinMono+','+replace_font(font_str,re_mono0,qBold)+','+'monospace';
                }
                //Just append the fonts to the font preference list.
                else {
                    //all[i].style.color="Fuchsia"; //qBold+"false-safe" sans-serif;
                    all[i].style.fontFamily = font_str+','+qBold+','+'  sans-serif';
                    //alert(all[i].style.fontFamily);
                }
            }
            child = child.nextSibling;
        }
    }
    if (FixRegular===false) {
        return false;
    }
    /// Second Round: Deal with regular weight. ///
    max=all.length;
    for (i=0; i < max; i++) {
        child = all[i].firstChild;
        if_replace = false;
        //Only change if current node (not child node) contains CJK characters.
        font_str = window.getComputedStyle(all[i], null).getPropertyValue('font-family');
        fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
        //alert(child.nodeType);
        while (child) {
            if (child.nodeType == 3) {
                //all[i].style.color='Teal'; //text-->teal;
                //Just check and fix the improper SimSun use
                if (font_str.match(re_simsun)) {
                    //all[i].style.color="Sienna";
                    if (fweight == 'bold' || fweight > 500) {
                        //all[i].style.color="Grey";
                        if_replace=false;
                        //alert(child.data);
                        //return false;
                    }
                    else {
                        //all[i].style.color="Orange";
                        if (font_str.match(sig_sun) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default)) {
                            //do nothing if already replaced;
                            //all[i].style.color="Grey";
                            if_replace=false;
                        }
                        else {
                            //all[i].style.color="Indigo"; //Improperly used SimSun. It shouldn't be used for non-CJK fonts.
                            all[i].style.fontFamily = font_str.replace(re_simsun, qSimSun);
                            if (!(has_genfam(all[i].style.fontFamily))){
                                all[i].style.fontFamily=all[i].style.fontFamily+','+'sans-serif';
                            }
                            //all[i].style.color="Indigo"; //Improperly used SimSun. It shouldn't be used for non-CJK fonts.
                            if_replace=false;
                            //all[i].style.color="Grey";
                        }
                    }
                }
                if (child.data.match(/[\u3400-\u9FBF]/)) {
                    if_replace=true;
                    //all[i].style.color="Cyan"; //CJK-->Cyan
                    if (font_str.match(sig_sun) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default)) {
                        //do nothing if already replaced;
                        //all[i].style.color="Black";
                        if_replace=false;
                    }
                    //break;
                }
            }
            child = child.nextSibling;
        }
        //continue;
        if (if_replace === true) {
            //Test if contains Sans
            if (list_has(font_str, re_sans0) !== false ) {
                //all[i].style.color="Salmon";
                all[i].style.fontFamily = replace_font(font_str,re_sans0,qsans);
            }
            //Test if contains serif
            else if (list_has(font_str, re_serif) !== false ) {
                //all[i].style.color="SeaGreen";
                all[i].style.fontFamily = replace_font(font_str,re_serif,qserif);
            }
            //Test if contains monospace
            else if (list_has(font_str, re_mono0) !== false ) {
                //all[i].style.color="Maroon";
                all[i].style.fontFamily = replace_font(font_str,re_mono0,qmono);
            }
            else {
                //all[i].style.color='Fuchsia';
                if (font_str.match(re_simsun)) {
                    //all[i].style.color='Fuchsia';
                    //This is needed because some elements cannot be captured in "child elements" processing. (Such as the menues on JD.com) No idea why.
                    all[i].style.fontFamily = font_str.replace(re_simsun, qSimSun)+','+'serif';
                }
                else {
                    //all[i].style.color='Fuchsia';
                    all[i].style.fontFamily = font_str + ',' + qCJK +','+'sans-serif';
                }
            }
        }
    }
    /// The final round: Add CJKdefault to all elements ///
    if (FixMore===false) {
        return false;
    }
    max=all.length;
    for (i=0; i < max; i++) {
        font_str = window.getComputedStyle(all[i], null).getPropertyValue('font-family');
        if (!(font_str.match(sig_sun) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default))) {
            if (list_has(font_str, re_sans0) !== false ) {
                //all[i].style.color="Salmon";
                all[i].style.fontFamily = replace_font(font_str,re_sans0,qsans);
            }
            //Test if contains serif
            else if (list_has(font_str, re_serif) !== false ) {
                //all[i].style.color="SeaGreen";
                all[i].style.fontFamily = replace_font(font_str,re_serif,qserif);
            }
            //Test if contains monospace
            else if (list_has(font_str, re_mono0) !== false ) {
                //all[i].style.color="Maroon";
                all[i].style.fontFamily = replace_font(font_str,re_mono0,qmono);
            }
            else {
                //all[i].style.color='Fuchsia';
                if (font_str.match(re_simsun)){
                    //all[i].style.color='Fuchsia';
                    //This is needed because some elements cannot be captured in "child elements" processing. (Such as the menues on JD.com) No idea why.
                    all[i].style.fontFamily = font_str.replace(re_simsun, qSimSun)+','+'serif';
                }
                else {
                    //all[i].style.color='Fuchsia';
                    all[i].style.fontFamily = font_str + ',' + qCJK +','+'sans-serif';
                }
            }
        }
    }
    /// NOT IMPLEMENTED YET ///
    if (FixPunct===false) {
        return false;
    }
    else {
        return true;
    }
}
) ();
