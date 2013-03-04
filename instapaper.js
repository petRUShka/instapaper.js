// PLUGIN_INFO//{{{
var PLUGIN_INFO =
<VimperatorPlugin>
  <name>Instapaper</name>
  <description>Add pages to instapaper for later reading</description>
  <author mail="petrushkin@yandex.ru" homepage="https://github.com/petRUShka/instapaper.js">petRUShka</author>
  <version>0.1</version>
  <license>GPL</license>
  <minVersion>1.2</minVersion>
  <maxVersion>2.1</maxVersion>
  <detail><![CDATA[

== Command ==
Usage:
  :rl
    Add current URL to your read later list at instapaper

  ]]></detail>
</VimperatorPlugin>;
//}}}
//

(
 function() {
 group.commands.add(['readlater', 'rl', 'instapaper'],
	 'Add current page to Instapaper',
	 function (args) {
		var manager = Components.classes["@mozilla.org/login-manager;1"].getService(Components.interfaces.nsILoginManager);
		var logins = manager.findLogins({},"http://www.instapaper.com","",null);
	 	var url = 'https://www.instapaper.com/api/add';
		var params = [];
		var username = logins[0].username || false;
		var password = logins[0].password;

		if ( username === false ) {
			dactyl.echo("Must set instapaper username and password. You should login on instapaper.com and then save login and password to Firefox password manager.");
			return;
		}
		params.push('username=' + encodeURIComponent(username));

		if ( password.length > 0 ) {
			params.push('password=' + encodeURIComponent(password));
		}

		if ( buffer.URL && buffer.URL.length > 0 && buffer.URL != 'about:blank' ) {
			params.push('url=' + encodeURIComponent(convert_url(buffer.URL)));
		} else {
			dactyl.echo("No URL found");
			return;
		}

		if ( buffer.title && buffer.title.length > 0 ) {
			params.push('title=' + encodeURIComponent(buffer.title));
		} else {
			params.push('auto-title=1');
		}

		try {
	 		var descr = buffer.CurrentWord();
	 		if ( descr && descr.length > 0 ) {
				params.push('selection=' + encodeURIComponent(descr));
	 		}
		} catch (e) {
			// Discard exception when there is no current word
		}

		var post_data = params.join('&');

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		xhr.onreadystatechange = function() {
			// When request is completed check state
			if ( xhr.readyState === 4 ) {
				var msg = '';
				switch (xhr.status) {
					case 201:
						msg = 'This URL has been successfully added to this Instapaper account.';
						break;
					case 400:
						msg = 'Bad request. Probably missing a required parameter, such as url.';
						break;
					case 403:
						msg = 'Invalid username or password.' + post_data;
						break;
					case 500:
						msg = 'The service encountered an error. Please try again later.';
						break;
					default:
						msg = 'Unknown status code returned (' + xhr.status + ')';
						break;
				}
				dactyl.echo(msg);
			}
		}

		xhr.send(post_data);
	 }
	 );

	function convert_url(buffer_url){ // {{{
		let url = buffer_url;

        // habrahabr.ru
		if(buffer_url.match(/:\/\/habrahabr\.ru/))
		  url = buffer_url.replace("habrahabr.ru", "m.habrahabr.ru").replace(/\.ru\/.+\/(\d+)/, ".ru/post/$1").replace(/#habracut$/, "");
		// livejournal.ru
		if(buffer_url.match(/:\/\/.+\.livejournal\.(com|ru)/) && !buffer_url.match(/:\/\/m\.livejournal\.(com|ru)/)){
		  // blog post
		  url = buffer_url.replace(/:\/\/(.+).livejournal.com\/(\d+).html/, "://m.livejournal.com/read/user/$1/$2");
		  // theme
		  url = url.replace(/www.livejournal.ru\/themes\/id\/(\d+)$/, "m.livejournal.com/themes/all/$1");
		}
		// www.trud.ru
		if(buffer_url.match(/:\/\/www.trud.ru/))
		  url = buffer_url.replace(/\.html$/, "/print");
		// lenta.ru
		if(buffer_url.match(/:\/\/lenta.ru/))
		  url = buffer_url.replace(/\/?$/, "/_Printed.htm");
	        // roem.ru
		if(buffer_url.match(/:\/\/roem.ru/) && !buffer_url.match("reom.ru/pda"))
		  url = buffer_url.replace(/\/(\?.*)?$/, "").replace(/\/\d{4}\/\d{2}\/\d{2}\/\D+(\d+)$/, "/pda/?element_id=$1");
		// www.guardian.co.uk
		if(buffer_url.match(/guardian.co.uk\//) && !buffer_url.match("print"))
		  url = buffer_url.replace(/$/, "/print");
		if(buffer_url.match("news.rambler.ru") && !buffer_url.match("m.rambler.ru"))
		  url = buffer_url.replace(/news.rambler.ru\/(\d+)\/.+/, "m.rambler.ru/news/head/$1/");
		// TODO: http://www.vedomosti.ru/politics/news/1502544/kurator_pokoleniya
		// TODO: ttp://www.vedomosti.ru/politics/print/2012/02/14/1502544
        return url;
	} // }}}

 })();
