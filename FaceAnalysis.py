from urllib import request as rq
from flask import Flask, request , render_template
from flask_socketio import SocketIO
from flask_cors import CORS
import base64
# import socketio 
# here for detecte emotion 
from deepface import DeepFace
from cv2 import cv2
import matplotlib.pyplot as plt 
# import the necessary packages
import numpy as np



app = Flask(__name__)
CORS(app)

# app.config['SECRET_KEY'] = 'some secret thing'
# #socketio = SocketIO(app,cors_allowed_origins="*")
# socketio = SocketIO(app)


# @app.route("/", methods=["GET", "POST"])
# def hello_world():
#     return render_template("./sender.html")
    
# @socketio.on('message')
# def handle_message(data):
#     print('received message: ' + data)

# @socketio.on('connect')
# def test_connect():
#     socketio.emit('my response', {'data': 'Connected'})

# @socketio.on('disconnect')
# def test_disconnect():
#     print('Client disconnected')

@app.route("/analyze", methods=["GET", "POST"])
def analyze():
    print("analyzing image..")
    # try:
    with rq.urlopen(request.data.decode("utf8")) as response:
        # data = response.read()
        # print(data)
        data=np.asarray(bytearray(response.read()),dtype="uint8")
        data = cv2.imdecode(data, cv2.IMREAD_COLOR)
        # print(img1)
        # filename = "random_name.jpg"
    
        # plt.imshow(data [:, :, :: -1] )
        try:
            result = DeepFace.analyze(data, actions = ['emotion'])
            emotion = result['dominant_emotion']
        except ValueError as e:
            print(repr(e))
            emotion = "camera off /student is not on the frame"
        # if data=="":
        # print("the camra is off")
        #print(result['dominant_emotion'])
        # with open(filename, "wb") as f:
        #  f.write(data)
    # except:
    #     print('camera is off ')
    # socketio.header("Access-Control-Allow-Origin", "*")
    # print( "Content-Type: text/turtle")
    # print( "Content-Location: mydata.ttl")
    # print( "Access-Control-Allow-Origin: *")
    print(emotion)
    # socketio.emit('my response', {'data': emotion})

    return emotion



if __name__ == "__main__":
    # socketio.run(app, debug=True)
    app.run(debug=True)