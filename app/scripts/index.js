
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

  //if authenticated, go to game select page

  fb.child('users').once('value', function(snap){
    if (fb.getAuth()) {
      $('.login').toggleClass('hidden');
      $('.gameSelect').toggleClass('hidden');
    } else {}
  });

///////////////////////////////////////////
//////// Game List Page Functions /////////
///////////////////////////////////////////

var currentGame,userRaw,userIndex,userShort;

//if user authenticated, find username
if(fb.getAuth()){
  userRaw = fb.getAuth().password.email;
  userIndex = userRaw.indexOf('@');
  userShort = userRaw.substr(0,userIndex);
} else {}

  /////push game data to fb
  function createGame(user){
    var newGameData = {'user1': user, 'user2': '', 'gameboard': [0, 0, 0, 0, 0, 0, 0, 0, 0], 'gameover': false, 'symbol': 'X'};
    fbgames.push(newGameData);
    findGameId();
    return newGameData;
  }

  //find game id
  function findGameId(){
    var foundGame = [];
    fbgames.once('value', function(n){
      var games = n.val(),
          userRaw = fb.getAuth().password.email,
          userIndex = userRaw.indexOf('@'),
          userShort = userRaw.substr(0,userIndex);
      _.forEach(games, function(m, key){
        if(m.user1===userShort || m.user2 === userShort){
          currentGame = key;
          foundGame.push(key);
        } else {}
      });
    });
    return foundGame[0];
  }

  //add game to list when one is added in fb
  fbgames.on('child_added', function (snap) {
    var game = snap.val();
    addGameToList(game);
  });

  //append game data to ul
  function addGameToList(game){
    function num() {
      if(game.user2 !== ''){
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
    //check to see if user already has a game
    if ($('.gameListContainer').find('.'+userShort+'game').length === 0 && $('.gameListContainer').find('.'+userShort+'numberofplayers').text() === '1/2'){
      //if they don't, create a game and take them to a blank game
      createGame(userShort);
      $('.gameSelect').toggleClass('hidden');
      $('.app').toggleClass('hidden');
    } else {alert("Game Already Exists")}
  });

  function editGamePlayers(gamecontainer){
    var gameowner = $(gamecontainer).find('span').text(),
      numberPlayers = $(gamecontainer).find('p').text(),
      userRaw = fb.getAuth().password.email,
      userIndex = userRaw.indexOf('@'),
      userShort = userRaw.substr(0,userIndex);
    var user2game;
    fbgames.orderByChild('user2').equalTo(userShort).once('value', function(res){user2game = res.val()})
    if (numberPlayers === '1/2' && userShort !== gameowner && !user2game){
      fbgames.once('value', function(n){
        var games = n.val();
        _.forEach(games, function(n, key){
          if(n.user1===gameowner){
            var userRaw = fb.getAuth().password.email,
              userIndex = userRaw.indexOf('@'),
              userShort = userRaw.substr(0,userIndex);
            var fbFindGame = new Firebase('https://tictactoenssc8.firebaseio.com/games/'+key+'/')
            fbFindGame.child('user2').set(userShort);
          } else { alert('Invalid Game!')}
        });
      });
      $('.gameSelect').toggleClass('hidden');
      $('.app').toggleClass('hidden');
      $(gamecontainer).find('p').text('2/2')
    } else {}
  };

  $('.gameListContainer').on('click', 'li', function (event){
    editGamePlayers($(event.target).closest('li'));
  })


////////////////////////////////////////////////
//////////// App Functions ////////////////////
////////////////////////////////////////////////

  //append X or O function
  function appendSymbol(div, move){
    var $symbol = $('<p>'+move+'</p>');
    $(div).append($symbol);
  }

  //update game if child is added
  function updateGameboard (){
    var fbspecificgameUrl = 'https://tictactoenssc8.firebaseio.com/games/'+findGameId()+'/';
    var fbspecificgame = new Firebase(fbspecificgameUrl);
        fbspecificgame.on('child_added', function (snap) {
          var gameboard = snap.val().gameboard;
          appendGameboard(gameboard);
        });
  }

  // append gameboard to game
  function appendGameboard(gameboard){
    var i;
    for(i=0;i<gameboard.length-1;i++){
      var divs = $('.cell');
      var thisDiv = divs[i];
      if(gameboard[i] === 1){
        appendSymbol(thisDiv, 'X')
      } else if(gameboard[i] === 2){
        appendSymbol(thisDiv, 'O')
      } else {}
    }
  }

  //When chld added, update game board
  fbgames.on('child_added', function (snap) {
      if(findGameId() !== null){
        var key = findGameId();
        updateGameboard();
      } else {console.log(findGameId())}
  });


  var lastsymbol = 'X';

  // When game cell is clicked
  $('.tictactoecontainer').on('click', 'div.cell', function (event){
    if (($(event.target).find('p')).length === 1){
    }
    else {
      console.log(findGameId());
      var fbFindGame = new Firebase('https://tictactoenssc8.firebaseio.com/games/'+findGameId()+'/')
      //append the symbol
        //get last symbol
        var symbol;
        fbFindGame.once('value', function(res){
          symbol = res.symbol;
          console.log(res.symbol);
        });
      appendSymbol(event.target, lastsymbol)
      //click variables
      var gameBoard = createGameboardData();
      var $containerchildren = $('.tictactoecontainer').children();
      //check to see if game is over
      _.forEach($containerchildren, function(m){
        var index = $containerchildren.index(m);
        gameOver(gameBoard, index);
      });
      //push gameboard data to fb
        fbFindGame.child('gameboard').set(createGameboardData());
        updateGameboard();
      //push symbol data to fb
        if(symbol === 'X'){symbol = 'O'} else {symbol = 'X'}
        fbFindGame.child('symbol').set(symbol);
      //change local symbol
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
    } else {}
  }




