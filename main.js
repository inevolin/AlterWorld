let urlParams = new URLSearchParams(window.location.search)
let stats = null;
function debuggingStuff() {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
    htmlLog()
    $('#algoselect')[0].innerHTML += '<option value="test">test</option>';
}
function htmlLog() {
    var log = console.log;
    var logs = document.getElementById('log');
    logs.innerHTML += '------ logging ------<br />';
    console.log = function(){
        var args = Array.from(arguments);
        for (var i = 0; i < args.length; i++) {
            let line = args[i];
            if (typeof args[i] == 'object')
                line = JSON.stringify(args[i])
            logs.innerHTML = line + '<br />' + logs.innerHTML;
        }
        log.apply(console, args);
    }
}
let evalString = null;
function startEval(attempt=0) {
    $.get('eval.js?v='+((new Date()).getTime()), {}, function(data) {
        try {
            let lines = data.split('\n');
            let evals = []
            for (let line of lines) {
                let i = line.indexOf('//');
                if (i >= 0)
                    line = line.substring(0, i)
                evals.push(line)
            }
            evalString = evals.join(' ')
            setTimeout(startEval, 500);
        } catch (e) {console.log(''+e,e)}
    }, 'text').fail((e) => {
        console.log("eval error: " + e.status)
        if (attempt < 2)
            startEval(attempt+1)
    });
}

if (urlParams.has('debug')) {
    debuggingStuff();
}
if (urlParams.has('eval')) {
    console.log('startEval')
    startEval();
}

const is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('is_mobile: ' + is_mobile)
console.log('screen: ' + screen.width + ' x ' + screen.height);

const FPS = 30;
let recDelay = 1000/FPS;

let gifw2=null;
let gifrec = false;
const GIF_MAX_DUR_SEC = 15; // s
let gif_frame_cnt = 0;
let gif_frame_delay_sum = 0;
let gif_t_startRender;

const gifw2_onerror = function(e) {
    console.log(e);
    gifrec = false;
    if (gifw2) gifw2.abort();
    gifw2 = null;
    $("#recordcanvas").prop("disabled", false);
    $('#recordcanvas').val('🎥 start recording');
    $('#chkfacingmode, #quality').prop('disabled', false);
    alert('gif recording failed');
};

function startRec() {
    gifrec = true;
    gif_frame_cnt = 0;
    gif_frame_delay_sum = 0;
    gif_t_startRender = 0;
    $('#recordcanvas').val('🔴 stop recording');
    $('#chkfacingmode, #quality').prop('disabled', true); // disallow while recording
    console.log('approx fps: ' + Math.floor(1000/recDelay));
    gifw2 = new GIF({
        workers:4,
        quality:10,
        // debug: true,
    })

    gifw2.on('finished', function(blob) {
        try {
            console.log('rendering took ' + (performance.now()-gif_t_startRender) + ' ms');
            $("#recordcanvas").prop("disabled", false);
            $('#recordcanvas').val('🎥 start recording');
            $('#chkfacingmode, #quality').prop('disabled', false);
            const data = URL.createObjectURL(blob);
            addDlSpace(data);
        } catch (e) {
            gifw2_onerror(e)
        }
    })
    gifw2.on('progress', function(p) {
        $('#recordcanvas').val('⚙ rendering ('+Math.floor(p*100)+'%)');
    })
}
function stopRec() {
    try {
        console.log('stoprec called');
        gifrec = false;
        $("#recordcanvas").prop("disabled", true);
        console.log('rendering... (' + gif_frame_cnt + ' frames @ ca.' + Math.floor(1000/recDelay) + ' fps)')
        gif_t_startRender = performance.now();
        gifw2.render()
    } catch (e) {
        gifw2_onerror(e)
    }
}

$(document).on('ready', function() {
    console.log('document ready')
    uiElements();
    if (!checkBrowserCompat()) {
        console.log('checkBrowserCompat: fail')
        return;
    } else {
        console.log('checkBrowserCompat: succeed')
    }

    cv['onRuntimeInitialized']=()=>{
        onCvLoaded();
    }
})

function getL(id) {
    const t = localStorage.getItem(id);
    console.log('LS: ' + id+': ' + t)
    return t !== undefined && t !== null;
}

$.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + 
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + 
                                                $(window).scrollLeft()) + "px");
    return this;
}

function uiElements() {
    $("#uiform :input").prop("disabled", true);
    if (!is_mobile) {
        $('#chkfacingmode').parent().hide();
        $("#chkfacingmode").prop('checked', false);
    }
    $("#uiform").submit(function(e){
        e.preventDefault();
    });

    if (getL('algoselect'))
        $("#algoselect").val(localStorage.getItem('algoselect'))
    if (getL('quality'))
        $("#quality").val(localStorage.getItem('quality'))

    if (getL('chkfacingmode'))
        $("#chkfacingmode").prop('checked', localStorage.getItem('chkfacingmode')=='true')
    if (getL('chkmirror'))
        $("#chkmirror").prop('checked', localStorage.getItem('chkmirror')=='true')
    if (getL('chkinvert'))
        $("#chkinvert").prop('checked', localStorage.getItem('chkinvert')=='true')
    
    if (getL('vrmode')) {
        $("#vrmode").prop('checked', localStorage.getItem('vrmode')=='true')
        isVR = $('#vrmode')[0].checked;
    }
    if (getL('maestro')) {
        $("#maestro").prop('checked', localStorage.getItem('maestro')=='true')
    }
    if (getL('timedelay'))
        $("#timedelay").val(localStorage.getItem('timedelay'))

    if (getL('glitch'))
        $("#glitch").val(localStorage.getItem('glitch'))

    if (getL('glitchrand'))
        $("#glitchrand").prop('checked', localStorage.getItem('glitchrand')=='true')
    
    $("#canvasOutput").dblclick(function() {
        toggleFullscreen( $("#canvasOutput")[0] );
    });

    $("#algoselect").change(function () {
        localStorage.setItem('algoselect', $('#algoselect').val());
    })
    
    $('#chkfacingmode').on('click', function() {
        localStorage.setItem('chkfacingmode', $("#chkfacingmode")[0].checked);
        onCvLoaded();
    })

    $('#glitchrand').on('click', function() {
        localStorage.setItem('glitchrand', $('#glitchrand')[0].checked);
    })
    $('#chkmirror').on('click', function() {
        localStorage.setItem('chkmirror', $('#chkmirror')[0].checked);
    })
    $('#chkinvert').on('click', function() {
        localStorage.setItem('chkinvert', $('#chkinvert')[0].checked);
    })

    $('#vrmode').on('click', function() {
        localStorage.setItem('vrmode', $('#vrmode')[0].checked);
        isVR = $('#vrmode')[0].checked;
        onCvLoaded();
    })

    $('#maestro').on('click', function() {
        localStorage.setItem('maestro', $('#maestro')[0].checked);
    })
    $("#quality").change(function () {
        localStorage.setItem('quality', $('#quality').val());
        onCvLoaded();
    })

    $('#timedelay').change(function() {
        if ($("#timedelay").val() > 20)
            $("#timedelay").val(20)
        if ($("#timedelay").val() <= 0)
            $("#timedelay").val(1)
        localStorage.setItem('timedelay', $('#timedelay').val());
    })
    $('#glitch').change(function() {
        if ($("#glitch").val() > 100)
            $("#glitch").val(100)
        if ($("#glitch").val() <= 0)
            $("#glitch").val(1)
        localStorage.setItem('glitch', $('#glitch').val());
    })
    
    $('#dlcanvas').on('click', function() {
        const data = document.getElementById('canvasOutput').toDataURL();
        addDlSpace(data);
    })

    if (is_mobile)
        $('#btntorch').show();
    $('#btntorch').on('click', function() {
        const btn = $("#btntorch");
        const track = stream.getVideoTracks()[0];
        if (btn.prop("data-torch")) {
            btn.prop("data-torch", false)
            track.applyConstraints({
                advanced: [{torch: false}]
            });
        } else {
            btn.prop("data-torch", true)
            track.applyConstraints({
                advanced: [{torch: true}]
            });
        }
    })

    $('#recordcanvas').on('click', function() {
        if (!gifrec) startRec();
        else stopRec();
    })

    $('#cleardlspace').on('click', function() {
        $('#dlspace').empty();
    })
}

function addDlSpace(data) {
    var link = document.createElement('img');
    link.src = data;
    $(link).css({
        'max-width': '47%',
        'padding': '2px',
    });
    $('#dlspace').prepend(link);
    var pop = $('#imgok');
    $(pop).css({
        'z-index': 9999999,
    }).center();
    pop.show();
    pop.fadeToggle(600, () => pop.hide());
}

function checkBrowserCompat() {
    let features = {webrtc: true, wasm: true};
    let wasmSupported = true, webrtcSupported = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        webrtcSupported = false;
    }
    if (features.wasm && !window.WebAssembly) {
        wasmSupported = false;
    }
    if (!webrtcSupported || !wasmSupported) {
        var text = "Your web browser doesn't support ";
        var len = text.length;
        if (!webrtcSupported) {
            text += "WebRTC";
        }
        if (!wasmSupported) {
        if (text.length > len) {
            text += " and ";
        }
            text += "WebAssembly"
        }
            text += ".";
        $('#status').text(text);
        return false;
    }
    return true;
}

let RESIZE_METHOD = 0; // cv.INTER_NEAREST
function onCvLoaded() {
    console.log('--------------')
    prevori = window.orientation; // important
    abortStream();

    let WW = $(window).width();
    let WH = $(window).height();

    console.log('orientation: ' + window.orientation)
    console.log('W: ' +WW +', ' + WH)
    if (window.orientation == 0) {
        let tmp = WH;
        WH = WW;
        WW = tmp;
    }
    let qualityRatio = 0.3;
    switch($('#quality').val()) {
        case 'low':
            qualityRatio = 0.3
            break;
        case 'medium':
            qualityRatio = 0.6
            break;
        case 'high':
            qualityRatio = 1
            break;
    }

    const videoCfg = {}
    videoCfg['facingMode'] = $('#chkfacingmode')[0].checked ? 'user' : 'environment';
    console.log('facingMode: ' + videoCfg['facingMode'])

    
    if (Math.abs(window.orientation) === 90) {
        videoCfg['width'] = Math.floor(WW*qualityRatio)
    } else {
        videoCfg['width'] = Math.floor(WW*qualityRatio)
        videoCfg['height'] = Math.floor(WH*qualityRatio)
    }
    
    console.log('requesting: '+  videoCfg['width'] + ', ' + videoCfg['height'])
    console.log('qualityRatio: '+  qualityRatio)
    navigator.mediaDevices.getUserMedia({
        video: videoCfg,
        audio: false,
    })
    .then(processStream)
    .catch(function(err) {
        $("#uiform :input").prop("disabled", false);
        $('#status').text(err);
        console.log(err);
    });
}
function toggleFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { 
        // Firefox
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { 
        // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { 
        // IE/Edge 
        elem.msRequestFullscreen();
    }
}

let isVR = 0;
let stream = null;
let prevori = window.orientation;
function abortStream() {
    if (stream == null) return;
    stream.getTracks().forEach(function(track) {
        track.stop();
    });
}

let fgbg = {h:500, t:16, s:true, obj:null};
function fgbgInit(h, t, s) {
    if (fgbg.h !== h || fgbg.t !== t || fgbg.s !== s) {
        if (fgbg.obj) fgbg.obj.delete();
        fgbg.h = h;
        fgbg.t = t;
        fgbg.s = s;
        fgbg.obj = new cv.BackgroundSubtractorMOG2(h, t, s); // should delete manually
        console.log('new fgbg: ' + h + ', ' + t + ', ' + s)
    }
}

function processStream(_stream) {
    try {
        $("#uiform :input").prop("disabled", false);
        $('#status').text('');

        stream = _stream;

        let WW = $(window).width();
        let WH = $(window).height();
        
        const settings = stream.getTracks()[0].getSettings();
        let VW = settings.width;
        let VH = settings.height;

        if (window.orientation === 0 && VW > VH) {
            console.log('res swap')
            VW = settings.height;
            VH = settings.width;
        }
        else if (Math.abs(window.orientation) === 90 && VH > VW) {
            console.log('res swap')
            VW = settings.height;
            VH = settings.width;
        }

        console.log('V: '+VW + ', ' + VH)
        
        const video = document.getElementById("videoInput"); 
        video.width  = VW;
        video.height = VH;
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.srcObject = stream;
        video.play();

        


        // always scale to fit window width
        let sW = WW;
        let sH = Math.floor(WW/VW*VH)
        let scale = null;
        scale = new cv.Size(sW, sH)
        console.log('scale: ' + sW + ', ' + sH)

        let t0 = performance.now();

        let vsrc = new cv.Mat(VH, VW, cv.CV_8UC4);
        let src = new cv.Mat(sH, sW, cv.CV_8UC4);
        let dst = new cv.Mat(sH, sW, cv.CV_8UC4);
        let cap = new cv.VideoCapture(video);
        let FDE = [];
        let GCH = [];

        if (VW > sW || VH > sH)
            console.log('resizing at start')
        else if (VW < sW || VH < sH)
            console.log('resizing at end')
        else
            console.log('no resize needed')

        function cleanup() {
            if (fgbg.obj) fgbg.obj.delete();
            if (vsrc) vsrc.delete();
            if (src) src.delete();
            if (dst) dst.delete();
            while (FDE.length) FDE.pop().delete();
            while (GCH.length) GCH.pop().delete();
        }

        function processVideo() {
            try {
                if (stream.id !== _stream.id) {
                    cleanup();
                    return console.log('processVideo aborting')
                }
                if (prevori != window.orientation && !gifrec) {
                    cleanup();
                    $(window).one('resize', function () {
                        onCvLoaded();
                    });
                    return;
                }

                if(stats) stats.begin();

                cap.read(vsrc);
                if (VW > sW || VH > sH)
                    cv.resize(vsrc, src, scale, 0, 0, RESIZE_METHOD) // resize at start
                else
                    vsrc.copyTo(src)
                if ($('#chkmirror')[0].checked) cv.flip(src, src, +1);
                
                apply_algos(src, dst);

                if ($('#timedelay').val() > 1 && $('#timedelay').val() <= 20)
                    frameDelayEffect(FDE, dst, $('#timedelay').val());

                if ($('#glitch').val() > 1 && $('#glitch').val() <= 100)
                    glitchEffect(GCH, dst, $('#glitch').val());
                
                if ($('#chkinvert')[0].checked) {
                    if (dst.channels() > 1)
                        cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY);
                    cv.bitwise_not(dst, dst);
                }

                // if (evalString) eval(evalString); // music synth
                if ($('#maestro')[0].checked) {
                    musicFrame(dst);
                }

                if (isVR) {
                    vrMode(dst);
                    cv.imshow("canvasOutput", dst);
                } else {
                    if (VW < sW || VH < sH)
                        cv.resize(dst, dst, scale, 0, 0, RESIZE_METHOD) // resize at end
                    cv.imshow("canvasOutput", dst);
                }
                
                captureFrame()

                let t1 = performance.now();
                recDelay = t1 - t0;
                if(stats) stats.end();
                t0 = t1;
                requestAnimationFrame(processVideo);
                if (urlParams.has('debug')) {
                    $('#lblfps').text('('+Math.floor(1000/recDelay) + ' FPS)')
                }

            } catch (err) {
                cleanup();
                $('#status').text('Error: ' + err);
                console.log(err);
            }
        }

        // schedule the first one.
        requestAnimationFrame(processVideo);

    } catch (err) {
        console.log(err);
        if (gifrec) gifw2_onerror(err);
        $("#uiform :input").prop("disabled", true);
        $('#status').text(err);
    }
}

function frameDelayEffect(FDE, dst, MAX_FDE) {
    let VH = dst.size().height;
    let VW = dst.size().width;
    let dchl = dst.channels();
    let ctype = (dchl == 1) ? cv.CV_8UC1 : cv.CV_8UC4;
    let cpy = new cv.Mat(VH, VW, ctype);
    
    dst.copyTo(cpy)
    FDE.push(cpy)
    while (FDE.length > MAX_FDE) {
        FDE.shift().delete();
    }

    let tsum = new cv.Mat(VH, VW, ctype);
    let t = new cv.Mat(VH, VW, ctype)
    dst.copyTo(tsum)
    for (var i = 0; i < FDE.length; i++) {
        if (FDE[i].channels() > dchl)
            cv.cvtColor(FDE[i], FDE[i], cv.COLOR_RGBA2GRAY);
        else if (FDE[i].channels() < dchl)
            cv.cvtColor(FDE[i], FDE[i], cv.COLOR_GRAY2RGBA);
        FDE[i].copyTo(t)
        cv.bitwise_or(t, tsum, tsum)
    }
    tsum.copyTo(dst)
    t.delete()
    tsum.delete()
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function glitchEffect(GCH, dst, MAX_F) {
    while (GCH.length > MAX_F) GCH.shift();
    if (GCH.length < MAX_F) {
        GCH.push(dst.clone());
    } else {
        if ($('#glitchrand')[0].checked)
            shuffleArray(GCH);
        let h = GCH.shift();
        h.copyTo(dst)
        h.delete();
    }
}




async function captureFrame() {
    if (!gifrec) return;
    try {
        if (gif_frame_delay_sum/1000 >= GIF_MAX_DUR_SEC) {
            console.log('GIF_MAX_DUR_SEC reached')
            stopRec();
            return;
        }
        gif_frame_cnt++;
        gif_frame_delay_sum += recDelay;

        let imdata = null;
        const canvas = $('#canvasOutput')[0];
        let w = canvas.width;
        let h = canvas.height;
        if (false) {// w > 600 || h > 600) {
            // resize is necessary
            const smallCanvas = document.createElement('canvas');
            const smallContext = smallCanvas.getContext("2d");
            let sf = 1;
            const r = Math.floor(w/h);
            if (w > 600) {
                w = 600;
                h = Math.floor(600 / r);
                sf = Math.floor(w / canvas.width);
            }
            if (h > 600) {
                h = 600;
                w = Math.floor(600 * r);
                sf = Math.floor(h / canvas.height);
            }
            smallCanvas.width = w
            smallCanvas.height = h;
            smallContext.scale(sf, sf);
            smallContext.drawImage(canvas, 0, 0);        
            imdata = smallContext.getImageData(0, 0, w, h);
        } else {
            imdata = canvas.getContext('2d').getImageData(0,0,w,h);
        }
        if (gifw2)
            gifw2.addFrame(imdata, {copy: true, delay: recDelay})

    } catch (e) {
        gifw2_onerror(e);
        throw e;
    }
}

function vrMode(dst) {
    let vw = dst.size().width;
    let vh = dst.size().height;
    
    let WW = $(window).width();
    let WH = $(window).height();

    let cw = WW/2;
    let ch = cw/vw*vh;
    let SL = new cv.Mat(ch, cw, cv.CV_8UC4);
    cv.resize(dst, SL, new cv.Size(cw, ch), 0, 0, RESIZE_METHOD);
    
    let matVec = new cv.MatVector();
    matVec.push_back(SL);
    matVec.push_back(SL);
    cv.hconcat(matVec, dst)
    matVec.delete()
    SL.delete()
}

function apply_algos(src, dst) {
    const qalgo = $("#algoselect").val();
    switch(qalgo) {
        case 'grayscale':
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            break;
        case 'canny':
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            cv.Canny(dst, dst, 75, 100)
            break;
        case 'canny-xl':
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            cv.Canny(dst, dst, 250, 500, 5, true)
            break;
        case 'adagauss':
            let blocksize = 50;
            if (blocksize % 2 === 0) blocksize = blocksize + 1;
            let mat = new cv.Mat(src.size().height, src.size().width, cv.CV_8U);
            cv.cvtColor(src, mat, cv.COLOR_RGBA2GRAY);
            cv.adaptiveThreshold(mat, dst, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, blocksize, 2);
            mat.delete();
            break;
        case 'contours':
            a_counters(src, dst);
            break;
        case 'contoursgray':
            a_counters(src, dst);
            cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY);
            break;
        case 'innerghost':
            a_sobel(src, dst, 3);
            break;
        case 'outerghost':
            a_laplacian(src, dst, 3);
            break;
        case 'golem':
            a_golem(src, dst);
            break;
        case 'splintercell':
            a_splintercell(src, dst, false);
            break;
        case 'splintercell2':
            a_splintercell(src, dst, true)
            break;
        case 'distancetransform':
            a_distTransform(src, dst);
            break;
        case 'test':
            try {
                if (evalString) eval(evalString);
            } catch (e) {
                console.log(''+e)
            }
            break;
        default:
            src.copyTo(dst);
    }
}

function a_counters(src, dst) {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    cv.threshold(dst, dst, 120, 200, cv.THRESH_BINARY);
    let contours  = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    
    let dstC3 = cv.Mat.ones(src.size().height, src.size().width, cv.CV_8UC3);
    for (let i = 0; i<contours.size(); ++i)
    {
        let color = new cv.Scalar(Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255));
        cv.drawContours(dstC3, contours, i, color, 1, cv.LINE_8, hierarchy);
    }
    dstC3.copyTo(dst);
    contours.delete();
    hierarchy.delete();
    dstC3.delete();
    cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA); // 3 channel to 4 channel output
}

function a_splintercell(src, dst, inv) {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    if (inv)
        cv.bitwise_not(dst, dst);
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
    let f = dst.clone()
    f.setTo(new cv.Scalar(0,210,0,255))
    cv.bitwise_and(dst, f, dst)
    f.delete()
}
function a_distTransform(src, dst) {
    let dmask = dst.clone()
    cv.cvtColor(src, dmask, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(dmask, dmask, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
    let opening = new cv.Mat();
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    cv.erode(dmask, dmask, M);
    cv.dilate(dmask, opening, M);
    cv.distanceTransform(opening, dmask, cv.DIST_L1, cv.CV_32F);
    cv.normalize(dmask, dmask, 1, 0, cv.NORM_INF);
    dmask.convertTo(dmask, cv.CV_8U, 255,0)
    dmask.copyTo(dst)
    M.delete()
    opening.delete()
    dmask.delete()
}
function a_sobel(src, dst, kernel) {
    var mat = new cv.Mat(src.size().height, src.size().width, cv.CV_8UC1);
    cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
    cv.Sobel(mat, dst, cv.CV_8U, 1, 0, kernel, 1, 0, cv.BORDER_DEFAULT);
    mat.delete();
}

function a_laplacian(src, dst, kernel) {
    var mat = new cv.Mat(src.size().height, src.size().width, cv.CV_8UC1);
    cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY);
    cv.Laplacian(mat, dst, cv.CV_8U, kernel, 1, 0, cv.BORDER_DEFAULT);
    mat.delete();
}

function a_golem(src, dst) {
    let kernelSize = 15;
    let kernel = cv.getStructuringElement(Number(cv.MORPH_RECT), {width: kernelSize, height: kernelSize});
    cv.morphologyEx(src, dst, cv.MORPH_DILATE, kernel, {x: -1, y: -1}, 1, cv.BORDER_CONSTANT);
    kernel.delete();
}




////////////// music synths


function musicFrame(dst) {

    if (muse.cnt++ == 60) {
        musicFrameImpl(dst)
        muse.cnt = 0;
    }

    if (urlParams.has('debug')) {
        if (muse.mat && muse.mat.channels() == dst.channels()) {
            cv.bitwise_or(dst, muse.mat, dst) 
            //muse.mat.copyTo(dst)
        }
    }
    // console.log((new Date()).getTime() - muse.ts)
    if (muse.pat && (new Date()).getTime() - muse.ts >= 0) {
        for (let part of muse.parts) {
            part.stop();
            part.dispose()
        }
        muse.parts = []
        // Tone.Transport.stop(); 
        // $('#status').text(muse.pat.arr)
        // console.log('============')
        let ts = []
        ts.push( museProcessor(synthA, muse.pat.arr[0], [ .25, .5 ]) )
        ts.push( museProcessor(synthB, muse.pat.arr[1], [ 1.5, 1.25]) )
        muse.ts = (new Date()).getTime() + Math.max(...ts) + 500;
        if (!muse.handle)
            muse.handle = Tone.Transport.start(); 
    }
}


// http://tonejs.github.io/Presets/
let synthA = makeSynthA();
let synthB = makeSynthB();
function makeSynthA() {
    let synth = new Tone.MonoSynth(
        {
            "volume" : 10,
            "oscillator": {
                "type": "sawtooth"
            },
            "filter": {
                "Q": 2,
                "type": "bandpass",
                "rolloff": -24
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.2,
                "release": 0.6
            },
            "filterEnvelope": {
                "attack": 0.02,
                "decay": 0.4,
                "sustain": 1,
                "release": 0.7,
                "releaseCurve" : "linear",
                "baseFrequency": 20,
                "octaves": 5
            }
        }
    );
    synth.toMaster();
    return synth
}
function makeSynthB() {
    let synth = new Tone.MonoSynth(
        {
            "oscillator": {
                "type": "fmsquare5",
                "modulationType" : "triangle",
                "modulationIndex" : 2,
                "harmonicity" : 0.501
            },
            "filter": {
                "Q": 1,
                "type": "lowpass",
                "rolloff": -24
            },
            "envelope": {
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.4,
                "release": 2
            },
            "filterEnvelope": {
                "attack": 0.01,
                "decay": 0.1,
                "sustain": 0.8,
                "release": 1.5,
                "baseFrequency": 50,
                "octaves": 4.4
            }
        }
  
    );
    synth.toMaster();
    return synth
}


function normalize(numbers) {
    var ratio = Math.max(...numbers) / 10;
    numbers = numbers.map(v => Math.round(v / ratio));
    return numbers
}


let muse = {ts:(new Date()).getTime(), mat:null, pat:null, cnt:0, parts:[]}

function musicFrameImpl(dst) {
    // console.log('----------')
    // console.log(dst.channels())

    muse.mat = dst.clone()
    muse.mat.setTo(new cv.Scalar(0,0,0, 255))
    frm = dst.clone()
    // cv.cvtColor(muse.mat, muse.mat, cv.COLOR_RGB2HSV);

    let ncols = 4; // # notes
    let nrows = 2; // # diff instruments
    let cols = Math.floor(frm.cols / ncols);
    let rows = Math.floor(frm.rows / nrows);

    muse.pat = {
        x: ncols,
        y: nrows,
        arr: []
    }

    
    for (let j = 0; j < nrows; j++) {
        let arr = []
        for (let i = 0; i < ncols; i++) {
            let rect = new cv.Rect(i*cols, j*rows, cols, rows);      
            
            let tmp = frm.roi(rect);
            let test = new cv.Mat()
            cv.reduce(tmp, test, 0, cv.REDUCE_AVG, tmp.type())
            let z = Math.floor( test.data.reduce((a,b)=>a+b,0)/test.data.length )
            test.delete()
            tmp.delete()

            arr.push(z)
            let v = z;
            let tmp2 = muse.mat.roi(rect);
            tmp2.setTo(new cv.Scalar(v,v,v, 255))
            tmp2.delete()
            // console.log(i*cols + '   ' + j*rows + ' : ' + z)
        }
        arr = normalize(arr)
        muse.pat.arr.push((arr))
    }
    frm.delete()
    // console.log(muse.pat.arr)
}



function museProcessor(synth, arr, durs) {
    // console.log(arr)
    const notes = ["C", "D", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
    const octaves = [ 2,3,4, ]; // 1 - 7

    let parr = [];
    let t = 0;
    let a,b,c,d;
    
    for (let i = 0; i < arr.length; i++) {
        a = arr[i] % notes.length
        
        b = arr[i] % octaves.length
        c = arr[i] % durs.length
        
        parr.push({
            time: t,
            note: notes[a] + octaves[b],
            dur: durs[c]
        })
        t += Tone.Time(durs[c]);
    }    


    let part = new Tone.Part(function(time, value){
        // console.log(value.note + ' ' + value.dur)
        synth.triggerAttackRelease(value.note, value.dur, time);
    }, parr);
    part.loop = true;
    part.start();
    muse.parts.push(part);
    
    let timeout = (t)*1000
    return timeout

    

}
