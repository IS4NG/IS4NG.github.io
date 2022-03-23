$('#search').click(function(){
  var 입력한값 = $('#search-input').val();
  window.location.replace('/search?value=' + 입력한값)
});
