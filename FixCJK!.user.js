// ==UserScript==
// @name              FixCJK!
// @name:zh-CN        “搞定”CJK！
// @namespace         https://github.com/stecue/fixcjk
// @version           0.12.3
// @description       1) Use real bold to replace synthetic SimSun bold; 2) Regular SimSun/中易宋体 can also be substituted; 3) Reassign font fallback list (Latin AND CJK). Browser serif/sans settings are overridden; 4) Use Latin fonts for Latin part in Latin/CJK mixed texts; 5) Fix fonts and letter-spacing for CJK punctuation marks.
// @description:zh-cn 中文字体和标点设定及修正脚本
// @author            stecue@gmail.com
// @license           GPLv3
// @match             http://*/*
// @match             https://*/*
// @match             file:///*
// @exclude           https://*jsfiddle.net*/*
// @grant             GM_addStyle
// ==/UserScript==
(function () {
    'use strict';
    // You can change the the following fonts/settings until the "var FixPunct=" line.
    var CJKdefault = '"Microsoft YaHei",SimSun,"WenQuanYi Zen Hei Sharp","WenQuanYi Micro Hei"'; //The default CJK font. Regular weight.
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
    ///=== "Safe" Zone Ends Here.Do not change following code unless you know the results! ===///
    var timeOut=3000; //allow maximum 3.0 seconds to run this script.
    var maxlength = 1100200; //maximum length of the page HTML to check for CJK punctuations.
    var maxNumElements = 81024; // maximum number of elements to process.
    var CJKOnlyThreshold = 11024; // Only CJK if the number of elements reaches this threshold.
    var loopThreshold = 8192;
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
    var re_to_check = /^uEEE/m; //use ^\uEEE for placeholder.
    ///=== The following variables should be strictly for internal use only.====///
    var SkippedTagsForFonts=/^(TITLE|HEAD|BODY|SCRIPT|noscript|META|STYLE|AUDIO|video|source|AREA|BASE|canvas|figure|map|object|textarea)$/i;
    var SkippedTagsForMarks=/^(TITLE|HEAD|BODY|SCRIPT|noscript|META|STYLE|AUDIO|video|source|AREA|BASE|canvas|figure|map|object|textarea|input|BUTTON|select|option|label|fieldset|datalist|keygen|output)$/i;
    var SkippedTags=SkippedTagsForFonts;
    var t_start = performance.now();
    var t_stop = t_start;
    var re_simsun = / *simsun *| *宋体 *| *ËÎÌå */gi;
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
    //Note that if one prefers using pure Latin punctuation for CJK contents, I'll leave it untouched. (maybe in 0.10.x)
    //else if (!(bodyhtml[0].innerHTML.match(/[\u3000-\u303F\uFF00-\uFFEF]/m))) {
    else if (!(bodyhtml[0].innerHTML.match(/[\u3400-\u9FBF]/))) {
        if (debug_verbose===true) {console.log('FixCJK!: Checking for CJK took '+((performance.now()-t_stop)/1000.0).toFixed(3)+' seconds. No CJK found.');}
        if (debug_verbose===true) {console.log('FixCJK!: No need to check CJK punctuations.');}
        FixPunct=false;
    }
    else {
        if (debug_verbose===true) {console.log('FixCJK!: Checking for CJK took '+((performance.now()-t_stop)/1000.0).toFixed(3)+' seconds. CJK found.');}
        FixPunct=true;
    }
    var sig_sun = 'RealCJKBold 宋'; // signature to check if change is sucssful or not.
    var sig_hei = 'RealCJKBold 黑'; // signature to check if change is sucssful or not.
    var sig_bold = 'RealCJKBold 粗'; // signature to check if change is sucssful or not.
    var sig_default = 'RealCJKBold 默'; // signature to check if change is sucssful or not.
    var sig_punct = '\uE135'; //will be attached to CJKPunct; This is used in punct fixing not font fixing(?)
    var qsig_sun = '"' + sig_sun + '"'; //Quoted sinagure; Actually no need to quote.
    var qsig_hei = '"' + sig_hei + '"'; //Quoted sinagure;
    var qsig_bold = '"' + sig_bold + '"';
    var qsig_default = '"' + sig_default + '"';
    //var qpreCJK = '"' + CJKdefault + '"'; //Quoted "CJK font".
    var genPunct='General Punct \uE137'; //Different from sig_punct
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
    var kern_consec_ll='-0.45em'; //。” or ））
    var kern_consec_rr='-0.4em'; //（（
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
    /// ===== Labeling CJK elements === ///
    t_stop=performance.now();
    for (i=0;i < all.length;i++) {
        if ((all[i].nodeName.match(SkippedTags)) || all[i] instanceof SVGElement){
            continue;
        }
        font_str=dequote(window.getComputedStyle(all[i], null).getPropertyValue('font-family'));
        if (font_str.match(re_simsun)) {
            all[i].classList.add("CJK2Fix");
            //console.log(all[i].className);
            continue;
        }
        child = all[i].firstChild;
        while (child) {
            if (child.nodeType == 3 && (child.data.match(/[\u3400-\u9FBF]/))) {
                all[i].classList.add("CJK2Fix");
                //console.log(all[i].className);
                break;
            }
            child=child.nextSibling;
        }
    }
    //Do not try to fixpuncts if it is an English site. Just trying to save time.
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
    var useDelayedFix=false;
    var useLoop=false;
    var returnNow=true;
    var returnLater=false; //Do the actual fixing.
    var MaxNumLoops=1;
    if (document.URL.match(/zhihuxcom|sinaxcom/)) {
        useLoop=true;
    }
    if (useDelayedFix===true) {
        var DelayedTimer=200;
        window.setTimeout(FunFixPunct(useLoop,MaxNumLoops,returnLater),DelayedTimer);
    }
    else {
        FunFixPunct(useLoop,MaxNumLoops,returnLater);
    }
    ///===End of Solving the picture problem===///
    if (debug_verbose===true) {console.log('FixCJK!: Fixing punctuations took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
    ///===Add onClick listener before exiting===///
    var NumClicks=0;
    var t_last=performance.now();
    var t_interval=timeOut; //The interval between two checks.
    var NumAllCJKs=(document.getElementsByClassName('CJK2Fix')).length;
    var NumPureEng=0;
    var LastURL=document.URL;
    var LastMod=document.lastModified;
    var ItvScl=3.0;
    if (NumAllCJKs*1.0/NumAllDOMs*100 < 1.0) {
        NumPureEng++;
    }
    //document.onClick will cause problems on some webpages on Firefox.
    var downtime=performance.now();
    var downX=0;
    var downY=0;
    document.body.addEventListener("mousedown",function (e){downtime=performance.now();downX=e.clientX;downY=e.clientY;},false);
    document.body.addEventListener("mouseup",function (e){
        if (((performance.now()-downtime) > 800) && (Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)) < 3) {
            e.target.classList.add("SafedByUser");
            e.target.classList.remove("MarksFixedE135");
            if (debug_verbose===true) {console.log(e.target.nodeName+"."+e.target.className+":: "+(Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)).toString());}
            ReFixCJK(e);
            if (document.URL.match(/zhihu\.com/mg))
                FixLazy();
        }
        else if (((performance.now()-downtime) < 300) && (Math.abs(e.clientX-downX)+Math.abs(e.clientY-downY)) ===0 )
            ReFixCJK(e);
    },false);
    ///===Time to exit the main function===///
    var t_fullstop=performance.now();
    if (processedAll===true) {
        console.log('FixCJK!: NORMAL TERMINATION: '+((t_fullstop-t_start)/1000).toFixed(3)+' seconds is the overall execution time. No skipped step(s).');
    }
    else {
        console.log('FixCJK!: EXECUTION ABORTED: '+((t_fullstop-t_start)/1000).toFixed(3)+' seconds is the overall execution time. Some step(s) were skipped due to performance issues.');
    }
    ////////////////////======== Main Function Ends Here ==============/////////////////////////////
    //===The actual listening function===//
    function ReFixCJK (e) {
        var bannedTagsInReFix=/^(A|BUTTON|TEXTAREA|AUDIO|VIDEO|SOURCE|FORM|INPUT|select|option|label|fieldset|datalist|keygen|output|canvas|nav|svg|img|figure|map|area|track|menu|menuitem)$/i;
        if (debug_verbose===true) {console.log(e.target.nodeName);}
        t_start=performance.now();
        if (document.URL!==LastURL) {
            NumPureEng = 0;
            LastURL=document.URL;
        }
        var clickedNode=e.target;
        document.body.classList.remove("SafedByUser"); //Remove the SafedByUser if it is clicked by user.
        while (clickedNode.nodeName!=="BODY") {
            if (clickedNode.nodeName.match(bannedTagsInReFix)) {
                console.log("FixCJK!: Not a valid click on DOM element \u201C"+clickedNode.nodeName+"."+clickedNode.className+"\u201D");
                return false;
            }
            if (debug_verbose===true) {console.log("Clicked: "+clickedNode.nodeName);}
            clickedNode=clickedNode.parentNode;
        }
        if ((document.lastModified===LastMod) && (NumClicks >2)) {
            console.log('FixCJK!: Document modified at '+document.lastModified+', no change.');
            return true;
        }
        else {
            if (debug_verbose===true) {console.log('FixCJK!: Document modified at '+document.lastModified);}
        }
        //NumPureEng method is still usefull because document.lastModified method is only partially reliable.
        if (NumPureEng >= 2) {
            console.log('Probably pure English/Latin site, re-checking skipped.');
            return true;
        }
        if (debug_verbose===true) {alert('FixCJK!: '+NumClicks.toString());}
        //First remove the "CJK2Fix" attibute for those already processed.
        var AllCJKFixed=document.getElementsByClassName("FontsFixedE137");
        for (i=0;i<AllCJKFixed.length;i++) {
            if (debug_verbose===true) {console.log(AllCJKFixed[i].className);}
            if (AllCJKFixed[i].classList.contains("MarksFixedE135")) {
                AllCJKFixed[i].classList.remove("CJK2Fix");
            }
        }
        if ((NumClicks < 2) || ((t_start-t_last)*ItvScl > t_interval) ) {
            FixRegular = true; //Also fix regular fonts. You need to keep this true if you want to use "LatinInSimSun" in Latin/CJK mixed context.
            FixMore = false; //Appendent CJK fonts to all elements. No side effects found so far.
            FixPunct = true; //If Latin punctions in CJK paragraph need to be fixed. Usually one needs full-width punctions in CJK context. Turn it off if the script runs too slow or HTML strings are adding to your editing area.
            maxlength = 1100200; //maximum length of the page HTML to check for CJK punctuations.
            maxNumElements = 8000; // maximum number of elements to process.
            CJKOnlyThreshold = 2000; // Only CJK if the number of elements reaches this threshold.
            invForLimit=6; //the time limit factor (actual limit is timeOut/invForLimit) for the "for loop" in Round 2 & 3.
            processedAll=true;
            ifRound1=true;
            ifRound2=true;
            ifRound3=false;
            //FixCJK();
            var ReFixAll=document.getElementsByTagName('*');
            var NumFixed=0;
            var NumReFix=0;
            for (i=0;i<ReFixAll.length;i++) {
                if ((ReFixAll[i].nodeName.match(SkippedTags)) || ReFixAll[i] instanceof SVGElement){
                    continue;
                }
                else if (ReFixAll[i].className.match("SafedByUser")) {
                    ReFixAll[i].classList.add("CJK2Fix");
                    NumReFix++;
                }
                else if ((ReFixAll[i].hasAttribute('class') ===true) && (ReFixAll[i].className.match(/FixedE1/))) {
                    NumFixed++;
                    continue;
                }
                else {
                    child = ReFixAll[i].firstChild;
                    while (child) {
                        if (child.nodeType == 3 && (child.data.match(/[\u3400-\u9FBF]/))) {
                            if (debug_verbose===true) {
                                console.log(ReFixAll[i].className+':: '+child.data);
                                console.log(ReFixAll[i].outerHTML);
                            }
                            ReFixAll[i].classList.add("CJK2Fix");
                            //ReFixAll[i].className=(ReFixAll[i].className).replace(/(?: CJK2Fix)+/g,' CJK2Fix');
                            NumReFix++;
                            break;
                        }
                        child=child.nextSibling;
                    }
                }
            }
            FixAllFonts();
            if (debug_verbose===true) {console.log('FixCJK!: '+NumFixed.toString()+' elements has been fixed.');}
            if (debug_verbose===true) {console.log('FixCJK!: '+NumReFix.toString()+' elements to Re-Fix.');}
            FunFixPunct(useLoop,2,returnLater);
            console.log('FixCJK!: ReFixing took '+((performance.now()-t_start)/1000).toFixed(3)+' seconds.');
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
    }
    ///===various aux functions===///
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
        var localed='local("'+font_str[0]+'"), local("'+font_str[0]+' Regular")';
        for (var l=1;l<font_str.length;l++) {
            localed=localed+',\n'+'local("'+font_str[l]+'"),local("'+font_str[l]+' Regular")';
        }
        return localed;
    }
    /// ======================== FixAllFonts, 3 Rounds ==============================///
    function FixAllFonts () {
        SkippedTags=SkippedTagsForFonts;
        /// ===== First round: Replace all bold fonts to CJKBold ===== ///
        t_stop=performance.now();
        all = document.getElementsByClassName('CJK2Fix');
        if (ifRound1===true) {
            for (i = 0; i < all.length; i++) {
                if (i % 500===0) { //Check every 500 elements.
                    if ((performance.now()-t_stop)*invForLimit > timeOut) {
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
                            all[i].style.fontFamily = genPunct+','+ replace_font(font_str, re_sans0, LatinSans+','+qBold) + ',sans-serif';
                        }        //Test if contains serif
                        else if (list_has(font_str, re_serif) !== false) {
                            //all[i].style.color="SeaGreen";
                            all[i].style.fontFamily = genPunct+','+ replace_font(font_str, re_serif, LatinSerif + ',' +qBold) + ',serif';
                        }        //Test if contains monospace
                        else if (list_has(font_str, re_mono0) !== false) {
                            //all[i].style.color="Maroon";
                            all[i].style.fontFamily = genPunct+','+ replace_font(font_str, re_mono0, LatinMono + ',' +qBold) + ',monospace';
                        }        //Just append the fonts to the font preference list.
                        else {
                            //all[i].style.color="Fuchsia"; //qBold+"false-safe" sans-serif;
                            all[i].style.fontFamily = genPunct+','+font_str + ',' + LatinSans + ',' + qBold + ',' + '  sans-serif';
                            //console.log(all[i].style.fontFamily);
                        }
                    }
                    child = child.nextSibling;
                }
            }
        }
        if (FixRegular === false) {
            return false;
        }
        /// ===== Second Round: Deal with regular weight. ===== ///
        var tmp_idx=0;
        max = all.length;
        if ((performance.now()-t_stop)*4 > timeOut) {
            ifRound2=false;
            ifRound3=false;
            FixPunct=false;
            processedAll=false;
            console.log('FixCJK!: Round 1 has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. Skipping following steps.');
        }
        t_stop=performance.now();
        if (ifRound2===true) {
            for (i = 0; i < all.length; i++) {
                if (i % 500===0) { //Check every 500 elements.
                    if ((performance.now()-t_stop)*invForLimit > timeOut) {
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
                                        if (debug_verbose===true) {console.log(font_str);console.log(font_str.replace(re_simsun, qSimSun));}
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
                if (FixMore === false) {
                    //Add FontsFixed if Round 3 is skipped intentially.
                    all[i].classList.add("FontsFixedE137");
                }
            }
        }
        if (debug_verbose===true) {console.log('FixCJK!: Round 2 took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
        t_stop=performance.now();
        if (debug_02===true) console.log('Just before Round 3:'+tmp_idx.toString()+'::'+all[tmp_idx].innerHTML);
        if (debug_02===true) console.log('Just before Round 3:'+tmp_idx.toString()+'::'+dequote(window.getComputedStyle(all[tmp_idx], null).getPropertyValue('font-family')));
        /// ===== The Third round: Add CJKdefault to all elements ===== ///
        if (FixMore === false) {
            t_stop=performance.now();
            if (debug_verbose===true) {console.log('FixCJK!: FixMore/Round 3 is intentionally skipped.');}
            return false;
        }
        all = document.getElementsByTagName('*');
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
            all = document.getElementsByTagName('CJK2Fix');
            console.log('FixCJK!: '+max.toString()+' elements, too many. Only CJK elements will be processed in Round 3.');
        }
        else {
            if (debug_verbose===true) {console.log('FixCJK!: All elements will be processed in Round 3.');}
        }
        if (ifRound3===true) {
            for (i = 0; i < all.length; i++) {
                //all[i].style.color="SeaGreen";
                if (i % 500===0) { //Check every 500 elements.
                    if ((performance.now()-t_stop)*invForLimit > timeOut) {
                        ifRound3=false;
                        FixPunct=false;
                        processedAll=false;
                        console.log('FixCJK!: Round 3 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds. Too slow to continue. Exiting now...');
                        break;
                    }
                    else {
                        if (debug_verbose===true) {console.log('FixCJK!: Round 3 itself has been running for '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
                    }
                }
                if (all[i].nodeName.match(SkippedTags)) {
                    continue;
                }
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
                all[i].classList.add("FontsFixedE137");
            }
        }
        if (debug_verbose===true) {console.log('FixCJK!: Round 3 took '+((performance.now()-t_stop)/1000).toFixed(3)+' seconds.');}
        t_stop=performance.now();
    }
    ///===The Actual Round 4===///
    function FunFixPunct(useLoop,MaxNumLoops,returnNow) {
        SkippedTags=SkippedTagsForMarks;
        var recursion_start=0;
        //Use Recursion instead of loop, should be put in the MaxNumLoops in production code.
        if (returnNow===true) {
            return true;
        }
        var useRecursion=true;
        if (useLoop===true) {useRecursion=false;}
        if (document.getElementsByClassName("CJK2Fix") > loopThreshold) {
            useRecursion=false;
        }
        if (useRecursion===true) {
            if (debug_verbose===true) {console.log('Using Recursion');}
            var allrecur=document.getElementsByClassName("CJK2Fix");
            for (var ir=0; ir<allrecur.length; ir++) {
                if ( !(allrecur[ir].classList.contains("MarksFixedE135")) ) {
                    //Seems no need to add !(allrecur[ir].parentNode.classList.contains("CJK2Fix")). It might be faster to fix the deepest element first through looping.
                    recursion_start=performance.now();
                    FixPunctRecursion(allrecur[ir]);
                    if ( (performance.now()-t_start) > timeOut ) {
                        processedAll=false;
                        console.log("FixCJK!: Time out. Last fixing took "+((performance.now()-recursion_start)/1000).toFixed(3)+" seconds.");
                        console.log("FIXME:"+allrecur[ir].nodeName+"."+allrecur[ir].className);
                        break;
                    }
                }
            }
        }
        else {
            while ((FixPunct === true) && (MaxNumLoops>0)) {
                if ((performance.now()-t_start) > timeOut) {
                    processedAll=false;
                    console.log('FixCJK!: Time out, stopping now...');
                    break;
                }
                FixPunctLoop(MaxNumLoops);
                MaxNumLoops--;
            }
        }
    }
    /////=====The Recursive Implementation=====/////
    function FixPunctRecursion(node) {
        if (node.innerHTML.match(re_to_check)) {console.log("Checking node: "+node.nodeName+"."+node.className+"@"+node.parentNode.nodeName+":: "+node.innerHTML.slice(0,216));}
        var tabooedTags=SkippedTagsForMarks;
        var child=node.firstChild;
        var currHTML="";
        var SafeTags=/^(A|ABBR|UL|LI|SUB|SUP|P|I|B|STRONG|EM|FONT|H[123456]|U|VAR|WBR)$/i; //Safe tags as subelements. They do not need to meet the "no class && no tag" criterion.
        var allSubSafe=true;
        var node2fix=false;
        if (node.classList.contains("MarksFixedE135")) {
            return true;
        }
        if (node.nodeName.match(tabooedTags)) {
            //Although BODY is tabooed, this is OK because a loop is outside this recursive implementation.
            node.classList.remove("Safe2FixCJK\uE000");
            node.classList.add("MarksFixedE135");
            return false;
        }
        while (child) {
            if (node.innerHTML.match(re_to_check)) {console.log("Checking subnode: "+child+"@"+node.nodeName);}
            if ( child.nodeType === 3 && !(node.nodeName.match(tabooedTags)) ) {
                if (node.innerHTML.match(re_to_check)) {console.log("Found as Type 3 subnode: "+child.nodeName+"."+child.className+"@"+node.nodeName+":: "+child.data);}
                node2fix=true;
                if (debug_verbose===true) {
                    console.log("Permitted to check: "+node.nodeName+"."+node.className);
                }
                if (node.innerHTML.match(re_to_check) && node.nodeName.match(tabooedTags)) {
                    console.log("ERROR: Wrong Operation on: "+node.nodeName+"."+node.className+":: "+node.textContent);
                    console.log("ERROR: Wrong Operation because: "+child.data);
                }
            }
            if (child.nodeType===1 && !(child instanceof SVGElement))  {
                if  (child.nodeName.match(tabooedTags) || child.classList.contains("MarksFixedE135")) {
                    child.classList.remove("Safe2FixCJK\uE000");
                    child.classList.remove("CJK2Fix");
                    child.classList.add("MarksFixedE135");
                }
                else {
                    FixPunctRecursion(child); //This is the recursion part. The child.class might be changed.
                }
                //Test again after fixing child:
                if (!(child.classList.contains("Safe2FixCJK\uE000"))) {allSubSafe=false;} //\uE000 is Tux in Linux Libertine.
            }
            child=child.nextSibling;
        }
        if (allSubSafe===true && (!(node instanceof SVGElement))) {
            var orig_class=node.className;
            node.classList.remove("CJK2Fix");
            node.classList.remove("MarksFixedE135");
            node.classList.remove("FontsFixedE137");
            node.classList.remove("\uE985");
            node.classList.remove("\uE211");
            node.classList.remove("Safe2FixCJK\uE000");
            if (node.tagName.match(SafeTags)) {
                //note that Safe2FixCJK\uE000 means it is safe as a subelement. Safe2FixCJK\uE000 also means node.innerHTML is safe. However itself may have event listeners attached to it.
                node.className=orig_class;
                node.classList.add("Safe2FixCJK\uE000");
            }
            else if (node.classList.length===0 && node.id.length ===0 && !(node.nodeName.match(tabooedTags))) {
                //It would be crazy if add listeners just by tags.
                node.className=orig_class;
                node.classList.add("Safe2FixCJK\uE000");
            }
            else {
                node.className=orig_class;
            }
        }
        //Force to fix if Safed by User
        if (!(node instanceof SVGElement) && node.classList.contains("SafedByUser") ) {
            console.log("SAFED BY USER: "+node.nodeName+"."+node.className);
            allSubSafe=true;
            node.classList.add("CJK2Fix");
            node.classList.remove("MarksFixedE135");
            //Do not add it to "Safe2FixCJK\uE000" class, otherwise re-check may destroy the listeners attached to the "outerHTML".
        }
        //Config and Filtering Done. Fix puncts if necessary.
        if (allSubSafe===true && node2fix===true && !(node.nodeName.match(tabooedTags)) && node.classList.contains("CJK2Fix") && !(node.classList.contains("MarksFixedE135"))) {
            if (debug_verbose===true) console.log("USING Recursion: "+node.nodeName+'.'+node.className);
            if (node.classList.contains("SafedByUser")) {
                if (debug_verbose===true) {console.log("SAFEDDD BY USER: "+node.nodeName+"."+node.className);}
                node.classList.remove("SafedByUser");
            }
            if (debug_verbose===true) { console.log("WARNING: Danger Operation on: "+node.nodeName+"."+node.className+":: "+node.innerHTML.slice(0,216)); }
            if (node.innerHTML.match(re_to_check)) {console.log("Checking if contain punctuations to fix");}
            if (node.innerHTML.match(/[“”‘’、，。：；！？）】〉》」』『「《〈【（]/m)) {
                if (node.innerHTML.match(re_to_check)) { console.log("WARNING: Danger Operation on: "+node.nodeName+"."+node.className);}
                if (window.getComputedStyle(node, null).getPropertyValue("white-space").match(/pre/)){
                    node.innerHTML=FixMarksInCurrHTML(node.innerHTML,false,false);
                }
                else {
                    if (node.innerHTML.match(re_to_check)) {console.log("Now fixing --> "+node.nodeName+"."+node.className+":: "+node.innerHTML.slice(0,216));}
                    node.innerHTML=FixMarksInCurrHTML(node.innerHTML,true,false);
                }
                //Add lang attibute. Firefox cannot detect lang=zh automatically and it will treat CJK characters as letters if no lang=zh. For example,
                //the blank spaces will be streched but not the "character-spacing" if using align=justify.
                node.lang="zh";
            }
            node.classList.add("MarksFixedE135");
            return true;
        }
        else {
            node.classList.add("MarksFixedE135");
            return true;
        }
    }
    ///== Each Loop in FunFixPunct() ==///
    function FixPunctLoop(MaxNumLoops) {
        SkippedTags=SkippedTagsForMarks;
        console.log('FixCJK!: Using loops'); //Recursion is the default implementation.
        var i=0;
        var puncnode=new Array('');
        var puncid=new Array('');
        var currpunc=0;
        var numnodes=0;
        var maxChildDataLength=80;
        var delete_all_extra_spaces=true;
        var AlsoChangeFullStop=false;
        var all = document.getElementsByClassName('CJK2Fix');
        numnodes=0;
        puncnode=new Array('');
        puncid=new Array('');
        for (i = 0; i < all.length; i++) {
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
                if (child.nodeType == 3 && !(child.data.match(/^[\s]+$/mg))) {
                    //console.log(child.data);
                    //use "mg" to also match paragraphs with punctions at the end or beginning of a line.
                    if (all[i].nodeName.match(SkippedTags)) {
                        if (MaxNumLoops===0) {
                            console.log('FixCJK!: Skipped Change (Case 0): '+all[i].nodeName+'#'+i.toString()+': '+child.data.slice(0,Math.min(maxChildDataLength,child.data.length)));
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
                                console.log('FixCJK!: To Change (Case A): '+all[i].nodeName+'#'+i.toString()+': '+child.data.slice(0,Math.min(maxChildDataLength,child.data.length)));
                            }
                            //if (all[i].id.match(/^$/)) {all[i].id='punct'+i.toString();}
                            //puncid.push(all[i].id);
                            if_replace=true;
                            break;
                        }
                        else if ((delete_all_extra_spaces===true) && (child.data.match(/[\u3000-\u303F\uFF00-\uFFEF][\n]?[ ][^ |$]/mg))) {
                            if (debug_04===true) {all[i].style.color='Purple';} //Punctions-->Purple;
                            numnodes++;
                            puncnode.push(i);
                            if (MaxNumLoops===0) {
                                console.log('FixCJK!: To Change (Case B): '+all[i].nodeName+'#'+i.toString()+': '+child.data.slice(0,Math.min(maxChildDataLength,child.data.length)));
                            }
                            //if (all[i].id.match(/^$/)) {all[i].id='punct'+i.toString();}
                            //puncid.push(all[i].id);
                            break;
                        }
                        else if ((AlsoChangeFullStop===true) && child.data.match(/[？！：；、，。]/mg)) {
                            if (MaxNumLoops===0) {
                                console.log('FixCJK!: To Change (Case C): '+all[i].nodeName+'#'+i.toString()+': '+child.data.slice(0,Math.min(maxChildDataLength,child.data.length)));
                            }
                            numnodes++;
                            puncnode.push(i);
                            //if (all[i].id.match(/^$/)) {all[i].id='punct'+i.toString();}
                            //puncid.push(all[i].id);
                            if_replace=true;
                            break;
                        }
                        else if (child.data.match(/[\u3000-\u303F\uFF00-\uFFEF][\u3000-\u303F\uFF00-\uFFEF]/mg)) {
                            if (MaxNumLoops===0) {
                                console.log('FixCJK!: To Change (Case D): '+all[i].nodeName+'#'+i.toString()+': '+child.data.slice(0,Math.min(maxChildDataLength,child.data.length)));
                            }
                            numnodes++;
                            puncnode.push(i);
                            if_replace=true;
                            break;
                        }
                        else {
                        }
                    }
                }
                child = child.nextSibling;
            }
            if (if_replace === false) {
                all[i].classList.add("MarksFixedE135"); //one can not remove CJKFixed classname now because index i is "live".
                if (debug_04===true) {console.log(all[i].nodeName+'::'+all[i].className);}
            }
            else {
                if (debug_04===true) {console.log(all[i].nodeName+'::'+all[i].innerHTML);}
            }
        }
        if ((performance.now()-t_start) > timeOut) {
            processedAll=false;
            console.log('FixCJK!: Time out, stopping now...');
            return false;
        }
        if (numnodes===0) {
            FixPunct=false;
            return false;
        }
        if (debug_verbose===true) {console.log('FixCJK!: '+MaxNumLoops.toString()+' (or less) loop(s) left.');}
        if (debug_verbose===true) {console.log('FixCJK!: '+numnodes.toString()+' element(s) to change.');}
        currpunc=0;
        //var kern_dq_right='-1px';
        //var kern_dq_right_tail='-5px';
        while(numnodes>0) {
            if ((performance.now()-t_start) > timeOut) {
                processedAll=false;
                console.log('FixCJK!: Time out, some elements are left unchanged...');
                break;
            }
            numnodes--;
            currpunc=puncnode.pop();
            if (MaxNumLoops===0) {
                console.log('FixCJK!: currpunc='+currpunc.toString()+': '+all[currpunc].nodeName+': '+currHTML.slice(0,Math.min(maxChildDataLength,currHTML.length)));
            }
            if (debug_04===true) {console.log(currpunc);}
            //console.log(currpunc.toString()+":: "+all[currpunc].outerHTML);
            all[currpunc].innerHTML=FixMarksInCurrHTML(all[currpunc].innerHTML,true,false);
            all[currpunc].classList.add("MarksFixedE135"); //We cannot Remove the "CJK2Fix" class here because the index i is "live".
        }
    }
    ///==Fix punct in a currHTML===///
    function FixMarksInCurrHTML(currHTML,delete_all_extra_spaces,AlsoChangeFullStop) {
        //“<-->\u201C, ”<-->\u201D
        //‘<-->\u2018, ’<-->\u2019
        var changhai_style=false;
        var Squeezing=true;
        var SqueezeInd=true;
        var tmp_str='';
        var FixMarks_start=performance.now();
        if (changhai_style===true) {
            //Simply inserting blanck space, like changhai.org.
            currHTML=currHTML.replace(/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]?)([“‘])([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF]+)/g,'$1 $2$3');
            currHTML=currHTML.replace(/([\u3400-\u9FBF\u3000-\u303F\uFF00-\uFFEF])([”’])([^，, ])/g,'$1$2 $3');
            if (debug_04===true) {console.log(currHTML);}
            all[currpunc].innerHTML=currHTML;
            return true;
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
        //Now let's fix the punctions.
        //First we need to fix the "reverse-paired" punctuations.
        var fixpair=true;
        var fixpair_timeout=10; //Don't spend too much time on this "bonus" function.
        var fixpair_start=performance.now();
        if (currHTML.match(re_to_check)) {console.log("Reversing "+currHTML);}
        if (fixpair===true) { //[\w,./<>?;:[]\{}|`~!@#$%^&*()_+-=]*
            var revpaired=/(^[^\u201C\u201D]?(?:[^\u201C\u201D]*\u201C[^\u201C\u201D]*\u201D)*[^\u201C\u201D]*)\u201D([^\u201C\u201D]{2,})\u201C/m;
            while (currHTML.match(revpaired) && (performance.now()-fixpair_start)<fixpair_timeout ) {
                if (currHTML.match(re_to_check)) {console.log("Pair reversed: "+(performance.now()-t_start).toString());}
                currHTML=currHTML.replace(revpaired,'$1\u201C$2\u201D');
            }
        }
        //Find paired CJK marks. Seems like O(n^2) without the "g" modifier?
        var paired=/(\u201C)([^\u201D]*[\u3400-\u9FBF][^\u201D]*)(\u201D)/mg;
        while (currHTML.match(paired)) {
            currHTML=currHTML.replace(paired,'\uEB1C$2\uEB1D');
        }
        //Find paired Latin marks.
        paired=/(\u201C)([^\u3000-\u303F\u3400-\u9FBF\E000-ED00\uFF00-\uFFEF]*)(\u201D)/mg;
        while (currHTML.match(paired)) {
            if (currHTML.match(re_to_check)) console.log("Quotation mark pair found@"+currHTML);
            currHTML=currHTML.replace(paired,'\uEC1C$2\uEC1D');
        }
        //"unpaired \u201C or \u201D", not just use at the beginning of a paragraph.
        var unpaired_timeout=10; //not so important, therefore cannot spend too much time here.
        var unpaired_start=performance.now();
        var unpaired=/\u201C([^\u201D\u3400-\u9FBF]{0,3}[\u3400-\u9FBF][^\u201C\u201D]*$)/m;
        while (currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'\uEB1C$1'); //We need the greedy method to get the longest match.
        }
        unpaired=/(^[^\u201C\u201D]*[\u3400-\u9FBF][^\u201D\u3400-\u9FBF]{0,3})\u201D/m;
        while (currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'$1\uEB1D'); //We need the greedy method to get the longest match.
        }
        //For single quotations:
        paired=/(\u2018)([^\u2019]*[\u3000-\u303F\u3400-\u9FBF\uFF00-\uFFEF][^\u2019]*)(\u2019)/mg;
        while (currHTML.match(paired)) {
            currHTML=currHTML.replace(paired,'\uEB18$2\uEB19');
        }
        //"unpaired ‘ (\u2018)", not just use at the beginning of a paragraph.
        unpaired_start=performance.now();
        unpaired=/\u2018([^\u201D\u3400-\u9FBF]{0,3}[\u3400-\u9FBF][^\u2018\u2019]*$)/m;
        while (currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'\uEB18$1'); //We need the greedy method to get the longest match.
        }
        //CJK’, otherwise words like it's might be affected.
        unpaired=/(^[^\u2018\u2019]*[\u3400-\u9FBF])\u2019/m;
        while (currHTML.match(unpaired) && (performance.now()-unpaired_start)<unpaired_timeout) {
            currHTML=currHTML.replace(unpaired,'$1\uEB19'); //We need the greedy method to get the longest match.
        }
        ///=== Unicode Shifting Ends ===///
        var time_shifting=performance.now()-FixMarks_start;
        //Remove extra spaces if necessary
        if (delete_all_extra_spaces===true) {
            //For changhai.org and similar sites.
            currHTML=currHTML.replace(/([、，。：；！？）】〉》」』\uEB1D\uEB19]+)[\s]{0,2}/mg,'$1');
            currHTML=currHTML.replace(/[\s]{0,2}([『「《〈【（\uEB1C\uEB18]+)/mg,'$1');
        }
        else {
            currHTML=currHTML.replace(/([\uEB1D\uEB19])[ ]?/mg,'$1');
            currHTML=currHTML.replace(/[ ]?([\uEB1C\uEB18])/mg,'$1');
        }
        ///--Group Left: [、，。：；！？）】〉》」』\uEB1D\uEB19] //Occupies the left half width.
        ///--Group Right:[『「《〈【（\uEB1C\uEB18] //Occupies the right half width.
        ///=====Use \uE211 as the calss name for TWO-PUNCT RULES====//
        ///===Do not use the "g" modefier because we are using loops===//
        var reLL=/([\n]?[、，。：；！？）】〉》」』\uEB1D\uEB19][\n]?)([、，。：；！？）】〉》」』\uEB1D\uEB19])/m;
        var reLR=/([\n]?[、，。：；！？）】〉》」』\uEB1D\uEB19][\n]?)([『「《〈【（\uEB1C\uEB18])/m;
        var reRR=/([\n]?[『「《〈【（\uEB1C\uEB18][\n]?)([『「《〈【（\uEB1C\uEB18])/m;
        var reRL=/([\n]?[『「《〈【（\uEB1C\uEB18][\n]?)([、，。：；！？）】〉》」』\uEB1D\uEB19])/m;
        var sqz_start=performance.now();
        var sqz_timeout=50; // 50ms per element seems long enough.
        while (currHTML.match(/[、，。：；！？）】〉》」』\uEB1D\uEB19『「《〈【（\uEB1C\uEB18]{2,}/m) && (performance.now()-sqz_start)<sqz_timeout) {
            if (currHTML.match(reLL)) {
                //--TWO PUNCTS: {Left}{Left}--//
                tmp_str='<span class="\uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;letter-spacing:'+kern_consec_ll+';">$1</span>$2';
                currHTML=currHTML.replace(reLL,tmp_str);
            }
            else if (currHTML.match(reLR)) {
                //--TWO PUNCTS: {Left}{Right}--//
                tmp_str='<span class="\uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;letter-spacing:'+kern_consec_lr+';">$1</span>$2';
                currHTML=currHTML.replace(reLR,tmp_str);
            }
            else if (currHTML.match(reRR)) {
                //--TWO PUNCTS: {Right}{Right}--//
                tmp_str='<span class="\uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;letter-spacing:'+kern_consec_rr+';">$1</span>$2';
                currHTML=currHTML.replace(reRR,tmp_str);
            }
            else if (currHTML.match(reRL)) {
                //--TWO PUNCTS: no letter-spacing adjustment for {Right}-{Left}--//
                currHTML=currHTML.replace(reRL,'$1<wbr>$2');
            }
            else {
                console.log("FIXME: current combination of punctuations has not been considered!");
                break;
            }
        }
        ///---Done with conseqtive puncts--///
        if (debug_04===true) {all[currpunc].style.color="Pink";}
        if ((AlsoChangeFullStop===true) && (currHTML.match(/[？！：；、，。]/mg))) {
            currHTML=currHTML.replace(/([？！：；、，。])/mg,'<span class="\uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">$1</span>');
        }
        if (SqueezeInd===true) {
            //Do not squeeze the first or the last punctuation marks in a paragraph. Too risky.
            currHTML=currHTML.replace(/([<[^\uE211]*>]|[^><])([『「《〈【（\uEB1C\uEB18])/mg,'$1<span class="\uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;margin-left:-0.2em;">$2</span>');
            currHTML=currHTML.replace(/([、，。：；！？）】〉》」』\uEB1D\uEB19])([<[^\uE211]*>]|[^><])/mg,'<span class="\uE211" style="display:inline;padding-left:0px;padding-right:0px;float:none;margin-right:-0.2em;">$1</span>$2');
        }
        ///=== Squeezing Ends ===///
        var time_squeezing=performance.now()-time_shifting;
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
        currHTML=currHTML.replace(/\uEC1C/mg,'\u201C');
        currHTML=currHTML.replace(/\uEC1D/mg,'\u201D');
        currHTML=currHTML.replace(/\uEB1C/mg,'<span class="\uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u201C</span>');
        currHTML=currHTML.replace(/\uEB1D/mg,'<span class="\uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u201D</span>');
        currHTML=currHTML.replace(/\uEB18/mg,'<span class="\uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u2018</span>');
        currHTML=currHTML.replace(/\uEB19/mg,'<span class="\uE985" style="display:inline;padding-left:0px;padding-right:0px;float:none;font-family:'+dequote(CJKPunct)+';">\u2019</span>');
        ///=== Replacing and Restoring Ends ===///
        var time_replacing=performance.now()-time_squeezing;
        if ( (performance.now()-FixMarks_start)>200 ) {
            console.log("FIXME: String Operation Too Slow: "+(performance.now()-FixMarks_start).toFixed(0)+" ms.")
            console.log("Shifting:  "+time_shifting.toFixed(0)+" ms.");
            console.log("Squeezing: "+time_squeezing.toFixed(0)+" ms.");
            console.log("Replacing: "+time_replacing.toFixed(0)+" ms.");
            console.log("String(Length): "+currHTML.slice(0,216)+"...("+currHTML.length+")");
        }
        return currHTML;
    }
    ///===The following loop is to solve the lazy loading picture problem on zhihu.com===///
    //No need if using the recursive implementation. However, it is still needed if the "forced fixing" is triggered.
    function FixLazy() {
        var all=document.getElementsByTagName('img');
        for (var i=0;i<all.length;i++) {
            if (all[i].hasAttribute('data-actualsrc')) {
                all[i].src=all[i].getAttribute('data-actualsrc');
            }
        }
    }
}
) ();
