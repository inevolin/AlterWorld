# AlterWorld

AlterWorld is an open source real-time video processing project based on OpenCV for JavaScript (front-end). It has several interesting features such as different image filters and effects, VR capabilities and audio/music generation.

## Demo
URL: https://nevolin.be/alterworld/

#### Filters and effects
There are a ton of built-in filters and effects available. Use the dropdown box to select a desired filter. If you get a lot of lag/glitches and performance issues you should lower the quality using the dropdown button (to low or medium q).

The Time Delay and Glitch effects can be used to create dizzy, funny or scary effects, these are messing around with the frames.

#### Augmented Reality (AR) / Virtual Reality(VR)
You can use a budget VR headset (such as Google Cardboard VR) with your smartpone. Navigate to AlterWorld, select the desired filters and effects, rotate your phone horizontally. Finally to enter VR mode click the "VR mode" checkbox. It's also recommended to go into full-screen mode by double tap/click the output image.
https://www.youtube.com/watch?v=dB4ssSH6_2s

#### GIF recording
Use the "screenshot" button to make a screenshot of the current output frame.
You can use the "start recording" button to record a gif of the output frames (default max duration: 15 seconds). Note that the gif needs to be rendered which may take several seconds up to several minutes (depending on quality and duration).

The output screenshot(s) and gif(s) will be shown at the bottom of te page, you can save them from there (they are only visually scaled).

#### music generation
There is a special feature "maestro" which is the button at the very bottom. The basic idea is to brainstorm musical beats from images, which conceptually could be useful to musicians. This uses a certain algorithm to generate basic electronic beats based on the pixel values on the image. You can tweak the algorithm or implement your own. 

## Installation

1. Download or Clone this repository.
2. Open `index.html` in your web browser or upload the project to your web server (https/ssl is required to enable webcam access).
