htmlLog()
function htmlLog() {
    var old = console.log;
    var logger = document.getElementById('log');
    console.log = function (message) {
        if (typeof message == 'object') {
            logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
        } else {
            logger.innerHTML += message + '<br />';
        }
    }
}

const is_mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
console.log('is_mobile: ' + is_mobile)
let lastTimeout = null;



$(document).on('ready', function() {
    console.log('doc ready')
    uiElements();

    cv['onRuntimeInitialized']=()=>{
        window.scrollTo(0, 1);
        onCvLoaded();
        $('#loader').hide();
        /*
        $(window).on("orientationchange", function(e) {
            clearInterval(lastTimeout);
            $(window).one('resize', function() {
                onCvLoaded()
            });
            
        });
        */
    }
})

function getL(id) {
    const t = localStorage.getItem(id);
    console.log('LS: ' + id+': ' + t)
    return t !== undefined && t !== null;
}
function uiElements() {

    if (!is_mobile) {
        $('#chkfacingmode').parent().hide();
        $("#chkfacingmode").prop('checked', false);
    }

    if (getL('algoselect'))
        $("#algoselect").val(localStorage.getItem('algoselect'))
    if (getL('chkfacingmode'))  {
        $("#chkfacingmode").prop('checked', localStorage.getItem('chkfacingmode')=='true')
    }
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
        location.reload();
    })

    $('#chkmirror').on('click', function() {
        localStorage.setItem('chkmirror', $('#chkmirror')[0].checked);
    })
}

function onCvLoaded() {
    let WW = $(window).width();
    let WH = $(window).height();
    if (window.orientation == 0) {
        let tmp = WH;
        WH = WW;
        WW = tmp;
    }

    const videoCfg = {}
    videoCfg['facingMode'] = $('#chkfacingmode')[0].checked ? 'user' : 'environment';
    console.log('facingMode: ' + videoCfg['facingMode'])
    videoCfg['height'] = {ideal:WH/2}
    videoCfg['width'] = {ideal:WW/2}
    navigator.mediaDevices.getUserMedia({
        video: videoCfg,
        audio: false,
    })
    .then(processStream)
    .catch(function(err) {
        console.log('error: '+err);
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

function processStream(stream) {

    let WW = $(window).width();
    let WH = $(window).height();

    console.log('orientation: ' + window.orientation)
    console.log('W: ' +WW +', ' + WH)
    
    const settings = stream.getTracks()[0].getSettings();
    let VW = settings.width;
    let VH = settings.height;

    if (window.orientation == 0) {
        VW = settings.height;
        VH = settings.width;
    }

    console.log('V: '+VW + ', ' + VH)
    
    const video = document.getElementById("videoInput"); 
    video.width  = VW;
    video.height = VH;
    video.srcObject = stream;
    video.play();
    processStream_pt2(WW, WH, VW, VH, video)
}
function processStream_pt2(WW, WH, VW, VH, video) {
    let src = new cv.Mat(VH, VW, cv.CV_8UC4);
    let dst = new cv.Mat(VH, VW, cv.CV_8UC1);
    let cap = new cv.VideoCapture(video);

    let scale;
    if (window.orientation === 0 || window.orientation === undefined)
        scale = new cv.Size(WH*VW/VH, WH)
    else
        scale = new cv.Size(WW, WW/VW*VH)

    const FPS = 30;
    function processVideo() {
        try {
            let begin = Date.now();
            cap.read(src);
            if ($('#chkmirror')[0].checked)
                cv.flip(src, src, +1)
            apply_algos(src, dst)
            
            cv.resize(dst, dst, scale, 0, 0, cv.INTER_AREA);
            //dst = dst.roi(rect);
            cv.imshow("canvasOutput", dst);
            let delay = 1000 / FPS - (Date.now() - begin);
            if (delay < 0) delay = 0;

            lastTimeout = setTimeout(processVideo, delay);
        } catch (err) {
            console.log(err);
            console.error(err);
        }
    }

    // schedule the first one.
    lastTimeout = setTimeout(processVideo, 0);
}

function apply_algos(src, dst) {
    const qalgo = $("#algoselect").val();
    switch(qalgo) {
        case 'grayscale':
            cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
            break;
        case 'canny':
            cv.Canny(src, dst, 50, 75)
            break;
        case 'canny-xl':
            cv.Canny(src, dst, 5, 15)
            break;
        default:
            cv.bitwise_and(src, src, dst)
    }
}