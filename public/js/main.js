const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const userPeer = document.getElementById('user-name');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//can be accessed
const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);

  var peer = username;
  outputUserPeer(peer);
});

// Message from server
socket.on('message', (message) => {
  //console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  let mulusers = e.target.elements.mulusers.value;
  mulusers = mulusers.trim();

  socket.emit('chatMessage', { msg, mulusers });

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');

  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  if(message.username == 'server'){
    p.innerText += ' | ';
    p.style.color = 'red';
  }else{
    p.innerText += ' @ ';
  }
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);

  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  if(message.username == 'server'){
    para.style.color = 'red';
    para.style.fontFamily = 'Courier New';
  }
  div.appendChild(para);

  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});

//Event for Image sending
sendImage.addEventListener('change', () => {
  var filesSelected = document.getElementById("sendImage").files;

  var userdatas = document.getElementById('mulusers');
  var mulusers = userdatas.value;
  mulusers = mulusers.trim();
  
  if (filesSelected.length > 0) {
    var fileToLoad = filesSelected[0];

    var fileReader = new FileReader();
       
    fileReader.onload = function(fileLoadedEvent) {
      //base64 
      var srcData = fileLoadedEvent.target.result; 

      var newImage = document.createElement('img');
      newImage.src = srcData;
      
      let imgData = {
        message: srcData,
        uname: username,
      }
      //display the image for the sender
      displayImage(srcData,imgData.uname);
      
      socket.emit('image', { imgData, mulusers });
    
    }
    fileReader.readAsDataURL(fileToLoad);
  }
});

//output image to DOM
function displayImage(srcData,usernameData) {
  const div = document.createElement('div');

  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = "";
  p.innerHTML += `<span>${usernameData}</span>`;
  p.style.color = 'green';
  p.style.fontFamily = 'Lucida Handwriting';
  div.appendChild(p);
  document.querySelector('.chat-messages').append(div);

  const div2 = document.createElement('div');
  var newImage = document.createElement('img');
  newImage.src = srcData;
  div2.append(newImage);

  //div.append(newImage);
  document.querySelector('.chat-messages').append(div2);
  
};

//listen for Image and display
socket.on("image", (imgData) => {
  
  displayImage(imgData.message,imgData.uname);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Display the username
function outputUserPeer(username) {
  userPeer.innerText = username;
}c