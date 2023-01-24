const socket = io();
const audio = new Audio('ting.mp3');
const audio2 = new Audio('joined.mp3');
const users = [];
const {
  username,
  room
} = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
console.log(room);
socket.emit('join-room', {
  username,
  room
});
$("#room-name")[0].innerText = room;


setInterval(() => {
  const message = $("form #input")[0].value;
  if (message) socket.emit("is-typing", username);
  else socket.emit("not-typing");
}, 50);


function append(user, message, time, position) {
  if (position === 'middle') {
    const new_element = `

      <div class = "message">
        <p class = "meta center-text"> ${message}  <span> ${time} </span></p>
      </div>`;
    $(".chat-messages").append($(new_element));
    audio2.play();
  } else if (position === 'left-top') {
    const new_element = `
      <div>
      <div class="bubble bubble-bottom-left">
      <p class="text"> ${message}</p>
      </div>
      <p class="meta">${user} <span>${time}</span></p>
      </div>`;
    $(".chat-messages").append($(new_element));
    audio.play();
  } else if (position === 'right-align') {
    const new_element = `
    <div>
    <div class="bubble bubble-bottom-left right-align">
    <p class="text"> ${message}</p>
    </div>
    <p class="meta-2 right-align"><span>${user} ${time}</span></p>
    </div>`;
    $(".chat-messages").append($(new_element));
    audio.play();
  } else if (position === 'image') {
    const new_element = `
    <div>
     <img class="image" src=${message}>
     <p class="meta">${user} <span>${time}</span></p>
    </div>`;
    $(".chat-messages").append($(new_element));
    audio.play();
  } else if (position === 'image right-align') {
    const new_element = `
    <div class="right-align">
     <img class="image" src=${message}>
     <p class="meta-2 right-align"><span>${user} ${time}</span></p>
    </div>`;
    $(".chat-messages").append($(new_element));
    audio.play();
  }
}
socket.on("image download", (file) => {
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  append(file.username, file.filename, time, file.fieldname);
})
socket.on('user-joined', ({
  name,
  room,
  all_users
}) => {
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  append(null, `${name} joined the chat`, time, 'middle');

});

socket.on('receive', data => {
  append(data.name, data.message, data.time, 'left-top');
});

socket.on('user-left', name => {
  let currentDate = new Date();
  let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
  append(null, `${name} left the chat`, time, 'middle');
});

socket.on('is-typing', username => {
  const para = $(".isTyping");
  if (para[0].innerText === "") {
    para[0].innerText = `${username} is typing...`;
  }
});
socket.on("update-users", roomusers => {
  const users = $("#users");
  users[0].innerHTML = roomusers.map(user => `<li>${user.username}</li>`).join("");

})
socket.on('not-typing', () => {
  const para = $(".isTyping");
  para[0].innerText = '';
});
$(".chat-form-container form").on('submit', function(e) {
  e.preventDefault();
  message = $("form #input")[0].value;

  if (message) {
    const input = $("#input");
    let currentDate = new Date();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    console.log(username);
    append(username, message, time, 'right-align');
    socket.emit('new-chat-message', {message,time});
    input.val("");
  }
});

var input = document.getElementById('myFile');
input.addEventListener('change', function() {
  var file = this.files[0];
  var formData = new FormData();
  formData.append('image', file);
  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload', true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      let currentDate = new Date();
      let time = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
      socket.emit("image upload", {
        username,
        filename: response.file.filename,
        fieldname: response.file.fieldname
      });
      append(username, response.file.filename, time, response.file.fieldname + " right-align");
      console.log(response.message);
    } else {
      console.error('Error uploading image.');
    }
  };
  xhr.send(formData);
});
