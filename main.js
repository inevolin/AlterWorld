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


let lastTimeout = null;

cv['onRuntimeInitialized']=()=>{
    window.scrollTo(0, 1);
    onCvLoaded();

    $(window).on("orientationchange", function(e) {
        clearInterval(lastTimeout);
        $(window).one('resize', function() {
            onCvLoaded()
        });
        
    });
}

$("#canvasOutput").dblclick(function() {
    const elem = $("#canvasOutput")[0];
    toggleFullscreen(elem);
});

function onCvLoaded() {
    let WW = $(window).width();
    let WH = $(window).height();
    if (window.orientation == 0) {
        let tmp = WH;
        WH = WW;
        WW = tmp;
    }

    const videoCfg = { facingMode: 'environment' }
    videoCfg['height'] = {ideal:WH/2}
    videoCfg['width'] = {ideal:WW/2}
    navigator.mediaDevices.getUserMedia({
        video: videoCfg,
        audio: false,
    })
    .then(processStream)
    .catch(function(err) {
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
            
            // cv.bitwise_and(src, src, dst) // do noting
            // f_rgb2gray(src, dst)
            f_edges(src, dst)
            
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

function f_rgb2gray(src, dst) {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
}
function f_edges(src, dst) {
    cv.Canny(src, dst, 50, 75)
}