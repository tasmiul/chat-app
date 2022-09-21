const users = [];

//join user to chat

function userJoin(id, username, room){
    //create an user
    const user = { id, username, room };
    //add to the array
    users.push(user);

    return user;
}

//get user by username
function getUserSocketID(username) {
    const index = users.findIndex(user => user.username === username);

    return users[index].id;  
}

//get the current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

//user leaves the chat

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

//get room users

function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

//export
module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    getUserSocketID
};