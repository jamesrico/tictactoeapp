
'use strict';

//limit messages to 20

var fb = new Firebase('https://chatitude.firebaseio.com/');

////////////////////////////////
// Login/Logout Functionality //
////////////////////////////////


  $('.register').click(function(event){
    event.preventDefault();
    var $form = $($(this).closest('form')),
        email = $form.find('[type="text"]').val(),
        pass = $form.find('[type="password"]').val();
    fb.createUser({
        email: email+'@chatitude.com',
        password: pass
      },
      function(err){
        if(!err){
              fb.authWithPassword({
                email: email+'@chatitude.com',
                password: pass
              },
                function(err, auth){
                    location.reload(true);
              }
            );
        } else {}
      }
    );

  });

  $('.loginButton').click(function(event){
    event.preventDefault();

    var $form = $($(this).closest('form')),
        email = $form.find('[type="text"]').val(),
        pass = $form.find('[type="password"]').val();

    fb.authWithPassword({
      email    : email+'@chatitude.com',
      password : pass
      }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        location.reload(true);
        console.log("Authenticated successfully with payload:", authData);
      }
    });
  });

  $('.logout').click(function(){
    fb.unauth();
    location.reload(true);
  });

  //if authenticated, go to app page

  fb.child('users').once('value', function(snap){
    if (!fb.getAuth()) {
      $('.login').toggleClass('hidden');
      $('.app').toggleClass('hidden');
    } else {}
  });

////////////////////////////////////////////////
//////////// App Functions ////////////////////
////////////////////////////////////////////////

$('.submitchatinput').click(function(evt){
	evt.preventDefault();
	var chatName = fb.getAuth().password.email;
	var chatNameIndex = chatName.indexOf('@');
	var chatNameShort = chatName.substr(0,chatNameIndex);
	var $chatInput = $('.chatinput').val();
	var messages = {'name': chatNameShort, 'message': $chatInput}
	//checkChatSize();
	fb.push(messages);
	var $form = $(this).closest('form');
	$form.find('input[type=text]').val('');
	location.reload(true);
});

function appendChatData(name, message) {
	var $messageContainer = $('<div class="messagecontainer"></div>');
	var $message = $('<h4 class="messageheader">'+name+' :</h4><p class="messagecontent">'+message+'</p>');
	$messageContainer.append($message);
	var $chatContainer = $('.chatcontainer');
	$chatContainer.append($messageContainer);
}

function checkChatSize(){
	fb.once('value', function (snap) {
		var data = snap.val();
		var $chatContainer = $('.chatcontainer');
		if(_.size(data)>=20){
			$chatContainer.empty();
			fb.set(null);
		};
	});
}


fb.limitToLast(20).on('child_added', function(snap){
	var data = snap.val();
	appendChatData(data.name,data.message);
})
