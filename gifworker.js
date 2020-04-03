
self.importScripts('LZWEncoder.js','NeuQuant.js','GIFEncoder.js');

let gif = null;

const MAX_DUR_SEC = 2; // s
const DELAY = 30; // ms
let cnt_frames = 0;
let abort_req = false;
let stopped = false; // ensure only one stop request is processed

console.log('gifworker loaded')

onmessage = function(m) {
    try {
        mproc(m)
    } catch (e) {
        gif = null;
        throw e;
    }
}
function mproc(m) {
    let data = m.data;
    let ok = false;
    switch(data.op) {
        case 'start':
            console.log('gifworker: start')
            gif = new GIFEncoder();
            gif.setRepeat(0);
            gif.setDelay(DELAY);
            cnt_frames = 0;
            abort_req = false;
            stopped = false;
            if (!gif.start()) 
                throw 'Error on gif_start';
            break;
        case 'stop':
            if (stopped) return;
            stopped = true;
            console.log('gifworker: stop')
            if(gif === null) return;
            if (!gif.finish())
                throw 'Error on gif_stop';
            postMessage({gif:gif.stream().bin});
            break;
        case 'frame':
            if (abort_req) return;
            console.log('gifworker: frame')
            if(gif === null) return;
            gif.setSize(data.width, data.height)
            if(!gif.addFrame(data.data, true))
                throw 'Error on gif_frame';
            cnt_frames++;
            if (cnt_frames * DELAY / 1000 >= MAX_DUR_SEC) {
                abort_req = true;
                console.log('gifworker: abort requested')
                postMessage({abort:true});
            }
            break;
    }

}

