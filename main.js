
let stats = null;
function debugingStuff() {
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
    htmlLog()
}
function htmlLog() {
    var log = console.log;
    var logs = document.getElementById('log');
    console.log = function(){
        var args = Array.from(arguments);
        for (var i = 0; i < args.length; i++) {
            let line = args[i];
            if (typeof args[i] == 'object')
                line = JSON.stringify(args[i])
            logs.innerHTML += line + '<br />';
        }
        log.apply(console, args);
    }
}

// debugingStuff();

const is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('is_mobile: ' + is_mobile)
let lastTimeout = null;

const FPS = 30;
let recDelay = 1000/FPS;

let gifrec = false;
let gifw = null;
const GIF_MAX_DUR_SEC = 10; // s
let gif_frame_cnt = 0;

function gifw_init() {
    gifw = new Worker('gifworker.js');
    gifw.onmessage = gifw_onmessage;
    gifw.onerror = gifw_onerror;
}
const gifw_onmessage = function(e) {
    if ('gif' in e.data) {
        $("#recordcanvas").prop("disabled", false);
        $('#recordcanvas').val('start recording');
        const name = 'alterworld_'+$('#algoselect option:selected').text().replace(/[^a-zA-Z0-9]+/g, '')+'.gif';
        const data = URL.createObjectURL(new Blob([new Uint8Array(e.data.gif)], {type : "image/gif" } ));
        downloadFile(name, data);
    } else if ('abort' in e.data) {
        console.log('gif abort received')
        stopRec();
    }
};
const gifw_onerror = function(e) {
    console.log(e)
    if (gifw)
        gifw.terminate();
    gifw = null;
    stopRec();
    gifw_init();
    alert('gif recording failed');
    $("#recordcanvas").prop("disabled", false);
    $('#recordcanvas').val('start recording');
};

function startRec() {
    gifrec = true;
    gif_frame_cnt = 0;
    $('#recordcanvas').val('stop recording');
    if(gifw)
        gifw.postMessage({op: 'start', delay: 1000/recDelay});
}
function stopRec() {
    gifrec = false;
    $("#recordcanvas").prop("disabled", true);
    if (gifw) {
        console.log('recorded ' + gif_frame_cnt + ' frames at ' + (1000/recDelay) + 'fps')
        $('#recordcanvas').val('rendering ...');
        gifw.postMessage({op: 'stop'})
    }
}

$(document).on('ready', function() {
    console.log('document ready')
    gifw_init();
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
function uiElements() {
    $("#uiform :input").prop("disabled", true);
    if (!is_mobile) {
        $('#chkfacingmode').parent().hide();
        $("#chkfacingmode").prop('checked', false);
    }

    if (getL('algoselect'))
        $("#algoselect").val(localStorage.getItem('algoselect'))
    if (getL('quality'))
        $("#quality").val(localStorage.getItem('quality'))

    if (getL('chkfacingmode'))
        $("#chkfacingmode").prop('checked', localStorage.getItem('chkfacingmode')=='true')
    if (getL('chkmirror'))
        $("#chkmirror").prop('checked', localStorage.getItem('chkmirror')=='true')

    $("#canvasOutput").dblclick(function() {
        toggleFullscreen( $("#canvasOutput")[0] );
    });

    $("#algoselect").change(function () {
        localStorage.setItem('algoselect', $('#algoselect').val());
    })
    
    $('#chkfacingmode').on('click', function() {
        localStorage.setItem('chkfacingmode', $("#chkfacingmode")[0].checked);
        // location.reload();
        onCvLoaded();
    })

    $('#chkmirror').on('click', function() {
        localStorage.setItem('chkmirror', $('#chkmirror')[0].checked);
    })

    $("#quality").change(function () {
        localStorage.setItem('quality', $('#quality').val());
        // location.reload();
        onCvLoaded();
    })
    
    $('#dlcanvas').on('click', function() {
        const name = 'alterworld_'+$('#algoselect option:selected').text().replace(/[^a-zA-Z0-9]+/g, '')+'.png';
        const data = document.getElementById('canvasOutput').toDataURL();
        downloadFile(name, data);
    })

    $('#recordcanvas').on('click', function() {
        if (!gifrec) startRec();
        else stopRec();
    })
}

function downloadFile(name, data) {
    var link = document.createElement('img');
    link.src = data;
    $(link).css({
        'border': '2px solid green',
    });
    $('#dlspace').html(link);
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#dlspace").offset().top
    }, 500);
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

function onCvLoaded() {
    prevori = window.orientation; // important
    if(lastTimeout != null) clearTimeout(lastTimeout);
    abortStream();

    let WW = $(window).width();
    let WH = $(window).height();
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
    videoCfg['height'] = WH*qualityRatio
    videoCfg['width'] = WW*qualityRatio
    console.log('qualityRatio: '+  qualityRatio)
    navigator.mediaDevices.getUserMedia({
        video: videoCfg,
        audio: false,
    })
    .then(processStream)
    .catch(function(err) {
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

let src = null;
let dst = null;
let stream = null;
let prevori = window.orientation;
function abortStream() {
    if (stream == null) return;
    stream.getTracks().forEach(function(track) {
        track.stop();
    });
}
function processStream(_stream) {
    try {
        $("#uiform :input").prop("disabled", false);
        $('#status').text('');
    
        
        stream = _stream;

        let WW = $(window).width();
        let WH = $(window).height();

        console.log('orientation: ' + window.orientation)
        console.log('W: ' +WW +', ' + WH)
        
        const settings = stream.getTracks()[0].getSettings();
        let VW = settings.width;
        let VH = settings.height;

        if (window.orientation === 0 && VW > VH) { // ici
            console.log('res swap')
            VW = settings.height;
            VH = settings.width;
        }
        if (window.orientation === 90 && VH > VW) { // ici
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

        src = new cv.Mat(VH, VW, cv.CV_8UC4);
        dst = new cv.Mat(VH, VW, cv.CV_8UC4);
        let cap = new cv.VideoCapture(video);

        let scale;
        if (window.orientation === 0 || window.orientation === undefined)
            scale = new cv.Size(WH*VW/VH, WH)
        else
            scale = new cv.Size(WW, WW/VW*VH)

        function processVideo() {
            try {
                if (prevori != window.orientation) {
                    console.log('reloading')
                    $(window).one('resize', function () {
                        onCvLoaded();
                    });
                    return;
                }

                ///////////////////////////////
                if(stats) stats.begin();
                let t0 = performance.now();

                cap.read(src);

                if ($('#chkmirror')[0].checked)
                    cv.flip(src, src, +1)

                apply_algos(src, dst)
                
                cv.resize(dst, dst, scale, 0, 0, cv.INTER_AREA);
                cv.imshow("canvasOutput", dst);

                let t1 = performance.now();
                if(stats) stats.end();
                recDelay = t1 - t0;
                ///////////////////////////////

                captureFrame()

                let delay = 1000 / FPS - recDelay;
                if (delay < 0) delay = 0;

                lastTimeout = setTimeout(processVideo, delay);
            } catch (err) {
                $('#status').text('Error: ' + err);
                console.log(err);
            }
        }

        // schedule the first one.
        lastTimeout = setTimeout(processVideo, 0);


    } catch (err) {
        console.log(err);
        if (gifrec)
            gifw_onerror();
        $("#uiform :input").prop("disabled", true);
        $('#status').text(err);
    }
}

async function captureFrame() {
    if (!gifrec) return;
    try {
        if (gif_frame_cnt/FPS >= GIF_MAX_DUR_SEC) {
            console.log('GIF_MAX_DUR_SEC reached: ' + gif_frame_cnt + ' frames at ' + FPS + 'fps')
            stopRec();
        }
        gif_frame_cnt++;

        let imdata = null;
        const canvas = $('#canvasOutput')[0];
        let w = canvas.width;
        let h = canvas.height;
        if (w > 600 || h > 600) {
            // resize is necessary
            const smallCanvas = document.createElement('canvas');
            const smallContext = smallCanvas.getContext("2d");
            let sf = 1;
            const r = (w/h);
            if (w > 600) {
                w = 600;
                h = Math.ceil(600 / r);
                sf = w / canvas.width;
            }
            if (h > 600) {
                h = 600;
                w = Math.ceil(600 * r);
                sf = h / canvas.height
            }
            smallCanvas.width = w
            smallCanvas.height = h;
            smallContext.scale(sf, sf);
            smallContext.drawImage(canvas, 0, 0);        
            imdata = smallContext.getImageData(0, 0, w, h).data;
        } else {
            imdata = canvas.getContext('2d').getImageData(0,0,w,h).data;
        }
        gifw.postMessage({
            op:'frame',
            height: h,
            width: w,
            data: imdata
        });
    } catch (e) {
        console.log(e)
    }
}

function apply_algos(src, dst) {
    const qalgo = $("#algoselect").val();
    switch(qalgo) {
        case 'grayscale':
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            break;
        case 'canny':
            cv.Canny(src, dst, 75, 100)
            break;
        case 'canny-xl':
            cv.Canny(src, dst, 50, 75)
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
        case 'uchakra':
            a_laplacian(src, dst, 19);
            break;
        case 'lchakra':
            a_sobel(src, dst, 19);
            break;
        case 'golem':
            a_golem(src, dst);
            break;
        default:
            cv.bitwise_and(src, src, dst)
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
    cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA) // output should contain 4 channels
}

function a_sobel(src, dst, kernel) {
    var mat = new cv.Mat(src.size().height, src.size().width, cv.CV_8UC1);
    cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
    cv.Sobel(mat, dst, cv.CV_8U, 1, 0, kernel, 1, 0, cv.BORDER_DEFAULT);
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA) // output sould contain 4 channels
    mat.delete();
}

function a_laplacian(src, dst, kernel) {
    var mat = new cv.Mat(src.size().height, src.size().width, cv.CV_8UC1);
    cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY);
    cv.Laplacian(mat, dst, cv.CV_8U, kernel, 1, 0, cv.BORDER_DEFAULT);
    cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA) // output sould contain 4 channels
    mat.delete();
}

function a_golem(src, dst) {
    let kernelSize = 15;
    let kernel = cv.getStructuringElement(Number(cv.MORPH_RECT), {width: kernelSize, height: kernelSize});
    cv.morphologyEx(src, dst, cv.MORPH_DILATE, kernel, {x: -1, y: -1}, 1, cv.BORDER_CONSTANT);
    kernel.delete();
}