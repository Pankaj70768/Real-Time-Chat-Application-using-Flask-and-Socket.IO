print("APP STARTED")

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretkey'

socketio = SocketIO(app)

online_users = 0


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/chat')
def chat():
    username = request.args.get("username")
    return render_template(
        'chat.html',
        username=username
    )


@socketio.on('join')
def handle_join(data):
    global online_users

    online_users += 1

    emit(
        'user_joined',
        {
            'username': data['username'],
            'online_users': online_users
        },
        broadcast=True
    )


@socketio.on('send_message')
def handle_message(data):

    current_time = datetime.now().strftime("%I:%M %p")

    emit(
        'receive_message',
        {
            'username': data['username'],
            'message': data['message'],
            'time': current_time
        },
        broadcast=True
    )


@socketio.on('send_voice')
def handle_voice(data):

    emit(
        'receive_voice',
        {
            'username': data['username'],
            'audio': data['audio']
        },
        broadcast=True
    )


@socketio.on('send_image')
def handle_image(data):

    print("IMAGE RECEIVED")

    emit(
        'receive_image',
        {
            'username': data['username'],
            'image': data['image']
        },
        broadcast=True
    )
@socketio.on('send_file')
def handle_file(data):

    print("FILE RECEIVED")

    emit(
        'receive_file',
        {
            'username': data['username'],
            'filename': data['filename'],
            'file': data['file']
        },
        broadcast=True
    )

    emit(
        'receive_file',
        {
            'username': data['username'],
            'filename': data['filename'],
            'file': data['file']
        },
        broadcast=True
    )


@socketio.on('typing')
def handle_typing(data):

    print("TYPING EVENT:", data)

    emit(
        'user_typing',
        {
            'username': data['username']
        },
        broadcast=True,
        include_self=False
    )


@socketio.on('disconnect')
def disconnect_user():
    global online_users

    if online_users > 0:
        online_users -= 1

    emit(
        'online_users',
        {
            'count': online_users
        },
        broadcast=True
    )


if __name__ == '__main__':
    socketio.run(
        app,
        debug=True,
        port=5001
    )