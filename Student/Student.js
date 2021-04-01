const webSocket = new WebSocket("ws://localhost:3000")


webSocket.onmessage = (event) => {
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
let videoOption ={
    video: {
        frameRate: 24,
        width: {
            min: 480, ideal: 720, max: 1280
        },
        aspectRatio: 1.33333
    },
    audio: true
}

function joinCall() {

    username = document.getElementById("username-input").value

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
        dataChannel = peerConn.createDataChannel("datachannel");
        peerConn.addStream(localStream)

        peerConn.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

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

    }, (error) => {
        console.log(error)
    })
    // localStream.getTracks().forEach(track => peerConn.addTrack(track, localStream));
    setup();
}

var canvas = document.getElementById('canvas');
var video = document.getElementById('local-video');
var photo = document.getElementById('photo');
var width = 320; // We will scale the photo width to this
var height = 0; 
function setup(){
    

    video.addEventListener('canplay', function(ev) {
        
        if (localStream) {
            
            height = video.videoHeight / (video.videoWidth / width);

            if (isNaN(height)) {
                height = width / (4 / 3);
            }

          
        }
        var interval;
        interval = setInterval(takepicture, 60000);
        takepicture();
        ev.preventDefault();
    }, false);
    

    clearphoto();

}

function clearphoto() {
    
    var context = canvas.getContext('2d');
    context.fillRect(0, 0, canvas.width, canvas.height);

    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
}

function takepicture() {
    var context = canvas.getContext('2d');
    
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
        
        var data = canvas.toDataURL('image/png');
        SendPhoto(data)

       
    } else {
        clearphoto();
    }
}

async function SendPhoto(data){

   const result= await fetch("http://localhost:5000/analyze", {
        method: "POST", 
        body: data,

    }).then(response => {
        // let data =  response.text();
        return response.text();
    })
    .catch(error => {
       console.log("error")
    });

    // var dataChannel = peerConn.createDataChannel("datachannel");

    // dataChannel.open();
    // const dc = pc.createDataChannel("some label string");
    // wait for this to be open, e.g. by adding an event listener, then call send
    StudentName =document.getElementById("Student-Name").value
    dataChannel.send(StudentName+":"+result);
    // let obj = {
    //     "message": msg,
    //     "timestamp": new Date()
    //   }
    //   dc.send(JSON.stringify(obj));
    // // console.log(result)
    // webSocket.send(result)
    // sendData({
    //     type: "result",
    //     data: data
    // }, connection)
    // fetch("http://localhost:5500/TakeData", {
    //     method: "POST", 
    //     body: result,

    // });
     // module.exports = result; 
}

// export function sendResult() {
//     const result= fetch("http://localhost:5000/analyze", {
//         method: "POST", 
//         body: data,

//     }).then(response => {
//         // let data =  response.text();
//         return response.text();
//     })
//     .catch(error => {
//        console.log("error")
//     });
//     return result;
//   }

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