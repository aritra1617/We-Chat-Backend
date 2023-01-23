users=[];
function userJoin(username,id,room) {
  users.push({username,id,room});
  return {username,id,room};
}
function getCurrentUser(id) {
  return users.find(user=>user.id===id);
}
function userLeave(id){
  const idx=users.findIndex(user=>user.id===id);
  if(idx!==-1){
    return users.splice(idx,1)[0];
  }
}
function getRoomusers(room) {
  return users.filter(user=>user.room===room);
}
module.exports={
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomusers
};
