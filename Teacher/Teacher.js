

const webSocket = new WebSocket("ws://localhost:3000")
// const socket = new socket("ws://localhost:5000")
webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

let username
function sendUsername() {

    username = document.getElementById("username-input").value
    sendData({
        type: "store_user"
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream;
let peerConn
let dataChannel
function startCall() {

    document.getElementById("first-div")
    .style.display = "none"

    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }
       
        peerConn = new RTCPeerConnection(configuration)
        dataChannel = peerConn.createDataChannel("datachannel")
        peerConn.addEventListener('datachannel', e => {
            const channel = e.channel;
            channel.onmessage = event => {

              $.bootstrapGrowl( event.data, {
                type: 'info', // (null, 'info', 'error', 'success')
                offset: {from: 'top', amount: 250}, // 'top', or 'bottom'
                align: 'right', // ('left', 'right', or 'center')
                //width: 250, // (integer, or 'auto')
                delay: 20000,
                allow_dismiss: true,
                stackup_spacing: 10 // spacing between consecutively stacked growls.
              });
            
              console.log('received', event.data);}
            })
              
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {
        console.log(error)
    })


}

function createAndSendOffer() {

    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}

/////here start capture
const videoElem = document.getElementById("local-video");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");
// Options for getDisplayMedia()

var displayMediaOptions = {
    video: {
      cursor: "always"
    },
    audio: true
  };
  
  // Set event listeners for the start and stop buttons
  startElem.addEventListener("click", function(evt) {
    startCapture();
  }, false);
  
  stopElem.addEventListener("click", function(evt) {
    stopCapture();
  }, false);

//   function startCapture(){

    
//     navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(stream => {
//         // const screenTrack = stream.getTracks()[0];
//         muteVideo()
//         localStream=stream
//         peerConn.addStream(stream)
//         console.log("here4")
 
//         // peerConn.onaddstream = (e) => {
//         //     document.getElementById("remote-video")
//         //     .srcObject = e.stream
//         // }

//                 })

// }

// import express from 'express'
// const app = express()
// const port = 3000

// app.get('/TakeData', function(request, response) {
//     console.log('GET /')
//     var html = response.text()
   
// })
// fetch("http://localhost:5500/", {
//     method: "POST", 
//     body: result,

// });

// xhttp.open("POST", "demo_post2.asp", true);
// xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
// xhttp.send("fname=Henry&lname=Ford");

// import {hello} from 'module'; // or './module'
// let val = hello(); // val is "Hello";
// $.getScript('./receiver/receiver.js',  SendPhoto()
// {
//     val data= 
// });

// webSocket.addEventListener('message' , function(event) {
// console.log(event.data)

// }) 



let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}
