let changeUrl = document.getElementById('changeButton');
changeUrl.onclick= function ChangeServerString() {
  var url= document.getElementById("url").value;
  alert(url);
  localStorage.setItem("ServerUrl", url);
  document.getElementById("url").value="";
};