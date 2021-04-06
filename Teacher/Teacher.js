

const webSocket = new WebSocket("ws://localhost:3000")
// const socket = new socket("ws://localhost:5000")
webSocket.onmessage = (event) => {
    //console.log(event)
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

    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }).then(function(stream) {
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
                type: 'info', 
                offset: {from: 'top', amount: 250}, 
                align: 'right', 
                
                delay: 20000,
                allow_dismiss: true,
                stackup_spacing: 10 
              });
            
              console.log('received', event.data);}
            })
              
        stream.getTracks().forEach((track) =>
         peerConn.addTrack(track, stream));
     
        peerConn.ontrack = ({streams: [stream]}) =>
         document.getElementById("remote-video").srcObject = stream;

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }).catch (function(err){
        console.log(err)
    });


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
//   startElem.addEventListener("click", function(evt) {
//     startCapture();
//   }, false);
  
//   stopElem.addEventListener("click", function(evt) {
//     stopCapture();
//   }, false);

  function startCapture(){

    
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then(function(stream) {


       let videoTrack = stream.getVideoTracks()[0];
       videoTrack.onended= function(){
           stopShareScreen()
       }
       let sender =peerConn.getSenders().find(function(s) {
           return s.track.kind==videoTrack.kind
       })
        sender.replaceTrack(videoTrack)
    }).catch (function(err){
        console.log(err)
    });
    }
function stopShareScreen(){

    let videoTrack = localStream.getVideoTracks()[0];
    var sender =peerConn.getSenders().find(function(s) {
        return s.track.kind==videoTrack.kind
    })
     sender.replaceTrack(videoTrack)
}



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
function EndSession() {
    peerConn.close()
    peerConn = null
    localStream.getAudioTracks()[0].enabled = isAudio
    localStream.getVideoTracks()[0].enabled = isVideo
    console.log("session ended successfully")
}
