
'use strict';

//limit messages to 20

var fb = new Firebase('https://tictactoenssc8.firebaseio.com/'),
    fbusers = new Firebase('https://tictactoenssc8.firebaseio.com/users'),
    fbgames = new Firebase('https://tictactoenssc8.firebaseio.com/games');

////////////////////////////////
// Login/Logout Functionality //
////////////////////////////////


  $('.register').click(function(event){
    event.preventDefault();
    var $form = $($(this).closest('form')),
        email = $form.find('[type="text"]').val(),
        pass = $form.find('[type="password"]').val(),
        user = {'user': email};
    fb.createUser({
        email: email+'@tictactoe.com',
        password: pass
      },
      function(err){
        if(!err){
              fb.authWithPassword({
                email: email+'@tictactoe.com',
                password: pass
              },
                function(err, auth){
                    pushLoginInfo(user);
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
        pass = $form.find('[type="password"]').val(),
        user = {'user': email};

    fb.authWithPassword({
      email    : email+'@tictactoe.com',
      password : pass
      }, function(error, authData) {
      if (error) {
        console.log("Login Failed!", error);
      } else {
        pushLoginInfo(user);
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

  //fb.child('users').once('value', function(snap){
    //if (fb.getAuth()) {
      //$('.login').toggleClass('hidden');
      //$('.gameSelect').toggleClass('hidden');
    //} else {}
  //});

  function pushLoginInfo(user){
    fbusers.push(user);
  }
  ////////creat room functionality
  //
  /////push game data to fb
  function createGame(user){
    var newGameData = {'user1': user, 'user2': '', 'gameboard': [[0,0,0],[0,0,0],[0,0,0]], 'gameover': false};
    fbgames.push(newGameData);
    return newGameData;
  }
  ///////append data to list
  //
  //grab the entire list of games
  function getExistingGames(){
    fbgames.on('child_added', function (snap) {
      var game = snap.val();
      addGameToList(game);

    });
  }

  getExistingGames();

  function editGamePlayers(gamecontainer){
  var gameowner = $(gamecontainer).find('li').text(),
      numberPlayers = $(gamecontainer).find('p').text();
  if (numberPlayers === '1/2'){
    $(gamecontainer).find('p').text('2/2');
    var query = fbgames.orderByChild("user1").equalTo(gameowner).limitToFirst(1);
    console.log(query);
    var refQuery = query.ref();
    console.log(refQuery);
  }
  else {}
  }
    
  $('.gameListContainer').on('click', 'li', function (event){
    editGamePlayers(event.target);
    console.log(event.target);
  })

  function addGameToList(game){
    var $li = $('<li class="'+game.user1+'game">'+game.user1+'<p class="'+game.user1+'numberofplayers">1/2</li>');
    $('.gameListContainer').append($li);

  }
 $('.addgamebutton').on('click', function(event){
    event.preventDefault();
    var userRaw = fb.getAuth().password.email,
        userIndex = userRaw.indexOf('@'),
        userShort = userRaw.substr(0,userIndex);

    createGame(userShort);
    var gameData = createGame(userShort);
    addGameToList(gameData);
 })
////////////////////////////////////////////////
//////////// App Functions ////////////////////
////////////////////////////////////////////////

