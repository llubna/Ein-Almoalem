from urllib import request as rq
from flask import Flask, request , render_template
# from flask_socketio import SocketIO
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

 # # 	Weights from Sharma et.al. (2019)
        # Neutral	0.9
        # Happy 	0.6
        # Surprised	0.6
        # Sad	    0.3

        # Anger	    0.25
        # Fearful	0.3
        # 0: 'Angry', 1: 'Fear', 2: 'Happy', 3: 'Sad', 4: 'Surprised', 5: 'Neutral'}



@app.route("/analyze", methods=["GET", "POST"])
def analyze():
    print("analyzing image..")
    # try:
    with rq.urlopen(request.data.decode("utf8")) as response:

        data=np.asarray(bytearray(response.read()),dtype="uint8")
        data = cv2.imdecode(data, cv2.IMREAD_COLOR)

        try:
            result = DeepFace.analyze(data, actions = ['emotion'])
            emotion = result['dominant_emotion']
            emotion_index=0
            if emotion == 'angry':
                emotion_index=  0.25
            elif emotion == 'disgust':
                 emotion_index=  0.3
            elif emotion ==  'fear':
                 emotion_index=  0.3
            elif emotion ==  'happy':
                 emotion_index=  0.6
            elif emotion ==  'sad':
                 emotion_index=  0.3
            elif emotion == 'surprised':
                 emotion_index=   0.6
            else :  
                 emotion_index=  0.9

            print(emotion)
            concentration_index = ( emotion_index * 2) / 4.5
                               
            if concentration_index > 0.65:
                return " highly engaged!"
            elif concentration_index > 0.25 and concentration_index <= 0.65:
                return " engaged."
            else:
                return " not engaged!"
        except ValueError as e:
            print(repr(e))
            emotion = "camera off /student is not on the frame"

   
    return emotion


if __name__ == "__main__":
    # socketio.run(app, debug=True)
    app.run(debug=True)