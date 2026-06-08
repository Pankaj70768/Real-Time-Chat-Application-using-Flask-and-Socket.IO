const socket = io();

const notificationSound =
document.getElementById(
"notificationSound"
);

let typingTimeout;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

socket.emit("join", {
    username: username
});

function sendMessage() {

    let message =
    document.getElementById("message").value;

    if (message.trim() === "") {
        return;
    }

    socket.emit("send_message", {
        username: username,
        message: message
    });

    document.getElementById("message").value = "";

    let typingDiv =
    document.getElementById("typingIndicator");

    if (typingDiv) {
        typingDiv.innerText = "";
    }
}

socket.on("receive_message", function(data) {

    let messages =
    document.getElementById("messages");

    let messageClass =
    data.username === username
    ? "my-message"
    : "other-message";

    messages.innerHTML += `
        <div class="${messageClass}">
            <div style="display:flex;justify-content:space-between;">
    <strong>${data.username}</strong>
    <small>${data.time}</small>
</div>
            <br>
            ${data.message}
        </div>
    `;

    messages.scrollTop =
    messages.scrollHeight;

    if(data.username !== username){

    notificationSound.play();

}
});

socket.on("user_joined", function(data) {

    let messages =
    document.getElementById("messages");

    messages.innerHTML += `
        <div class="system-message">
            ${data.username} joined the chat
        </div>
    `;

    document.getElementById("onlineUsers").innerText =
    "Online : " + data.online_users;
});

socket.on("online_users", function(data) {

    document.getElementById("onlineUsers").innerText =
    "Online : " + data.count;
});

document.getElementById("message")
.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

document.getElementById("message")
.addEventListener("input", function() {

    socket.emit(
        "typing",
        {
            username: username
        }
    );

});

const recordBtn =
document.getElementById("recordBtn");

recordBtn.addEventListener(
"click",
async function() {

    try {

        if (!isRecording) {

            const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            mediaRecorder =
            new MediaRecorder(stream);

            audioChunks = [];

            mediaRecorder.ondataavailable =
            function(event) {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop =
            function() {

                const audioBlob =
                new Blob(audioChunks, {
                    type: 'audio/webm'
                });

                const reader =
                new FileReader();

                reader.onloadend =
                function() {

                    socket.emit(
                    "send_voice",
                    {
                        username: username,
                        audio: reader.result
                    });

                };

                reader.readAsDataURL(
                audioBlob
                );
            };

            mediaRecorder.start();

            isRecording = true;

            recordBtn.classList.add("recording");
            recordBtn.innerHTML = "⏹";

        }
        else {

            mediaRecorder.stop();

            isRecording = false;

            recordBtn.classList.remove("recording");
            recordBtn.innerHTML = "🎙️";
        }

    }
    catch(error) {

        alert(
        "Microphone permission denied!"
        );

        console.error(error);
    }

});

socket.on(
"receive_voice",
function(data) {

    let messages =
    document.getElementById(
    "messages"
    );

    messages.innerHTML += `
        <div class="message">
            <strong>
                ${data.username}
            </strong>
            <br>

            <audio controls>
                <source
                src="${data.audio}"
                type="audio/webm">
            </audio>
        </div>
    `;

    messages.scrollTop =
    messages.scrollHeight;
});

socket.on(
"user_typing",
function(data) {

    let typingDiv =
    document.getElementById(
    "typingIndicator"
    );

    if (!typingDiv) {
        return;
    }

    typingDiv.innerText =
    data.username + " is typing...";

    clearTimeout(
    typingTimeout
    );

    typingTimeout =
    setTimeout(
    function() {

        typingDiv.innerText = "";

    },
    1500
    );

});

const emojiBtn =
document.getElementById("emojiBtn");

const emojiPicker =
document.getElementById("emojiPicker");

console.log("Emoji Loaded");

emojiBtn.addEventListener(
"click",
function(){

    console.log("Emoji Clicked");

    if(
        emojiPicker.style.display === "none"
    ){
        emojiPicker.style.display = "block";
    }
    else{
        emojiPicker.style.display = "none";
    }

});

emojiPicker.addEventListener(
"emoji-click",
event => {

    document.getElementById(
    "message"
    ).value +=
    event.detail.unicode;

});

const imageBtn =
document.getElementById("imageBtn");

const imageInput =
document.getElementById("imageInput");

imageBtn.addEventListener(
"click",
function(){

    imageInput.click();

});

imageInput.addEventListener(
"change",
function(){

    console.log("Image Selected");

    const file =
    imageInput.files[0];

    if(!file){
        return;
    }

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        socket.emit(
        "send_image",
        {
            username: username,
            image: e.target.result
        });

    };

    reader.readAsDataURL(
    file
    );

});

socket.on(
"receive_image",
function(data){

    let messages =
    document.getElementById(
    "messages"
    );

    messages.innerHTML += `
        <div class="message">
            <strong>
                ${data.username}
            </strong>
            <br>

            <img
            src="${data.image}"
            style="
            max-width:250px;
            border-radius:10px;
            margin-top:5px;
            ">
        </div>
    `;

    messages.scrollTop =
    messages.scrollHeight;

    if(data.username !== username){

    notificationSound.play();

}
});

let userList =
document.getElementById("userList");

if(userList){

    userList.innerHTML = `
        <div class="user-online">
            🟢 ${username}
        </div>

        <div class="user-online">
            🟢 Test
        </div>

        <div class="user-offline">
            🔴 Rahul
        </div>
    `;
}

const fileBtn =
document.getElementById("fileBtn");

const fileInput =
document.getElementById("fileInput");

fileBtn.addEventListener(
"click",
function(){

    fileInput.click();

});

fileInput.addEventListener(
"change",
function(){

    console.log("FILE SELECTED");

    const file =
    fileInput.files[0];

    if(!file){
        return;
    }

    const reader =
    new FileReader();

    reader.onload =
    function(e){

        console.log("FILE SENDING");
        
        socket.emit(
        "send_file",
        {
            username: username,
            filename: file.name,
            file: e.target.result
        });

    };

    reader.readAsDataURL(
    file
    );

});

socket.on(
"receive_file",
function(data){

    let messages =
    document.getElementById(
    "messages"
    );

    messages.innerHTML += `
        <div class="message">
            <strong>${data.username}</strong>
            <br>

            <a href="${data.file}"
               download="${data.filename}">
               📄 ${data.filename}
            </a>
        </div>
    `;

    messages.scrollTop =
    messages.scrollHeight;

    if(data.username !== username){

        notificationSound.play();

    }

});
