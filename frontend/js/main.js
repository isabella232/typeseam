$( document ).ready(function() {
  listenToEvents();
  getNewResponses();
});

var PDF_LOADING_STATES = [
  ["sending",      2000],
  ["generating", 13000],
  ["retrieving", 5000]
  ];

function listenToEvents(){
  $('.responses-header').on('click', '.load_new_responses', getNewResponses);
  $('.responses').on('click', '.pdf_cell', getPDF);
}

function getNewResponses(e){
  console.log("clicked for new responses");
  $('button.load_new_responses').addClass('loading');
  $.ajax({
    url: "/api/new_responses",
    success: handleNewResponses,
    timeout: 10000
  });
}

function stateTransitionChain(target, stateStack, index){
  if( index > 0){
    var prevStateClassName = stateStack[index - 1][0];
    console.log('removing previous state', prevStateClassName);
    target.removeClass(prevStateClassName);
  }
  if( index == stateStack.length ){
    return;
  }
  var stateClassName = stateStack[index][0];
  var delay = stateStack[index][1];
  target.addClass(stateClassName);
  setTimeout(function(){
    stateTransitionChain(target, stateStack, index + 1);
  }, delay)
}

function getPDF(e){
  console.log("clicked for pdf");
  var target = $(this);
  console.log(this.className);
  target.removeClass("untouched");
  target.addClass('loading');
  var responseId = target.parent('.response').attr('id');
  responseId = responseId.split("-")[1]
  stateTransitionChain($(this), PDF_LOADING_STATES, 0);
  $.ajax({
    url: "/api/get_pdf/" + responseId,
    success: handleNewPDF(responseId),
    timeout: 20000
  });
}

function handleNewResponses(html){
  console.log("received responses", html);
  $('.responses').prepend(html);
  $('button.load_new_responses').removeClass('loading');
}

function handleNewPDF(responseId){
  return function(html){
    console.log("pdf response!", html)
    $('#response-'+responseId).replaceWith(html);
  };
}