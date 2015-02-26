
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
                    fbusers.push(user);
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
        fbusers.push(user);
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

///////////////////////////////////////////
//////// Room List Page Functions /////////
///////////////////////////////////////////

  /////push game data to fb
  function createGame(user){
    var newGameData = {'user1': user, 'user2': '', 'gameboard': [[0,0,0],[0,0,0],[0,0,0]], 'gameover': false};
    fbgames.push(newGameData);
    return newGameData;
  }

  //grab game when one is added
  fbgames.on('child_added', function (snap) {
    var game = snap.val();
    addGameToList(game);
  });

  //append game data to ul
  function addGameToList(game){
    function num() {
      if(game.user2 !== ''){
        console.log(game.user2)
        return 2
      } else {return 1}
    }
    var $li = $('<li class="'+game.user1+'game"><span class="'+game.user1+'user">'+game.user1+'</span><p class="'+game.user1+'numberofplayers">'+num()+'/2</li>');
    $('.gameListContainer').append($li);
  }

  // create game data on button click
  $('.addgamebutton').on('click', function(event){
    event.preventDefault();
    var userRaw = fb.getAuth().password.email,
        userIndex = userRaw.indexOf('@'),
        userShort = userRaw.substr(0,userIndex);
    createGame(userShort);
  });

  function editGamePlayers(gamecontainer){
    var gameowner = $(gamecontainer).find('span').text(),
      numberPlayers = $(gamecontainer).find('p').text(),
      userRaw = fb.getAuth().password.email,
      userIndex = userRaw.indexOf('@'),
      userShort = userRaw.substr(0,userIndex);
    if (numberPlayers === '1/2' && userShort !== gameowner){
      $(gamecontainer).find('p').text('2/2');
      fbgames.once('value', function(n){
        var games = n.val();
        _.forEach(games, function(n, key){
          console.log(gameowner);
          console.log(n.user1);
          if(n.user1===gameowner){
            var userRaw = fb.getAuth().password.email,
              userIndex = userRaw.indexOf('@'),
              userShort = userRaw.substr(0,userIndex);
            var fbFindGame = new Firebase('https://tictactoenssc8.firebaseio.com/games/'+key+'/')
            fbFindGame.child('user2').set(userShort);
          } else { alert('Invalid Game!')}
        });
      });
    } else {}
  };


  $('.gameListContainer').on('click', 'li', function (event){
    editGamePlayers($(event.target).closest('li'));
  })


////////////////////////////////////////////////
//////////// App Functions ////////////////////
////////////////////////////////////////////////
//////create moves and if else statments
function appendSymbol(div, move){
  var $symbol = $('<p>'+move+'</p>');
  $(div).append($symbol);
}

  var lastsymbol = 'X';

  $('.tictactoecontainer').on('click', 'div.cell', function (event){
    if (($(event.target).find('p')).length === 1){
    }
    else {
      appendSymbol(event.target, lastsymbol)
      var gameBoard = createGameboardData();
      var $containerchildren = $('.tictactoecontainer').children();
      _.forEach($containerchildren, function(m){
        var index = $containerchildren.index(m);
        console.log(index);
        gameOver(gameBoard, index);
      });

      if (lastsymbol === 'X'){
        lastsymbol = '0'
      }
      else {
        lastsymbol = 'X'
      }
    }
  })

  // create game board array
  function createGameboardData(){
    var gameBoard = [];
    var $containerchildren = $('.tictactoecontainer').children();
    var $container = $('.tictactoecontainer');

    _.forEach($containerchildren, function(n){
        if($($(n).find('p')).length === 0) {
          gameBoard.push(0)
        } else if($(n).find('p').text() === 'X') {
          gameBoard.push(1)
        } else { gameBoard.push(2)}
    });

    return gameBoard;
  }

  // determines if the game is over
  function gameOver(board, i){
    //if rows match
    if (board[i] !== 0 && board[i] === board[i + 1] && board[i] === board[i+2] && (i === 0 || i === 3 || i === 6)){
        var symbol = lastsymbol;
        alert('Game Over, "'+symbol+'" Wins!');
        $('.cell').empty();
    //if columns match
    } else if
      (board[i] !== 0 && board[i] === board[i + 3] && board[i] === board[i+6] && (i === 0 || i === 1 || i === 2)){
        var symbol = lastsymbol;
        alert('Game Over, "'+symbol+'" Wins!');
        $('.cell').empty();
    //if first diagonal matches
    } else if
      (board[i] !== 0 && board[i] === board[i + 4] && board[i] === board[i+8] && i === 0){
        var symbol = lastsymbol;
        alert('Game Over, "'+symbol+'" Wins!');
        $('.cell').empty();
    //if second diagonal matches
    } else if
      (board[i] !== 0 && board[i] === board[i + 2] && board[i] === board[i+4] && i === 2){
        var symbol = lastsymbol;
        alert('Game Over, "'+symbol+'" Wins!');
        $('.cell').empty();
    //if board is full
    } else if(($.inArray(0,board)) === -1 && $('.tictactoecontainer').has('p').length !== 0){
      alert('Game Over, Draw!');
      $('.cell').empty();
      console.log($('.tictactoecontainer').has('p'))
    } else {}
  }




