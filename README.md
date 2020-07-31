# AlterWorld

AlterWorld is an open source real-time video processing project based on OpenCV for JavaScript (front-end). It has several interesting features such as different image filters and effects, VR capabilities and audio/music generation.

## Usage
Live demo: https://nevolin.be/alterworld/

#### Filters and effects
There are a ton of built-in filters and effects available. Use the dropdown box to select a desired filter. If you get a lot of lag/glitches and performance issues you should lower the quality using the dropdown button (to low or medium q). The Time Delay and Glitch effects can be used to create dizzy, funny or scary effects, these are messing around with the frames.

YouTube video:

[![https://www.youtube.com/watch?v=1868xd5DWUg](http://i3.ytimg.com/vi/1868xd5DWUg/hqdefault.jpg)](https://www.youtube.com/watch?v=1868xd5DWUg)

#### Augmented Reality (AR) / Virtual Reality(VR)
You can use a budget VR headset (such as Google Cardboard VR) with your smartpone. Navigate to AlterWorld, select the desired filters and effects, rotate your phone horizontally. Finally to enter VR mode click the "VR mode" checkbox. It's also recommended to go into full-screen mode by double tap/click the output image.

YouTube video:

[![https://www.youtube.com/watch?v=dB4ssSH6_2s](http://i3.ytimg.com/vi/dB4ssSH6_2s/hqdefault.jpg)](https://www.youtube.com/watch?v=dB4ssSH6_2s)

#### GIF recording
Use the "screenshot" button to make a screenshot of the current output frame.
You can use the "start recording" button to record a gif of the output frames (default max duration: 15 seconds). Note that the gif needs to be rendered which may take several seconds up to several minutes (depending on quality and duration). The output screenshot(s) and gif(s) will be shown at the bottom of te page, you can save them from there (they are only visually scaled).

YouTube video:

[![https://www.youtube.com/watch?v=Rkg-XiY3o38](http://i3.ytimg.com/vi/Rkg-XiY3o38/hqdefault.jpg)](https://www.youtube.com/watch?v=Rkg-XiY3o38)

#### music generation
There is a special feature "maestro" which is the button at the very bottom. The basic idea is to brainstorm musical beats from images, which conceptually could be useful to musicians. This uses a certain algorithm to generate basic electronic beats based on the pixel values on the image. You can tweak the algorithm or implement your own. 

YouTube video:

[![https://www.youtube.com/watch?v=ojsyrKspkIc](http://i3.ytimg.com/vi/ojsyrKspkIc/hqdefault.jpg)](https://www.youtube.com/watch?v=ojsyrKspkIc)

## Video production
The capabilities provided by OpenCV can be used for creating custom and unique scenes for films, music videos and art:

YouTube video:

[![https://www.youtube.com/watch?v=pEJJ3V9Xj20](http://i3.ytimg.com/vi/pEJJ3V9Xj20/hqdefault.jpg)](https://www.youtube.com/watch?v=pEJJ3V9Xj20)

YouTube video:

[![https://www.youtube.com/watch?v=_tJR69mexgc](http://i3.ytimg.com/vi/_tJR69mexgc/hqdefault.jpg)](https://www.youtube.com/watch?v=_tJR69mexgc)

YouTube video:

[![https://www.youtube.com/watch?v=nTPr-cHSumU](http://i3.ytimg.com/vi/nTPr-cHSumU/hqdefault.jpg)](https://www.youtube.com/watch?v=nTPr-cHSumU)

YouTube video:

[![https://www.youtube.com/watch?v=T5qy3fP7LZk](http://i3.ytimg.com/vi/T5qy3fP7LZk/hqdefault.jpg)](https://www.youtube.com/watch?v=T5qy3fP7LZk)

YouTube video:

[![https://www.youtube.com/watch?v=9hYuiqnYNEQ](http://i3.ytimg.com/vi/9hYuiqnYNEQ/hqdefault.jpg)](https://www.youtube.com/watch?v=9hYuiqnYNEQ)

YouTube video:

[![https://www.youtube.com/watch?v=PwOEMtuf5Q8](http://i3.ytimg.com/vi/PwOEMtuf5Q8/hqdefault.jpg)](https://www.youtube.com/watch?v=PwOEMtuf5Q8)

YouTube video:

[![https://www.youtube.com/watch?v=3pNXoRaPlPg](http://i3.ytimg.com/vi/3pNXoRaPlPg/hqdefault.jpg)](https://www.youtube.com/watch?v=3pNXoRaPlPg)

The shots from these videos have been rendered using OpenCV in Python and then edited in Adobe Premiere Pro.

## Installation

1. Download or Clone this repository.
2. Open `index.html` in your web browser or upload the project to your web server (https/ssl is required to enable webcam access).
