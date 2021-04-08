// const webSocket = new WebSocket("ws://192.168.100.237:3000")
const webSocket = new WebSocket("ws://localhost:3000")


webSocket.onmessage = (event) => {
    console.log(event)
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "offer":
            peerConn.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        case "candidate":
            peerConn.addIceCandidate(data.candidate)
    }
}

function createAndSendAnswer () {
    peerConn.createAnswer((answer) => {
        peerConn.setLocalDescription(answer)
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

function sendData(data) {
    data.username = username
    webSocket.send(JSON.stringify(data))
}


let localStream
let peerConn
let username
let dataChannel
let StudentName

function joinCall() {

    username = document.getElementById("username-input").value

    document.getElementById("first-div")
    .style.display = "none"

    document.getElementById("video-call-div")
    .style.display = "inline"

    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }).then( function (stream) {
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
        dataChannel = peerConn.createDataChannel("datachannel");
        stream.getTracks().forEach((track) =>
        peerConn.addTrack(track, stream));
        peerConn.ontrack = ({streams: [stream]}) =>
             document.getElementById("remote-video").srcObject = stream;

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            
            sendData({
                type: "send_candidate",
                candidate: e.candidate
            })
        })

        sendData({
            type: "join_call"
        })

    }).catch (function (error)  {
        console.log(error)
    });
    setup();
}

var canvas = document.getElementById('canvas');
var video = document.getElementById('local-video');
var width = 320; // We will scale the photo width to this
var height = 0; 
var interval;

function setup(){

    video.addEventListener('canplay', function(ev) {
        
        if (localStream) {
            height = video.videoHeight / (video.videoWidth / width);

            if (isNaN(height)) {
                height = width / (4 / 3);
            }
        }
        interval = setInterval(TakePhoto, 40000);
        ev.preventDefault();
    }, false);

}

function TakePhoto() {
    var context = canvas.getContext('2d');
    
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        
        var data = canvas.toDataURL('image/png');
        SendPhoto(data)

       
    }
}

async function SendPhoto(data){

   const result= await fetch("http://localhost:5000/analyze", {
        method: "POST", 
        body: data,

    }).then(response => {
   
        return response.text();
    })
    .catch(error => {
       console.log("error")
    });

    StudentName =document.getElementById("Student-Name").value
    dataChannel.send(StudentName+" : "+result);
}

// let isAudio = true
let isVideo = true

function muteAudio() {
    let isAudio = true
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}