'use strict';




var app = {
  tm: {},
  em: {},
  state: {
    lastkeytime: Number.MAX_VALUE
  }
}



app.display_results = function(body) {
  var items = body.items
  var divr = $('<div>')
  for(var i = 0; i < items.length; i++) {
    var item = items[i]
    //console.log(item)
    var result = app.tm.result.clone()

    result.find('div.rank').css('background-image','url(img/hex'+item.rank+'.png)')

    result.find('a.site')
      .text(item.name+' '+item.version)
      .attr('href',item.site)

    result.find('a.info')
      .attr('href','/info/'+item.name)

    var git = result.find('a.git')
    if( item.git ) {
      git.attr('href',item.git)
    }
    else {
      git.empty()
    }

    result.find('a.npm')
      .attr('href',"http://npmjs.org/package/"+item.name)

    result.find('p.desc').text(item.desc)

    /*
    var maintsdiv = result.find('div.maints').empty()
    for(var mI = 0; mI < item.maints.length; mI++) {
      //console.log(item.maints[mI])
      maintsdiv.append( $('<a>').attr('href','?q='+item.maints[mI]).text(item.maints[mI]) )
    }
     */

    result.find('a.similar').attr('href','?s='+item.name)

    if( item.modified && item.created ) {
      result.find('span.modified').text( moment(item.modified).fromNow() )
      result.find('span.created').text( moment(item.created).fromNow() )
    }
    else result.find('div.time').remove();

    if( item.git_star ) {
      result.find('span.git_star').text(item.git_star)
    }
    else {
      result.find('span.git_star_line').remove()
    }

    if( item.git_fork ) {
      result.find('span.git_fork').text(item.git_fork)
    }
    else {
      result.find('span.git_fork_line').remove()
    }

    divr.append(result)
  }
  app.em.results.empty().css('display','block').append(divr)
  app.em.welcome.hide()
}

app.query_last = ''

app.query = function(q) {
  if( _.isUndefined(q) || ''===q || app.query_last == q ) {
    return
  }

  app.state.lastkeytime = Number.MAX_VALUE
  var eq = encodeURIComponent(q)
  var href = document.location.href
  href = href.replace(/#.*$/,'')
  if( -1 == href.indexOf('?') ) {
    document.location.href = href+ '#q='+eq 
  }

  app.record_search(q)

  $.ajax({
    url: "/api/1.0/query?q="+eq,
    success: app.display_results
  })
}


app.record_search = function(term) {
  clearTimeout(app.record_search_interval)
  app.record_search_interval = setTimeout(function(){
    console.log(term)
    //_gaq.push(['_trackEvent', 'act', 'search', term]);
  },2222)
}


app.similar = function(name) {
  app.state.lastkeytime = Number.MAX_VALUE
  var ename = encodeURIComponent(name)
  $.ajax({
    url: "/api/similar?name="+ename,
    success: app.display_results
  })
}

app.route = function() {
  var up = parseUri(document.location.href)
  var qs = up.query || up.anchor

  var qp = {}
  _.each(qs.split('&'),function(kvs){var kv=kvs.split('=');qp[kv[0]]=kv[1]})

  if( qp.q ) {
    var q = decodeURIComponent(qp.q)
    app.em.term.val(q)
    app.query(q)
  }

  else if( qp.s ) {
    var name = decodeURIComponent(qp.s)
    app.similar(name)
  }
}

app.init = function() {
  app.em.results = $('#results')
  app.em.term    = $('#term').focus()
  app.em.welcome = $('#welcome')
  app.em.about   = $('a.about')

  app.tm.result = $('#result').clone().removeClass('tm')
  
  $('#query_form').submit(function(){
    var q = app.em.term.val()
    //console.log('q='+q)
    app.query(q)
    return false
  })

  $('#term').focus(function(){
    $('.result').removeClass('focused');
  })

  $(document).keydown(function(e){
    var result = $('.result.focused').first()
    var term = $('#term')
    var submit = $('#query_submit')

    if( e.keyCode == 13 && result.length ) { // return
      var href = result.find('.site').attr('href')
      if ( href ) {
        window.location = href
      }
      return
    }

    if ( e.which === 9 ) { // tab
      var shift = e.shiftKey

      if ( $(document.activeElement).attr('id') === 'term' ||
           ( $(document.activeElement).is(submit) && shift ) ) {
        return
      }

      e.preventDefault()

      if( !result.length && !shift ) {
        $('.result').first().addClass("focused")
        term.blur()
        submit.blur()
        return
      }

      result.removeClass('focused')

      var focusNext = shift ? result.prev('.result') : result.next('.result')

      if( focusNext.length ) {
        focusNext.addClass("focused");
        $.scrollTo(focusNext, 200, {offset: -400})
      } else if ( shift ) {
        submit.focus();
      } else {
        term.focus()
      }
    }
  });

  app.em.term.keyup(function(ev){
    if( 13 != ev.keyCode &&
        9 != ev.keyCode
      ) {
      app.state.lastkeytime = $.now()
    }
  })

  app.em.about.click(function(){
    app.em.welcome.show()
    app.em.results.css('display','none').empty()

  })

  setInterval(function(){
    if( 222 < $.now() - app.state.lastkeytime ) {
      var q = app.em.term.val()
      app.query(q)
    }
  },222)

  app.route()
}


$(app.init)




