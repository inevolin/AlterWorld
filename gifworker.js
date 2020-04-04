
self.importScripts('LZWEncoder.js','NeuQuant.js','GIFEncoder.js');
// https://github.com/antimatter15/jsgif
let gif = null;

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
    switch(data.op) {
        case 'start':
            console.log('gifworker: start')
            gif = new GIFEncoder();
            gif.setRepeat(0);
            gif.setDelay(data.delay);
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
            if (stopped) return;

            console.log('gifworker: frame')
            if(gif === null) return;
            gif.setSize(data.width, data.height)
            if(!gif.addFrame(data.data, true))
                throw 'Error on gif_frame';
            gif.setDelay(data.delay);
            break;
    }

}

