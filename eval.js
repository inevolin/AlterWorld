// https://github.com/opencv/opencv/blob/master/doc/js_tutorials/js_assets/js_image_arithmetics_bitwise.html
// 
try {


fgbgInit(50,8,1);

let h = src.size().height;
let w = src.size().width;



// even & uneven numbers
const S = 3;
if(S <= 1) throw 'S > 1'
if (FH.length > S) {
    console.log('.')
    FH = []
}

let e = new cv.Mat(h, w, cv.CV_8UC4);
src.copyTo(e)
cv.cvtColor(e, e, cv.COLOR_RGBA2GRAY);
FH.push(e)





let t = new cv.Mat(h, w, cv.CV_8UC4);
FH[0].copyTo(t)
for (var i = 0; i < FH.length; i++) {
    cv.bitwise_xor(FH[i], t, t)
}
t.copyTo(dst)
t.delete()

if (FH.length == S) {
    let tmp = FH.shift();
    tmp.delete();
}

// cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA) 

//a_counters(dst, dst);
// a_laplacian(dst, dst, 3)
//cv.Canny(dst, dst, 250, 500, 3, true)
//cv.cvtColor(dst, dst, cv.COLOR_RGB2RGBA) 
    
}
catch (err) {
    console.log(''+err)
}