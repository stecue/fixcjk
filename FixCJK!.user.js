// ==UserScript==
// @name              FixCJK!
// @name:zh-CN        “搞定”CJK！
// @namespace         https://github.com/stecue/fixcjk
// @version           1.1.6
// @description       1) Use real bold to replace synthetic SimSun bold; 2) Regular SimSun/中易宋体 can also be substituted; 3) Reassign font fallback list (Latin AND CJK). Browser serif/sans settings are overridden; 4) Use Latin fonts for Latin part in Latin/CJK mixed texts; 5) Fix fonts and letter-spacing for CJK punctuation marks.
// @description:zh-cn 中文字体和标点设定及修正脚本
// @author            stecue@gmail.com
// @license           GPLv3
// @match             http://*/*
// @match             https://*/*
// @match             file:///*
// @exclude           https://*jsfiddle.net*/*
// @exclude           http://dnf.qq.com/main.shtml
// @grant             GM_addStyle
// ==/UserScript==
(function () {
    'use strict';
    // You can change the the following fonts/settings until the "var FixPunct=" line.
    var CJKdefault = '"Microsoft YaHei",SimSun,"WenQuanYi Zen Hei Sharp","WenQuanYi Micro Hei"'; //The default CJK font if no sans or serif is specified. Regular weight.
    var CJKSimSun= '"Microsoft YaHei","WenQuanYi Micro Hei"'; //Fonts to replace SimSun;
    var CJKserif = '"Microsoft YaHei","WenQuanYi Micro Hei"'; //Default serif fonts for CJK. Although It is intended for regular weight but some element with bold weight still use the font here. Therefore "SimSun" itself is not a good choice because it does not have a real bold font.
    var CJKsans = '"Microsoft YaHei","Noto Sans CJK SC","Noto Sans CJK SC Regular"'; //Sans-serif fonts for CJK. Regular weight.
    var CJKBold = '"Microsoft YaHei","WenQuanYi Micro Hei"'; //The "good CJK font" to replace SimSun bold. Note that some elements still use font in CJKserif defined above such as the menus on JD.com.
    var CJKPunct = 'Noto Sans CJK SC,SimHei,SimSun'; //The font to use for CJK quotation marks.
    var LatinInSimSun = 'Ubuntu Mono'; //The Latin font in a paragraph whose font was specified to "SimSun" only.
    var LatinSans = 'Lato,"Open Sans",Arial'; //Sans-serif fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var LatinSerif = 'Constantia,"Liberation Serif","Times New Roman"'; //Serif fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var LatinMono = 'Consolas,"DejaVu Sans Mono"'; //Monospace fonts for Latin script. It will be overridden by  a non-virtual font in the CSS font list if present.
    var FixRegular = true; //Also fix regular fonts. You need to keep this true if you want to use "LatinInSimSun" in Latin/CJK mixed context.
    var FixMore = true; //Appendent CJK fonts to all elements. No side effects found so far.
    var FixPunct = true; //If Latin punctions in CJK paragraph need to be fixed. Usually one needs full-width punctions in CJK context. Turn it off if the script runs too slow or HTML strings are adding to your editing area.
    var useJustify = true; //Make justify as the default alignment.
    ///=== "Safe" Zone Ends Here.Do not change following code unless you know the results! ===///
    var timeOut=3000; //allow maximum 3.0 seconds to run this script.
    var maxlength = 1100200; //maximum length of the page HTML to check for CJK punctuations.
    var maxNumElements = 81024; // maximum number of elements to process.
    var CJKOnlyThreshold = 11024; // Only CJK if the number of elements reaches this threshold.
    var noBonusLength = 11024; //no bonus functions such as fixing "reversed" pairs.
    var noBonusTimeout = 20; //Longest time (in ms) to run bonus functions for each element.
    var sqz_timeout=50; // 50ms per element seems long enough.
    var invForLimit=6; //the time limit factor (actual limit is timeOut/invForLimit) for the "for loop" in Round 2 & 3.
    var processedAll=true;
    var ifRound1=true;
    var ifRound2=true;
    var ifRound3=true;
    var debug_verbose = false; //show/hide more information on console.
    var debug_00 = false; //debug codes before Rounds 1/2/3/4.
    var debug_01 = false; //Turn on colors for Round 1.
    var debug_02 = false;
    var debug_03 = false;
    var debug_04 = false;
    var debug_labelCJK = false;
    var debug_re_to_check = false; //"true" might slow down a lot!
    var debug_spaces =false;
    var debug_wrap = false;
    var debug_tagSeeThrough = false;
    var debug_getBeforeTags = false;
    var debug_noWrapping = false;
    var debug_asyncTimers = true;
    var useWrap=true;
    var useRemoveSpacesForSimSun=false;
    var useFeedback=false;
    var useCSSforSimSun=false;
    var useDelayedFix=false;
    var useTimeout=false;
    var useSFTags=false; //FIXME: use tags may cause problems on jd.com.
    var re_allpuncts=/[、，。：；！？）】〉》」』『「《〈【（“”‘’]/
    var re_to_check = /^\uEEEE/; //use ^\uEEEE for placeholder. Avoid using the "m" or "g" modifier for long document, but the difference seems small?
    ///=== The following variables should be strictly for internal use only.====///
    var refixing=false;
    var refixingFonts=false;
    var rspLength=3; //If the font-list reaches the length here, the author is probably responsible enough to cover most Latin/English environment.
    var waitForDoubleClick=200;
    var SkippedTagsForFonts=/^(HTML|TITLE|HEAD|LINK|BODY|SCRIPT|noscript|META|STYLE|AUDIO|video|source|AREA|BASE|canvas|figure|map|object|textarea)$/i;
    var SkippedTagsForMarks=/^(HTML|TITLE|HEAD|LINK|BODY|SCRIPT|noscript|META|STYLE|AUDIO|video|source|AREA|BASE|canvas|embed|figure|map|object|textarea|input|code|pre|time|tt|BUTTON|select|option|label|fieldset|datalist|keygen|output)$/i;
    var SkippedTags=SkippedTagsForFonts;
    var pureLatinTags=/^(TITLE|HEAD|LINK|SCRIPT|META|STYLE|AUDIO|video|source|AREA|BASE|canvas|figure|map|object|textarea|svg)$/i; //No CJK labeling for the elements and their desedents.
    var stopTags=/^(SUB|SUP|BR|VR)$/i; //The "see-through" stops at these tags.
    var stopClasses='mw-editsection';
    var upEnoughTags=/^(address|article|aside|blockquote|canvas|dd|div|dl|dt|fieldset|figcaption|figure|footer|form|H[1-6]|header|hgroup|hr|li|main|nav|noscript|ol|output|p|pre|section|table|td|th|tr|tfoot|ul|video|BODY)$/ig; //"See-Through" stops here, the "block-lelvel" elements.
    var ignoredTags=/^(math)$/i;
    var preOrigPunctSpaceList='pl-c,toggle-comment,answer-date-link'; //Also known as "no wrapping list". Only wrapped CJK will be treated.
    var preSimSunList='c30,c31,c32,c33,c34,c35,c36,c37,c38,c39,c40,c41,c42,c43,c44,c45,c46';
    var preSimSunTags=/^(pre|code|tt)$/i;
    var CJKclassList='CJK2Fix,MarksFixedE135,FontsFixedE137,\uE211,\uE985,Safe2FixCJK\uE000,PunctSpace2Fix,CJKTestedAndLabeled,SimSun2Fix,SimSunFixedE137,LargeSimSun2Fix,\uE699,checkSpacedQM,wrappedCJK2Fix,preCode,preMath,SpacesFixedE133';
    var re_autospace_url=/zhihu\.com|guokr\.com|changhai\.org|wikipedia\.org|greasyfork\.org|github\.com/;
    var preCodeTags='code,pre,tt'; //Is this the same as "SkippedTagsForMarks"?
    var preMathTags='math'; //Do not change puncts as well as fonts. Just like "math".
    var t_start = performance.now();
    var t_stop = t_start;
    var re_simsun = / *simsun *| *宋体 *| *ËÎÌå *| *\5b8b\4f53 */i;
    var all = document.getElementsByTagName('*');
    var NumAllDOMs=all.length;
    var bodyhtml=document.getElementsByTagName("HTML");
    if (bodyhtml[0].innerHTML.length > maxlength) {
        console.log('FixCJK!: HTML too long, skip everything. Exiting now...');
        ifRound1=false;
        ifRound2=false;
        ifRound3=false;
        FixPunct=false;
    }
    else if (!(bodyhtml[0].innerHTML.match(/[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/))) {
        if (debug_verbose===true) {console.log('FixCJK!: Checking for CJK took '+((performance.now()-t_stop)/1000.0).toFixed(3)+' seconds. No CJK found.');}
        if (debug_verbose===true) {console.log('FixCJK!: No need to check CJK punctuations.');}
        FixPunct=false;
    }
    else {
        if (debug_verbose===true) {console.log('FixCJK!: Checking for CJK took '+((performance.now()-t_stop)/1000.0).toFixed(3)+' seconds. CJK found.');}
        FixPunct=true;
    }
    var sig_sim = 'RealCJKBold\u0020易'; //Just for SimSun;
    var sig_song = 'RealCJKBold\u0020宋'; // signature to check if change is sucssful or not.
    var sig_hei = 'RealCJKBold\u0020黑'; // signature to check if change is sucssful or not.
    var sig_bold = 'RealCJKBold\u0020粗'; // signature to check if change is sucssful or not.
    var sig_default = 'RealCJKBold\u0020默'; // signature to check if change is sucssful or not.
    var sig_mono= 'RealCJKBold\u0020均';
    var sig_punct = '\uE135'; //will be attached to CJKPunct; This is used in punct fixing not font fixing(?)
    var qsig_sim = '"' + sig_sim + '"'; //Quoted sinagure; Actually no need to quote.
    var qsig_song= '"'+sig_song+'"';
    var qsig_hei = '"' + sig_hei + '"'; //Quoted sinagure;
    var qsig_bold = '"' + sig_bold + '"';
    var qsig_default = '"' + sig_default + '"';
    var genPunct='General Punct \uE137'; //Different from sig_punct
    var qpreCJK = CJKdefault;
    var qCJK = LatinInSimSun + ',' + CJKdefault + ',' + qsig_default;
    var qSimSun = qsig_sim+','+LatinInSimSun + ',' + CJKSimSun;
    var qLargeSimSun = qsig_sim+','+ LatinSerif + ',' + 'SimSun';
    var qBold = LatinInSimSun + ',' + CJKBold + ',' + qsig_bold;
    var qsans = LatinSans + ',' + CJKsans + ',' + qsig_hei + ',' + 'sans-serif'; //To replace "sans-serif"
    var qserif = LatinSerif + ',' + CJKserif +','+qsig_song+ ',' + 'serif'; //To replace "serif"
    var qmono = sig_mono+','+LatinMono + ',' + CJKdefault + ',' + qsig_default + ',' + 'monospace'; //To replace "monospace".
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
    var kern_consec_ll='-0.35em'; //。” or ））
    var kern_consec_rr='-0.35em'; //（（
    var kern_consec_lr='-0.8em'; //）（
    var kern_ind_open='-0.22em';
    var kern_ind_close='-0.22em';
    //Check if the font definitions are valid
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
    if (debug_00===true) {console.log(dequote('"SimSun","Times New Roman"""""'));}
    //Assign fonts for puncts:
    alert(AddLocal(CJKPunct));
    var punctStyle='@font-face { font-family: '+genPunct+';\n src: '+AddLocal(CJKPunct)+';\n unicode-range: U+3000-303F,U+FF00-FFEF;}';
    punctStyle=punctStyle+'\n@font-face {font-family:RealCJKBold\u0020易;\n src:local(SimHei);\n unicode-range: U+A0-B6,U+B8-2FF,U+2000-2017,U+201E-2FFF;}';
    punctStyle=punctStyle+'\n@font-face {font-family:SimVecA;\n src:local(Ubuntu Mono);\n unicode-range: U+0-7F;}';
    punctStyle=punctStyle+'\n@font-face {font-family:SimVecS;\n src:local(SimHei);\n unicode-range: U+A0-33FF;}';
    punctStyle=punctStyle+'\n@font-face {font-family:SimVecC;\n src:local(Microsoft YaHei);\n unicode-range: U+3400-9FBF;}';
    if (useCSSforSimSun===true) {
        punctStyle=punctStyle+'\n @font-face { font-family: SimSun;\n src: local('+FirstFontOnly('SimSun')+');\n unicode-range: U+3400-9FBF;}';
        punctStyle=punctStyle+'\n @font-face { font-family: 宋体;\n src: local('+FirstFontOnly('SimSun')+');\n unicode-range: U+3400-9FBF;}';
        punctStyle=punctStyle+'\n @font-face { font-family: ËÎÌå;\n src: local('+FirstFontOnly('SimSun')+');\n unicode-range: U+3400-9FBF;}';
        punctStyle=punctStyle+'\n @font-face { font-family: 宋体;\n src: local('+FirstFontOnly(LatinInSimSun)+');\n unicode-range: U+0000-2C7F;}';
    }
    if (debug_00===true) console.log(punctStyle);
    GM_addStyle(punctStyle);
    ///----------------------------
    qpreCJK = dequote(qpreCJK);
    qCJK = dequote(qCJK);//LatinInSimSun + ',' + CJKdefault + ',' + qsig_default;
    qSimSun = dequote(qSimSun);//LatinInSimSun + ',' + CJKserif + ',' + qsig_sun;
    qLargeSimSun = dequote(qLargeSimSun);//LatinInSimSun + ',' + CJKserif + ',' + qsig_sun;
    qBold = dequote(qBold);//LatinInSimSun + ',' + CJKBold + ',' + qsig_bold;
    qsans = dequote(qsans);//LatinSans + ',' + CJKsans + ',' + qsig_hei + ',' + 'sans-serif'; //To replace "sans-serif"
    qserif = dequote(qserif);//LatinSerif + ',' + CJKserif + ',' + qsig_sun + ',' + 'serif'; //To replace "serif"
    qmono = dequote(qmono);//LatinMono + ',' + CJKdefault + ',' + qsig_default + ',' + 'monospace'; //To replace "monospace".
    CJKPunct=dequote(CJKPunct)+','+sig_punct;
    if (debug_00===true) {console.log('Entering Loops...');}
    /// ===== Labeling CJK elements === ///
    t_stop=performance.now();
    var debug_addTested=false;
    function addTested (node,currLevel) {
        if (currLevel > 5) {
            if (debug_addTested===true) console.log("TOO MANY LEVELS, exiting addTested()...");
            return false;
        }
        var child=node.firstChild;
        while (child) {
            if (child.nodeType===1) {
                addTested(child,currLevel+1);
            }
            child=child.nextSibling;
        }
        if (node.classList.contains("CJKTestedAndLabeled")) {
            if (debug_addTested===true) console.log("Labeled: "+node.nodeName);
            return true;
        }
        else {
            node.classList.add("CJKTestedAndLabeled");
            if (debug_addTested===true) console.log("Labeled: "+node.nodeName);
            return true;
        }
    }
    function labelCJKByNode(node,levelIndex) {
        var t_stop=performance.now();
        if (node instanceof SVGElement) {
            return false;
        }
        //One do need to recheck the textContent everytime "ReFix" is triggered.
        if ( (levelIndex < 2) && (!node.textContent.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/)) ) {
            if (!node.classList.contains("CJKTestedAndLabeled")) {
                window.setTimeout(addTested,5,node,0);
            }
            return true;
        }
        var font_str=dequote(window.getComputedStyle(node, null).getPropertyValue('font-family'));
        var child=node.firstChild;
        while (child) {
            if (child.nodeType===3) {
                if (node.classList.contains("CJKTestedAndLabeled") || node.nodeName.match(SkippedTags)) {
                    //Do nothing if already labeled.
                }
                else if (font_str.match(re_simsun)) {
                    if (inTheClassOf(node,preSimSunList) || node.nodeName.match(preSimSunTags)) {
                        node.style.fontFamily=font_str.replace(re_simsun,'SimVecA,SimVecS,SimVecC');
                        node.classList.add("CJK2Fix");
                        node.classList.add("CJKTestedAndLabeled");
                    }
                    else {
                        var font_size=(window.getComputedStyle(node, null).getPropertyValue('font-size')).slice(0,-2);
                        if (font_size < 18) {
                            node.classList.add("CJK2Fix");
                            node.classList.add("SimSun2Fix");
                            if (!inTheClassOf(node,preOrigPunctSpaceList)) {
                                node.classList.add("PunctSpace2Fix");
                            }
                        }
                        else {
                            //node.style.fontFamily=font_str; //Is this to improve the speed?
                            node.classList.add("CJK2Fix");
                            node.classList.add("LargeSimSun2Fix");
                            if (!inTheClassOf(node,preOrigPunctSpaceList)) {
                                node.classList.add("PunctSpace2Fix");
                            }
                        }
                    }
                }
                else if (child.data.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/)) {
                    node.classList.add("CJK2Fix");
                    if (!inTheClassOf(node,preOrigPunctSpaceList)) {
                        node.classList.add("PunctSpace2Fix");
                    }
                }
            }
            else if (child.nodeType===1) {
                labelCJKByNode(child,levelIndex+1);
            }
            child=child.nextSibling;
        }
        node.classList.add("CJKTestedAndLabeled");
        return true;
    }
    function labelCJK(useCJKTimeOut) {
        var useBFS=false;
        var child=document.body.firstChild;
        var all='';
        if (useBFS===true) {
            while (child) {
                if (child.nodeType===1) {
                    //The levelIndex of document.body is 0.
                    labelCJKByNode(child,1);
                }
                child=child.nextSibling;
            }
            return true;
        }
        //Skip wrapping CJK for anchors to javascripts, otherwise the anchors will break.
        all=document.querySelectorAll('a:not(.preCode)');
        for (var ia=0;ia<all.length;ia++){
            if (all[ia].classList.contains("CJKTestedAndLabeled")) {
                continue;
            }
            if(all[ia].nodeName.match(/^A$/i) && all[ia].href.match(/^javascript/i) && (all[ia].textContent.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/)) ) {
                all[ia].classList.add("preCode"); //No wrapping if in the "preCode" class.
            }
        }
        all=document.querySelectorAll(":not(.CJKTestedAndLabeled)");
        if (useCJKTimeOut===false) {
            console.log(all.length+" elements to check and label. From");
            console.log(all[0]);
            console.log('To');
            console.log(all[all.length-1]);
        }
        var t_stop=performance.now();
        var t_last=0;
        var t_init=t_stop;
        var t_overall=0;
        for (var i=0;i < all.length;i++) {
            if (useCJKTimeOut===true) { //useCJKTimeOut===false is the "Engineering mode".
                t_last=performance.now()-t_stop;
                t_stop=performance.now();
                t_overall=performance.now()-t_init;
            }
            if (i>0 && t_last>20) {
                if ( debug_labelCJK===true) {
                    console.log("FIXME: Curr: ");
                    console.log(all[i]);
                    console.log("FIXME: Prev: ");
                    console.log(all[i-1]);
                    console.log("Labeling Last elemnent: <"+all[i-1].nodeName+">.("+all[i-1].className+") took "+t_last.toFixed(1)+" ms.");
                }
                if (t_last>100) {
                    console.log("FIXME: Labeling last element took too much time. Too slow to labelCJK after "+t_overall.toFixed(1)+" ms.");
                    console.log("FIXME: Only "+document.getElementsByClassName("CJKTestedAndLabeled").length+" tested in total on "+document.URL);
                    if (debug_labelCJK===true) {console.log(all[i-1]);}
                    break;
                }
            }
            if (i%1===0 && t_overall>200) {
                console.log("FIXME: Too slow to labelCJK after "+t_overall.toFixed(1)+" ms.");
                console.log("FIXME: Only "+document.getElementsByClassName("CJKTestedAndLabeled").length+" tested in total on "+document.URL);
                if (debug_labelCJK===true) {console.log(all[i-1]);}
                break;
            }
            if ((all[i].nodeName.match(SkippedTags)) || all[i] instanceof SVGElement || all[i].classList.contains("CJKTestedAndLabeled")){
                if (debug_labelCJK===true && t_last>10 ) console.log("SKIPPED: "+all[i].nodeName);
                window.setTimeout(function (node) {node.classList.add("CJKTestedAndLabeled");},1,all[i]); //This is the most time consuming part. Trying to use async i/o.
                if (all[i].nodeName.match(pureLatinTags)) {
                    if (useCJKTimeOut===true) {
                        window.setTimeout(addTested,5,all[i],0);
                    }
                    else {
                        window.setTimeout(addTested,5,all[i],-1000); //Means no limits in actual webpages.
                    }
                }
                continue;
            }
            font_str=dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
            if (inTheClassOf(all[i],preSimSunList) || all[i].nodeName.match(preSimSunTags)) {
                all[i].style.fontFamily=font_str.replace(re_simsun,'SimVecA,SimVecS,SimVecC');
                all[i].classList.add("CJK2Fix");
                all[i].classList.add("CJKTestedAndLabeled");
                continue;
            }
            if (debug_01===true) console.log(font_str);
            if (font_str.match(re_simsun)) {
                var font_size=(window.getComputedStyle(all[i], null).getPropertyValue('font-size')).slice(0,-2);
                if (font_size < 18) {
                    all[i].classList.add("CJK2Fix");
                    all[i].classList.add("SimSun2Fix");
                    if (!inTheClassOf(all[i],preOrigPunctSpaceList) && all[i].contentEditable!=="true") {
                        all[i].classList.add("PunctSpace2Fix");
                        if ( all[i].textContent.match(/\w\s[\u3400-\u9FBF]|[\u3400-\u9FBF]\s\w/) && !all[i].textContent.match(re_allpuncts)){
                            //Do not wrap if already using "spaces" and no puncts
                            all[i].classList.remove("PunctSpace2Fix");
                            all[i].classList.add("preCode");
                        }
                    }
                }
                else {
                    //all[i].style.fontFamily=font_str; //Is this to increase the speed?
                    all[i].classList.add("CJK2Fix");
                    all[i].classList.add("LargeSimSun2Fix");
                    if (!inTheClassOf(all[i],preOrigPunctSpaceList) && all[i].contentEditable!=="true") {
                        all[i].classList.add("PunctSpace2Fix");
                        if ( all[i].textContent.match(/\w\s[\u3400-\u9FBF]|[\u3400-\u9FBF]\s\w/) && !all[i].textContent.match(re_allpuncts)){
                            //Do not wrap if already using "spaces" and no puncts
                            all[i].classList.remove("PunctSpace2Fix");
                            all[i].classList.add("preCode");
                        }
                    }
                }
                all[i].classList.add("CJKTestedAndLabeled");
                continue;
            }
            if ( !(all[i].textContent.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/)) ){
                if ( useCJKTimeOut===true && all[i].textContent.length > 20 && (font_str.split(',').length >= rspLength) ) { //20 is just to make sure they are actuall Latin elements,not just some place holder.
                    window.setTimeout(function (node) {node.classList.add("CJKTestedAndLabeled");},1,all[i]); //This is the most time consuming part. Trying to use async i/o.
                    window.setTimeout(addTested,5,all[i],0);//Still, it might cause some childs to be "unfixable", if the length of the place holder is longer than 100...
                    continue;
                }
                else if (useCJKTimeOut===false && (font_str.split(',').length >= rspLength) ) {
                    window.setTimeout(function (node) {node.classList.add("CJKTestedAndLabeled");},1,all[i]); //This is the most time consuming part. Trying to use async i/o.
                    if (debug_labelCJK===true) {console.log("Labeling non-CJK element: ");console.log(all[i]);}
                    window.setTimeout(addTested,5,all[i],-1000);//Still, it might cause some childs to be "unfixable", if the length of the place holder is longer than 100...
                    continue;
                }
                else {
                    //Just skip here. Might be important in the future.
                    continue;
                }
            }
            child = all[i].firstChild;
            while (child) {
                var realSibling=child.nextSibling;
                if (child.nodeType == 3 && (child.data.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/))) {
                    all[i].classList.add("CJK2Fix");
                    if (!inTheClassOf(all[i],preOrigPunctSpaceList) && all[i].contentEditable!=="true") {
                        all[i].classList.add("PunctSpace2Fix");
                        if ( all[i].textContent.match(/\w\s[\u3400-\u9FBF]|[\u3400-\u9FBF]\s\w/) && !all[i].textContent.match(re_allpuncts)){
                            //Do not wrap if already using "spaces" and no puncts
                            all[i].classList.remove("PunctSpace2Fix");
                            all[i].classList.add("preCode");
                        }
                    }
                    //Do I need to test the parentNode? I deleted them in 1.1.3
                    break;
                }
                child=realSibling;
            }
            all[i].classList.add("CJKTestedAndLabeled");
        }
    }
    //return true;
    //Do not try to fixpuncts if it is an English site. Just trying to save time.
    labelPreMath();
    labelCJK(true);
    if ((document.getElementsByClassName('CJK2Fix')).length < 1) {
        FixPunct=false;
    }
    if (debug_verbose===true) {console.log('FixCJK!: Labling took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
    ///===FixFonts, Rounds 1-3===///
    FixAllFonts();
    ///===Round 4, FixPunct===///
    if (debug_verbose===true) {console.log('FixCJK!: Labling and Fixing fonts took '+((t_stop-t_start)/1000).toFixed(3)+' seconds.');}
    if ((t_stop-t_start)*2 > timeOut || max > maxNumElements ) {
        console.log('FixCJK!: Too slow or too many elements.');
        FixPunct=false;
    }
    if (FixPunct===false) {
        if (debug_verbose===true) {console.log('FixCJK!: Skipping fixing punctuations...');}
    }
    var returnNow=true;
    var returnLater=false; //Do the actual fixing.
    var MaxNumLoops=1;
    if (useDelayedFix===true) {
        var DelayedTimer=200;
        window.setTimeout(FunFixPunct(true,MaxNumLoops,returnLater),DelayedTimer);
    }
    else {
        window.setTimeout(function () {
            labelPreCode();
            labelNoWrappingList();
            if (useWrap===true) wrapCJK();
            FunFixPunct(true,MaxNumLoops,returnLater);
        },10);
    }
    ///===End of Solving the picture problem===///
    if (debug_verbose===true) {console.log('FixCJK!: Fixing punctuations took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
    ///===Add onClick listener before exiting===///
    var NumClicks=0;
    var t_last=performance.now();
    var t_interval=1000; //The interval between two checks.
    var NumAllCJKs=(document.getElementsByClassName('CJK2Fix')).length;
    var NumPureEng=0;
    var LastURL=document.URL;
    var LastMod=document.lastModified;
    var ItvScl=2.0; //Real "cooling down time" is t_interval/ItvScl
    if (NumAllCJKs*1.0/NumAllDOMs*100 < 1.0) {
        NumPureEng++;
    }
    //document.onClick will cause problems on some webpages on Firefox.
    var downtime=performance.now();
    var downX=0;
    var downY=0;
    document.body.addEventListener("mousedown",function (e){downtime=performance.now();downX=e.clientX;downY=e.clientY;},false);
    document.body.addEventListener("mouseup",function (e){
        if (e.button>0 ) {
            //do nothing if right button clicked.
            return true;
        }
        else if (((performance.now()-downtime) < 300) && (Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)) ===0 ) {
            //ReFix after other things are done.
            setTimeout(ReFixCJK,5,e);
        }
        else if (((performance.now()-downtime) > 1500) && (Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)) ===0 ) {
            //Force to labelCJK;
            var t_CJK=performance.now();
            labelPreMath();
            labelCJK(false);
            FixAllFonts(false);
            labelPreCode();
            labelNoWrappingList();
            if (useWrap===true) wrapCJK();
            FunFixPunct(false,5,false);
            addSpaces(false);
            t_CJK=performance.now()-t_CJK;
            console.log("Labeling and fixing all CJK elements took "+(t_CJK/1000).toFixed(1)+" seconds.");
        }
    },false);
    var fireReFix=false;
    window.addEventListener("scroll",function (e){
        fireReFix=false; //Prevent from firing ReFixCJK() while scrolling.
        setTimeout(function() {fireReFix=true;},t_interval/ItvScl/2); //Permit ReFixCJK after sometime of last scrolling.
        setTimeout(function() {
            if (fireReFix===true) {
                ReFixCJKFontsOnly();
            }
        },t_interval);
    },false);
    document.body.addEventListener("dblclick",function() {
        addSpaces(true);
        //Prevent ReFixing for a certain time;
    },false);
    ///===Time to exit the main function===///
    var t_fullstop=performance.now();
    if (processedAll===true) {
        console.log('FixCJK!: NORMAL TERMINATION: '+((t_fullstop-t_start)/1000).toFixed(3)+' seconds (Fixing PMs not included) is the overall execution time. No skipped step(s).');
    }
    else {
        console.log('FixCJK!: EXECUTION ABORTED: '+((t_fullstop-t_start)/1000).toFixed(3)+' seconds (Fixing PMs not included) is the overall execution time. Some step(s) were skipped due to performance issues.');
    }
    ////////////////////======== Main Function Ends Here ==============/////////////////////////////
    //===The actual listening functions===//
    function labelPreMath() {
        var bannedTagList=preMathTags.split(',');
        for (var itag=0;itag<bannedTagList.length;itag++) {
            var all2Ban=document.querySelectorAll(bannedTagList[itag]+":not(.preMath)");
            for (var iele=0;iele<all2Ban.length;iele++) {
                banMathHelper(all2Ban[iele]);
            }
        }
    }
    function labelPreCode() {
        var bannedTagList=preCodeTags.split(',');
        for (var itag=0;itag<bannedTagList.length;itag++) {
            var all2Ban=document.getElementsByTagName(bannedTagList[itag]);
            for (var iele=0;iele<all2Ban.length;iele++) {
                banHelper(all2Ban[iele]);
            }
        }
    }
    function labelNoWrappingList() {
        var ie=0;
        var bannedClassList=preOrigPunctSpaceList.split(',');
        for (var i=0;i<bannedClassList.length;i++) {
            var all2Ban=document.getElementsByClassName(bannedClassList[i]);
            for (ie=0;ie<all2Ban.length;ie++)
                banHelper(all2Ban[ie]);
        }
        var bannedElementList=document.querySelectorAll('[contenteditable="true"]');
        for (ie=0;ie<bannedElementList.length;ie++) {
            if (debug_noWrapping===true) console.log(bannedElementList[ie]);
            banHelper(bannedElementList[ie]);
        }
    }
    function banHelper(node) {
        var child=node.firstChild;
        while (child) {
            if ( child.nodeType===1 && !(child instanceof SVGElement) ) {
                banHelper(child);
            }
            child=child.nextSibling;
        }
        if (!node.classList.contains("preCode")) {
            node.classList.add("preCode");
        }
    }
    function banMathHelper(node) {
        var child=node.firstChild;
        while (child) {
            if ( child.nodeType===1 && !(child instanceof SVGElement) ) {
                banMathHelper(child);
            }
            child=child.nextSibling;
        }
        node.classList.add("CJKTestedAndLabeled");
        node.classList.add("FontsFixedE137");
        node.classList.add("MarksFixedE135");
        node.classList.add("preMath");
    }
    function addSpaces(useTimeout) {
        var t_spaces=performance.now();
        if (debug_spaces===true) console.log('FixCJK!: Adding spaces...');
        var allQ=document.querySelectorAll(".\uE985");
        for (var iq=0;iq<allQ.length;iq++) {
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\u2018/g,'\uEB18');
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\u2019/g,'\uEB19');
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\u201C/g,'\uEB1C');
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\u201D/g,'\uEB1D');
        }
        addSpacesHelper(document.querySelectorAll(".PunctSpace2Fix:not(.SpacesFixedE133)"),performance.now());
        allQ=document.querySelectorAll(".\uE985"); //I need to reselect because the "references" are changed?
        for (iq=0;iq<allQ.length;iq++) {
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\uEB18/g,'\u2018');
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\uEB19/g,'\u2019');
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\uEB1C/g,'\u201C');
            allQ[iq].innerHTML=allQ[iq].innerHTML.replace(/\uEB1D/g,'\u201D');
        }
        if (useRemoveSpacesForSimSun===true) {
            window.setTimeout(removeSpacesForSimSun,10);
        }
        console.log("FixCJK: Adding spaces took "+((performance.now()-t_spaces)/1000).toFixed(3)+" seconds.");
        function getAfterHTML(child) { //FIXME: A recursion block might be needed as getAfter(child)
            var toReturn='';
            var t_start=performance.now();
            var inputNode=child;
            child=child.nextSibling;
            while (child && (performance.now()-t_start)<2 ) {
                if (child.nodeType===3) {
                    toReturn = toReturn + child.data;
                }
                else if (child.nodeType===1 && (window.getComputedStyle(child,null).getPropertyValue("display")!=='none') ) {
                    if (child.nodeName.match(stopTags) || inTheClassOf(child,stopClasses) ) {
                        return toReturn+"上下标";
                    }
                    toReturn = toReturn + displayedText(child);
                }
                if (toReturn.match(/[\w\u3400-\u9FBF]/)) {
                    break;
                }
                child=child.nextSibling;
            }
            if (toReturn.length < 1 && !inputNode.parentNode.nodeName.match(upEnoughTags)) {
                return getAfterHTML(inputNode.parentNode);
            }
            else {
                return (toReturn.replace(/</,'&lt;')).replace(/>/,'&gt;');
            }
        }
        function getBeforeHTML(child) {
            var toReturn='';
            var t_start=performance.now();
            var inputNode=child;
            child=child.previousSibling;
            while (child && (performance.now()-t_start)<2 ) {
                if (child.nodeType === 3) {
                    toReturn = child.data + toReturn;
                }
                else if (child.nodeType === 1 && (window.getComputedStyle(child,null).getPropertyValue("display")!=='none') ) {
                    if (child.nodeName.match(stopTags) || inTheClassOf(child,stopClasses) ) {
                        return "上下标"+toReturn;
                    }
                    toReturn = displayedText(child) + toReturn;
                }
                if (toReturn.match(/[\w\u3400-\u9FBF]/)) {
                    break;
                }
                child=child.previousSibling;
            }
            if (toReturn.length < 1 && !inputNode.parentNode.nodeName.match(upEnoughTags)) {
                return getBeforeHTML(inputNode.parentNode);
            }
            else {
                return (toReturn.replace(/</,'&lt;')).replace(/>/,'&gt;');
            }
        }
        function addSpacesHelper(allE,t_substart) {
            for (var is=0;is<allE.length;is++) {
                if ( !(allE[is].nodeName.match(/CJKTEXT/)) || allE[is].classList.contains("SpacesFixedE133") ) {
                    continue;
                }
                if ( useTimeout===true && (performance.now()-t_substart)> 800) {
                    console.log("Timeout: exiting addSpaces()...");
                    return false;
                }
                if (allE[is].classList.contains("wrappedCJK2Fix") ) {
                    if ( !(allE[is].classList.contains("preCode")) ) {
                        var tmp_str=allE[is].innerHTML;
                        if (tmp_str.match(/^([\s\u0020\u00A0\u2009\u200B-\u200E]|&nbsp;|&thinsp;){0,5}[\u3400-\u9FBF]/)) {
                            tmp_str=getBeforeHTML(allE[is])+'\uF203CJK\uF203'+tmp_str;
                        }
                        if (tmp_str.match(/[\u3400-\u9FBF][\s\u200B-\u200E\2060]{0,2}$/)) {
                            tmp_str=tmp_str+'\uF204CJK\uF204'+getAfterHTML(allE[is]);
                        }
                        //protect the Latins in tags, no need in 1.0+ b/c no “”’‘ in CJK <cjktext> tags.
                        //en:zh; //why didn't I use "non-CJK" list for Latin?
                        tmp_str=tmp_str.replace(/&nbsp;/,'\u00A0'); //Or, tmp_str=tmp_str.replace(/\u0026nbsp\u003B/,'\u00A0');
                        tmp_str=tmp_str.replace(/&thinsp;/,'\u2009'); //Or, tmp_str=tmp_str.replace(/\u0026thinsp\u003B/,'\u2009');
                        var re_enzh=/([\u0021\u0023-\u0026\u0029\u002A-\u003B\u003D\u003F-\u005A\u005C-\u007B\u007D-\u009F\u00A1-\u00FF\u0391-\u03FF\u2027\u2600-\u26FF’”])([\uF201-\uF204]CJK[\uF201-\uF204])?(?:[\u0020\u00A0\u2009\u200B-\u200E\u2060]){0,5}(\uF203CJK\uF203)?(?:[\u0020\u00A0\u200B-\u200E\u2060]){0,5}([\uF201-\uF204]CJK[\uF201-\uF204])?([\u3400-\u9FBF])/img;
                        var space2BeAdded='<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE699 FontsFixedE137" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:Arial,Helvetica,sans-serif;font-size:80%;">\u0020</cjktext>';
                        if (useSFTags===false) {space2BeAdded='\u2009';} //\u2009 for thin space and \u200A for "hair space".
                        var enzh_withSpace='$1$2$3$4'+space2BeAdded+'$5';
                        tmp_str=tmp_str.replace(re_enzh,enzh_withSpace);
                        //now zh:en
                        var re_zhen=/([\u3400-\u9FBF])(?:[\u0020\u00A0\u2009\u200B-\u200E\u2060]|&nbsp;){0,5}([\uF201-\uF204]CJK[\uF201-\uF204])?(?:[\u0020\u00A0\u200B-\u200E\u2060]|&nbsp;){0,5}([\uF201-\uF204]CJK[\uF201-\uF204])?([‘“\u0021\u0023-\u0026\u0028\u002A-\u003B\u003D\u003F-\u005C\u005E-\u007B\u007D-\u009F\u00A1-\u00FF\u0391-\u03FF\u2027\u2600-\u26FF])/img;
                        var zhen_withSpace='$1'+space2BeAdded+'$2$3$4';
                        tmp_str=tmp_str.replace(re_zhen,zhen_withSpace);
                        //now en["']zh (TODO in 1.x?)
                        //now zh['"]en (TODO in 1.x?)
                        tmp_str=tmp_str.replace(/\uED20/mg,'');
                        tmp_str=tmp_str.replace(/^[^\u0000]*\uF203CJK\uF203([^\u0000]*)$/,'$1'); // '.' does not match \n in whatever mode.
                        tmp_str=tmp_str.replace(/^([^\u0000]*)\uF204CJK\uF204[^\u0000]*$/,'$1');
                        allE[is].innerHTML=tmp_str;
                        allE[is].classList.add("SpacesFixedE133");
                    }
                    else {
                        if (debug_spaces===true) {console.log("Skipping banned tags:"+allE[is].tagName);}
                    }
                }
            }
        }
    }
    function removeSpacesForSimSun() { //Need more work.
        var allS=document.getElementsByClassName("\uE699");
        var font_str='';
        for (var i=0;i<allS.length;i++) {
            font_str=((dequote(window.getComputedStyle(allS[i].parentNode, null).getPropertyValue('font-family'))).split(','))[1];
            if (font_str.match(re_simsun)) {
                allS[i].innerHTML='';
            }
            else if (font_str.match(/RealCJKBold.易/))  {
                allS[i].parentNode.classList.add("checkSpacedQM");
            }
        }
        allS=document.getElementsByClassName("checkSpacedQM");
        for (i=0;i<allS.length;i++){
            var toRemoved=/(<cjktext[^><]*\uE699[^><]*>\u0020<\/cjktext>)((?:<[^><\uE985\uE211]*>)*[\u2018\u201C])/g;
            if (allS[i].innerHTML.match(toRemoved)) {
                allS[i].innerHTML=allS[i].innerHTML.replace(toRemoved,'$2');
            }
            //No closing tag: En"Zh
            toRemoved=/([\u2019\u201D])<cjktext[^><]*\uE699[^><]*>\u0020<\/cjktext>/g;
            if (allS[i].innerHTML.match(toRemoved)) {
                allS[i].innerHTML=allS[i].innerHTML.replace(toRemoved,'$1');
            }
            //With closing tag: En"Zh
            toRemoved=/((?:^|[^>]|<[^><\uE985\uE211]*>)[\u2019\u201D](?:<[^><\uE985\uE211]*>)+)(<cjktext[^><]*\uE699[^><]*>\u0020<\/cjktext>)/mg;
            if (allS[i].innerHTML.match(toRemoved)) {
                allS[i].innerHTML=allS[i].innerHTML.replace(toRemoved,'$1');
            }
        }
    }
    function ReFixCJKFontsOnly () {
        if (refixingFonts===true) {
            console.log("Refixing, skipping this refix...");
            window.setTimeout(function () {refixingFonts=false;},t_interval/ItvScl/2);
            return false;
        }
        refixingFonts=true;
        var bannedTagsInReFix=/^(A|BUTTON|TEXTAREA|AUDIO|VIDEO|SOURCE|FORM|INPUT|select|option|label|fieldset|datalist|keygen|output|canvas|nav|svg|img|figure|map|area|track|menu|menuitem)$/i;
        t_start=performance.now();
        if ( (t_start-t_last)*ItvScl > t_interval ) {
            FixRegular = true; //Also fix regular fonts. You need to keep this true if you want to use "LatinInSimSun" in Latin/CJK mixed context.
            FixMore = false; //Appendent CJK fonts to all elements. No side effects found so far.
            FixPunct = false; //If Latin punctions in CJK paragraph need to be fixed. Usually one needs full-width punctions in CJK context. Turn it off if the script runs too slow or HTML strings are adding to your editing area.
            ifRound1 = true;
            ifRound2 = true;
            ifRound3 = false;
            maxlength = 1100200; //maximum length of the page HTML to check for CJK punctuations.
            maxNumElements = 8000; // maximum number of elements to process.
            CJKOnlyThreshold = 2000; // Only CJK if the number of elements reaches this threshold.
            labelPreMath();
            labelCJK(true);
            FixAllFonts(true);
            console.log('FixCJK!: Fast ReFixing took '+((performance.now()-t_start)/1000).toFixed(3)+' seconds.');
        }
        t_last=performance.now();
        refixingFonts=false;
    }
    function ReFixCJK (e) {
        if (refixing===true) {
            if (debug_wrap===true) {console.log("Refixing, skipping this refix...");}
            window.setTimeout(function () {refixing=false;},t_interval/ItvScl);
            return false;
        }
        refixing=true;
        var bannedTagsInReFix=/^(A|BUTTON|TEXTAREA|AUDIO|VIDEO|SOURCE|FORM|INPUT|select|option|label|fieldset|datalist|keygen|output|canvas|nav|svg|img|figure|map|area|track|menu|menuitem)$/i;
        if (debug_verbose===true) {console.log(e.target.nodeName);}
        t_start=performance.now();
        if (document.URL!==LastURL) {
            NumPureEng = 0;
            LastURL=document.URL;
        }
        var clickedNode=e.target;
        while (clickedNode && clickedNode.nodeName!=="BODY") {
            if (clickedNode.nodeName.match(bannedTagsInReFix)) {
                console.log("FixCJK!: Not a valid click on DOM element \u201C"+clickedNode.nodeName+"."+clickedNode.className+"\u201D");
                refixing=false;
                return false;
            }
            if (debug_verbose===true) {console.log("Clicked: "+clickedNode.nodeName);}
            clickedNode=clickedNode.parentNode;
        }
        if ((document.lastModified===LastMod) && (NumClicks >2)) {
            if (debug_verbose===true) {console.log('FixCJK!: Document modified at '+document.lastModified+', no change?');}
        }
        else {
            if (debug_verbose===true) {console.log('FixCJK!: Document modified at '+document.lastModified);}
        }
        //NumPureEng method is still usefull because document.lastModified method is only partially reliable.
        if (NumPureEng >= 2) {
            console.log('Probably pure English/Latin site, re-checking skipped.');
            refixing=false;
            return true;
        }
        if (debug_verbose===true) {console.log('FixCJK!: NumClicks='+NumClicks.toString());}
        //First remove the "CJK2Fix" attibute for those already processed.
        var AllCJKFixed=document.getElementsByClassName("FontsFixedE137");
        for (i=0;i<AllCJKFixed.length;i++) {
            if (AllCJKFixed[i].classList.contains("wrappedCJK2Fix")) {
                continue;
            }
            if (debug_verbose===true) {console.log(AllCJKFixed[i].className);}
            if (AllCJKFixed[i].classList.contains("MarksFixedE135")) {
                AllCJKFixed[i].classList.remove("CJK2Fix");
            }
        }
        if ((NumClicks < 1) || (t_start-t_last)*ItvScl > t_interval ) {
            FixRegular = true; //Also fix regular fonts. You need to keep this true if you want to use "LatinInSimSun" in Latin/CJK mixed context.
            FixMore = true; //Appendent CJK fonts to all elements. No side effects found so far.
            FixPunct = true; //If Latin punctions in CJK paragraph need to be fixed. Usually one needs full-width punctions in CJK context. Turn it off if the script runs too slow or HTML strings are adding to your editing area.
            maxlength = 1100200; //maximum length of the page HTML to check for CJK punctuations.
            maxNumElements = 8000; // maximum number of elements to process.
            CJKOnlyThreshold = 2000; // Only CJK if the number of elements reaches this threshold.
            invForLimit=6; //the time limit factor (actual limit is timeOut/invForLimit) for the "for loop" in Round 2 & 3.
            processedAll=true;
            ifRound1=true;
            ifRound2=true;
            ifRound3=false;
            var ReFixAll=document.getElementsByTagName('*');
            var NumFixed=0;
            var NumReFix=0;
            labelPreMath();
            labelCJK(true);
            FixAllFonts(true);
            if (debug_verbose===true) {console.log('FixCJK!: '+NumFixed.toString()+' elements has been fixed.');}
            if (debug_verbose===true) {console.log('FixCJK!: '+NumReFix.toString()+' elements to Re-Fix.');}
            labelPreCode();
            labelNoWrappingList();
            if (useWrap===true) wrapCJK();
            FunFixPunct(true,2,returnLater);
            console.log('FixCJK!: ReFixing (Fixing PMs not included) took '+((performance.now()-t_start)/1000).toFixed(3)+' seconds.');
            NumAllCJKs=(document.getElementsByClassName('MarksFixedE135')).length;
            if (NumAllCJKs*1.0/NumAllDOMs*100 < 1.0) {
                NumPureEng++;
            }
        }
        else {
            console.log('FixCJK!: No need to rush. Just wait for '+(t_interval/1000/ItvScl).toFixed(1)+' seconds before clicking again.');
        }
        NumClicks++;
        LastMod=document.lastModified;
        t_last=performance.now();
        refixing=false;
    }
    ///===various aux functions===///
    function wrapCJK() {
        var wrap_start=performance.now();
        var allCJK=document.querySelectorAll(".CJK2Fix:not(.wrappedCJK2Fix)");
        for (var i=0;i<allCJK.length;i++) {
            if ( allCJK[i].classList.contains("\uE211") || allCJK[i].classList.contains("\uE985") ||allCJK[i].classList.contains("preCode")) {
                if (allCJK[i].classList.contains("wrappedCJK2Fix")) console.log("FIXME: "+allCJK[i].nodeName+" has already been wrapped.");
                continue;
            }
            else if (allCJK[i].nodeName.match(SkippedTagsForMarks)) {
                continue;
            }
            var child=allCJK[i].firstChild;
            while(child) {
                var realSibling=child.nextSibling;
                if (child.nodeType===3  && (child.data.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/)) ) {
                    wrapCJKHelper(child);
                }
                child=realSibling;
            }
        }
        if (debug_wrap===true) console.log("Wrapping took "+((performance.now()-wrap_start)/1000).toFixed(3)+" seconds.");
        function wrapCJKHelper(child) {
            var iNode=document.createElement("cjktext");
            var iText=document.createTextNode(child.data);
            iNode.appendChild(iText);
            iNode.classList.add("wrappedCJK2Fix");
            iNode.classList.add("CJKTestedAndLabeled");
            iNode.classList.add("PunctSpace2Fix");
            iNode.classList.add("CJK2Fix");
            iNode.classList.add("Safe2FixCJK\uE000");
            child.parentNode.insertBefore(iNode,child.nextSibling);
            child.data=""; //or "\u200B?"
        }
    }
    function inTheClassOf(node,cList) {
        var classes=cList.split(',');
        for (var i=0;i<classes.length;i++) {
            if (node.classList.contains(classes[i])) {
                return true;
            }
        }
        return false;
    }
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
        var localed='local("'+font_str[0]+'"),\nlocal("'+font_str[0]+' Regular")';
        for (var l=1;l<font_str.length;l++) {
            localed=localed+',\n'+'local("'+font_str[l]+'"),\nlocal("'+font_str[l]+' Regular")';
        }
        return localed;
    }
    /// ======================== FixAllFonts, 3 Rounds ==============================///
    function FixAllFonts (useTimeout) {
        var func_start=performance.now();
        if (debug_verbose===true) {
            console.log("Round 1: "+ifRound1.toString());
            console.log("Round 2: "+ifRound2.toString());
            console.log("Round 3: "+ifRound3.toString());
        }
        SkippedTags=SkippedTagsForFonts;
        /// ===== First round: Replace all bold fonts to CJKBold ===== ///
        t_stop=performance.now();
        //First fix all SimSun parts in Round 1&2. Original: var allSuns=document.getElementsByClassName("SimSun2Fix");
        var allSuns=document.querySelectorAll(".SimSun2Fix:not(.SimSunFixedE137)");
        for (var isun=0;isun< allSuns.length;isun++) {
            if (allSuns[isun].classList.contains("SimSunFixedE137")) {
                //was if (allSuns[isun].classList.contains(FontsFixedE137) || allSuns[isun].classList.contains("SimSunFixedE137"))
                continue;
            }
            font_str = dequote(window.getComputedStyle(allSuns[isun], null).getPropertyValue('font-family'));
            if (font_str.match(re_simsun) &&  !(font_str.match(sig_sim))  ) {
                allSuns[isun].style.fontFamily = font_str.replace(re_simsun,qSimSun);
                allSuns[isun].classList.add("SimSunFixedE137");
            }
        }
        //Large fonts: allSuns=document.getElementsByClassName("LargeSimSun2Fix");
        allSuns=document.querySelectorAll(".LargeSimSun2Fix:not(.SimSunFixedE137)");
        for (isun=0;isun< allSuns.length;isun++) {
            if (allSuns[isun].classList.contains("SimSunFixedE137")) {
                continue;
            }
            font_str = dequote(window.getComputedStyle(allSuns[isun], null).getPropertyValue('font-family'));
            if (font_str.match(re_simsun) &&  !(font_str.match(sig_sim))  ) {
                allSuns[isun].style.fontFamily = font_str.replace(re_simsun,qLargeSimSun);
                allSuns[isun].classList.add("SimSunFixedE137");
            }
        }
        //All elements to fix fonts: all = document.getElementsByClassName('CJK2Fix');
        all=document.querySelectorAll(".CJK2Fix:not(.FontsFixedE137)");
        if (ifRound1===true) {
            for (i = 0; i < all.length; i++) {
                if (i % 500===0) { //Check every 500 elements.
                    if ( useTimeout===true && (performance.now()-t_stop)*invForLimit > timeOut) {
                        ifRound1=false;
                        ifRound2=false;
                        ifRound3=false;
                        FixPunct=false;
                        processedAll=false;
                        console.log('FixCJK!: Round 1 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. Too slow to continue.');
                        break;
                    }
                    else {
                        if (debug_verbose===true) {console.log('FixCJK!: Round 1 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
                    }
                }
                if (all[i].classList.contains("FontsFixedE137")) {
                    continue;
                }
                child = all[i].firstChild;
                if_replace = false;
                //Only change if current node (not child node) contains CJK characters.
                font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
                fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
                while (child) {
                    var realSibling=child.nextSibling;
                    if (child.nodeType == 3 && (child.data.match(/[“”‘’\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]/)) && (fweight == 'bold' || fweight > 500) && (!(font_str.match(sig_bold)))) {
                        //Test if contains SimSun
                        if (debug_01===true) {all[i].style.color="Blue";} //Bold-->Blue;
                        //Test if contains Sans
                        if (list_has(font_str, re_sans0) !== false) {
                            if (debug_01===true) all[i].style.color="Salmon";
                            all[i].style.fontFamily = genPunct+','+ replace_font(font_str, re_sans0, LatinSans+','+qBold) + ',sans-serif';
                            window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                        }        //Test if contains serif
                        else if (list_has(font_str, re_serif) !== false) {
                            if (debug_01===true) all[i].style.color="SeaGreen";
                            all[i].style.fontFamily = genPunct+','+ replace_font(font_str, re_serif, LatinSerif + ',' +qBold) + ',serif';
                            window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                        }        //Test if contains monospace
                        else if (list_has(font_str, re_mono0) !== false) {
                            if (debug_01===true) all[i].style.color="Maroon";
                            all[i].style.fontFamily = genPunct+','+ replace_font(font_str, re_mono0, LatinMono + ',' +qBold) + ',monospace';
                            window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                        }        //Just append the fonts to the font preference list.
                        else {
                            all[i].style.fontFamily = genPunct+','+font_str + ',' + LatinSans + ',' + qBold + ',' + '  sans-serif';
                            window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                        }
                    }
                    child = realSibling;
                }
            }
        }
        if (FixRegular === false) {
            return false;
        }
        /// ===== Second Round: Deal with regular weight. ===== ///
        var tmp_idx=0;
        max = all.length;
        if (useTimeout===true && (performance.now()-t_stop)*4 > timeOut) {
            ifRound2=false;
            ifRound3=false;
            FixPunct=false;
            processedAll=false;
            console.log('FixCJK!: Round 1 has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. Skipping following steps.');
        }
        t_stop=performance.now();
        if (ifRound2===true) {
            //Now fix the rest.
            for (i = 0; i < all.length; i++) {
                if (i % 500===0) { //Check every 500 elements.
                    if (useTimeout===true && (performance.now()-t_stop)*invForLimit > timeOut) {
                        ifRound2=false;
                        ifRound3=false;
                        FixPunct=false;
                        processedAll=false;
                        console.log('FixCJK!: Round 2 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. Too slow to continue.');
                        break;
                    }
                    else {
                        if (debug_verbose===true) {console.log('FixCJK!: Round 2 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
                    }
                }
                if (all[i].classList.contains("FontsFixedE137") ) {
                    continue;
                }
                font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
                fweight = window.getComputedStyle(all[i], null).getPropertyValue('font-weight');
                if (font_str.match(sig_hei) || font_str.match(sig_song) ||font_str.match(sig_bold) || font_str.match(sig_mono) || font_str.match(sig_default)) {
                    window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                    continue;
                }
                else {
                    if (debug_02===true) {all[i].style.color='Teal';} //Teal for true;
                    if (debug_02===true) {if (all[i].innerHTML.match(re_to_check)) {console.log('\\\\\\\\\\\\afterall:'+i.toString()+'::'+all[i].style.fontFamily+'\n-->if_replace:'+if_replace);}}
                    //Test if contains Sans
                    if (list_has(font_str, re_sans0) !== false) {
                        //all[i].style.color="Salmon";
                        all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_sans0, qsans);
                        window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                    }      //Test if contains serif
                    else if (list_has(font_str, re_serif) !== false) {
                        //all[i].style.color="SeaGreen";
                        all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_serif, qserif);
                        window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                    }      //Test if contains monospace
                    else if (list_has(font_str, re_mono0) !== false) {
                        //all[i].style.color="Maroon";
                        all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_mono0, qmono);
                        window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                    }
                    else {
                        if (debug_02===true) {all[i].style.color='Fuchsia';}
                        if (font_str.match(re_simsun)) {
                            //Do nothing.
                        }
                        else {
                            all[i].style.fontFamily = genPunct+','+font_str + ',' + qCJK + ',' + 'sans-serif';
                            window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                        }
                    }
                }
            }
        }
        if (debug_verbose===true) {console.log('FixCJK!: Round 2 took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
        t_stop=performance.now();
        if (debug_02===true) console.log('Just before Round 3:'+tmp_idx.toString()+'::'+all[tmp_idx].innerHTML);
        if (debug_02===true) console.log('Just before Round 3:'+tmp_idx.toString()+'::'+dequote(window.getComputedStyle(all[tmp_idx], null).getPropertyValue('font-family')));
        /// ===== The Third round (Round 3): Add CJKdefault to all elements ===== ///
        if (FixMore === false) {
            t_stop=performance.now();
            if (debug_verbose===true) {console.log('FixCJK!: FixMore/Round 3 is intentionally skipped.');}
            return false;
        }
        all=document.querySelectorAll(":not(.FontsFixedE137)");
        max = all.length;
        if (max > maxNumElements) {
            ifRound3=false;
            FixPunct=false;
            processedAll=false;
            console.log('FixCJK!: '+max.toString()+' elements, too many. Skip Round 3 and punctuation fixing. Exiting now...');
        }
        else if (max > CJKOnlyThreshold) {
            ifRound3=true;
            FixPunct=true;
            processedAll=true;
            //Now get all elements to be fixed: all = document.getElementsByTagName('CJK2Fix');
            all=document.querySelectorAll(".CJK2Fix:not(.FontsFixedE137)");
            console.log('FixCJK!: '+max.toString()+' elements, too many. Only CJK elements will be processed in Round 3.');
        }
        else {
            if (debug_verbose===true) {console.log('FixCJK!: All elements will be processed in Round 3.');}
        }
        if (ifRound3===true) {
            for (i = 0; i < all.length; i++) {
                if (i % 500===0) { //Check every 500 elements.
                    if (useTimeout===true && (performance.now()-t_stop)*invForLimit > timeOut) {
                        ifRound3=false;
                        FixPunct=false;
                        processedAll=false;
                        console.log('FixCJK!: Round 3 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. '+i.toFixed(0)+' elements have been fixed, but too slow to continue. Stopped at:');
                        console.log(all[i]);
                        break;
                    }
                    else {
                        if (debug_verbose===true) {console.log('FixCJK!: Round 3 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. ');}
                    }
                }
                if (all[i].nodeName.match(SkippedTags) || (all[i] instanceof SVGElement) ) {
                    if (debug_03===true) {console.log("Skipped:");console.log(all[i]);}
                    continue;
                }
                else if (all[i].classList.contains("FontsFixedE137")) {
                    if (debug_03===true) all[i].style.color="FireBrick"; //FireBrick <-- Fixed.
                    continue;
                }
                font_str = dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
                if (font_str.split(',').length >= rspLength) {
                    //continue if all[i] contains a list of fonts.
                    if (all[i].classList.contains("CJKTestedAndLabeled") && !all[i].classList.contains("CJK2Fix")) {
                        window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                        if (debug_03===true) {console.log(all[i]);all[i].style.color="FireBrick";} //FireBrick <-- Fixed.
                        continue;
                    }
                }
                if (!(font_str.match(sig_song) || font_str.match(sig_hei) || font_str.match(sig_bold) || font_str.match(sig_default) || font_str.match(/\uE137/))) {
                    if (list_has(font_str, re_sans0) !== false) {
                        if (debug_03 === true) all[i].style.color="Salmon";
                        all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_sans0, qsans);
                    }      //Test if contains serif
                    else if (list_has(font_str, re_serif) !== false) {
                        if (debug_03 === true) all[i].style.color="SeaGreen";
                        all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_serif, qserif);
                    }      //Test if contains monospace
                    else if (list_has(font_str, re_mono0) !== false) {
                        if (debug_03 === true) all[i].style.color="Maroon";
                        all[i].style.fontFamily = genPunct+','+replace_font(font_str, re_mono0, qmono);
                    }
                    else {
                        //SimSun should be taken care of throught the "SimSun2Fix" class.
                        if (debug_03 === true) { all[i].style.color='Olive';}
                        all[i].style.fontFamily = genPunct+','+font_str + ',' + qCJK + ',' + 'sans-serif';
                    }
                }
                else {
                    //font_str already contains signature.
                    if (debug_03 === true) all[i].style.color="Silver"; //Signed-->Silver
                }
                window.setTimeout(function(node) {node.classList.add("FontsFixedE137");},1,all[i]); //Slow and Use async I/O.
                if (debug_03===true) all[i].style.color="FireBrick"; //FireBrick <-- Fixed.
            }
        }
        if (debug_verbose===true) {console.log('FixCJK!: Round 3 took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
        t_stop=performance.now();
        if (debug_wrap===true) console.log("Fixing Fonts took "+((performance.now()-func_start)/1000).toFixed(3)+" seconds.");
    }
    ///===The Actual Round 4===///
    function FunFixPunct(useTimeout,MaxNumLoops,returnNow) {
        SkippedTags=SkippedTagsForMarks;
        var recursion_start=0;
        var func_start=performance.now();
        //Use Recursion instead of loop, should be put in the MaxNumLoops in production code.
        if (returnNow===true) {
            return true;
        }
        var allrecur=document.querySelectorAll(".PunctSpace2Fix:not(.MarksFixedE135)");
        for (var ir=0; ir<allrecur.length; ir++) {
            //Seems no need to add !(allrecur[ir].parentNode.classList.contains("CJK2Fix")). It might be faster to fix the deepest element first through looping.
            recursion_start=performance.now();
            if (allrecur[ir].nodeName.match(/CJKTEXT/i)) {
                FixPunctRecursion(allrecur[ir]);
            }
            if ( useTimeout===true && (performance.now()-t_start) > timeOut ) {
                processedAll=false;
                console.log("FixCJK!: Time out. Last fixing took "+((performance.now()-recursion_start)/1000).toFixed(3)+" seconds.");
                console.log("FIXME:"+allrecur[ir].nodeName+"."+allrecur[ir].className);
                break;
            }
        }
        if (debug_wrap===true || debug_asyncTimers===true) console.log("FixCJK!: Fixing PMs took "+((performance.now()-func_start)/1000).toFixed(3)+" seconds.");
    }
    /////=====The Recursive Implementation=====/////
    function FixPunctRecursion(node) {
        if (node.classList.contains("MarksFixedE135")) {
            return true;
        }
        else if ( !(node.tagName.match(/CJKTEXT/i)) ) {
            return false;
        }
        if (debug_re_to_check===true && (node.innerHTML.match(re_to_check))) {console.log("Checking node: "+node.nodeName+"."+node.className+"@"+node.parentNode.nodeName+":: "+node.innerHTML.slice(0,216));}
        var tabooedTags=SkippedTagsForMarks;
        var child=node.firstChild;
        var currHTML="";
        var allSubSafe=true;
        var node2fix=true;
        if ((node.nodeName.match(tabooedTags)) || inTheClassOf(node,preOrigPunctSpaceList)) {
            //Although BODY is tabooed, this is OK because a loop is outside this recursive implementation.
            node.classList.remove("Safe2FixCJK\uE000");
            node.classList.remove("PunctSpace2Fix");
            node.classList.add("MarksFixedE135");
            return false;
        }
        //Add lang attibute. Firefox cannot detect lang=zh automatically and it will treat CJK characters as letters if no lang=zh. For example,
        //the blank spaces will be streched but not the "character-spacing" if using align=justify.
        if (window.getComputedStyle(node.parentNode,null).getPropertyValue('text-align').match(/start/) && useJustify===true) {
            node.parentNode.style.textAlign="justify";
        }
        //node.lang="zh";
        node.parentNode.lang="zh";
        while (child) {
            if (debug_re_to_check===true && (node.innerHTML.match(re_to_check))) {console.log("Checking subnode: "+child+"@"+node.nodeName);}
            if ( child.nodeType === 3 && !(node.nodeName.match(tabooedTags)) ) {
                if (debug_re_to_check===true && (node.innerHTML.match(re_to_check))) {console.log("Found as Type 3 subnode: "+child.nodeName+"."+child.className+"@"+node.nodeName+":: "+child.data);}
                if (debug_verbose===true) {
                    console.log("Permitted to check: "+node.nodeName+"."+node.className);
                }
                if (debug_re_to_check===true && (node.innerHTML.match(re_to_check)) && node.nodeName.match(tabooedTags)) {
                    console.log("ERROR: Wrong Operation on: "+node.nodeName+"."+node.className+":: "+node.textContent);
                    console.log("ERROR: Wrong Operation because: "+child.data);
                }
            }
            if (child.nodeType===1 && !(child instanceof SVGElement))  {
                if  ((child.nodeName.match(tabooedTags) ) || inTheClassOf(child,preOrigPunctSpaceList) ) {
                    //was like this: if  (child.nodeName.match(tabooedTags) || child.classList.contains("MarksFixedE135")) {. I don't know why.
                    child.classList.remove("Safe2FixCJK\uE000");
                    child.classList.remove("CJK2Fix");
                    child.classList.add("MarksFixedE135");
                    node2fix=false;
                }
                else if (child.nodeName.match(ignoredTags)) {
                    //Simply do nothing. Such as <math> tag.
                    child.classList.add("Safe2FixCJK\uE000");
                    child.classList.add("MarksFixedE135");
                }
                else if (child.classList.contains("MarksFixedE135")) {
                    //Fixed, do nothing.
                }
                else if (child.nodeName.match(/CJKTEXT/)) {
                    FixPunctRecursion(child); //This is the recursion part. Not really recursion after 0.15.... 
                }
                else {
                    //do nothing;
                }
                //Test again after fixing child:
                if (!(child.classList.contains("Safe2FixCJK\uE000"))) {allSubSafe=false;} //\uE000 is Tux in Linux Libertine.
            }
            child=child.nextSibling;
        }
        if (allSubSafe===true && (!(node instanceof SVGElement))) {
            var orig_class=node.className;
            var CJKclasses=CJKclassList.split(',');
            for (var icl=0;icl<CJKclasses.length;icl++) {
                node.classList.remove(CJKclasses[icl]);
            }
            if (node.classList.length===0 && node.id.length ===0 && !(node.nodeName.match(tabooedTags)) && !(inTheClassOf(node,preOrigPunctSpaceList))) {
                //It would be crazy if add listeners just by tags.
                node.className=orig_class;
                node.classList.add("Safe2FixCJK\uE000");
            }
            else {
                node.className=orig_class;
            }
        }
        //Config and Filtering Done. Fix puncts if necessary.
        if (allSubSafe===true && node2fix===true && !(node.nodeName.match(tabooedTags)) && !(inTheClassOf(node,preOrigPunctSpaceList)) && node.classList.contains("CJK2Fix") && !(node.classList.contains("MarksFixedE135"))) {
            if (debug_verbose===true) console.log("USING Recursion: "+node.nodeName+'.'+node.className);
            if (debug_verbose===true) { console.log("WARNING: Danger Operation on: "+node.nodeName+"."+node.className+":: "+node.innerHTML.slice(0,216)); }
            if (debug_re_to_check===true && (node.innerHTML.match(re_to_check))) {console.log("Checking if contain punctuations to fix");}
            if (node.innerHTML.match(/[“”‘’、，。：；！？）】〉》」』『「《〈【（]/m)) {
                if (debug_re_to_check===true && (node.innerHTML.match(re_to_check))) { console.log("WARNING: Danger Operation on: "+node.nodeName+"."+node.className);}
                if (node.classList.contains("preCode")) {
                    node.classList.remove("Safe2FixCJK\uE000"); //Do not performan fixing on "fully banned" tags.
                    node.classList.remove("PunctSpace2Fix");
                }
                else if (window.getComputedStyle(node, null).getPropertyValue("white-space").match(/pre/)){
                    node.innerHTML=FixMarksInCurrHTML(node.innerHTML,node,false);
                }
                else {
                    if (debug_re_to_check===true && (node.innerHTML.match(re_to_check))) {console.log("Now fixing --> "+node.nodeName+"."+node.className+":: "+node.innerHTML.slice(0,216));}
                    node.innerHTML=FixMarksInCurrHTML(node.innerHTML,node,true);
                }
            }
            node.classList.add("MarksFixedE135");
            return true;
        }
        else {
            node.classList.add("MarksFixedE135");
            return true;
        }
    }
    ///==Fix punct in a currHTML===///
    function FixMarksInCurrHTML(currHTML,node,delete_all_extra_spaces) {
        //“<-->\u201C, ”<-->\u201D
        //‘<-->\u2018, ’<-->\u2019
        if (debug_04===true) console.log("Round 4: Fixing node <"+node.nodeName+">");
        var changhai_style=false;
        var Squeezing=true;
        var SqueezeInd=true;
        var tmp_str='';
        var FixMarks_start=performance.now();
        var inputHTML=currHTML;
        var continuedHTML='';
        if (changhai_style===true) {
            //Simply inserting blanck space, like changhai.org.
            currHTML=currHTML.replace(/([\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF]?)([“‘])([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]+)/g,'$1 $2$3');
            currHTML=currHTML.replace(/([\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF])([”’])([^，, ])/g,'$1$2 $3');
            if (debug_04===true) {console.log(currHTML);}
            node.innerHTML=currHTML;
            return true;
        }
        //currHTML=currHTML.replace(/^([、，。：；！？）】〉》」』\u201D\u2019])/mg,'\u2060$1');//Remove the hanging puncts. Seems no use at all.
        //It seems that I always needs to consider the context.
        if ( currHTML.match(/[“”‘’]/) || currHTML.match(/^[、，。：；！？）】〉》」』『「《〈【（]/) || currHTML.match(/[、，。：；！？）】〉》」』『「《〈【（]$/) ) {
            if (debug_tagSeeThrough===true) console.log("TO CHECK BEFORE: "+currHTML);
            if (debug_tagSeeThrough===true) console.log("FULL PARENT: "+node.parentNode.textContent);
            currHTML=getBefore(node)+'\uF201CJK\uF201'+currHTML+'\uF202CJK\uF202'+getAfter(node);
            continuedHTML=currHTML;
            if (debug_tagSeeThrough===true) console.log("FULL CLOSED FORM: "+currHTML);
            if (debug_tagSeeThrough===true) console.log("Continuation took "+(performance.now()-FixMarks_start).toFixed(1)+" ms.");
        }
        if (useFeedback===true && currHTML.match(/[\uF201-\uF204]/)) {
            if (!currHTML.match(/[\uF201-\uF204]CJK[\uF201-\uF204]/) || (currHTML.match(/[\uF201-\uF204]/g)).length !== ((currHTML.match(/[\uF201-\uF204]CJK[\uF201-\uF204]/g)).length*2)) {
                alert("This page may conflict with FixCJK!. If you would like to help solve the problem, please email the URL to stecue@gmail.com. Thanks!\n本页面可能与FixCJK!冲突，如果您想帮忙解决此问题，请将本页面的URL电邮至stecue@gmail.com。多谢您的使用与反馈！");
            }
        }
        function getBefore(child) {
            var t_start=performance.now();
            var toReturn='';
            var inputNode=child;
            if (debug_getBeforeTags===true) {
                console.log("CURRENT: "+child.nodeName+"@<"+child.parentNode.nodeName+">");
                console.log(child.parentNode.nodeName.match(upEnoughTags));
            }
            if (debug_tagSeeThrough===true) console.log('CHILD<'+child.nodeName+'>: '+child.textContent+'<--'+'PARENT<'+child.parentNode.nodeName+">: "+child.parentNode.textContent);
            child=child.previousSibling;
            while (child && (performance.now()-t_start<2) ) {
                if (child.nodeType===3) {
                    if (debug_tagSeeThrough===true) console.log("T3: "+child.data);
                    toReturn = child.data + toReturn;
                    if (toReturn.length>1024 || toReturn.match(/[\u3400-\u9FBF]/) ) {
                        //Stop if to Return is already too long;
                        return toReturn;
                    }
                }
                else if (child.nodeType===1 && window.getComputedStyle(child,null).getPropertyValue("display")!=="none" ) {
                    if (child.nodeName.match(stopTags) || inTheClassOf(child,stopClasses) ) {
                        return '上下标'+toReturn;
                    }
                    if (debug_tagSeeThrough===true) console.log("T1: "+child.textContent);
                    toReturn = displayedText(child) + toReturn;
                    if (toReturn.length>1024 || toReturn.match(/[\u3400-\u9FBF]/) ) {
                        //Stop if to Return is already too long;
                        return toReturn;
                    }
                }
                child=child.previousSibling;
            }
            if (debug_tagSeeThrough===true) console.log("BEFORE: "+toReturn+"@"+performance.now());
            if (debug_tagSeeThrough===true) console.log("CJK? "+toReturn.match(/[\u3400-\u9FBF]/)+'@'+toReturn);
            if ((toReturn.length < 1 || !toReturn.match(/[\u3400-\u9FBF]/)) && (!inputNode.parentNode.nodeName.match(upEnoughTags)) ) {
                return getBefore(inputNode.parentNode)+toReturn;
            }
            return (toReturn.replace(/</,'&lt;')).replace(/>/,'&gt;');
        }
        function getAfter(child) {
            var toReturn='';
            var t_start=performance.now();
            var inputNode=child;
            child=child.nextSibling;
            while (child && (performance.now()-t_start<2) ) {
                if (child.nodeType===3) {
                    toReturn = toReturn + child.data;
                    if (toReturn.length>1024 || toReturn.match(/[\u3400-\u9FBF]/) ) {
                        //Stop if to Return is already too long;
                        return toReturn;
                    }
                }
                else if (child.nodeType===1 && window.getComputedStyle(child,null).getPropertyValue("display")!=="none" ) {
                    if (child.nodeName.match(stopTags) || inTheClassOf(child,stopClasses) ) {
                        return toReturn+'上下标'; //I just need to add some CJK text. They will be "chopped" anyway.
                    }
                    toReturn = toReturn + displayedText(child);
                    if (toReturn.length>1024 || toReturn.match(/[\u3400-\u9FBF]/) ) {
                        //Stop if to Return is already too long;
                        return toReturn;
                    }
                }
                child=child.nextSibling;
            }
            if (debug_tagSeeThrough===true) console.log("AFTER: "+toReturn+"@"+performance.now());
            if ((toReturn.length < 1 || !toReturn.match(/[\u3400-\u9FBF]/)) && (!inputNode.parentNode.nodeName.match(upEnoughTags)) ) {
                return toReturn+getAfter(inputNode.parentNode);
            }
            return (toReturn.replace(/</,'&lt;')).replace(/>/,'&gt;');
        }
        //==We need to protect the quotation marks within tags first===//
        // \uE862,\uE863 <==> ‘,’
        // \uE972,\uE973 <==> “,”
        while (currHTML.match(/<[^>]*[“”‘’、，。：；！？）】〉》」』『「《〈【（][^<]*>/m)) {
            currHTML=currHTML.replace(/(<[^>]*)‘([^<]*>)/mg,'$1\uE862$2');
            currHTML=currHTML.replace(/(<[^>]*)’([^<]*>)/mg,'$1\uE863$2');
            currHTML=currHTML.replace(/(<[^>]*)“([^<]*>)/mg,'$1\uE972$2');
            currHTML=currHTML.replace(/(<[^>]*)”([^<]*>)/mg,'$1\uE973$2');
            currHTML=currHTML.replace(/(<[^>]*)、([^<]*>)/mg,'$1\uEA01$2');
            currHTML=currHTML.replace(/(<[^>]*)，([^<]*>)/mg,'$1\uEA02$2');
            currHTML=currHTML.replace(/(<[^>]*)。([^<]*>)/mg,'$1\uEA03$2');
            currHTML=currHTML.replace(/(<[^>]*)：([^<]*>)/mg,'$1\uEA04$2');
            currHTML=currHTML.replace(/(<[^>]*)；([^<]*>)/mg,'$1\uEA05$2');
            currHTML=currHTML.replace(/(<[^>]*)！([^<]*>)/mg,'$1\uEA06$2');
            currHTML=currHTML.replace(/(<[^>]*)？([^<]*>)/mg,'$1\uEA07$2');
            currHTML=currHTML.replace(/(<[^>]*)）([^<]*>)/mg,'$1\uEA08$2');
            currHTML=currHTML.replace(/(<[^>]*)】([^<]*>)/mg,'$1\uEA09$2');
            currHTML=currHTML.replace(/(<[^>]*)〉([^<]*>)/mg,'$1\uEA10$2');
            currHTML=currHTML.replace(/(<[^>]*)》([^<]*>)/mg,'$1\uEA11$2');
            currHTML=currHTML.replace(/(<[^>]*)」([^<]*>)/mg,'$1\uEA12$2');
            currHTML=currHTML.replace(/(<[^>]*)』([^<]*>)/mg,'$1\uEA13$2');
            currHTML=currHTML.replace(/(<[^>]*)『([^<]*>)/mg,'$1\uEA14$2');
            currHTML=currHTML.replace(/(<[^>]*)「([^<]*>)/mg,'$1\uEA15$2');
            currHTML=currHTML.replace(/(<[^>]*)《([^<]*>)/mg,'$1\uEA16$2');
            currHTML=currHTML.replace(/(<[^>]*)〈([^<]*>)/mg,'$1\uEA17$2');
            currHTML=currHTML.replace(/(<[^>]*)【([^<]*>)/mg,'$1\uEA18$2');
            currHTML=currHTML.replace(/(<[^>]*)（([^<]*>)/mg,'$1\uEA19$2');
        }
        var time2protect=performance.now()-FixMarks_start;
        //Now let's fix the punctions.
        //First we need to fix the "reverse-paired" punctuations.
        var fixpair=false; //the current code has problems if unpaired quotation marks are present.
        var fixpair_timeout = noBonusTimeout; //Don't spend too much time on this "bonus" function.
        var fixpair_start=performance.now();
        if ( currHTML.length > noBonusLength ) {fixpair=false;}
        if (debug_re_to_check===true && (currHTML.match(re_to_check))) {console.log("Reversing "+currHTML);}
        if (fixpair===true) { //[\w,./<>?;:[]\{}|`~!@#$%^&*()_+-=]*
            var revpaired=/(^[^\u201C\u201D]?(?:[^\u201C\u201D]*\u201C[^\u201C\u201D]*\u201D)*[^\u201C\u201D]*)\u201D([^\u201C\u201D]{2,})\u201C/;
            while (currHTML.match(revpaired) && (performance.now()-fixpair_start)<fixpair_timeout ) {
                if (debug_re_to_check===true && currHTML.match(re_to_check)) {console.log("Pair reversed: "+(performance.now()-t_start).toString());}
                currHTML=currHTML.replace(revpaired,'$1\u201C$2\u201D');
            }
        }
        var fixpair_stop=performance.now()-fixpair_start;
        var paired_start=performance.now();
        //Find and preserve paired Latin marks.
        var paired=/(\u201C)([^\u3000-\u303F\u3400-\u9FBF\uE000-\uED00\uFF00-\uFFEF]*)(\u201D)/mg;
        while (currHTML.match(paired)) {
            if (debug_re_to_check===true && currHTML.match(re_to_check)) console.log("Quotation mark pair found@"+currHTML);
            currHTML=currHTML.replace(paired,'\uEC1C$2\uEC1D');
        }
        //Paired single quotations are diffcult because of the double-indentiy of '‘'.
        paired=/(\u2018)([^\u3000-\u303F\u3400-\u9FBF\uE000-\uED00\uFF00-\uFFEF]{0,2})(\u2019)/mg;
        while (currHTML.match(paired)) {
            if (debug_re_to_check===true && currHTML.match(re_to_check)) console.log("Quotation mark pair found@"+currHTML);
            currHTML=currHTML.replace(paired,'\uEC18$2\uEC19');
        }
        //Find paired CJK marks. Seems like O(n^2) without the "g" modifier?
        paired=/(\u201C)([^\u201D]*[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF][^\u201D]*)(\u201D)/mg;
        while (currHTML.match(paired)) {
            currHTML=currHTML.replace(paired,'\uEB1C$2\uEB1D');
        }
        var paired_stop=performance.now()-paired_start;
        //"unpaired \u201C or \u201D", not just use at the beginning of a paragraph.
        var unpaired_timeout = noBonusTimeout; //not so important, therefore cannot spend too much time here.
        var unpaired_start=performance.now();
        var unpaired=/\u201C((?:[\uF201-\uF204]CJK[\uF201-\uF204])?[^\u201D\u3400-\u9FBF\uF201-\uF204]{0,3}[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF][^\u201C\u201D]*$)/m;
        while ( currHTML.length< noBonusLength && currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'\uEB1C$1'); //We need the greedy method to get the longest match.
        }
        unpaired=/(^[^\u201C\u201D]*[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF](?:[\uF201-\uF204]CJK[\uF201-\uF204])?[^\u201D\u3400-\u9FBF\uF201-\uF204]{0,3}(?:[\uF201-\uF204]CJK[\uF201-\uF204])?)\u201D/m;
        while ( currHTML.length< noBonusLength && currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'$1\uEB1D'); //We need the greedy method to get the longest match.
        }
        //For single quotations:
        var paired_single_start=performance.now();
        paired=/(\u2018)([^\u2019]*[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF][^\u2019]*)(\u2019)/mg;
        while (currHTML.match(paired)) {
            currHTML=currHTML.replace(paired,'\uEB18$2\uEB19');
        }
        var paired_single_stop=performance.now()-paired_single_start;
        //"unpaired ‘ (\u2018)", not just use at the beginning of a paragraph.
        unpaired_start=performance.now();
        unpaired=/\u2018((?:[\uF201-\uF204]CJK[\uF201-\uF204])?[^\u201D\u3400-\u9FBF\uF201-\uF204]{0,3}(?:[\uF201-\uF204]CJK[\uF201-\uF204])?[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF][^\u2018\u2019]*$)/m;
        while ( currHTML.length< noBonusLength && currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'\uEB18$1'); //We need the greedy method to get the longest match.
        }
        //CJK’, otherwise words like it's might be affected.
        unpaired=/(^[^\u2018\u2019]*[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF](?:[\uF201-\uF204]CJK[\uF201-\uF204])?)\u2019/m;
        while ( currHTML.length< noBonusLength && currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'$1\uEB19'); //We need the greedy method to get the longest match.
        }
        ///=== Unicode Shifting Ends ===///
        var time2shift=performance.now()-FixMarks_start-time2protect;
        //Remove extra spaces if necessary
        if (delete_all_extra_spaces===true) {
            //For changhai.org and similar sites.
            currHTML=currHTML.replace(/&nbsp;/gi,'\u00A0');
            currHTML=currHTML.replace(/([、，。：；！？）】〉》」』\uEB1D\uEB19]+)(?:[\r\n\u0020\u00A0]|&nbsp;){0,2}/g,'$1');
            //'>' means there is a non-CJK tag(?)
            currHTML=currHTML.replace(/([^\s\u00A0>])(?:[\r\n\u0020\u00A0]|&nbsp;){0,2}([『「《〈【（\uEB1C\uEB18]+)/g,'$1$2');
        }
        else {
            //Delete at most 1 spaces before and after because of the wider CJK marks.
            currHTML=currHTML.replace(/([\uEB1D\uEB19])[ ]?/mg,'$1');
            currHTML=currHTML.replace(/[ ]?([\uEB1C\uEB18])/mg,'$1');
        }
        ///--Group Left: [、，。：；！？）】〉》」』\uEB1D\uEB19] //Occupies the left half width.
        ///--Group Right:[『「《〈【（\uEB1C\uEB18] //Occupies the right half width.
        ///=====Use \uE211 as the calss name for TWO-PUNCT RULES====//
        ///===Do not use the "g" modefier because we are using loops===//
        var reLL=/([\n]?[、，。：；！？）】〉》」』\uEB1D\uEB19][\n]?)([\uF201-\uF204]CJK[\uF201-\uF204])?([、，。：；！？）】〉》」』\uEB1D\uEB19])/m;
        var reLR=/([\n]?[、，。：；！？）】〉》」』\uEB1D\uEB19][\n]?)([\uF201-\uF204]CJK[\uF201-\uF204])?([『「《〈【（\uEB1C\uEB18])/m;
        var reRR=/([\n]?[『「《〈【（\uEB1C\uEB18][\n]?)([\uF201-\uF204]CJK[\uF201-\uF204])?([『「《〈【（\uEB1C\uEB18])/m;
        var reRL=/([\n]?[『「《〈【（\uEB1C\uEB18][\n]?)([\uF201-\uF204]CJK[\uF201-\uF204])?([、，。：；！？）】〉》」』\uEB1D\uEB19])/m;
        var sqz_start=performance.now();
        while (currHTML.match(/(?:[、，。：；！？）】〉》」』\uEB1D\uEB19『「《〈【（\uEB1C\uEB18]([\uF201-\uF204]CJK[\uF201-\uF204])?){2,}/m) && (performance.now()-sqz_start)<sqz_timeout) {
            if (currHTML.match(reLL)) {
                //--TWO PUNCTS: {Left}{Left}--//
                tmp_str='<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;letter-spacing:'+kern_consec_ll+';">$1</cjktext>$2$3';
                currHTML=currHTML.replace(reLL,tmp_str);
            }
            else if (currHTML.match(reLR)) {
                //--TWO PUNCTS: {Left}{Right}--//
                tmp_str='<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;letter-spacing:'+kern_consec_lr+';">$1</cjktext>$2$3';
                currHTML=currHTML.replace(reLR,tmp_str);
            }
            else if (currHTML.match(reRR)) {
                //--TWO PUNCTS: {Right}{Right}--//
                tmp_str='<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;letter-spacing:'+kern_consec_rr+';">$1</cjktext>$2$3';
                currHTML=currHTML.replace(reRR,tmp_str);
            }
            else if (currHTML.match(reRL)) {
                //--TWO PUNCTS: no letter-spacing adjustment for {Right}-{Left}, just a "fake" element--//
                currHTML=currHTML.replace(reRL,'$1<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;"></cjktext>$2$3');
            }
            else {
                console.log("FIXME: current combination of punctuations has not been considered!");
                break;
            }
        }
        ///---Done with conseqtive puncts--///
        if (debug_04===true) {node.style.color="Pink";}
        var SqueezeFirst=false;
        if (SqueezeInd===true) {
            //The punctuation marks is also the first char in a paragraph seems:
            //In current model (1.0.x), all tags are added within this function (FixMarksInCurrHTML), and it should be safe to skip them.
            //Seems no need to squeeze the puncts at the beginning of a paragraph. It may cause format changes.
            if (SqueezeFirst===true) {
                currHTML=currHTML.replace(/^([\uF201-\uF204]CJK[\uF201-\uF204])?(<[^><]*>)*([『「《〈【（\uEB1C\uEB18])/mg,'$1$2<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;margin-left:'+kern_ind_open+';">$3</cjktext>');
            }
            //Then, not the first char. The re_ex also covers the first punct of a serise of puncts.
            currHTML=currHTML.replace(/([^\n><、，。：；！？）】〉》」』\uEB1D\uEB19『「《〈【（\uEB1C\uEB18\uF201-\uF204])((?:<[^><]*>)*(?:[\uF201-\uF204]CJK[\uF201-\uF204])?(?:<[^><]*>)*)([『「《〈【（\uEB1C\uEB18])((?:<[^><]*>)*(?:[\uF201-\uF204]CJK[\uF201-\uF204])?(?:<[^><]*>)*(?:[\uF201-\uF204]CJK[\uF201-\uF204])?)([^><\uF201-\uF204]|$)/mg,'$1$2<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;margin-left:'+kern_ind_open+';">$3</cjktext>$4$5');
            //Do not squeeze the last punctuation marks in a paragraph. Too risky. $3 seems necessary?
            currHTML=currHTML.replace(/([、，。：；！？）】〉》」』\uEB1D\uEB19])([\uF201-\uF204]CJK[\uF201-\uF204])?$/mg,'<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;margin-right:0px">$1</cjktext>$2');
            //Note that [\uF201-\uF204]CJK[\uF201-\uF204] might be added to the end and it must be excluded.
            currHTML=currHTML.replace(/([、，。：；！？）】〉》」』\uEB1D\uEB19])([\uF201-\uF204]CJK[\uF201-\uF204])?((?:<[^><]*>)+[^><\n\uF201-\uF204、，。：；！？）】〉》」』\uEB1D\uEB19『「《〈【（\uEB1C\uEB18]|[^><\n\uF201-\uF204、，。：；！？）】〉》」』\uEB1D\uEB19『「《〈【（\uEB1C\uEB18])/mg,'<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;margin-right:'+kern_ind_close+';">$1</cjktext>$2$3');
        }
        ///=== Squeezing Ends ===///
        var time2squeeze=performance.now()-FixMarks_start-time2shift-time2protect;
        ///=== Change the protected punctuations in tags back==///
        currHTML=currHTML.replace(/\uE862/mg,'\u2018');
        currHTML=currHTML.replace(/\uE863/mg,'\u2019');
        currHTML=currHTML.replace(/\uE972/mg,'\u201C');
        currHTML=currHTML.replace(/\uE973/mg,'\u201D');
        currHTML=currHTML.replace(/\uEA01/mg,'、');
        currHTML=currHTML.replace(/\uEA02/mg,'，');
        currHTML=currHTML.replace(/\uEA03/mg,'。');
        currHTML=currHTML.replace(/\uEA04/mg,'：');
        currHTML=currHTML.replace(/\uEA05/mg,'；');
        currHTML=currHTML.replace(/\uEA06/mg,'！');
        currHTML=currHTML.replace(/\uEA07/mg,'？');
        currHTML=currHTML.replace(/\uEA08/mg,'）');
        currHTML=currHTML.replace(/\uEA09/mg,'】');
        currHTML=currHTML.replace(/\uEA10/mg,'〉');
        currHTML=currHTML.replace(/\uEA11/mg,'》');
        currHTML=currHTML.replace(/\uEA12/mg,'」');
        currHTML=currHTML.replace(/\uEA13/mg,'』');
        currHTML=currHTML.replace(/\uEA14/mg,'『');
        currHTML=currHTML.replace(/\uEA15/mg,'「');
        currHTML=currHTML.replace(/\uEA16/mg,'《');
        currHTML=currHTML.replace(/\uEA17/mg,'〈');
        currHTML=currHTML.replace(/\uEA18/mg,'【');
        currHTML=currHTML.replace(/\uEA19/mg,'（');
        ///////==== Change quotation marks back =====/////
        currHTML=currHTML.replace(/\uEC18/mg,'\u2018');
        currHTML=currHTML.replace(/\uEC19/mg,'\u2019');
        currHTML=currHTML.replace(/\uEC1C/mg,'\u201C');
        currHTML=currHTML.replace(/\uEC1D/mg,'\u201D');
        //Use '\uE985' as the class of CJK quotation marks.
        currHTML=currHTML.replace(/\uEB1C/mg,'<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u201C</cjktext>');
        currHTML=currHTML.replace(/\uEB1D/mg,'<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u201D</cjktext>');
        currHTML=currHTML.replace(/\uEB18/mg,'<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u2018</cjktext>');
        currHTML=currHTML.replace(/\uEB19/mg,'<cjktext class="CJKTestedAndLabeled MarksFixedE135 \uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u2019</cjktext>');
        ///=== Replacing and Restoring Ends ===///
        var time2replace=performance.now()-FixMarks_start-time2squeeze-time2shift-time2protect;
        if ( (performance.now()-FixMarks_start)>200 ) {
            console.log("FIXME: String Operation Too Slow: "+(performance.now()-FixMarks_start).toFixed(0)+" ms.");
            console.log("Protect: "+time2protect.toFixed(0)+" ms.");
            console.log("Shift:   "+time2shift.toFixed(0)+" ms.");
            console.log(" ----->rev: "+fixpair_stop.toFixed(0)+" ms.");
            console.log(" ----->\u201C,\u201D: "+paired_stop.toFixed(0)+" ms.");
            console.log(" ----->\u2018,\u2019: "+paired_single_stop.toFixed(0)+" ms.");
            console.log("Squeeze: "+time2squeeze.toFixed(0)+" ms.");
            console.log("Replace: "+time2replace.toFixed(0)+" ms.");
            console.log("String(Length): "+currHTML.slice(0,216)+"...("+currHTML.length+")");
            console.log('Input As:\n'+inputHTML+'\n@<'+node.nodeName+'>');
        }
        if (debug_tagSeeThrough===true) {console.log("FIXED: "+currHTML+"@"+performance.now());}
        currHTML=currHTML.replace(/^[^\u0000]*\uF201CJK\uF201([^\u0000]*)$/,'$1');
        currHTML=currHTML.replace(/^([^\u0000]*)\uF202CJK\uF202[^\u0000]*$/,'$1');
        if (debug_tagSeeThrough===true) console.log("AFTER TRIMMED:(@"+(performance.now()-FixMarks_start).toFixed(1)+" ms): "+node.nodeName+"#"+node.id+"::"+currHTML);
        if ( (performance.now()-FixMarks_start)>10 ) {
            console.log("Warning: Slow ("+(performance.now()-FixMarks_start).toFixed(1)+" ms) at <"+node.nodeName+">@<"+node.parentNode.nodeName+">: "+node.parentNode.innerHTML);
            console.log("The Continued HTML is:\n"+continuedHTML);
        }
        return currHTML;
    }
    function displayedText(node) {
        var child=node.firstChild;
        var toReturn='';
        while (child) {
            if (child.nodeType===3) {
                toReturn=toReturn+child.data;
            }
            else if (child.nodeType===1 && (window.getComputedStyle(child,null).getPropertyValue("display")!=='none') ) {
                toReturn=toReturn+displayedText(child);
            }
            child=child.nextSibling;
        }
        return toReturn;
    }
}
) ();
