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


@app.route("/analyze", methods=["GET", "POST"])
def analyze():
    print("analyzing image..")
    
    with rq.urlopen(request.data.decode("utf8")) as response:

        data=np.asarray(bytearray(response.read()),dtype="uint8")
        data = cv2.imdecode(data, cv2.IMREAD_COLOR)

        try:
            result = DeepFace.analyze(data, actions = ['emotion'])
            emotions = result['emotion']
            emotion = result['dominant_emotion']
            emotion_probability= emotions[emotion]/100
            print( emotion_probability)
            emotion_index=0
            if emotion == 'angry':
                emotion_index=  0.25
            elif emotion == 'disgust':
                 emotion_index=  0.2
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
            concentration_index =  (emotion_probability* emotion_index)*100
            print(concentration_index)                   
            if concentration_index >= 50:
                 emotion= " engaged."
            else:
                emotion =" not engaged!"

        except ValueError as e:
            print(repr(e))
            emotion = "camera off /student is not on the frame"

   
    return emotion


if __name__ == "__main__":
    # socketio.run(app, debug=True)
    app.run(debug=True)